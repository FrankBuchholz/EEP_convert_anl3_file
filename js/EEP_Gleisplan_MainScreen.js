// Main screen
"use strict";
/* global
	EEP_Texts:readonly,
	global:readonly,
	scheduleLabelLayout:readonly
*/
/* Interface
required standard objects:
	Event
	MutationObserver
	console
	document
	localStorage
	window
required global data:
	EEP_Texts
	global (global.fontSize wird hier gesetzt)
required functions:
	scheduleLabelLayout (js/EEP_Gleisplan_LabelLayout.js)
public api:
	changeHeightRange
	changeStrokeWidth
	changefontSize
	msg
	toggleElements
	toggleMarker
	setHeadingCollapsed
	showRoutes
*/
(function(api) {
// public api
api.changeHeightRange = changeHeightRange;
api.changeStrokeWidth = changeStrokeWidth;
api.changefontSize = changefontSize;
api.msg = msg;
api.toggleElements = toggleElements;
api.toggleMarker = toggleMarker;
api.showRoutes = showRoutes;
api.setHeadingCollapsed = setHeadingCollapsed;

// Toggle visibility of elements
function toggleElements(selector, visible) {
	msg();

	// Instead of modifying all elements we could modify CSS rules as well, but it seems that this does not improve performance very much
	for (const ele of document.getElementById("svg").querySelectorAll(selector)) {
		if (visible) {
			ele.classList.remove("hidden");
		} else {
			ele.classList.add("hidden");
		}
	}

	// Ausgeblendete Texte stören nicht, eingeblendete schon
	scheduleLabelLayout();
}

// Toggle visibility of marker
function toggleMarker(visible) {
	msg();
	// Modify svg css (nice, but only works in the browser, not during PNG export)
	/*
	const cssVariables = document.getElementById("css-marker-colors").sheet.rules[0].style;
	["Eisenbahn", "Strassenbahn", "Strasse", "Wasserwege", "Steuerstrecken", "GBS"].forEach(function(name) {
		if (visible) {
			cssVariables.setProperty(`--${name}-marker-color`, `var(--${name}-color)`);
		} else {
			cssVariables.setProperty(`--${name}-marker-color`, `none`);
		}
	});
	*/

	// Modify svg css to use same setting during PNG export
	if (visible) {
		document.getElementById("css-marker-colors").textContent =
			`svg {
				--Eisenbahn-marker-color: var(--Eisenbahn-color);
				--Strassenbahn-marker-color: var(--Strassenbahn-color);
				--Strasse-marker-color: var(--Strasse-color);
				--Wasserwege-marker-color: var(--Wasserwege-color);
				--Steuerstrecken-marker-color: var(--Steuerstrecken-color);
				--GBS-marker-color: var(--GBS-color);
				--Kamera-marker-color: var(--Kamera-color);
			}`;
	} else {
		document.getElementById("css-marker-colors").textContent =
			`svg {
				--Eisenbahn-marker-color: none;
				--Strassenbahn-marker-color: none;
				--Strasse-marker-color: none;
				--Wasserwege-marker-color: none;
				--Steuerstrecken-marker-color: none;
				--GBS-marker-color: none;
				--Kamera-marker-color: none;
			}`;
	}
}

function msg(key, ...args) {
	if (key) {
		// Get translated text for topic 'msg'
		// Show text only therefore we do not need to use innerHTML
		document.getElementById("message").textContent = EEP_Texts.getText("msg", key, ...args);
	} else if (key === "") {	// show literal text
		document.getElementById("message").textContent = args.reduce((a, b) => { return a + ", " + b;});
	} else {
		document.getElementById("message").textContent = "";
	}
}

function changeStrokeWidth(panZoom) {

	const sliderValue 		= document.getElementById("strokeWidth").value;
	const autoStrokeWidth 	= document.getElementById("autoStrokeWidth").checked;
	
	let strokeWidth;

	if (autoStrokeWidth) {
		// automatic stroke width
		const sizes 	= panZoom.getSizes();	// width height of svg area
												// viewBox (x y width height)
												// realZoom = min(width/viewBox.width, height/viewBox.height)
		const zoom 		= panZoom.getZoom();	// zoom factor

		if (!sizes.realZoom) {
			sizes.realZoom = 1;
		}
		// It seems that a power function for realZoom works quite well
		strokeWidth = 1.5 * sizes.realZoom ** -0.7;
		// Adjust automatic value slightly depending on slider with factor range [0.25 .. 3.25]
		strokeWidth *= ( 0.25 + sliderValue / 50 );

/*
console.log( "changeStrokeWidth"
	+ "\tautoStrokeWidth\t" 	+ autoStrokeWidth
	+ "\tsliderValue\t" 		+ sliderValue 
	+ "\tstrokeWidth\t" 		+ strokeWidth
	+ "\tzoom\t" 				+ zoom
	+ "\trealZoom\t" 			+ sizes.realZoom
	+ "\twidth\t" 				+ sizes.width
	+ "\theight\t" 				+ sizes.height
	+ "\tviewBox.width\t" 		+ sizes.viewBox.width
	+ "\tviewBox.height\t" 		+ sizes.viewBox.height
);
*/

	} else {
		// manual stroke width
		// Use exponential function to convert the slider value into range [0.11 .. 2.12] with f(75) = 1
		// f = 0.1054 * exp(0.03 * v)
		strokeWidth = 0.1054 * Math.exp(0.03 * sliderValue);
		
		// smalles lines look better
		strokeWidth *= 0.5;

console.log( "changeStrokeWidth"
	+ "\tautoStrokeWidth\t" 	+ autoStrokeWidth
	+ "\tsliderValue\t" 		+ sliderValue 
	+ "\tstrokeWidth\t" 		+ strokeWidth
);

	}

	// Modify svg css (nice, but only works in the browser, not during PNG export)
	/*
	const cssVariables = document.getElementById("css-strokeWidth-variables").sheet.rules[0].style;
	cssVariables.setProperty("--normal-stroke-width", `${ strokeWidth }px`);
	cssVariables.setProperty("--narrow-stroke-width", `${ strokeWidth / 2 }px`);
	*/

	// Modify svg css to use same setting during PNG export
	document.getElementById("css-strokeWidth-variables").textContent =
		`svg {
			--normal-stroke-width: ${ strokeWidth }px;
			--narrow-stroke-width: ${ strokeWidth / 2 }px;
		}`;
}

function changefontSize(value) {
	// Use exponential function to convert the slider value into range [0.11 .. 2.12] with f(75) = 1
	// f = 0.1054 * exp(0.03 * v)
	const factor = 0.1054 * Math.exp(0.03 * value);

	// Modify svg css (nice, but only works in the browser, not during PNG export)
	// (we maybe could use calc(3 * var(--font-size-factor, 1) * 1px) as well to avoid the constants here)
	/*
	const cssVariables = document.getElementById("css-fontSize-variables").sheet.rules[0].style;
	cssVariables.setProperty("--normal-font-size", `${3 * factor}px`);
	*/

	// Modify svg css to use same setting during PNG export
	document.getElementById("css-fontSize-variables").textContent =
		`svg {
			--normal-font-size: ${4 * factor}px;
		}`;

	// Schriftgröße in Weltkoordinaten merken und Texte neu entzerren
	global.fontSize = 4 * factor;
	scheduleLabelLayout();
}

function changeHeightRange(valueLow, valueHigh) {
	// skip call during initialization
	if (!global.usedArea) {
		return;
	}

	// localStorage.setItem("heightRange", valueLow + ","+ valueHigh);

	// Show min/max height
	const delta = ( global.usedArea.max.z - global.usedArea.min.z) / 100; // valueLow, valueHigh run from 0 to 100
	const minZ = global.usedArea.min.z + delta * valueLow;
	const maxZ = global.usedArea.min.z + delta * valueHigh;
	document.getElementById("heightArea").textContent = minZ.toFixed(1) + " .. " + maxZ.toFixed(1);
	global.heightRange = { minZ: minZ, maxZ: maxZ };   // für das Neuzeichnen des liveLayer

	// Adjust svg group elements
	const svgElem = document.getElementById("svg");
	for (const groupElem of svgElem.getElementsByTagName("g")) {
		for (const className of groupElem.classList){
			if (className.substring(0,7) === "height=") {  // Example: "height=123"
				const height = +className.substring(7);
				if (height < minZ || height > maxZ) {
					groupElem.classList.add("hiddenZ");
				} else {
					groupElem.classList.remove("hiddenZ");
				}
			}
		}
	}

	// Texte außerhalb des Höhenbereichs stören nicht
	scheduleLabelLayout();
}

function showRoutes(GleissystemID, SignalID, flag) {
	// No GleissystemID, SignalID: show/hide all
	if (!GleissystemID || !SignalID) {
		for (const ID in global.EndRouteSignals) {
			const EndRouteSignal = global.EndRouteSignals[ID]
			for (const EndRoute of EndRouteSignal) {
				showRoute(EndRoute.GleissystemID, EndRoute.StartSignal, EndRoute.Route, flag);			
			}
		}
		return;
	}

	// SignalID is a start signal: Show the routes from this start signal
	const Meldung	= global.Meldungen[SignalID];
	const RouteList = Meldung.getElementsByTagName("Route");
	if (RouteList && RouteList.length > 0) {	// It's a start signal 
		for (const Route of RouteList) {
			showRoute(GleissystemID, SignalID, Route, flag);
		}
		return;
	}
	
	// SignalID is an end signal: Show the routes to this end signal
	const EndRouteSignal = global.EndRouteSignals[SignalID];
	if (EndRouteSignal) {
		for (const EndRoute of EndRouteSignal) {
			showRoute(GleissystemID, EndRoute.StartSignal, EndRoute.Route, flag);			
		}
		return;
	}
}

function setClassById(ID, c, f) {
	const o = document.getElementById(ID);
	if (o) {
		if (f) {
			o.classList.add(c);
		} else {
			o.classList.remove(c);
		}
	}
}

function showRoute(GleissystemID, SignalID, Route, flag) {

	const TargetID	= Route.getAttribute("Target");	// Target signal
	//const Start	= Route.getAttribute("Start");	// Position of the start signal on the track
	//const Stop	= Route.getAttribute("Stop");	// Position of the end signal on the track
	const Color		= Route.getAttribute("Color");
	
	const FSclass = "FS" + Color % 8;
	setClassById( `S${SignalID}`, FSclass, flag);	// Start signal
	setClassById( `S${TargetID}`, FSclass, flag);	// End signal
			
	const Tracks = Route.getElementsByTagName("Tracks")[0];
	let Table	 = Tracks.getElementsByTagName("Table")[0];
	let Count	 = Table.getAttribute("Count");
	for (let i = 0; i < Count; i++) {
		const TrackID	= Table.getAttribute("e" + i);
		setClassById( `G${GleissystemID}-${TrackID}`, FSclass, flag);	// Track
	}

	const Signals	= Route.getElementsByTagName("OpenSignal")[0]; // Let's assume that attribute CloseSignal contains the same signals
	Table 			= Signals.getElementsByTagName("Table")[0];
	Count 			= Table.getAttribute("Count");
	for (let i = 0; i < Count; i++) {
		const ID	= Table.getAttribute("e" + i);
		
		// Is ID a signal or a switch?
		if (global.Meldungen[ID]) {
			setClassById( `S${ID}`, FSclass, flag);	// Signal
			setClassById( `P${ID}`, FSclass, flag);	// Pre signal
			setClassById( `H${ID}`, FSclass, flag);	// Halt line of signal
		} else { // if (global.Weichen[ID])
			setClassById( `W${ID}`, FSclass, flag);	// Switch
		}
	}
}	

// Kopfbereich ein-/ausklappen (z.B. um auf einem Tablet mehr Platz für den Gleisplan zu haben)
function setHeadingCollapsed(collapsed, userAction) {
	const heading = document.getElementById("heading");
	const button  = document.getElementById("toggleHeading");
	const row     = document.getElementById("main").classList.contains("row");

	const apply = function() { heading.classList.toggle("collapsed", collapsed); };
	if (userAction && global.SvgPanZoom && global.SvgPanZoom.keepBottomRight) {
		global.SvgPanZoom.keepBottomRight(apply);	// Gleisplan bleibt optisch stehen (rechte untere Ecke fix)
	} else {
		apply();
	}

	// Pfeil zeigt in die Richtung, in die der Kopfbereich ein- bzw. ausgeklappt wird
	button.textContent = collapsed ? (row ? "▶" : "▼") : (row ? "◀" : "▲");
	const text = EEP_Texts.getText("info", collapsed ? "Kopfbereich ausklappen" : "Kopfbereich einklappen");
	button.title = text;
	button.setAttribute("aria-label", text);
	button.setAttribute("aria-expanded", String(!collapsed));

	if (userAction) {
		try { localStorage.setItem("headingCollapsed", String(collapsed)); } catch (e) {}
	}
}

(function initHeadingToggle() {
	const heading = document.getElementById("heading");
	const button  = document.getElementById("toggleHeading");
	const main    = document.getElementById("main");

	let collapsed = false;
	try { collapsed = localStorage.getItem("headingCollapsed") === "true"; } catch (e) {}
	setHeadingCollapsed(collapsed, false);

	button.addEventListener("click", function() {
		setHeadingCollapsed(!heading.classList.contains("collapsed"), true);
		button.blur();	// Fokus abgeben, damit die Pfeiltasten wieder den Plan verschieben
	});

	// Der Schalter "Tauschen" wechselt zwischen column und row: Pfeilrichtung anpassen
	new MutationObserver(function() {
		setHeadingCollapsed(heading.classList.contains("collapsed"), false);
	}).observe(main, { attributes: true, attributeFilter: ["class"] });
})();

})(this); // end module
