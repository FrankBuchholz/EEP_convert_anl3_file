#Requires -Version 5.1
<#
.SYNOPSIS
    Installiert und konfiguriert einen Node.js-Webserver unter Windows 11:
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
    - Pruefung zu Beginn: Node.js muss bereits installiert sein, sonst Abbruch (ohne Aenderung)
    - Vorpruefungen (Ports, Parameter) VOR jeder Aenderung
    - Abschlusstests (Ports, CORS, Dateityp-Sperre, Umleitung) mit einem kurzzeitig gestarteten Testserver
    - kein Autostart: der Server wird bei Bedarf mit einem Node-Kommando gestartet
    Fremde Programme und Websites werden nie veraendert oder beendet.
    Der Server selbst (server.js) nutzt nur die Node.js-Standardbibliothek (keine npm-Pakete).
    Bei erneutem Start wird die bestehende Installation auf die aktuellen
    Angaben aktualisiert.
.EXAMPLE
    .\Install-node-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001
.EXAMPLE
    .\Install-node-web-server.ps1 -SitePath C:\EEP17 -HttpPort 3000 -HttpsPort 3001
    (zusaetzlich HTTP-Port 3000 mit Umleitung auf HTTPS)
.EXAMPLE
    .\Install-node-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -AllowNullOrigin
.EXAMPLE
    .\Install-node-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -GitHubOrigins "https://meinname.github.io" -OpenFirewall
