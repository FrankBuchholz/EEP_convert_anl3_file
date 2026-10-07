--- EepExport.lua
--- Modul zum Export aktueller Zustandsdaten einer EEP-Anlage als JSON-Datei.
--- Einbindung per require im Hauptskript der Anlage (siehe Beispiel).
---
--- Objekte werden ueber die add...()-Funktionen angemeldet. Alle add...()-Funktionen verstehen
--- drei Eingabeformen und pruefen dabei, ob das Objekt wirklich existiert:
---   a) ein einzelner Wert:        EepExport.addSignals(12)
---   b) eine Liste von Werten:     EepExport.addSignals({ 1, 2, 3 })
---   c) ohne Eingabe:              EepExport.addSignals()   -> sucht 1..discoverMax nach Signalen
--- Die Pruefung erfolgt verzoegert beim ersten collect()/export()/run(), weil die EEP-Abfragen
--- waehrend des Ladens des Skripts nicht zuverlaessig funktionieren.
--- Zuege und Rollmaterial haben keine numerischen IDs; hier ist nur a) und b) moeglich.
---
--- Automatische Erkennung von Zuegen und Rollmaterial (autoTrains / autoRollingstock):
---   * Zuege: werden aus den angemeldeten Signalen (EEPGetSignalTrainName) und virtuellen Depots
---     (EEPGetTrainyardItemName) uebernommen, sobald sie dort auftauchen. Zusaetzlich reagieren
---     die Handler fuer Rueckruf-Funktionen (installCallbacks) auf Signalhalt, Depot-Ein-/Ausfahrt,
---     Kuppeln und Trennen. Außerdem werden die Daten von EEPGetTrainActive verwendet.
---   * Rollmaterial: wird aus den Fahrzeuglisten aller bekannten Zuege uebernommen.
---   * Automatisch aufgenommene Eintraege werden wieder entfernt, wenn es sie nicht mehr gibt
---     (z.B. nach Umbenennung durch Kuppeln). Von Hand angemeldete bleiben immer erhalten.
--- Voraussetzung: Signale/Depots wurden per addSignals()/addTrainyards() angemeldet.
---
--- Automatischer Start: Beim ersten Aufruf von run() (aus EEPMain) passiert ohne weiteres Zutun:
---   * Die EEP-Rueckruffunktionen werden erweitert (siehe installCallbacks()), ausser config.installCallbacks = false.
---   * Wurden keine Signale bzw. Weichen angemeldet, wird 1..discoverMax danach durchsucht.
---     Wurden keine Depots angemeldet, wird 1..discoverDepotMax (Standard 10) durchsucht.
---
--- Speichern der Anlage: Der Export pausiert, sobald EEP EEPOnBeforeSaveAnl() aufruft, und
--- wird durch EEPOnSaveAnl(Pfad) wieder freigegeben. Dabei merkt sich das Modul den Speicherpfad
--- (Ausgabe als global.plant.path). Dafuer installCallbacks() aufrufen oder die Handler
--- onBeforeSaveAnl() / onSaveAnl(pfad) aus den eigenen EEP-Funktionen aufrufen.

--[[ ---------------------------------------------------------------------------------------------
Beispiel fuer das Hauptskript der Anlage:

--- Optional: Modul liegt im Anlagenordner neben der .anl3-Datei
package.path = EEPGetAnlPath() .. "\\?.lua;" .. package.path

--- Lade Modul EepExport
local EepExport = require("EepExport")

--- Optional: Konfiguration (nicht erforderlich)
EepExport.configure({ 
  --outputFile       = nil,    -- Vollstaendiger Pfad der Ausgabedatei; Standard: <Anlagenpfad>\eep_export.json
  --interval         = 5,      -- Export-Intervall in EEP-Sekunden (0 = nur manuell per M.export()), Standard: 5
  pretty             = true,   -- true = eingerueckte, lesbare JSON-Ausgabe, Standard: false
  --global           = true,   -- Zeit, Jahreszeit, Wetter, Kamera exportieren, Standard: true
  --discoverMax      = 1000,   -- Bereich 1..discoverMax wird beim ersten Lauf automatisch auf vorhandene Objekte
                               -- geprueft (nil oder 0 = keine automatische Erkennung), Standard: 1000
  --discoverDepotMax = 10,     -- Obergrenze der automatischen Depot-Suche, Standard: 10
  --autoTrains       = true,   -- Zuege automatisch ueber Signale und Depots einsammeln, Standard: true
  --autoRollingstock = true,   -- Rollmaterial automatisch aus den Fahrzeuglisten bekannter Zuege einsammeln, Standard: true
  --scanInterval     = 2,      -- Abstand der automatischen Suche in EEP-Sekunden, Standard: 2
  --installCallbacks = true,   -- EEP-Rueckruffunktionen automatisch erweitern, Standard: true
  debug              = true,   -- Debug, Standard: false
})

--- Optional: Auswahl der zu exportierenden Daten. Ohne Auswahl werden beim ersten run() automatisch
--- Signale und Weichen (1..discoverMax) und Depots (1..discoverDepotMax) gesucht.
EepExport.addSignals()                         -- ohne Eingabe: alle Signale 1..discoverMax suchen
EepExport.addSwitches({ 1, 2, 3 })             -- Einzelwert oder Liste: nur existierende werden aufgenommen 
EepExport.addTrainyards(EepExport.range(1, 5)) -- Bereich angeben
--EepExport.addRailTracks({ 1, 2, 3 })
--EepExport.addRoadTracks({ 1, 2, 3 })
--EepExport.addTramTracks({ 1, 2, 3 })
--EepExport.addAuxiliaryTracks({ 1, 2, 3 })
--EepExport.addControlTracks({ 1, 2, 3 })
--EepExport.addStructures({ '#1', '#2', '#3' })    -- Lua-Name oder Zahl
--EepExport.addGoods({ '#1', '#2', '#3' })         -- Lua-Name oder Zahl
--EepExport.addWeatherZones({ '#1', '#2', '#3' })  -- Lua-Name oder Zahl

--- Zuege und Rollmaterial muessen mit Namen angemeldet werden
--EepExport.addTrains({ "#ICE1", "#Gueterzug" })
--EepExport.addRollingstock({ 'Lok', 'Wagen', 'Fracht' })

--- Optional: Sucht in allen Kategorien mit numerischen IDs (also ausser Zuege und Rollmaterial) nach vorhandenen Objekten.
--EepExport.discoverAll()

--- Optional: Sammelt alle Zustandsdaten und gibt sie als Tabelle zurueck.
--EepExport.collect()

--- Optional: Wertet alle bisher angemeldeten add...()-Aufrufe aus. Wird von collect() automatisch aufgerufen.
--EepExport.resolve()

--- Optional: Sammelt die Daten und schreibt sie als JSON-Datei. Gibt true, Pfad oder false, Fehlermeldung zurueck.
--EepExport.export()

function EEPMain()
  --- In EEPMain() aufrufen. Exportiert automatisch im eingestellten Intervall (EEP-Zeit in Sekunden). 
  --- Alternativ: EepExport.export() mit unbedingter Ausführung in jedem Zyklus (also 5 Mal je Sekunde)
  EepExport.run()
  --- Anzeige der letzten Fehlermeldung (EepExport.lastError wird bei jedem Fehler gesetzt, nach erfolgreichem Export geloescht)
  if EepExport.lastError then print(EepExport.lastError) end
  
  return 1
end

--- Die Rueckruffunktionen werden beim ersten run() automatisch erweitert (Abschalten: installCallbacks = false):
--- EEPOnTrainStoppedOnSignal, 
--- EEPOnTrainEnterTrainyard, EEPOnTrainExitTrainyard, 
--- EEPOnTrainCoupling, EEPOnTrainLooseCoupling,
--- EEPOnBeforeSaveAnl, EEPOnSaveAnl.
--- Eigene Funktionen gleichen Namens bleiben erhalten und werden nach den Handlern aufgerufen.
--- Manuell (z.B. bei abgeschaltetem Automatismus) weiterhin moeglich: EepExport.installCallbacks()
------------------------------------------------------------------------------------------------]]

