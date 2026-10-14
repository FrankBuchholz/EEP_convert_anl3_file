# EEP Export: lokaler Webserver für Export Bridge und Gleisplan

Die **[`EEP_Export_Bridge.html`](EEP_Export_Bridge.html "EEP_Export_Bridge.html")** liest die Datei `eep_export.json`, die das Lua-Modul [`EepExport.lua`](Lua/EepExport.lua "EepExport.lua") in EEP schreibt. Der **[`EEP_Gleisplan.html`](EEP_Gleisplan.html "EEP_Gleisplan.html")** lädt die Anlage-Datei (`.anl3`) der laufenden Anlage.

Laufen EEP und Browser auf **demselben Rechner**, kann die Bridge die JSON-Datei direkt lesen (siehe [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html), Abschnitt 2.1). Ein Webserver wird dann nicht zwingend gebraucht.

Einen Webserver braucht man, wenn

- EEP und Bridge auf **verschiedenen Rechnern** laufen (zweiter PC, Laptop, Tablet im Heimnetz), die Dateien `eep_export.json` und `<Anlage>.anl3` also nicht direkt gelesen werden können, oder
- die Bridge **im Web** geöffnet ist (z. B. auf GitHub Pages). Eine HTTPS-Seite darf nur per **HTTPS** auf Daten zugreifen; reines HTTP im Netzwerk wird vom Browser blockiert.

Dafür gibt es drei Installationsskripte für Windows 11, die auf dem **EEP-Rechner** einen kleinen Webserver einrichten:

| Skript | Webserver | Start |
|---|---|---|
| [`Install-IIS-web-server.ps1`](Install-IIS-web-server.ps1 "Install-IIS-web-server.ps1") | IIS (Windows-Bordmittel) | läuft als Windows-Dienst, Autostart |
| [`Install-Python-web-server.ps1`](Install-Python-web-server.ps1 "Install-Python-web-server.ps1") | Python (`server.py`) | von Hand mit einem Kommando |
| [`Install-node-web-server.ps1`](Install-node-web-server.ps1 "Install-node-web-server.ps1") | Node.js (`server.js`) | von Hand mit einem Kommando |

```
EEP-Rechner                                         zweiter Rechner / Tablet
EEP + EepExport.lua ──► eep_export.json ─┐
                        <Anlage>.anl3   ─┴─► Webserver (HTTPS, Port 3001) ──► Browser:
                                                                               EEP_Export_Bridge.html
                                                                               EEP_Gleisplan.html
```

Alle drei Varianten liefern die Dateien gleich aus:

- Ausgeliefert werden **nur `.json` und `.anl3`** (nur `GET`, `HEAD`, `OPTIONS`). Alles andere liefert 404 bzw. 405, ebenso Verzeichnislisten.
- **CORS** nur für `localhost`, das lokale Netzwerk (10.x, 172.16–31.x, 192.168.x, `*.local`, PC-Name) und die GitHub-Origin (Standard: `https://frankbuchholz.github.io`, änderbar mit `-GitHubOrigins`).
- `Access-Control-Allow-Private-Network: true` wird nur gesendet, wenn der Browser es per Preflight anfragt und die Origin erlaubt ist.
- **HTTPS** mit selbstsigniertem Zertifikat (gültig für `localhost`, PC-Name und die lokalen IP-Adressen), HSTS, mindestens TLS 1.2.
- **Standard ist `-HttpPort 0`:** Es gibt nur einen HTTPS-Port, keinen HTTP-Port und keine Umleitung. Mit `-HttpPort 3000` kommt ein HTTP-Port dazu, der auf HTTPS umleitet.
- **WebSocket (nur Python und Node.js):** Unter derselben Adresse wie die Datei (`wss://…/eep_export.json`) schickt der Server die Datei sofort beim Verbinden und danach nach jeder Änderung. Die Bridge muss dann nicht mehr abfragen (siehe Abschnitt „WebSocket“ in 2). Die IIS-Variante liefert die Datei nur per HTTPS.
- **Vorprüfungen** vor jeder Änderung (Administratorrechte, Parameter, Ports, Voraussetzungen) und **Abschlusstests** (CORS, Dateityp-Sperre, Ports, Umleitung, bei Python und Node.js zusätzlich WebSocket).
- **Fremde Webserver und Programme werden nie beendet oder verändert.** Belegt ein anderes Programm einen Port, bricht das Skript vor jeder Änderung ab.

