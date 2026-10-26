#Requires -Version 5.1
<#
.SYNOPSIS
    Installiert und konfiguriert einen Python-Webserver unter Windows 11:
    - liefert nur .json und .anl3 Dateien aus
    - optional (-ActivateCommands): nimmt per POST auf /send-command Befehle fuer EEP an und haengt sie als ANSI an
      <SitePath>\<ExchangePath>\<ExchangeFile> an. Absender: die Bridge (erlaubte Origins) bzw. curl von diesem Rechner (ohne Origin)
    - optional (-ProxyGitHub): alle Anfragen, die keine lokale .json/.anl3-Datei sind (z.B. /EEP_Gleisplan oder
      /EEP_convert_anl3_file/EEP_Gleisplan.html), werden per GET/HEAD von der ersten GitHub-Origin unter -ProxyPath geholt
      und ausgeliefert. Bridge, Gleisplan und Daten haben dann dieselbe Origin (kein CORS, kein Mixed Content, keine PNA-Rueckfrage)
    - CORS fuer localhost, lokales Netzwerk und GitHub-Origin
    - Access-Control-Allow-Private-Network: true, nur wenn der Browser es per Preflight anfragt
    - optional (-AllowNullOrigin): CORS auch fuer die Origin "null" (Seite wird aus einer lokalen Datei file:// geoeffnet)
    - HTTPS (Zertifikat mit sprechendem Namen, HSTS, TLS 1.2 als Minimum); HTTP-Port mit Umleitung auf HTTPS nur bei -HttpPort > 0
    - WebSocket (wss://) auf derselben URL wie die Datei: Der Server ueberwacht die Datei und sendet jede Aenderung,
      sodass die Bridge nicht mehr pollen muss (Origin-Pruefung wie bei CORS)
    - Vorpruefungen (Ports, Parameter, Python, Internet) VOR jeder Aenderung
    - Abschlusstests (Ports, CORS, Dateityp-Sperre, Umleitung) mit einem kurzzeitig gestarteten Testserver
    - kein Autostart: der Server wird bei Bedarf mit einem Python-Kommando gestartet
    Fremde Programme und Websites werden nie veraendert oder beendet.
    Der Server selbst (server.py) nutzt nur die Python-Standardbibliothek.
    Bei erneutem Start wird die bestehende Installation auf die aktuellen
    Angaben aktualisiert.
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpPort 3000 -HttpsPort 3001
    (zusaetzlich HTTP-Port 3000 mit Umleitung auf HTTPS)
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -AllowNullOrigin
		(erlaube Clients, die mit file:// lokal in einem Browser aufgerufen werden)
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -GitHubOrigins "https://meinname.github.io" -OpenFirewall
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -ActivateCommands -AllowNullOrigin
    (Befehle der Bridge erlauben, auch wenn die Bridge als lokale Datei file:// gestartet wird)
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -ProxyGitHub
    (Bridge und Gleisplan werden von GitHub Pages geholt und vom lokalen Server ausgeliefert:
     https://localhost:3001/EEP_Export_Bridge?url=/eep_export.json)
.EXAMPLE
    .\Install-Python-web-server.ps1 -Uninstall
.NOTES
    Als Administrator in Windows PowerShell 5.1 ausfuehren (nicht PowerShell 7).
    Meldung "nicht digital signiert": Nach dem Download des Skriptes ist die Datei in Windows 11
    als "aus dem Internet" markiert. Die Ausfuehrungsrichtlinie von Windows verlangt dann eine
    Signatur oder eine explizite Freischaltung mit folgendem Befehl:
    Unblock-File .\Install-Python-web-server.ps1
    Python 3.9+ wird bei Bedarf per winget installiert (fuer alle Benutzer).
    Fuer winget und pip wird eine Internetverbindung benoetigt.
    Der EEP-Server und ein anderer Webserver koennen nicht gleichzeitig dieselben Ports nutzen.
    Standard ist -HttpPort 0: Es wird nur der HTTPS-Port geoeffnet, es gibt keinen HTTP-Port und keine Umleitung.
    Die Option -AllowNullOrigin wird nur benoetigt, wenn das Bridge-Programm lokal auf einem Rechner gestartet wird.
    Der Browser sendet dabei die Origin "null" auch bei file://-Seiten, aber ebenso
    bei Seiten in Sandbox-Frames. Die Option gibt die Daten deshalb fuer jede solche Seite frei.
    WebSocket: Die Bridge liest die Datei zuerst per HTTPS und oeffnet dann wss://<Host>:<Port>/<Datei>.json.
    Der Server sendet die komplette Datei sofort und danach nach jeder Aenderung (nur gueltiges JSON).
    Python kennt in der Standardbibliothek keine Datei-Benachrichtigung: Ein Thread prueft die Datei 10 mal pro
    Sekunde (os.stat, sehr billig) und nur solange mindestens ein WebSocket-Client verbunden ist.
    Befehle fuer EEP (-ActivateCommands, beim Start des Servers auch --activateCommands):
    Der Server nimmt per POST auf /send-command Befehle an (ein Befehl je Zeile, hoechstens 64 KB) und haengt sie als ANSI
    (Windows-1252, so liest EEP) an <SitePath>\<ExchangePath>\<ExchangeFile> an. Ohne Aktivierung antwortet der Server auf POST mit 405.
    Absender ist die Bridge (Seite von GitHub, aus dem lokalen Netz oder aus einer lokalen Datei file://, letzteres nur mit -AllowNullOrigin):
    Die Origin muss erlaubt sein, sonst 403. Anfragen ohne Origin (z.B. curl) werden nur von diesem Rechner angenommen.
    Auf dem HTTP-Port (-HttpPort) werden nie Befehle angenommen. Beispiele von diesem Rechner:
      curl.exe --data-binary "Befehl" https://localhost:3001/send-command
      curl.exe --data-binary "@befehle.txt" https://localhost:3001/send-command
    Es gibt keinen Autostart. Der Server wird mit diesem Python-Kommando gestartet:
    & "<InstallPath>\venv\Scripts\python.exe" "<InstallPath>\server.py"
#>
[CmdletBinding()]
param(
    [string]$SiteName          = "EEP Export", # Name der WebSite
    [string]$SitePath          = "SITEPATH",   # Verzeichnis, das die Daten der WebSite enthaelt, hier also das Installationsverzeichnis von EEP
    [string]$InstallPath       = (Join-Path $env:ProgramData "EEP-Python-Server"),  # server.py, venv, Zertifikat, Log
    [string]$ExchangePath      = "exchange",   # relatives Verzeichnis, in dem die Kommando-Datei liegt
    [string]$ExchangeFile      = "commands-to-eep.txt",   # Name der Kommando-Datei 
    [string]$ProxyPath         = "/EEP_convert_anl3_file", # Pfad der Seiten auf der GitHub-Origin (nur mit -ProxyGitHub)
    [int]$HttpPort             = 0,      # 0 = kein HTTP-Port (nur HTTPS)
    [int]$HttpsPort            = 443,
    [string[]]$GitHubOrigins   = @("https://frankbuchholz.github.io"), # "https://USERNAME.github.io"
    [string]$PfxPath,                 # optional: eigenes Zertifikat statt selbstsigniert
    [securestring]$PfxPassword,
    [switch]$AllowNullOrigin,         # CORS auch fuer Origin "null" (Seite aus lokaler Datei file://)
    [switch]$ActivateCommands,        # POST /send-command erlauben (Befehle der Bridge an EEP)
    [switch]$ProxyGitHub,             # Seiten (Bridge, Gleisplan) von der GitHub-Origin holen und lokal ausliefern
    [switch]$OpenFirewall,
    [switch]$Uninstall                # Firewall-Regel und InstallPath entfernen
)

# ---------------------------------------------------------------- Administrator-Pruefung (ersetzt #Requires -RunAsAdministrator)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "FEHLER: Das Skript muss in einer PowerShell mit Administratorrechten gestartet werden." -ForegroundColor Red
    Write-Host "        Windows PowerShell mit Rechtsklick -> 'Als Administrator ausfuehren' oeffnen und das Skript erneut starten."
    exit 1
}

# ---------------------------------------------------------------- Hilfe bei Aufruf ohne Parameter
if ($PSBoundParameters.Count -eq 0) {
    $self = $MyInvocation.MyCommand.Name
    Write-Host "Wichtigste Optionen:" -ForegroundColor Cyan
    Write-Host "  -SitePath  <Pfad>  Verzeichnis der Website, hier das Installationsverzeichnis von EEP"
    Write-Host "                     (z.B. C:\EEP17)                      [aktuell: $SitePath]"
    Write-Host "  -HttpPort  <Port>  optional: Port fuer HTTP, wird auf HTTPS umgeleitet (0 = kein HTTP)  [Standard: $HttpPort]"
    Write-Host "  -HttpsPort <Port>  Port fuer HTTPS                             [Standard: $HttpsPort]"
    Write-Host "  -AllowNullOrigin   CORS auch fuer Origin 'null' (Seite wird aus einer lokalen Datei geoeffnet)"
    Write-Host "  -ActivateCommands  POST /send-command erlauben (Befehle der Bridge bzw. curl von diesem Rechner an EEP)"
    Write-Host "  -ProxyGitHub       Bridge und Gleisplan von GitHub Pages holen und selbst ausliefern (gleiche Origin wie die Daten)"
    Write-Host ""
    Write-Host "Beispiele:" -ForegroundColor Cyan
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001"
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001 -AllowNullOrigin"
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001 -ActivateCommands"
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001 -ActivateCommands -ProxyGitHub"
    Write-Host "  .\$self -Uninstall"
    Write-Host ""
    Write-Host "Alle Optionen: Get-Help .\$self -Detailed"
    if ($SitePath -match "SITEPATH") {
        Write-Host "`nHinweis: -SitePath ist noch nicht gesetzt. Es wurde nichts veraendert." -ForegroundColor Yellow
        exit 0
    }
    Write-Host "`nOhne Angaben werden die Standardwerte verwendet." -ForegroundColor Yellow
    Write-Host ""
}

$ErrorActionPreference = "Stop"
# Schraegstriche vereinheitlichen (C:/EEP17 wird zu C:\EEP17)
$SitePath = $SitePath.Replace("/", "\")
$InstallPath = $InstallPath.Replace("/", "\")
$ExchangePath = $ExchangePath.Replace("/", "\")
$ProxyPath = "/" + $ProxyPath.Replace("\", "/").Trim().Trim("/")
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$script:failed = 0

$fwName   = "Python $SiteName"
$serverPy = Join-Path $InstallPath "server.py"
$venvPy   = Join-Path $InstallPath "venv\Scripts\python.exe"
$certDir  = Join-Path $InstallPath "certs"
$logDir   = Join-Path $InstallPath "logs"
$logFile  = Join-Path $logDir "server.log"

# ---------------------------------------------------------------- Hilfsfunktionen
function Write-Check([bool]$Ok, [string]$Text) {
    if ($Ok) { Write-Host "   [OK]      $Text" -ForegroundColor Green }
    else     { Write-Host "   [FEHLER]  $Text" -ForegroundColor Red; $script:failed++ }
}

# Startet ein natives Programm; stderr-Ausgaben fuehren nicht zum Abbruch
function Invoke-Native([string]$Exe, [string[]]$Arguments) {
    $old = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try   { $out = & $Exe @Arguments 2>&1 | ForEach-Object { "$_" } }
    finally { $ErrorActionPreference = $old }
    [pscustomobject]@{ ExitCode = $LASTEXITCODE; Output = (($out | Out-String).Trim()) }
}

function Write-Utf8NoBom([string]$Path, [string]$Text) {
    [IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding $false))
}

# Sprechender Name des Zertifikats (CN) statt "localhost", z.B. "EEP Export Node.js (MEIN-PC)". Der CN ist auf 64 Zeichen begrenzt.
function Get-CertCommonName([string]$Variant) {
    $n = ("$SiteName $Variant ($env:COMPUTERNAME)") -replace '[,+=;"<>\\#]', '_'
    if ($n.Length -gt 64) { $n = $n.Substring(0, 64) }
    return $n
}

# Name (CN) eines vorhandenen Zertifikats
function Get-CertCN($Cert) {
    return $Cert.GetNameInfo([System.Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false)
}

# Zeigt die wichtigsten Daten eines Zertifikats an (neu erzeugt oder wiederverwendet)
function Show-CertInfo($Cert, [string]$Title) {
    $days = [int][math]::Floor(($Cert.NotAfter - (Get-Date)).TotalDays)
    $key  = "$($Cert.PublicKey.Oid.FriendlyName)"
    try { $key += " " + $Cert.PublicKey.Key.KeySize + " Bit" } catch { }
    $ext  = $Cert.Extensions | Where-Object { $_.Oid.Value -eq "2.5.29.17" } | Select-Object -First 1
    $san  = @()
    if ($ext) { $san = @($ext.Format($true) -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }) }
    $trusted = Test-Path "Cert:\LocalMachine\Root\$($Cert.Thumbprint)"
    $row = { param($k, $v) Write-Host ("      {0,-20}{1}" -f ($k + ":"), $v) }
    Write-Host "   $Title" -ForegroundColor Cyan
    & $row "Name (CN)" (Get-CertCN $Cert)
    if ($Cert.FriendlyName) { & $row "Anzeigename" $Cert.FriendlyName }
    $typ = if ($Cert.Subject -eq $Cert.Issuer) { "selbstsigniert" } else { "ausgestellt von " + $Cert.Issuer }
    & $row "Typ" $typ
    & $row "Gueltig ab" $Cert.NotBefore.ToString("yyyy-MM-dd HH:mm")
    & $row "Gueltig bis" ("{0} (noch {1} Tage)" -f $Cert.NotAfter.ToString("yyyy-MM-dd HH:mm"), $days)
    if ($san.Count -gt 0) {
        & $row "Gueltig fuer" $san[0]
        foreach ($s in ($san | Select-Object -Skip 1)) { & $row " " $s }
    }
    & $row "Schluessel" $key
    & $row "Signatur" $Cert.SignatureAlgorithm.FriendlyName
    & $row "Seriennummer" $Cert.SerialNumber
    & $row "Fingerabdruck" $Cert.Thumbprint
    $tr = if ($trusted) { "ja (Stammzertifizierungsstellen dieses PCs)" } else { "nein (auf diesem PC nicht als Stammzertifikat eingetragen)" }
    & $row "Vertrauenswuerdig" $tr
    if ($days -lt 0)      { Write-Host "      ACHTUNG: Das Zertifikat ist abgelaufen." -ForegroundColor Red }
    elseif ($days -lt 30) { Write-Host "      Hinweis: Das Zertifikat laeuft in weniger als 30 Tagen ab." -ForegroundColor Yellow }
}

# Liefert Status und Header, auch bei 3xx/4xx; folgt keiner Umleitung
function Invoke-Probe([string]$Uri, [hashtable]$Headers = @{}, [string]$Method = "GET") {
    $resp = $null
    $err  = ""
    try {
        $req = [System.Net.HttpWebRequest]::Create($Uri)
        $req.Method = $Method
        $req.AllowAutoRedirect = $false
        $req.KeepAlive = $false
        $req.Timeout = 15000
        if ($Method -eq "POST") { $req.ContentLength = 0 }
        foreach ($k in $Headers.Keys) { $req.Headers.Add($k, $Headers[$k]) }
        $resp = $req.GetResponse()
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response      # 4xx/5xx liefern eine Antwort
        $err  = $_.Exception.Message
    } catch {
        $err  = $_.Exception.Message
    }
    if ($resp) {
        $h = @{}
        foreach ($k in $resp.Headers.AllKeys) { $h[$k] = $resp.Headers[$k] }
        $status = [int]$resp.StatusCode
        $resp.Close()
        return [pscustomobject]@{ Status = $status; Headers = $h; Error = "" }
    }
    return [pscustomobject]@{ Status = 0; Headers = @{}; Error = $err }
}

# Wie Invoke-Probe, sendet aber einen Body (UTF-8)
function Invoke-Post([string]$Uri, [string]$Body, [hashtable]$Headers = @{}) {
    $resp = $null
    $err  = ""
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($Body)
        $req = [System.Net.HttpWebRequest]::Create($Uri)
        $req.Method = "POST"
        $req.AllowAutoRedirect = $false
        $req.KeepAlive = $false
        $req.Timeout = 15000
        $req.ServicePoint.Expect100Continue = $false
        $req.ContentType = "text/plain; charset=utf-8"
        $req.ContentLength = $bytes.Length
        foreach ($k in $Headers.Keys) { $req.Headers.Add($k, $Headers[$k]) }
        $s = $req.GetRequestStream()
        $s.Write($bytes, 0, $bytes.Length)
        $s.Close()
        $resp = $req.GetResponse()
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        $err  = $_.Exception.Message
    } catch {
        $err  = $_.Exception.Message
    }
    if ($resp) {
        $h = @{}
        foreach ($k in $resp.Headers.AllKeys) { $h[$k] = $resp.Headers[$k] }
        $status = [int]$resp.StatusCode
        $resp.Close()
        return [pscustomobject]@{ Status = $status; Headers = $h; Error = "" }
    }
    return [pscustomobject]@{ Status = 0; Headers = @{}; Error = $err }
}

# Python 3.9+ fuer alle Benutzer (C:\Program Files\Python3xx). Der Dienstkonto-Zugriff
# auf benutzerbezogene Installationen und den Store-Alias waere nicht gegeben.
function Find-Python {
    $candidates = Get-ChildItem "$env:ProgramFiles\Python3*\python.exe" -ErrorAction SilentlyContinue |
                  Sort-Object { [int](($_.Directory.Name) -replace '\D','') } -Descending
    foreach ($c in $candidates) {
        $r = Invoke-Native $c.FullName @("-c", "import sys;print('%d.%d' % sys.version_info[:2])")
        if ($r.ExitCode -eq 0 -and $r.Output -match '^\d+\.\d+$' -and [version]$r.Output -ge [version]"3.9") {
            return $c.FullName
        }
    }
    return $null
}

# Prozesse dieses Servers (venv-Starter und eigentlicher Interpreter)
function Get-OwnProcesses {
    Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='pythonw.exe'" |
        Where-Object { $_.CommandLine -and $_.CommandLine.Contains($serverPy) }
}

function Stop-OwnServer {
    foreach ($p in @(Get-OwnProcesses)) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }
}

# ---------------------------------------------------------------- Deinstallation
if ($Uninstall) {
    Write-Host "Deinstallation ..." -ForegroundColor Cyan
    if ($InstallPath -notmatch '^[A-Za-z]:\\.+') { Write-Host "   [FEHLER]  InstallPath ungueltig." -ForegroundColor Red; exit 1 }
    Stop-OwnServer
    Remove-NetFirewallRule -DisplayName $fwName -ErrorAction SilentlyContinue
    if (Test-Path $serverPy) { Remove-Item $InstallPath -Recurse -Force }
    elseif (Test-Path $InstallPath) { Write-Warning "$InstallPath enthaelt keine server.py und wurde nicht geloescht." }
    Write-Host "Entfernt: laufender Server, Firewall-Regel, $InstallPath." -ForegroundColor Green
    Write-Host "Unveraendert: $SitePath, $ExchangePath, Python und das Zertifikat im Windows-Speicher (certlm.msc, Vertrauenswuerdige Stammzertifizierungsstellen)."
    exit 0
}

# ---------------------------------------------------------------- 0. Vorpruefungen
Write-Host "0/6 Vorpruefungen ..." -ForegroundColor Cyan
$errors   = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

# PowerShell-Edition (Get-NetTCPConnection und Zertifikatsspeicher laufen sicher in Windows PowerShell)
if ($PSVersionTable.PSEdition -eq "Core") {
    $errors.Add("PowerShell 7 erkannt. Bitte in Windows PowerShell 5.1 starten (powershell.exe).")
}

# Parameter
if ($HttpPort -lt 0 -or $HttpPort -gt 65535) { $errors.Add("HttpPort ($HttpPort) liegt nicht zwischen 0 (kein HTTP) und 65535.") }
if ($HttpsPort -lt 1 -or $HttpsPort -gt 65535) { $errors.Add("HttpsPort ($HttpsPort) liegt nicht zwischen 1 und 65535.") }
if ($HttpPort -gt 0 -and $HttpPort -eq $HttpsPort) { $errors.Add("HttpPort und HttpsPort muessen verschieden sein.") }
if ($SiteName -match '[\\/:*?"<>|]') { $errors.Add('SiteName enthaelt ungueltige Zeichen: \ / : * ? " < > |') }
if ($SitePath -match "SITEPATH") {
    $errors.Add("SitePath ist noch der Platzhalter. Mit -SitePath 'Installationspfad von EEP' anpassen.")
}
if ($SitePath -notmatch '^[A-Za-z]:\\') {
    $errors.Add("SitePath muss ein lokaler absoluter Pfad sein (z.B. C:\EEP17).")
} elseif (-not (Test-Path $SitePath.Substring(0,2))) {
    $errors.Add("Das Laufwerk von SitePath ($SitePath) existiert nicht.")
}
if ($InstallPath -notmatch '^[A-Za-z]:\\.+') {
    $errors.Add("InstallPath muss ein lokaler absoluter Pfad sein (z.B. C:\ProgramData\EEP-Python-Server).")
} elseif (-not (Test-Path $InstallPath.Substring(0,2))) {
    $errors.Add("Das Laufwerk von InstallPath ($InstallPath) existiert nicht.")
}
# ExchangePath: relativer Pfad innerhalb von SitePath (leer = SitePath selbst); ExchangeFile: reiner Dateiname
if ($ExchangePath -match '[:*?"<>|]' -or $ExchangePath.StartsWith('\') -or $ExchangePath -match '(^|\\)\.\.(\\|$)') {
    $errors.Add("ExchangePath muss ein relativer Pfad innerhalb von SitePath sein (z.B. exchange, ohne .. und ohne fuehrenden Backslash).")
}
if ($ExchangeFile -notmatch '^[A-Za-z0-9._-]+$' -or $ExchangeFile -match '^\.+$|[. ]$') {
    $errors.Add("ExchangeFile muss ein reiner Dateiname sein (z.B. commands-to-eep.txt).")
} elseif ($ExchangeFile -match '\.(json|anl3)$') {
    $errors.Add("ExchangeFile darf nicht auf .json oder .anl3 enden (diese Dateitypen liefert der Server aus).")
}
if ($PfxPath -and -not (Test-Path $PfxPath -PathType Leaf)) { $errors.Add("PfxPath nicht gefunden: $PfxPath") }
foreach ($g in $GitHubOrigins) {
    if ($g.TrimEnd("/") -notmatch '^https?://[^/\s]+$') {
        $errors.Add("Ungueltige GitHub-Origin '$g' (nur Schema und Host, ohne Pfad, z.B. https://name.github.io).")
    }
}
if ($GitHubOrigins -match "USERNAME") {
    $warnings.Add("GitHub-Origin ist noch der Platzhalter und wird ignoriert. Mit -GitHubOrigins 'https://dein-name.github.io' anpassen.")
}

# Proxy: Ziel ist die erste GitHub-Origin (nur https, nur Host), Pfad fest unter -ProxyPath
$proxyHost = ""
if ($ProxyGitHub) {
    if ($ProxyPath -notmatch '^/[A-Za-z0-9._~-]+(/[A-Za-z0-9._~-]+)*$' -or $ProxyPath -match '(^|/)\.\.?(/|$)') {
        $errors.Add("ProxyPath '$ProxyPath' ist ungueltig (z.B. /EEP_convert_anl3_file).")
    }
    $po = "$(@($GitHubOrigins | Where-Object { $_ -notmatch 'USERNAME' } | Select-Object -First 1)[0])".TrimEnd("/")
    if ($po -match '^https://([A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*)$') { $proxyHost = $Matches[1] }
    else { $errors.Add("-ProxyGitHub braucht als erste GitHub-Origin eine Adresse der Form https://name.github.io (aktuell: '$po').") }
    $warnings.Add("-ProxyGitHub: Der Server liefert Seiten und Skripte von https://$proxyHost$ProxyPath aus. Dieser Code laeuft dann in der Origin dieses Servers und hat Zugriff auf alle Daten (und mit -ActivateCommands auf die Befehle an EEP). Nur verwenden, wenn dem GitHub-Konto vertraut wird.")
    if ($ActivateCommands) {
        $warnings.Add("-ProxyGitHub zusammen mit -ActivateCommands: Wird die GitHub-Seite veraendert oder kompromittiert, kann deren Code same-origin Befehle an EEP senden. Die Origin-Pruefung schuetzt davor nicht.")
    }
}

$webAdminOk = $null -ne (Get-Module -ListAvailable -Name WebAdministration)
if ($webAdminOk) { Import-Module WebAdministration }

# Portbelegung (fremde Programme und Websites werden nie beendet)
$ownPids = @(Get-OwnProcesses | ForEach-Object { $_.ProcessId })
foreach ($port in @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 } | Select-Object -Unique)) {
    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)

    # Fremde Programme (alles ausser System/http.sys, PID 4, und dem eigenen Server)
    $foreign = @($listeners | Where-Object { $_.OwningProcess -ne 4 } | Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($procId in $foreign) {
        if ($ownPids -contains $procId) { continue }
        $pname = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
        $errors.Add("Port $port wird von Prozess '$pname' (PID $procId) belegt. Prozess beenden oder anderen Port waehlen.")
    }

    # http.sys (IIS und andere): welche Website steckt dahinter?
    if (@($listeners | Where-Object { $_.OwningProcess -eq 4 }).Count -gt 0) {
        $others = @()
        if ($webAdminOk) {
            foreach ($s in Get-Website) {
                if (@($s.Bindings.Collection | Where-Object { $_.bindingInformation -match "^[^:]*:${port}:" }).Count -gt 0 -and $s.State -eq "Started") { $others += $s.Name }
            }
        }
        foreach ($n in $others) {
            $errors.Add("Die fremde Website '$n' belegt Port $port. Sie wird nicht veraendert: anderen Port waehlen (-HttpPort/-HttpsPort) oder die Website selbst stoppen.")
        }
        if ($others.Count -eq 0) {
            $errors.Add("Port $port ist von System (http.sys, PID 4) belegt, aber keine IIS-Website gefunden. Pruefen mit: netsh http show servicestate  und  netsh http show urlacl")
        }
    }
}

# Python bzw. winget
$pythonExe = Find-Python
if (-not $pythonExe) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        $errors.Add("Python 3.9+ ist nicht fuer alle Benutzer installiert und winget fehlt. Python von python.org mit der Option 'Install for all users' installieren und das Skript erneut starten.")
    } elseif (-not (Test-NetConnection www.python.org -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
        $errors.Add("Python fehlt und www.python.org ist nicht erreichbar (Internet/Proxy pruefen).")
    }
}

# Internet fuer pip (cryptography wird nur zum Erzeugen des Zertifikats benoetigt)
if (-not (Test-Path $venvPy)) {
    foreach ($h in "pypi.org","files.pythonhosted.org") {
        if (-not (Test-NetConnection $h -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
            $errors.Add("$h ist nicht erreichbar (Internet/Proxy pruefen), pip kann 'cryptography' nicht laden.")
        }
    }
}

if ($AllowNullOrigin) {
    $warnings.Add("-AllowNullOrigin: Die Origins 'null' und 'file://' werden freigegeben. Sie stammen von file://-Seiten (Chrome sendet bei WebSockets 'file://'), aber 'null' auch von Sandbox-Frames fremder Seiten.")
}

if ($ActivateCommands) {
    $warnings.Add("-ActivateCommands: POST /send-command schreibt Befehle (ANSI) nach '$(Join-Path $ExchangePath $ExchangeFile)' unterhalb von SitePath, wo EEP sie liest. Erlaubt sind Browser-Seiten der zugelassenen Origins (lokales Netz, GitHub) und Anfragen ohne Origin (z.B. curl) nur von diesem Rechner. Nur in vertrauenswuerdigen Netzen verwenden.")
    if ($AllowNullOrigin) {
        $warnings.Add("-ActivateCommands zusammen mit -AllowNullOrigin: Auch jede Seite in einem Sandbox-Frame (Origin 'null') kann Befehle an EEP senden. Wird die Bridge nicht aus einer lokalen Datei (file://) gestartet, -AllowNullOrigin weglassen.")
    } else {
        $warnings.Add("Hinweis: Wird die Bridge aus einer lokalen Datei (file://) gestartet, ist zusaetzlich -AllowNullOrigin noetig, sonst lehnt der Server ihre Befehle ab.")
    }
}
foreach ($w in $warnings) { Write-Warning $w }
if ($errors.Count -gt 0) {
    foreach ($e in $errors) { Write-Host "   [FEHLER]  $e" -ForegroundColor Red }
    Write-Host "`nAbbruch: Es wurde nichts veraendert." -ForegroundColor Red
    exit 1
}
Write-Host "   Alle Vorpruefungen bestanden." -ForegroundColor Green

# ---------------------------------------------------------------- 1. Python
Write-Host "1/6 Python ..." -ForegroundColor Cyan
if (-not $pythonExe) {
    $r = Invoke-Native "winget" @("install","--id","Python.Python.3.12","-e","--scope","machine","--silent",
                                 "--accept-package-agreements","--accept-source-agreements")
    $pythonExe = Find-Python
    if (-not $pythonExe) { throw "Python konnte nicht installiert werden (winget Exitcode $($r.ExitCode)).`n$($r.Output)" }
}
Write-Host "   Verwendet: $pythonExe"

# ---------------------------------------------------------------- 2. Verzeichnisse + virtuelle Umgebung
Write-Host "2/6 Verzeichnisse und Python-Umgebung ..." -ForegroundColor Cyan
Stop-OwnServer      # laufende eigene Instanz beenden (Dateien werden ersetzt)
foreach ($d in $InstallPath, $certDir, $logDir) { New-Item -ItemType Directory -Path $d -Force | Out-Null }

# Es gibt keinen Dienst: Der Server laeuft unter dem Konto, das ihn startet (dieses Konto).
# Zertifikat und privater Schluessel nur fuer System, Administratoren und dieses Konto
$me = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$r = Invoke-Native "icacls" @($logDir, "/grant", "*${me}:(OI)(CI)M", "/Q")
if ($r.ExitCode -ne 0) { throw "Rechte fuer $logDir konnten nicht gesetzt werden: $($r.Output)" }
$r = Invoke-Native "icacls" @($certDir, "/inheritance:r", "/grant", "*S-1-5-18:(OI)(CI)F", "*S-1-5-32-544:(OI)(CI)F", "*${me}:(OI)(CI)F", "/Q")
if ($r.ExitCode -ne 0) { throw "Rechte fuer $certDir konnten nicht gesetzt werden: $($r.Output)" }

# Defekte venv (z.B. Python wurde aktualisiert/entfernt) neu anlegen
if ((Test-Path $venvPy) -and (Invoke-Native $venvPy @("-c","import ssl")).ExitCode -ne 0) {
    Remove-Item (Join-Path $InstallPath "venv") -Recurse -Force
}
if (-not (Test-Path $venvPy)) {
    $r = Invoke-Native $pythonExe @("-m","venv",(Join-Path $InstallPath "venv"))
    if ($r.ExitCode -ne 0) { throw "venv konnte nicht erstellt werden: $($r.Output)" }
}
if ((Invoke-Native $venvPy @("-c","import cryptography")).ExitCode -ne 0) {
    $r = Invoke-Native $venvPy @("-m","pip","install","--disable-pip-version-check","--quiet","cryptography")
    if ($r.ExitCode -ne 0) { throw "pip install cryptography fehlgeschlagen: $($r.Output)" }
}

# ---------------------------------------------------------------- 3. Konfiguration + Zertifikat
Write-Host "3/6 Konfiguration und Zertifikat ..." -ForegroundColor Cyan
$ips = @(Get-NetIPAddress -AddressFamily IPv4 |
         Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*" } |
         Select-Object -ExpandProperty IPAddress)
$certCN = Get-CertCommonName "Python"   # sprechender Name (CN) des selbst erzeugten Zertifikats
$config = [ordered]@{
    site_name       = $SiteName
    cert_name       = $certCN
    site_path       = $SitePath
    exchange_path   = $ExchangePath
    exchange_file   = $ExchangeFile
    http_port       = $HttpPort
    https_port      = $HttpsPort
    github_origins  = @($GitHubOrigins | Where-Object { $_ -notmatch "USERNAME" } | ForEach-Object { $_.TrimEnd("/") })
    computer_name   = $env:COMPUTERNAME
    allow_null_origin = [bool]$AllowNullOrigin
    activate_commands = [bool]$ActivateCommands
    proxy_github    = [bool]$ProxyGitHub
    proxy_host      = $proxyHost
    proxy_path      = $ProxyPath
    cert_file       = (Join-Path $certDir "server.crt")
    key_file        = (Join-Path $certDir "server.key")
    cer_file        = (Join-Path $certDir "server.cer")
    log_file        = $logFile
    san_dns         = @("localhost", $env:COMPUTERNAME, "$env:COMPUTERNAME.local")
    san_ips         = @("127.0.0.1", "::1") + $ips
}
Write-Utf8NoBom (Join-Path $InstallPath "config.json") ($config | ConvertTo-Json -Depth 4)

$makeCert = @'
# -*- coding: utf-8 -*-
"""Erzeugt (selbstsigniert) oder konvertiert (PFX) das Zertifikat fuer server.py."""
import datetime
import ipaddress
import json
import os
import sys

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID

BASE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE, "config.json"), encoding="utf-8-sig") as f:
    CFG = json.load(f)
CERT, KEY, CER = CFG["cert_file"], CFG["key_file"], CFG["cer_file"]
CERT_NAME = CFG["cert_name"]    # sprechender Name (CN) statt "localhost"
UTC = datetime.timezone.utc


def expiry(c):
    try:
        return c.not_valid_after_utc
    except AttributeError:
        return c.not_valid_after.replace(tzinfo=UTC)


def write_files(key, chain):
    with open(KEY, "wb") as f:
        f.write(key.private_bytes(serialization.Encoding.PEM,
                                  serialization.PrivateFormat.PKCS8,
                                  serialization.NoEncryption()))
    with open(CERT, "wb") as f:
        for c in chain:
            f.write(c.public_bytes(serialization.Encoding.PEM))
    with open(CER, "wb") as f:
        f.write(chain[0].public_bytes(serialization.Encoding.DER))


pfx = os.environ.get("EEP_PFX_PATH")
now = datetime.datetime.now(UTC)

if pfx:
    with open(pfx, "rb") as f:
        data = f.read()
    pw = os.environ.get("EEP_PFX_PASSWORD")
    try:
        key, cert, extra = pkcs12.load_key_and_certificates(data, pw.encode("utf-8") if pw else None)
    except Exception as exc:
        sys.exit("PFX-Datei konnte nicht gelesen werden (Passwort richtig?): %s" % exc)
    if key is None or cert is None:
        sys.exit("Die PFX-Datei enthaelt kein Zertifikat mit privatem Schluessel.")
    if expiry(cert) < now:
        sys.exit("Das Zertifikat aus der PFX-Datei ist abgelaufen (%s)." % expiry(cert))
    write_files(key, [cert] + list(extra or []))
    print("PFX-Zertifikat uebernommen")
    sys.exit(0)

want_dns = {d.lower() for d in CFG["san_dns"]}
want_ips = {str(ipaddress.ip_address(i)) for i in CFG["san_ips"]}

# Vorhandenes selbstsigniertes Zertifikat weiterverwenden, solange es gueltig ist und alle Namen/IPs abdeckt
try:
    with open(CERT, "rb") as f:
        old = x509.load_pem_x509_certificate(f.read())
    san = old.extensions.get_extension_for_class(x509.SubjectAlternativeName).value
    have_dns = {d.lower() for d in san.get_values_for_type(x509.DNSName)}
    have_ips = {str(i) for i in san.get_values_for_type(x509.IPAddress)}
    cn = old.subject.get_attributes_for_oid(NameOID.COMMON_NAME)
    if (old.issuer == old.subject and cn and cn[0].value == CERT_NAME and want_dns <= have_dns and want_ips <= have_ips
            and expiry(old) > now + datetime.timedelta(days=30) and os.path.exists(KEY)):
        print("vorhandenes Zertifikat weiterverwendet")
        sys.exit(0)
except SystemExit:
    raise
except Exception:
    pass

key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, CERT_NAME)])
alt = ([x509.DNSName(d) for d in sorted(want_dns)] +
       [x509.IPAddress(ipaddress.ip_address(i)) for i in sorted(want_ips)])