local M = {}

--- Letzte Fehlermeldung (nil, wenn der letzte Export bzw. Lauf fehlerfrei war).
M.lastError = nil

-- ---------------------------------------------------------------------------------------------
-- Konfiguration
-- ---------------------------------------------------------------------------------------------
local config = {
  outputFile       = nil,   -- Vollstaendiger Pfad der Ausgabedatei; Standard: <Anlagenpfad>\eep_export.json
  interval         = 5,     -- Export-Intervall in EEP-Sekunden (0 = nur manuell per M.export())
  pretty           = false, -- true = eingerueckte, lesbare JSON-Ausgabe
  global           = true,  -- Zeit, Jahreszeit, Wetter, Kamera exportieren
  discoverMax      = 1000,  -- Obergrenze der ID-Suche, wenn add...() ohne Eingabe aufgerufen wird
  discoverDepotMax = 10,    -- Obergrenze der ID-Suche fuer virtuelle Depots (nil oder 0 = keine Depot-Suche)
  autoTrains       = true,  -- Zuege automatisch ueber Signale und Depots einsammeln
  autoRollingstock = true,  -- Rollmaterial automatisch aus den Fahrzeuglisten bekannter Zuege einsammeln
  scanInterval     = 2,     -- Abstand der automatischen Suche in EEP-Sekunden
  saveTimeout      = 60,    -- Sicherheitsnetz: Export-Pause endet nach so vielen realen Sekunden von selbst,
                            -- falls EEPOnSaveAnl nie kommt (0 = kein Timeout)
  installCallbacks = true,  -- EEP-Rueckruffunktionen beim ersten run() automatisch erweitern
  debug            = false, -- Debugging-Information anzeigen
}

local registry = {
  signals = {}, 
  switches = {}, 
  depots = {},
  railTracks = {}, 
  roadTracks = {}, 
  tramTracks = {}, 
  auxTracks = {}, 
  controlTracks = {},
  structures = {}, 
  goods = {}, 
  zones = {}, 
  trains = {}, 
  rollingstock = {},
}
local pending = {}      -- noch nicht ausgewertete add...()-Aufrufe
local lastExport = nil
local lastScan   = nil       
local initialized = false  -- automatische Initialisierung (Callbacks, Suche) bereits erfolgt
local callbacksInstalled = false
local paused      = false  -- Export pausiert, solange die Anlage gespeichert wird
local pausedSince = nil    -- reale Zeit (os.time) des Pausenbeginns
local savedPath   = nil    -- zuletzt in EEPOnSaveAnl gemeldeter Speicherpfad (inkl. Dateiname) 

-- ---------------------------------------------------------------------------------------------
-- Hilfsfunktionen
-- ---------------------------------------------------------------------------------------------

--- Ruft eine EEP-Funktion geschuetzt auf. Fehlt die Funktion (aeltere EEP-Version) oder wirft
--- sie einen Fehler, wird false zurueckgegeben.
local function unwrap(status, ...)
  if status then return ... end
  return false
end

local function try(fn, ...)
  if type(fn) ~= "function" then return false end
  return unwrap(pcall(fn, ...))
end

local function contains(list, value)
  for _, v in ipairs(list) do
    if v == value then return true end
  end
  return false
end

