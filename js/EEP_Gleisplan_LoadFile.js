// Load and process file
"use strict";
/* global
	EEP_Texts:readonly,
	EEP_Zip:readonly,
	createSVG:readonly,
	SvgPanZoom:readonly,
	changefontSize:readonly,
	loadColors:readonly
*/
/* Interface
required standard objects:
	DOMParser
	Event
	FileReader
	Promise
	console 
	document
	localStorage
	requestAnimationFrame
	window
required global data:
	EEP_Texts (js/EEP_Texts.js)
	EEP_Zip (js/EEP_Zip.js)
required functions:
	createSVG (js/EEP_Gleisplan_DOM2SVG.js)
	SvgPanZoom (js/EEP_Gleisplan_DOM2SVG.js)
	changefontSize (js/EEP_Gleisplan_MainScreen.js)
	loadColors (js/EEP_ToolWindow_ColorPicker.js)
required DOM elements:
	fileselector, urlinput, urlStatus, btnUrl, loading, progress, main,
	filename, svgTitle, strokeWidth, fontSize, svg
global data which is defined here:
	global
	global.timestamp
	global.sutrackp
	global.SvgPanZoom
*/
(function(api) {
// public functions
api.loadFile = loadFile;
api.loadUrl = loadUrl;
// public data
const global = {}; // Collection of all global data shared between the modules
api.global = global;

// Liefert den Adressraum für Private Network Access, oder null für öffentliche Hosts
function targetSpace(url) {
	try { 
		const h = new URL(url, document.baseURI).hostname.toLowerCase(); 

		// Lokale Adressen (Localhost)
		if (h === "localhost" || h === "[::1]" || /^127\./.test(h)) { 
			return "local"; 
		}

		// Private Adressen (IPv4, .local-Domains und IPv6-Privatbereiche)
    	const isPrivateIpv4OrDomain = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.endsWith(".local");
    	const isPrivateIpv6 = /^\[(fe[89ab]|f[cd])[0-9a-f:]+\]$/.test(h);
    	if (isPrivateIpv4OrDomain || isPrivateIpv6) {
      		return "private";
    	}
	} catch (e) { return null; }
	return null;	// öffentlich: Option weglassen
}
// Anlage-Datei einmalig von einer URL laden (relativ oder absolut) und wie eine ausgewählte Datei verarbeiten
function loadUrl(url) {
	url = (url || "").trim();
	const status = document.getElementById("urlStatus");
	if (!url) { status.textContent = "URL?"; return; }
	try { localStorage.setItem("anl3Url", url); } catch (e) {}
	EEP_Zip.setStatus("...", false); // Status zurücksetzen
	const opts = { cache: "no-store", method: "GET" };
	const space = targetSpace(url);
	if (space) { opts.targetAddressSpace = space; }
	fetch(url, opts)
		.then(function(r) {
			if (!r.ok) { throw new Error("HTTP " + r.status); }
			return r.blob();
		})
		.then(function(blob) {
			let name = "";
			try { name = decodeURIComponent(new URL(url, document.baseURI).pathname.split("/").pop()); } catch (e) {}
			if (!name) { name = "anlage.anl3"; }
			EEP_Zip.setStatus("...", false); // Status zurücksetzen
			loadFile(new File([blob], name));
		})
		.catch(function(err) {
			EEP_Zip.setStatus(EEP_Zip.describeError(err, url), true);	// z.B. CORS, file:// oder falsche URL
		});
}

(function initUrlInput() {
	const input = document.getElementById("urlinput");
	let last = "";
	try { last = localStorage.getItem("anl3Url") || ""; } catch (e) {}
	input.value = last;
	document.getElementById("btnUrl").addEventListener("click", function() { loadUrl(input.value); });
	input.addEventListener("keydown", function(ev) { if (ev.key === "Enter") { loadUrl(input.value); } });
	// Aufruf mit ?url=... lädt die Datei automatisch
	const param = new URLSearchParams(window.location.search).get("url");
	if (param) { input.value = param; loadUrl(param); }
})();

// Datei laden und dabei ZIP-Dateien entpacken, falls nötig. Danach wird die Datei wie eine ausgewählte Datei verarbeitet.
function loadFile(file) {
	if (file && window.EEP_Zip) {
		EEP_Zip.resolve(file).then(loadFileInner).catch(function(err) {
			EEP_Zip.setStatus(EEP_Zip.describeError(err, ""), true);
			console.log(err);
		});
	} else {
		loadFileInner(file);
	}
}

// Datei laden und verarbeiten
function loadFileInner(file) {
	let fr;	// upvalue for function processFile
	if (typeof window.FileReader !== "function") {
		bodyAppend("p", EEP_Texts.getText("err", "001")); // The file API isn't supported on this browser yet.
		return;
	}

	if (!file) {
		bodyAppend("p", EEP_Texts.getText("err", "002")); // Please select a file before clicking 'Load'
		return;
	} else {
		global.timestamp = {};
		global.timestamp.start = Date.now();

		fr = { FileReader: new FileReader() }; // strict mode does not allow to unset read-only property 'result' directly, therfore we have to put the FileReader into an object
		fr.FileReader.onload = processFile;
		fr.FileReader.readAsText(file);
	}

	// process file (local function to get access to local variable fr)
	function processFile() {
		global.timestamp.fileLoaded = Date.now();
		console.log('load file:' + (global.timestamp.fileLoaded - global.timestamp.start) / 1000 + 'sec');

		updateUi(function() {
			// Hide file selector
			document.getElementById("fileselector").classList.add("hidden");

			// Show loading
			document.getElementById("loading").classList.remove("hidden");
		}).then(function() {
			// Create parser
			const parser = new DOMParser();
			// Parse xml into DOM
			const xmlDoc = parser.parseFromString(fr.FileReader.result, "text/xml");
			//fr.FileReader.result = null; 	// we do not need the file content anymore, but in strict mode we cannot unset the property directly
			delete fr.FileReader;			// however, we can remove the whole thing (see http://perfectionkills.com/understanding-delete/ )

			// Prüfung auf gültiges XML: Suche im Ergebnis nach einem <parsererror>-Element bzw. nach dem ersten Element sutrackp.
			const errorNode = xmlDoc.querySelector("parsererror");
			if (errorNode) {
				console.error("Parsing-Fehler:", errorNode.textContent);
				return;
			}
			const rootElement = xmlDoc.documentElement;
			if (rootElement.nodeName !== "sutrackp") {
        console.error(`Fehler: Ungültiges Root-Element! Erwartet wird 'sutrackp', gefunden wurde '${rootElement.nodeName}'.`);
				return;
			}

			global.timestamp.fileParsed = Date.now();
			console.log('parse file:' + (global.timestamp.fileParsed - global.timestamp.fileLoaded) / 1000 + 'sec');

			return xmlDoc;
			
		}).then(function(xmlDoc) {
			let progress = document.getElementById("progress");

			// Process root node (documentElement always represents the root node)
			const sutrackp = xmlDoc.documentElement;
			global.sutrackp = sutrackp;
			return createSVG(sutrackp, initProgress, incrementProgress);

			function initProgress(progressMax) {
				return updateUi(function() {
					progress.max = progressMax;
					progress.value = 0;
					progress.classList.remove("hidden");
				});
			}
			function incrementProgress() {
				return updateUi(function() {
					progress.value++;
				});
			}
		}).then(function() {
			// Hide loading
			document.getElementById("loading").classList.add("hidden");

			// Show main area
			document.getElementById("main").classList.remove("hidden");

			// Show file name
			//const filename = file.name.substring(0, file.name.length -1 -1 -3); // remove last 5 characters (".anl3") from file name
			const filename = file.name.replace(/\.anl3$/i, ""); // Claude AI: remove last 5 characters (".anl3") from file name, case insensitive
			document.getElementById("filename").textContent = filename;
			document.getElementById("svgTitle").textContent = filename;

			// Read settings from localStorage
			const strokeWidth = localStorage.getItem("strokeWidth") || document.getElementById("strokeWidth").value;
			document.getElementById("strokeWidth").value = strokeWidth;
			const fontSize = localStorage.getItem("fontSize") || document.getElementById("fontSize").value;
			document.getElementById("fontSize").value = fontSize;
			// Checkboxes require spectial treatment
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key.indexOf("checkbox_") === 0) { // Read checkbox settings
					const checkbox = document.querySelector(`input[type="checkbox"][name="${key.substring(9)}"]`);
					if (checkbox) {
						const value = localStorage.getItem(key) === "true";
						if (checkbox.checked !== value) {
							checkbox.checked = value;
							checkbox.dispatchEvent(new Event("change"));
						}
					}
				} else {
				}
			}

			loadColors();

			// Claude AI: Explizites viewBox setzen, bevor svg-pan-zoom initialisiert wird.
			// Ohne viewBox-Attribut ermittelt svg-pan-zoom (fit:true/center:true, Default) seine
			// initiale Größe per getBBox() der *sichtbaren* Elemente. Sind zum Ladezeitpunkt alle
			// Elemente ausgeblendet, weil die zugehörigen Checkboxen (aus localStorage) deaktiviert
			// sind, liefert getBBox() 0x0 -> realZoom wird Infinity -> Pan/Zoom bricht ab.
			// global.usedArea ist unabhängig von der Sichtbarkeit (basiert auf den Gleis-Positionen),
			// daher wird es hier als verlässliche Grundlage für das initiale viewBox verwendet.
			{
				const border = 20; // Fallback-Rand, analog zum Rand bei der Berechnung von global.usedArea
				let vbWidth  = global.usedArea.max.x - global.usedArea.min.x;
				let vbHeight = global.usedArea.max.y - global.usedArea.min.y;
				let vbMinX   = global.usedArea.min.x;
				let vbMinY   = - global.usedArea.max.y;	// svg: gespiegelte y-Koordinate

				if (!(vbWidth > 0)) {	// keine (sichtbaren) Gleise oder entartete Anlage
					vbMinX  -= border;
					vbWidth  = 2 * border;
				}
				if (!(vbHeight > 0)) {
					vbMinY  -= border;
					vbHeight = 2 * border;
				}
				document.getElementById("svg").setAttribute(
					"viewBox",
					`${vbMinX} ${vbMinY} ${vbWidth} ${vbHeight}`
				);
			}

			// Activate Pan and Zoom
			global.SvgPanZoom = SvgPanZoom();
			changefontSize(fontSize);
			return;

		}, function(err) {
			// `</pre>` confuses syntax detection within Notepad++, therefore I've to use "</pre>"
			document.getElementById("loading").innerHTML =
				EEP_Texts.getText("err", "003") // Fehler beim Lesen der Datei
				+ `:<br>${err.name}: "${err.message}"`
				+ " " + EEP_Texts.getText("err", "003a") + " " // in line
				+ `${err.lineNumber}<br><pre>${err.stack}` + "</pre>";
			console.log(err);
		});
	}

	// helper method which waits some time to let the browser update the ui
	function updateUi(fn) {
		return new Promise(function(resolve) {
			requestAnimationFrame(function() {
				const result = fn();
				requestAnimationFrame(function() {
					resolve(result);
				});
			});
		});
	}

	function bodyAppend(tagName, innerHTML) {
		var elm = document.createElement(tagName);
		elm.textContent = innerHTML;
		document.body.appendChild(elm);
	}
}	// loadFile
})(this); // end module
