# Projekt: EEP_convert_anl3_file

## Programm: EEP_Gleisplan.html
Anzeige eines EEP-Gleisplans im Browser

Der Gleisplan zu einer EEP Anlage wird im Browser angezeigt.

### Aufruf
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html

### Mausfunktionen 
Verschieben: Klick+Halten+Bewegen<br/>
An der Stelle des Cursors hineinzoomen: Doppelklick<br/>
Herauszoomen: <kbd>&#x21E7; Shift</kbd>+Doppelklick<br/>
Details anzeigen: Klick auf Gleis, Symbol oder Text

### Tastaturfunktionen
<kbd>&larr;</kbd> <kbd>&uarr;</kbd> <kbd>&rarr;</kbd> <kbd>&darr;</kbd> : Verschieben der Graphik (wenn zusammen mit <kbd>&#x21E7; Shift</kbd>, dann jeweils um eine halbe Seite)<br/>
<kbd>+</kbd> <kbd>-</kbd> : Zoomen</small></p>

### Interaktive Funktionen
Wechsel zwischen vertikalen und horizontaler Ausrichtung (Fullscreen mit <kbd>F11</kbd>)<br/>
Zoom-in, -out, -reset<br/>
Auswahl der anzuzeigenden Gleissysteme und von Informationen wie Texten oder Marker<br/>
Aktuelles Bild als png-Bild speichern<br/>
Gleisplan auf bestimmtes Gleis, bzw. das Gleis eines Signals oder Weiche positionieren<br/>
Einstellung der Linien- und Textbreite

### Tipp zum Export als svg

Google Chrome:

Rechts-Klick in der Graphik &rarr; Inspect <kbd>Ctrl+Shift+I</kbd> &rarr; Das svg-Element wird im neuen Fenster (DevTools) blau hinterlegt angezeigt &rarr; Rechts-Klick auf diesem Element &rarr; Copy &rarr; Copy Element

Firefox:

Rechts-Klick in der Graphik &rarr; Element untersuchen &rarr; Das svg-Element wird im neuen Fenster (DevTools) blau hinterlegt angezeigt &rarr; Rechts-Klick auf diesem Element &rarr; Kopieren &rarr; Äußeres HTML

Nun kann man das svg-Element aus der Zwischenablage in ein leeres Textdokument pasten und z.B. als .svg-Datei speichern.

### Referenz
Diskussionbeitrag im <a href='https://www.eepforum.de/forum/thread/26770-eep-gleisplan-im-browser-anzeigen-javascript-projekt' target='_blank'>EEP-Forum</a>.

### Technik
Dieses Programm nutzt die Javascript-Funktion <a href='https://www.w3schools.com/xml/xml_parser.asp' target='_blank'>DOMParser</a> um eine <i>.anl</i>-Datei von EEP, die aus <a href='https://www.w3schools.com/xml/xml_tree.asp' target='_blank'>XML</a> aufgebaut ist, zu interpretieren und in das <a href='https://www.w3schools.com/xml/xml_dom.asp' target='_blank'>Document Object Model (DOM)</a> umzuwandeln.

Anschließend wird dynamisch mit Javascript die Graphik des Gleisplanes mit <a href='https://www.w3schools.com/html/html5_svg.asp' target='_blank'>SVG</a>-Befehlen aufgebaut. Die Formatierung der graphischen Elemente erfolgt getrennt von der Definition der Graphik mit der SVG-Variante von <a href='https://www.w3schools.com/html/html_css.asp' target='_blank'>CSS</a>.

Der Browser kann solche SVG-Graphiken direkt anzeigen. Zusätzlich wird die GitHub-Bibliothek <a href='https://github.com/ariutta/svg-pan-zoom' target='_blank'>svg-pan-zoom</a> verwendet, um interaktive Funktionen zum Verschieben und Zoomen anzubieten.

Die automatische Größenanpassung des SVG-Elements im Brower zur Nutzung des gesamten restlichen Bildschirmbereiches erfolgt mit <a href='https://www.w3schools.com/css/css3_flexbox.asp' target='_blank'>flex</a>.

Die Speicherung der Einstellungen erfolgt automatisch mit <a href='https://www.w3schools.com/html/html5_webstorage.asp' target='_blank'>localStorage</a>.  

Der Fortschrittsbalken beim Laden und Verarbeiten von (großen) Dateien wird mit <i>Promise</i> / <i>requestAnimationFrame</i> und diversen Schritten bei der Verarbeitung realisiert. Leider unterstützt der Internet Explorer diese Funktion und diverse andere, moderne Sprachkonstrukte nicht und kann daher gar nicht verwendet werden. Die einzig empfohlenen Browser sind daher Google Chrome (bzw. diejenigen Browser, die auf Chomium basieren) und Firefox.

Die interaktive Einstellung der Linien- und Textbreite wird über dynamische Anpassung der CSS-Variablen in den SVG-CSS-Regeln realisiert.

Programmeinstellungen werden im <a href='https://www.w3schools.com/jsref/prop_win_localstorage.asp' target='_blank'>localStorage</a> des Browsers gespeichert.

### Abhängigkeiten
Die GitHub-Bibliothek <a href='https://github.com/ariutta/svg-pan-zoom' target='_blank'>svg-pan-zoom</a> wird online aufgerufen. Wenn man das Programm komplett lokal nutzen will muss diese Bibliothek ebenfalls lokal kopiert werden und der entsprechende script-Befehl angepasst werden.

---

## Programm: EEP_Inventar.html
Anzeige einer Inventarliste zu einer EEP-Anlage.

### Aufruf
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Inventar.html

Zur Zeit wird eine Liste der Weichen, Signale, Zugverbände und verwendeter Gleisstile ausgegeben. Das Programm kann leicht für andere Daten erweitert werden werden. 

### Technik
Dieses Programm nutzt die Javascript-Funktion <a href='https://www.w3schools.com/xml/xml_parser.asp' target='_blank'>DOMParser</a> um eine <i>.anl</i>-Datei von EEP, die aus <a href='https://www.w3schools.com/xml/xml_tree.asp' target='_blank'>XML</a> aufgebaut ist, zu interpretieren und in das <a href='https://www.w3schools.com/xml/xml_dom.asp' target='_blank'>Document Object Model (DOM)</a> umzuwandeln.

Zusätzlich wird die GitHub-Bibliothek <a href='https://github.com/koalyptus/TableFilter' target='_blank'>TableFilter</a> verwendet, um interaktive Funktionen zur Anzeige der Tabellen anzubieten.

### Abhängigkeiten
Die GitHub-Bibliothek <a href='https://github.com/koalyptus/TableFilter' target='_blank'>TableFilter</a> wird online aufgerufen. Wenn man das Programm komplett lokal nutzen will muss diese Bibliothek ebenfalls lokal kopiert werden und der entsprechende script-Befehl angepasst werden.

---

## Programm: EEP_Signale.html
Anzeige von Signalpositionen.

Die Bedeutung der Signalstellung hängt vom jeweiligen Modell ab – es gibt keine Standards, nicht einmal für die ersten beiden Stellungen.
Beispielsweise gibt es etliche Signale mit der Stellungskombination { 1 : Fahrt, 2 : Halt } und einige andere mit der Stellungskombination { 1 : Halt, 2 : Fahrt } sowie etliche weitere Kombinationen, die mit { 1 : Halt, … } beginnen.  
Die Stellungskombination eines Signals kann man der entsprechenden .ini-Datei entnehmen. Man erhält diese .ini-Dateien im Ordner C:\EEP15\Resourcen.unp\Signale\Signale über das EEP-Programm mit „Extras → Ressourcen-Extraktor“).  

Die Ausgabe erfolgt gruppiert nach der Stellungskombination. Dafür wird je Kombination eine eindeutige ID generiert.  

### Aufruf
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Signale.html


---

# Impressum
(c) Frank Buchholz, 2019