.EXAMPLE
    .\Install-node-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -ActivateCommands -AllowNullOrigin
    (Befehle der Bridge erlauben, auch wenn die Bridge als lokale Datei file:// gestartet wird)
.EXAMPLE
    .\Install-node-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -ProxyGitHub
    (Bridge und Gleisplan werden von GitHub Pages geholt und vom lokalen Server ausgeliefert:
     https://localhost:3001/EEP_Export_Bridge?url=/eep_export.json)
.EXAMPLE
    .\Install-node-web-server.ps1 -Uninstall
.NOTES
    Als Administrator in Windows PowerShell 5.1 ausfuehren (nicht PowerShell 7).
    Meldung "nicht digital signiert": Nach dem Download des Skriptes ist die Datei in Windows 11
    als "aus dem Internet" markiert. Die Ausfuehrungsrichtlinie von Windows verlangt dann eine
    Signatur oder eine explizite Freischaltung mit folgendem Befehl:
    Unblock-File .\Install-node-web-server.ps1
    Node.js (Version 18 oder neuer, enthaelt npm) wird NICHT installiert, sondern muss vorhanden sein:
    winget install OpenJS.NodeJS.LTS   oder   https://nodejs.org
    Es wird keine Internetverbindung benoetigt; es werden keine npm-Pakete geladen. Es wird nicht der zu einfache npx verwendet.
    Der EEP-Server und ein anderer Webserver koennen nicht gleichzeitig dieselben Ports nutzen.
    Standard ist -HttpPort 0: Es wird nur der HTTPS-Port geoeffnet, es gibt keinen HTTP-Port und keine Umleitung.
    Die Option -AllowNullOrigin wird nur benoetigt, wenn das Bridge-Programm lokal auf einem Rechner gestartet wird.
    Der Browser sendet dabei die Origin "null" auch bei file://-Seiten, aber ebenso
    bei Seiten in Sandbox-Frames. Die Option gibt die Daten deshalb fuer jede solche Seite frei.
    WebSocket: Die Bridge liest die Datei zuerst per HTTPS und oeffnet dann wss://<Host>:<Port>/<Datei>.json.
    Der Server sendet die komplette Datei sofort und danach nach jeder Aenderung (nur gueltiges JSON, Entprellung).
    Eingebaut mit der Node.js-Standardbibliothek (RFC 6455), es werden keine npm-Pakete benoetigt.
    Befehle fuer EEP (-ActivateCommands, beim Start des Servers auch --activateCommands):
    Der Server nimmt per POST auf /send-command Befehle an (ein Befehl je Zeile, hoechstens 64 KB) und haengt sie als ANSI
    (Windows-1252, so liest EEP) an <SitePath>\<ExchangePath>\<ExchangeFile> an. Ohne Aktivierung antwortet der Server auf POST mit 405.
    Absender ist die Bridge (Seite von GitHub, aus dem lokalen Netz oder aus einer lokalen Datei file://, letzteres nur mit -AllowNullOrigin):
    Die Origin muss erlaubt sein, sonst 403. Anfragen ohne Origin (z.B. curl) werden nur von diesem Rechner angenommen.
    Auf dem HTTP-Port (-HttpPort) werden nie Befehle angenommen. Beispiele von diesem Rechner:
      curl.exe --data-binary "Befehl" https://localhost:3001/send-command
      curl.exe --data-binary "@befehle.txt" https://localhost:3001/send-command
    Die .json-Dateien werden einheitlich als UTF-8 ausgeliefert (liegt die Datei in ANSI vor, wird sie umgewandelt).
    Es gibt keinen Autostart. Der Server wird mit diesem Node-Kommando gestartet:
    & "<Pfad zu node.exe>" "<InstallPath>\server.js"
#>
[CmdletBinding()]
param(
    [string]$SiteName          = "EEP Export", # Name der WebSite
    [string]$SitePath          = "SITEPATH",   # Verzeichnis, das die Daten der WebSite enthaelt, hier also das Installationsverzeichnis von EEP
    [string]$InstallPath       = (Join-Path $env:ProgramData "EEP-Node-Server"),  # server.js, Zertifikat, Log
    [string]$ExchangePath      = "exchange",   # relatives Verzeichnis (unter SitePath), in dem die Kommando-Datei liegt
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

$fwName   = "Node $SiteName"
$serverJs = Join-Path $InstallPath "server.js"
$pkgJson  = Join-Path $InstallPath "package.json"
$certDir  = Join-Path $InstallPath "certs"
$logDir   = Join-Path $InstallPath "logs"
$logFile  = Join-Path $logDir "server.log"
$pfxFile  = Join-Path $certDir "server.pfx"
$passFile = Join-Path $certDir "server.pass"
$cerFile  = Join-Path $certDir "server.cer"

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

# Node.js 18+ im PATH oder unter C:\Program Files\nodejs
function Find-Node {
    $cands = @()
    $cmd = Get-Command node -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { $cands += $cmd.Source }
    $cands += (Join-Path $env:ProgramFiles "nodejs\node.exe")
    foreach ($c in $cands) {
        if ($c -and (Test-Path $c -PathType Leaf)) {
            $r = Invoke-Native $c @("--version")
            if ($r.ExitCode -eq 0 -and $r.Output -match '^v(\d+)\.\d+') {
                return [pscustomobject]@{ Path = $c; Version = $r.Output; Major = [int]$Matches[1] }
            }
        }
    }
    return $null
}

# Prozesse dieses Servers (node.exe mit unserer server.js)
function Get-OwnProcesses {
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
        Where-Object { $_.CommandLine -and $_.CommandLine.Contains($serverJs) }
}

function Stop-OwnServer {
    foreach ($p in @(Get-OwnProcesses)) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }
}

# Vorhandenes selbstsigniertes Zertifikat weiterverwenden, solange es gueltig ist und alle Namen/IPs abdeckt
function Test-ReusableCert([string]$Pass, [string]$Cn, [string[]]$Dns, [string[]]$Ips) {
    if (-not ((Test-Path $pfxFile) -and (Test-Path $passFile))) { return $false }
    try {
        $c = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $pfxFile, $Pass
        if ($c.NotAfter -lt (Get-Date).AddDays(30)) { return $false }
        if ($c.Subject -ne $c.Issuer) { return $false }
        if ((Get-CertCN $c) -ne $Cn) { return $false }   # anderer Name (z.B. frueher "localhost"): neu erzeugen
        $ext = $c.Extensions | Where-Object { $_.Oid.Value -eq "2.5.29.17" } | Select-Object -First 1
        if (-not $ext) { return $false }
        $san = $ext.Format($false)
        foreach ($d in $Dns) { if ($san -notmatch ("(?<![\w.-])" + [regex]::Escape($d) + "(?![\w.-])")) { return $false } }
        foreach ($i in $Ips) { if ($san -notmatch ("(?<![\d.])" + [regex]::Escape($i) + "(?![\d.])")) { return $false } }
        return $true
    } catch { return $false }
}

# ---------------------------------------------------------------- Deinstallation
if ($Uninstall) {
    Write-Host "Deinstallation ..." -ForegroundColor Cyan
    if ($InstallPath -notmatch '^[A-Za-z]:\\.+') { Write-Host "   [FEHLER]  InstallPath ungueltig." -ForegroundColor Red; exit 1 }
    Stop-OwnServer
    Remove-NetFirewallRule -DisplayName $fwName -ErrorAction SilentlyContinue
    if (Test-Path $serverJs) { Remove-Item $InstallPath -Recurse -Force }
    elseif (Test-Path $InstallPath) { Write-Warning "$InstallPath enthaelt keine server.js und wurde nicht geloescht." }
    Write-Host "Entfernt: laufender Server, Firewall-Regel, $InstallPath." -ForegroundColor Green
    Write-Host "Unveraendert: $SitePath, Node.js und das Zertifikat im Windows-Speicher (certlm.msc, Vertrauenswuerdige Stammzertifizierungsstellen)."
    exit 0
}

# ---------------------------------------------------------------- Node.js-Pruefung (zu Beginn; Abbruch ohne Aenderung)
Write-Host "Pruefe Node.js ..." -ForegroundColor Cyan
$node = Find-Node
if (-not $node) {
    Write-Host "   [FEHLER]  Node.js (node.exe) wurde nicht gefunden." -ForegroundColor Red
    Write-Host "             Node.js LTS installieren (winget install OpenJS.NodeJS.LTS oder https://nodejs.org)," -ForegroundColor Red
    Write-Host "             danach eine neue PowerShell als Administrator oeffnen und das Skript erneut starten." -ForegroundColor Red
    Write-Host "`nAbbruch: Es wurde nichts veraendert." -ForegroundColor Red
    exit 1
}
if ($node.Major -lt 18) {
    Write-Host "   [FEHLER]  Node.js $($node.Version) ($($node.Path)) ist zu alt. Benoetigt wird Version 18 oder neuer." -ForegroundColor Red
    Write-Host "`nAbbruch: Es wurde nichts veraendert." -ForegroundColor Red
    exit 1
}
Write-Host "   [OK]      Node.js $($node.Version): $($node.Path)" -ForegroundColor Green

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
    $errors.Add("InstallPath muss ein lokaler absoluter Pfad sein (z.B. C:\ProgramData\EEP-Node-Server).")
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
# ---------------------------------------------------------------- 1. Node.js
Write-Host "1/6 Node.js ..." -ForegroundColor Cyan
Write-Host "   Verwendet: $($node.Path) ($($node.Version))"

# ---------------------------------------------------------------- 2. Verzeichnisse
Write-Host "2/6 Verzeichnisse ..." -ForegroundColor Cyan
Stop-OwnServer      # laufende eigene Instanz beenden (Dateien werden ersetzt)
foreach ($d in $InstallPath, $certDir, $logDir) { New-Item -ItemType Directory -Path $d -Force | Out-Null }

# Es gibt keinen Dienst: Der Server laeuft unter dem Konto, das ihn startet (dieses Konto).
# Zertifikat und privater Schluessel nur fuer System, Administratoren und dieses Konto
$me = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$r = Invoke-Native "icacls" @($logDir, "/grant", "*${me}:(OI)(CI)M", "/Q")
if ($r.ExitCode -ne 0) { throw "Rechte fuer $logDir konnten nicht gesetzt werden: $($r.Output)" }
$r = Invoke-Native "icacls" @($certDir, "/inheritance:r", "/grant", "*S-1-5-18:(OI)(CI)F", "*S-1-5-32-544:(OI)(CI)F", "*${me}:(OI)(CI)F", "/Q")
if ($r.ExitCode -ne 0) { throw "Rechte fuer $certDir konnten nicht gesetzt werden: $($r.Output)" }

# ---------------------------------------------------------------- 3. Konfiguration + Zertifikat
Write-Host "3/6 Konfiguration und Zertifikat ..." -ForegroundColor Cyan
$ips = @(Get-NetIPAddress -AddressFamily IPv4 |
         Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*" } |
         Select-Object -ExpandProperty IPAddress)
$dnsNames = @("localhost", $env:COMPUTERNAME, "$env:COMPUTERNAME.local")
$ipList   = @("127.0.0.1") + $ips
$config = [ordered]@{
    site_name         = $SiteName
    site_path         = $SitePath
    exchange_path     = $ExchangePath
    exchange_file     = $ExchangeFile
    http_port         = $HttpPort
    https_port        = $HttpsPort
    github_origins    = @($GitHubOrigins | Where-Object { $_ -notmatch "USERNAME" } | ForEach-Object { $_.TrimEnd("/") })
    computer_name     = $env:COMPUTERNAME
    allow_null_origin = [bool]$AllowNullOrigin
    activate_commands = [bool]$ActivateCommands
    proxy_github      = [bool]$ProxyGitHub
    proxy_host        = $proxyHost
    proxy_path        = $ProxyPath
    pfx_file          = $pfxFile
    pass_file         = $passFile
    cer_file          = $cerFile
    log_file          = $logFile
}
Write-Utf8NoBom (Join-Path $InstallPath "config.json") ($config | ConvertTo-Json -Depth 4)

$certCN     = Get-CertCommonName "Node.js"   # sprechender Name (CN) des selbst erzeugten Zertifikats
$certReused = $false
$oldThumb = $null
if (Test-Path $cerFile) {
    try { $oldThumb = (New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $cerFile).Thumbprint } catch { }
}

if ($PfxPath) {
    # Eigenes Zertifikat: PFX kopieren, Passwort im geschuetzten Zertifikatsordner ablegen
    $plainPw = ""
    if ($PfxPassword) {
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($PfxPassword)
        try { $plainPw = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
        finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    }
    try {
        $c = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $PfxPath, $plainPw
    } catch { throw "PFX-Datei konnte nicht gelesen werden (Passwort richtig?): $($_.Exception.Message)" }
    if (-not $c.HasPrivateKey) { throw "Die PFX-Datei enthaelt kein Zertifikat mit privatem Schluessel." }
    if ($c.NotAfter -lt (Get-Date)) { throw "Das Zertifikat aus der PFX-Datei ist abgelaufen ($($c.NotAfter))." }
    Copy-Item $PfxPath $pfxFile -Force
    Write-Utf8NoBom $passFile $plainPw
    [IO.File]::WriteAllBytes($cerFile, $c.Export("Cert"))
    $plainPw = $null
    Write-Host "   PFX-Zertifikat uebernommen"
} else {
    $pw = ""
    if (Test-Path $passFile) { $pw = [IO.File]::ReadAllText($passFile) }
    if (Test-ReusableCert $pw $certCN $dnsNames $ipList) {
        $certReused = $true
        Write-Host "   vorhandenes Zertifikat weiterverwendet"
    } else {
        # Neues selbstsigniertes Zertifikat: erzeugen, als PFX exportieren (fuer Node.js), aus dem Windows-Speicher entfernen
        $bytes = New-Object byte[] 24
        $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
        $rng.GetBytes($bytes); $rng.Dispose()
        $pw = [Convert]::ToBase64String($bytes)
        $san = @($dnsNames | ForEach-Object { "DNS=$_" }) + @($ipList | ForEach-Object { "IPAddress=$_" })
        $cert = New-SelfSignedCertificate -Subject "CN=$certCN" -FriendlyName $certCN `
            -CertStoreLocation Cert:\LocalMachine\My -KeyAlgorithm RSA -KeyLength 2048 `
            -HashAlgorithm SHA256 -KeyExportPolicy Exportable -NotAfter (Get-Date).AddYears(2) `
            -TextExtension @("2.5.29.17={text}" + ($san -join "&"))
        try {
            Export-PfxCertificate -Cert $cert -FilePath $pfxFile -Password (ConvertTo-SecureString $pw -AsPlainText -Force) `
                -CryptoAlgorithmOption AES256_SHA256 | Out-Null
            Export-Certificate -Cert $cert -FilePath $cerFile | Out-Null
        } finally {
            Remove-Item "Cert:\LocalMachine\My\$($cert.Thumbprint)" -Force -ErrorAction SilentlyContinue
        }
        Write-Utf8NoBom $passFile $pw
        Write-Host "   neues selbstsigniertes Zertifikat erzeugt"
    }
}

# Kann Node.js das Zertifikat lesen?
$js = "const fs=require('fs'),tls=require('tls');const p=fs.readFileSync(process.argv[1],'utf8').replace(/^\uFEFF/,'');const o={pfx:fs.readFileSync(process.argv[2])};if(p!=='')o.passphrase=p;tls.createSecureContext(o);"
$r = Invoke-Native $node.Path @("-e", $js, $passFile, $pfxFile)
if ($r.ExitCode -ne 0) { throw "Node.js kann das Zertifikat nicht lesen: $($r.Output)" }

if (-not $PfxPath) {
    # Auf diesem PC als vertrauenswuerdig eintragen und .cer fuer andere Geraete bereitstellen
    $baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    $cerPath = Join-Path $baseDir "$certCN.cer" # "$SiteName.cer"
    Copy-Item $cerFile $cerPath -Force
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

$shownCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $cerFile
$certTitle = if ($PfxPath) { "Zertifikat: eigenes Zertifikat (PFX) uebernommen" }
             elseif ($certReused) { "Zertifikat: vorhandenes Zertifikat wird weiterverwendet" }
             else { "Zertifikat: neu erzeugt (selbstsigniert)" }
Show-CertInfo $shownCert $certTitle
Write-Host "   Ablage:" -ForegroundColor Cyan
Write-Host "      Server (Zertifikat + Schluessel): $pfxFile (Passwort in $passFile)"
Write-Host "      oeffentlicher Teil (.cer):        $cerFile"
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
#!/usr/bin/env node
'use strict';
/*
 * EEP Export - schlanker HTTPS-Server (nur Node.js-Standardbibliothek).
 *
 * Liefert ausschliesslich .json und .anl3 aus (GET, HEAD, OPTIONS), mit CORS,
 * HSTS und (optional, nur bei http_port > 0) HTTP->HTTPS-Umleitung.
 * WebSocket (wss://, gleiche URL wie die Datei): sendet die Datei beim Verbinden und nach jeder Aenderung.
 * Optional (--activateCommands oder activate_commands in config.json): POST /send-command haengt Befehle fuer EEP als ANSI an eine Datei an.
 * Optional (proxy_github in config.json): alles, was keine lokale .json/.anl3-Datei ist, wird per GET/HEAD von proxy_host unter proxy_path geholt.
 * Konfiguration: config.json neben dieser Datei
 * (wird von Install-node-web-server.ps1 erzeugt).
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

function readText(file) { return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''); }
const CFG = JSON.parse(readText(path.join(__dirname, 'config.json')));

const SITE_ROOT = fs.realpathSync(CFG.site_path);
const HTTP_PORT = parseInt(CFG.http_port, 10) || 0;
const HTTPS_PORT = parseInt(CFG.https_port, 10);
const ALLOWED_TYPES = { '.json': 'application/json', '.anl3': 'application/octet-stream' };
// Befehle fuer EEP: POST /send-command (nur mit -ActivateCommands bei der Installation ("activate_commands" in config.json)
// oder --activateCommands beim Start). Ohne Aktivierung antwortet der Server auf POST mit 405.
const ACTIVATE_COMMANDS = !!CFG.activate_commands || process.argv.slice(2).some(a => /^--?activatecommands$/i.test(a));
const POST_PATH = '/send-command';
const POST_MAX_BYTES = 65536;     // groesster erlaubter Body
const POST_MAX_LINE = 500;        // laengste erlaubte Zeile
const EXCHANGE_DIR = path.resolve(SITE_ROOT, CFG.exchange_path || '');
const EXCHANGE_FILE = path.join(EXCHANGE_DIR, CFG.exchange_file || 'commands-to-eep.txt');
const ALLOWED_METHODS = ACTIVATE_COMMANDS ? 'GET, HEAD, OPTIONS, POST' : 'GET, HEAD, OPTIONS';
if (ACTIVATE_COMMANDS) {
  const rel = path.relative(SITE_ROOT, EXCHANGE_DIR);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) {
    console.error('exchange_path liegt ausserhalb von site_path: ' + EXCHANGE_DIR);
    process.exit(1);
  }
}
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Erlaubte Origins: localhost, private Netze (10.x, 172.16-31.x, 192.168.x), *.local, PC-Name, GitHub
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let ghList = CFG.github_origins || [];
if (typeof ghList === 'string') ghList = [ghList];
const ghAlt = ghList.map(o => esc(String(o).replace(/\/+$/, ''))).join('|');
const lan = 'localhost|127\\.0\\.0\\.1|\\[::1\\]|10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|192\\.168\\.\\d{1,3}\\.\\d{1,3}'
  + '|172\\.(1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3}|[a-z0-9-]+\\.local|' + esc(CFG.computer_name);
const ALLOW_NULL = !!CFG.allow_null_origin;   // Origin "null": Seite wird aus einer lokalen Datei (file://) geoeffnet
const ORIGIN_RE = new RegExp('^(?:https?://(?:' + lan + ')(?::\\d+)?' + (ghAlt ? '|' + ghAlt : '') + ')$', 'i');
// Lokale Datei (file://): CORS-Anfragen senden die Origin "null", Chrome sendet bei WebSockets "file://"
const originAllowed = origin => origin !== '' && (ORIGIN_RE.test(origin) || (ALLOW_NULL && (origin === 'null' || origin === 'file://')));

// Anfrage kommt von diesem Rechner (127.x, ::1, auch als ::ffff:127.0.0.1)
function isLoopback(addr) {
  addr = String(addr || '').replace(/%.*$/, '').toLowerCase();
  if (addr.startsWith('::ffff:')) addr = addr.slice(7);
  return addr === '::1' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(addr);
}

// Windows-1252 (ANSI): Zeichen 0x80..0x9F, der Rest entspricht Latin-1. EEP liest und schreibt ANSI.
const CP1252 = '\u20AC\u0081\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u008D\u017D\u008F\u0090\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u009D\u017E\u0178';
// Gueltiges UTF-8 bleibt, sonst wird ANSI (Windows-1252) angenommen
function decodeText(buf) {
  let t;
  try { t = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch (e) { t = buf.toString('latin1').replace(/[\x80-\x9f]/g, c => CP1252.charAt(c.charCodeAt(0) - 0x80)); }
  return t.replace(/^\uFEFF/, '');
}
// Text als ANSI kodieren; null, wenn ein Zeichen nicht darstellbar ist
function encodeAnsi(str) {
  const out = Buffer.alloc(str.length);
  let n = 0;
  for (const ch of str) {
    const c = ch.codePointAt(0);
    if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) { out[n++] = c; continue; }
    const i = CP1252.indexOf(ch);
    if (i < 0 || i === 1 || i === 13 || i === 15 || i === 16 || i === 29) return null;   // 0x81, 0x8D, 0x8F, 0x90, 0x9D sind in Windows-1252 nicht belegt
    out[n++] = 0x80 + i;
  }
  return out.subarray(0, n);
}

// ---- Log (eine Datei, bei ueber 1 MB wird sie nach server.log.1 verschoben)
function clean(text) { return String(text).replace(/[^\x20-\x7e]/g, '?'); }
// Farben fuer die Konsole (ANSI), wie im Python-Server: INFO grau, WARNING gelb, ERROR rot, CRITICAL fett rot
const COLORS = { INFO: '\x1b[90m', WARNING: '\x1b[93m', ERROR: '\x1b[91m', CRITICAL: '\x1b[1;91m' };
const RESET = '\x1b[0m';
const USE_COLOR = !!process.stdout.isTTY && !process.env.NO_COLOR;
function log(msg, level) {
  level = level || 'INFO';
  // Zeitstempel fuer die einheitliche Formatierung in Datei und Konsole
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  // Ausgabe in der Konsole: Zeit normal, Level farbig, Nachricht normal
  const tag = '[' + level + ']';
  console.log(timestamp + ' ' + (USE_COLOR ? (COLORS[level] || COLORS.INFO) + tag + RESET : tag) + ' ' + msg);
  // Ausgabe in der Datei (ohne Farbcodes)
  try {
    try { if (fs.statSync(CFG.log_file).size > 1000000) fs.renameSync(CFG.log_file, CFG.log_file + '.1'); } catch (e) { /* noch keine Datei */ }
    fs.appendFileSync(CFG.log_file, timestamp + ' ' + tag + ' ' + msg + '\n');
  } catch (e) { /* Logfehler ignorieren */ }
}

// ---- Header: Sicherheit + CORS (nur fuer erlaubte Origins)
function headersFor(req, extra) {
  const origin = String(req.headers['origin'] || '');
  const ok = originAllowed(origin);
  const pna = String(req.headers['access-control-request-private-network'] || '').toLowerCase() === 'true';
  const h = Object.assign({
    'Strict-Transport-Security': 'max-age=31536000',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin',
    'Server': 'EEP-Export'
  }, extra || {});
  if (ok) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = ALLOWED_METHODS;
    h['Access-Control-Allow-Headers'] = 'Content-Type, Accept';
    if (pna) h['Access-Control-Allow-Private-Network'] = 'true';   // nur wenn der Browser es per Preflight anfragt
  }
  return h;
}

