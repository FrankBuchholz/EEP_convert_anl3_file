# EEP Export Bridge und Live-Gleisplan

Mit diesem Programm siehst du den aktuellen Zustand einer laufenden EEP-Anlage im Browser:
Züge, Signal- und Weichenstellungen, Uhrzeit und Wetter. Die Daten kommen aus einem
Lua-Modul in EEP, das sie regelmäßig als JSON-Datei ausgibt.

| Baustein | Aufgabe |
| --- | --- |
| **[`EepExport.lua`](Lua/EepExport.lua "EepExport.lua")** (in EEP) | schreibt den aktuellen Anlagenzustand in die Datei `exchange\eep_export.json` |
| **[`EEP_Export_Bridge.html`](EEP_Export_Bridge.html "EEP_Export_Bridge.html")** | liest die JSON-Datei, zeigt Züge, Signale, Weichen und Rollmaterial als Tabellen und leitet die Daten an den Gleisplan weiter |
| **[`EEP_Gleisplan.html`](EEP_Gleisplan.html "EEP_Gleisplan.html")** | zeigt den Gleisplan einer Anlage (`.anl3`) und zeichnet die Live-Daten der Bridge hinein |
| **Webserver** (optional, siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer")) | liefert `exchange\eep_export.json` und die `.anl3`-Datei über das Netzwerk aus, wenn EEP und Browser nicht auf demselben Rechner laufen (Python/Node.js auch per WebSocket) |

```
EEP (EepExport.lua) ──► Datei eep_export.json ──► EEP_Export_Bridge.html ──► EEP_Gleisplan.html
                        Datei <Anlage>.anl3   ──────────────────────────────► (Züge, Signale, Weichen im Plan)
                              │
                              └─ direkt lesen (gleicher Rechner) oder über einen Webserver (anderer Rechner)
```

## Welcher Weg passt zu mir?

| Situation | Datenzugriff | Webserver nötig? |
| --- | --- | --- |
| **A** EEP und Browser auf **demselben Rechner**, Bridge und Gleisplan von lokaler Kopie oder von GitHub Pages | Bridge liest die JSON-Datei direkt (*Datei live verfolgen*, nur Chrome/Edge), Gleisplan lädt die `.anl3` per Dateiauswahl oder Drag&Drop | nein |
| **B** EEP und Browser auf **demselben Rechner**, aber Firefox/Safari oder Komfort per URL | URL-Zugriff auf einen lokalen Server (Abschnitt 2.2) | ja, einfacher lokaler Server |
| **C** EEP auf einem Rechner, Bridge und Gleisplan auf einem **anderen Rechner/Tablet** | URL-Zugriff, `.json` und `.anl3` kommen vom EEP-Rechner | **ja**, HTTPS-Webserver auf dem EEP-Rechner, siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer") |
| **D** Bridge und Gleisplan **im Web** (GitHub Pages) geöffnet, EEP lokal | URL-Zugriff, nur HTTPS erlaubt | **ja**, HTTPS-Webserver auf dem EEP-Rechner, siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer") |

Warum bei C und D ein Webserver nötig ist: Ein Browser darf Dateien eines anderen Rechners nicht direkt lesen.
Der Zugriff geht nur über HTTP(S). Eine Seite aus dem Web (HTTPS) darf zudem nur HTTPS-Quellen abfragen
und braucht die Freigabe des Servers (CORS). Die drei Installationsskripte in [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer")
richten das mit wenigen Handgriffen ein.

## Inhalt

- [1. Lua-Modul in eine Anlage einbinden](#1-lua-modul-in-eine-anlage-einbinden)
- [2. Die Export Bridge nutzen](#2-die-export-bridge-nutzen)
- [3. Gleisplan und Bridge zusammen nutzen](#3-gleisplan-und-bridge-zusammen-nutzen)
- [4. Aufbau der JSON-Datei](#4-aufbau-der-json-datei)
- [5. Fehlersuche](#5-fehlersuche)

---

## 1. Lua-Modul in eine Anlage einbinden

Das Modul `EepExport.lua` sammelt den Zustand der Anlage und schreibt ihn als JSON-Datei.
In der Minimalversion genügt es, das Modul zu laden und in `EEPMain()` aufzurufen. Möchtest du
steuern, welche Objekte exportiert werden, meldest du sie im Hauptskript der Anlage mit
`add…()`-Funktionen an.

Alle `add…()`-Funktionen verstehen drei Eingabeformen und prüfen, ob das Objekt wirklich existiert:

| Form | Beispiel | Wirkung |
| --- | --- | --- |
| Einzelwert | `EepExport.addSignals(12)` | nimmt Signal 12 auf, falls es existiert |
| Liste | `EepExport.addSignals({ 1, 2, 3 })` | nimmt alle vorhandenen aus der Liste auf |
| ohne Eingabe | `EepExport.addSignals()` | sucht die IDs `1` bis `discoverMax` und nimmt alle vorhandenen auf |

Die Prüfung erfolgt verzögert beim ersten `run()`, `collect()` oder `export()`, weil die EEP-Abfragen
während des Ladens des Skripts nicht zuverlässig funktionieren.
Züge und Rollmaterial haben keine numerischen IDs, hier gehen nur Einzelwert und Liste.

### 1.1 Minimalversion

Die Minimalversion braucht keine `add…()`-Aufrufe. Beim ersten Aufruf von `run()` passiert
automatisch Folgendes:

- Wurden keine Signale bzw. Weichen angemeldet, werden die IDs `1` bis `discoverMax` (Standard 1000) nach vorhandenen Objekten durchsucht.
- Wurden keine Depots angemeldet, werden die IDs `1` bis `discoverDepotMax` (Standard 10) durchsucht.
- Züge und Rollmaterial werden automatisch erkannt: über die Signale und Depots, über den aktiven Zug und über die Rückruffunktionen von EEP. Mit der Option `anlFile` (siehe 1.2) kommen zusätzlich alle Fahrzeuge aus der `.anl3`-Datei dazu, und über sie auch ihre Züge.
- Die EEP-Rückruffunktionen werden erweitert (siehe `installCallbacks` unten).

1. **Modul ablegen.** Kopiere `EepExport.lua` in den Lua-Ordner von EEP. Ab EEP 18.1 Plugin 1 kannst du
   sie auch in den Anlagenordner neben die `.anl3`-Datei legen (siehe `package.path` in 1.2).
2. **Hauptskript ergänzen.** Öffne in EEP das Lua-Fenster der Anlage und füge ein:

   ```lua
   local EepExport = require("EepExport")

   function EEPMain()
     EepExport.run()         -- exportiert automatisch im eingestellten Intervall
     return 1
   end
   ```

3. **Anlage starten.** Nach dem Start entsteht die Datei `exchange\eep_export.json` und wird alle 5 EEP-Sekunden
   aktualisiert. Sie liegt im Anlagenordner (neben der `.anl3`-Datei), sofern EEP ihn ermitteln kann
   (ab EEP 18.1 Plugin 1). Sonst wird der Ordner des zuletzt gespeicherten Anlagenpfads verwendet
   (bekannt, sobald die Anlage einmal gespeichert wurde) und zuletzt das Arbeitsverzeichnis, das ist der Installationsordner von EEP.
   Mit der Konfigurationsoption `outputFile` legst du den Pfad selbst fest.

Fehler beim Export (zum Beispiel eine nicht beschreibbare Datei) gibt `run()` selbst im
EEP-Ereignisfenster aus. Die letzte Fehlermeldung steht außerdem in `EepExport.lastError`.

### 1.2 Ausführliche Version

Die ausführliche Version zeigt alle Einstellmöglichkeiten und die gezielte Auswahl der Objekte.

```lua
-- Optional ab EEP 18.1 Plugin 1, wenn das Modul im Anlagenordner neben der .anl3-Datei liegt
package.path = EEPGetAnlPath() .. "\\?.lua;" .. package.path

-- Modul laden
local EepExport = require("EepExport")

-- Optional: Konfiguration (nur die Einträge entkommentieren und angeben, die du ändern willst)
EepExport.configure({
  --outputFile       = nil,    -- vollständiger Pfad der Ausgabedatei, Standard: <Anlagenordner>\exchange\eep_export.json
  --interval         = 5,      -- Export-Intervall in EEP-Sekunden (-1 = nur manuell per EepExport.export(), 0 = bei jedem Aufruf), Standard: 5
  --pretty           = false,  -- true = eingerückte, lesbare JSON-Ausgabe, Standard: false
  --global           = true,   -- Zeit, Jahreszeit, Wetter, Kamera exportieren, Standard: true
  --discoverMax      = 1000,   -- Suchbereich 1..discoverMax bei add...() ohne Eingabe und bei der automatischen Suche, Standard: 1000
  --discoverDepotMax = 10,     -- Obergrenze der automatischen Depot-Suche, Standard: 10
  --autoTrains       = true,   -- Züge automatisch über Signale und Depots einsammeln, Standard: true
  --autoRollingstock = true,   -- Rollmaterial automatisch aus den Fahrzeuglisten der Züge einsammeln, Standard: true
  --scanInterval     = 2,      -- Abstand der automatischen Suche von Zügen und Rollmaterialien, Standard: 2 Sekunden
  --trainScanBatch   = 100,    -- Rollmaterialien je Suchlauf, deren Zug ermittelt wird (0 = aus), Standard: 100
  --anlFile          = nil,    -- Pfad der .anl3-Datei: die Namen aller Rollmaterialien werden daraus gelesen, Standard: nil
  --installCallbacks = true,   -- EEP-Rückruffunktionen automatisch erweitern, Standard: true
  --saveTimeout      = 60,     -- Export-Pause beim Speichern endet nach so vielen echten Sekunden von selbst, Standard: 60
  --debug            = true,   -- Meldungen im EEP-Ereignisfenster anzeigen, Standard: false
})

-- Optional: Auswahl der zu exportierenden Objekte. Ohne Auswahl werden beim ersten run() automatisch
-- Signale und Weichen (1..discoverMax) sowie Depots (1..discoverDepotMax) gesucht.
-- Bislang werden Signale, Weichen und Züge (mit Rollmaterial) von der Bridge weiterverarbeitet.
-- Damit Züge in Depots automatisch gefunden werden, müssen die Depots erfasst sein.
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
  -- Optional: letzte Fehlermeldung abfragen (nil, wenn alles in Ordnung ist)
  --if EepExport.lastError then print(EepExport.lastError) end
  return 1
end

-- Nur nötig, wenn installCallbacks = false gesetzt ist. Dann am Ende des Skripts
-- (nach der Definition eigener EEPOn...-Funktionen) aufrufen:
--EepExport.installCallbacks()
```

**Einstellungen**

| Einstellung | Bedeutung | Standard |
| --- | --- | --- |
| `outputFile` | vollständiger Pfad der Ausgabedatei | `<Anlagenordner>\exchange\eep_export.json` (siehe unten) |
| `interval` | Export-Intervall in EEP-Sekunden; `-1` = nur manueller Export, `0` = bei jedem Aufruf von `run()` (5-mal pro Sekunde). Bei kleinen Anlagen und einem Server mit WebSocket (Python, Node.js) ist `0` wegen der effizienten Übertragung möglich; beim IIS (nur regelmäßige Abfrage) reicht ein größerer Wert | `5` |
| `pretty` | `true` = eingerückte, lesbare JSON-Ausgabe (größere Datei) | `false` |
| `global` | Zeit, Jahreszeit, Wetter und Kamera exportieren | `true` |
| `discoverMax` | Obergrenze der ID-Suche bei `add…()` ohne Eingabe und bei der automatischen Suche nach Signalen und Weichen (`nil` oder `0` = keine Suche) | `1000` |
| `discoverDepotMax` | Obergrenze der automatischen Depot-Suche (`nil` oder `0` = keine Suche) | `10` |
| `autoTrains` | Züge automatisch über Signale, Depots und Rollmaterial einsammeln | `true` |
| `autoRollingstock` | Rollmaterial automatisch aus den Fahrzeuglisten der Züge einsammeln | `true` |
| `scanInterval` | Abstand der automatischen Suche in EEP-Sekunden | `2` |
| `trainScanBatch` | Anzahl der Rollmaterialien je Suchlauf, deren Zug über `EEPRollingstockGetTrainName` ermittelt wird. Die Suche läuft reihum über alle bekannten Rollmaterialien, damit bei vielen Fahrzeugen nicht jeder Lauf alle abfragen muss. `0` = aus | `100` |
| `anlFile` | vollständiger Pfad einer `.anl3`-Datei. Die Namen aller Rollmaterialien werden daraus gelesen und als automatisch erkannte Fahrzeuge angemeldet (siehe unten) | `nil` |
| `installCallbacks` | EEP-Rückruffunktionen beim ersten `run()` automatisch erweitern | `true` |
| `saveTimeout` | Der Export ist beim Speichern pausiert. Die Pause endet nach so vielen echten Sekunden von selbst, falls EEP die Speichermeldung nie sendet (`0` = kein Timeout) | `60` |
| `debug` | Debug-Meldungen im EEP-Ereignisfenster (Dauer von Sammeln, JSON-Erzeugung und Schreiben, automatisches Aufnehmen und Entfernen von Zügen und Fahrzeugen) | `false` |

**Weitere Funktionen**

| Funktion | Wirkung |
| --- | --- |
| `EepExport.run()` | in `EEPMain()` aufrufen, exportiert im eingestellten Intervall |
| `EepExport.installCallbacks()` | hängt die Handler an die EEP-Rückruffunktionen (siehe unten) |
| `EepExport.range(a, b)` | erzeugt die Zahlenliste `a` bis `b` |
| `EepExport.isExportPaused()` | `true`, solange der Export wegen eines laufenden Speichervorgangs ausgesetzt ist |

**Weitere Test-Funktionen**

| Funktion | Wirkung |
| --- | --- |
| `EepExport.discoverAll()` | sucht in allen Kategorien mit numerischen IDs nach vorhandenen Objekten |
| `EepExport.resolve()` | wertet alle bisherigen `add…()`-Aufrufe aus (macht `collect()` von selbst) |
| `EepExport.collect()` | sammelt alle Daten und gibt sie als Lua-Tabelle zurück |
| `EepExport.export()` | sammelt die Daten und schreibt die Datei sofort, gibt `true, Pfad` oder `false, Fehlermeldung` zurück |
| `EepExport.toJson(tabelle, pretty)` | wandelt eine Lua-Tabelle in einen JSON-Text um |
| `EepExport.readRollingstockNames(pfad)` | liest die Namen aller Rollmaterialien aus einer `.anl3`-Datei, gibt eine Liste (Reihenfolge wie in der Datei, ohne Duplikate) oder `nil, Fehlermeldung` zurück |


**Automatische Erkennung von Zügen und Rollmaterial**

- Züge kommen aus den angemeldeten Signalen und Depots (Voraussetzung: sie wurden angemeldet oder
  automatisch gefunden) und aus dem aktiven Zug. Mit den Rückruffunktionen werden sie zusätzlich bei
  Signalhalt, Depot-Ein-/Ausfahrt, Kuppeln und Trennen erkannt.
- Züge kommen außerdem aus dem Rollmaterial: Das Modul fragt reihum bei jedem Suchlauf bis zu
  `trainScanBatch` Fahrzeuge nach ihrem Zug. So findet es auch Züge, die an keinem angemeldeten Signal
  oder Depot stehen.
- Rollmaterial kommt aus den Fahrzeuglisten aller bekannten Züge und, falls `anlFile` gesetzt ist,
  aus der `.anl3`-Datei.
- Automatisch aufgenommene Einträge verschwinden wieder, wenn es sie nicht mehr gibt (zum Beispiel
  nach einer Umbenennung durch Kuppeln). Von Hand angemeldete bleiben immer erhalten.

**Rollmaterial aus der `.anl3`-Datei (`anlFile`)**

Die Anlagendatei enthält die Namen aller Rollmaterialien. Setzt du `anlFile` auf ihren Pfad, werden
diese Namen als automatisch erkannte Fahrzeuge angemeldet. Über `trainScanBatch` werden anschließend
auch ihre Züge gefunden, ohne dass Signale oder Depots angemeldet sein müssen.

```lua
EepExport.configure({
  anlFile = "C:\\Pfad\\zum\\Anlagenordner\\MeineAnlage.anl3",
})
```

- Die Datei wird je Pfad nur einmal gelesen (auch wenn das Lesen fehlschlug), und zwar in Blöcken. Es
  werden nur die `name`-Attribute der `<Rollmaterial>`-Elemente im Abschnitt `<Fuhrpark>` ausgewertet,
  der Rest der Datei wird übersprungen. Ändert sich `anlFile`, wird die neue Datei gelesen.
- Ein Eintrag wird nur aufgenommen, wenn EEP das Fahrzeug kennt (`EEPRollingstockGetTrainName`).
  Fahrzeuge, die es nicht mehr gibt, werden wie alle automatisch erkannten Einträge wieder entfernt.
- Die gespeicherte `.anl3`-Datei zeigt den Stand beim letzten Speichern. Fahrzeuge, die du danach
  umbenannt hast, fehlen oder heißen anders.
- Bei Lesefehlern steht die Meldung in `EepExport.lastError`. Mit `debug = true` wird zusätzlich die
  Anzahl der gelesenen Rollmaterialien und die Lesedauer ausgegeben.
- Ohne `anlFile` bleibt das Verhalten unverändert.

**Rückruffunktionen und eigene EEP-Funktionen**

Beim ersten `run()` erweitert das Modul die Funktionen
`EEPOnTrainStoppedOnSignal`, `EEPOnTrainEnterTrainyard`, `EEPOnTrainExitTrainyard`,
`EEPOnTrainCoupling`, `EEPOnTrainLooseCoupling`, `EEPOnBeforeSaveAnl` und `EEPOnSaveAnl`.
Eigene Funktionen gleichen Namens bleiben erhalten und werden nach den Handlern aufgerufen.
Da das Erweitern erst im ersten `run()` geschieht, sind deine eigenen Funktionen dann bereits definiert.
Nur wenn du `installCallbacks = false` gesetzt hast, rufst du `EepExport.installCallbacks()` selbst
**nach** der Definition deiner eigenen Funktionen auf, am Ende des Skripts. Sonst überschreibt deine
spätere Definition den Handler. Alternativ rufst du die Handler (`EepExport.onTrainCoupling(…)`,
`EepExport.onSaveAnl(pfad)` usw.) aus deinen eigenen Funktionen auf.

**Ausgabedatei und Speichern der Anlage**

- Ohne `outputFile` schreibt das Modul in den Anlagenordner (neben die `.anl3`-Datei), wenn EEP ihn
  liefert (ab EEP 18.1 Plugin 1). Sonst dient der Ordner des Pfads, den EEP beim Speichern meldet.
  Steht auch der nicht zur Verfügung, landet die Datei im Arbeitsverzeichnis, das ist der Installationsordner von EEP.
- **Merke dir den Speicherort.** Du brauchst ihn in Abschnitt 2 (Datei auswählen) bzw. für den Webserver
  (`-SitePath` in [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html)).
- Beim Speichern der Anlage pausiert der Export, damit EEP nicht beim Schreiben gestört wird.
  Das Modul nutzt dafür `EEPOnBeforeSaveAnl` und `EEPOnSaveAnl`. Nach dem Speichern wird zeitnah
  neu exportiert. Der gemeldete Speicherpfad steht in der JSON-Datei als `global.plant.path`.
- Das Intervall zählt in EEP-Sekunden. Bei Zeitraffer wird entsprechend öfter geschrieben.
  Ein kurzes Intervall liefert flüssigere Zugbewegungen, belastet EEP aber stärker, besonders
  bei vielen Zügen. Mit `debug = true` siehst du, wie lange Sammeln, JSON-Erzeugung und Schreiben dauern.
- Die Bridge aktualisiert ihre Anzeige nur, wenn sich der Inhalt der Datei ändert.

**Fehlermeldungen**

`EepExport.lastError` enthält die letzte Fehlermeldung und wird bei jedem Fehler gesetzt:
beim Sammeln der Daten, bei der JSON-Erzeugung, beim Öffnen und beim Schreiben der Datei sowie bei der
automatischen Suche in `run()` sowie beim Lesen der `.anl3`-Datei (`anlFile`). Nach einem erfolgreichen Export ist der Wert wieder `nil`. Die Pause
während des Speicherns gilt nicht als Fehler. `export()` liefert dann `false` mit einem Hinweistext,
setzt `lastError` aber nicht.

---

## 2. Die Export Bridge nutzen

Die Bridge ist eine einzelne HTML-Datei (`EEP_Export_Bridge.html`, zusammen mit `js/EEP_Texts.js` und
`css/EEP_Texts.css`). Sie braucht keine Installation. Öffne sie in einem aktuellen Browser
(Chrome, Edge oder Firefox), entweder direkt im Web
(<https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Export_Bridge.html>) oder aus dem entpackten Archiv
(siehe [`README`](https://frankbuchholz.github.io/EEP_convert_anl3_file/README.html "README") und Abschnitt 2.2). Oben rechts wählst du die Sprache (Deutsch, English, Français).

Es gibt zwei Wege, die JSON-Datei zu lesen:

| | Dateizugriff | URL-Zugriff |
| --- | --- | --- |
| Aufwand | gering | Webserver nötig |
| Browser | Chrome oder Edge (für das laufende Verfolgen) | alle aktuellen Browser |
| Ändert sich die Datei? | wird alle *n* Sekunden neu gelesen | wird alle *n* Sekunden neu abgefragt; bei Servern mit WebSocket (Python, Node.js) kommt jede Änderung sofort |
| Geeignet für | **ein Rechner**, EEP und Browser zusammen | auch **andere Geräte** im Heimnetz (Tablet, zweiter Rechner) und Seiten aus dem Web |

> **EEP und Bridge auf verschiedenen Rechnern?** Dann kann der Browser die Datei `exchange\eep_export.json` nicht direkt
> lesen, und der Gleisplan kann die `.anl3`-Datei nicht per Dateiauswahl laden. Richte auf dem EEP-Rechner einen
> Webserver ein, der beide Dateien ausliefert (Abschnitt 2.2 und [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer")).

### 2.1 Dateizugriff auf die JSON-Datei

1. Öffne `EEP_Export_Bridge.html` im Browser.
2. Klicke auf **Datei live verfolgen** und wähle die Datei `exchange\eep_export.json` aus.
3. Stelle bei **alle … s** das Abfrageintervall ein (Standard: 2 Sekunden).

Die Bridge liest die Datei nun in diesem Takt neu. Der Browser fragt nur einmal nach der Erlaubnis.

Weitere Möglichkeiten:

- **Einmalig laden:** Über das Feld *oder einmalig* oder per Drag&Drop auf die Seite lädst du eine
  Datei genau einmal, zum Beispiel einen gespeicherten Zustand.
- **Zuletzt:** Die Bridge merkt sich die zuletzt benutzte Datei bzw. URL und bietet sie beim
  nächsten Aufruf als Knopf **Zuletzt: …** an. Bei einer Datei fragt der Browser dabei erneut
  nach der Erlaubnis, bei einer URL startet die Abfrage sofort.

> **Einschränkung:** Das fortlaufende Lesen einer Datei funktioniert nur in Chrome und Edge auf einem PC oder Laptop.
> In Firefox und Safari oder auf einem Tablet nutze den URL-Zugriff (Abschnitt 2.2) oder lade die Datei einmalig.

### 2.2 URL-Zugriff mit Webserver

Beim URL-Zugriff holt die Bridge die JSON-Datei per HTTP(S) ab. Dafür muss ein Webserver die Datei
ausliefern. Wähle je nach Situation:

#### Situation C/D: EEP-Rechner und Browser getrennt, oder Seiten aus dem Web

Installiere auf dem EEP-Rechner einen der drei HTTPS-Webserver aus
[`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer") (IIS, Python oder Node.js). Dieser liefert **nur** `.json`- und
`.anl3`-Dateien aus, erlaubt CORS nur für das lokale Netz und GitHub Pages und verwendet HTTPS.
Beispiel mit Port 3001 und dem Anlagenordner als Datenordner:

```powershell
.\Install-node-web-server.ps1 -SitePath "C:\Pfad\zum\Anlagenordner" -HttpsPort 3001 -OpenFirewall
```

Danach öffnest du auf dem zweiten Rechner (nachdem du dort das Zertifikat `EEP Export.cer` importiert hast,
siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer"), Abschnitt 3.6):

```
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Export_Bridge.html?url=https://192.168.0.115:3001/exchange/eep_export.json
https://frankbuchholz.github.io/EEP_convert_anl3_file/EEP_Gleisplan.html?url=https://192.168.0.115:3001/MeineAnlage.anl3
```

(`192.168.0.115` ersetzt du durch die IP-Adresse oder den Namen des EEP-Rechners.) Beide Seiten stammen von
GitHub Pages, haben also dieselbe Origin und können miteinander sprechen (Abschnitt 3). Auf dem EEP-Rechner selbst
reicht `https://localhost:3001/…`.

#### Situation B: einfacher lokaler Server auf einem Rechner

Läuft alles auf einem Rechner und möchtest du nur den URL-Zugriff nutzen (z. B. weil du Firefox verwendest),
reicht ein einfacher lokaler Server. Er liefert Bridge, Gleisplan, JSON-Datei und `.anl3`-Datei **aus einem
gemeinsamen Ordner** aus. Dann gibt es keine CORS-Probleme. Lege dazu die JSON-Datei und die `.anl3`-Datei
in den entpackten Projektordner (Bridge und Gleisplan samt `js`, `css` und `node_modules`) oder starte den Server
in einem gemeinsamen übergeordneten Ordner. Beachte: Die JSON-Datei liegt standardmäßig im Anlagenordner (siehe 1.2).
Der Serverordner muss diesen Ordner enthalten, oder du setzt `outputFile` auf einen Pfad innerhalb des Serverordners.

**Python:**

```bash
# Windows
py -m http.server 8000 --bind 127.0.0.1

# Linux / macOS
python3 -m http.server 8000 --bind 127.0.0.1
```

**Node.js:**

```bash
npx http-server -p 8000 -c-1 -a 127.0.0.1 --cors
```

Anschließend `http://localhost:8000/EEP_Export_Bridge.html` öffnen, im Feld **URL** den Pfad der
JSON-Datei relativ zum Serverordner eintragen (z. B. `exchange/eep_export.json`) und **URL abfragen** klicken.
Beenden mit `Strg+C`. `--bind 127.0.0.1` bzw. `-a 127.0.0.1` sorgt dafür, dass nur dein eigener Rechner den Server erreicht.
Diese einfachen Server liefern **alle** Dateien des Ordners aus. Gib sie nie ins Internet frei und verwende sie
nicht für den Zugriff aus dem Netzwerk. Dafür sind die Skripte aus [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer") gedacht.

#### Aufruf mit URL-Parameter

Die Bridge kann die Abfrage direkt beim Öffnen starten. Hänge dazu den Parameter `url` an die Adresse an:

```
http://localhost:8000/EEP_Export_Bridge.html?url=exchange/eep_export.json
```

Die URL wird dann in das Feld **URL** eingetragen und die Abfrage startet sofort, als hättest du
**URL abfragen** geklickt. Der Parameter hat Vorrang vor **Zuletzt: …**. Das Abfrageintervall stammt
aus dem Feld **alle … s** (zuletzt gespeicherter Wert, sonst 2 Sekunden). Enthält die URL selbst
Sonderzeichen wie `&`, `?` oder `#` (z. B. bei einer vollständigen Adresse mit Parametern), kodiere sie
in der Adresszeile, etwa `?url=http%3A%2F%2F192.168.0.20%3A8000%2Fexchangee%2Fep_export.json`.
So lässt sich die Bridge als Lesezeichen mit fester Quelle ablegen.

#### WebSocket statt Abfrage

Bei einer `http(s)`-URL liest die Bridge die Datei zuerst per HTTP(S) und versucht dann, eine WebSocket-Verbindung zur selben Adresse aufzubauen (`https://` wird zu `wss://`, `http://` zu `ws://`). Unterstützt der Server das (z.B. über die Skripte für Python und Node.js aus [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer")), sendet er die Datei sofort und danach bei jeder Änderung. Die Bridge fragt dann nicht mehr ab, das Intervall **alle … s** wird nicht benutzt, und die Statuszeile zeigt „WebSocket“ statt „HTTP“.

- Bricht die Verbindung ab, fragt die Bridge wieder im eingestellten Intervall ab und versucht nach 5 Sekunden erneut, sich zu verbinden.
- Ohne WebSocket-Unterstützung (IIS, einfacher lokaler Server, abgelehnte Origin) bleibt es bei der Abfrage.
- Bei **Datei live verfolgen** und **oder einmalig** gibt es keinen WebSocket.

#### Hinweise zum URL-Zugriff

- Die Bridge hängt an jede Abfrage einen Zeitstempel an und verhindert so, dass der Browser alte
  Daten aus dem Zwischenspeicher liefert.
- Bei `HTTP 404` stimmt der Pfad nicht. Bei einem einfachen lokalen Server ist der Pfad im URL-Feld relativ zum Ordner, in dem der
  Server gestartet wurde.
- Liegt die JSON-Datei auf einem anderen Server als die Bridge, muss dieser Server
  CORS-Zugriffe erlauben (die Skripte aus [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer") tun das für das lokale Netz und GitHub Pages).
  Eine Bridge aus dem Web (HTTPS) kann nur HTTPS-Adressen abfragen (Ausnahme: `http://localhost` bzw. `http://127.0.0.1`, das die üblichen Browser zulassen).

### 2.3 Bedienung der Bridge

**Kopfzeile**

| Element | Funktion |
| --- | --- |
| **Zuletzt: …** | letzte Quelle (Datei oder URL) erneut verwenden |
| **Datei live verfolgen** | JSON-Datei auswählen und fortlaufend lesen |
| **oder einmalig** | Datei einmal laden (auch per Drag&Drop) |
| **URL / URL abfragen** | JSON-Datei per HTTP(S) abfragen (auch per Aufruf mit `?url=…`, siehe 2.2) |
| **alle … s** | Abfrageintervall (gilt für Datei und HTTP(S)-Abfrage, nicht bei aktivem WebSocket) |
| **an Gleisplan senden** | Daten an einen geöffneten Gleisplan weiterleiten |
| **Gleisplan öffnen** | öffnet `EEP_Gleisplan.html` im selben Ordner in einem neuen Fenster |
| Statuszeile | EEP-Zeit des Exports, Zeit seit der letzten Änderung und Übertragungsweg (HTTP oder WebSocket) |
| Sprachauswahl | Deutsch, English, Français (gilt auch für Gleisplan und Inventar) |

Die Statuszeile zeigt, ob noch neue Daten ankommen. Wächst die Zeit seit der letzten Änderung
dauernd an, steht EEP oder der Export.

**Bereiche**

- **Zeit & Wetter:** EEP-Uhrzeit, EEP-Version, Wolken, Nebel, Regen, Schnee, Hagel, Wind und aktiver Zug.
- **Züge:** Geschwindigkeit, Soll-Geschwindigkeit, Anzahl Fahrzeuge, Länge, Route und Gleis.
  - **Folgen:** Mit der Auswahl oben rechts im Bereich zentriert der Gleisplan bei jeder
    Aktualisierung auf den gewählten Zug.
  - **Zeige:** zentriert den Gleisplan einmalig auf den Zug.
  - **Gleis-Info:** öffnet im Gleisplan die Informationen des Gleises, auf dem der Zug steht.
- **Signale:** Stellung und wartende Züge. Die Farben stammen aus dem Gleisplan
  (siehe Abschnitt 3). Ohne verbundenen Gleisplan sind alle Stellungen neutral grau.
- **Weichen:** Stellung (Durchfahrt, Abzweig, KoAbzweig).
- **Rollmaterialien:** alle Fahrzeuge mit Zug, Länge, Gleis (mit Richtungspfeil), Position und Kupplungen (vorne/hinten).
  Fahrzeuge mit Antrieb sind mit „(Lok)" markiert.

---

## 3. Gleisplan und Bridge zusammen nutzen

Die Bridge sendet die Daten über einen Browser-Kanal (`BroadcastChannel`) an den Gleisplan.
Den Programmcode zum Empfangen und Zeichnen der Live-Daten enthält `EEP_Gleisplan.html` selbst
(Abschnitt „EEP-Live-Erweiterung" am Ende der Datei). Die Bridge braucht dafür nichts mehr einzufügen.

Beide Seiten müssen dafür **aus demselben Ursprung** geladen sein (gleiches Protokoll, gleicher Rechnername, gleicher Port), also zum Beispiel:

- beide von GitHub Pages (`https://frankbuchholz.github.io/…`), oder
- beide vom selben lokalen Server (`http://localhost:8000/…`).

Der Knopf **Gleisplan öffnen** der Bridge öffnet den Gleisplan aus demselben Ordner und sorgt so automatisch
für den gleichen Ursprung. Lokale Dateien (`file://`) verhalten sich je nach Browser anders, daher wird der Weg über Webserver bzw. GitHub Pages empfohlen.
Beide Seiten müssen außerdem im **selben Browser** (selbes Profil) laufen.

### Ablauf

1. **EEP starten** und die Anlage mit dem Lua-Modul laufen lassen (Abschnitt 1).
2. **Bridge öffnen** und die JSON-Datei verbinden (Abschnitt 2.1 oder 2.2).
3. **Gleisplan öffnen**, über **Gleisplan öffnen** in der Bridge oder direkt über `EEP_Gleisplan.html`.
4. **Die `.anl3`-Datei derselben Anlage laden.** Wähle die Anlagendatei der gerade laufenden Anlage
   (auch per Drag&Drop möglich) oder trage im Feld **URL einer EEP-Anlage-Datei** die Adresse ein
   (relativ zur Seite oder vollständig, z. B. `https://192.168.0.115:3001/MeineAnlage.anl3`) und klicke auf **URL laden**.
   Alternativ rufst du den Gleisplan mit dem Parameter `?url=…` auf, z. B. `EEP_Gleisplan.html?url=meineAnlage.anl3`,
   dann wird die Datei automatisch geladen. Die zuletzt benutzte URL wird gemerkt. Die Datei wird dabei einmalig geladen,
   nicht fortlaufend. Liegt sie auf einem anderen Server, muss dieser CORS erlauben (siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer")).
   Der Gleisplan meldet sich erst nach dem Laden bei der Bridge, ab dann fließen die Daten. Daten, die vorher eintreffen, werden zwischengespeichert.
5. Sobald sich die Daten ändern, aktualisiert sich der Gleisplan von selbst.

Wichtig: Die Daten gehören zu einer bestimmten Anlage. Lade im Gleisplan dieselbe Anlage, die in
EEP läuft. Mit einer anderen Anlage stimmen Gleis-, Signal- und Weichennummern nicht überein.

### Was der Gleisplan anzeigt

**Züge**

- Der Zug wird als Linienzug entlang des Gleisverlaufs aufgebaut, ausgehend vom Anfang des ersten
  Fahrzeugs (Zugspitze) über die Summe aller Fahrzeuglängen. Jedes Fahrzeug erscheint darauf als
  gerade Linie in Orange. Die Linien schließen meist lückenlos aneinander an und laufen auch über
  Gleisgrenzen und Weichen hinweg (außer bei virtuellen Verbindungen).
- Fahrzeuge mit Antrieb (z.B. Loks) sind dunkler und dicker gezeichnet.
- Ein Kreis mit dunklem Rand markiert die Zugspitze, der Zugname steht darüber.
- Kleinere Kreise sitzen an den Fahrzeuganfängen laut Export. Daneben stehen Modelltyp (z. B. „Diesellok", „Güterwaggon") und
  Länge des Fahrzeugs. Bei angetriebenen Fahrzeugen ist der Kreis dunkler und größer.

**Infobox zu Zügen und Fahrzeugen**

Ein Klick auf einen Zug (Linie, Kreis oder Text) öffnet eine Infobox mit Geschwindigkeit, Soll-Geschwindigkeit,
Länge, Anzahl Fahrzeuge, Route, Position und Gleis (mit Link, der die Gleis-Info öffnet).
Die Tasten funktionieren wie bei den anderen Objekten:

| Bedienung | Wirkung |
| --- | --- |
| Klick | Infobox des Zuges (ersetzt die zuletzt geöffnete Infobox) |
| <kbd>⇧ Shift</kbd> + Klick | öffnet für den Zug eine eigene, zusätzliche Infobox |
| <kbd>Alt</kbd> + Klick | zusätzlich Liste aller Fahrzeuge des Zuges (Modelltyp, Länge, Ausrichtung, Kupplungen, Position, Gleis); das angeklickte Fahrzeug ist fett |
| <kbd>Alt</kbd> + <kbd>⇧ Shift</kbd> + Klick | beides zusammen |

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
Lila = KoAbzweig. Andere Stellungen (z. B. 5 = Spezial) bleiben ungefärbt. Diese Farben sagen nichts über „frei" oder „gesperrt" aus.

### Zusammenspiel mit der Bridge

- **Folgen:** In der Bridge einen Zug auswählen, der Gleisplan zentriert sich bei jeder Aktualisierung.
- **Zeige** (Züge, Signale, Weichen): zentriert den Gleisplan auf das Objekt. Bei Signalen und
  Weichen öffnet sich zusätzlich das Info-Fenster des Gleisplans.
- **Gleis-Info:** öffnet das Info-Fenster des Gleises, auf dem der Zug steht. Die Bridge sendet dazu die
  Nachricht `showTrack` mit `GleissystemID` und `GleisID`.
- **an Gleisplan senden:** Mit abgeschaltetem Häkchen sendet die Bridge keine Daten mehr.
  Beim erneuten Einschalten wird sofort der aktuelle Stand gesendet.
- **Signalfarben:** Die Bridge fragt die Stellungstexte der Signale beim Gleisplan ab und färbt damit ihre Signaltabelle.

### Hinweise und Grenzen

- Die Gleisgeometrie wird aus Anfang, Mitte und Ende jedes Gleises angenähert. In engen Kurven
  und bei Gleisen mit ungewöhnlichen Kurventypen können Fahrzeuge leicht neben dem Gleis liegen.
- Der Zug wird aus den Fahrzeuglängen aufgebaut. Die Lage der Fahrzeuganfänge im Fahrzeug hängt vom
  Modell ab. Fahrzeuglinien können deshalb gegenüber den Kreisen etwas verschoben erscheinen.
- Wo sich das Gleisnetz verzweigt, folgt der Linienzug bevorzugt dem Gleis, auf dem Fahrzeuge des
  Zuges stehen. Sonst gilt die aktuelle Weichenstellung.
- Bei mehreren Fahrzeugen wird die Richtung zum Zugende so gewählt, dass die Fahrzeuganfänge am
  besten auf dem Linienzug liegen. Bei einem einzelnen Fahrzeug wird sie aus der Orientierung des
  Fahrzeugs abgeleitet.
- Damit Züge, Signale und Weichen sichtbar sind, müssen die entsprechenden Checkboxen im Gleisplan
  aktiviert sein (*Gleissysteme*, *Signale*, *Weichen*, usw.).
- Das fortlaufende Lesen der JSON-Datei per Dateizugriff funktioniert nur in Chrome oder Edge auf einem
  PC oder Laptop, nicht jedoch in Chrome oder Safari auf dem iPad. Dort hilft der URL-Zugriff.

### Geplante Änderungen

- Die Export-Datei muss eigentlich keine reale Datei sein. Es würde genügen, wenn sie im Hauptspeicher des einen Rechners zugreifbar wäre.

---

## 4. Aufbau der JSON-Datei

Auszug der wichtigsten Felder. Felder ohne Wert fehlen in der Datei, zum Beispiel wenn die
EEP-Version die Abfrage nicht kennt (einige Felder gibt es erst ab EEP 17.x bzw. 18.x).

```jsonc
{
  "meta":   { "exportedAtEepTime": 12345 },            // ändert sich bei jedem Export
  "global": {
    "eepVersion": "...", "language": "...", "activeTrain": "#Name", "activeRollingstock": "Name",
    "time":    { "seconds": 0, "hour": 12, "minute": 0, "second": 0 },
    "timeLapse": 1, "fps": 30, "season": 1,
    "plant":   { "name": "...", "path": "...", "directory": "...", "version": "...", "language": "..." },
    "weather": { "cloudsMode": 0, "cloudsIntensity": 0, "fog": 0, "rain": 0, "snow": 0, "hail": 0, "wind": 0 },
    "cameraPosition": { "x": 0, "y": 0, "z": 0 },
    "cameraRotation": { "x": 0, "y": 0, "z": 0 }
  },
  "signals":  { "12": { "state": 1, "trains": ["#Zugname"], "trainsCount": 1, "stopDistance": 0, "functionCount": 2, "tag": "..." } },
  "switches": { "7":  { "state": 1, "tag": "..." } },
  "trainyards": { "1": { "exists": true, "itemCount": 0, "items": [ { "slot": 1, "name": "#Zug", "status": 1 } ] } },
  "structures": {}, "goods": {}, "weatherZones": {},
  "tracks": {
    "rail": { "5": { "occupied": true, "frontTrain": "#Zugname" } },   // frontTrain nur, wenn belegt
    "road": {}, "tram": {}, "auxiliary": {}, "control": {}
  },
  "trains": {
    "#Zugname": {
      "exists": true, "speed": 0, "targetSpeed": 0, "length": 0, "vehicleCount": 0, "route": "...",
      "light": false, "couplingFront": 0, "couplingRear": 0, "trainyard": false,
      "track":    { "system": 1, "id": 0, "position": 0, "direction": 1 },
      "position": { "x": 0, "y": 0, "z": 0 },
      "vehicles": ["Fahrzeug 1", "Fahrzeug 2"]         // erstes Fahrzeug = Zugspitze
    }
  },
  "rollingstock": {
    "Fahrzeug 1": {
      "exists": true, "train": "#Zugname", "length": 0, "gears": 0, "forward": true,
      "modelType": 0, "mileage": 0, "smoke": false, "hook": 0, "tag": "...",
      "track":    { "system": 1, "id": 0, "position": 0, "direction": 1 },
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 },
      "couplingFront": 0, "couplingRear": 0
    }
  }
}
```

| Feld | Bedeutung |
| --- | --- |
| `global.plant.path` | Speicherpfad inkl. Dateiname, erst bekannt, nachdem die Anlage gespeichert wurde |
| `global.plant.directory` | Anlagenordner ohne Dateiname (ab EEP 18.1 Plugin 1) |
| `track.system` | Gleissystem: 1 Eisenbahn, 2 Straße, 3 Straßenbahn, 4 sonstige Splines und Wasserwege (die Bridge gibt den Wert als Gleissystem-ID an den Gleisplan weiter) |
| `track.position` | Position in Metern, immer vom Gleisanfang gerechnet |
| `track.direction` | Ausrichtung des Fahrzeugs auf dem Gleisstück: 1 in Fahrtrichtung des Gleisstücks, 0 entgegen (die Bridge zeigt → bzw. ←) |
| `forward` | Fahrzeug ist vorwärts (true) oder rückwärts (false) im Zugverband eingereiht |
| `gears` | größer als 0: Fahrzeug mit Antrieb (Lok) |
| `modelType` | 1 Tenderlok, 2 Schlepptenderlok, 3 Tender, 4 Elektrolok, 5 Diesellok, 6 Triebwagen, 7 U-/S-Bahn, 8 Straßenbahn, 9 Güterwaggon, 10 Personenwaggon, 11 Luftfahrzeug, 12 Maschine, 13 Wasserfahrzeug, 14 LKW, 15 PKW |
| `couplingFront`, `couplingRear` | Kupplung: 1 scharf, 2 abstoßen, 3 gekuppelt |
| `smoke` | Rauch an (`true`) oder aus (`false`) |
| `hook` | Haken: 0 ausgeschaltet, 1 eingeschaltet, 3 Ladegut am Haken |
| `trainyards.*.items[].status` | 0 in Fahrt, 1 im Depot wartend |
| `trainyard` | Zug steht im Depot (nur Zug im Depot: dann fehlen die Fahrdaten) |
| `signals.*.state` | Signalstellung (die Bedeutung hängt vom Signal ab) |
| `switches.*.state` | 1 Durchfahrt, 2 Abzweig, 3 KoAbzweig |
| `tracks.*.occupied` | Gleis ist besetzt (nur für angemeldete Gleise) |
| `exists: false` | das Objekt gibt es nicht (mehr) |

Positionen (`x`, `y`, `z`) sind Meter im Koordinatensystem der Anlage.

---

## 5. Fehlersuche

| Beobachtung | Mögliche Ursache und Abhilfe |
| --- | --- |
| Es entsteht keine `exchange\eep_export.json` | Prüfe das EEP-Ereignisfenster. Dort meldet `run()` Fehler wie „Datei nicht schreibbar", mit `debug = true` zusätzlich Details. Die letzte Meldung steht auch in `EepExport.lastError`. Die Datei liegt im Anlagenordner (ab EEP 18.1 Plugin 1), sonst im Installationsordner von EEP. Bei älteren EEP-Versionen oder wenn der Pfad nicht beschreibbar ist, `outputFile` setzen. Während die Anlage gespeichert wird, ist der Export pausiert. |
| Züge fehlen in der Datei | Züge werden über Signale und Depots oder die Anlagendatei erkannt. Prüfe, ob die Signale gefunden wurden (`discoverMax`) und ob deine Depots im Bereich `1..discoverDepotMax` liegen, sonst `addTrainyards()` verwenden. Ist `installCallbacks = false`, rufe `installCallbacks()` am Ende des Skripts auf. Alternativ mit `addTrains()` anmelden oder `anlFile` setzen, dann werden die Züge über die Fahrzeuge der Anlagendatei gefunden. |
| Meldung „anl3-Datei …: Datei nicht lesbar“ | Der Pfad in `anlFile` stimmt nicht oder die Datei ist nicht lesbar. Vollständigen Pfad inklusive Dateiname prüfen. Der Export läuft trotzdem weiter, nur die Fahrzeuge aus der Datei fehlen. |
| Statuszeile zeigt „keine Daten" | Quelle noch nicht gewählt. Datei verbinden, URL abfragen oder die Bridge mit `?url=…` aufrufen. |
| „Ungültiges JSON" | Die Datei wird gerade geschrieben oder ist beschädigt. Beim nächsten Intervall erneut versuchen. |
| „Kein EEP-Export (global/trains fehlen)" | Falsche Datei gewählt. |
| „HTTP 404" bei URL | Pfad falsch oder Server im falschen Ordner gestartet. Beim HTTPS-Webserver aus [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html): Liegt `exchange\eep_export.json` im `-SitePath`? |
| „Fehler: Failed to fetch" bei URL | Server nicht erreichbar (läuft er? Firewall? IP-Adresse geändert?), Zertifikat auf diesem Gerät nicht vertraut, Origin der Bridge vom Server nicht erlaubt (CORS) oder die Bridge kommt per HTTPS aus dem Web und die URL ist nur HTTP. Siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer"), Abschnitt 4. |
| Statuszeile zeigt dauernd „HTTP“ statt „WebSocket“ | Der Server unterstützt keinen WebSocket (IIS, einfacher lokaler Server, älteres Skript), die URL ist keine `http(s)`-Adresse, oder der Server lehnt die Origin ab (Log: `403 Forbidden`, siehe [`README_WebServer`](https://frankbuchholz.github.io/EEP_convert_anl3_file/WebServer/README_WebServer.html "README_WebServer"), Abschnitt 4). Die Daten kommen trotzdem per Abfrage. |
| „Live-Lesen von Dateien braucht Chrome/Edge" | Anderen Browser verwenden oder URL-Zugriff nutzen. |
| „Letzte Änderung vor …" wächst dauernd | EEP steht oder das Lua-Modul exportiert nicht mehr. |
| Gleisplan: „Fehler: …" bei **URL laden** | Datei nicht erreichbar (falsche URL, `file://`, fehlendes CORS bei anderem Server, Zertifikat nicht vertraut). Datei stattdessen auswählen oder per Drag&Drop laden. |
| Gleisplan zeigt keine Züge | Anlage im Gleisplan noch nicht geladen. Bridge und Gleisplan nicht von derselben Origin oder nicht im selben Browser geöffnet. Haken *an Gleisplan senden* aus. Falsche Anlage geladen. |
| Alle Signale grau | Gleisplan nicht verbunden bzw. Anlage noch nicht geladen. Das Signalmodell fehlt in `js/EEP_Signale_Daten.js`. |
| Züge nicht auf dem Gleis | Anlage im Gleisplan stimmt nicht mit der laufenden überein. Oder das Gleis ist ein nicht unterstützter Kurventyp (siehe Konsole). |
| Meldungen „EEP-Live: …" in der Konsole | Diagnosemeldungen des Live-Moduls, zum Beispiel „Gleis … nicht gefunden". Öffne die Browser-Konsole mit `F12`. |

Meldungen mit dem Präfix `EEP-Live:` erscheinen jeweils nur einmal pro Ursache.
Wenn du einen Fehler meldest, hänge die Beschreibung bitte an die Meldung.
