# Projekt: EEP_convert_anl3_file

## Datei: EEP_Gleisplan.html

### Aufruf
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html

### Mausfunktionen 
Verschieben: Klick+Halten+Bewegen; 
An der Stelle des Cursors hineinzoomen: Doppelklick; 
Herauszoomen: Umschalttaste+Doppelklick

### Interaktive Funktionen
Zoomen;
Auswahl der anzuzeigenden Gleissysteme;
aktuelles Bild als png-Bild speichern

### Referenz
Diskussionbeitrag im <a href='https://www.eepforum.de/forum/thread/26770-eep-gleisplan-im-browser-anzeigen-javascript-projekt' target='_blank'>EEP-Forum</a>.

### Technik
Dieses Programm nutzt die Javascript-Funktion <a href='https://www.w3schools.com/xml/xml_parser.asp' target='_blank'>DOMParser</a> um eine <i>.anl</i>-Datei von EEP, die aus <a href='https://www.w3schools.com/xml/xml_tree.asp' target='_blank'>XML</a> aufgebaut ist, zu interpretieren und in das <a href='https://www.w3schools.com/xml/xml_dom.asp' target='_blank'>Document Object Model (DOM)</a> umzuwandeln.

Anschließend wird dynamisch mit Javascript die Graphik des Gleisplanes mit <a href='https://www.w3schools.com/html/html5_svg.asp' target='_blank'>SVG</a>-Befehlen aufgebaut. Die Formatierung der graphischen Elemente erfolgt getrennt von der Definition der Graphik mit der SVG-Variante von <a href='https://www.w3schools.com/html/html_css.asp' target='_blank'>CSS</a>.

Der Browser kann solche SVG-Graphiken direkt anzeigen. Zusätzlich wird die Bibliothek <a href='https://github.com/ariutta/svg-pan-zoom' target='_blank'>svg-pan-zoom</a> verwendet, um interaktive Funktionen zum Verschieben und Zoomen anzubieten.

Die automatische Größenanpassung des SVG-Elements im Brower zur Nutzung des gesamten restlichen Bildschirmbereiches erfolgt mit <a href='https://www.w3schools.com/css/css3_flexbox.asp' target='_blank'>flex</a>.

Der Fortschittsbalken beim Laden und Verarbeiten von (großen) Dateien wird mit <i>Promise</i> / <i>requestAnimationFrame</i> und diversen Stopps während der Verarbeitung realisiert.  


# Impressum
(c) Frank Buchholz, 2019