// ---- Pfad pruefen: gibt den Dateipfad zurueck oder null, wenn die Anfrage nicht erlaubt ist
function resolvePath(rawUrl) {
  let p = rawUrl.split('?')[0].split('#')[0];
  try { p = decodeURIComponent(p); } catch (e) { return null; }
  if (p.charAt(0) !== '/' || p.indexOf('\0') >= 0 || p.indexOf('\\') >= 0 || p.indexOf(':') >= 0) return null;
  const parts = p.split('/');
  for (const s of parts) {
    if (s === '..' || (s && (s.endsWith('.') || s.endsWith(' ')))) return null;
  }
  if (!has(ALLOWED_TYPES, path.extname(parts[parts.length - 1]).toLowerCase())) return null;
  let full;
  try { full = fs.realpathSync(path.join(SITE_ROOT, ...parts.filter(Boolean))); } catch (e) { return null; }
  const rel = path.relative(SITE_ROOT, full);
  if (rel === '' || rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) return null;
  if (!has(ALLOWED_TYPES, path.extname(full).toLowerCase())) return null;
  try { if (!fs.statSync(full).isFile()) return null; } catch (e) { return null; }
  return full;
}

function notFound(req, res) {
  const body = 'Not Found';
  res.writeHead(404, headersFor(req, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }));
  res.end(req.method === 'HEAD' ? undefined : body);
}

