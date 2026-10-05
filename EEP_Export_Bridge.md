# EEP Export Bridge und Live-Gleisplan

Mit diesem Programm siehst du den aktuellen Zustand einer laufenden EEP-Anlage im Browser:
Züge, Signal- und Weichenstellungen, Uhrzeit und Wetter. Die Daten kommen aus einem
Lua-Modul in EEP, das sie regelmäßig als JSON-Datei ausgibt.

| Baustein | Aufgabe |
| --- | --- |
| **`EepExport.lua`** (in EEP) | schreibt den aktuellen Anlagenzustand in die Datei `eep_export.json` |
| **`EEP_Export_Bridge.html`** | liest die JSON-Datei, zeigt Züge, Signale, Weichen und Rollmaterial als Tabellen und leitet die Daten an den Gleisplan weiter |
| **`EEP_Gleisplan.html`** | zeigt den Gleisplan einer Anlage (`.anl3`) und zeichnet die Live-Daten der Bridge hinein |

```
EEP (EepExport.lua) ──► Datei eep_export.json ──► EEP_Export_Bridge.html ──► EEP_Gleisplan.html
                                                  (Tabellen, Auswahl)       (Züge, Signale, Weichen im Plan)
```

## Inhalt

- [EEP Export Bridge und Live-Gleisplan](#eep-export-bridge-und-live-gleisplan)
  - [Inhalt](#inhalt)
  - [1. Lua-Modul in eine Anlage einbinden](#1-lua-modul-in-eine-anlage-einbinden)
    - [1.1 Minimalversion](#11-minimalversion)
    - [1.2 Ausführliche Version](#12-ausführliche-version)
  - [2. Die Export Bridge nutzen](#2-die-export-bridge-nutzen)
    - [2.1 Dateizugriff auf die JSON-Datei](#21-dateizugriff-auf-die-json-datei)
    - [2.2 URL-Zugriff mit lokalem Webserver](#22-url-zugriff-mit-lokalem-webserver)
      - [Variante A: Python](#variante-a-python)
      - [Variante B: Node.js mit npx](#variante-b-nodejs-mit-npx)
      - [Hinweise zum URL-Zugriff](#hinweise-zum-url-zugriff)
    - [2.3 Bedienung der Bridge](#23-bedienung-der-bridge)
  - [3. Gleisplan und Bridge zusammen nutzen](#3-gleisplan-und-bridge-zusammen-nutzen)
    - [Ablauf](#ablauf)
    - [Was der Gleisplan anzeigt](#was-der-gleisplan-anzeigt)
    - [Zusammenspiel mit der Bridge](#zusammenspiel-mit-der-bridge)
    - [Hinweise und Grenzen](#hinweise-und-grenzen)
    - [Geplante Änderungen](#geplante-änderungen)
  - [4. Aufbau der JSON-Datei](#4-aufbau-der-json-datei)
  - [5. Fehlersuche](#5-fehlersuche)

---

## 1. Lua-Modul in eine Anlage einbinden

Das Modul `EepExport.lua` sammelt den Zustand der Anlage und schreibt ihn als JSON-Datei.
Welche Objekte exportiert werden, legst du im Hauptskript der Anlage mit `add…()`-Funktionen fest.

Alle `add…()`-Funktionen verstehen drei Eingabeformen und prüfen, ob das Objekt wirklich existiert:

| Form | Beispiel | Wirkung |
| --- | --- | --- |
| Einzelwert | `EepExport.addSignals(12)` | nimmt Signal 12 auf, falls es existiert |
| Liste | `EepExport.addSignals({ 1, 2, 3 })` | nimmt alle vorhandenen aus der Liste auf |
| ohne Eingabe | `EepExport.addSignals()` | sucht die IDs `1` bis `discoverMax` und nimmt alle vorhandenen auf |

Züge und Rollmaterial haben keine numerischen IDs, hier gehen nur Einzelwert und Liste.

### 1.1 Minimalversion

Die Minimalversion exportiert alle Signale und Weichen. Züge und Rollmaterial werden automatisch
erkannt, sobald sie an einem angemeldeten Signal stehen oder der aktive Zug sind.

1. **Modul ablegen.** Kopiere `EepExport.lua` in den Lua-Ordner.
2. **Hauptskript ergänzen.** Öffne in EEP das Lua-Fenster der Anlage und füge passend ein:

  ```lua
  local EepExport = require("EepExport")

  EepExport.addSignals()    -- alle vorhandenen Signale
  EepExport.addSwitches()   -- alle vorhandenen Weichen

  function EEPMain()
    EepExport.run()         -- exportiert automatisch im eingestellten Intervall
    return 1
  end
  ```

3. **Anlage starten.** Nach dem Start entsteht die Datei `eep_export.json` im Installationsordner von EEP
und wird alle 5 EEP-Sekunden aktualisiert.

### 1.2 Ausführliche Version

Die ausführliche Version zeigt alle Einstellmöglichkeiten und die automatische Erkennung der Züge über
Rückruffunktionen.

```lua
-- Optional ab EEP 18 wenn das Modul im Anlagenordner neben der .anl3-Datei liegt
package.path = EEPGetAnlPath() .. "\\?.lua;" .. package.path

-- Modul laden
local EepExport = require("EepExport")

-- Optional: Konfiguration (nur die Einträge entkommentieren und angeben, die du ändern willst)
EepExport.configure({
  --outputFile       = nil,    -- vollständiger Pfad der Ausgabedatei, Standard: <Installationsordner von EEP>\eep_export.json
  --interval         = 5,      -- Export-Intervall in EEP-Sekunden (0 = nur manuell per EepExport.export()), Standard: 5 Sekunden
  --pretty           = true,   -- true = eingerückte, lesbare JSON-Ausgabe, Standard: false
  --global           = true,   -- Zeit, Jahreszeit, Wetter, Kamera exportieren, Standard: true
  --discoverMax      = 1000,   -- Suchbereich 1..discoverMax bei add...() ohne Eingabe, Standard: 1000
  --autoTrains       = true,   -- Züge automatisch über Signale und Depots einsammeln, Standard: true
  --autoRollingstock = true,   -- Rollmaterial automatisch aus den Fahrzeuglisten der Züge einsammeln, Standard: true
  --scanInterval     = 2,      -- Abstand der automatischen Suche von Zügen und Rollmaterialien, Standard: 2 Sekunden
  --debug            = true,   -- Meldungen im EEP-Ereignisfenster anzeigen, Standard: false
})

-- Auswahl der zu exportierenden Objekte (Bislang werden nur Signale, Weichen und Züge weiterverarbeitet.)
-- Wenn Züge in Depots automatisch gefunden werden sollen, dann müssen diese Depots hinzugefügt werden.
EepExport.addSignals()                         -- ohne Eingabe: alle Signale 1..discoverMax suchen
EepExport.addSwitches({ 1, 2, 3 })             -- Liste: nur vorhandene werden aufgenommen
EepExport.addTrainyards(EepExport.range(1, 5)) -- Bereich 1..5
--EepExport.addRailTracks({ 1, 2, 3 })
--EepExport.addRoadTracks({ 1, 2, 3 })
--EepExport.addTramTracks({ 1, 2, 3 })
--EepExport.addAuxiliaryTracks({ 1, 2, 3 })
--EepExport.addControlTracks({ 1, 2, 3 })
--EepExport.addStructures({ '#1', '#2', '#3' })    -- Lua-Name oder Zahl
--EepExport.addGoods({ '#1', '#2', '#3' })         -- Lua-Name oder Zahl
--EepExport.addWeatherZones({ '#1', '#2', '#3' })  -- Lua-Name oder Zahl

-- Züge und Rollmaterial nur dann von Hand anmelden, wenn die automatische Erkennung nicht reicht
--EepExport.addTrains({ "#ICE1", "#Gueterzug" })
--EepExport.addRollingstock({ 'Lok', 'Wagen', 'Fracht' })

function EEPMain()
  EepExport.run()
  -- Letzte Fehlermeldung anzeigen
  if EepExport.lastError then print(EepExport.lastError) end
  return 1
end

-- Optional, am Ende des Skripts (nach der Definition eigener EEPOn...-Funktionen):
-- erkennt Züge auch bei Signalhalt, Depot-Ein-/Ausfahrt, Kuppeln und Trennen
-- und pausiert den Export, während die Anlage gespeichert wird
EepExport.installCallbacks()
```

**Einstellungen**

| Einstellung | Bedeutung | Standard |
| --- | --- | --- |
| `outputFile` | vollständiger Pfad der Ausgabedatei | `<Installationsordner von EEP>\eep_export.json` |
| `interval` | Export-Intervall in EEP-Sekunden, `0` = nur manueller Export | `5` |
| `pretty` | `true` = eingerückte, lesbare JSON-Ausgabe (größere Datei) | `false` |
| `global` | Zeit, Jahreszeit, Wetter und Kamera exportieren | `true` |
| `discoverMax` | Obergrenze der ID-Suche bei `add…()` ohne Eingabe (`nil` oder `0` = keine Suche) | `1000` |
| `autoTrains` | Züge automatisch über Signale und Depots einsammeln | `true` |
| `autoRollingstock` | Rollmaterial automatisch aus den Fahrzeuglisten der Züge einsammeln | `true` |
| `scanInterval` | Abstand der automatischen Suche in EEP-Sekunden | `2` |
| `saveTimeout` | Der Export ist beim Speichern pausiert. Die Pause endet nach so vielen echten Sekunden von selbst, falls EEP die Speichermeldung nie sendet (`0` = kein Timeout) | `60` |
| `debug` | Debug-Meldungen im EEP-Ereignisfenster | `false` |

**Weitere Funktionen**

| Funktion | Wirkung |
| --- | --- |
| `EepExport.range(a, b)` | erzeugt die Zahlenliste `a` bis `b` |
| `EepExport.discoverAll()` | sucht in allen Kategorien mit numerischen IDs nach vorhandenen Objekten |
| `EepExport.resolve()` | wertet alle bisherigen `add…()`-Aufrufe aus (macht `collect()` von selbst) |
| `EepExport.collect()` | sammelt alle Daten und gibt sie als Lua-Tabelle zurück |
| `EepExport.export()` | sammelt die Daten und schreibt die Datei sofort, gibt `true, Pfad` oder `false, Fehlermeldung` zurück |
| `EepExport.run()` | in `EEPMain()` aufrufen, exportiert im eingestellten Intervall |
| `EepExport.installCallbacks()` | hängt die Handler an die EEP-Rückruffunktionen (siehe unten) |

**Automatische Erkennung von Zügen und Rollmaterial**

- Züge kommen aus den angemeldeten Signalen und Depots (`addSignals()` und `addTrainyards()` sind
  dafür Voraussetzung) und aus dem aktiven Zug. Mit `installCallbacks()` werden sie zusätzlich bei
  Signalhalt, Depot-Ein-/Ausfahrt, Kuppeln und Trennen erkannt.
- Rollmaterial kommt aus den Fahrzeuglisten aller bekannten Züge.
- Automatisch aufgenommene Einträge verschwinden wieder, wenn es sie nicht mehr gibt (zum Beispiel
  nach einer Umbenennung durch Kuppeln). Von Hand angemeldete bleiben immer erhalten.

**`installCallbacks()` und eigene EEP-Funktionen:** Das Modul erweitert die Funktionen
`EEPOnTrainStoppedOnSignal`, `EEPOnTrainEnterTrainyard`, `EEPOnTrainExitTrainyard`,
`EEPOnTrainCoupling`, `EEPOnTrainLooseCoupling`, `EEPOnBeforeSaveAnl` und `EEPOnSaveAnl`.
Eigene Funktionen gleichen Namens bleiben erhalten und werden danach aufgerufen. Rufe
`installCallbacks()` deshalb **nach** deren Definition auf, am Ende des Skripts. Sonst überschreibt
deine spätere Definition den Handler. Alternativ rufst du die Handler (`EepExport.onTrainCoupling(…)`,
`EepExport.onSaveAnl(pfad)` usw.) aus deinen eigenen Funktionen auf.

**Ausgabedatei und Speichern der Anlage**

- Ohne `outputFile` schreibt das Modul in den Installationsordner von EEP.
- Beim Speichern der Anlage pausiert der Export, damit EEP nicht beim Schreiben gestört wird.
  Dafür muss `installCallbacks()` aufgerufen sein.
- Das Intervall zählt in EEP-Sekunden. Bei Zeitraffer wird entsprechend öfter geschrieben.
  Ein kurzes Intervall liefert flüssigere Zugbewegungen, belastet EEP aber stärker, besonders
  bei vielen Zügen. Mit `debug = true` siehst du, wie lange Sammeln, JSON-Erzeugung und Schreiben dauern.
- Die Bridge aktualisiert ihre Anzeige nur, wenn sich etwas ändert (dazu wird `meta.exportedAtEepTime` verglichen).

---

## 2. Die Export Bridge nutzen

Die Bridge ist eine einzelne HTML-Datei (`EEP_Export_Bridge.html`). Sie braucht keine Installation.
Öffne sie in einem aktuellen Browser (Chrome, Edge oder Firefox).

Es gibt zwei Wege, die JSON-Datei zu lesen:

| | Dateizugriff | URL-Zugriff |
| --- | --- | --- |
| Aufwand | gering | Webserver nötig |
| Browser | Chrome oder Edge (für das laufende Verfolgen) | alle aktuellen Browser |
| Ändert sich die Datei? | wird alle *n* Sekunden neu gelesen | wird alle *n* Sekunden neu abgefragt |
| Geeignet für | ein Rechner, EEP und Browser zusammen | auch andere Geräte im Heimnetz (Tablet, zweiter Rechner) |

### 2.1 Dateizugriff auf die JSON-Datei

1. Öffne `EEP_Export_Bridge.html` im Browser.
2. Klicke auf **Datei live verfolgen** und wähle die Datei `eep_export.json` aus.
3. Stelle bei **alle … s** das Abfrageintervall ein (Standard: 2 Sekunden).

Die Bridge liest die Datei nun in diesem Takt neu. Der Browser fragt nur einmal nach der Erlaubnis.

Weitere Möglichkeiten:

- **Einmalig laden:** Über das Feld *oder einmalig* oder per Drag&Drop auf die Seite lädst du eine
  Datei genau einmal, zum Beispiel einen gespeicherten Zustand.
- **Zuletzt:** Die Bridge merkt sich die zuletzt benutzte Datei bzw. URL und bietet sie beim
  nächsten Aufruf als Knopf **Zuletzt: …** an. Bei einer Datei fragt der Browser dabei erneut
  nach der Erlaubnis, bei einer URL startet die Abfrage sofort.

> **Einschränkung:** Das fortlaufende Lesen einer Datei funktioniert nur in Chrome und Edge.
> In Firefox und Safari nutze den URL-Zugriff (Abschnitt 2.2) oder lade die Datei einmalig.

### 2.2 URL-Zugriff mit lokalem Webserver

Beim URL-Zugriff holt die Bridge die JSON-Datei per HTTP ab. Dafür muss ein Webserver die Datei
ausliefern. Auf dem eigenen Rechner reicht ein einfacher lokaler Server.

**Wichtig:** Lege die JSON-Datei, `EEP_Export_Bridge.html` und `EEP_Gleisplan.html` (samt den
Ordnern `js`, `css` und `node_modules` des Gleisplans) so, dass der Server sie alle ausliefert.
Starte den Server dazu in einem gemeinsamen übergeordneten Ordner. Dann liegen Bridge und Gleisplan
auf demselben Server (siehe Abschnitt 3: das ist Voraussetzung für die Verbindung beider Seiten).

#### Variante A: Python

Python 3 bringt einen kleinen Webserver mit.

1. Öffne eine Eingabeaufforderung bzw. ein Terminal im gewünschten Ordner.
2. Starte den Server:

   ```bash
   # Windows
   py -m http.server 8000 --bind 127.0.0.1

   # Linux / macOS
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

3. Öffne im Browser `http://localhost:8000/EEP_Export_Bridge.html`.
4. Trage im Feld **URL** den Pfad zur JSON-Datei ein, relativ zum Serverordner,
   z. B. `eep_export.json`, und klicke auf **URL abfragen**.
5. Beenden: `Strg+C` im Terminalfenster.

`--bind 127.0.0.1` sorgt dafür, dass nur dein eigener Rechner den Server erreicht.
Für den Zugriff von einem anderen Gerät im Heimnetz lässt du die Option weg und rufst die Seite
mit der IP-Adresse deines Rechners auf, z. B. `http://192.168.0.20:8000/...`.
Gib den Server dann nie ins Internet frei.

#### Variante B: Node.js mit npx

Voraussetzung ist [Node.js](https://nodejs.org) (enthält `npx`).

1. Terminal im gewünschten Ordner öffnen.
2. Server starten (`-c-1` schaltet das Caching ab, damit immer die aktuelle Datei geliefert wird):

   ```bash
   npx http-server -p 8000 -c-1 -a 127.0.0.1
   ```

3. Weiter wie bei Python: `http://localhost:8000/EEP_Export_Bridge.html` öffnen,
   URL der JSON-Datei eintragen, **URL abfragen** klicken.
4. Beenden: `Strg+C`.

Alternativ geht auch `npx serve -l 8000`.

#### Hinweise zum URL-Zugriff

- Die Bridge hängt an jede Abfrage einen Zeitstempel an und verhindert so, dass der Browser alte
  Daten aus dem Zwischenspeicher liefert.
- Bei `HTTP 404` stimmt der Pfad nicht. Der Pfad im URL-Feld ist relativ zum Ordner, in dem der
  Server gestartet wurde.
- Liegt die JSON-Datei auf einem anderen Server als die Bridge, muss dieser Server
  CORS-Zugriffe erlauben. Einfacher ist es, alles auf einem Server zu halten.

### 2.3 Bedienung der Bridge

**Kopfzeile**

| Element | Funktion |
| --- | --- |
| **Zuletzt: …** | letzte Quelle (Datei oder URL) erneut verwenden |
| **Datei live verfolgen** | JSON-Datei auswählen und fortlaufend lesen |
| **oder einmalig** | Datei einmal laden (auch per Drag&Drop) |
| **URL / URL abfragen** | JSON-Datei per HTTP abfragen |
| **alle … s** | Abfrageintervall |
| **an Gleisplan senden** | Daten an einen geöffneten Gleisplan weiterleiten |
| **Gleisplan öffnen** | öffnet `EEP_Gleisplan.html` im selben Ordner in einem neuen Fenster |
| Statuszeile | EEP-Zeit des Exports und Zeit seit der letzten Änderung |

Die Statuszeile zeigt, ob noch neue Daten ankommen. Wächst die Zeit seit der letzten Änderung
dauernd an, steht EEP oder der Export.

**Bereiche**

- **Zeit & Wetter:** EEP-Uhrzeit, EEP-Version, Wolken, Nebel, Regen, Schnee, Hagel, Wind und aktiver Zug.
- **Züge:** Geschwindigkeit, Soll-Geschwindigkeit, Anzahl Wagen, Länge, Route und Gleis.
  - **Folgen:** Mit der Auswahl oben rechts im Bereich zentriert der Gleisplan bei jeder
    Aktualisierung auf den gewählten Zug.
  - **Zeige:** zentriert den Gleisplan einmalig auf den Zug.
  - **Gleis-Info:** öffnet im Gleisplan die Informationen des Gleises, auf dem der Zug steht.
- **Signale:** Stellung und wartende Züge. Die Farben stammen aus dem Gleisplan
  (siehe Abschnitt 3). Ohne verbundenen Gleisplan sind alle Stellungen neutral grau.
- **Weichen:** Stellung (Durchfahrt, Abzweig, KoAbzweig).
- **Rollmaterial:** alle Fahrzeuge mit Zug, Länge, Gleis, Position und Kupplungen.
  Fahrzeuge mit Antrieb sind mit „(Lok)“ markiert.

---

## 3. Gleisplan und Bridge zusammen nutzen

Die Bridge sendet die Daten über einen Browser-Kanal (`BroadcastChannel`) an den Gleisplan.
Beide Seiten müssen dafür **aus demselben Ursprung** geladen sein, also vom selben Server
(`http://localhost:8000/...`). Lokale Dateien (`file://`) verhalten sich je nach Browser anders,
daher wird der Weg über den lokalen Webserver (Abschnitt 2.2) empfohlen.

### Ablauf

1. **EEP starten** und die Anlage mit dem Lua-Modul laufen lassen (Abschnitt 1).
2. **Bridge öffnen** und die JSON-Datei verbinden (Abschnitt 2.1 oder 2.2).
3. **Gleisplan öffnen**, über **Gleisplan öffnen** in der Bridge oder direkt über `EEP_Gleisplan.html`.
4. **Die `.anl3`-Datei derselben Anlage laden.** Wähle die Anlagendatei der gerade laufenden Anlage
   (auch per Drag&Drop möglich). Der Gleisplan meldet sich erst nach dem Laden bei der Bridge, ab
   dann fließen die Daten.
5. Sobald sich die Daten ändern, aktualisiert sich der Gleisplan von selbst.

Wichtig: Die Daten gehören zu einer bestimmten Anlage. Lade im Gleisplan dieselbe Anlage, die in
EEP läuft. Mit einer anderen Anlage stimmen Gleis-, Signal- und Weichennummern nicht überein.

### Was der Gleisplan anzeigt

**Züge**

- Jedes Fahrzeug erscheint als gerade Linie in Orange. Die Linien schließen lückenlos aneinander an
  und folgen dem Gleisverlauf, auch über Gleisgrenzen und Weichen hinweg.
- Fahrzeuge mit Antrieb (Loks) sind dunkler und dicker gezeichnet.
- Ein Kreis mit dunklem Rand markiert die Zugspitze, der Zugname steht darüber.
- Kleinere Kreise sitzen an den Fahrzeuganfängen laut Export. Daneben steht die Länge des
  Fahrzeugs (`l=…`). Bei angetriebenen Fahrzeugen ist der Kreis dunkler.

**Signale**

Die Farbe richtet sich nach dem Text der aktuellen Signalstellung aus `js/EEP_Signale_Daten.js`:

| Farbe | Bedeutung |
| --- | --- |
| Rot | Halt |
| Grün | Fahrt |
| Orange | Halt erwarten bzw. Vorsignalstellung |
| Grau | Stellung unbekannt oder nicht eindeutig zuzuordnen |

Das gilt für Haupt-, Vorsignale und Haltepunkte. Bei Signalen, deren Stellungstexte nicht eindeutig
sind (zum Beispiel `Hl 13; Hp 0`), bleibt es bei Grau.

**Weichen**

Der Weichentext (W…) wird nach der Stellung gefärbt: Blau = Durchfahrt, Orange = Abzweig,
Lila = KoAbzweig. Diese Farben sagen nichts über „frei“ oder „gesperrt“ aus.

### Zusammenspiel mit der Bridge

- **Folgen:** In der Bridge einen Zug auswählen, der Gleisplan zentriert sich bei jeder Aktualisierung.
- **Zeige** (Züge, Signale, Weichen): zentriert den Gleisplan auf das Objekt. Bei Signalen und
  Weichen öffnet sich zusätzlich das Info-Fenster des Gleisplans.
- **Gleis-Info:** öffnet das Info-Fenster des Gleises, auf dem der Zug steht.
- **an Gleisplan senden:** Mit abgeschaltetem Häkchen sendet die Bridge keine Daten mehr.
  Beim erneuten Einschalten wird sofort der aktuelle Stand gesendet.

### Hinweise und Grenzen

- Die Gleisgeometrie wird aus Anfang, Mitte und Ende jedes Gleises angenähert. In engen Kurven
  und bei Gleisen mit ungewöhnlichen Kurventypen können Fahrzeuge leicht neben dem Gleis liegen.
- Der Zug wird aus den Fahrzeuglängen aufgebaut. Die Lage der Fahrzeuganfänge im Fahrzeug hängt vom
  Modell ab. Fahrzeuglinien können deshalb gegenüber den Kreisen etwas verschoben erscheinen.
- Bei einem einzelnen Fahrzeug wird die Fahrzeugrichtung aus der Orientierung des Fahrzeugs
  abgeleitet.
- Damit Signale, Weichen und in Züge sichtbar sind, müssen die entsprechenden Checkboxen im Gleisplan
  aktiviert sein (*Signale*, *Weichen*, *Gleissysteme*, usw.).  
  Einschränkung: bislang werden Züge immer dargestellt.
  
### Geplante Änderungen

- Übersetzung der Texte in der Bridge auf Englisch und Französisch übersetzt.
- In der Minimalinstalltion sollte es nicht notwendig sein, `addSignals`, `addSwitches`, `addTrainyards` und `installCallbacks` aufzurufen.
- Bei einem Klick auf einen Zug im Gleisplan öffnet sich eine Infobox.

---

## 4. Aufbau der JSON-Datei

Auszug der wichtigsten Felder. Felder ohne Wert fehlen in der Datei, zum Beispiel wenn die
EEP-Version die Abfrage nicht kennt.

```jsonc
{
  "meta":   { "exportedAtEepTime": 12345 },            // ändert sich bei jedem Export
  "global": {
    "eepVersion": "...", "language": "...", "activeTrain": "#Name", "activeRollingstock": "Name",
    "time":    { "seconds": 0, "hour": 12, "minute": 0, "second": 0 },
    "weather": { "cloudsIntensity": 0, "fog": 0, "rain": 0, "snow": 0, "hail": 0, "wind": 0 },
    "plant":   { "name": "...", "path": "...", "directory": "...", "version": "...", "language": "..." },
    "cameraPosition": { "x": 0, "y": 0, "z": 0 }
  },
  "signals":  { "12": { "state": 1, "trains": ["#Zugname"], "trainsCount": 1, "stopDistance": 0, "functionCount": 2, "tag": "..." } },
  "switches": { "7":  { "state": 1, "tag": "..." } },
  "trainyards": { "1": { "exists": true, "itemCount": 0, "items": [ { "slot": 1, "name": "#Zug", "status": 1 } ] } },
  "structures": {}, "goods": {}, "weatherZones": {},
  "tracks": { "rail": {}, "road": {}, "tram": {}, "auxiliary": {}, "control": {} },
  "trains": {
    "#Zugname": {
      "exists": true, "speed": 0, "targetSpeed": 0, "length": 0, "vehicleCount": 0, "route": "...",
      "track":    { "system": 1, "id": 0, "position": 0, "direction": 1 },
      "position": { "x": 0, "y": 0, "z": 0 },
      "vehicles": ["Fahrzeug 1", "Fahrzeug 2"]         // erstes Fahrzeug = Zugspitze
    }
  },
  "rollingstock": {
    "Fahrzeug 1": {
      "exists": true, "train": "#Zugname", "length": 0, "gears": 0, "forward": true,
      "track":    { "system": 1, "id": 0, "position": 0, "direction": 1 },
      "position": { "x": 0, "y": 0, "z": 0 },
      "couplingFront": 0, "couplingRear": 0
    }
  }
}
```

| Feld | Bedeutung |
| --- | --- |
| `track.system` | Gleissystem: 1 Eisenbahn, 2 Straßenbahn, 3 Straße, 4 Wasserwege, … (entspricht der Gleissystem-ID der Anlage) |
| `track.position` | Position in Metern, immer vom Gleisanfang gerechnet |
| `track.direction` | Orientierung des Fahrzeugs bezogen auf die Verlegerichtung des Gleises |
| `forward` | Fahrzeug ist vorwärts (true) oder rückwärts (false) im Zugverband eingereiht |
| `gears` | größer als 0: Fahrzeug mit Antrieb (Lok) |
| `signals.*.state` | Signalstellung (die Bedeutung hängt vom Signal ab) |
| `switches.*.state` | 1 Durchfahrt, 2 Abzweig, 3 KoAbzweig |

Positionen (`x`, `y`, `z`) sind Meter im Koordinatensystem der Anlage.

---

## 5. Fehlersuche

| Beobachtung | Mögliche Ursache und Abhilfe |
| --- | --- |
| Es entsteht keine `eep_export.json` | Prüfe das EEP-Ereignisfenster. Mit `print(EepExport.lastError)` in `EEPMain` (siehe 1.2) und `debug = true` siehst du, ob der Pfad nicht beschreibbar ist („Datei nicht schreibbar“). Bei älteren EEP-Versionen `outputFile` setzen. Während die Anlage gespeichert wird, ist der Export pausiert. |
| Züge fehlen in der Datei | Züge werden über angemeldete Signale und Depots erkannt. `addSignals()` bzw. `addTrainyards()` aufrufen und `installCallbacks()` am Ende des Skripts ergänzen. Alternativ mit `addTrains()` anmelden. |
| Statuszeile zeigt „keine Daten“ | Quelle noch nicht gewählt. Datei verbinden oder URL abfragen. |
| „Ungültiges JSON“ | Die Datei wird gerade geschrieben oder ist beschädigt. Beim nächsten Intervall erneut versuchen. |
| „Kein EEP-Export (global/trains fehlen)“ | Falsche Datei gewählt. |
| „HTTP 404“ bei URL | Pfad falsch oder Server im falschen Ordner gestartet. |
| „Live-Lesen von Dateien braucht Chrome/Edge“ | Anderen Browser verwenden oder URL-Zugriff nutzen. |
| „Letzte Änderung vor …“ wächst dauernd | EEP steht oder das Lua-Modul exportiert nicht mehr. |
| Gleisplan zeigt keine Züge | Anlage im Gleisplan noch nicht geladen. Bridge und Gleisplan nicht vom selben Server geöffnet. Haken *an Gleisplan senden* aus. Falsche Anlage geladen. |
| Alle Signale grau | Gleisplan nicht verbunden bzw. Anlage noch nicht geladen. Das Signalmodell fehlt in `js/EEP_Signale_Daten.js`. |
| Züge nicht auf dem Gleis | Anlage im Gleisplan stimmt nicht mit der laufenden überein. Oder das Gleis ist ein nicht unterstützter Kurventyp (siehe Konsole). |
| Meldungen „EEP-Live: …“ in der Konsole | Diagnosemeldungen des Live-Moduls, zum Beispiel „Gleis … nicht gefunden“. Öffne die Browser-Konsole mit `F12`. |

Meldungen mit dem Präfix `EEP-Live:` erscheinen jeweils nur einmal pro Ursache.
Wenn du einen Fehler meldest, hänge die Beschreibung bitte an die Meldung.
