# Projekt: EEP_convert_anl3_file

Dieses Projekt enthält Programme zur Analyse, Darstellung und Konvertierung von Gleisplänen von EEP sowie zur Live-Anzeige und Bedienung einer laufenden EEP-Anlage im Browser.

| Programm | Zweck | Dokumentation |
| --- | --- | --- |
| [`EEP_Gleisplan.html`](EEP_Gleisplan.html "EEP_Gleisplan.html") | Gleisplan einer Anlage im Browser, optional mit Live-Daten und Bedienung | dieser Text |
| [`EEP_Inventar.html`](EEP_Inventar.html "EEP_Inventar.html") | Inventarlisten einer Anlage | dieser Text |
| [`EEP_Signale.html`](EEP_Signale.html "EEP_Signale.html") | Signalstellungen | dieser Text |
| [`EEP_GBS.html`](EEP_GBS.html "EEP_GBS.html") | Gleisbildstellpulte (GBS) einer Anlage anzeigen und bedienen, `.anl3` und `.gbs` ineinander umwandeln | dieser Text |
| [`EEP_Export_Bridge.html`](EEP_Export_Bridge.html "EEP_Export_Bridge.html") + [`EepExport.lua`](Lua/EepExport.lua "EepExport.lua") + `CommandExecution.lua` | Live-Zustand einer laufenden Anlage (Züge, Signale, Weichen, Zeit, Wetter), optional mit Befehlen an EEP | [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge") |
| Webserver-Skripte (Python, Node.js, IIS) | liefern `exchange\eep_export.json` und `.anl3` aus und nehmen Befehle für EEP an | [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer") |
| Zertifikat für andere Geräte | macht den Webserver auf Laptop, Tablet und Smartphone vertrauenswürdig | [`README_Zertifikatsverteilung_Heimnetzwerk`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_Zertifikatsverteilung_Heimnetzwerk.html "README_Zertifikatsverteilung_Heimnetzwerk") |

**Aufbau der Dokumentation:** Jede README-Datei hat zwei Teile. **Teil 1 (Benutzer-Dokumentation)** erklärt, was man tun muss. **Teil 2 (Technische Details)** beschreibt, wie es funktioniert, und ist für Entwickler und für die Fehlersuche gedacht. Wer nur anwenden will, liest nur Teil 1.

---

# Teil 1: Benutzer-Dokumentation

## 1. Welches Szenario passt zu mir?

Die Programme laufen im Browser (Chrome, Edge oder Firefox). Je nachdem, was du brauchst, ist mehr oder weniger Einrichtung nötig. Es gibt vier empfohlene Szenarien:

| Szenario | Was bekomme ich? | Was brauche ich zusätzlich? |
| --- | --- | --- |
| **A** Nur statischer Gleisplan | Gleisplan, Inventar und Signalstellungen einer `.anl3`-Datei | nichts, nur einen Browser |
| **B** Live-Daten und EEP-Befehle auf dem Rechner mit EEP | Züge, Signale und Weichen live im Gleisplan, Bedienung von EEP aus dem Browser | Lua-Module `EepExport` und `CommandExecution` in der Anlage, Webserver (Python oder Node.js) |
| **C** Live-Daten und EEP-Befehle auf einem anderen Rechner im Heimnetz | wie B, aber auf Laptop, Tablet oder Smartphone | wie B, zusätzlich Firewall-Freigabe und Zertifikat auf dem anderen Gerät |
| **D** Lokale Installation der Programme | alle Möglichkeiten von A bis C, auch ohne Internet | Archiv entpacken, dazu je nach Wunsch wie bei B und C |

### Szenario A: Nur statischer Gleisplan

![Szenario A](images/EEP_Szenario_A.svg "Szenario A")

Du rufst die Programme über die GitHub-Links auf und lädst eine Anlage-Datei. Es gibt keinen Webserver, keine Bridge, keine Live-Daten und keine EEP-Befehle.

1. Programm im Browser öffnen: [Gleisplan](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html "EEP_Gleisplan.html"), [Inventar](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Inventar.html "EEP_Inventar.html"), [Signale](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Signale.html "EEP_Signale.html") oder [GBS](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_GBS.html "EEP_GBS.html").
2. Anlage-Datei (`.anl3` oder `.zip`, beim GBS auch `.gbs`) per Datei-Auswahl, Drag&Drop oder URL laden.
3. Bedienung siehe Abschnitte 2 bis 4 und 6.

### Szenario B: Live-Daten und EEP-Befehle auf dem Rechner mit EEP

![Szenario B](images/EEP_Szenario_B.svg "Szenario B")

EEP, Webserver und Browser laufen auf demselben Rechner. Die Anlage schreibt mit `EepExport.lua` ihren Zustand in eine JSON-Datei und liest mit `CommandExecution.lua` die Befehle, die der Webserver entgegennimmt. Bridge und Gleisplan zeigen den Zustand live und können Signale, Weichen und Züge bedienen. Auch die Stellpulte im [GBS-Programm](#6-programm-eep_gbshtml) lassen sich auf diesem Weg live anzeigen und bedienen.

1. **Lua-Module in die Anlage einbinden** (`EepExport` und `CommandExecution`): [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html#1-lua-module-in-eine-anlage-einbinden "README_Export_Bridge"), Abschnitt 1.
2. **Webserver installieren** (Python oder Node.js, mit `-ActivateCommands`): [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer"), Abschnitt 3.
3. **Bridge und Gleisplan öffnen**, entweder über die GitHub-Links oder über den Webserver (Option `-ProxyGitHub`), und die Daten per URL laden: [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"), Abschnitte 3 bis 5.

### Szenario C: Live-Daten und EEP-Befehle auf einem anderen Rechner im Heimnetz

![Szenario C](images/EEP_Szenario_C.svg "Szenario C")

EEP läuft auf einem Rechner, der Browser auf einem anderen Gerät im Heimnetz (zweiter PC, Tablet, Smartphone). Der Webserver auf dem EEP-Rechner liefert dem Browser sowohl die Programme (Bridge, Gleisplan) als auch die Dateien `eep_export.json` und `.anl3` und nimmt die Befehle entgegen.

1. Lua-Module einbinden wie bei Szenario B.
2. Webserver auf dem EEP-Rechner installieren, mit `-ActivateCommands`, `-OpenFirewall` und `-ProxyGitHub`.
3. Die erzeugte `.cer`-Datei auf dem anderen Gerät importieren: [`README_Zertifikatsverteilung_Heimnetzwerk`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_Zertifikatsverteilung_Heimnetzwerk.html "README_Zertifikatsverteilung_Heimnetzwerk").
4. Auf dem anderen Gerät Bridge und Gleisplan **über den Webserver** aufrufen, z. B. `https://192.168.0.115:3001/EEP_Export_Bridge?url=/exchange/eep_export.json`.

### Szenario D: Lokale Installation der Programme

![Szenario D](images/EEP_Szenario_D.svg "Szenario D")

Das Archiv [`EEP_convert_anl3_file.zip`](https://frankbuchholz.github.io/EEP_convert_anl3_file/dist/EEP_convert_anl3_file.zip "EEP_convert_anl3_file.zip") wird in einem beliebigen Ordner entpackt. Die Programme laufen dann ohne Internetverbindung. Alle Möglichkeiten der Szenarien A bis C stehen zur Verfügung:

- **Statischer Gleisplan (A):** HTML-Datei im Browser öffnen und die Anlage laden.
- **Live-Daten und Befehle (B, C):** Webserver und Lua-Module wie dort beschrieben einrichten. Die Seiten kommen dann aus der lokalen Kopie. Ohne Befehle kann die Bridge die JSON-Datei auch direkt lesen (*Datei live verfolgen*, Chrome oder Edge).
- Bridge und Gleisplan müssen aus demselben Ursprung geöffnet werden, um miteinander zu sprechen. Das Öffnen als `file://` verhält sich je nach Browser unterschiedlich; Einzelheiten und Alternativen stehen in [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"), Abschnitt 3.
- Nur die Webserver-Option `-ProxyGitHub` braucht Internet, weil sie die Seiten von GitHub holt.

## 2. Programm: EEP_Gleisplan.html

Der Gleisplan zu einer EEP-Anlage wird im Browser angezeigt. Solche EEP-Anlagen findest du z. B. hier:
[https://www.eepforum.de/filebase/category-file-list/39-kostenlose-anlagen-ab-eep-7/](https://www.eepforum.de/filebase/category-file-list/39-kostenlose-anlagen-ab-eep-7/ "Kostenlose Anlagen ab EEP 7")

**Aufruf:** [https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html "EEP_Gleisplan.html")

### Anlage laden

Die Anlage-Datei (`.anl3` oder `.zip`) lässt sich per Datei-Auswahl, Drag&Drop oder URL laden (Eingabefeld **URL laden** bzw. Aufruf mit `EEP_Gleisplan.html?url=<Adresse der .anl3- oder .zip-Datei>`). Schlägt das Laden einer URL fehl, erscheint eine rote Meldung mit der wahrscheinlichen Ursache.

**Zip-Dateien:** Anlage-Dateien werden oft als `.zip` angeboten. Du kannst die `.zip`-Datei direkt angeben, ein vorheriges Entpacken ist nicht nötig. Das Archiv muss genau eine `.anl3`-Datei enthalten (oben oder in einem Verzeichnis), sonst erscheint eine Fehlermeldung. Der Name der enthaltenen `.anl3`-Datei wird angezeigt und beim Bildexport verwendet. Verschlüsselte Archive und zip64 (über 4 GB) werden nicht unterstützt.

### Mausfunktionen

Verschieben: Klick+Halten+Bewegen  
An der Stelle des Cursors hineinzoomen: Doppelklick  
Herauszoomen: <kbd>&#x21E7; Shift</kbd>+Doppelklick  
Details anzeigen: Klick auf Gleis, Symbol, Text oder (bei Live-Anzeige) Zug

- wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann wird jeweils ein neues Popup geöffnet
- wenn zusammen mit <kbd>alt</kbd>, dann wird zusätzlich der Code aus der Anlage-Datei für dieses Objekt angezeigt (bei Zügen: die Liste der Fahrzeuge)

### Tastaturfunktionen

<kbd>&larr;</kbd> <kbd>&uarr;</kbd> <kbd>&rarr;</kbd> <kbd>&darr;</kbd> : Verschieben der Graphik (wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann jeweils um eine halbe Seite)  
<kbd>+</kbd> <kbd>-</kbd> : Zoomen

### Touch-Bedienung (Tablet, Smartphone)

Ein Finger verschiebt, zwei Finger zoomen. Der Kopfbereich lässt sich mit dem Pfeil-Knopf links oben ein- und ausklappen, um mehr Platz für den Plan zu haben. Langdruck auf ein Signal, eine Weiche, einen Zug oder eine Kamera öffnet (bei aktiven EEP-Befehlen) ein Kontextmenü.

### Interaktive Funktionen

- Wechsel zwischen vertikaler und horizontaler Ausrichtung (Fullscreen mit <kbd>F11</kbd>), Zoom-in, -out, -reset
- Auswahl der anzuzeigenden Gleissysteme und von Informationen wie Texten oder Markern
- Überlappende Texte von Signalen, Weichen und Kontakten werden automatisch entzerrt (abschaltbar mit der Checkbox *Texte entzerren*)
- Aktuelle Darstellung als Bild (`.png`/`.jpg`/`.svg`) speichern
- Gleisplan auf ein bestimmtes Gleis, ein Signal oder eine Weiche positionieren (auch über das Inventar-Programm möglich)
- Einstellung der Linienbreite und der Schriftgröße, Höhenfilter (minimale und maximale Höhe), Farben der Gleissysteme anpassen
- Anzeige der Fahrstraßen (alle bzw. von bestimmten Start-Signalen oder zu bestimmten Ende-Signalen)
- **Live-Anzeige** von Zügen sowie Signal- und Weichenstellungen einer laufenden EEP-Anlage mit Infobox zu Zügen und Fahrzeugen (Szenarien B bis D, siehe [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"))
- **Befehle an EEP** (optional): Signale und Weichen stellen, Geschwindigkeit und Route von Zügen setzen, Kameras und Verfolgerkamera aufrufen, über die Infobox oder ein Kontextmenü (<kbd>Strg</kbd>+Klick, Rechtsklick, Langdruck auf dem Tablet)

### Tipp zum Export als svg

Die Export-Funktion im Programm exportiert den gezeigten Ausschnitt der svg-Graphik. Die gesamte Graphik exportierst du mit dem Entwickler-Tool des Browsers:

- Google Chrome: Rechts-Klick in der Graphik &rarr; Inspect <kbd>Ctrl+Shift+I</kbd> &rarr; Das svg-Element wird blau hinterlegt angezeigt &rarr; Rechts-Klick darauf &rarr; Copy &rarr; Copy Element
- Firefox: Rechts-Klick in der Graphik &rarr; Element untersuchen &rarr; Das svg-Element wird blau hinterlegt angezeigt &rarr; Rechts-Klick darauf &rarr; Kopieren &rarr; Äußeres HTML

Das svg-Element aus der Zwischenablage kannst du in ein leeres Textdokument einfügen und als `.svg`-Datei speichern.

### Referenz

Diskussionsbeitrag im [EEP-Forum](https://www.eepforum.de/forum/thread/26770-eep-gleisplan-im-browser-anzeigen-javascript-projekt).

## 3. Programm: EEP_Inventar.html

Anzeige einer Inventarliste zu einer EEP-Anlage.

**Aufruf:** [https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Inventar.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Inventar.html "EEP_Inventar.html")

Ausgegeben werden Listen der Weichen, Signale, Kontakte, virtuellen Verbindungen, Zugverbände, Depots, Rollmaterialien, Gleisstile, Gleisobjekte und Kameras sowie die Gleisbildstellpulte. Die Anlage-Datei (`.anl3` oder `.zip` mit genau einer `.anl3`-Datei, siehe *Zip-Dateien*) lädst du per Datei-Auswahl, Drag&Drop oder URL (Eingabefeld **URL laden** bzw. Aufruf mit `EEP_Inventar.html?url=<Adresse der .anl3- oder .zip-Datei>`).

### Interaktive Funktionen

Man kann die Tabellen (bei Firefox auch mit Strg+A) mit Copy & Paste in ein Tabellenverarbeitungsprogramm übertragen. Dazu schaltet man am besten zuvor die Anzeige der Filter-Zeile aus. Die Tabellen lassen sich mit Klicks in die Spaltenüberschriften sortieren.

[Filter-Operatoren](https://github.com/koalyptus/TableFilter/wiki/4.-Filter-operators):  
<kbd>&lt;</kbd>, <kbd>&lt;=</kbd>, <kbd>=</kbd>, <kbd>&gt;=</kbd>, <kbd>&gt;</kbd>, <kbd>*</kbd>, <kbd>!</kbd> (nicht), <kbd>{</kbd> (beginnt mit), <kbd>}</kbd> (endet mit), <kbd>||</kbd> (oder), <kbd>&amp;&amp;</kbd> (und), <kbd>[empty]</kbd>, <kbd>[nonempty]</kbd>, <kbd>rgx:</kbd> (gefolgt von einer _regular expression_)

Öffnest du in einem weiteren Fenster oder Tab den Gleisplan für dieselbe Anlage-Datei, positionieren die Links von Gleisen, Signalen, Weichen oder Kontakten den Gleisplan auf das gewählte Objekt und öffnen dort das Info-Popup:

- wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann wird jeweils ein neues Popup geöffnet
- wenn zusammen mit <kbd>alt</kbd>, dann wird zusätzlich der Code aus der Anlage-Datei für dieses Objekt angezeigt

## 4. Programm: EEP_Signale.html

Anzeige von Signalpositionen.

**Aufruf:** [https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Signale.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Signale.html "EEP_Signale.html")

Die Bedeutung der Signalstellung hängt vom jeweiligen Modell ab, es gibt keine Standards, nicht einmal für die ersten beiden Stellungen. Es gibt etliche Signale mit der Kombination { 1 : Fahrt, 2 : Halt }, einige mit { 1 : Halt, 2 : Fahrt } und etliche weitere Kombinationen, die mit { 1 : Halt, … } beginnen. Die Ausgabe erfolgt gruppiert nach der Stellungskombination; je Kombination wird eine eindeutige ID erzeugt.

## 5. Programm: EEP_Export_Bridge.html

Die Bridge zeigt den aktuellen Zustand einer laufenden EEP-Anlage (Züge, Rollmaterial, Signale, Weichen, Zeit, Wetter), leitet ihn an den Gleisplan weiter und kann optional Befehle an EEP senden.

**Aufruf:** [https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Export_Bridge.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Export_Bridge.html "EEP_Export_Bridge.html")

Mit URL-Parameter startet die Abfrage sofort: `EEP_Export_Bridge.html?url=<Adresse der eep_export.json>`.

Einrichtung, Bedienung und Fehlersuche stehen in [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"). Den Webserver beschreibt [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer").

---

## 6. Programm: EEP_GBS.html

Das GBS-Programm zeigt die **Gleisbildstellpulte (GBS)** einer EEP-Anlage im Browser. Mit der Export Bridge (Szenarien B bis D) werden die Stellpulte live angezeigt (Weichenstellungen, Signale, Besetztmeldungen) und können wie in EEP bedient werden. Zusätzlich wandelt das Programm Stellpulte zwischen den Formaten `.anl3` und `.gbs` um.

**Aufruf:** [https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_GBS.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_GBS.html "EEP_GBS.html")

### Datei laden

Geladen werden kann

- die **Anlage-Datei** `.anl3` (oder ein `.zip` mit genau einer `.anl3`-Datei, siehe *Zip-Dateien* in Abschnitt 2), oder
- eine **Stellpult-Datei** `.gbs`.

Eine `.gbs`-Datei in einem Archiv wird nicht gesucht: Bei einer als `.zip` veröffentlichten Anlage sind die Stellpulte bereits Teil der `.anl3`-Datei.

Die Datei lässt sich per Datei-Auswahl, Drag&Drop oder URL laden (Eingabefeld **URL laden** bzw. Aufruf mit `EEP_GBS.html?url=<Adresse der Datei>`). Die zuletzt benutzte URL wird im Browser gemerkt. Schlägt das Laden einer URL fehl, erscheint eine rote Meldung mit der wahrscheinlichen Ursache. Das Format wird am Inhalt erkannt, nicht nur am Dateinamen.

Für die **Live-Bedienung** solltest du die `.anl3`-Datei der laufenden Anlage laden: Nur sie enthält die Namen der Signale (für die Stellungstexte), die Fahrstraßen und den Typ der Kameras. Mit einer reinen `.gbs`-Datei werden Stellpulte angezeigt und live gefärbt, aber Fahrstraßen sind nicht verfügbar, und Signale schalten nur zwischen den Stellungen weiter, statt zwischen Fahrt und Halt zu wechseln.

### Anzeige

Jedes Stellpult der Anlage wird als Raster aus Kacheln gezeichnet, mit Überschrift (Nummer, Name, Spalten × Zeilen). Dargestellt werden:

| Element | Darstellung |
| --- | --- |
| Gleise, Endgleise, Bahnsteige, Kreuzungen | wie im Stellpult |
| Weichen | die Weichennummer ist je Stellung gefärbt (1 blau, 2 orange, 3 lila, 4 grün), die gesetzte Verbindung wird farbig über das Gleis gelegt |
| Besetztmeldung | Linienstück je Gleisabschnitt, rot bei besetztem Gleis |
| Signale | Lichtsignale (rot/grün), Fahrstraßen-Startsignale (**S**) und -Zielsignale (**Z**), jeweils mit Signalnummer und Quickinfo |
| Kamera | Symbol mit Kameraname |
| Ein/Aus-Schalter, Reset, Status, Zähler | Spezialsymbole zu Signalen: Ein/Aus (Signalnummer im Mittelbalken), Reset (grün bei Fahrt), Statusanzeige (3 Balken für bis zu 7 Stellungen), Zählersignal (Stellung minus 1 als bis zu 2-stellige Zahl) |
| Schraube | nur Tipptext |

Unbekannte Symbole erscheinen als graues Feld mit der Symbolnummer und werden in der Browser-Konsole gemeldet. Die Quickinfo (Tipptext) der Kacheln steht beim Überfahren mit der Maus.

Die Statuszeile über den Stellpulten zeigt, wie alt die Live-Daten sind, und ob Befehle an EEP aktiv sind (⚡).

### Bedienung (Befehle an EEP)

Voraussetzungen wie beim Gleisplan: Die **Export Bridge** ist im selben Browser und aus demselben Ursprung geöffnet, **an Gleisplan senden** ist eingeschaltet, und die Bridge meldet **⚡ Befehle an EEP aktiv** (siehe [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"), Abschnitt 6). Ohne aktive Befehle zeigt das Programm nur an. Ein Klick wirkt direkt, es gibt keine Rückfrage.

| Klick auf | Wirkung |
| --- | --- |
| Weiche | schaltet zur nächsten Stellung weiter; <kbd>⇧ Shift</kbd> + Klick schaltet rückwärts |
| Signal (Licht) | wechselt zwischen Fahrt und Halt (nach dem Stellungstext aus `js/EEP_Signale_Daten.js`), sonst zur nächsten Stellung |
| Ein/Aus-Schalter, Reset | wie ein Signal |
| Kamera | ruft die Kamera auf (statisch oder dynamisch laut Anlage-Datei) |
| Startsignal **S**, dann Zielsignal **Z** | schaltet die **Fahrstraße** (nur mit `.anl3`). Das gewählte Startsignal ist gelb umrandet, ein erneuter Klick hebt die Auswahl auf. <kbd>⇧ Shift</kbd> + Klick auf **S** löst die Fahrstraße auf |

Das Ergebnis jedes Befehls (oder „Keine Antwort der Export Bridge“ nach 3 Sekunden) erscheint neben der Statuszeile.

### Umwandlung `.anl3` ↔ `.gbs`

Unter der Überschrift jedes Stellpults stehen drei Knöpfe:

- **als .gbs anzeigen:** das Stellpult als Text einer `.gbs`-Datei
- **als anl3-Text anzeigen:** das Stellpult als `GBSObject`-Element, wie es in der `.anl3`-Datei steht
- **Text speichern:** speichert den angezeigten Text (`<Name>.gbs` bzw. `<Name>.anl3.txt`)

Damit kannst du ein Stellpult aus einer Anlage als `.gbs`-Datei herausnehmen oder ein bearbeitetes `.gbs` wieder in Anlage-Text umwandeln. Das `GBSObject`-Element musst du selbst in die `.anl3`-Datei einfügen. Arbeite dabei nur an einer Kopie der Anlage.

### Debug

Mit der Checkbox **Debug** oder dem Aufruf `EEP_GBS.html?debug` erscheint je Stellpult eine Tabelle aller Weichen: Felder A bis D mit ihren Richtungen, `SwitchSet`, die daraus abgeleiteten Stellungen und der Vergleich mit den Gleisverbindungen der `.anl3`-Datei (nur ein Hinweis, `✖` markiert eine Abweichung). Die Tabelle zeigt auch die Gleis-IDs je Feld (besetzte rot) und die aktuelle Live-Stellung. Die Besetztmeldungen tragen zusätzlich den Feldbuchstaben. Bei falsch angezeigten Weichen ist das der erste Anlaufpunkt.

---

# Teil 2: Technische Details

## 7. Technik des Gleisplans

- **Parsen:** Die `.anl3`-Datei besteht aus [XML](https://www.w3schools.com/xml/xml_tree.asp). Sie wird mit der Javascript-Funktion [`DOMParser`](https://www.w3schools.com/xml/xml_parser.asp) in das [Document Object Model (DOM)](https://www.w3schools.com/xml/xml_dom.asp) umgewandelt.
- **Grafik:** Dynamisch mit Javascript wird die Graphik mit [SVG](https://www.w3schools.com/html/html5_svg.asp)-Befehlen aufgebaut. Die Formatierung erfolgt getrennt von der Definition der Graphik mit der SVG-Variante von [CSS](https://www.w3schools.com/html/html_css.asp).
- **Pan und Zoom, Popups:** [`svg-pan-zoom`](https://github.com/bumbu/svg-pan-zoom) zum Verschieben und Zoomen, [`toolwindow`](https://github.com/fluffynuts/toolwindow) für Popups.
- **Layout:** Die Größenanpassung des SVG-Elements an den restlichen Bildschirmbereich erfolgt mit [`flex`](https://www.w3schools.com/css/css3_flexbox.asp).
- **Einstellungen:** Werden automatisch mit [`localStorage`](https://www.w3schools.com/html/html5_webstorage.asp) gespeichert.
- **Fortschrittsbalken:** Beim Laden großer Dateien über `Promise` / `requestAnimationFrame` und mehrere Verarbeitungsschritte. Der Internet Explorer unterstützt diese und andere moderne Sprachkonstrukte nicht. Empfohlen sind aktuelle Versionen von Chrome, MS Edge (beide Chromium-basiert) und Firefox.
- **Linien- und Textbreite:** Dynamische Anpassung der CSS-Variablen in den SVG-CSS-Regeln.
- **Höhenfilter:** Der doppelte Schieberegler basiert auf [multirange](https://leaverou.github.io/multirange/). Der Filter wird über die dynamische Anpassung der CSS-Klassen von SVG-Gruppenelementen realisiert.
- **Laden per URL:** Mit `fetch`. Bei einer URL auf einem anderen Server muss dieser CORS-Zugriffe erlauben; `file://` funktioniert nicht. Für Fehlerfälle (HTTP-Status, fehlende Verbindung, CORS, Mixed Content) wird die wahrscheinliche Ursache angezeigt.
- **Zip-Dateien:** Ob eine Datei ein zip-Archiv ist, wird am Inhalt erkannt, nicht am Dateinamen (daher funktionieren auch URLs ohne Endung `.zip`). Das Entpacken erfolgt im Browser mit `DecompressionStream`, eine zusätzliche Bibliothek wird nicht benötigt.
- **Zusammenspiel der Programme:** Die Interaktion mit dem Inventar-Programm und der Export Bridge erfolgt über [`BroadcastChannel`](https://developer.mozilla.org/de/docs/Web/API/BroadcastChannel) (Kanäle `EEP` und `EEP_LIVE`, siehe [`README_Export_Bridge`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README_Export_Bridge.html "README_Export_Bridge"), Abschnitt 9).
- **Modulstruktur der js-Dateien:** `EEP_Gleisplan_LoadFile.js` (Laden), `EEP_Gleisplan_Data.js` (Aufbereitung der Daten ohne SVG), `EEP_Gleisplan_Geometry.js` (reine Geometrie), `EEP_Gleisplan_DOM2SVG.js` (SVG-Elemente), `EEP_Gleisplan_LabelLayout.js` (Textentzerrung), `EEP_Gleisplan_MainScreen.js`, `EEP_Gleisplan_SgvPanZoom.js`, `EEP_Gleisplan_InfoPopup.js` und `EEP_Gleisplan_LiveData.js` (Live-Erweiterung).
- In 2026 wurden mit Hilfe der Claude AI mehrere Korrekturen und Performance-Verbesserungen erarbeitet. Anschließend wurde mit dieser AI die Anzeige von Live-Daten und die EEP-Befehlsverarbeitung sowie die Dokumentation gebaut.

## 8. Technik des Inventars

- Die `.anl3`-Datei wird wie im Gleisplan mit [`DOMParser`](https://www.w3schools.com/xml/xml_parser.asp) in das DOM umgewandelt, der Inhalt wird in Tabellen ausgegeben.
- Die interaktiven Funktionen der Tabellen (Filter, Spaltenverwaltung) stammen aus der Bibliothek [`TableFilter`](https://github.com/koalyptus/TableFilter). Sortieren nach Klick auf die Spaltenüberschrift ist selbst implementiert.
- Die Interaktion mit dem Gleisplan erfolgt über [`BroadcastChannel`](https://developer.mozilla.org/de/docs/Web/API/BroadcastChannel) (Kanal `EEP`, Nachrichten `showTrack`, `showID`, `showContact`, `showCamera`, `showTrackObject`, `showGBS`).

## 9. Technik des GBS

- **Datenmodell:** `.anl3` (Elemente `GBSObject` / `GBSElement`) und `.gbs` werden in dasselbe Modell gelesen: Stellpult mit Gleissystem, Layer, Spalten, Zeilen und Kacheln. Jede Kachel hat Symbole (`Modell`: Gleissymbol plus linkes, mittleres, rechtes Signalsymbol), Signalnummern, bis zu vier Listen von Gleis-IDs (`TrackA` bis `TrackD`), Weichennummer und `SwitchSet`, Kamera und Tipptext. Ein Parser erkennt das Format am Inhalt (`[GBS]` am Anfang oder XML-Wurzel `sutrackp`).
- **Quelle des Formats:** Aufbau der `.gbs`-Datei und Reihenfolge der Ausleuchtfelder laut [Handbuch EEP 18, Kapitel 9.3](https://www.eepforum.de/forum/thread/42251-9-3-die-gbs-datei-bearbeiten/ "9.3 Die GBS-Datei bearbeiten"). Die Felder A bis D der Ausleuchtung laufen im Uhrzeigersinn ab der linken unteren Ecke der Kachel. Ausnahmen laut Handbuch (Kacheln 33, 34, 57, 62, 68, 70) sind in der Tabelle `ARM_ORDER_EXCEPTIONS` bzw. in `trackSegs()` hinterlegt.
- **Gleissystem:** Der `Layer` der `.gbs`-Datei (1 Eisenbahn, 2 Straße, 3 Straßenbahn, 4 sonstige) entspricht der `GleissystemID` der Anlage mit vertauschten Werten 2 und 3.
- **Weichen:** Die Verbindungen je Stellung ergeben sich aus dem `SwitchSet` (Buchstabe = Feld A bis D, `-` = das nicht genannte Weichenantriebsgleis). Die Anzahl der Stellungen ist die Länge des `SwitchSet` ohne leere Einträge am Ende. Die Gleisverbindungen der `.anl3` werden nur im Debug-Modus zum Vergleich herangezogen.
- **Live-Daten:** Kanal `EEP_LIVE` ([`BroadcastChannel`](https://developer.mozilla.org/de/docs/Web/API/BroadcastChannel)) wie beim Gleisplan: Das Programm sendet `ready`, sobald eine Datei geladen ist, und empfängt `data` (Exportdaten), `cmdState` und `cmdResult` der Bridge. Befehle gehen als `command` an die Bridge, die sie gegen ihre Whitelist prüft und an den Webserver weitergibt. Die Folgenummer `seq` beginnt zufällig, damit die Antworten (`cmdResult`) nicht mit denen eines gleichzeitig geöffneten Gleisplans verwechselt werden.
- **Besetztmeldung:** `tracks.<Gleissystem>.<ID>.occupied` der Exportdaten, der Schlüssel (`rail`, `tram`, `road`, `auxiliary`, `control`) richtet sich nach dem Gleissystem.
- **Befehle:** `EEPSetSwitch` (Stellung + 1, reihum bis zur Stellungszahl), `EEPSetSignal`, `EEPSetCamera`. Eine Fahrstraße ist ein `EEPSetSignal` auf das Startsignal: Stellung 1 löst auf, Stellung 2 ist die erste Fahrstraße, 3 die zweite usw., in der Reihenfolge der `Route`-Einträge (Zielsignale) des Startsignals in der `.anl3`.
- **Signalfarben:** Aus dem Stellungstext in `js/EEP_Signale_Daten.js`, klassifiziert wie im Gleisplan (Halt, Fahrt, Halt erwarten, unbekannt).
- **Sprachen:** Texte über `js/EEP_Texts.js` (Deutsch, English, Français).

## 10. Abhängigkeiten

Das Projekt verwendet die GitHub-Bibliotheken [`svg-pan-zoom`](https://github.com/bumbu/svg-pan-zoom), [`toolwindow`](https://github.com/fluffynuts/toolwindow) und [`TableFilter`](https://github.com/koalyptus/TableFilter) sowie `multirange` für den Höhenfilter.

---

# Impressum

(c) Frank Buchholz, 2019
