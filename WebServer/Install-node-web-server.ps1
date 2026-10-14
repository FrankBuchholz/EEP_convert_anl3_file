#Requires -Version 5.1
<#
.SYNOPSIS
    Installiert und konfiguriert einen Node.js-Webserver unter Windows 11:
    - liefert nur .json und .anl3 Dateien aus
    - CORS fuer localhost, lokales Netzwerk und GitHub-Origin
    - Access-Control-Allow-Private-Network: true, nur wenn der Browser es per Preflight anfragt
    - optional (-AllowNullOrigin): CORS auch fuer die Origin "null" (Seite wird aus einer lokalen Datei file:// geoeffnet)
    - HTTPS (Zertifikat, HSTS, TLS 1.2 als Minimum); HTTP-Port mit Umleitung auf HTTPS nur bei -HttpPort > 0
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
    Es gibt keinen Autostart. Der Server wird mit diesem Node-Kommando gestartet:
    & "<Pfad zu node.exe>" "<InstallPath>\server.js"
#>
[CmdletBinding()]
param(
    [string]$SiteName          = "EEP Export", # Name der WebSite
    [string]$SitePath          = "SITEPATH",   # Verzeichnis, das die Daten der WebSite enthaelt, hier also das Installationsverzeichnis von EEP
    [string]$InstallPath       = (Join-Path $env:ProgramData "EEP-Node-Server"),  # server.js, Zertifikat, Log
    [int]$HttpPort             = 0,      # 0 = kein HTTP-Port (nur HTTPS)
    [int]$HttpsPort            = 443,
    [string[]]$GitHubOrigins   = @("https://frankbuchholz.github.io"), # "https://USERNAME.github.io"
    [string]$PfxPath,                 # optional: eigenes Zertifikat statt selbstsigniert
    [securestring]$PfxPassword,
    [switch]$AllowNullOrigin,         # CORS auch fuer Origin "null" (Seite aus lokaler Datei file://)
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
    Write-Host ""
    Write-Host "Beispiele:" -ForegroundColor Cyan
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001"
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpPort 3000 -HttpsPort 3001"
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
function Test-ReusableCert([string]$Pass, [string[]]$Dns, [string[]]$Ips) {
    if (-not ((Test-Path $pfxFile) -and (Test-Path $passFile))) { return $false }
    try {
        $c = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 $pfxFile, $Pass
        if ($c.NotAfter -lt (Get-Date).AddDays(30)) { return $false }
        if ($c.Subject -ne $c.Issuer) { return $false }
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
if ($PfxPath -and -not (Test-Path $PfxPath -PathType Leaf)) { $errors.Add("PfxPath nicht gefunden: $PfxPath") }
foreach ($g in $GitHubOrigins) {
    if ($g.TrimEnd("/") -notmatch '^https?://[^/\s]+$') {
        $errors.Add("Ungueltige GitHub-Origin '$g' (nur Schema und Host, ohne Pfad, z.B. https://name.github.io).")
    }
}
if ($GitHubOrigins -match "USERNAME") {
    $warnings.Add("GitHub-Origin ist noch der Platzhalter und wird ignoriert. Mit -GitHubOrigins 'https://dein-name.github.io' anpassen.")
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
    http_port         = $HttpPort
    https_port        = $HttpsPort
    github_origins    = @($GitHubOrigins | Where-Object { $_ -notmatch "USERNAME" } | ForEach-Object { $_.TrimEnd("/") })
    computer_name     = $env:COMPUTERNAME
    allow_null_origin = [bool]$AllowNullOrigin
    pfx_file          = $pfxFile
    pass_file         = $passFile
    cer_file          = $cerFile
    log_file          = $logFile
}
Write-Utf8NoBom (Join-Path $InstallPath "config.json") ($config | ConvertTo-Json -Depth 4)

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
    if (Test-ReusableCert $pw $dnsNames $ipList) {
        Write-Host "   vorhandenes Zertifikat weiterverwendet"
    } else {
        # Neues selbstsigniertes Zertifikat: erzeugen, als PFX exportieren (fuer Node.js), aus dem Windows-Speicher entfernen
        $bytes = New-Object byte[] 24
        $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
        $rng.GetBytes($bytes); $rng.Dispose()
        $pw = [Convert]::ToBase64String($bytes)
        $san = @($dnsNames | ForEach-Object { "DNS=$_" }) + @($ipList | ForEach-Object { "IPAddress=$_" })
        $cert = New-SelfSignedCertificate -Subject "CN=localhost" -FriendlyName "EEP Node $SiteName" `
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
    $cerPath = Join-Path $baseDir "$SiteName.cer"
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

# ---------------------------------------------------------------- 4. Server + Inhalt
Write-Host "4/6 Server und Webseiten-Inhalt ..." -ForegroundColor Cyan
$serverCode = @'
#!/usr/bin/env node
'use strict';
/*
 * EEP Export - schlanker HTTPS-Server (nur Node.js-Standardbibliothek).
 *
 * Liefert ausschliesslich .json und .anl3 aus (GET, HEAD, OPTIONS), mit CORS,
 * HSTS und (optional, nur bei http_port > 0) HTTP->HTTPS-Umleitung.
 * WebSocket (wss://, gleiche URL wie die Datei): sendet die Datei beim Verbinden und nach jeder Aenderung.
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
const ALLOWED_METHODS = 'GET, HEAD, OPTIONS';
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

function handle(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headersFor(req, { 'Allow': ALLOWED_METHODS, 'Access-Control-Max-Age': '600', 'Content-Length': '0' }));
    return res.end();
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, headersFor(req, { 'Allow': ALLOWED_METHODS, 'Content-Length': '0', 'Connection': 'close' }));
    return res.end();
  }
  const full = resolvePath(req.url || '/');
  if (!full) return notFound(req, res);
  // Datei komplett lesen: EEP schreibt die Exportdatei laufend neu, so passen Content-Length und Inhalt immer zusammen
  fs.readFile(full, (err, buf) => {
    if (err) return notFound(req, res);
    let mtime = new Date();
    try { mtime = fs.statSync(full).mtime; } catch (e) { /* aktuelle Zeit */ }
    res.writeHead(200, headersFor(req, {
      'Content-Type': ALLOWED_TYPES[path.extname(full).toLowerCase()],
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
  fs.readFile(w.full, 'utf8', (err, text) => {
    if (err) return;
    text = text.replace(/^\uFEFF/, '');
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

New-Item -ItemType Directory -Path $SitePath -Force | Out-Null
if (-not (Test-Path "$SitePath\daten.json"))    { Write-Utf8NoBom "$SitePath\daten.json" '{ "status": "ok" }' }
if (-not (Test-Path "$SitePath\beispiel.anl3")) { Write-Utf8NoBom "$SitePath\beispiel.anl3" 'Beispiel' }

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
$acao       = "Access-Control-Allow-Origin"
$ownPids    = @(Get-OwnProcesses | ForEach-Object { $_.ProcessId })

# Ports
foreach ($port in @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 })) {
    $l = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    Write-Check (($l.Count -gt 0) -and (@($l | Where-Object { $ownPids -notcontains $_.OwningProcess }).Count -eq 0)) "Port $port lauscht (eigener Server)"
}

# Inhalt ueber HTTPS + CORS
$localOrigin = "http://localhost:3000"
$r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = $localOrigin }
Write-Check ($r.Status -eq 200) "HTTPS daten.json: Status $($r.Status) $($r.Error)"
Write-Check ("$($r.Headers['Content-Type'])" -like "application/json*") "daten.json hat den Typ application/json"
Write-Check ([bool]$r.Headers["Strict-Transport-Security"]) "HSTS-Header wird gesendet"
Write-Check ($r.Headers[$acao] -eq $localOrigin) "CORS: localhost erlaubt"

$lanOrigin = "https://192.168.1.50"
$r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = $lanOrigin }
Write-Check ($r.Headers[$acao] -eq $lanOrigin) "CORS: lokales Netzwerk erlaubt ($lanOrigin)"

foreach ($g in $GitHubOrigins) {
    $gh = $g.TrimEnd("/")
    if ($gh -match "USERNAME") { continue }
    $r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = $gh }
    Write-Check ($r.Headers[$acao] -eq $gh) "CORS: GitHub-Origin erlaubt ($gh)"
}

$r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = "https://fremde-seite.example" }
Write-Check (-not $r.Headers[$acao]) "CORS: fremde Origin wird NICHT freigegeben"

$r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = "null" }
if ($AllowNullOrigin) { Write-Check ($r.Headers[$acao] -eq "null") "CORS: Origin 'null' (lokale Datei) erlaubt" }
else                  { Write-Check (-not $r.Headers[$acao])      "CORS: Origin 'null' (lokale Datei) wird NICHT freigegeben" }

$r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = $localOrigin; "Access-Control-Request-Method" = "GET" } "OPTIONS"
Write-Check ($r.Status -eq 204 -and $r.Headers[$acao] -eq $localOrigin) "CORS-Preflight (OPTIONS): Status $($r.Status)"

# Private Network Access: Header nur bei entsprechender Preflight-Anfrage und erlaubter Origin
$pna = "Access-Control-Allow-Private-Network"
$pre = @{ Origin = $localOrigin; "Access-Control-Request-Method" = "GET"; "Access-Control-Request-Private-Network" = "true" }
$r = Invoke-Probe "$baseUrl/daten.json" $pre "OPTIONS"
Write-Check ($r.Headers[$pna] -eq "true") "PNA: Preflight mit Private-Network-Anfrage wird freigegeben"
$r = Invoke-Probe "$baseUrl/daten.json" @{ Origin = $localOrigin; "Access-Control-Request-Method" = "GET" } "OPTIONS"
Write-Check (-not $r.Headers[$pna]) "PNA: ohne Anfrage des Browsers wird der Header nicht gesendet"
$pre["Origin"] = "https://fremde-seite.example"
$r = Invoke-Probe "$baseUrl/daten.json" $pre "OPTIONS"
Write-Check (-not $r.Headers[$pna]) "PNA: fremde Origin wird NICHT freigegeben"

$r = Invoke-Probe "$baseUrl/daten.json" @{} "POST"
Write-Check ($r.Status -eq 405) "POST ist gesperrt: Status $($r.Status)"

# Nur .json und .anl3
$r = Invoke-Probe "$baseUrl/beispiel.anl3"
Write-Check ($r.Status -eq 200) "beispiel.anl3 wird ausgeliefert: Status $($r.Status)"

$testFile = Join-Path $SitePath "pruefung.txt"
'test' | Set-Content $testFile
try { $r = Invoke-Probe "$baseUrl/pruefung.txt" } finally { Remove-Item $testFile -Force -ErrorAction SilentlyContinue }
Write-Check ($r.Status -eq 404) "Andere Dateitypen (.txt) sind gesperrt: Status $($r.Status)"

$r = Invoke-Probe "$baseUrl/"
Write-Check ($r.Status -eq 404) "Verzeichnisauflistung ist gesperrt: Status $($r.Status)"

# HTTP -> HTTPS (nur wenn ein HTTP-Port konfiguriert ist)
if ($HttpPort -gt 0) {
    $r = Invoke-Probe "http://localhost$httpSuffix/daten.json"
    Write-Check ($r.Status -eq 301 -and "$($r.Headers['Location'])" -like "https://*") "HTTP wird auf HTTPS umgeleitet: Status $($r.Status) $($r.Headers['Location']) $($r.Error)"
}

# WebSocket: Handshake, sofortige Datei, Push bei Aenderung, fremde Origin wird abgelehnt (Testclient mit Node.js)
$wsFile = Join-Path $SitePath "wstest.json"
$wsJs   = Join-Path $InstallPath "ws-selftest.js"
$wsCode = @'
'use strict';
const https = require('https'), crypto = require('crypto'), fs = require('fs');
const port = Number(process.argv[2]), origin = process.argv[3], file = process.argv[4];
const A = JSON.stringify({ n: 1 }), B = JSON.stringify({ n: 2 });
const fail = m => { console.log(m); process.exit(1); };
setTimeout(() => fail('Zeitueberschreitung'), 10000);
function open(org, onUp, onRes) {
  const req = https.request({ host: 'localhost', port: port, path: '/wstest.json', rejectUnauthorized: false,
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
try { $r = Invoke-Native $node.Path @($wsJs, "$HttpsPort", $localOrigin, $wsFile) }
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
Write-Host "Danach erreichbar unter: $baseUrl/daten.json   (WebSocket mit wss statt https)"
Write-Host "Log: $logFile    Deinstallation: .\Install-node-web-server.ps1 -Uninstall"