---

## 1. Voraussetzungen

**Für alle Varianten**

- Windows 11 und **Windows PowerShell 5.1** (`powershell.exe`, nicht PowerShell 7), gestartet **als Administrator**. Sonst zeigt das Skript eine Fehlermeldung und beendet sich.
- Ein Ordner, der `eep_export.json` **und** die `.anl3`-Datei der Anlage enthält. Er wird mit `-SitePath` angegeben. Ab EEP 18.1 Plugin 1 schreibt `EepExport.lua` die JSON-Datei in den Anlagenordner neben die `.anl3`-Datei. Dann ist der Anlagenordner der passende `-SitePath`. Bei älteren EEP-Versionen landet die Datei im EEP-Installationsverzeichnis (z. B. `C:\EEP17`), sofern nicht mit `outputFile` ein anderer Pfad festgelegt wurde.
- Ein freier Port für HTTPS (hier 3001). Ein anderer Webserver und der EEP-Server können nicht gleichzeitig denselben Port nutzen.

**Zusätzlich je Variante**

| | IIS | Python | Node.js |
|---|---|---|---|
| Software | IIS-Features (werden aktiviert) und das Modul *URL Rewrite* (wird installiert) | Python 3.9+ für alle Benutzer (wird bei Bedarf per `winget` installiert), Paket `cryptography` (per `pip`) | **Node.js 18 oder neuer muss bereits installiert sein.** Fehlt es, bricht das Skript sofort ab, ohne etwas zu ändern |
| Internet | ja (Download von URL Rewrite) | ja (`winget`, `pip`), nur beim ersten Mal | nein |
| Eingriff ins System | groß: Windows-Features, Dienst, TLS-Einstellungen (Registry) | klein: Ordner unter `C:\ProgramData`, ggf. Python | klein: Ordner unter `C:\ProgramData` |
| Datei im Datenordner (`-SitePath`) | `web.config` (steuert Dateityp-Sperre und CORS) | keine (nur Beispieldateien) | keine (nur Beispieldateien) |

---

## 2. Die drei Varianten im Vergleich

### IIS

**Vorteile**

- Robust und dauerhaft: Der Dienst startet mit Windows, es muss nichts von Hand gestartet werden.
- Keine zusätzliche Laufzeit (kein Python, kein Node.js).
- Zertifikat im Windows-Zertifikatsspeicher, Protokolle in den IIS-Logs.

**Nachteile**

- Größter Eingriff ins System: IIS-Features, URL-Rewrite-Modul, systemweite TLS-Härtung (SSL und TLS 1.0/1.1 für Serverdienste deaktiviert, wirksam nach einem Neustart; abschaltbar mit `-SkipTlsHardening`).
- Braucht Internet für URL Rewrite.
- Schreibt eine `web.config` in den Datenordner.
- Konflikte mit anderen IIS-Websites auf demselben Port sind möglich (werden erkannt, aber nicht verändert).
- Hat kein `-Uninstall`; die Website wird von Hand entfernt (siehe Abschnitt 3.9).

### Python

**Vorteile**

- Keine Systemänderung, kein Dienst, keine Registry-Eingriffe.
- Der Server (`server.py`) ist ein kurzer, lesbarer Quelltext und nutzt nur die Python-Standardbibliothek.
- Sauber entfernbar mit `-Uninstall`.
- WebSocket mit der Standardbibliothek: Ein Thread prüft die Exportdatei 10-mal pro Sekunde (`os.stat`, sehr effizient), aber nur, solange mindestens ein WebSocket-Client verbunden ist.

**Nachteile**

- Python muss vorhanden sein oder per `winget` installiert werden; `pip` lädt dabei `cryptography` (nur zum Erzeugen des Zertifikats).
- Kein Autostart: Der Server läuft nur, solange sein Fenster offen ist.

### Node.js

**Vorteile**

