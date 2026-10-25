--- Modul CommandExecution
--- Ausführung von Befehlen aus einer Textdatei 
--- Das Programm ist inspiriert von der Controll Extension von Andreas Kreuz
--- Es werden alle EEP..Set-Funktionen, plus einige andere EEP-Funktionen und die explizit registrierten Funktionen akzeptiert.
--- Format der Befehle: eine Zeile je Befehl, "Funktionsname|arg1|arg2|..." oder Lua-Syntax Funktionsname(arg1,arg2,...)
--[[ Interface:
setDebug(value)
setFileName(name)
registerCommand(name, function)
executeCommands(text)
run()
--]]

--- Modul CommandExecution
local CommandExecution = {}

local debug = true
local prefix = "[#CommandExecution] "

---@param value any Neuer Status für die debug-Print-Ausgaben
function CommandExecution.setDebug(value)
  debug = not not value
end

--- Registrierte Befehle (Name -> Funktion), z.B. "print", "clearlog"
local registeredCommands = {
  print = print,
  clearlog = clearlog,
}

--- EEP-Funktionen, die zusaetzlich zu allen "EEP...Set..."-Funktionen erlaubt sind
local extraEepCommands = {
  -- EEPPause(Status) 
  -- Status: 0 Start 1 Stopp EEP keep Lua 2 Stop EEP and Lua (restart with key P only)
  EEPPause = true,
  
  -- EEPActivateCtrlDesk('name')
  EEPActivateCtrlDesk = true, 
  
  -- EEPShowInfoTextTop(red,green,blue,size,duration,orientation,'Text')
  -- red,green,blue: Farbintensität 0.0 bis 1.0
  -- size: Schriftgröße 0.5 halbe Größe 1.0 normal, 2.0 doppelt
  -- duration: Anzeigezeit in Sekunden, minimum 5 Sekunden
  -- orientation: Ausrichtung 0 Block, 1 zentriert 2 links 3 rechts
  -- Text: Zeilenumbruch mit \n
  EEPShowInfoTextTop = true,
  EEPShowInfoTextBottom = true,

  -- EEPShowScrollInfoTextTop(red,green,blue,size,duration,orientation,velocity,'Text')
  -- red,green,blue: Farbintensität 0.0 bis 1.0
  -- size: Schriftgröße 0.5 halbe Größe 1.0 normal, 2.0 doppelt
  -- duration: Anzeigezeit in Sekunden, minimum 5 Sekunden
  -- orientation: dummy use 0
  -- velocity: 0.1 slow 
  -- Text: Zeilenumbruch mit \n
  EEPShowScrollInfoTextTop = true,
  EEPShowScrollInfoTextBottom = true,
  
  -- no parameter
  EEPHideInfoTextTop = true,
  EEPHideInfoTextBottom = true,
}

local fileName = "exchange\\commands-to-eep.txt"

---@param name string Verzeichnis mit der Kommando-Datei
function CommandExecution.setDirectoryName(name)
  assert(type(name) == "string", prefix.."setDirectoryName: Need 'name' as string")
  directoryName = name
end

---@param name string Name der Kommando-Datei
function CommandExecution.setFileName(name)
  assert(type(name) == "string", prefix.."setFileName: Need 'name' as string")
  fileName = name
end

---@param name string Name des Befehls, wie ihn der Web-Server schickt
---@param f function
function CommandExecution.registerCommand(name, f)
  assert(type(name) == "string", prefix.."registerCommand: Need 'name' as string")
  assert(type(f) == "function", prefix.."registerCommand: "..name.." is not a function")
  registeredCommands[name] = f
end

--- Sucht die Funktion zu einem erlaubten Befehl. EEP-Funktionen werden erst beim Aufruf aus _G geholt.
local function findCommand(name)
  if registeredCommands[name] then return registeredCommands[name] end
  if extraEepCommands[name] or name:find("^EEP.*Set") then
    local f = _G[name]
    if type(f) == "function" then return f end
  end
  return nil
end

--- Die Parameter werden alle als String an die Funktion übergeben. Außnahme: Booleans
local function toValue(text)
  if text == "true" then return true end
  if text == "false" then return false end
  local value = tonumber(text)
  if value then return value end
  return text
end

