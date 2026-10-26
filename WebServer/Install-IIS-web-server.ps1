#Requires -Version 5.1
<#
.SYNOPSIS
    File version: 2026-10-22
		Installiert und konfiguriert den IIS unter Windows 11:
    - liefert nur .json und .anl3 Dateien aus
    - CORS fuer localhost, lokales Netzwerk und GitHub-Origin
    - Access-Control-Allow-Private-Network: true, nur wenn der Browser es per Preflight anfragt
    - optional (-AllowNullOrigin): CORS auch fuer die Origin "null" (Seite wird aus einer lokalen Datei file:// geoeffnet)
    - HTTPS (Zertifikat mit sprechendem Namen, Bindung, HSTS, TLS-Haertung); HTTP-Port mit Umleitung auf HTTPS nur bei -HttpPort > 0
    - Vorpruefungen (Ports, Parameter, Internet) VOR jeder Aenderung
    - Abschlusstests (Dienst, Bindung, CORS, Dateityp-Sperre, Umleitung)
    Fremde Websites werden nie veraendert oder gestoppt. Existiert bereits eine
    Website mit dem Namen -SiteName, wird sie auf die aktuellen Angaben konfiguriert.
.EXAMPLE
    .\Install-IIS-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001
.EXAMPLE
    .\Install-IIS-web-server.ps1 -SitePath C:\EEP17 -HttpPort 3000 -HttpsPort 3001
    (zusaetzlich HTTP-Port 3000 mit Umleitung auf HTTPS)
.EXAMPLE
    .\Install-IIS-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -AllowNullOrigin
.EXAMPLE
    .\Install-IIS-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -GitHubOrigins "https://meinname.github.io" -OpenFirewall
.NOTES
    Als Administrator in Windows PowerShell 5.1 ausfuehren (nicht PowerShell 7).
    Meldung "nicht digital signiert": Nach dem Download des Skriptes ist die Datei in Windows 11
    als "aus dem Internet" markiert. Die Ausfuehrungsrichtlinie von Windows verlangt dann eine
    Signatur oder eine explizite Freischaltung mit folgendem Befehl:
    Unblock-File .\Install-IIS-web-server.ps1
    Fuer URL Rewrite (CORS + Umleitung) wird eine Internetverbindung benoetigt.
    Der EEP-Server und ein anderer Webserver koennen nicht gleichzeitig dieselben Ports nutzen.
    Standard ist -HttpPort 0: Es wird nur der HTTPS-Port gebunden, es gibt keinen HTTP-Port und keine Umleitung.
    Die Option -AllowNullOrigin wird nur benoetigt, wenn das Bridge-Programm lokal auf einem Rechner gestartet wird.
    Der Browser sendet dabei die Origin "null" auch bei file://-Seiten, aber ebenso
    bei Seiten in Sandbox-Frames. Die Option gibt die Daten deshalb fuer jede solche Seite frei.
#>
[CmdletBinding()]
param(
    [string]$SiteName          = "EEP Export", # Name der WebSite
    [string]$SitePath          = "SITEPATH",   # Verzeichnis, das die Daten der WebSite enthaelt, hier also das Installationsverzeichnis von EEP
    [int]$HttpPort             = 0,      # 0 = kein HTTP-Port (nur HTTPS)
    [int]$HttpsPort            = 443,
    [string[]]$GitHubOrigins   = @("https://frankbuchholz.github.io"), # "https://USERNAME.github.io"
    [string]$PfxPath,                 # optional: eigenes Zertifikat statt selbstsigniert
    [securestring]$PfxPassword,
    [switch]$SkipTlsHardening,        # TLS 1.0/1.1 NICHT deaktivieren
    [switch]$AllowNullOrigin,         # CORS auch fuer Origin "null" (Seite aus lokaler Datei file://)
    [switch]$OpenFirewall
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
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001"
    Write-Host "  .\$self -SitePath C:\EEP17 -HttpsPort 3001 -AllowNullOrigin"
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
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$appcmd        = Join-Path $env:windir "System32\inetsrv\appcmd.exe"
$restartNeeded = $false
$script:failed = 0

# ---------------------------------------------------------------- Hilfsfunktionen
function Write-Check([bool]$Ok, [string]$Text) {
    if ($Ok) { Write-Host "   [OK]      $Text" -ForegroundColor Green }
    else     { Write-Host "   [FEHLER]  $Text" -ForegroundColor Red; $script:failed++ }
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

# Prueft, ob das Zertifikat alle Namen und IP-Adressen abdeckt
function Test-CertCovers($Cert, [string[]]$Dns, [string[]]$Ips) {
    $ext = $Cert.Extensions | Where-Object { $_.Oid.Value -eq "2.5.29.17" } | Select-Object -First 1
    if (-not $ext) { return $false }
    $san = $ext.Format($false)
    foreach ($d in $Dns) { if ($san -notmatch ("(?<![\w.-])" + [regex]::Escape($d) + "(?![\w.-])")) { return $false } }
    foreach ($i in $Ips) { if ($san -notmatch ("(?<![\d.])" + [regex]::Escape($i) + "(?![\d.])")) { return $false } }
    return $true
}

# Liefert Status und Header, auch bei 3xx/4xx; folgt keiner Umleitung
function Invoke-Probe([string]$Uri, [hashtable]$Headers = @{}, [string]$Method = "GET") {
    $resp = $null
    $err  = ""
    try {
        $req = [System.Net.HttpWebRequest]::Create($Uri)
        $req.AllowAutoRedirect = $false
        $req.Method = $Method
        $req.Timeout = 15000
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

# IIS-Websites, die einen bestimmten Port gebunden haben
function Get-SitesOnPort([int]$Port) {
    foreach ($s in Get-Website) {
        $hit = @($s.Bindings.Collection | Where-Object { $_.bindingInformation -match "^[^:]*:${Port}:" })
        if ($hit.Count -gt 0) { $s }
    }
}

# ---------------------------------------------------------------- 0. Vorpruefungen
Write-Host "0/7 Vorpruefungen ..." -ForegroundColor Cyan
$errors   = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

# PowerShell-Edition (WebAdministration laeuft nur in Windows PowerShell)
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
if ($PfxPath -and -not (Test-Path $PfxPath -PathType Leaf)) { $errors.Add("PfxPath nicht gefunden: $PfxPath") }
foreach ($g in $GitHubOrigins) {
    if ($g.TrimEnd("/") -notmatch '^https?://[^/\s]+$') {
        $errors.Add("Ungueltige GitHub-Origin '$g' (nur Schema und Host, ohne Pfad, z.B. https://name.github.io).")
    }
}
if ($AllowNullOrigin) {
    $warnings.Add("-AllowNullOrigin: Origin 'null' wird freigegeben. Das erlaubt lokalen Dateien (file:///) und Seiten in sandboxed iframes das Lesen der Daten.")
}
if ($GitHubOrigins -match "USERNAME") {
    $warnings.Add("GitHub-Origin ist noch der Platzhalter. Mit -GitHubOrigins 'https://dein-name.github.io' anpassen.")
}
$webAdminOk = $null -ne (Get-Module -ListAvailable -Name WebAdministration)
if ($webAdminOk) { Import-Module WebAdministration }

# Portbelegung (fremde Programme und Websites werden nie beendet)
foreach ($port in @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 } | Select-Object -Unique)) {
    $listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)

    # Fremde Programme (alles ausser System/http.sys, PID 4)
    $foreign = @($listeners | Where-Object { $_.OwningProcess -ne 4 } | Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($procId in $foreign) {
        $pname = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
        $errors.Add("Port $port wird von Prozess '$pname' (PID $procId) belegt. Prozess beenden oder anderen Port waehlen.")
    }

    # http.sys (IIS und andere): welche Website steckt dahinter?
    if (@($listeners | Where-Object { $_.OwningProcess -eq 4 }).Count -gt 0) {
        $others = @()
        $own    = $false
        if ($webAdminOk) {
            foreach ($s in @(Get-SitesOnPort $port)) {
                if ($s.Name -eq $SiteName)        { $own = $true }
                elseif ($s.State -eq "Started")   { $others += $s.Name }
            }
        }
        foreach ($n in $others) {
            $errors.Add("Die fremde Website '$n' belegt Port $port. Sie wird nicht veraendert: anderen Port waehlen (-HttpPort/-HttpsPort) oder die Website selbst stoppen.")
        }
        if ($others.Count -eq 0 -and -not $own) {
            $errors.Add("Port $port ist von System (http.sys, PID 4) belegt, aber keine IIS-Website gefunden. Pruefen mit: netsh http show servicestate  und  netsh http show urlacl")
        }
    }
}

# Internet fuer URL Rewrite
if (-not (Test-Path "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite")) {
    if (-not (Test-NetConnection download.microsoft.com -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
        $errors.Add("URL Rewrite fehlt und download.microsoft.com ist nicht erreichbar (Internet/Proxy pruefen).")
    }
}

foreach ($w in $warnings) { Write-Warning $w }
if ($errors.Count -gt 0) {
    foreach ($e in $errors) { Write-Host "   [FEHLER]  $e" -ForegroundColor Red }
    Write-Host "`nAbbruch: Es wurde nichts veraendert." -ForegroundColor Red
    exit 1
}
Write-Host "   Alle Vorpruefungen bestanden." -ForegroundColor Green

# ---------------------------------------------------------------- 1. IIS-Features aktivieren (falls noch nicht geschehen)
Write-Host "1/7 IIS-Features ..." -ForegroundColor Cyan
$features = "IIS-WebServerRole","IIS-WebServer","IIS-CommonHttpFeatures","IIS-StaticContent",
            "IIS-HttpErrors","IIS-HttpLogging","IIS-RequestFiltering","IIS-ManagementConsole"
foreach ($f in $features) {
    if ((Get-WindowsOptionalFeature -Online -FeatureName $f).State -ne "Enabled") {
        $res = Enable-WindowsOptionalFeature -Online -FeatureName $f -All -NoRestart
        if ($res.RestartNeeded) { $restartNeeded = $true }
    }
}
# IIS-Verwaltungsmodule importieren
Import-Module WebAdministration

# ---------------------------------------------------------------- 2. URL Rewrite
Write-Host "2/7 URL Rewrite Modul ..." -ForegroundColor Cyan
if (-not (Test-Path "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite")) {
    $msi = Join-Path $env:TEMP "rewrite_amd64_en-US.msi"
    Invoke-WebRequest -UseBasicParsing -OutFile $msi `
        -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi"
    $p = Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait -PassThru
    if ($p.ExitCode -notin 0,3010) { throw "URL Rewrite Installation fehlgeschlagen (Exitcode $($p.ExitCode))." }
    if (-not (Test-Path "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite")) { throw "URL Rewrite ist nach der Installation nicht registriert." }
}

# Servervariablen fuer CORS-Header freigeben (nur auf Serverebene moeglich)
$outbound = @(
    @{ Name = "CORS Allow-Origin";  Var = "RESPONSE_Access_Control_Allow_Origin";  Value = "{C:0}" },
    @{ Name = "CORS Allow-Methods"; Var = "RESPONSE_Access_Control_Allow_Methods"; Value = "GET, HEAD, OPTIONS" },
    @{ Name = "CORS Allow-Headers"; Var = "RESPONSE_Access_Control_Allow_Headers"; Value = "Content-Type, Accept" },
    # Private Network Access: nur wenn der Browser es anfragt (Access-Control-Request-Private-Network: true)
    @{ Name = "CORS Allow-Private-Network"; Var = "RESPONSE_Access_Control_Allow_Private_Network"; Value = "true"; RequestHeader = "HTTP_ACCESS_CONTROL_REQUEST_PRIVATE_NETWORK" }
)
foreach ($o in $outbound) {
    & $appcmd set config -section:system.webServer/rewrite/allowedServerVariables "/+[name='$($o.Var)']" /commit:apphost 2>&1 | Out-Null
}
$allowed = (& $appcmd list config -section:system.webServer/rewrite/allowedServerVariables) -join "`n"
foreach ($o in $outbound) {
    if ($allowed -notmatch [regex]::Escape($o.Var)) { throw "Servervariable $($o.Var) konnte nicht freigegeben werden." }
}

# ---------------------------------------------------------------- 3. Zertifikat
Write-Host "3/7 Zertifikat ..." -ForegroundColor Cyan
$certName   = "IIS $SiteName"
$certCN     = Get-CertCommonName "IIS"   # sprechender Name (CN) des selbst erzeugten Zertifikats
$certReused = $false
$cerPath    = $null
if ($PfxPath) {
    $cert = Import-PfxCertificate -FilePath $PfxPath -CertStoreLocation Cert:\LocalMachine\My -Password $PfxPassword |
            Where-Object { $_.HasPrivateKey } | Select-Object -First 1
    if (-not $cert) { throw "Die PFX-Datei enthaelt kein Zertifikat mit privatem Schluessel." }
    if ($cert.NotAfter -lt (Get-Date)) { throw "Das Zertifikat aus der PFX-Datei ist abgelaufen ($($cert.NotAfter))." }
} else {
    $lanIps   = @(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "169.254.*" } | Select-Object -ExpandProperty IPAddress)
    $dnsNames = @("localhost", $env:COMPUTERNAME)
    # Vorhandenes selbstsigniertes Zertifikat weiterverwenden, solange es gueltig ist, den sprechenden Namen traegt und alle Namen/IPs abdeckt
    $cert = Get-ChildItem Cert:\LocalMachine\My |
            Where-Object { $_.FriendlyName -eq $certName -and $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date).AddDays(30) -and
                           $_.Subject -eq $_.Issuer -and (Get-CertCN $_) -eq $certCN -and (Test-CertCovers $_ $dnsNames $lanIps) } |
            Sort-Object NotAfter -Descending | Select-Object -First 1
    $certReused = [bool]$cert
    if (-not $cert) {
        $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "169.254.*" } |
               Select-Object -ExpandProperty IPAddress
        $san = @("DNS=localhost", "DNS=$env:COMPUTERNAME") + ($ips | ForEach-Object { "IPAddress=$_" })
        $cert = New-SelfSignedCertificate -Subject "CN=$certCN" -FriendlyName $certName `
            -CertStoreLocation Cert:\LocalMachine\My -KeyAlgorithm RSA -KeyLength 2048 `
            -HashAlgorithm SHA256 -KeyExportPolicy Exportable -NotAfter (Get-Date).AddYears(2) `
            -TextExtension @("2.5.29.17={text}" + ($san -join "&"))
    }
    # Auf diesem PC als vertrauenswuerdig eintragen und .cer fuer andere Geraete exportieren
    $baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    $cerPath = Join-Path $baseDir "$certCN.cer" # "$SiteName.cer"
    Export-Certificate -Cert $cert -FilePath $cerPath | Out-Null
    if (-not (Test-Path "Cert:\LocalMachine\Root\$($cert.Thumbprint)")) {
        Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root | Out-Null
    }
    Write-Host "   Zertifikat exportiert: $cerPath (auf Geraeten im LAN importieren)"
}

$certTitle = if ($PfxPath) { "Zertifikat: eigenes Zertifikat (PFX) importiert" }
             elseif ($certReused) { "Zertifikat: vorhandenes Zertifikat wird weiterverwendet" }
             else { "Zertifikat: neu erzeugt (selbstsigniert)" }
Show-CertInfo $cert $certTitle
Write-Host "   Ablage:" -ForegroundColor Cyan
Write-Host "      Zertifikat + Schluessel: Windows-Zertifikatsspeicher 'Lokaler Computer' > Eigene Zertifikate"
Write-Host "                               (Cert:\LocalMachine\My, Programm certlm.msc), Name '$certCN'"
if ($cerPath) {
    Write-Host "      Kopie fuer andere Geraete: $cerPath"
    Write-Host "      Vertrauensspeicher dieses PCs: Lokaler Computer > Vertrauenswuerdige Stammzertifizierungsstellen"
}

# ---------------------------------------------------------------- 4. Inhalt + web.config
Write-Host "4/7 Webseite und web.config ..." -ForegroundColor Cyan
$ExchangePath = "exchange"   # fester Unterordner fuer Test- und Beispieldaten
# Test- und Beispieldaten liegen in <SitePath>\<ExchangePath> (gleicher Ordner wie die Kommando-Datei)
$exDir = Join-Path $SitePath $ExchangePath
$exUrl = (($ExchangePath -split '\\' | Where-Object { $_ } | ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/')
$exUrl = if ($exUrl) { "/$exUrl" } else { "" }
New-Item -ItemType Directory -Path $SitePath -Force | Out-Null
New-Item -ItemType Directory -Path $exDir -Force | Out-Null   # Test- und Beispieldaten nur im Unterordner
if (-not (Test-Path "$exDir\daten.json"))    { '{ "status": "ok" }' | Set-Content "$exDir\daten.json" -Encoding UTF8 }
if (-not (Test-Path "$exDir\beispiel.anl3")) { 'Beispiel' | Set-Content "$exDir\beispiel.anl3" -Encoding UTF8 }

# Erlaubte Origins: localhost, private Netze (10.x, 172.16-31.x, 192.168.x), *.local, PC-Name, GitHub
$ghAlt      = ($GitHubOrigins | ForEach-Object { [regex]::Escape($_.TrimEnd("/")) }) -join "|"
$lanHosts   = 'localhost|127\.0\.0\.1|\[::1\]|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|[a-z0-9-]+\.local|' + [regex]::Escape($env:COMPUTERNAME)
$nullAlt     = if ($AllowNullOrigin) { '|(null)' } else { '' }
$originRegex = '^((https?://(' + $lanHosts + ')(:\d+)?)|(' + $ghAlt + ')' + $nullAlt + ')$'

$portSuffix = if ($HttpsPort -eq 443) { "" } else { ":$HttpsPort" }

$rulesXml = ""
foreach ($o in $outbound) {
    $extraCond = if ($o.RequestHeader) { "`n            " + '<add input="{' + $o.RequestHeader + '}" pattern="^true$" />' } else { "" }
    $rulesXml += @"

        <rule name="$($o.Name)">
          <match serverVariable="$($o.Var)" pattern=".*" />
          <conditions>
            <add input="{HTTP_ORIGIN}" pattern="$originRegex" />$extraCond
          </conditions>
          <action type="Rewrite" value="$($o.Value)" />
        </rule>
"@
}

$rulesBlock = ""
if ($HttpPort -gt 0) {
    $rulesBlock = @"

      <rules>
        <rule name="HTTP zu HTTPS" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="^OFF$" />
          </conditions>
          <action type="Redirect" url="https://{SERVER_NAME}$portSuffix/{R:1}" redirectType="Permanent" />
        </rule>
      </rules>
"@
}

$webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <directoryBrowse enabled="false" />
    <caching enabled="false" enableKernelCache="false" />
    <security>
      <requestFiltering allowDoubleEscaping="false">
        <fileExtensions allowUnlisted="false">
          <add fileExtension=".json" allowed="true" />
          <add fileExtension=".anl3" allowed="true" />
        </fileExtensions>
        <verbs allowUnlisted="false">
          <add verb="GET" allowed="true" />
          <add verb="HEAD" allowed="true" />
          <add verb="OPTIONS" allowed="true" />
        </verbs>
      </requestFiltering>
    </security>
    <staticContent>
      <clientCache cacheControlMode="DisableCache" />
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json; charset=windows-1252" />
      <remove fileExtension=".anl3" />
      <mimeMap fileExtension=".anl3" mimeType="application/octet-stream" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
        <add name="Strict-Transport-Security" value="max-age=31536000" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="Vary" value="Origin" />
      </customHeaders>
    </httpProtocol>
    <rewrite>$rulesBlock
      <outboundRules>$rulesXml
      </outboundRules>
    </rewrite>
  </system.webServer>
</configuration>
"@
try { [void][xml]$webConfig } catch { throw "Die erzeugte web.config ist kein gueltiges XML: $($_.Exception.Message)" }
Set-Content -Path "$SitePath\web.config" -Value $webConfig -Encoding UTF8

# ---------------------------------------------------------------- 5. App-Pool + Website + HTTPS-Bindung
Write-Host "5/7 Website und HTTPS-Bindung ..." -ForegroundColor Cyan

if (-not (Test-Path "IIS:\AppPools\$SiteName")) { New-WebAppPool -Name $SiteName | Out-Null }
Set-ItemProperty "IIS:\AppPools\$SiteName" -Name managedRuntimeVersion -Value ""

$sitePs = "IIS:\Sites\$SiteName"
$bindings = @()
if ($HttpPort -gt 0) { $bindings += @{ protocol = "http"; bindingInformation = "*:${HttpPort}:" } }
$bindings += @{ protocol = "https"; bindingInformation = "*:${HttpsPort}:" }

if (Test-Path $sitePs) {
    # Website mit gleichem Namen vorhanden: auf die aktuellen Angaben konfigurieren
    Set-ItemProperty $sitePs -Name physicalPath    -Value $SitePath
    Set-ItemProperty $sitePs -Name applicationPool -Value $SiteName
    Write-Host "   Website '$SiteName' war vorhanden und wird aktualisiert."
} else {
    $firstPort = if ($HttpPort -gt 0) { $HttpPort } else { $HttpsPort }
    New-Website -Name $SiteName -PhysicalPath $SitePath -ApplicationPool $SiteName -Port $firstPort | Out-Null
    Write-Host "   Website '$SiteName' wurde angelegt."
}
# Bindungen (HTTP nur bei -HttpPort > 0, immer HTTPS) auf die aktuellen Angaben setzen
Set-ItemProperty $sitePs -Name bindings -Value $(if ($bindings.Count -eq 1) { $bindings[0] } else { $bindings })

$sslKey = "IIS:\SslBindings\0.0.0.0!$HttpsPort"
if (Test-Path $sslKey) { Remove-Item $sslKey -Force }
(Get-WebBinding -Name $SiteName -Protocol https).AddSslCertificate($cert.Thumbprint, "My")

# Fruehere, vom Skript erzeugte Zertifikate mit anderem Namen (z.B. "localhost") entfernen, sofern keine Bindung sie noch nutzt
if (-not $PfxPath) {
    $inUse = @(Get-ChildItem IIS:\SslBindings | ForEach-Object { $_.Thumbprint })
    foreach ($old in @(Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.FriendlyName -eq $certName -and $_.Thumbprint -ne $cert.Thumbprint -and $inUse -notcontains $_.Thumbprint })) {
        Remove-Item "Cert:\LocalMachine\Root\$($old.Thumbprint)" -Force -ErrorAction SilentlyContinue
        Remove-Item "Cert:\LocalMachine\My\$($old.Thumbprint)" -Force -ErrorAction SilentlyContinue
        Write-Host "   Frueheres Zertifikat '$(Get-CertCN $old)' ($($old.Thumbprint.Substring(0,8))...) entfernt."
    }
}

# ---------------------------------------------------------------- 6. TLS-Haertung + Firewall
Write-Host "6/7 TLS und Firewall ..." -ForegroundColor Cyan
if (-not $SkipTlsHardening) {
    $base = "HKLM:\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols"
    $protocols = @{ "SSL 2.0"=0; "SSL 3.0"=0; "TLS 1.0"=0; "TLS 1.1"=0; "TLS 1.2"=1; "TLS 1.3"=1 }
    foreach ($name in $protocols.Keys) {
        $key = "$base\$name\Server"
        New-Item -Path $key -Force | Out-Null
        New-ItemProperty -Path $key -Name Enabled -Value $protocols[$name] -PropertyType DWord -Force | Out-Null
        New-ItemProperty -Path $key -Name DisabledByDefault -Value (1 - $protocols[$name]) -PropertyType DWord -Force | Out-Null
    }
    Write-Host "   TLS-Einstellungen gesetzt (gueltig nach Neustart)."
}
if ($OpenFirewall) {
    Remove-NetFirewallRule -DisplayName "IIS $SiteName" -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "IIS $SiteName" -Direction Inbound -Protocol TCP `
        -LocalPort @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 }) -Action Allow -Profile Private,Domain | Out-Null
}

# ---------------------------------------------------------------- 7. Start + Abschlusstests
Write-Host "7/7 Start und Tests ..." -ForegroundColor Cyan

Start-Service W3SVC
if ((Get-WebsiteState -Name $SiteName).Value -ne "Started") {
    try { Start-Website -Name $SiteName }
    catch { Write-Warning "Website konnte nicht gestartet werden (Port belegt?): $($_.Exception.Message)" }
}

$httpSuffix = if ($HttpPort -eq 80) { "" } else { ":$HttpPort" }
$baseUrl    = "https://localhost$portSuffix"
$testBase    = "$baseUrl$exUrl"   # Test- und Beispieldaten liegen im Unterordner
$acao       = "Access-Control-Allow-Origin"

# Dienst, Website, Bindung, Ports
Write-Check ((Get-Service W3SVC).Status -eq "Running") "Dienst W3SVC laeuft"
Write-Check ((Get-WebsiteState -Name $SiteName).Value -eq "Started") "Website '$SiteName' ist gestartet"
$b = Get-WebBinding -Name $SiteName -Protocol https
Write-Check ([bool]($b -and $b.certificateHash -eq $cert.Thumbprint)) "HTTPS-Bindung nutzt das Zertifikat $($cert.Thumbprint.Substring(0,8))..."
foreach ($port in @($HttpPort, $HttpsPort | Where-Object { $_ -gt 0 })) {
    Write-Check ([bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) "Port $port lauscht"
}

# Inhalt ueber HTTPS + CORS
$localOrigin = "http://localhost:3000"
$r = Invoke-Probe "$testBase/daten.json" @{ Origin = $localOrigin }
Write-Check ($r.Status -eq 200) "HTTPS daten.json: Status $($r.Status) $($r.Error)"
Write-Check ("$($r.Headers['Cache-Control'])" -like "*no-cache*") "Cache-Control: no-cache (Exportdatei wird laufend aktualisiert)"
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
else                  { Write-Check (-not $r.Headers[$acao]) "CORS: Origin 'null' (lokale Datei) wird NICHT freigegeben" }

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

# Nur .json und .anl3
$r = Invoke-Probe "$testBase/beispiel.anl3"
Write-Check ($r.Status -eq 200) "beispiel.anl3 wird ausgeliefert: Status $($r.Status)"

$testFile = Join-Path $exDir "pruefung.txt"
'test' | Set-Content $testFile
try { $r = Invoke-Probe "$testBase/pruefung.txt" } finally { Remove-Item $testFile -Force -ErrorAction SilentlyContinue }
Write-Check ($r.Status -eq 404) "Andere Dateitypen (.txt) sind gesperrt: Status $($r.Status)"

$r = Invoke-Probe "$baseUrl/web.config"
Write-Check ($r.Status -eq 404) "web.config ist nicht abrufbar: Status $($r.Status)"

# HTTP -> HTTPS (nur wenn ein HTTP-Port konfiguriert ist)
if ($HttpPort -gt 0) {
    $r = Invoke-Probe "http://localhost$httpSuffix$exUrl/daten.json"
    Write-Check ($r.Status -eq 301 -and "$($r.Headers['Location'])" -like "https://*") "HTTP wird auf HTTPS umgeleitet: Status $($r.Status) $($r.Headers['Location']) $($r.Error)"
}

if ($script:failed -gt 0) {
    Write-Host "`n$($script:failed) Pruefung(en) fehlgeschlagen. Details siehe oben." -ForegroundColor Red
    exit 1
}

Write-Host "`nFertig: $testBase/daten.json" -ForegroundColor Green
Write-Host "Zertifikat: $certCN (Zertifikatsspeicher Lokaler Computer > Eigene Zertifikate)"
if ($cerPath) { Write-Host "Zum Import auf anderen Geraeten: $cerPath" }
if ($restartNeeded -or -not $SkipTlsHardening) {
    Write-Warning "Neustart empfohlen (IIS-Features bzw. TLS-Einstellungen werden erst danach vollstaendig wirksam)."
}