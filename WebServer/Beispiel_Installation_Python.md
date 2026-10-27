PS C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer> <span style="color: #D3A000;">Unblock-File</span> .\Install-python-web-server.ps1<br>
PS C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer> <span style="color: #D3A000;">.\Install-python-web-server.ps1</span> -SitePath C:\EEP17 -HttpsPort 3001 -AllowNullOrigin -ActivateCommands<br>
<span style="color: #00b3d3;">0/6 Vorpruefungen ...</span><br>
<span style="color: #D3A000;">WARNUNG: -AllowNullOrigin: Die Origins 'null' und 'file://' werden freigegeben. Sie stammen von file://-Seiten (Chrome sendet bei WebSockets 'file://'), aber 'null' auch von Sandbox-Frames fremder Seiten.</span><br>
<span style="color: #D3A000;">WARNUNG: -ActivateCommands: POST /send-command schreibt Befehle (ANSI) nach 'exchange\commands-to-eep.txt' unterhalb von SitePath, wo EEP sie liest. Erlaubt sind Browser-Seiten der zugelassenen Origins (lokales Netz, GitHub) und Anfragen ohne Origin (z.B. curl) nur von diesem Rechner. Nur in vertrauenswuerdigen Netzen verwenden.</span><br>
<span style="color: #D3A000;">WARNUNG: -ActivateCommands zusammen mit -AllowNullOrigin: Auch jede Seite in einem Sandbox-Frame (Origin 'null') kann Befehle an EEP senden. Wird die Bridge nicht aus einer lokalen Datei (file://) gestartet, -AllowNullOrigin weglassen.</span><br>
<span style="color: #00FF00;">   Alle Vorpruefungen bestanden.</span><br>
<span style="color: #00b3d3;">1/6 Python ...</span><br>
   Verwendet: C:\Program Files\Python312\python.exe<br>
<span style="color: #00b3d3;">2/6 Verzeichnisse und Python-Umgebung ...</span><br>
<span style="color: #00b3d3;">3/6 Konfiguration und Zertifikat ...</span><br>
   neues selbstsigniertes Zertifikat erzeugt<br>
   Zertifikat exportiert: C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer\EEP Export Python (LAPTOP).cer (auf Geraeten im LAN importieren)<br>
<span style="color: #00b3d3;">   Zertifikat: neu erzeugt (selbstsigniert)</span><br>
      Name (CN):          EEP Export Python (LAPTOP)<br>
      Typ:                selbstsigniert<br>
      Gueltig ab:         2026-10-26 16:54<br>
      Gueltig bis:        2028-10-25 17:59 (noch 730 Tage)<br>
      Gueltig fuer:       DNS-Name=laptop<br>
       :                  DNS-Name=laptop.local<br>
       :                  DNS-Name=localhost<br>
       :                  IP-Adresse=127.0.0.1<br>
       :                  IP-Adresse=192.168.0.115<br>
       :                  IP-Adresse=192.168.0.17<br>
       :                  IP-Adresse=0000:0000:0000:0000:0000:0000:0000:0001<br>
      Schluessel:         RSA 2048 Bit<br>
      Signatur:           sha256RSA<br>
      Seriennummer:       39F963BF9F556DE7068F17FDCABFDC1E60269AD4<br>
      Fingerabdruck:      830B183BC44014D01E50F67B4CBA2B5F5E2B1616<br>
      Vertrauenswuerdig:  ja (Stammzertifizierungsstellen dieses PCs)<br>
<span style="color: #00b3d3;">   Ablage:</span><br>
      Server-Zertifikat (PEM):          C:\ProgramData\EEP-Python-Server\certs\server.crt<br>
      privater Schluessel (PEM):        C:\ProgramData\EEP-Python-Server\certs\server.key<br>
      oeffentlicher Teil (.cer):        C:\ProgramData\EEP-Python-Server\certs\server.cer<br>
      Kopie fuer andere Geraete:        C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer\EEP Export Python (LAPTOP).cer<br>
      Vertrauensspeicher dieses PCs:    Lokaler Computer > Vertrauenswuerdige Stammzertifizierungsstellen (certlm.msc), Name 'EEP Export Python (LAPTOP)'<br>
<span style="color: #00b3d3;">4/6 Server und Webseiten-Inhalt ...</span><br>
   Startdatei: C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer\EEP Export Server starten (Python).cmd<br>
<span style="color: #00b3d3;">5/6 Firewall ...</span><br>
   Uebersprungen (nur lokaler Zugriff). Fuer Zugriff aus dem LAN: -OpenFirewall<br>
<span style="color: #00b3d3;">6/6 Teststart und Tests ...</span><br>
<span style="color: #00FF00;">   \[OK]      Port 3001 lauscht (eigener Server)</span><br>
<span style="color: #00FF00;">   \[OK]      HTTPS daten.json: Status 200</span><br>
<span style="color: #00FF00;">   \[OK]      daten.json hat den Typ application/json</span><br>
<span style="color: #00FF00;">   \[OK]      HSTS-Header wird gesendet</span><br>
<span style="color: #00FF00;">   \[OK]      CORS: localhost erlaubt</span><br>
<span style="color: #00FF00;">   \[OK]      CORS: lokales Netzwerk erlaubt (https://192.168.1.50)</span><br>
<span style="color: #00FF00;">   \[OK]      CORS: GitHub-Origin erlaubt (https://frankbuchholz.github.io)</span><br>
<span style="color: #00FF00;">   \[OK]      CORS: fremde Origin wird NICHT freigegeben</span><br>
<span style="color: #00FF00;">   \[OK]      CORS: Origin 'null' (lokale Datei) erlaubt</span><br>
<span style="color: #00FF00;">   \[OK]      CORS-Preflight (OPTIONS): Status 204</span><br>
<span style="color: #00FF00;">   \[OK]      PNA: Preflight mit Private-Network-Anfrage wird freigegeben</span><br>
<span style="color: #00FF00;">   \[OK]      PNA: ohne Anfrage des Browsers wird der Header nicht gesendet</span><br>
<span style="color: #00FF00;">   \[OK]      PNA: fremde Origin wird NICHT freigegeben</span><br>
<span style="color: #00FF00;">   \[OK]      POST-Preflight (OPTIONS) wird freigegeben: Status 204</span><br>
<span style="color: #00FF00;">   \[OK]      POST: fremde Origin wird abgelehnt: Status 403</span><br>
<span style="color: #D3A000;">WARNUNG: Die Kommando-Datei C:\EEP17\exchange\commands-to-eep.txt existiert bereits: Die Schreibtests werden uebersprungen, damit keine Befehle verloren gehen oder ausgeloest werden.</span><br>
<span style="color: #00FF00;">   \[OK]      beispiel.anl3 wird ausgeliefert: Status 200</span><br>
<span style="color: #00FF00;">   \[OK]      Andere Dateitypen (.txt) sind gesperrt: Status 404</span><br>
<span style="color: #00FF00;">   \[OK]      Verzeichnisauflistung ist gesperrt: Status 404</span><br>
<span style="color: #00FF00;">   \[OK]      WebSocket: Datei beim Verbinden, Push bei Aenderung, fremde Origin abgelehnt</span><br>
<br>
<span style="color: #00FF00;">Fertig. Alle Pruefungen bestanden; der Testserver wurde wieder beendet (kein Autostart).</span><br>
<span style="color: #D3A000;">Server starten: Doppelklick auf  C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer\EEP Export Server starten (Python).cmd (Strg+C beendet ihn)</span><br>
  (oder in einer PowerShell:  & "C:\ProgramData\EEP-Python-Server\venv\Scripts\python.exe" "C:\ProgramData\EEP-Python-Server\server.py")<br>
<span style="color: #00FF00;">Befehle fuer EEP sind aktiv (POST https://localhost:3001/send-command -> C:\EEP17\exchange\commands-to-eep.txt).</span><br>
  Test von diesem Rechner: curl.exe --data-binary "Befehl" https://localhost:3001/send-command<br>
Danach erreichbar unter: https://localhost:3001/exchange/daten.json   (WebSocket mit wss statt https)<br>
Log: C:\ProgramData\EEP-Python-Server\logs\server.log    Deinstallation: .\Install-Python-web-server.ps1 -Uninstall<br>
Zertifikat: EEP Export Python (LAPTOP), Ablage in C:\ProgramData\EEP-Python-Server\certs<br>
Zum Import auf anderen Geraeten: C:\Users\frank\Documents\GitHub\EEP_convert_anl3_file\WebServer\EEP Export Python (LAPTOP).cer<br>