--- Erzeugt eine Zahlenliste aus einem Bereich, z.B. range(1, 20).
function M.range(first, last)
  local t = {}
  for i = first, last do t[#t + 1] = i end
  return t
end

-- ---------------------------------------------------------------------------------------------
-- JSON-Encoder (minimal, ohne externe Abhaengigkeiten)
-- ---------------------------------------------------------------------------------------------
local escapes = {
  ['"'] = '\\"', 
  ['\\'] = '\\\\', 
  ['\b'] = '\\b', 
  ['\f'] = '\\f',
  ['\n'] = '\\n', 
  ['\r'] = '\\r', 
  ['\t'] = '\\t',
}

local function encodeString(s)
  s = s:gsub(
    '[%c"\\]', 
    function(c)
      return escapes[c] or string.format("\\u%04x", string.byte(c))
    end
  )
  return '"' .. s .. '"'
end

local function isArray(t)
  local n = 0
  for k in pairs(t) do
    if type(k) ~= "number" or k < 1 or k % 1 ~= 0 then return false end
    n = n + 1
  end
  return n == #t
end

local function encode(v, pretty, indent)
  local tv = type(v)
  if tv == "nil" then return "null"
  
  elseif tv == "boolean" then return tostring(v)
  
  elseif tv == "number" then
    if v ~= v or v == math.huge or v == -math.huge then return "null" end
    if v % 1 == 0 and math.abs(v) < 1e15 then return string.format("%d", v) end
    return string.format("%.6g", v)
    
  elseif tv == "string" then return encodeString(v)
  
  elseif tv == "table" then
    local nl, ind, ind2, sep = "", "", "", ":"
    if pretty then
      nl = "\n"; ind = string.rep("  ", indent + 1); ind2 = string.rep("  ", indent); sep = ": "
    end
    
    local parts = {}
    if next(v) == nil then return "{}" end
    
    if isArray(v) then
      for i = 1, #v do parts[#parts + 1] = ind .. encode(v[i], pretty, indent + 1) end
      return "[" .. nl .. table.concat(parts, "," .. nl) .. nl .. ind2 .. "]"
    end
    
    local keys = {}
    for k in pairs(v) do keys[#keys + 1] = tostring(k) end
    table.sort(keys)
    for _, k in ipairs(keys) do
      local val = v[k]
      if val == nil then val = v[tonumber(k)] end
      parts[#parts + 1] = ind .. encodeString(k) .. sep .. encode(val, pretty, indent + 1)
    end
    return "{" .. nl .. table.concat(parts, "," .. nl) .. nl .. ind2 .. "}"
  end
  
  return "null"
end

--- Wandelt eine Lua-Tabelle in einen JSON-String um.
function M.toJson(value, pretty)
  -- Alternative: json.lua (c) 2020 rxi rxi https://github.com/rxi/json.lua oder cjson.dll
  return encode(value, pretty and true or false, 0)
end

-- ---------------------------------------------------------------------------------------------
-- Objektkategorien: Existenzpruefung + Anmeldung (add...)
-- ---------------------------------------------------------------------------------------------

-- Existenzpruefungen: liefern true, wenn es das Objekt gibt.
-- Signal/Weiche: Stellung 0 bedeutet "existiert nicht".
local function existsSignal(id)
  local v = try(EEPGetSignal, id)
  return type(v) == "number" and v ~= 0
end

local function existsSwitch(id)
  local v = try(EEPGetSwitch, id)
  return type(v) == "number" and v ~= 0
end

-- Gleise: Die Registrierung liefert true, wenn das Element existiert, und macht es
-- gleichzeitig fuer Besetztabfragen verfuegbar (zwingende Voraussetzung).
local function registrar(fn)
  return function(id) return try(fn, id) == true end
end

local function existsStructure(name) return try(EEPStructureGetPosition, name) == true end
local function existsGoods(name)     return try(EEPGoodsGetPosition, name) == true end
local function existsZone(id)        return try(EEPGetZonePos, id) == true end

-- Depot: gilt als vorhanden, wenn mindestens ein Fahrzeugverband dort registriert ist.
local function existsDepot(id)
  local n = try(EEPGetTrainyardItemsCount, id)
  return type(n) == "number" and n > 0
end

-- Zug/Rollmaterial: Abfrage ueber den Namen (Zug auch, wenn er gerade im Depot steht).
local function existsTrain(name)
  if try(EEPGetTrainSpeed, name) == true then return true end
  return try(EEPIsTrainInTrainyard, name) == true
end

local function existsRollingstock(name)
  return try(EEPRollingstockGetTrainName, name) == true
end

-- Normalisierung der Eingabewerte
local function toId(v)
  local n = tonumber(v)
  if n and n % 1 == 0 then return n end
  return nil
end

local function toLuaName(v)
  if type(v) == "number" then return "#" .. string.format("%d", v) end
  if type(v) == "string" and v ~= "" then return v end
  return nil
end

local function toName(v)
  if type(v) == "string" and v ~= "" then return v end
  return nil
end

local categories = {
  signals       = { list = registry.signals,       exists = existsSignal,                         normalize = toId,      scan = true },
  switches      = { list = registry.switches,      exists = existsSwitch,                         normalize = toId,      scan = true },
  depots        = { list = registry.depots,        exists = existsDepot,                          normalize = toId,      scan = true, scanMaxKey = "discoverDepotMax" },
  railTracks    = { list = registry.railTracks,    exists = registrar(EEPRegisterRailTrack),      normalize = toId,      scan = true },
  roadTracks    = { list = registry.roadTracks,    exists = registrar(EEPRegisterRoadTrack),      normalize = toId,      scan = true },
  tramTracks    = { list = registry.tramTracks,    exists = registrar(EEPRegisterTramTrack),      normalize = toId,      scan = true },
  auxTracks     = { list = registry.auxTracks,     exists = registrar(EEPRegisterAuxiliaryTrack), normalize = toId,      scan = true },
  controlTracks = { list = registry.controlTracks, exists = registrar(EEPRegisterControlTrack),   normalize = toId,      scan = true },
  structures    = { list = registry.structures,    exists = existsStructure,                      normalize = toLuaName, scan = true },
  goods         = { list = registry.goods,         exists = existsGoods,                          normalize = toLuaName, scan = true },
  zones         = { list = registry.zones,         exists = existsZone,                           normalize = toId,      scan = true },
  trains        = { list = registry.trains,        exists = existsTrain,                          normalize = toName,    scan = false },
  rollingstock  = { list = registry.rollingstock,  exists = existsRollingstock,                   normalize = toName,    scan = false },
}
for key, cat in pairs(categories) do cat.key = key end

-- Automatisch aufgenommene Eintraege je Kategorie: key -> { [wert] = true }
local autoSet = {}

--- Wertet einen add...()-Aufruf aus: prueft die Werte und haengt vorhandene Objekte an die Liste an.
--- Gibt die Anzahl neu hinzugefuegter Objekte zurueck.
local function process(cat, input, scan, auto)
  local added = 0
  
  local function consider(value)
    value = cat.normalize(value)
    if value == nil then return end
    
    if contains(cat.list, value) then
      -- von Hand bestaetigt: wird nie mehr automatisch entfernt
      if not auto and autoSet[cat.key] then autoSet[cat.key][value] = nil end
      
    elseif cat.exists(value) then
      cat.list[#cat.list + 1] = value
      added = added + 1
      if auto then
        autoSet[cat.key] = autoSet[cat.key] or {}
        autoSet[cat.key][value] = true
      end
    end
  end

  if scan then
    if cat.scan then
      local max = config[cat.scanMaxKey or "discoverMax"] or 0
      for id = 1, max do consider(id) end
    end
  elseif type(input) == "table" then
    for _, value in ipairs(input) do consider(value) end
  else
    consider(input)
  end
  return added
end

local function queue(key, input)
  pending[#pending + 1] = { key = key, input = input, scan = (input == nil) }
end

--- Wertet alle bisher angemeldeten add...()-Aufrufe aus. Wird von collect() automatisch aufgerufen.
--- Gibt eine Tabelle mit der Anzahl neu hinzugefuegter Objekte je Kategorie zurueck.
function M.resolve()
  --if config.debug then print("EepExport.resolve()") end
  
  local queued = pending
  pending = {}
  local counts = {}
  for _, job in ipairs(queued) do
    local cat = categories[job.key]
    counts[job.key] = (counts[job.key] or 0) + process(cat, job.input, job.scan)
  end
  return counts
end

-- Anmeldefunktionen: Einzelwert, Liste oder ohne Eingabe (Suche 1..discoverMax)
function M.addSignals(input)         queue("signals",       input) end
function M.addSwitches(input)        queue("switches",      input) end
function M.addTrainyards(input)      queue("depots",        input) end
function M.addRailTracks(input)      queue("railTracks",    input) end
function M.addRoadTracks(input)      queue("roadTracks",    input) end
function M.addTramTracks(input)      queue("tramTracks",    input) end
function M.addAuxiliaryTracks(input) queue("auxTracks",     input) end
function M.addControlTracks(input)   queue("controlTracks", input) end
function M.addStructures(input)      queue("structures",    input) end   -- Zahl 12 oder "#12" bzw. "#12_Name"
function M.addGoods(input)           queue("goods",         input) end
function M.addWeatherZones(input)    queue("zones",         input) end
function M.addTrains(input)          queue("trains",        input) end   -- nur Namen mit #-Praefix
function M.addRollingstock(input)    queue("rollingstock",  input) end   -- nur Namen

--- Sucht in allen Kategorien mit numerischen IDs (alle ausser Zuege/Rollmaterial) nach vorhandenen Objekten.
function M.discoverAll()
  -- Reihenfolge fuer discoverAll() ohne Zuege und Rollmeterialien
  local scanOrder = { 
    "signals", 
    "switches", 
    "depots", 
    "railTracks", 
    "roadTracks", 
    "tramTracks", 
    "auxTracks",
    "controlTracks", 
    "structures", 
    "goods", 
    "zones", 
  }
  for _, key in ipairs(scanOrder) do queue(key, nil) end
end

-- ---------------------------------------------------------------------------------------------
-- Automatische Erkennung von Zuegen und Rollmaterial
-- ---------------------------------------------------------------------------------------------
local vehicleCount = {}   -- Zugname -> zuletzt gelesene Fahrzeugzahl (spart wiederholte Abfragen)

--- Nimmt einen Zug bzw. ein Fahrzeug automatisch auf (mit Existenzpruefung).
--- Zugnamen werden mit und ohne #-Praefix versucht, da Rueckrufe sie teils ohne liefern.
local function addAuto(key, name)
  if type(name) ~= "string" or name == "" then return end
  
  local cat = categories[key]
  if key == "trains" then
    if contains(cat.list, name) or contains(cat.list, "#" .. name) then return end
    
    if not existsTrain(name) and name:sub(1, 1) ~= "#" and existsTrain("#" .. name) then
      name = "#" .. name
    end
    
  elseif contains(cat.list, name) then
    return
  end
  
  if config.debug then print(string.format("EepExport auto discovery: %s %s", key, name)) end

  process(cat, name, false, true)
end

--- Entfernt automatisch aufgenommene Eintraege, die es nicht mehr gibt.
local function pruneAuto(key)
  local set = autoSet[key]
  if not set then return end
  
  local cat = categories[key]
  for i = #cat.list, 1, -1 do
    local value = cat.list[i]
    if set[value] and not cat.exists(value) then
      if config.debug then print(string.format("EepExport auto removal: %s %s", key, value)) end

      table.remove(cat.list, i)
      set[value] = nil
      vehicleCount[value] = nil
    end
  end
end

--- Durchsucht angemeldete Signale und Depots nach Zuegen und bekannte Zuege nach Fahrzeugen.
local function scanForTrains()
  if config.autoTrains then
    for _, id in ipairs(registry.signals) do
      local n = try(EEPGetSignalTrainsCount, id)
      if type(n) == "number" then
        for i = 1, n do addAuto("trains", try(EEPGetSignalTrainName, id, i)) end
      end
    end
    for _, id in ipairs(registry.depots) do
      local n = try(EEPGetTrainyardItemsCount, id)
      if type(n) == "number" then
        for slot = 1, n do addAuto("trains", try(EEPGetTrainyardItemName, id, slot)) end
      end
    end
  end
  
  if config.autoRollingstock then
    for _, train in ipairs(registry.trains) do
      local count = try(EEPGetRollingstockItemsCount, train)
      if type(count) == "number" and count > 0 and vehicleCount[train] ~= count then
        vehicleCount[train] = count
        for i = 0, count - 1 do addAuto("rollingstock", try(EEPGetRollingstockItemName, train, i)) end
      end
    end
  end
end

-- Handler fuer EEP-Rueckruffunktionen (koennen auch von Hand aus eigenen Funktionen aufgerufen werden)
function M.onTrainStoppedOnSignal(signalId, trainName)
  if config.autoTrains then addAuto("trains", trainName) end
end

function M.onTrainEnterTrainyard(depotId, trainName)
  if config.autoTrains then addAuto("trains", trainName) end
end

function M.onTrainExitTrainyard(depotId, trainName)
  if config.autoTrains then addAuto("trains", trainName) end
end

function M.onTrainCoupling(movingTrainName, standingTrainName, combinedTrainName)
  if config.autoTrains then addAuto("trains", combinedTrainName) end
end

function M.onTrainLooseCoupling(retainedTrainName, detachedTrainName, originalTrainName)
  if config.autoTrains then
    addAuto("trains", retainedTrainName)
    addAuto("trains", detachedTrainName)
  end
end

-- Handler fuer das Speichern der Anlage
local function nowSeconds()
  if type(os) == "table" and type(os.time) == "function" then return os.time() end
  return nil
end

function M.onBeforeSaveAnl()
  paused = true
  pausedSince = nowSeconds()
end

function M.onSaveAnl(projectPath)
  if type(projectPath) == "string" and projectPath ~= "" then savedPath = projectPath end
  paused = false
  pausedSince = nil
  lastExport = nil   -- nach dem Speichern zeitnah neu exportieren
end

--- true, solange der Export wegen eines laufenden Speichervorgangs ausgesetzt ist.
function M.isExportPaused()
  if not paused then return false end
  
  local timeout, now = config.saveTimeout, nowSeconds()
  if timeout and timeout > 0 and pausedSince and now and now - pausedSince > timeout then
    paused = false      -- EEPOnSaveAnl blieb aus: Pause beenden
    pausedSince = nil
    return false
  end
  return true
end

--- Haengt die Handler an die globalen EEP-Rueckruffunktionen. Bereits vorhandene Funktionen
--- des Hauptskripts bleiben erhalten und werden danach aufgerufen. Deshalb erst NACH deren
--- Definition aufrufen (am Ende des Skripts); sonst ueberschreibt die spaetere Definition den Handler.
function M.installCallbacks()
  if callbacksInstalled then return end
  callbacksInstalled = true

  local function chain(name, handler)
    local previous = _G[name]
    _G[name] = function(...)
      pcall(handler, ...)
      if previous then return previous(...) end
    end
  end
  
  chain("EEPOnTrainStoppedOnSignal", M.onTrainStoppedOnSignal)
  chain("EEPOnTrainEnterTrainyard",  M.onTrainEnterTrainyard)
  chain("EEPOnTrainExitTrainyard",   M.onTrainExitTrainyard)
  chain("EEPOnTrainCoupling",        M.onTrainCoupling)
  chain("EEPOnTrainLooseCoupling",   M.onTrainLooseCoupling)
  chain("EEPOnBeforeSaveAnl",        M.onBeforeSaveAnl)
  chain("EEPOnSaveAnl",              M.onSaveAnl)
end

--- Automatische Initialisierung beim ersten run(): Callbacks erweitern und, falls nichts angemeldet
--- wurde, Signale/Weichen (1..discoverMax) bzw. Depots (1..discoverDepotMax) suchen.
local function hasPending(key)
  for _, job in ipairs(pending) do
    if job.key == key then return true end
  end
  return false
end

local function autoInit()
  if initialized then return end
  initialized = true

  if config.installCallbacks then M.installCallbacks() end

  local function discoverIfEmpty(key, max)
    if (max or 0) > 0 and #categories[key].list == 0 and not hasPending(key) then
      queue(key, nil)
    end
  end
  discoverIfEmpty("signals",  config.discoverMax)
  discoverIfEmpty("switches", config.discoverMax)
  discoverIfEmpty("depots",   config.discoverDepotMax)
end

-- ---------------------------------------------------------------------------------------------
-- Einzel-Erfassung
-- ---------------------------------------------------------------------------------------------
local function collectGlobal()
  local g = {
    eepVersion = EEPVer,
    language   = EEPLng,
    time       = { seconds = EEPTime, hour = EEPTimeH, minute = EEPTimeM, second = EEPTimeS },
    timeLapse  = try(EEPGetTimeLapse) or nil,              -- Verfuegbar ab EEP 17.2 - Plugin 2 (nicht in 17.3)
    fps        = try(EEPGetFramesPerSecond) or nil,        -- Verfuegbar ab EEP 17.2 - Plugin 2 (nicht in 17.3)
    season     = try(EEPGetSeason) or nil,                 -- Verfuegbar ab EEP 17.2 - Plugin 2 (nicht in 17.3)
    plant      = {
      name     = try(EEPGetAnlName) or nil,                -- Verfuegbar ab EEP 17.1 - Plugin 1 (nicht in 17.3)
      path      = savedPath,                               -- aus EEPOnSaveAnl (inkl. Dateiname)
      directory = try(EEPGetAnlPath) or nil,               -- Anlagenordner (ohne Dateiname), verfuegbar ab EEP 18.1 - Plugin 1
      version  = try(EEPGetAnlVer) or nil,                 -- Verfuegbar ab EEP 17
      language = try(EEPGetAnlLng) or nil,                 -- Anlagensprache in Bezug auf Achsen, Verfuegbar ab EEP 17
    },
    weather = {
      cloudsMode      = try(EEPGetCloudsMode) or nil,      -- Verfuegbar ab EEP 17.1 - Plugin 1 (nicht in 17.3)
      cloudsIntensity = try(EEPGetCloudsIntensity) or nil, -- Verfuegbar ab EEP 16.1 - Plugin 1
      wind            = try(EEPGetWindIntensity) or nil,   -- Verfuegbar ab EEP 16.1 - Plugin 1
      rain            = try(EEPGetRainIntensity) or nil,   -- Verfuegbar ab EEP 16.1 - Plugin 1
      snow            = try(EEPGetSnowIntensity) or nil,   -- Verfuegbar ab EEP 16.1 - Plugin 1
      hail            = try(EEPGetHailIntensity) or nil,   -- Verfuegbar ab EEP 16.1 - Plugin 1
      fog             = try(EEPGetFogIntensity) or nil,    -- Verfuegbar ab EEP 16.1 - Plugin 1
    },
  }
  
  local ok, x, y, z = try(EEPGetCameraPosition)            -- Verfuegbar ab EEP 16.1 - Plugin 1 
  if ok then g.cameraPosition = { x = x, y = y, z = z } end
  
  local ok2, rx, ry, rz = try(EEPGetCameraRotation)        -- Verfuegbar ab EEP 16.1 - Plugin 1
  if ok2 then g.cameraRotation = { x = rx, y = ry, z = rz } end
  
  local activeTrain = try(EEPGetTrainActive)               -- Verfuegbar ab EEP 15 - Plugin 1
  if activeTrain and activeTrain ~= "" then 
    g.activeTrain = activeTrain
    if config.autoTrains then addAuto("trains", activeTrain) end  
  end

  local activeRollingstock = try(EEPRollingstockGetActive) -- Verfuegbar ab EEP 15 - Plugin 1
  if activeRollingstock and activeRollingstock ~= "" then g.activeRollingstock = activeRollingstock  end
  
  return g
end

--- Signale
local function collectSignal(id)
  local s = { state = try(EEPGetSignal, id) or nil }
  
  local okC, count = try(EEPGetSignalFunctions, id)
  if okC then s.functionCount = count end
  
  local n = try(EEPGetSignalTrainsCount, id)
  if n then
    s.trainsCount = n
    local names = {}
    for i = 1, n do
      local name = try(EEPGetSignalTrainName, id, i)
      if name then names[#names + 1] = name end
    end
    s.trains = names
  end
  
  local okD, dist = try(EEPGetSignalStopDistance, id)
  if okD then s.stopDistance = dist end
  
  local okT, tag = try(EEPSignalGetTagText, id)
  if okT and tag ~= "" then s.tag = tag end
  
  return s
end

-- Weichen
local function collectSwitch(id)
  local s = { state = try(EEPGetSwitch, id) or nil }
  
  local okT, tag = try(EEPSwitchGetTagText, id)
  if okT and tag and tag ~= "" then s.tag = tag end
  
  return s
end

-- Depots
local function collectDepot(id)
  local count = try(EEPGetTrainyardItemsCount, id)
  if not count then return { exists = false } end
  local d = { exists = true, itemCount = count, items = {} }
  
  for slot = 1, count do
    local name = try(EEPGetTrainyardItemName, id, slot)
    if name and name ~= "" then
      d.items[#d.items + 1] = {
        slot   = slot,
        name   = name,
        status = try(EEPGetTrainyardItemStatus, id, name, 0) or nil, -- 0 = in Fahrt, 1 = im Depot wartend
      }
    end
  end
  
  return d
end
  
-- Fahrwege
local function collectTrack(isReservedFn, id)
  local ok, occupied = try(isReservedFn, id)
  if not ok then return { exists = false } end
  local t = { occupied = occupied and true or false }
  
  if occupied then
    local ok1, _, name = try(isReservedFn, id, true)
    if ok1 and name and name ~= "" then t.frontTrain = name end
  end
  
  return t
end

-- Züge
local function collectTrain(name)
  local okS, speed = try(EEPGetTrainSpeed, name)
  if not okS then
    -- Zug existiert evtl. nur im Depot
    local okY, depot = try(EEPIsTrainInTrainyard, name)
    if okY then return { exists = true, trainyard = depot } end
    return { exists = false }
  end
  local t = { exists = true, speed = speed }
  
  local okT, target = try(EEPGetTrainSpeed, name, true)
  if okT then t.targetSpeed = target end
  
  local okR, route = try(EEPGetTrainRoute, name)
  if okR then t.route = route end
  
  local okL, len = try(EEPGetTrainLength, name)
  if okL then t.length = len end
  
  local okLi, light = try(EEPGetTrainLight, name) -- verfügbar ab EEP 18.0
  if okLi then t.light = light end
  
  local okCf, cf = try(EEPGetTrainCouplingFront, name) -- verfügbar ab EEP 18.0
  if okCf then t.couplingFront = cf end
  
  local okCr, cr = try(EEPGetTrainCouplingRear, name) -- verfügbar ab EEP 18.0
  if okCr then t.couplingRear = cr end
  
  local okY, depot = try(EEPIsTrainInTrainyard, name)
  if okY then t.trainyard = depot end
  
  local count = try(EEPGetRollingstockItemsCount, name)
  if count then
    t.vehicleCount = count
    local vehicles = {}
    for i = 0, count - 1 do
      local vname = try(EEPGetRollingstockItemName, name, i)
      if vname and vname ~= "" then vehicles[#vehicles + 1] = vname end
    end
    t.vehicles = vehicles
    
    -- Position des Zuges = Position des ersten Fahrzeugs
    if vehicles[1] then
      local okP, x, y, z = try(EEPRollingstockGetPosition, vehicles[1])
      if okP then t.position = { x = x, y = y, z = z } end
      
      local okTr, trackId, pos, dir, system = try(EEPRollingstockGetTrack, vehicles[1])
      if okTr then t.track = { id = trackId, position = pos, direction = dir, system = system } end
    end
  end
  
  return t
end

-- Rollmaterialien
local function collectRollingstock(name)
  local ok, trainName = try(EEPRollingstockGetTrainName, name)
  if not ok then return { exists = false } end
  local r = { exists = true, train = trainName }
  
  local okP, x, y, z = try(EEPRollingstockGetPosition, name)
  if okP then r.position = { x = x, y = y, z = z } end
  
  local okR, rx, ry, rz = try(EEPRollingstockGetRotation, name) -- verfügbar ab EEP 18.1 Plugin 1
  if okR then r.rotation = { x = rx, y = ry, z = rz } end
  
  -- Abstand (in Meter) zum Anfang des Gleisstücks, auf dem sich das Fahrzeug befindet.
  -- Ausrichtung relativ zur Fahrtrichtung des Gleisstücks, auf dem sich das Fahrzeug befindet:
  --   1 = in Fahrtrichtung,
  --   0 = entgegen der Fahrtrichtung.
  -- Systemnummer des Gleises, auf dem das Fahrzeug unterwegs ist:
  --   1 = Bahngleise,
  --   2 = Straße,
  --   3 = Straßenbahngleise,
  --   4 = sonstige Splines / Wasserwege
  local okT, trackId, pos, dir, system = try(EEPRollingstockGetTrack, name)
  if okT then r.track = { id = trackId, position = pos, direction = dir, system = system } end
  
  -- Länge des Fahrzeugs von Kupplung zu Kupplung in Meter
  local okL, len = try(EEPRollingstockGetLength, name)
  if okL then r.length = len end
  
  -- Anzahl der Getriebegänge, die das Fahrzeug besitzt. Nicht motorisierte Fahrzeuge haben 0 Gänge.
  local okM, gears = try(EEPRollingstockGetMotor, name)
  if okM then r.gears = gears end
  
  -- ModelType DE / EN
  -- 1 = Tenderlok / tank locomotive
  -- 2 = Schlepptenderlok / tender locomotive
  -- 3 = Tender / tender
  -- 4 = Elektrolok / electric locomotive
  -- 5 = Diesellok / diesel locomotive
  -- 6 = Triebwagen / railcar
  -- 7 = U- oder S-Bahn / communter train
  -- 8 = Straßenbahn / tram
  -- 9 = Güterwaggon / freight waggons
  -- 10 = Personenwaggon / person transport
  -- 11 = Luftfahrzeug / aero vehicles
  -- 12 = Maschine (z.B. Kran) / machines (e.g. cranes)
  -- 13 = Wasserfahrzeug / ships
  -- 14 = LKW / trucks
  -- 15 = PKW / cars
  local okY, mtype = try(EEPRollingstockGetModelType, name)
  if okY then r.modelType = mtype end
  
  -- zurückgelegte Strecke des Rollmaterials seit dem Einsetzen in EEP
  local okKm, mileage = try(EEPRollingstockGetMileage, name)
  if okKm then r.mileage = mileage end
  
  -- true, wenn wenn das angegebene Fahrzeug vorwärts ausgerichtet ist, sonst false
  local okO, forward = try(EEPRollingstockGetOrientation, name)
  if okO then r.forward = forward end
  
  -- Stellung der Kupplung
  -- 1 = Kupplung scharf / active
  -- 2 = Abstoßen / inactive
  -- 3 = Gekuppelt / coupled
  local okF, cf = try(EEPRollingstockGetCouplingFront, name)
  if okF then r.couplingFront = cf end
  
  local okB, cr = try(EEPRollingstockGetCouplingRear, name)
  if okB then r.couplingRear = cr end
  
  -- true, wenn der Rauch an-, oder false, wenn der Rauch ausgeschaltet ist
  local okS, smoke = try(EEPRollingstockGetSmoke, name)
  if okS then r.smoke = smoke end
  
  -- Status des Hakens
  -- 0 = ausgeschaltet,
  -- 1 = eingeschaltet
  -- 3 = Ladegut am Haken
  local okH, hook = try(EEPRollingstockGetHook, name)
  if okH then r.hook = hook end
  
  local okTag, tag = try(EEPRollingstockGetTagText, name)
  if okTag and tag ~= "" then r.tag = tag end
  
  return r
end

-- Immobilien
local function collectStructure(name)
  local okP, x, y, z = try(EEPStructureGetPosition, name)
  if not okP then return { exists = false } end
  local s = { exists = true, position = { x = x, y = y, z = z } }
  
  local okR, rx, ry, rz = try(EEPStructureGetRotation, name)
  if okR then s.rotation = { x = rx, y = ry, z = rz } end
  
  local okY, mtype = try(EEPStructureGetModelType, name)
  if okY then s.modelType = mtype end
  
  local okS, smoke = try(EEPStructureGetSmoke, name)
  if okS then s.smoke = smoke end
  
  local okL, light = try(EEPStructureGetLight, name)
  if okL then s.light = light end
  
  local okF, fire = try(EEPStructureGetFire, name)
  if okF then s.fire = fire end
  
  local okT, tag = try(EEPStructureGetTagText, name)
  if okT and tag ~= "" then s.tag = tag end
  
  return s
end

-- Güter
local function collectGoods(name)
  local okP, x, y, z = try(EEPGoodsGetPosition, name)
  if not okP then return { exists = false } end
  local g = { exists = true, position = { x = x, y = y, z = z } }
  
  local okR, rx, ry, rz = try(EEPGoodsGetRotation, name)
  if okR then g.rotation = { x = rx, y = ry, z = rz } end
  
  local okY, mtype = try(EEPGoodsGetModelType, name)
  if okY then g.modelType = mtype end
  
  local okT, tag = try(EEPGoodsGetTagText, name) -- Ab EEP 18.0
  if okT and tag ~= "" then g.tag = tag end
  
  return g
end

-- Wetterzonen
local function collectZone(id)
  local okP, x, y, z, radius = try(EEPGetZonePos, id)
  if not okP then return { exists = false } end
  local zone = { exists = true, position = { x = x, y = y, z = z }, radius = radius }
  
  local _, wind   = try(EEPGetZoneWindIntensity, id)
  local _, rain   = try(EEPGetZoneRainIntensity, id)
  local _, snow   = try(EEPGetZoneSnowIntensity, id)
  local _, hail   = try(EEPGetZoneHailIntensity, id)
  local _, fog    = try(EEPGetZoneFogIntensity, id)
  local _, clouds = try(EEPGetZoneClouds, id)
  zone.wind, zone.rain, zone.snow, zone.hail, zone.fog, zone.clouds =
    wind or nil, rain or nil, snow or nil, hail or nil, fog or nil, clouds or nil
    
  return zone
end

--- Erzeugt aus einer Liste einen nach Schluessel (als String) indizierten Objekt-Eintrag.
local function collectMap(list, fn)
  local out = {}
  for _, key in ipairs(list) do
    out[tostring(key)] = fn(key)
  end
  return out
end

-- ---------------------------------------------------------------------------------------------
-- Oeffentliche API
-- ---------------------------------------------------------------------------------------------

--- Setzt Konfigurationswerte. Beispiel: EepExport.configure({ interval = 10, pretty = true })
function M.configure(options)
  for k, v in pairs(options or {}) do config[k] = v end
end

--- Sammelt alle Zustandsdaten und gibt sie als Tabelle zurueck.
function M.collect()
  --if config.debug then print("EepExport.collect()") end
  
  M.resolve()               -- Ermittelt den Status der registrierten Objekte
  scanForTrains()           -- Suche nach neuen Zuegen
  pruneAuto("trains")       -- Entferne Zuege, die es nicht mehr gibt
  pruneAuto("rollingstock") -- Entferne Rollmaterialien, die es nicht mehr gibt  
  
  local data = {}
  data.meta = { exportedAtEepTime = EEPTime } -- oder string.format("%02d:%02d:%02d", EEPTimeH, EEPTimeM, EEPTimeS)}
  if config.global then data.global = collectGlobal() end
  data.signals      = collectMap(registry.signals, collectSignal)
  data.switches     = collectMap(registry.switches, collectSwitch)
  data.trainyards   = collectMap(registry.depots, collectDepot)
  data.structures   = collectMap(registry.structures, collectStructure)
  data.goods        = collectMap(registry.goods, collectGoods)
  data.weatherZones = collectMap(registry.zones, collectZone)
  data.tracks = {
    rail      = collectMap(registry.railTracks,    function(id) return collectTrack(EEPIsRailTrackReserved, id) end),
    road      = collectMap(registry.roadTracks,    function(id) return collectTrack(EEPIsRoadTrackReserved, id) end),
    tram      = collectMap(registry.tramTracks,    function(id) return collectTrack(EEPIsTramTrackReserved, id) end),
    auxiliary = collectMap(registry.auxTracks,     function(id) return collectTrack(EEPIsAuxiliaryTrackReserved, id) end),
    control   = collectMap(registry.controlTracks, function(id) return collectTrack(EEPIsControlTrackReserved, id) end),
  }
  data.trains       = collectMap(registry.trains, collectTrain)
  data.rollingstock = collectMap(registry.rollingstock, collectRollingstock)
  return data
end

--- Ermittelt den Ausgabepfad.
local function outputPath()
  if config.outputFile then return config.outputFile end
  
  local base = try(EEPGetAnlPath)
  if (not base or base == "") and savedPath then
    base = savedPath:match("^(.*)[/\\\\][^/\\\\]*$")   -- Ordner aus dem in EEPOnSaveAnl gemerkten Pfad
  end
  if base and base ~= "" then return base .. "\\eep_export.json" end
  return "eep_export.json"
end

--- Sammelt die Daten und schreibt sie als JSON-Datei. Gibt true, Pfad oder false, Fehlermeldung zurueck.
function M.export()
  if M.isExportPaused() then
    return false, "Export pausiert (Anlage wird gespeichert)"
  end

  -- Setzt M.lastError und liefert false, Fehlermeldung
  local function fail(message, path)
    M.lastError = message
    if config.debug then
      print(string.format(
        "EepExport.export um %02d:%02d:%02d%s, %s",
        EEPTimeH, EEPTimeM, EEPTimeS,
        path and (", file " .. path) or "",
        message
      ))
    end
    return false, message
  end

  local s0 = os.clock()

  -- Aktuelle Daten sammeln
  local okCollect, data = pcall(M.collect)
  if not okCollect then
    return fail("EepExport.export: Daten sammeln fehlgeschlagen: " .. tostring(data))
  end

  local s1 = os.clock()

  -- Umwandlung der Daten in JSON
  local okJson, json = pcall(M.toJson, data, config.pretty)
  if not okJson then
    return fail("EepExport.export: JSON-Erzeugung fehlgeschlagen: " .. tostring(json))
  end

  local s2 = os.clock()

  -- Datei schreiben
  local path = outputPath()
  local file, err, errnum = io.open(path, "w") -- w write, a append
  if not file then
    return fail("EepExport.export: Datei nicht schreibbar: " .. tostring(err) .. " " .. tostring(errnum), path)
  end
  local okWrite, writeErr = file:write(json)
  file:close()
  if not okWrite then
    return fail("EepExport.export: Schreiben fehlgeschlagen: " .. tostring(writeErr), path)
  end

  local s3 = os.clock()

  if config.debug then
    print(string.format(
      "EepExport.export um %02d:%02d:%02d, file %s, collect %.1f ms, json %.1f ms length %d, write %.1f ms",
      EEPTimeH, EEPTimeM, EEPTimeS,
      path,
      (s1 - s0) * 1000,        -- collect
      (s2 - s1) * 1000, #json, -- json
      (s3 - s2) * 1000         -- write
    ))
  end

  M.lastError = nil
  lastExport = EEPTime
  return true, path
end

--- In EEPMain() aufrufen. Exportiert automatisch im eingestellten Intervall (EEP-Zeit).
function M.run()
  local okPrepare, prepareErr = pcall(function()
    autoInit()
    M.resolve()

    if lastScan == nil or EEPTime < lastScan or EEPTime - lastScan >= (config.scanInterval or 2) then
      lastScan = EEPTime
      scanForTrains()
    end
  end)
  if not okPrepare then
    M.lastError = "EepExport.run: Suche nach Objekten fehlgeschlagen: " .. tostring(prepareErr)
    if config.debug then print(M.lastError) end
  end
  
  if not config.interval or config.interval <= 0 then return end
  
  if M.isExportPaused() then return end
  
  if lastExport == nil or EEPTime < lastExport or EEPTime - lastExport >= config.interval then
    local ok, msg = M.export()
    if not ok then
      lastExport = EEPTime  -- Fehlermeldung nicht mit jedem Zyklus wiederholen
      print("EepExport: ", msg)
    end
  end
end


return M