cert = (x509.CertificateBuilder()
        .subject_name(name).issuer_name(name)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - datetime.timedelta(minutes=5))
        .not_valid_after(now + datetime.timedelta(days=730))
        .add_extension(x509.SubjectAlternativeName(alt), critical=False)
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(x509.KeyUsage(digital_signature=True, key_encipherment=True,
                                     content_commitment=False, data_encipherment=False,
                                     key_agreement=False, key_cert_sign=False, crl_sign=False,
                                     encipher_only=False, decipher_only=False), critical=True)
        .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
        .add_extension(x509.SubjectKeyIdentifier.from_public_key(key.public_key()), critical=False)
        .sign(key, hashes.SHA256()))
write_files(key, [cert])
print("neues selbstsigniertes Zertifikat erzeugt")
'@
$makeCertPy = Join-Path $InstallPath "make_cert.py"
Write-Utf8NoBom $makeCertPy $makeCert

$oldThumb = $null
if (Test-Path $config.cer_file) {
    $oldThumb = (New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $config.cer_file).Thumbprint
}
$plainPw = $null
if ($PfxPath) {
    $env:EEP_PFX_PATH = $PfxPath
    if ($PfxPassword) {
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($PfxPassword)
        try { $plainPw = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
        $env:EEP_PFX_PASSWORD = $plainPw
    }
}
try     { $r = Invoke-Native $venvPy @($makeCertPy) }
finally { Remove-Item Env:EEP_PFX_PATH, Env:EEP_PFX_PASSWORD -ErrorAction SilentlyContinue }
if ($r.ExitCode -ne 0) { throw "Zertifikat konnte nicht erstellt werden: $($r.Output)" }
Write-Host "   $($r.Output)"
$certReused = [bool]($r.Output -match "weiterverwendet")

if (-not $PfxPath) {
    # Auf diesem PC als vertrauenswuerdig eintragen und .cer fuer andere Geraete bereitstellen
    $baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    $cerPath = Join-Path $baseDir "$certCN.cer" # "$SiteName.cer"
    Copy-Item $config.cer_file $cerPath -Force
    $thumb = (New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $cerPath).Thumbprint
    if (-not (Test-Path "Cert:\LocalMachine\Root\$thumb")) {
        Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root | Out-Null
    }
    # Vom Skript frueher erzeugtes, ersetztes Zertifikat aus dem Vertrauensspeicher entfernen
    if ($oldThumb -and $oldThumb -ne $thumb -and (Test-Path "Cert:\LocalMachine\Root\$oldThumb")) {
        Remove-Item "Cert:\LocalMachine\Root\$oldThumb" -Force
    }
    Write-Host "   Zertifikat exportiert: $cerPath (auf Geraeten im LAN importieren)"
}

$shownCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $config.cer_file
$certTitle = if ($PfxPath) { "Zertifikat: eigenes Zertifikat (PFX) uebernommen" }
             elseif ($certReused) { "Zertifikat: vorhandenes Zertifikat wird weiterverwendet" }
             else { "Zertifikat: neu erzeugt (selbstsigniert)" }
Show-CertInfo $shownCert $certTitle
Write-Host "   Ablage:" -ForegroundColor Cyan
Write-Host "      Server-Zertifikat (PEM):          $($config.cert_file)"
Write-Host "      privater Schluessel (PEM):        $($config.key_file)"
Write-Host "      oeffentlicher Teil (.cer):        $($config.cer_file)"
if (-not $PfxPath) {
    Write-Host "      Kopie fuer andere Geraete:        $cerPath"
    Write-Host "      Vertrauensspeicher dieses PCs:    Lokaler Computer > Vertrauenswuerdige Stammzertifizierungsstellen (certlm.msc), Name '$certCN'"
}

# ---------------------------------------------------------------- 4. Server + Inhalt
Write-Host "4/6 Server und Webseiten-Inhalt ..." -ForegroundColor Cyan
# Test- und Beispieldaten liegen in <SitePath>\<ExchangePath> (gleicher Ordner wie die Kommando-Datei)
$exDir = Join-Path $SitePath $ExchangePath
$exUrl = (($ExchangePath -split '\\' | Where-Object { $_ } | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/')
$exUrl = if ($exUrl) { "/$exUrl" } else { "" }
$serverCode = @'
# -*- coding: utf-8 -*-
"""EEP Export - schlanker HTTPS-Server (nur Python-Standardbibliothek).

Liefert ausschliesslich .json und .anl3 aus (GET, HEAD, OPTIONS), mit CORS,
HSTS und (optional, nur bei http_port > 0) HTTP->HTTPS-Umleitung.
Optional (--activateCommands oder activate_commands in config.json): POST /send-command haengt Befehle fuer EEP als ANSI an eine Datei an.
WebSocket (wss://, gleiche URL wie die Datei): sendet die Datei beim Verbinden und nach jeder Aenderung.
Optional (proxy_github in config.json): alles, was keine lokale .json/.anl3-Datei ist, wird per GET/HEAD von proxy_host unter proxy_path geholt.
Konfiguration: config.json neben dieser Datei
(wird von Install-Python-web-server.ps1 erzeugt).
"""
import base64
import hashlib
import http.client
import ipaddress
import json
import logging
import logging.handlers
import os
import re
import shutil
import socket
import socketserver
import ssl
import struct
import sys
import threading
import time
from email.utils import formatdate
from urllib.parse import unquote
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE, "config.json"), encoding="utf-8-sig") as _f:
    CFG = json.load(_f)

SITE_ROOT = os.path.realpath(CFG["site_path"])
HTTP_PORT = int(CFG["http_port"])
HTTPS_PORT = int(CFG["https_port"])
ALLOWED_TYPES = {".json": "application/json", ".anl3": "application/octet-stream"}
ALLOWED_METHODS = "GET, HEAD, OPTIONS"

# Erlaubte Origins: localhost, private Netze (10.x, 172.16-31.x, 192.168.x), *.local, PC-Name, GitHub
_gh_list = CFG.get("github_origins") or []
if isinstance(_gh_list, str):
    _gh_list = [_gh_list]
_gh = "|".join(re.escape(o.rstrip("/")) for o in _gh_list)
_lan = (r"localhost|127\.0\.0\.1|\[::1\]|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}"
        r"|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|[a-z0-9-]+\.local|" + re.escape(CFG["computer_name"]))
ALLOW_NULL = bool(CFG.get("allow_null_origin"))   # Origin "null": Seite wird aus einer lokalen Datei (file://) geoeffnet
ORIGIN_RE = re.compile(r"(https?://(" + _lan + r")(:\d+)?)" + (("|(" + _gh + ")") if _gh else ""), re.I)

# Befehle fuer EEP: POST /send-command (nur mit -ActivateCommands bei der Installation ("activate_commands" in config.json)
# oder --activateCommands beim Start). Ohne Aktivierung antwortet der Server auf POST mit 405.
ACTIVATE_COMMANDS = bool(CFG.get("activate_commands")) or any(a.lower() in ("--activatecommands", "-activatecommands") for a in sys.argv[1:])
POST_PATH = "/send-command"
POST_MAX_BYTES = 65536       # groesster erlaubter Body
POST_MAX_LINE = 500          # laengste erlaubte Zeile
POST_LOCK = threading.Lock() # ThreadingHTTPServer: gleichzeitige POSTs duerfen sich nicht mischen
EXCHANGE_DIR = os.path.realpath(os.path.join(SITE_ROOT, CFG.get("exchange_path") or ""))
EXCHANGE_FILE = os.path.join(EXCHANGE_DIR, CFG.get("exchange_file") or "commands-to-eep.txt")
if ACTIVATE_COMMANDS:
    ALLOWED_METHODS = "GET, HEAD, OPTIONS, POST"
    try:
        _inside = os.path.normcase(os.path.commonpath([SITE_ROOT, EXCHANGE_DIR])) == os.path.normcase(SITE_ROOT)
    except ValueError:
        _inside = False
    if not _inside:
        sys.exit("exchange_path liegt ausserhalb von site_path: " + EXCHANGE_DIR)

# Protokoll schreiben
# Proxy (nur mit -ProxyGitHub): Seiten von GitHub Pages holen und selbst ausliefern
# Ziel fest: https://<proxy_host><proxy_path>/... Nur GET/HEAD, keine Cookies/Origin/Referer an GitHub, Redirects nur innerhalb desselben Hosts.
# .json/.anl3 werden nie von GitHub geholt, ausser unter proxy_path (dort zuerst lokal, z.B. relative URL "eep_export.json" der Bridge).
PROXY = bool(CFG.get("proxy_github")) and bool(re.fullmatch(r"[A-Za-z0-9.-]+", str(CFG.get("proxy_host") or "")))
PROXY_HOST = str(CFG["proxy_host"]) if PROXY else ""
PROXY_PATH = str(CFG.get("proxy_path") or "").rstrip("/") if PROXY else ""
PROXY_PASS = ("Accept", "Accept-Language", "User-Agent", "If-None-Match", "If-Modified-Since")
PROXY_KEEP = ("Content-Type", "Content-Length", "Last-Modified", "ETag", "Cache-Control", "Expires")


def proxy_target(raw):
    """Pfad auf dem Ziel: /EEP_Gleisplan -> <proxy_path>/EEP_Gleisplan.html; None = nicht erlaubt."""
    p, sep, q = raw.split("#", 1)[0].partition("?")
    q = sep + q
    try:
        dec = unquote(p, errors="strict")
    except UnicodeDecodeError:
        return None
    if (not p.startswith("/") or p.startswith("//") or re.search(r"[\x00-\x1f\x7f\\]", dec)
            or ".." in dec.split("/") or not re.fullmatch(r"[\x21-\x7e]*", p + q)):
        return None
    if dec == PROXY_PATH:
        p = dec = PROXY_PATH + "/"
    elif not dec.startswith(PROXY_PATH + "/"):
        p, dec = PROXY_PATH + p, PROXY_PATH + dec
    last = dec.rsplit("/", 1)[-1]
    if last and "." not in last:
        p += ".html"
    return p + q


# --- FARB-FORMATTER FUER DIE KONSOLE DEFINIEREN ---
class ColorFormatter(logging.Formatter):
    # ANSI Escape Codes fuer Farben
    GRAU = "\033[90m"
    GELB = "\033[93m"
    ROT = "\033[91m"
    FETT_ROT = "\033[1;91m"
    RESET = "\033[0m"
    # Zuordnung der Farben zu den Levels
    COLORS = {
        logging.WARNING: GELB,
        logging.ERROR: ROT,
        logging.CRITICAL: FETT_ROT,
    }
    def format(self, record):
        # Farbe fuer das aktuelle Level holen (Standard: Grau)
        color = self.COLORS.get(record.levelno, self.GRAU)
        # Das Level-Praefix farblich verpacken, z.B. [WARNING] oder [ERROR]
        level_name = f"{color}[{record.levelname}]{self.RESET}"
        # Neues Format dynamisch fuer diesen Record zusammenbauen
        # Zeit bleibt normal, Level wird farbig, Nachricht normal
        formatter = logging.Formatter(
            f"%(asctime)s {level_name} %(message)s"
        )
        return formatter.format(record)
# --- LOGGING KONFIGURATION ---
# Protokoll schreiben
LOG = logging.getLogger("eep")
LOG.setLevel(logging.INFO)  # WICHTIG: Erlaubt INFO, damit es die Datei erreicht
# Protokoll in Datei zu INFO, WARNING, ERROR und CRITICAL
_fileLog = logging.handlers.RotatingFileHandler(CFG["log_file"], maxBytes=1000000, backupCount=5, encoding="utf-8")
_fileLog.setLevel(logging.INFO)
_fileLog.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
LOG.addHandler(_fileLog)
# Und zusaetzlich Protokoll in der Konsole zu INFO, WARNING, ERROR und CRITICAL
_consoleLog = logging.StreamHandler(sys.stdout) # sys.stdout oder sys.stderr
_consoleLog.setLevel(logging.INFO)
_consoleLog.setFormatter(ColorFormatter())
LOG.addHandler(_consoleLog)

def clean(text):
    return re.sub(r"[^\x20-\x7e]", "?", str(text))


def origin_allowed(origin):
    # Lokale Datei (file://): CORS-Anfragen senden die Origin "null", Chrome sendet bei WebSockets "file://"
    return bool(origin) and (bool(ORIGIN_RE.fullmatch(origin)) or (ALLOW_NULL and origin in ("null", "file://")))


def is_loopback(addr):
    # Anfrage kommt von diesem Rechner (127.0.0.1, ::1, auch als ::ffff:127.0.0.1)
    try:
        ip = ipaddress.ip_address(str(addr).split("%", 1)[0])
    except ValueError:
        return False
    if getattr(ip, "ipv4_mapped", None):
        ip = ip.ipv4_mapped
    return ip.is_loopback


# ---- WebSocket (RFC 6455, nur Standardbibliothek)
# Die Bridge liest die Datei zuerst per HTTPS und verbindet sich dann mit wss://host:port/<Datei>.
# Der Server sendet die Datei sofort und danach bei jeder Aenderung. Browser pruefen bei WebSockets kein CORS,
# deshalb wird die Origin hier selbst geprueft (gleiche Regeln wie bei CORS).
WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
WS_MAX_CLIENTS = 50
WS_MAX_IN = 65536            # groesster erlaubter eingehender Frame (der Client sendet nichts Wichtiges)
WS_SOCKET_TIMEOUT = 5        # Lese- und Sendetimeout je Client in Sekunden
WS_PING_S = 25
WS_WATCH_S = 0.1             # Pruefintervall der Dateiueberwachung (os.stat)
WS_FORCE_EVERY = 10          # alle 10 Durchlaeufe (1 s) wird auch ohne neue Zeit/Groesse der Inhalt verglichen

WLOCK = threading.Lock()
CLIENTS = set()
WATCHES = {}                 # Dateipfad -> Watch
_wthread = None


def ws_frame(opcode, payload):
    n = len(payload)
    if n < 126:
        head = struct.pack("!BB", 0x80 | opcode, n)
    elif n < 65536:
        head = struct.pack("!BBH", 0x80 | opcode, 126, n)
    else:
        head = struct.pack("!BBQ", 0x80 | opcode, 127, n)
    return head + payload


class WSClient:
    def __init__(self, sock, addr, url):
        self.sock = sock
        self.addr = addr
        self.url = url
        self.lock = threading.Lock()   # Handler-Thread (Ping/Pong) und Watcher-Thread senden gleichzeitig
        self.closed = False
        self.watch = None

    def send(self, frame):
        with self.lock:
            if self.closed:
                return False
            try:
                self.sock.sendall(frame)
                return True
            except (OSError, ssl.SSLError):     # Timeout = Client nimmt nichts ab: trennen
                self.kill()
                return False

    def kill(self):
        self.closed = True
        try:
            self.sock.shutdown(socket.SHUT_RDWR)
        except (OSError, ssl.SSLError):
            pass

    def close(self, code):
        self.send(ws_frame(0x8, struct.pack("!H", code)))
        self.kill()


def ws_parse(c, buf):
    """Verarbeitet vollstaendige Frames im Puffer. Gibt (Rest, weiter?) zurueck."""
    while len(buf) >= 2:
        b0, b1 = buf[0], buf[1]
        fin, op = bool(b0 & 0x80), b0 & 0x0F
        if (b0 & 0x70) or not (b1 & 0x80):     # RSV-Bits oder Frame vom Client nicht maskiert
            c.close(1002)
            return buf, False
        n, off = b1 & 0x7F, 2
        if n == 126:
            if len(buf) < 4:
                break
            n, off = struct.unpack("!H", buf[2:4])[0], 4
        elif n == 127:
            if len(buf) < 10:
                break
            n, off = struct.unpack("!Q", buf[2:10])[0], 10
        if n > WS_MAX_IN:
            c.close(1009)
            return buf, False
        if len(buf) < off + 4 + n:
            break
        mask, data, buf = buf[off:off + 4], buf[off + 4:off + 4 + n], buf[off + 4 + n:]
        if n:
            data = (int.from_bytes(data, "big") ^ int.from_bytes((mask * (n // 4 + 1))[:n], "big")).to_bytes(n, "big")
        if op >= 0x8 and (not fin or n > 125):
            c.close(1002)
            return buf, False
        if op == 0x8:
            c.close(1000)
            return buf, False
        if op == 0x9 and not c.send(ws_frame(0xA, data)):    # Ping -> Pong
            return buf, False
        # Text, Binary, Pong: nichts zu tun
    return buf, True


# ---- Datei ueberwachen: ein Eintrag pro Datei, egal wie viele Clients
class Watch:
    def __init__(self, full):
        self.full = full
        self.json = full.lower().endswith(".json")
        self.clients = set()
        self.last = None        # zuletzt gesendeter Text
        self.sig = None         # (mtime_ns, size) des zuletzt erfolgreich gelesenen Stands
        self.try_sig = None
        self.fails = 0
        self.lock = threading.RLock()

def decode_text(raw):
    """Gueltiges UTF-8 bleibt, sonst wird ANSI (Windows-1252) angenommen."""
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        try:
            return raw.decode("cp1252")
        except UnicodeDecodeError:          # undefinierte Bytes (0x81, 0x8D, 0x8F, 0x90, 0x9D)
            return raw.decode("latin-1")
						
def watch_read(w, target=None):
    """Datei lesen und senden. Gibt True zurueck, wenn der Stand erledigt ist (gesendet, unveraendert
    oder dauerhaft ungueltig), False wenn noch einmal gelesen werden soll (Datei fehlt, JSON unvollstaendig).
    target = neuer Client, der den Stand auch dann bekommt, wenn er sich nicht geaendert hat."""
    with w.lock:
        try:
            with open(w.full, "rb") as f:
                raw = f.read()
        except OSError:
            return False
        if raw.startswith(b"\xef\xbb\xbf"):
            raw = raw[3:]
        text = decode_text(raw)
        if w.json:
            try:
                json.loads(text)         # EEP schreibt evtl. gerade: Unvollstaendiges wird nicht gesendet
            except ValueError:
                w.fails += 1
                return w.fails > 10
        w.fails = 0
        changed = text != w.last
        w.last = text
        if changed:
            targets = list(w.clients)
        elif target is not None and target in w.clients:
            targets = [target]
        else:
            targets = []
        if targets:
            frame = ws_frame(0x1, text.encode("utf-8"))
            for c in targets:
                c.send(frame)
        return True


def _watch_loop():
    global _wthread
    tick = 0
    while True:
        time.sleep(WS_WATCH_S)
        tick += 1
        with WLOCK:
            items = list(WATCHES.values())
            if not items:
                _wthread = None
                return
        for w in items:
            try:
                st = os.stat(w.full)
                sig = (st.st_mtime_ns, st.st_size)
                if sig != w.try_sig:
                    w.try_sig, w.fails = sig, 0
                if sig != w.sig or tick % WS_FORCE_EVERY == 0:
                    if watch_read(w):
                        w.sig = sig
            except OSError:
                pass
            except Exception:
                LOG.exception("Dateiueberwachung")


def watch_add(full, c):
    global _wthread
    with WLOCK:
        w = WATCHES.get(full)
        if w is None:
            w = WATCHES[full] = Watch(full)
            LOG.info("Ueberwache %s", full)
        w.clients.add(c)
        c.watch = w
        if _wthread is None:
            _wthread = threading.Thread(target=_watch_loop, daemon=True)
            _wthread.start()
    watch_read(w, c)                     # aktuellen Stand sofort an den neuen Client


def watch_remove(c):
    w = c.watch
    if w is None:
        return
    c.watch = None
    with WLOCK:
        w.clients.discard(c)
        if not w.clients and WATCHES.get(w.full) is w:
            del WATCHES[w.full]
            LOG.info("Ueberwachung beendet %s", w.full)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "EEP-Export"
    sys_version = ""
    timeout = 30
    _cors = None
    _pna = False

    def version_string(self):
        return self.server_version

    def log_message(self, fmt, *args):
        LOG.info("%s %s", self.client_address[0], clean(fmt % args))

    def end_headers(self):
        self.send_header("Strict-Transport-Security", "max-age=31536000")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Vary", "Origin")
        if self._cors:
            self.send_header("Access-Control-Allow-Origin", self._cors)
            self.send_header("Access-Control-Allow-Methods", ALLOWED_METHODS)
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
            if self._pna:
                self.send_header("Access-Control-Allow-Private-Network", "true")
        super().end_headers()

    def _begin(self):
        origin = self.headers.get("Origin", "")
        ok = origin_allowed(origin)
        self._cors = origin if ok else None
        self._pna = self.headers.get("Access-Control-Request-Private-Network", "").lower() == "true"

    def _resolve(self, raw):
        """Gibt den Dateipfad zurueck oder None, wenn die Anfrage nicht erlaubt ist."""
        path = raw.split("?", 1)[0].split("#", 1)[0]
        from urllib.parse import unquote
        path = unquote(path)
        if not path.startswith("/") or "\x00" in path or "\\" in path or ":" in path:
            return None
        parts = path.split("/")
        for p in parts:
            if p == ".." or (p and (p.endswith(".") or p.endswith(" "))):
                return None
        if os.path.splitext(parts[-1])[1].lower() not in ALLOWED_TYPES:
            return None
        full = os.path.realpath(os.path.join(SITE_ROOT, *[p for p in parts if p]))
        try:
            common = os.path.commonpath([SITE_ROOT, full])
        except ValueError:
            return None
        if os.path.normcase(common) != os.path.normcase(SITE_ROOT):
            return None
        if os.path.splitext(full)[1].lower() not in ALLOWED_TYPES or not os.path.isfile(full):
            return None
        return full

    def _serve(self, send_body):
        self._begin()
        full = self._resolve(self.path)
        if not full and PROXY:
            return self._proxy_or_local(send_body)
        if not full:
            self.send_error(404)
            return
        self._serve_file(full, send_body)

    def _serve_file(self, full, send_body):
        try:
            f = open(full, "rb")
        except OSError:
            self.send_error(404)
            return
        with f:
            st = os.fstat(f.fileno())
            ext = os.path.splitext(full)[1].lower()
            body = None
            ctype = ALLOWED_TYPES[ext]
            length = st.st_size
            if ext == ".json":      # einheitlich UTF-8 ausliefern
                body = decode_text(f.read()).lstrip("\ufeff").encode("utf-8")
                ctype += "; charset=utf-8"
                length = len(body)
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(length))
            self.send_header("Last-Modified", formatdate(st.st_mtime, usegmt=True))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            if send_body:
                if body is not None:
                    self.wfile.write(body)
                else:
                    shutil.copyfileobj(f, self.wfile, 65536)

    def _proxy_or_local(self, send_body):
        raw = self.path
        try:
            path = unquote(raw.split("?", 1)[0].split("#", 1)[0], errors="strict")
        except UnicodeDecodeError:
            return self.send_error(404)
        data_type = os.path.splitext(path.rsplit("/", 1)[-1])[1].lower() in ALLOWED_TYPES
        under = raw.startswith(PROXY_PATH + "/")
        if data_type and not under:             # Daten nur lokal
            return self.send_error(404)
        if data_type:
            local = self._resolve(raw[len(PROXY_PATH):])    # <proxy_path>/eep_export.json -> <SitePath>/eep_export.json
            if local:
                return self._serve_file(local, send_body)
        self._proxy(send_body)

    def _proxy(self, send_body):
        target = proxy_target(self.path)
        if not target:
            return self.send_error(404)
        headers = {"Accept-Encoding": "identity"}
        for k in PROXY_PASS:
            v = self.headers.get(k)
            if v:
                headers[k] = v
        started = False
        conn = http.client.HTTPSConnection(PROXY_HOST, 443, timeout=15)
        try:
            conn.request(self.command, target, headers=headers)
            ur = conn.getresponse()
            sc = ur.status
            if sc in (301, 302, 307, 308):
                loc = ur.getheader("Location") or ""
                pre = "https://" + PROXY_HOST
                if loc.startswith(pre + "/"):
                    loc = loc[len(pre):]
                if not loc.startswith("/") or loc.startswith("//") or not re.fullmatch(r"[\x21-\x7e]+", loc):
                    return self.send_error(502)             # nie auf fremde Hosts umleiten
                self.send_response(302)
                self.send_header("Location", loc)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            if sc in (200, 304):
                self.send_response(sc)
                for k in PROXY_KEEP:
                    v = ur.getheader(k)
                    if v:
                        self.send_header(k, v)
                if ur.getheader("Content-Length") is None:
                    self.close_connection = True
                started = True
                self.end_headers()
                if send_body and sc == 200:
                    while True:
                        chunk = ur.read(65536)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                return
            self.send_error(404 if sc == 404 else 502)
        except (OSError, http.client.HTTPException) as exc:
            LOG.warning("Proxy-Fehler (%s): %s", PROXY_HOST, clean(exc))
            self.close_connection = True
            if not started:
                self.send_error(502)
        finally:
            conn.close()

    def do_GET(self):
        if "websocket" in self.headers.get("Upgrade", "").lower():
            self._websocket()
        else:
            self._serve(True)

    def _websocket(self):
        self._begin()
        self.close_connection = True
        key = self.headers.get("Sec-WebSocket-Key", "")
        if ("upgrade" not in self.headers.get("Connection", "").lower()
                or self.headers.get("Sec-WebSocket-Version") != "13"
                or not re.fullmatch(r"[A-Za-z0-9+/]{22}==", key)):
            self.send_error(400)
            return
        origin = self.headers.get("Origin", "")
        if not origin_allowed(origin):
            LOG.warning("%s \"WS %s\" 403 Forbidden (Origin: %s%s)", self.client_address[0], clean(self.path), clean(origin) or "fehlt",
                        "" if ALLOW_NULL else ", file:// und null nur mit -AllowNullOrigin")
            self.send_error(403)
            return
        full = self._resolve(self.path)          # gleiche Regeln wie bei HTTP: nur .json und .anl3
        if not full:
            self.send_error(404)
            return
        sock = self.connection
        c = WSClient(sock, self.client_address[0], clean(self.path))
        with WLOCK:
            if len(CLIENTS) >= WS_MAX_CLIENTS:
                full = None
            else:
                CLIENTS.add(c)
        if not full:
            self.send_error(503)
            return
        try:
            accept = base64.b64encode(hashlib.sha1((key + WS_GUID).encode("ascii")).digest()).decode("ascii")
            sock.sendall(("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
                          "Sec-WebSocket-Accept: %s\r\n\r\n" % accept).encode("ascii"))
            sock.settimeout(WS_SOCKET_TIMEOUT)
            try:
                sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
            except OSError:
                pass
            LOG.info('%s "WS %s" 101 (%d offen)', c.addr, c.url, len(CLIENTS))
            watch_add(full, c)
            self._ws_loop(c)
        except (OSError, ssl.SSLError):
            pass
        finally:
            c.kill()
            watch_remove(c)
            with WLOCK:
                CLIENTS.discard(c)
                n = len(CLIENTS)
            LOG.info("%s WebSocket beendet %s (%d offen)", c.addr, c.url, n)

    def _ws_loop(self, c):
        buf = b""
        alive = True
        last_ping = time.monotonic()
        while not c.closed:
            try:
                chunk = c.sock.recv(65536)
            except (socket.timeout, TimeoutError, ssl.SSLWantReadError) as exc:
                chunk = None
            except ssl.SSLError as exc:
                if "timed out" not in str(exc):
                    return
                chunk = None
            except OSError:
                return
            if chunk is None:
                # Ping an den Client; wer seit dem letzten Ping nichts von sich hoeren liess, wird getrennt
                if time.monotonic() - last_ping >= WS_PING_S:
                    if not alive:
                        return
                    alive = False
                    last_ping = time.monotonic()
                    if not c.send(ws_frame(0x9, b"")):
                        return
                continue
            if not chunk:
                return
            alive = True
            buf, ok = ws_parse(c, buf + chunk)
            if not ok:
                return

    def do_HEAD(self):
        self._serve(False)

    def do_OPTIONS(self):
        self._begin()
        self.send_response(204)
        self.send_header("Allow", ALLOWED_METHODS)
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _not_allowed(self):
        self._begin()
        self.close_connection = True
        self.send_response(405)
        self.send_header("Allow", ALLOWED_METHODS)
        self.send_header("Content-Length", "0")
        self.send_header("Connection", "close")
        self.end_headers()

    def do_POST(self):
        self._begin()
        self.close_connection = True          # Verbindung nach der Antwort schliessen
        addr = self.client_address[0]
        # Body zuerst lesen (bis zur Obergrenze), damit eine Ablehnung nicht an einer zurueckgesetzten Verbindung scheitert
        try:
            length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            length = -1
        raw = b""
        if 0 < length <= POST_MAX_BYTES:
            try:
                raw = self.rfile.read(length)
            except (OSError, ssl.SSLError):
                return
        if not ACTIVATE_COMMANDS:
            return self._not_allowed()
        if self.path.split("?", 1)[0] != POST_PATH:
            return self.send_error(404)
        origin = self.headers.get("Origin")
        if origin is not None:
            # Browser (Bridge): die Origin muss erlaubt sein, gleiche Regeln wie bei CORS und WebSocket
            if not origin_allowed(origin):
                LOG.warning("%s \"POST %s\" 403 Forbidden (Origin: %s%s)", addr, clean(self.path), clean(origin) or "leer",
                            "" if ALLOW_NULL else ", file:// und null nur mit -AllowNullOrigin")
                return self.send_error(403)
        elif not is_loopback(addr):
            # kein Browser (z.B. curl): nur von diesem Rechner
            LOG.warning("%s \"POST %s\" 403 Forbidden (ohne Origin nur von diesem Rechner)", addr, clean(self.path))
            return self.send_error(403)
        if length < 0:
            return self.send_error(411)
        if length == 0:
            return self.send_error(400)
        if length > POST_MAX_BYTES:
            return self.send_error(413)
        text = decode_text(raw)              # UTF-8 (Bridge), sonst ANSI (z.B. curl in der Windows-Konsole)
        lines = [l.strip() for l in text.lstrip("\ufeff").splitlines() if l.strip()]
        if not lines or any(len(l) > POST_MAX_LINE or re.search(r"[\x00-\x08\x0b-\x1f\x7f]", l) for l in lines):
            return self.send_error(400, "Ungueltige Zeilen")
        try:
            data = "".join(l + "\r\n" for l in lines).encode("cp1252")      # EEP liest ANSI
        except UnicodeEncodeError:
            return self.send_error(400, "Zeichen nicht in ANSI (Windows-1252) darstellbar")
        try:
            os.makedirs(EXCHANGE_DIR, exist_ok=True)
            with POST_LOCK, open(EXCHANGE_FILE, "ab") as f:
                f.write(data)
        except OSError as exc:
            LOG.error("Fehler beim Schreiben der Kommando-Datei: %s", clean(exc))
            return self.send_error(500)
        body = b'{"status": "success", "lines": %d}' % len(lines)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        LOG.info("%s %d Befehl(e) von Origin %s nach %s geschrieben", addr, len(lines),
                 clean(origin) if origin is not None else "(ohne)", clean(EXCHANGE_FILE))

    do_PUT = do_DELETE = do_PATCH = _not_allowed


class RedirectHandler(Handler):
    """Port HTTP: leitet alles dauerhaft auf HTTPS um."""

    def _serve(self, send_body):
        self._begin()
        host = (self.headers.get("Host") or "localhost").strip()
        name = host.split("]", 1)[0] + "]" if host.startswith("[") else host.split(":", 1)[0]
        if not re.fullmatch(r"[A-Za-z0-9.\-]+|\[[0-9A-Fa-f:.]+\]", name):
            name = "localhost"
        port = "" if HTTPS_PORT == 443 else ":%d" % HTTPS_PORT
        path = self.path if self.path.startswith("/") else "/"
        path = re.sub(r"[^\x21-\x7e]", "", path)
        self.send_response(301)
        self.send_header("Location", "https://%s%s%s" % (name, port, path))
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        self._serve(True)           # auf dem HTTP-Port kein WebSocket, nur Umleitung

    def do_OPTIONS(self):
        self._serve(False)

    # auf dem HTTP-Port (unverschluesselt) nie Befehle annehmen
    do_POST = do_PUT = do_DELETE = do_PATCH = Handler._not_allowed


class BaseServer(ThreadingHTTPServer):
    allow_reuse_address = False          # unter Windows wuerde das Port-Mitbenutzung erlauben
    request_queue_size = 128

    def server_bind(self):
        if self.address_family == socket.AF_INET6:
            try:
                self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)   # IPv4 + IPv6
            except (OSError, AttributeError):
                pass
        socketserver.TCPServer.server_bind(self)
        self.server_name = "localhost"
        self.server_port = self.socket.getsockname()[1]

    def handle_error(self, request, client_address):
        exc = sys.exc_info()[1]
        # Client hat die Verbindung ohne sauberen TLS-Abschluss geschlossen: kein Fehler
        if isinstance(exc, (ConnectionError, TimeoutError, ssl.SSLEOFError)) or \
           (isinstance(exc, ssl.SSLError) and "EOF" in str(exc)):
            LOG.debug("Verbindung vom Client beendet %s: %s", client_address[0], clean(exc))
            return
        LOG.error("Verbindungsfehler %s: %s", client_address[0], clean(exc))


class TLSServer(BaseServer):
    ctx = None

    def process_request_thread(self, request, client_address):
        # TLS-Handshake im eigenen Thread, damit ein haengender Client nicht den Server blockiert
        try:
            request.settimeout(10)
            request = self.ctx.wrap_socket(request, server_side=True)
        except (ssl.SSLError, OSError) as exc:
            LOG.error("TLS-Handshake fehlgeschlagen %s: %s", client_address[0], clean(exc))
            self.shutdown_request(request)
            return
        super().process_request_thread(request, client_address)


def make_server(cls, port, handler):
    last = None
    for family, host in ((socket.AF_INET6, "::"), (socket.AF_INET, "0.0.0.0")):
        try:
            return type(cls.__name__, (cls,), {"address_family": family})((host, port), handler)
        except OSError as exc:
            last = exc
    raise last


def main():
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.load_cert_chain(CFG["cert_file"], CFG["key_file"])
    https = make_server(TLSServer, HTTPS_PORT, Handler)
    https.ctx = ctx
    if HTTP_PORT > 0:
        http = make_server(BaseServer, HTTP_PORT, RedirectHandler)
        threading.Thread(target=http.serve_forever, daemon=True).start()
    LOG.info("Server gestartet (mit WebSocket): HTTPS Port %d, HTTP Port %s, Inhalt %s", HTTPS_PORT, HTTP_PORT or "aus", SITE_ROOT)
    if PROXY:
        LOG.warning("Proxy aktiv: andere Seiten kommen von https://%s%s/ (nur GET/HEAD; .json/.anl3 nur lokal)", PROXY_HOST, PROXY_PATH)
    if ACTIVATE_COMMANDS:
        LOG.info("Befehle fuer EEP aktiv: POST %s -> %s (Browser: nur erlaubte Origins, ohne Origin nur von diesem Rechner)", POST_PATH, EXCHANGE_FILE)
        if ALLOW_NULL:
            LOG.warning("Origin null/file:// ist erlaubt: auch Seiten in Sandbox-Frames koennten Befehle senden")
    else:
        LOG.info("Befehle (POST) sind nicht aktiviert (--activateCommands)")
    try:
        https.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    try:
        main()
    except Exception:
        LOG.exception("Server beendet wegen Fehler")
        sys.exit(1)
'@
Write-Utf8NoBom $serverPy $serverCode

New-Item -ItemType Directory -Path $exDir -Force | Out-Null   # legt bei Bedarf auch $SitePath an; Test- und Beispieldaten nur im Unterordner
if (-not (Test-Path "$exDir\daten.json"))    { Write-Utf8NoBom "$exDir\daten.json" '{ "status": "ok" }' }
if (-not (Test-Path "$exDir\beispiel.anl3")) { Write-Utf8NoBom "$exDir\beispiel.anl3" 'Beispiel' }

# ---------------------------------------------------------------- 5. Firewall
Write-Host "5/6 Firewall ..." -ForegroundColor Cyan
if ($OpenFirewall) {
    Remove-NetFirewallRule -DisplayName $fwName -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName $fwName -Direction Inbound -Protocol TCP `
        -LocalPort @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 }) -Action Allow -Profile Private,Domain | Out-Null
    Write-Host "   Eingehende Regel '$fwName' fuer Port $(@($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 }) -join '/') (Privat, Domaene) angelegt."
} else {
    Write-Host "   Uebersprungen (nur lokaler Zugriff). Fuer Zugriff aus dem LAN: -OpenFirewall"
}

# ---------------------------------------------------------------- 6. Teststart + Abschlusstests
Write-Host "6/6 Teststart und Tests ..." -ForegroundColor Cyan
# Der Server wird nur fuer die Tests im Hintergrund gestartet und danach wieder beendet (kein Autostart)
Stop-OwnServer
Start-Process -FilePath $venvPy -ArgumentList "`"$serverPy`"" -WorkingDirectory $InstallPath -WindowStyle Hidden | Out-Null
$deadline = (Get-Date).AddSeconds(30)
do {
    Start-Sleep -Milliseconds 500
    $up = [bool](Get-NetTCPConnection -LocalPort $HttpsPort -State Listen -ErrorAction SilentlyContinue)
    if ($up -and $HttpPort -gt 0) { $up = [bool](Get-NetTCPConnection -LocalPort $HttpPort -State Listen -ErrorAction SilentlyContinue) }
} until ($up -or (Get-Date) -gt $deadline)

# Bei eigenem Zertifikat (PFX) passt der Name evtl. nicht zu "localhost": Vertrauenspruefung nur fuer die Tests ausschalten
if ($PfxPath) {
    if (-not ("EepTrust" -as [type])) {
        Add-Type @"
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
public static class EepTrust {
    public static void AcceptAll() {
        ServicePointManager.ServerCertificateValidationCallback =
            delegate(object s, X509Certificate c, X509Chain ch, SslPolicyErrors e) { return true; };
    }
}
"@
    }
    [EepTrust]::AcceptAll()
}

$portSuffix = if ($HttpsPort -eq 443) { "" } else { ":$HttpsPort" }
$httpSuffix = if ($HttpPort -eq 80) { "" } else { ":$HttpPort" }
$baseUrl    = "https://localhost$portSuffix"
$testBase    = "$baseUrl$exUrl"   # Test- und Beispieldaten liegen im Unterordner
$acao       = "Access-Control-Allow-Origin"
$ownPids    = @(Get-OwnProcesses | ForEach-Object { $_.ProcessId })

# Ports
foreach ($port in @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 })) {
    $l = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    Write-Check (($l.Count -gt 0) -and (@($l | Where-Object { $ownPids -notcontains $_.OwningProcess }).Count -eq 0)) "Port $port lauscht (eigener Server)"
}

# Inhalt ueber HTTPS + CORS
$localOrigin = "http://localhost:3000"
$r = Invoke-Probe "$testBase/daten.json" @{ Origin = $localOrigin }
Write-Check ($r.Status -eq 200) "HTTPS daten.json: Status $($r.Status) $($r.Error)"
Write-Check ("$($r.Headers['Content-Type'])" -like "application/json*") "daten.json hat den Typ application/json"
Write-Check ([bool]$r.Headers["Strict-Transport-Security"]) "HSTS-Header wird gesendet"
Write-Check ($r.Headers[$acao] -eq $localOrigin) "CORS: localhost erlaubt"

$lanOrigin = "https://192.168.1.50"
$r = Invoke-Probe "$testBase/daten.json" @{ Origin = $lanOrigin }
Write-Check ($r.Headers[$acao] -eq $lanOrigin) "CORS: lokales Netzwerk erlaubt ($lanOrigin)"

foreach ($g in $GitHubOrigins) {
    $gh = $g.TrimEnd("/")
    if ($gh -match "USERNAME") { continue }
    $r = Invoke-Probe "$testBase/daten.json" @{ Origin = $gh }
    Write-Check ($r.Headers[$acao] -eq $gh) "CORS: GitHub-Origin erlaubt ($gh)"
}

$r = Invoke-Probe "$testBase/daten.json" @{ Origin = "https://fremde-seite.example" }
Write-Check (-not $r.Headers[$acao]) "CORS: fremde Origin wird NICHT freigegeben"

# Origin "null": gesendet bei lokalen Dateien (file:///) und sandboxed iframes
$r = Invoke-Probe "$testBase/daten.json" @{ Origin = "null" }
if ($AllowNullOrigin) { Write-Check ($r.Headers[$acao] -eq "null") "CORS: Origin 'null' (lokale Datei) erlaubt" }
else                  { Write-Check (-not $r.Headers[$acao])      "CORS: Origin 'null' (lokale Datei) wird NICHT freigegeben" }

$r = Invoke-Probe "$testBase/daten.json" @{ Origin = $localOrigin; "Access-Control-Request-Method" = "GET" } "OPTIONS"
Write-Check ($r.Status -eq 204 -and $r.Headers[$acao] -eq $localOrigin) "CORS-Preflight (OPTIONS): Status $($r.Status)"

# Private Network Access: Header nur bei entsprechender Preflight-Anfrage und erlaubter Origin
$pna = "Access-Control-Allow-Private-Network"
$pre = @{ Origin = $localOrigin; "Access-Control-Request-Method" = "GET"; "Access-Control-Request-Private-Network" = "true" }
$r = Invoke-Probe "$testBase/daten.json" $pre "OPTIONS"
Write-Check ($r.Headers[$pna] -eq "true") "PNA: Preflight mit Private-Network-Anfrage wird freigegeben"
$r = Invoke-Probe "$testBase/daten.json" @{ Origin = $localOrigin; "Access-Control-Request-Method" = "GET" } "OPTIONS"
Write-Check (-not $r.Headers[$pna]) "PNA: ohne Anfrage des Browsers wird der Header nicht gesendet"
$pre["Origin"] = "https://fremde-seite.example"
$r = Invoke-Probe "$testBase/daten.json" $pre "OPTIONS"
Write-Check (-not $r.Headers[$pna]) "PNA: fremde Origin wird NICHT freigegeben"

# POST /send-command (Befehle fuer EEP)
if (-not $ActivateCommands) {
    $r = Invoke-Probe "$testBase/daten.json" @{} "POST"
    Write-Check ($r.Status -eq 405) "POST ist gesperrt (ohne -ActivateCommands): Status $($r.Status)"
} else {
    $postUrl    = "$baseUrl/send-command"
    $exFull     = Join-Path $exDir $ExchangeFile
    $existed    = Test-Path $exFull
    $dirExisted = Test-Path $exDir

    $r = Invoke-Probe $postUrl @{ Origin = $localOrigin; "Access-Control-Request-Method" = "POST"; "Access-Control-Request-Private-Network" = "true" } "OPTIONS"
    Write-Check ("$($r.Headers['Access-Control-Allow-Methods'])" -like "*POST*" -and $r.Headers["Access-Control-Allow-Private-Network"] -eq "true") "POST-Preflight (OPTIONS) wird freigegeben: Status $($r.Status)"
    $r = Invoke-Post $postUrl "-- Selbsttest" @{ Origin = "https://fremde-seite.example" }
    Write-Check ($r.Status -eq 403) "POST: fremde Origin wird abgelehnt: Status $($r.Status) $($r.Error)"
    if (-not $AllowNullOrigin) {
        $r = Invoke-Post $postUrl "-- Selbsttest" @{ Origin = "null" }
        Write-Check ($r.Status -eq 403) "POST: Origin 'null' (lokale Datei) wird abgelehnt: Status $($r.Status) $($r.Error)"
    }
    if ($existed) {
        Write-Warning "Die Kommando-Datei $exFull existiert bereits: Die Schreibtests werden uebersprungen, damit keine Befehle verloren gehen oder ausgeloest werden."
    } else {
        try {
            $ansiText = "-- Selbsttest " + [char]0xE4 + [char]0xFC
            $r = Invoke-Post $postUrl $ansiText @{ Origin = $localOrigin }
            Write-Check ($r.Status -eq 200 -and $r.Headers[$acao] -eq $localOrigin) "POST: Origin localhost erlaubt: Status $($r.Status) $($r.Error)"
            $bytes = if (Test-Path $exFull) { [IO.File]::ReadAllBytes($exFull) } else { @() }
            Write-Check (($bytes -contains 0xE4) -and ($bytes -contains 0xFC) -and -not ($bytes -contains 0xC3)) "POST: Befehle werden als ANSI (Windows-1252) geschrieben"
            $r = Invoke-Post $postUrl "-- Selbsttest curl"
            Write-Check ($r.Status -eq 200) "POST: ohne Origin (wie curl) von diesem Rechner erlaubt: Status $($r.Status) $($r.Error)"
            if ($AllowNullOrigin) {
                $r = Invoke-Post $postUrl "-- Selbsttest" @{ Origin = "null" }
                Write-Check ($r.Status -eq 200) "POST: Origin 'null' (lokale Datei) erlaubt: Status $($r.Status) $($r.Error)"
            }
        } finally {
            if (Test-Path $exFull) { Remove-Item $exFull -Force -ErrorAction SilentlyContinue }
            if (-not $dirExisted -and (Test-Path $exDir) -and -not (Get-ChildItem $exDir -Force)) { Remove-Item $exDir -Force -ErrorAction SilentlyContinue }
        }
    }
}

# Nur .json und .anl3
$r = Invoke-Probe "$testBase/beispiel.anl3"
Write-Check ($r.Status -eq 200) "beispiel.anl3 wird ausgeliefert: Status $($r.Status)"

$testFile = Join-Path $exDir "pruefung.txt"
'test' | Set-Content $testFile
try { $r = Invoke-Probe "$testBase/pruefung.txt" } finally { Remove-Item $testFile -Force -ErrorAction SilentlyContinue }
if ($ProxyGitHub) { Write-Check ($r.Status -ne 200) "Lokale .txt-Dateien werden nicht ausgeliefert (Proxy fragt nur GitHub): Status $($r.Status)" }
else { Write-Check ($r.Status -eq 404) "Andere Dateitypen (.txt) sind gesperrt: Status $($r.Status)" }

if (-not $ProxyGitHub) {
    $r = Invoke-Probe "$baseUrl/"
    Write-Check ($r.Status -eq 404) "Verzeichnisauflistung ist gesperrt: Status $($r.Status)"
} else {
    $r = Invoke-Probe "$baseUrl/fehlt.json"
    Write-Check ($r.Status -eq 404) "Proxy: .json ausserhalb von $ProxyPath wird nie weitergeleitet: Status $($r.Status)"
    $r = Invoke-Probe "$baseUrl$ProxyPath$exUrl/daten.json"
    Write-Check ($r.Status -eq 200) "Proxy: $ProxyPath/... liefert Daten zuerst aus SitePath: Status $($r.Status)"
    if (Test-NetConnection $proxyHost -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue) {
        $r = Invoke-Probe "$baseUrl/EEP_Gleisplan"
        Write-Check ($r.Status -eq 200 -and "$($r.Headers['Content-Type'])" -like "text/html*") "Proxy: /EEP_Gleisplan kommt von https://$proxyHost$ProxyPath/EEP_Gleisplan.html: Status $($r.Status) $($r.Error)"
        $r = Invoke-Probe "$baseUrl/EEP_Gleisplan" @{} "POST"
        Write-Check ($r.Status -ne 200) "Proxy: POST wird nicht weitergeleitet: Status $($r.Status)"
    } else {
        Write-Warning "$proxyHost ist nicht erreichbar: Der Proxy-Abrufetest wurde uebersprungen."
    }
}

# HTTP -> HTTPS (nur wenn ein HTTP-Port konfiguriert ist)
if ($HttpPort -gt 0) {
    $r = Invoke-Probe "http://localhost$httpSuffix$exUrl/daten.json"
    Write-Check ($r.Status -eq 301 -and "$($r.Headers['Location'])" -like "https://*") "HTTP wird auf HTTPS umgeleitet: Status $($r.Status) $($r.Headers['Location']) $($r.Error)"
    if ($ActivateCommands) {
        $r = Invoke-Probe "http://localhost$httpSuffix/send-command" @{} "POST"
        Write-Check ($r.Status -eq 405) "POST auf dem HTTP-Port wird nicht angenommen: Status $($r.Status) $($r.Error)"
    }
}

# WebSocket: Handshake, sofortige Datei, Push bei Aenderung, fremde Origin wird abgelehnt (Testclient in Python)
$wsFile = Join-Path $exDir "wstest.json"
$wsPy   = Join-Path $InstallPath "ws-selftest.py"
$wsCode = @'
import base64, json, os, socket, ssl, struct, sys

port, origin, path, url = int(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4]
A, B = json.dumps({"n": 1}), json.dumps({"n": 2})
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def open_ws(org):
    s = ctx.wrap_socket(socket.create_connection(("localhost", port), 10), server_hostname="localhost")
    s.settimeout(10)
    key = base64.b64encode(os.urandom(16)).decode()
    s.sendall(("GET %s HTTP/1.1\r\nHost: localhost\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n"
               "Sec-WebSocket-Version: 13\r\nSec-WebSocket-Key: %s\r\nOrigin: %s\r\n\r\n" % (url, key, org)).encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        d = s.recv(4096)
        if not d:
            break
        buf += d
    head, _, rest = buf.partition(b"\r\n\r\n")
    return s, int(head.split(b" ", 2)[1]), rest


def read_text(s, buf):
    while True:
        while len(buf) >= 2:
            n, off = buf[1] & 127, 2
            if n == 126:
                if len(buf) < 4:
                    break
                n, off = struct.unpack("!H", buf[2:4])[0], 4
            elif n == 127:
                if len(buf) < 10:
                    break
                n, off = struct.unpack("!Q", buf[2:10])[0], 10
            if len(buf) < off + n:
                break
            op, p, buf = buf[0] & 15, buf[off:off + n], buf[off + n:]
            if op == 1:
                return p.decode("utf-8"), buf
        d = s.recv(65536)
        if not d:
            raise RuntimeError("Verbindung beendet")
        buf += d


try:
    with open(path, "w") as f:
        f.write(A)
    s, st, rest = open_ws(origin)
    if st != 101:
        sys.exit("Upgrade abgelehnt: Status %d" % st)
    t, rest = read_text(s, rest)
    if t != A:
        sys.exit("Erste Nachricht falsch: " + t)
    with open(path, "w") as f:
        f.write(B)
    t, rest = read_text(s, rest)
    if t != B:
        sys.exit("Aenderung nicht gepusht: " + t)
    s.close()
    s, st, rest = open_ws("https://fremde-seite.example")
    if st != 403:
        sys.exit("fremde Origin: Status %d" % st)
    print("OK")
except Exception as exc:
    sys.exit("%s" % exc)
'@
Write-Utf8NoBom $wsPy $wsCode
try { $r = Invoke-Native $venvPy @($wsPy, "$HttpsPort", $localOrigin, $wsFile, "$exUrl/wstest.json") }
finally { Remove-Item $wsPy, $wsFile -Force -ErrorAction SilentlyContinue }
Write-Check ($r.ExitCode -eq 0 -and $r.Output -match 'OK') "WebSocket: Datei beim Verbinden, Push bei Aenderung, fremde Origin abgelehnt $(if ($r.ExitCode -ne 0) { $r.Output })"

Stop-OwnServer      # Testserver beenden

if ($script:failed -gt 0) {
    Write-Host "`n$($script:failed) Pruefung(en) fehlgeschlagen. Details siehe oben." -ForegroundColor Red
    if (Test-Path $logFile) {
        Write-Host "Letzte Zeilen aus ${logFile}:" -ForegroundColor Yellow
        Get-Content $logFile -Tail 15
    }
    exit 1
}

Write-Host "`nFertig. Alle Pruefungen bestanden; der Testserver wurde wieder beendet (kein Autostart)." -ForegroundColor Green
Write-Host "Server starten (Strg+C beendet ihn):"
Write-Host "  & `"$venvPy`" `"$serverPy`"" -ForegroundColor Yellow
if ($ActivateCommands) {
    Write-Host "Befehle fuer EEP sind aktiv (POST $baseUrl/send-command -> $(Join-Path (Join-Path $SitePath $ExchangePath) $ExchangeFile))." -ForegroundColor Green
    Write-Host "  Test von diesem Rechner: curl.exe --data-binary `"Befehl`" $baseUrl/send-command"
} else {
    Write-Host "Befehle (POST) sind nicht aktiviert: -ActivateCommands bei der Installation oder --activateCommands beim Serverstart."
}
if ($ProxyGitHub) {
    Write-Host "Proxy aktiv: Bridge und Gleisplan kommen von https://$proxyHost$ProxyPath/ und werden hier ausgeliefert, z.B.:" -ForegroundColor Green
    Write-Host "  $baseUrl/EEP_Export_Bridge?url=/eep_export.json"
    Write-Host "  $baseUrl/EEP_Gleisplan?url=/MeineAnlage.anl3"
}
Write-Host "Danach erreichbar unter: $testBase/daten.json   (WebSocket mit wss statt https)"
Write-Host "Log: $logFile    Deinstallation: .\Install-Python-web-server.ps1 -Uninstall"
Write-Host "Zertifikat: $certCN, Ablage in $certDir"
if (-not $PfxPath) { Write-Host "Zum Import auf anderen Geraeten: $cerPath" }