- Kommt ohne Internet aus und lädt keine npm-Pakete. Der Server (`server.js`) nutzt nur die Node.js-Standardbibliothek.
- Das Zertifikat erzeugt Windows selbst, es wird weder `pip` noch `openssl` gebraucht.
- Sehr kleiner Eingriff, sauber entfernbar mit `-Uninstall`.
- WebSocket mit der Standardbibliothek: Die Dateiüberwachung nutzt `fs.watch` (mit Entprellung) und zusätzlich eine Sicherheitsabfrage alle 2 Sekunden.
- Der Server liest die Exportdatei bei jeder Anfrage komplett ein. Damit passen Dateilänge und Inhalt zusammen, auch wenn EEP die Datei gerade neu schreibt.

**Nachteile**

- Node.js muss schon installiert sein (das Skript installiert es nicht).
- Kein Autostart (wie bei Python).
- Das Paket `npx` wird nicht verwendet da dessen `http-server` weder nur `.json`/`.anl3` ausliefern noch CORS nur für bestimmte Origins freigeben könnte. Deshalb enthält das Skript einen eigenen, abhängigkeitsfreien Server, der mit `node` gestartet wird.

### Welche Variante?

- **Dauerbetrieb ohne Handgriffe:** IIS.
- **Wenige Änderungen am System, Internet vorhanden:** Python.
- **Node.js ist ohnehin installiert oder es gibt kein Internet:** Node.js.

### WebSocket (Python und Node.js)

Die Bridge liest die Exportdatei zuerst per HTTPS und öffnet dann eine WebSocket-Verbindung auf derselben Adresse (`https://` wird zu `wss://`, `http://` zu `ws://`). Der Server sendet die komplette Datei sofort und danach nach jeder Änderung. Solange die Verbindung steht, fragt die Bridge nicht mehr ab. Bricht sie ab, fragt die Bridge wieder per HTTPS ab und versucht nach 5 Sekunden eine neue Verbindung.

- **Gleiche Regeln wie bei HTTP:** Nur `.json` und `.anl3`, Zugriff nur mit `GET`. Weil Browser bei WebSockets kein CORS prüfen, prüft der Server die Origin selbst (gleiche Regeln wie bei CORS). Eine fremde Origin erhält `403`. `file://` und `null` sind nur mit `-AllowNullOrigin` erlaubt.
- **Nur gültiges JSON:** Schreibt EEP die Datei gerade, wird der unvollständige Stand nicht gesendet, sondern kurz später erneut gelesen.
- **Eine Überwachung je Datei**, egal wie viele Clients verbunden sind. Sie läuft nur, solange mindestens ein Client verbunden ist.
- **Grenzen:** höchstens 50 gleichzeitige WebSocket-Verbindungen (weitere erhalten `503`), Ping alle 25 Sekunden, Clients, die nichts mehr abnehmen oder antworten, werden getrennt.
- **IIS:** Diese Variante liefert nur per HTTPS aus, ein WebSocket wäre hier zu aufwendig. Die Bridge fragt dann im eingestellten Intervall ab.
- **Hinweis für kleine Anlagen:** Mit WebSocket (Python, Node.js) ist die Übertragung so effizient, dass in `EepExport.lua` `interval = 0` gewählt werden kann (Export bei jedem Aufruf von `run()`, das sind 5 Aufrufe je Sekunde). Bei großen Anlagen kostet der häufige Export Rechenzeit in EEP; dann ein größeres Intervall wählen.

---

## 3. Aufruf und Nutzung am Beispiel `-SitePath C:/EEP17 -HttpsPort 3001`

Das Beispiel gilt für alle drei Varianten. `C:/EEP17` und `C:\EEP17` werden gleich behandelt. Setze für `-SitePath` den Ordner ein, in dem bei dir `eep_export.json` und die `.anl3`-Datei liegen (siehe Abschnitt 1).

### 3.1 Vorbereitung

