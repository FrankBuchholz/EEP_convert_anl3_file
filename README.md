# Projekt: EEP_convert_anl3_file

## Datei: EEP_Gleisplan.html

Aufruf: https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html

Dieses Programm nutzt die Javascript-Funktion <a href='https://www.w3schools.com/xml/xml_parser.asp' target='_blank'>DOMParser</a> um eine <i>.anl</i>-Datei von EEP, die aus <a href='https://www.w3schools.com/xml/xml_tree.asp' target='_blank'>XML</a> aufgebaut ist, zu interpretieren und in das <a href='https://www.w3schools.com/xml/xml_dom.asp' target='_blank'>Document Object Model (DOM)</a> umzuwandeln.

Anschließend wird dynamisch mit Javascript die Graphik des Gleisplanes mit <a href='https://www.w3schools.com/html/html5_svg.asp' target='_blank'>SVG</a>-Befehlen aufgebaut. Die Formatierung der graphischen Elemente erfolgt getrennt von der Definition der Graphik mit der SVG-Variante von <a href='https://www.w3schools.com/html/html_css.asp' target='_blank'>CSS</a>.

Der Browser kann solche SVG-Graphiken direkt anzeigen. Zusätzlich wird die Bibliothek <a href='https://github.com/ariutta/svg-pan-zoom' target='_blank'>svg-pan-zoom</a> verwendet, um interaktive Funktionen zum Verschieben und Zoomen anzubieten.

Click, hold and move: pan; Double click: zoom in; Shift+Double click: zoom out

# Impressum
(c) Frank Buchholz, 2019