--- Fuehrt alle vollstaendigen Zeilen aus dem Text aus.
--- Aufruf in EEPMain
---@param text string
function CommandExecution.executeCommands(text)
  for line in text:gmatch("[^\n]+") do
    line = line:gsub("\r$", "")
    if line == "" then break end
    
    if debug then print(prefix.."Command: "..line) end
    
    -- Parameter lesen
    local fields = parseLine(line)

    -- Funktion ausführen
    local functionName = table.remove(fields, 1)
    if functionName ~= "" then
      local f = findCommand(functionName)
      if not f then
        print(prefix..string.format("Command '%s' is not allowed", functionName))
      else
        --for i, value in ipairs(fields) do fields[i] = toValue(value) end -- already done
        local ok, err = pcall(f, table.unpack(fields))
        if not ok then print(prefix.."Error: "..err) end
      end
    end
  end
end

function parseLine(line)
  local tokens = {}
  -- Einfache Variante nur mit Trennzeichen | wie in der Control Extension
  --for token in (line .. "|"):gmatch("([^|]*)|") do tokens[#tokens + 1] = token end
  --return tokens

  -- Komplexte Variante mit den Trennzeichen |(), und mit in " oder ' eingeschlossenen Texten
  -- Damit wird auch die normale Lua-Syntax akzeptiert: funktion(parameter1,, "text mit | pipe und , komma", )
  local i = 1
  local current_token = ""

  -- Funktion zum Säubern von Leerzeichen
  local function trim(s)
      return s:match("^%s*(.-)%s*$")
  end

  while i <= #line do
      local char = line:sub(i, i)
      
      -- Erkennt sowohl " als auch ' als Text-Start
      if char == '"' or char == "'" then
          local quote_char = char -- Speichert, welcher Typ geöffnet wurde
          
          -- Sucht das exakt passende schließende Anführungszeichen
          local end_quote = line:find(quote_char, i + 1, true) -- true deaktiviert Pattern-Matching für exakte Suche
          if end_quote then
              -- Fügt nur den Inhalt zwischen den Anführungszeichen hinzu
              current_token = current_token .. line:sub(i + 1, end_quote - 1)
              i = end_quote + 1
          else
              current_token = current_token .. char
              i = i + 1
          end
      elseif char:match('[%(%),%|]') then
          -- Trennzeichen gefunden: Token speichern
          tokens[#tokens + 1] = toValue(trim(current_token))
          current_token = ""
          i = i + 1
      else
          current_token = current_token .. char
          i = i + 1
      end
  end

  -- Das letzte Token hinzufügen, falls noch Text übrig ist
  local last_token = trim(current_token)
  if #last_token > 0 then
      tokens[#tokens + 1] = toValue(last_token)
  else
    -- Falls der String mit einem Trennzeichen endete, aber davor noch Text stand, 
    -- wird ein leeres Token nur hinzugefügt, wenn es nicht das allerletzte Token ist.
    -- Da ein letztes leeres Token explizit weglassen werden soll, entfällt der "else"-Zweig hier.
  end

  -- Wenn das allerletzte Element in der Tabelle leer ist (weil die Zeile mit einem Trennzeichen endete),
  -- löschen wir es aus der Tabelle.
  if #tokens > 0 and tokens[#tokens] == "" then
      table.remove(tokens)
  end

  -- Ausgabe zur Kontrolle
  if false and debug then
    for idx, t in ipairs(tokens) do
        print(string.format("Token %d: %q", idx, t))
    end
  end
  
  return tokens
end

local commandFileName
local consumedBytes = 0

--- Liest neue Zeilen aus der Datei und fuehrt sie aus. Unvollstaendige letzte Zeilen bleiben liegen.
function CommandExecution.run()
  -- Reset bei neuer Datei
  if fileName ~= commandFileName then
    commandFileName = fileName
    consumedBytes = 0
    local newfile = io.open(commandFileName, "w") -- Datei anlegen bzw. leeren
    if newfile then newfile:close() end
    if debug then print(prefix.."New command file: "..commandFileName) end
  end

  -- Datei komplett lesen
  local file = io.open(commandFileName, "r")
  if not file then return end
  local content = file:read("*all") or ""
  file:close()

  -- Reset Position wenn die Datei kürzer ist als zuvor
  if #content < consumedBytes then 
    consumedBytes = 0 
    if debug then print(prefix.."Resetted command file: "..commandFileName) end
  end

  -- Suche den letzten Zeilenwechsel
  local lastNewline = content:match(".*()\n")
  if not lastNewline or lastNewline <= consumedBytes then return end

  -- Verarbeite alle neuen Befehle
  local newCommands = content:sub(consumedBytes + 1, lastNewline)
  consumedBytes = lastNewline
  CommandExecution.executeCommands(newCommands)
end

--if debug then 
  print(prefix.."Module loaded") 
--end

return CommandExecution