1. Skripte in einen Ordner kopieren, z. B. `C:\Users\<Name>\Documents\GitHub\EEP_convert_anl3_file\WebServer`.
2. **Windows PowerShell als Administrator** öffnen (Start → „Windows PowerShell" → Rechtsklick → *Als Administrator ausführen*) und in den Ordner wechseln:

   ```powershell
   cd "C:\Users\<Name>\Documents\GitHub\EEP_convert_anl3_file\WebServer"
   ```

3. Meldung „nicht digital signiert"? Heruntergeladene Skripte sind als „aus dem Internet" markiert. Die Markierung entfernt man einmalig:

   ```powershell
   Unblock-File .\Install-IIS-web-server.ps1
   Unblock-File .\Install-Python-web-server.ps1
   Unblock-File .\Install-node-web-server.ps1
   ```

   Falls nötig, gilt zusätzlich für dieses eine Fenster: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

Ohne Parameter aufgerufen, zeigt jedes Skript nur die wichtigsten Optionen (`-SitePath`, `-HttpPort`, `-HttpsPort`) und ändert nichts.

### 3.2 Installation

**IIS**

```powershell
.\Install-IIS-web-server.ps1 -SitePath C:/EEP17 -HttpsPort 3001
```

**Python**

```powershell
.\Install-Python-web-server.ps1 -SitePath C:/EEP17 -HttpsPort 3001
```

**Node.js**

```powershell
.\Install-node-web-server.ps1 -SitePath C:/EEP17 -HttpsPort 3001
```

Das Skript prüft zuerst die Voraussetzungen (beim Node.js-Skript als Erstes, ob `node` vorhanden ist), führt dann die Installation durch und endet mit den Abschlusstests. Alle Zeilen müssen `[OK]` zeigen. Bei Python und Node.js gehört dazu ein WebSocket-Test: Er legt kurz die Datei `wstest.json` im Datenordner an und löscht sie wieder. Fehlt im Datenordner noch eine `.json`- oder `.anl3`-Datei, legt das Skript Beispieldateien `daten.json` und `beispiel.anl3` an, mit denen die Tests laufen.

### 3.3 Server starten (nur Python und Node.js)

Der Testserver wird nach den Tests wieder beendet. Zum Arbeiten startet man den Server selbst. Das Fenster muss offen bleiben, **Strg+C** beendet ihn. Es zeigt das Protokoll (INFO grau, WARNING gelb, ERROR rot); dieselben Zeilen stehen in `server.log`.

```powershell
# Python
& "C:\ProgramData\EEP-Python-Server\venv\Scripts\python.exe" "C:\ProgramData\EEP-Python-Server\server.py"

# Node.js (der genaue Pfad zu node.exe steht am Ende der Skriptausgabe)
& "C:\Program Files\nodejs\node.exe" "C:\ProgramData\EEP-Node-Server\server.js"
# alternativ
npm start --prefix "C:\ProgramData\EEP-Node-Server"
```

Beim IIS ist nichts zu starten, der Dienst läuft bereits.

### 3.4 Prüfen

Im Browser auf dem EEP-Rechner:

- `https://localhost:3001/daten.json` zeigt die Beispieldatei.
- `https://localhost:3001/eep_export.json` zeigt den Export, sobald EEP ihn geschrieben hat.
- `https://localhost:3001/test.txt` oder `https://localhost:3001/` liefern 404 (gewollt).
- Python und Node.js: Verbindet sich die Bridge per WebSocket, erscheint im Protokoll eine Zeile `"WS /eep_export.json" 101` und die Statuszeile der Bridge zeigt „WebSocket“ statt „HTTP“.

### 3.5 Bridge und Gleisplan verwenden

Bridge und Gleisplan müssen **vom selben Server stammen** (gleiche Origin), damit sie per `BroadcastChannel` miteinander sprechen können. Der beschriebene Webserver liefert bewusst nur Daten aus. Bridge und Gleisplan öffnet man deshalb entweder im Web (GitHub Pages) oder von einer lokalen Kopie (siehe [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"), Abschnitt 2.2).

**Bridge**: Die Daten per URL abfragen, entweder im Feld **URL** mit Klick auf *URL abfragen* oder direkt über den Parameter `url`:

```
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Export_Bridge.html?url=https://localhost:3001/eep_export.json
```

**Gleisplan**: Die Anlage-Datei per URL laden, entweder im Feld **URL laden** oder ebenfalls per Parameter `url`:

```
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html?url=https://localhost:3001/MeineAnlage.anl3
```

Beim ersten Zugriff fragt Chrome, ob die Seite auf Geräte im lokalen Netzwerk zugreifen darf. Das mit *Zulassen* bestätigen. Der Server muss dafür nichts senden. Die entsprechende Hinweismeldung in den DevTools ist kein Fehler.

Bei Python und Node.js wechselt die Bridge nach dem ersten Abruf automatisch auf WebSocket (Statuszeile: „WebSocket“). Das Intervall **alle … s** gilt dann nicht mehr. Beim IIS bleibt es bei der Abfrage.

Die `.anl3`-Datei wird vom Gleisplan nur einmalig geladen. Wurde die Anlage in EEP geändert und gespeichert, lädt man sie im Gleisplan erneut.

### 3.6 Zugriff von einem anderen Rechner im Heimnetz

1. Das Skript mit `-OpenFirewall` ausführen. Die Regel gilt nur für die Netzwerkprofile *Privat* und *Domäne*:

   ```powershell
   .\Install-node-web-server.ps1 -SitePath C:/EEP17 -HttpsPort 3001 -OpenFirewall
   ```

2. Die erzeugte Datei `EEP Export.cer` (liegt neben dem Skript) auf den anderen Rechner kopieren und dort als **vertrauenswürdige Stammzertifizierungsstelle** (Zertifikatsspeicher *Lokaler Computer*) importieren. Sonst meldet der Browser einen Zertifikatsfehler.
3. Im Browser oder in der Bridge die IP-Adresse des EEP-Rechners verwenden, z. B. `https://192.168.0.115:3001/eep_export.json`, und im Gleisplan entsprechend `https://192.168.0.115:3001/MeineAnlage.anl3`.

Das Zertifikat enthält die IP-Adressen, die der PC bei der Installation hatte. Ändert sich die IP-Adresse (DHCP), das Skript einfach erneut ausführen (oder dem EEP-Rechner eine feste IP geben) und die `.cer`-Datei neu importieren.

### 3.7 Bridge als lokale Datei (`file:///`)

Öffnet man die Bridge direkt aus dem Dateisystem, sendet der Browser bei Abfragen die Origin `null` (Chrome bei WebSockets `file://`), und der Server blockiert sie. Mit `-AllowNullOrigin` werden `null` und bei Python und Node.js auch `file://` freigegeben:

```powershell
.\Install-node-web-server.ps1 -SitePath C:/EEP17 -HttpsPort 3001 -AllowNullOrigin
```

**Achtung:** Die Origin `null` sendet der Browser auch bei Seiten in Sandbox-Frames fremder Websites. Mit dieser Option kann also jede solche Seite die Daten lesen (sofern der Browser den Server erreicht). Nur verwenden, wenn die Bridge wirklich lokal läuft. Die Alternative ist, die Bridge über GitHub Pages zu öffnen.

### 3.8 Weitere Optionen

| Option | Bedeutung | Varianten |
|---|---|---|
| `-SitePath <Pfad>` | Verzeichnis mit den Daten (`eep_export.json` und `.anl3`) | alle |
| `-HttpsPort <Port>` | HTTPS-Port (Standard 443) | alle |
| `-HttpPort <Port>` | optionaler HTTP-Port mit Umleitung auf HTTPS (Standard 0 = keiner) | alle |
| `-GitHubOrigins "https://name.github.io"` | erlaubte GitHub-Origin(s), nur Schema und Host | alle |
| `-AllowNullOrigin` | Origin `null` erlauben, bei Python und Node.js auch `file://` für WebSocket (Bridge als lokale Datei) | alle |
| `-OpenFirewall` | Firewall-Regel für den/die Port(s) (Privat, Domäne) | alle |
| `-PfxPath <Datei>` `-PfxPassword` | eigenes Zertifikat statt selbstsigniert | alle |
| `-SiteName <Name>` | Name der Website bzw. der Firewall-Regel (Standard `EEP Export`) | alle |
| `-SkipTlsHardening` | TLS 1.0/1.1 nicht deaktivieren | nur IIS |
| `-InstallPath <Pfad>` | Ort von Server, Zertifikat und Log (Standard unter `C:\ProgramData`) | Python, node.js |
| `-Uninstall` | Server, Firewall-Regel und `InstallPath` entfernen | Python, node.js |

Alle Optionen mit Erklärung: `Get-Help .\<Skript>.ps1 -Detailed`.

### 3.9 Erneut ausführen, aktualisieren, entfernen

- **Erneut ausführen:** Das Skript aktualisiert die bestehende Installation auf die aktuellen Angaben. Beim IIS wird eine Website gleichen Namens auf die neuen Angaben konfiguriert, andere Websites bleiben unberührt.
- **Python / node entfernen:** `.\Install-Python-web-server.ps1 -Uninstall` bzw. `.\Install-node-web-server.ps1 -Uninstall`. Das entfernt den Server, die Firewall-Regel und den Installationsordner. Unverändert bleiben der Datenordner (`-SitePath`), Python bzw. Node.js und das Zertifikat im Windows-Speicher (`certlm.msc` → *Vertrauenswürdige Stammzertifizierungsstellen*).
- **IIS entfernen:** Website `EEP Export` im IIS-Manager löschen, die Firewall-Regel `IIS EEP Export` entfernen und die `web.config` aus dem Datenordner löschen.

---

## 4. Fehlersuche

| Meldung / Problem | Ursache und Lösung |
|---|---|
| „… nicht digital signiert" | `Unblock-File` ausführen (siehe 3.1). |
| „… muss in einer PowerShell mit Administratorrechten gestartet werden" | Windows PowerShell mit Rechtsklick → *Als Administrator ausführen* öffnen. |
| „PowerShell 7 erkannt" | `powershell.exe` (Windows PowerShell 5.1) statt `pwsh.exe` verwenden. |
| „Port … wird von Prozess … belegt" | Anderes Programm oder andere Website nutzt den Port. Anderen Port wählen (`-HttpsPort`) oder das Programm selbst beenden. Das Skript beendet fremde Programme nie. |
| „Node.js (node.exe) wurde nicht gefunden" | Node.js LTS installieren (`winget install OpenJS.NodeJS.LTS` oder <https://nodejs.org>), neue PowerShell als Administrator öffnen, Skript erneut starten. |
| Chrome: „blocked by CORS policy … from origin 'null'" | Bridge wurde als lokale Datei geöffnet. Entweder über GitHub Pages öffnen oder `-AllowNullOrigin` verwenden (siehe 3.7). |
| Chrome: Hinweis zum lokalen Netzwerk („privileged network position") | Kein Fehler. Berechtigung einmal erteilen (siehe 3.5). |
| Zertifikatswarnung auf einem anderen Gerät | `EEP Export.cer` dort als vertrauenswürdige Stammzertifizierungsstelle importieren (siehe 3.6). |
| Bridge zeigt „Fehler: Failed to fetch" | Server nicht erreichbar (läuft er? Firewall? IP-Adresse geändert?), Zertifikat nicht vertraut oder Origin nicht erlaubt (CORS). |
| Gleisplan zeigt bei **URL laden** „Fehler: …" | Wie zuvor. Zusätzlich: Die `.anl3`-Datei liegt nicht im `-SitePath`, oder der Dateiname in der URL stimmt nicht. |
| Log: `"WS …" 403 Forbidden (Origin: …)` (Python, Node.js) | Die Origin der Bridge ist nicht erlaubt. Bridge von GitHub Pages oder aus dem lokalen Netz öffnen, bei einer lokalen Datei `-AllowNullOrigin` verwenden (siehe 3.7). Die Bridge fragt in der Zwischenzeit weiter per HTTPS ab. |
| Statuszeile der Bridge zeigt dauernd „HTTP“ statt „WebSocket“ | Kein WebSocket möglich: IIS-Variante, Quelle ist keine `http(s)`-URL, Verbindung abgelehnt (`403`, `404`, `503` bei mehr als 50 Verbindungen) oder ein älterer Server ohne WebSocket (Skript erneut ausführen). Die Daten kommen trotzdem per Abfrage, die Bridge versucht alle 5 Sekunden eine neue Verbindung. |
| Abschlusstest „WebSocket: …“ schlägt fehl | Details stehen hinter der Meldung. Meist ist die Datei im `-SitePath` nicht beschreibbar (der Test legt `wstest.json` an) oder ein Sicherheitsprogramm blockiert die Verbindung. |
| Aufruf funktioniert nicht, obwohl der Test `[OK]` zeigt | `eep_export.json` bzw. die `.anl3`-Datei liegt nicht im `-SitePath`, oder der Server (Python/Node.js) läuft nicht mehr. |

**Protokolle**

- Python: `C:\ProgramData\EEP-Python-Server\logs\server.log`
- Node.js: `C:\ProgramData\EEP-Node-Server\logs\server.log`
- IIS: `C:\inetpub\logs\LogFiles`