// ---- Proxy (nur mit -ProxyGitHub): Seiten von GitHub Pages holen und selbst ausliefern
// Ziel fest: https://<proxy_host><proxy_path>/... Nur GET/HEAD, keine Cookies/Origin/Referer an GitHub, Redirects nur innerhalb desselben Hosts.
// .json/.anl3 werden nie von GitHub geholt, ausser unter proxy_path (dort zuerst lokal, z.B. relative URL "eep_export.json" der Bridge).
const PROXY = !!CFG.proxy_github && /^[A-Za-z0-9.-]+$/.test(String(CFG.proxy_host || ''));
const PROXY_HOST = PROXY ? String(CFG.proxy_host) : '';
const PROXY_PATH = PROXY ? String(CFG.proxy_path || '').replace(/\/+$/, '') : '';
const PROXY_PASS = ['accept', 'accept-language', 'user-agent', 'if-none-match', 'if-modified-since'];
const PROXY_KEEP = ['content-type', 'content-length', 'last-modified', 'etag', 'cache-control', 'expires'];

// Pfad auf dem Ziel: /EEP_Gleisplan -> <proxy_path>/EEP_Gleisplan.html, /css/x.css -> <proxy_path>/css/x.css; null = nicht erlaubt
function proxyTarget(rawUrl) {
  const raw = String(rawUrl).split('#')[0];
  const qi = raw.indexOf('?');
  let p = qi >= 0 ? raw.slice(0, qi) : raw;
  const q = qi >= 0 ? raw.slice(qi) : '';
  let dec;
  try { dec = decodeURIComponent(p); } catch (e) { return null; }
  if (p.charAt(0) !== '/' || p.startsWith('//') || /[\x00-\x1f\x7f\\]/.test(dec) || dec.split('/').includes('..')) return null;
  if (!/^[\x21-\x7e]*$/.test(p + q)) return null;
  if (dec === PROXY_PATH) { p = PROXY_PATH + '/'; dec = p; }
  else if (!dec.startsWith(PROXY_PATH + '/')) { p = PROXY_PATH + p; dec = PROXY_PATH + dec; }
  const last = dec.split('/').pop();
  if (last !== '' && last.indexOf('.') < 0) p += '.html';
  return p + q;
}

