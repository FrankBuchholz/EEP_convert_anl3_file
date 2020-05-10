# Projekt: EEP_convert_anl3_file

Dieses Projekt enthält verschiedene Programme zur Analyse, Darstellung und Konvertierung von Gleisplänen von EEP.

Die Programme können direkt mit den angegebenen Links im Browser (Chrome oder Firefox) gestartet werden. In diesem Fall ist eine aktive Internetverbindung notwendig.
Alternativ kann das Archiv `[dist/EEP_convert_anl3_file.zip](https://github.com/FrankBuchholz/EEP_convert_anl3_file/raw/master/dist/EEP_convert_anl3_file.zip)` auf [GitHub](https://github.com/FrankBuchholz/EEP_convert_anl3_file) in einem beliebigen Verzeichnis entpackt werden. Dann können die Programme lokal gestartet werden wobei keine Internetverbindung benötigt wird.

## Programm: EEP_Gleisplan.html
Der Gleisplan zu einer EEP-Anlage wird im Browser angezeigt.

Solche EEP-Anlagen sind z.B. hier zu finden:<br>
[https://www.eepforum.de/filebase/category-file-list/39-kostenlose-anlagen-ab-eep-7/](https://www.eepforum.de/filebase/category-file-list/39-kostenlose-anlagen-ab-eep-7/ "Kostenlose Anlagen ab EEP 7")

### Aufruf
[https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html "EEP_Gleisplan.html")

### Mausfunktionen 
Verschieben: Klick+Halten+Bewegen<br>
An der Stelle des Cursors hineinzoomen: Doppelklick<br>
Herauszoomen: <kbd>&#x21E7; Shift</kbd>+Doppelklick<br>
Details anzeigen: Klick auf Gleis, Symbol oder Text
- wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann wird jeweils ein neues Popup geöffnet
- wenn zusammen mit <kbd>alt</kbd>, dann wird zusätzlich der Code aus der Anlage-Datei für dieses Objekt angezeigt

### Tastaturfunktionen
<kbd>&larr;</kbd> <kbd>&uarr;</kbd> <kbd>&rarr;</kbd> <kbd>&darr;</kbd> : Verschieben der Graphik (wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann jeweils um eine halbe Seite)<br>
<kbd>+</kbd> <kbd>-</kbd> : Zoomen

### Interaktive Funktionen
Wechsel zwischen vertikalen und horizontaler Ausrichtung (Fullscreen mit <kbd>F11</kbd>)<br>
Zoom-in, -out, -reset<br>
Auswahl der anzuzeigenden Gleissysteme und von Informationen wie Texten oder Marker<br>
Aktuelles Darstellung als Bild (`.png`/`.jpg`/`.svg`) speichern<br>
Gleisplan auf bestimmtes Gleis, bzw. das Gleis eines Signals oder Weiche positionieren<br>
Die Positionierung ist auch über das Inventar-Programm möglich!<br>
Einstellung der Linienbreite und der Schriftgröße<br>
Auswahl der Gleise mit minimalem und maximalen Höhenfilter<br>
Farben der Gleissysteme anpassen

### Tipp zum Export als svg

Die Export-Funktion im Programm exportiert die gesamte svg-Graphik. Alternativ kann man auch das Entwickler-Tool des Browsers verwenden. 

- Google Chrome:
  - Rechts-Klick in der Graphik &rarr; Inspect <kbd>Ctrl+Shift+I</kbd> &rarr; Das svg-Element wird im neuen Fenster (DevTools) blau hinterlegt angezeigt &rarr; Rechts-Klick auf diesem Element &rarr; Copy &rarr; Copy Element

- Firefox:
  - Rechts-Klick in der Graphik &rarr; Element untersuchen &rarr; Das svg-Element wird im neuen Fenster (DevTools) blau hinterlegt angezeigt &rarr; Rechts-Klick auf diesem Element &rarr; Kopieren &rarr; Äußeres HTML

Nun kann man das svg-Element aus der Zwischenablage in ein leeres Textdokument pasten und z.B. als .svg-Datei speichern.

### Referenz
Diskussionbeitrag im [EEP-Forum](https://www.eepforum.de/forum/thread/26770-eep-gleisplan-im-browser-anzeigen-javascript-projekt).

### Technik
Dieses Programm nutzt die Javascript-Funktion [`DOMParser`](https://www.w3schools.com/xml/xml_parser.asp) um eine `.anl3`-Datei von EEP, die aus [XML](https://www.w3schools.com/xml/xml_tree.asp) aufgebaut ist, zu interpretieren und in das [Document Object Model (DOM)](https://www.w3schools.com/xml/xml_dom.asp) umzuwandeln.

Anschließend wird dynamisch mit Javascript die Graphik des Gleisplanes mit [SVG](https://www.w3schools.com/html/html5_svg.asp)-Befehlen aufgebaut. Die Formatierung der graphischen Elemente erfolgt getrennt von der Definition der Graphik mit der SVG-Variante von [CSS](https://www.w3schools.com/html/html_css.asp).

Der Browser kann solche SVG-Graphiken direkt anzeigen. Zusätzlich werden die Bibliotheken [`svg-pan-zoom`](https://github.com/ariutta/svg-pan-zoom) zum Verschieben und Zoomen und [`toolwindow`](https://github.com/fluffynuts/toolwindow) zur Anzeige von Popups verwendet.

Die automatische Größenanpassung des SVG-Elements im Brower zur Nutzung des gesamten restlichen Bildschirmbereiches erfolgt mit [`flex`](https://www.w3schools.com/css/css3_flexbox.asp).

Die Speicherung der Einstellungen erfolgt automatisch mit [`localStorage`](https://www.w3schools.com/html/html5_webstorage.asp).  

Der Fortschrittsbalken beim Laden und Verarbeiten von (großen) Dateien wird mit `Promise` / `requestAnimationFrame` und diversen Schritten bei der Verarbeitung realisiert. Leider unterstützt der Internet Explorer diese Funktion und diverse andere, moderne Sprachkonstrukte nicht und kann daher gar nicht verwendet werden. Die einzig empfohlenen Browser sind daher Google Chrome (bzw. diejenigen Browser, die auf Chomium basieren) und Firefox.

Die interaktive Einstellung der Linien- und Textbreite wird über dynamische Anpassung der CSS-Variablen in den SVG-CSS-Regeln realisiert.

Der doppelte Schieberegler für den Höhenfilter basiert auf [multirange](https://leaverou.github.io/multirange/).<br>
Der Filter wird über dynamische Anpassung der CSS-Klassen von SVG-Gruppenelemente realisiert.

Die Interaktion mit dem Gleisplan-Programm erfolgt über [`BroadcastChannel`](https://developer.mozilla.org/de/docs/Web/API/BroadcastChannel).

### Abhängigkeiten
Das Programm verwendet die GitHub-Bibliotheken [`svg-pan-zoom`](https://github.com/ariutta/svg-pan-zoom), [`toolwindow`](https://github.com/fluffynuts/toolwindow) und [`rematrix`](https://github.com/jlmakes/rematrix). 

---

## Programm: EEP_Inventar.html
Anzeige einer Inventarliste zu einer EEP-Anlage.

### Aufruf
[https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Inventar.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Inventar.html "EEP_Inventar.html")

Zur Zeit wird eine Liste der Weichen, Signale, Kontakte, Zugverbände und verwendeter Gleisstile ausgegeben. Das Programm kann leicht für andere Daten erweitert werden werden. 

### Interaktive Funktionen
Man kann die Tabellen (bei Firefox auch mit Strg+A) mit Copy & Paste in ein Tabellenverarbeitungsprogramm übertragen. Dazu schaltet man am Besten zuvor die Anzeige der Filter-Zeile aus.

Die Tabellen können mit Klicks in die Spaltenüberschriften sortiert werden.

[Filter-Operatoren](https://github.com/koalyptus/TableFilter/wiki/4.-Filter-operators):<br>
<kbd>&lt;</kbd>, <kbd>&lt;</kbd>, <kbd>=</kbd>, <kbd>&gt;=</kbd>, <kbd>&gt;</kbd>, <kbd>*</kbd>, <kbd>!</kbd> (nicht), <kbd>{</kbd> (beginnt mit), <kbd>}</kbd> (endet mit), <kbd>||</kbd> (oder), <kbd>&amp;&amp;</kbd> (und), <kbd>[empty]</kbd>, <kbd>[nonempty]</kbd>, <kbd>rgx:</kbd> (gefolgt von einer <i>regular expression</i>)

Wenn man in einem weiteren Fenster oder einer weiteren Karteikarte des Browsers den Gleisplan für die gleiche EEP-Anlage-Datei öffnet, dann kann man über die Links von Gleisen den Gleisplan auf das gewählte Objekt positionieren und das Info-Popup dort öffnen:
- wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann wird jeweils ein neues Popup geöffnet
- wenn zusammen mit <kbd>alt</kbd>, dann wird zusätzlich der Code aus der Anlage-Datei für dieses Objekt angezeigt

### Technik
Dieses Programm nutzt die Javascript-Funktion [`DOMParser`](https://www.w3schools.com/xml/xml_parser.asp), um eine`.anl3`-Datei von EEP, die aus [XML](https://www.w3schools.com/xml/xml_tree.asp) aufgebaut ist, zu interpretieren und in das [Document Object Model (DOM)](https://www.w3schools.com/xml/xml_dom.asp) umzuwandeln.

Zusätzlich wird die GitHub-Bibliothek [`TableFilter`](https://github.com/koalyptus/TableFilter) verwendet, um interaktive Funktionen zur Anzeige der Tabellen anzubieten.

Die Interaktion mit dem Gleisplan-Programm erfolgt über [`BroadcastChannel`](https://developer.mozilla.org/de/docs/Web/API/BroadcastChannel).

### Abhängigkeiten
Das Programm verwendet die GitHub-Bibliothek [`TableFilter`](https://github.com/koalyptus/TableFilter).

---

## Programm: EEP_Signale.html
Anzeige von Signalpositionen.

Die Bedeutung der Signalstellung hängt vom jeweiligen Modell ab – es gibt keine Standards, nicht einmal für die ersten beiden Stellungen.
Beispielsweise gibt es etliche Signale mit der Stellungskombination { 1 : Fahrt, 2 : Halt } und einige andere mit der Stellungskombination { 1 : Halt, 2 : Fahrt } sowie etliche weitere Kombinationen, die mit { 1 : Halt, … } beginnen.  
Die Stellungskombination eines Signals kann man der entsprechenden `.ini`-Datei entnehmen. Man erhält diese `.ini`-Dateien im Ordner `C:\EEP15\Resourcen.unp\Signale\Signale` über das EEP-Programm mit „Extras → Ressourcen-Extraktor“).  

Die Ausgabe erfolgt gruppiert nach der Stellungskombination. Dafür wird je Kombination eine eindeutige ID generiert.  

### Aufruf
[https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Signale.html](https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Signale.html "EEP_Signale.html")


---

# Impressum
(c) Frank Buchholz, 2020
