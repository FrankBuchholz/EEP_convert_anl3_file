#Requires -Version 5.1
<#
.SYNOPSIS
    Installiert und konfiguriert einen Python-Webserver unter Windows 11:
    - liefert nur .json und .anl3 Dateien aus
    - CORS fuer localhost, lokales Netzwerk und GitHub-Origin
    - Access-Control-Allow-Private-Network: true, nur wenn der Browser es per Preflight anfragt
    - optional (-AllowNullOrigin): CORS auch fuer die Origin "null" (Seite wird aus einer lokalen Datei file:// geoeffnet)
    - HTTPS (Zertifikat, HSTS, TLS 1.2 als Minimum); HTTP-Port mit Umleitung auf HTTPS nur bei -HttpPort > 0
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
.EXAMPLE
    .\Install-Python-web-server.ps1 -SitePath C:\EEP17 -HttpsPort 3001 -GitHubOrigins "https://meinname.github.io" -OpenFirewall
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
    Es gibt keinen Autostart. Der Server wird mit diesem Python-Kommando gestartet:
    & "<InstallPath>\venv\Scripts\python.exe" "<InstallPath>\server.py"
#>
[CmdletBinding()]
param(
    [string]$SiteName          = "EEP Export", # Name der WebSite
    [string]$SitePath          = "SITEPATH",   # Verzeichnis, das die Daten der WebSite enthaelt, hier also das Installationsverzeichnis von EEP
    [string]$InstallPath       = (Join-Path $env:ProgramData "EEP-Python-Server"),  # server.py, venv, Zertifikat, Log
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
    Write-Host "Unveraendert: $SitePath, Python und das Zertifikat im Windows-Speicher (certlm.msc, Vertrauenswuerdige Stammzertifizierungsstellen)."
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
    $warnings.Add("-AllowNullOrigin: Die Origin 'null' wird freigegeben. Sie stammt von file://-Seiten, aber auch von Sandbox-Frames fremder Seiten.")
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
$config = [ordered]@{
    site_name       = $SiteName
    site_path       = $SitePath
    http_port       = $HttpPort
    https_port      = $HttpsPort
    github_origins  = @($GitHubOrigins | Where-Object { $_ -notmatch "USERNAME" } | ForEach-Object { $_.TrimEnd("/") })
    computer_name   = $env:COMPUTERNAME
    allow_null_origin = [bool]$AllowNullOrigin
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
    if (old.issuer == old.subject and want_dns <= have_dns and want_ips <= have_ips
            and expiry(old) > now + datetime.timedelta(days=30) and os.path.exists(KEY)):
        print("vorhandenes Zertifikat weiterverwendet")
        sys.exit(0)
except SystemExit:
    raise
except Exception:
    pass

key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "localhost")])
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

if (-not $PfxPath) {
    # Auf diesem PC als vertrauenswuerdig eintragen und .cer fuer andere Geraete bereitstellen
    $baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    $cerPath = Join-Path $baseDir "$SiteName.cer"
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

# ---------------------------------------------------------------- 4. Server + Inhalt
Write-Host "4/6 Server und Webseiten-Inhalt ..." -ForegroundColor Cyan
$serverCode = @'
# -*- coding: utf-8 -*-
"""EEP Export - schlanker HTTPS-Server (nur Python-Standardbibliothek).

Liefert ausschliesslich .json und .anl3 aus (GET, HEAD, OPTIONS), mit CORS,
HSTS und (optional, nur bei http_port > 0) HTTP->HTTPS-Umleitung. Konfiguration: config.json neben dieser Datei
(wird von Install-Python-web-server.ps1 erzeugt).
"""
import json
import logging
import logging.handlers
import os
import re
import shutil
import socket
import socketserver
import ssl
import sys
import threading
from email.utils import formatdate
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

# Protokoll schreiben
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
        ok = bool(origin) and (bool(ORIGIN_RE.fullmatch(origin)) or (ALLOW_NULL and origin == "null"))
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
        if not full:
            self.send_error(404)
            return
        try:
            f = open(full, "rb")
        except OSError:
            self.send_error(404)
            return
        with f:
            st = os.fstat(f.fileno())
            self.send_response(200)
            self.send_header("Content-Type", ALLOWED_TYPES[os.path.splitext(full)[1].lower()])
            self.send_header("Content-Length", str(st.st_size))
            self.send_header("Last-Modified", formatdate(st.st_mtime, usegmt=True))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            if send_body:
                shutil.copyfileobj(f, self.wfile, 65536)

    def do_GET(self):
        self._serve(True)

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

    do_POST = do_PUT = do_DELETE = do_PATCH = _not_allowed


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

    def do_OPTIONS(self):
        self._serve(False)


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
    LOG.info("Server gestartet: HTTPS Port %d, HTTP Port %s, Inhalt %s", HTTPS_PORT, HTTP_PORT or "aus", SITE_ROOT)
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

# Origin "null": gesendet bei lokalen Dateien (file:///) und sandboxed iframes
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
Write-Host "Danach erreichbar unter: $baseUrl/daten.json"
Write-Host "Log: $logFile    Deinstallation: .\Install-Python-web-server.ps1 -Uninstall"