function proxyFail(req, res, code) {
  const body = http.STATUS_CODES[code] || String(code);
  res.writeHead(code, headersFor(req, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': Buffer.byteLength(body) }));
  res.end(req.method === 'HEAD' ? undefined : body);
}

function proxy(req, res) {
  const target = proxyTarget(req.url || '/');
  if (!target) return notFound(req, res);
  const headers = { 'accept-encoding': 'identity' };
  for (const k of PROXY_PASS) if (req.headers[k]) headers[k] = req.headers[k];
  const up = https.request({ host: PROXY_HOST, port: 443, method: req.method, path: target, headers: headers, timeout: 15000 }, ur => {
    const sc = ur.statusCode;
    if (sc === 301 || sc === 302 || sc === 307 || sc === 308) {
      let loc = String(ur.headers['location'] || '');
      const pre = 'https://' + PROXY_HOST;
      if (loc.startsWith(pre + '/')) loc = loc.slice(pre.length);
      ur.resume();
      if (loc.charAt(0) !== '/' || loc.startsWith('//') || !/^[\x21-\x7e]+$/.test(loc)) return proxyFail(req, res, 502);   // nie auf fremde Hosts umleiten
      res.writeHead(302, headersFor(req, { 'Location': loc, 'Content-Length': '0' }));
      return res.end();
    }
    if (sc === 200 || sc === 304) {
      const extra = {};
      for (const k of PROXY_KEEP) if (ur.headers[k]) extra[k] = ur.headers[k];
      res.writeHead(sc, headersFor(req, extra));
      return ur.pipe(res);
    }
    ur.resume();
    return sc === 404 ? notFound(req, res) : proxyFail(req, res, 502);
  });
  up.on('timeout', () => up.destroy(new Error('Zeitueberschreitung')));
  up.on('error', e => {
    log('Proxy-Fehler (' + PROXY_HOST + '): ' + clean(e && e.message), 'WARNING');
    if (!res.headersSent) proxyFail(req, res, 502); else res.destroy();
  });
  up.end();
}

function proxyOrLocal(req, res) {
  const rawUrl = String(req.url || '/');
  let dec;
  try { dec = decodeURIComponent(rawUrl.split('?')[0].split('#')[0]); } catch (e) { return notFound(req, res); }
  const dataType = has(ALLOWED_TYPES, path.extname(dec.split('/').pop()).toLowerCase());
  const under = rawUrl.startsWith(PROXY_PATH + '/');
  if (dataType && !under) return notFound(req, res);               // Daten nur lokal
  if (dataType) {
    const local = resolvePath(rawUrl.slice(PROXY_PATH.length));    // <proxy_path>/eep_export.json -> <SitePath>/eep_export.json
    if (local) return serveFile(req, res, local);
  }
  return proxy(req, res);
}

// ---- POST /send-command: Befehle fuer EEP (nur mit --activateCommands)
function handlePost(req, res) {
  const addr = req.socket.remoteAddress || '';
  const reply = (code, text) => {
    const body = text || http.STATUS_CODES[code] || String(code);
    res.writeHead(code, headersFor(req, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Connection': 'close' }));
    res.end(body);
  };
  const declared = req.headers['content-length'] === undefined ? -1 : parseInt(req.headers['content-length'], 10);
  const chunks = [];
  const done = () => {
    const url = String(req.url || '');
    if (url.split('?')[0] !== POST_PATH) return reply(404);
    const origin = req.headers['origin'];
    if (origin !== undefined) {
      // Browser (Bridge): die Origin muss erlaubt sein, gleiche Regeln wie bei CORS und WebSocket
      if (!originAllowed(String(origin))) {
        log(addr + ' "POST ' + clean(url) + '" 403 Forbidden (Origin: ' + (clean(origin) || 'leer') + (ALLOW_NULL ? '' : ', file:// und null nur mit -AllowNullOrigin') + ')', 'WARNING');
        return reply(403);
      }
    } else if (!isLoopback(addr)) {
      // kein Browser (z.B. curl): nur von diesem Rechner
      log(addr + ' "POST ' + clean(url) + '" 403 Forbidden (ohne Origin nur von diesem Rechner)', 'WARNING');
      return reply(403);
    }
    if (!(declared >= 0)) return reply(411);
    if (declared > POST_MAX_BYTES) return reply(413);
    if (declared === 0) return reply(400);
    const text = decodeText(Buffer.concat(chunks));        // UTF-8 (Bridge), sonst ANSI (z.B. curl in der Windows-Konsole)
    const lines = text.split(/\r\n|[\r\n\v\f\x1c-\x1e\x85\u2028\u2029]/).map(l => l.trim()).filter(l => l !== '');
    if (lines.length === 0 || lines.some(l => l.length > POST_MAX_LINE || /[\x00-\x08\x0b-\x1f\x7f]/.test(l))) return reply(400, 'Ungueltige Zeilen');
    const data = encodeAnsi(lines.map(l => l + '\r\n').join(''));   // EEP liest ANSI
    if (data === null) return reply(400, 'Zeichen nicht in ANSI (Windows-1252) darstellbar');
    try {
      fs.mkdirSync(EXCHANGE_DIR, { recursive: true });
      fs.appendFileSync(EXCHANGE_FILE, data);               // synchron: gleichzeitige Anfragen mischen sich nicht
    } catch (e) {
      log('Fehler beim Schreiben der Kommando-Datei: ' + clean(e && e.message), 'ERROR');
      return reply(500);
    }
    const body = JSON.stringify({ status: 'success', lines: lines.length });
    res.writeHead(200, headersFor(req, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Connection': 'close' }));
    res.end(body);
    log(addr + ' ' + lines.length + ' Befehl(e) von Origin ' + (origin !== undefined ? clean(origin) : '(ohne)') + ' nach ' + clean(EXCHANGE_FILE) + ' geschrieben');
  };
  // Body zuerst lesen (bis zur Obergrenze), damit eine Ablehnung nicht an einer zurueckgesetzten Verbindung scheitert
  if (declared >= 0 && declared <= POST_MAX_BYTES) {
    req.on('data', c => chunks.push(c));
    req.on('end', done);
    req.on('error', () => { /* Verbindungsabbruch des Clients ignorieren */ });
  } else {
    req.resume();
    done();
  }
}

function handle(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headersFor(req, { 'Allow': ALLOWED_METHODS, 'Access-Control-Max-Age': '600', 'Content-Length': '0' }));
    return res.end();
  }
  if (req.method === 'POST' && ACTIVATE_COMMANDS) return handlePost(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, headersFor(req, { 'Allow': ALLOWED_METHODS, 'Content-Length': '0', 'Connection': 'close' }));
    return res.end();
  }
  const full = resolvePath(req.url || '/');
  if (full) return serveFile(req, res, full);
  if (PROXY) return proxyOrLocal(req, res);
  return notFound(req, res);
}

function serveFile(req, res, full) {
  // Datei komplett lesen: EEP schreibt die Exportdatei laufend neu, so passen Content-Length und Inhalt immer zusammen
  fs.readFile(full, (err, buf) => {
    if (err) return notFound(req, res);
    const ext = path.extname(full).toLowerCase();
    let type = ALLOWED_TYPES[ext];
    if (ext === '.json') { buf = Buffer.from(decodeText(buf), 'utf8'); type += '; charset=utf-8'; }   // einheitlich UTF-8 ausliefern
    let mtime = new Date();
    try { mtime = fs.statSync(full).mtime; } catch (e) { /* aktuelle Zeit */ }
    res.writeHead(200, headersFor(req, {
      'Content-Type': type,
      'Content-Length': buf.length,
      'Last-Modified': mtime.toUTCString(),
      'Cache-Control': 'no-cache'
    }));
    res.end(req.method === 'HEAD' ? undefined : buf);
  });
}

// ---- Port HTTP: leitet alles dauerhaft auf HTTPS um (nur wenn http_port > 0)
function redirect(req, res) {
  const host = String(req.headers['host'] || 'localhost').trim();
  let name = host.startsWith('[') ? host.split(']')[0] + ']' : host.split(':')[0];
  if (!/^(?:[A-Za-z0-9.\-]+|\[[0-9A-Fa-f:.]+\])$/.test(name)) name = 'localhost';
  const port = HTTPS_PORT === 443 ? '' : ':' + HTTPS_PORT;
  let p = String(req.url || '/');
  if (p.charAt(0) !== '/') p = '/';
  p = p.replace(/[^\x21-\x7e]/g, '');
  res.writeHead(301, headersFor(req, { 'Location': 'https://' + name + port + p, 'Content-Length': '0' }));
  res.end();
}

// ---- WebSocket (RFC 6455, nur Standardbibliothek)
// Die Bridge liest die Datei zuerst per HTTPS und verbindet sich dann mit wss://host:port/<Datei>.
// Der Server sendet die Datei sofort und danach bei jeder Aenderung. Browser pruefen bei WebSockets kein CORS,
// deshalb wird die Origin hier selbst geprueft (gleiche Regeln wie bei CORS).
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const WS_MAX_CLIENTS = 50;
const WS_MAX_IN = 65536;          // groesster erlaubter eingehender Frame (der Client sendet nichts Wichtiges)
const WS_MAX_BACKLOG = 8 * 1024 * 1024;   // Client, der so viel nicht abnimmt, wird getrennt
const WS_PING_MS = 25000;
const WS_POLL_MS = 2000;          // Sicherheitsnetz, falls fs.watch eine Aenderung nicht meldet
const wsClients = new Set();
const watches = new Map();        // Dateipfad -> { full, json, clients, last, timer, watcher, poll, sig, retry }

function wsFrame(opcode, payload) {
  const len = payload.length;
  let head;
  if (len < 126) { head = Buffer.alloc(2); head[1] = len; }
  else if (len < 65536) { head = Buffer.alloc(4); head[1] = 126; head.writeUInt16BE(len, 2); }
  else { head = Buffer.alloc(10); head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
  head[0] = 0x80 | opcode;
  return Buffer.concat([head, payload]);
}

function wsPush(c, frame) {
  if (c.closed) return;
  if (c.socket.writableLength > WS_MAX_BACKLOG) {
    log(c.addr + ' WebSocket-Client nimmt Daten zu langsam ab, getrennt', 'WARNING');
    return c.socket.destroy();
  }
  c.socket.write(frame);
}

function wsDrop(c) {
  if (c.closed) return;
  c.closed = true;
  watchRemove(c);
  wsClients.delete(c);
  log(c.addr + ' WebSocket beendet ' + c.url + ' (' + wsClients.size + ' offen)');
}

function wsClose(c, code) {
  if (c.closed) return;
  wsDrop(c);
  try {
    const p = Buffer.alloc(2); p.writeUInt16BE(code || 1000, 0);
    c.socket.write(wsFrame(0x8, p));
    c.socket.end();
  } catch (e) { /* Socket schon weg */ }
  setTimeout(() => c.socket.destroy(), 2000).unref();
}

function wsOnData(c, chunk) {
  c.alive = true;
  c.buf = Buffer.concat([c.buf, chunk]);
  while (c.buf.length >= 2 && !c.closed) {
    const b0 = c.buf[0], b1 = c.buf[1];
    const fin = (b0 & 0x80) !== 0, opcode = b0 & 0x0f, masked = (b1 & 0x80) !== 0;
    if (b0 & 0x70) return wsClose(c, 1002);
    if (!masked) return wsClose(c, 1002);              // Frames vom Client muessen maskiert sein
    let len = b1 & 0x7f, off = 2;
    if (len === 126) { if (c.buf.length < 4) return; len = c.buf.readUInt16BE(2); off = 4; }
    else if (len === 127) {
      if (c.buf.length < 10) return;
      const big = c.buf.readBigUInt64BE(2);
      if (big > BigInt(WS_MAX_IN)) return wsClose(c, 1009);
      len = Number(big); off = 10;
    }
    if (len > WS_MAX_IN) return wsClose(c, 1009);
    if (c.buf.length < off + 4 + len) return;
    const mask = c.buf.subarray(off, off + 4);
    const data = Buffer.from(c.buf.subarray(off + 4, off + 4 + len));
    for (let i = 0; i < len; i++) data[i] ^= mask[i & 3];
    c.buf = c.buf.subarray(off + 4 + len);
    if (opcode >= 0x8 && (!fin || len > 125)) return wsClose(c, 1002);
    if (opcode === 0x8) return wsClose(c, 1000);
    if (opcode === 0x9) wsPush(c, wsFrame(0xA, data)); // Ping -> Pong
    // Text, Binary, Pong: nichts zu tun
  }
}

// ---- Datei ueberwachen: ein Watcher pro Datei, egal wie viele Clients
function watchAdd(full, c) {
  let w = watches.get(full);
  if (!w) {
    w = { full: full, json: path.extname(full).toLowerCase() === '.json', clients: new Set(), last: null, timer: null, watcher: null, poll: null, sig: '', retry: 0 };
    const dir = path.dirname(full), base = path.basename(full).toLowerCase();
    try {
      // Verzeichnis statt Datei ueberwachen: EEP kann die Datei neu anlegen oder ersetzen
      w.watcher = fs.watch(dir, { persistent: true }, (ev, name) => {
        if (!name || String(name).toLowerCase() === base) watchSchedule(w, 80);
      });
      w.watcher.on('error', e => log('Dateiueberwachung: ' + clean(e && e.message), 'WARNING'));
    } catch (e) { log('fs.watch nicht moeglich, nur Abfrage alle ' + WS_POLL_MS + ' ms: ' + clean(e && e.message), 'WARNING'); }
    w.poll = setInterval(() => {
      fs.stat(full, (err, st) => {
        if (err) return;
        const sig = st.mtimeMs + ':' + st.size;
        if (sig !== w.sig) { w.sig = sig; watchSchedule(w, 0); }
      });
    }, WS_POLL_MS);
    watches.set(full, w);
    log('Ueberwache ' + full);
  }
  w.clients.add(c);
  c.watch = w;
  watchRead(w, c);                  // aktuellen Stand sofort an den neuen Client
}

function watchRemove(c) {
  const w = c.watch;
  if (!w) return;
  c.watch = null;
  w.clients.delete(c);
  if (w.clients.size === 0) {
    clearTimeout(w.timer);
    clearInterval(w.poll);
    if (w.watcher) { try { w.watcher.close(); } catch (e) { /* ignorieren */ } }
    watches.delete(w.full);
    log('Ueberwachung beendet ' + w.full);
  }
}

// Entprellung: EEP schreibt die Datei evtl. in mehreren Schritten, fs.watch meldet mehrfach
function watchSchedule(w, ms) {
  clearTimeout(w.timer);
  w.timer = setTimeout(() => watchRead(w, null), ms);
}

// Datei lesen und senden. Unvollstaendiges JSON (EEP schreibt gerade) wird nicht gesendet, sondern kurz spaeter erneut gelesen.
// target = neuer Client, der den Stand auch dann bekommt, wenn er sich nicht geaendert hat.
function watchRead(w, target) {
  fs.readFile(w.full, (err, data) => {
    if (err) return;
    const text = decodeText(data);          // UTF-8, sonst ANSI
    if (w.json) {
      try { JSON.parse(text); w.retry = 0; }
      catch (e) { if (w.retry++ < 10) watchSchedule(w, 150); return; }
    }
    const changed = text !== w.last;
    w.last = text;
    if (!changed && !(target && w.clients.has(target))) return;
    const frame = wsFrame(0x1, Buffer.from(text, 'utf8'));
    if (changed) for (const c of w.clients) wsPush(c, frame);
    else wsPush(target, frame);
  });
}

function onUpgrade(req, socket, head) {
  socket.on('error', () => { /* Verbindungsabbruch des Clients ignorieren */ });
  const addr = req.socket.remoteAddress;
  const deny = (code, text, detail) => {
    log(addr + ' "WS ' + clean(req.url) + '" ' + code + ' ' + text + (detail || ''), 'WARNING');
    socket.end('HTTP/1.1 ' + code + ' ' + text + '\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
  };
  const key = String(req.headers['sec-websocket-key'] || '');
  if (req.method !== 'GET' || String(req.headers['upgrade'] || '').toLowerCase() !== 'websocket'
      || !/\bupgrade\b/i.test(String(req.headers['connection'] || ''))
      || req.headers['sec-websocket-version'] !== '13' || !/^[A-Za-z0-9+/]{22}==$/.test(key)) return deny(400, 'Bad Request');
  const origin = String(req.headers['origin'] || '');
  if (!originAllowed(origin)) return deny(403, 'Forbidden', ' (Origin: ' + (clean(origin) || 'fehlt') + (ALLOW_NULL ? '' : ', file:// und null nur mit -AllowNullOrigin') + ')');
  const full = resolvePath(req.url || '/');          // gleiche Regeln wie bei HTTP: nur .json und .anl3
  if (!full) return deny(404, 'Not Found');
  if (wsClients.size >= WS_MAX_CLIENTS) return deny(503, 'Service Unavailable');

  const accept = crypto.createHash('sha1').update(key + WS_GUID).digest('base64');
  socket.setTimeout(0);                              // der Timeout des HTTP-Servers gilt nicht fuer den Socket
  socket.setNoDelay(true);
  socket.setKeepAlive(true, 30000);
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');

  const c = { socket: socket, buf: Buffer.alloc(0), alive: true, closed: false, watch: null, addr: addr, url: clean(req.url) };
  wsClients.add(c);
  socket.on('data', d => wsOnData(c, d));
  socket.on('close', () => wsDrop(c));
  socket.on('end', () => wsClose(c, 1000));
  log(addr + ' "WS ' + c.url + '" 101 (' + wsClients.size + ' offen)');
  watchAdd(full, c);
  if (head && head.length) wsOnData(c, head);
}

// Ping an alle Clients; wer seit dem letzten Ping nichts von sich hoeren liess, wird getrennt
function wsStartPing() {
  setInterval(() => {
    for (const c of Array.from(wsClients)) {
      if (!c.alive) { c.socket.destroy(); continue; }
      c.alive = false;
      wsPush(c, wsFrame(0x9, Buffer.alloc(0)));
    }
  }, WS_PING_MS).unref();
}

function logged(fn) {
  return (req, res) => {
    res.on('finish', () => log(req.socket.remoteAddress + ' "' + req.method + ' ' + clean(req.url) + '" ' + res.statusCode));
    try { fn(req, res); } catch (e) {
      log('Fehler bei Anfrage: ' + clean(e && e.message), 'ERROR');
      if (!res.headersSent) { res.writeHead(500, { 'Content-Length': '0' }); }
      res.end();
    }
  };
}

function prepare(server) {
  server.setTimeout(30000);
  server.keepAliveTimeout = 5000;
  server.on('clientError', (err, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); else socket.destroy();
  });
  return server;
}

// IPv4 + IPv6 (dual-stack); wenn IPv6 fehlt, nur IPv4. Belegte Ports fuehren zum Abbruch.
function listen(server, port) {
  return new Promise((resolve, reject) => {
    const attempt = (host, last) => {
      const onError = err => {
        if (err.code === 'EADDRINUSE' || last) return reject(err);
        attempt('0.0.0.0', true);
      };
      server.once('error', onError);
      server.listen({ port: port, host: host, ipv6Only: false }, () => { server.removeListener('error', onError); resolve(); });
    };
    attempt('::', false);
  });
}

async function main() {
  const tls = { pfx: fs.readFileSync(CFG.pfx_file), minVersion: 'TLSv1.2' };
  const pass = readText(CFG.pass_file);
  if (pass !== '') tls.passphrase = pass;

  const secure = prepare(https.createServer(tls, logged(handle)));
  secure.on('tlsClientError', (err, socket) => log('TLS-Handshake fehlgeschlagen ' + (socket.remoteAddress || '?') + ': ' + clean(err.message), 'ERROR'));
  secure.on('upgrade', onUpgrade);
  wsStartPing();
  await listen(secure, HTTPS_PORT);

  if (HTTP_PORT > 0) {
    await listen(prepare(http.createServer(logged(redirect))), HTTP_PORT);
  }
  log('Server gestartet (mit WebSocket): HTTPS Port ' + HTTPS_PORT + ', HTTP Port ' + (HTTP_PORT || 'aus') + ', Inhalt ' + SITE_ROOT);
  if (PROXY) log('Proxy aktiv: andere Seiten kommen von https://' + PROXY_HOST + PROXY_PATH + '/ (nur GET/HEAD; .json/.anl3 nur lokal)', 'WARNING');
  if (ACTIVATE_COMMANDS) {
    log('Befehle fuer EEP aktiv: POST ' + POST_PATH + ' -> ' + EXCHANGE_FILE + ' (Browser: nur erlaubte Origins, ohne Origin nur von diesem Rechner)');
    if (ALLOW_NULL) log('Origin null/file:// ist erlaubt: auch Seiten in Sandbox-Frames koennten Befehle senden', 'WARNING');
  } else {
    log('Befehle (POST) sind nicht aktiviert (--activateCommands)');
  }
}

main().catch(err => {
  log('Server beendet wegen Fehler: ' + clean(err && err.stack || err), 'CRITICAL');
  process.exit(1);
});
'@
Write-Utf8NoBom $serverJs $serverCode

$packageCode = @'
{
  "name": "eep-export-server",
  "version": "1.0.0",
  "private": true,
  "description": "EEP Export: HTTPS-Server fuer .json und .anl3 (nur Node.js-Standardbibliothek)",
  "main": "server.js",
  "bin": { "eep-export-server": "server.js" },
  "scripts": { "start": "node server.js" },
  "engines": { "node": ">=18" }
}
'@
Write-Utf8NoBom $pkgJson $packageCode

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
Start-Process -FilePath $node.Path -ArgumentList "`"$serverJs`"" -WorkingDirectory $InstallPath -WindowStyle Hidden | Out-Null
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
        Write-Check ($r.Status -eq 301 -or $r.Status -eq 405) "POST auf dem HTTP-Port wird nicht angenommen (nur Umleitung): Status $($r.Status) $($r.Error)"
    }
}

# WebSocket: Handshake, sofortige Datei, Push bei Aenderung, fremde Origin wird abgelehnt (Testclient mit Node.js)
$wsFile = Join-Path $exDir "wstest.json"
$wsJs   = Join-Path $InstallPath "ws-selftest.js"
$wsCode = @'
'use strict';
const https = require('https'), crypto = require('crypto'), fs = require('fs');
const port = Number(process.argv[2]), origin = process.argv[3], file = process.argv[4], urlPath = process.argv[5];
const A = JSON.stringify({ n: 1 }), B = JSON.stringify({ n: 2 });
const fail = m => { console.log(m); process.exit(1); };
setTimeout(() => fail('Zeitueberschreitung'), 10000);
function open(org, onUp, onRes) {
  const req = https.request({ host: 'localhost', port: port, path: urlPath, rejectUnauthorized: false,
    headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Version': '13',
               'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'), Origin: org } });
  req.on('upgrade', onUp); req.on('response', onRes); req.on('error', e => fail(e.message)); req.end();
}
function frames(sock, cb) {
  let b = Buffer.alloc(0);
  sock.on('data', d => {
    b = Buffer.concat([b, d]);
    for (;;) {
      if (b.length < 2) return;
      let l = b[1] & 127, o = 2;
      if (l === 126) { if (b.length < 4) return; l = b.readUInt16BE(2); o = 4; }
      else if (l === 127) { if (b.length < 10) return; l = Number(b.readBigUInt64BE(2)); o = 10; }
      if (b.length < o + l) return;
      const op = b[0] & 15, p = b.subarray(o, o + l);
      b = b.subarray(o + l);
      if (op === 1) cb(p.toString('utf8'));
    }
  });
}
fs.writeFileSync(file, A);
open(origin, (res, sock, head) => {
  frames(sock, t => {
    if (t === A) fs.writeFileSync(file, B);
    else if (t === B) { sock.destroy(); other(); }
    else fail('Unerwartete Nachricht: ' + t);
  });
  if (head && head.length) sock.unshift(head);
}, res => fail('Upgrade abgelehnt: Status ' + res.statusCode));
function other() {
  open('https://fremde-seite.example', () => fail('fremde Origin wurde angenommen'),
    res => { if (res.statusCode === 403) { console.log('OK'); process.exit(0); } fail('fremde Origin: Status ' + res.statusCode); });
}
'@
Write-Utf8NoBom $wsJs $wsCode
try { $r = Invoke-Native $node.Path @($wsJs, "$HttpsPort", $localOrigin, $wsFile, "$exUrl/wstest.json") }
finally { Remove-Item $wsJs, $wsFile -Force -ErrorAction SilentlyContinue }
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
Write-Host "  & `"$($node.Path)`" `"$serverJs`"" -ForegroundColor Yellow
Write-Host "oder (npm gehoert zu Node.js):"
Write-Host "  npm start --prefix `"$InstallPath`"" -ForegroundColor Yellow
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
Write-Host "Log: $logFile    Deinstallation: .\Install-node-web-server.ps1 -Uninstall"
Write-Host "Zertifikat: $certCN, Ablage in $certDir"
if (-not $PfxPath) { Write-Host "Zum Import auf anderen Geraeten: $cerPath" }
