// svg-pan-zoom
"use strict";
/* global
	EEP_Texts:readonly,
	global:readonly,
	svgPanZoom:readonly,
	msg:readonly,
	TrackSystemText:readonly,
	changeStrokeWidth:readonly,
	changefontSize:readonly,
	showColorPickerWindow:readonly,
	showExportWindow:readonly,
	showGleisInfo:readonly,
	showGleisobjektInfo:readonly,
	showKameraInfo:readonly,
	showKontaktInfo:readonly,
	showSignalInfo:readonly,
	showVirtualConnectionInfo:readonly,
	showWeicheInfo:readonly
*/
/* Interface
required standard objects:
	BroadcastChannel
	console
	document
	localStorage
	window
required global data:
	EEP_Texts
	global
required functions:
	TrackSystemText
	changeStrokeWidth
	changefontSize
	showColorPickerWindow
	showExportWindow
	showGleisInfo
	showKameraInfo
	showKontaktInfo
	showSignalInfo
	showVirtualConnectionInfo
	showWeicheInfo
	showGleisobjektInfo
	msg
public api:
	SvgPanZoom
	centerItem
	centerPosition
*/
(function(api) {
// public api
api.SvgPanZoom = SvgPanZoom;
api.centerItem = centerItem;
api.centerPosition = centerPosition;

function SvgPanZoom() { // <!-- github.com/bumbu/svg-pan-zoom -->

	const beforePan = function(oldPan, newPan) {
		msg();
		return; // Zoom-in near the border does not work well if we limit pan with fixed gutter

		// Limit pan to keep SVG content visible by not allowing panning over SVG borders.
		const gutterWidth = 100,
			  gutterHeight = 100;

		const sizes = this.getSizes();
		const leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth;
		const rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom);
		const topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight;
		const bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom);

		const customPan = {};
		customPan.x = Math.max(leftLimit, Math.min(rightLimit,  newPan.x));
		customPan.y = Math.max(topLimit,  Math.min(bottomLimit, newPan.y));

		return customPan;
	};

	const onZoom = function(newZoom) {
		msg();
		changeStrokeWidth(panZoom);
		showArea(this);
	};

	const onPan = function(newPan) {
		msg();
		showArea(this);
	};

	const panZoom = svgPanZoom("#svg", {
		viewportSelector: ".svg-pan-zoom_viewport" // Viewport selector. Can be querySelector string or SVGElement
		//, panEnabled: true // enable or disable panning (default enabled)
		, controlIconsEnabled: false // insert icons to give user an option in addition to mouse events to control pan/zoom (default disabled)
		// , zoomEnabled: true // enable or disable zooming (default enabled)
		// , dblClickZoomEnabled: true // enable or disable zooming by double clicking (default enabled)
		// , mouseWheelZoomEnabled: true // enable or disable zooming by mouse wheel (default enabled)
		// , preventMouseEventsDefault: true // enable or disable preventDefault for mouse events
		, zoomScaleSensitivity: 0.1 // Zoom sensitivity
		, minZoom: 0.1 // Minimum Zoom level
		, maxZoom: 5000 // Maximum Zoom level
		// , fit: true // enable or disable viewport fit in SVG (default true)
		// , contain: false // enable or disable viewport contain the svg (default false)
		// , center: true // enable or disable viewport centering in SVG (default true)
		// , refreshRate: "auto" // Maximum number of frames per second (altering SVG viewport)
		// , beforeZoom: function(oldZoom, newZoom){ return true; }
		// , onZoom: function(ZoomScale){}
		, onZoom: onZoom
		// , beforePan: function(oldPan, newPan){ return customPan; } // oldPan.x, oldPan.y, newPan.x, newPan.y
		, beforePan: beforePan
		// , onPan: function(newPan){}
		, onPan: onPan
		// , customEventsHandler: { init : function(options){}, destroy : function(options){} }
		, customEventsHandler: {
			init : function(options) {
				this.listeners = {
					mouseenter: function(ev) {
						showPosition(options.instance, ev);
						showArea(options.instance, ev);
					},
					click: function(ev) {
						showArea(options.instance, ev);
						showElement(options.instance, ev);
					},
					mousemove: function(ev) {
						showPosition(options.instance, ev);
					},
					mouseleave: function(ev) {
						document.getElementById("cursorPosition").textContent = "";
					},
				};
				for (const eventName in this.listeners) {
					options.svgElement.addEventListener(eventName, this.listeners[eventName]);
				}
			},
			destroy: function(options) {
				for (const eventName in this.listeners) {
					options.svgElement.removeEventListener(eventName, this.listeners[eventName]);
				}
			}
		}
		// , eventsListenerElement: SVGElement
		// , onUpdatedCTM: function(){}
		, onUpdatedCTM: null // callback function which is triggered at the very end of pan or zoom effects
	});

	// Pan and zoom to used area
	showUsedArea(panZoom, true);

	global.timestamp.SvgPanZoom = Date.now();
	console.log('show svg:' + (global.timestamp.SvgPanZoom - global.timestamp.svgCreated) / 1000 + 'sec');

	// resize SvgPanZoom after resizing the window
	window.addEventListener("resize", function(ev) {
		msg();
		ev.preventDefault();
		// Resize content
		panZoom.resize();
		//panZoom.fit();
		//panZoom.center();
		showArea(panZoom);
	});

	// arrow keys trigger page scrolling, + - trigger zooming
	// another solution to deal with multiple keys at same time:
	// https://stackoverflow.com/questions/5203407/how-to-detect-if-multiple-keys-are-pressed-at-once-using-javascript
	window.addEventListener("keydown", function(ev) {
		//msg("", 'Target: ' + ev.target.nodeName, 'Key: ' + ev.key);
		if (ev.target.nodeName !== "BODY" && ev.target.nodeName !== "BUTTON") { return; }

		// Check active keys
		if ( !( ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "-"].includes(ev.key) )) {
			return;
		}

		// Zoom
		if 		  (ev.key === "+") {
			panZoom.zoomIn();
			ev.preventDefault();
			return false;
		} else if (ev.key === "-") {
			panZoom.zoomOut();
			ev.preventDefault();
			return false;
		}

		// Pan
		const sizes = panZoom.getSizes();	// width height of svg area
											// viewBox (x y width height)
											// realZoom = min(width/viewBox.width, height/viewBox.height)
		//const zoom 	= panZoom.getZoom();		// zoom factor
		if 		  (ev.key === "ArrowUp") {
			panZoom.panBy({
				x: 0,
				y: (global.shiftDown ? +sizes.height / 2 : +5),
			});
		} else if (ev.key === "ArrowDown") {
			panZoom.panBy({
				x: 0,
				y: (global.shiftDown ? -sizes.height / 2 : -5),
			});
		} else if (ev.key === "ArrowLeft") {
			panZoom.panBy({
				x: (global.shiftDown ? +sizes.width  / 2 : +5),
				y: 0,
			});
		} else if (ev.key === "ArrowRight") {
			panZoom.panBy({
				x: (global.shiftDown ? -sizes.width  / 2 : -5),
				y: 0,
			});
		} else {
			msg("", 'nothing to do');
			return;
		}
		showArea(panZoom);
		ev.preventDefault();
		return false;
	});

	// Button swap
	document.getElementById("swap").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		// Toogle between flex-direction: column and flex-direction: row
		document.getElementById("main").classList.toggle("column");
		document.getElementById("main").classList.toggle("row");

		// If the svg element is hidden, then we would get zero height and width after panZoom.resize();
		if (!document.getElementById("svg").classList.contains("hidden")) {
			// Swapping changes the size of the svg element
			const oldSizes = panZoom.getSizes();
			panZoom.resize();
			const newSizes = panZoom.getSizes();
			// The top left point keeps its position. We need to pan to keep the center being centered.
			panZoom.panBy({
				x: (newSizes.width - oldSizes.width) 	/ 2 ,
				y: (newSizes.height - oldSizes.height)	/ 2 ,
			});
			showArea(panZoom);
		}
	});

	// Button Zoom-In
	document.getElementById("zoom-in").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		panZoom.zoomIn();
	});
	// Button Zoom-Out
	document.getElementById("zoom-out").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		panZoom.zoomOut();
	});

	// Button Reset
	document.getElementById("reset").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		panZoom.fit();
		panZoom.center();
		panZoom.resetZoom();
		// Pan and zoom to used area
		showUsedArea(panZoom, true);
	});
	// Button ResetZoom
	document.getElementById("resetzoom").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		panZoom.resetZoom();
		// Zoom to used area
		showUsedArea(panZoom);
	});
	// Slider strokeWidth (in case of very large files, it might be better to use "change" event instead of "input" event to switch off live updates)
	document.getElementById("strokeWidth").addEventListener("input", function(ev) {
		msg();
		ev.preventDefault();
		localStorage.setItem("strokeWidth", ev.target.value);
		changeStrokeWidth(panZoom);
	});
	// Checkbox auto stroke width
	document.getElementById("autoStrokeWidth").addEventListener("input", function(ev) {
		msg();
		ev.preventDefault();
		if (ev.target.checked) {
			msg("automatic stroke width");
		} else {
			msg("manual stroke width");
		}		
		localStorage.setItem("checkbox_autoStrokeWidth", ev.target.checked);
		changeStrokeWidth(panZoom);
	});
	// Slider fontSize (in case of very large files, it might be better to use "change" event instead of "input" event to switch off live updates)
	document.getElementById("fontSize").addEventListener("input", function(ev) {
		msg();
		ev.preventDefault();
		changefontSize(ev.target.value);
		localStorage.setItem("fontSize", ev.target.value);
	});
	// Button "enable controls"
/*
	document.getElementById("enable").addEventListener("click", function() {
		msg();
		ev.preventDefault();
		panZoom.enableControlIcons();
	})
*/
	// Button "disable controls"
/*
	document.getElementById("disable").addEventListener("click", function() {
		msg();
		ev.preventDefault();
		panZoom.disableControlIcons();
	})
*/

	// Button savePNG
	document.getElementById("savePNG").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		showExportWindow();
	});
	// Button setColors
	document.getElementById("setColors").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		showColorPickerWindow();
	});

	// Button centerItem
	document.getElementById("centerItem").addEventListener("click", function(ev) {
		msg();
		ev.preventDefault();
		centerItem();
	});

	// Listen for checkbox change events - store checkbox settings in local storage
	document.querySelector(".fieldset").addEventListener("change", function(ev) {
		const target = ev.target;
		localStorage.setItem(`checkbox_${target.name}`, target.checked);
	});

// Broadcast Channel to receive messages from EEP_Inventar.html
// https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API

// // Initialization: Connection to a broadcast channel
const EEPchannel = new BroadcastChannel("EEP");

// Event handler
EEPchannel.onmessage = function(ev) {
	const command = ev.data.command;

	// Commands for navigation
	const GleissystemID = "" + ev.data.GleissystemID;	// Gleis
	const GleisID		= "" + ev.data.GleisID;

	const ID			= ev.data.ID;				// Signal oder Weiche
	const KontaktID		= ev.data.KontaktID;		// Kontakt
	const KameraID		= ev.data.KameraID;			// Kamera
	const GleisobjektID	= ev.data.GleisobjektID;	// Gleisobjekt
	const GBSID			= ev.data.GBSID;			// GBS
	global.shiftDown 	= ev.data.shiftDown;		// Status of keys
	global.strgDown 	= ev.data.strgDown;
	global.altDown 		= ev.data.altDown;

	if (command === "showID" && ID) {	// Signal oder Weiche

		const Meldung = global.Meldungen[Number(ID)];
		if (Meldung) {
			// Signal gefunden (Vorsignal oder Hauptsignal)
			centerPosition(Meldung.mPos);
			//msg(`Das Signal ${ID} befindet sich auf ${TrackSystemText(Meldung.GleissystemID)} ${Meldung.GleisID}`);
			msg('SignalLocation', ID, TrackSystemText(Meldung.GleissystemID), Meldung.GleisID);

//			showSignalInfo(ID, GleissystemID, GleisID);
			showSignalInfo(ID, Meldung.GleissystemID, Meldung.GleisID);
			return true;
		}

		const Gleis = global.Weichen[Number(ID)];
		if (Gleis) {
			// Weiche gefunden
			//const GleissystemID = Gleissystem.getAttribute("GleissystemID");
			const GleisID = Gleis.getAttribute("GleisID");
			centerPosition(Gleis.mEnd);
			//msg(`Die Weiche ${ID} befindet sich auf ${TrackSystemText(Gleis.GleissystemID)} ${GleisID}`);
			msg('SwitchLocation', ID, TrackSystemText(Gleis.GleissystemID), GleisID);

//			showWeicheInfo(ID, GleissystemID, GleisID);
			showWeicheInfo(ID, Gleis.GleissystemID, GleisID);
			return true;
		}

	} else if (command === "showContact" && KontaktID) {	// Kontakt

		const Kontakt = global.Kontakte[KontaktID];
		centerPosition(Kontakt.mPos);

		showKontaktInfo(KontaktID, GleissystemID, GleisID);
		return true;

	} else if (command === "showCamera" && KameraID) {	// Kamera

		const Kamera = global.KameraSet[KameraID];
		if (!Kamera) {
			//msg(`Kamera ${KameraID} existiert nicht`);
			msg('CameraNotExists', KameraID);
			return false;
		}

		centerPosition(Kamera.mPos);

		showKameraInfo(KameraID);
		return true;

	} else if (command === "showTrackObject" && GleisobjektID) {	// Gleisobjekt

		const Gleisobjekt = global.Gleisobjekte[GleisobjektID];
		if (!Gleisobjekt) {
			//msg(`Gleisobjekt ${GleisobjektID} existiert nicht`);
			msg('TrackObjectNotExists', GleisobjektID);
			return false;
		}

		centerPosition([Gleisobjekt.PosX, Gleisobjekt.PosY, Gleisobjekt.PosZ]);

		showGleisobjektInfo(GleisobjektID);
		return true;

	} else if (command === "showGBS" && GBSID) {	// GBS

		//...

	} else if (command === "showTrack" && GleissystemID && GleisID) {	// Gleis

		const Gleissystem = global.Gleissysteme[GleissystemID];
		if (!Gleissystem) {
			//msg(`Gleissystem ${GleissystemID} ${TrackSystemText(GleissystemID)} existiert nicht`);
			msg('TrackSystemNotExists', GleissystemID);
			return false;
		}
		const Gleis = Gleissystem[GleisID];
		if (!Gleis) {
			//msg(`${TrackSystemText(GleissystemID)} ${GleisID} existiert nicht`);
			msg('TrackNotExists', TrackSystemText(GleissystemID), GleisID);
			return false;
		}

		centerPosition(Gleis.mMid); // Mitte des Gleises
		//msg(`Positionierung auf ${TrackSystemText(GleissystemID)} ${GleisID}`);
		msg('Positioning', TrackSystemText(GleissystemID), GleisID);

		showGleisInfo(GleissystemID, GleisID);
		return true;

	} else {
		msg('wrongCommand', command);
		console.log(ev);
	}
};

// Disconnect the channel
//EEPchannel.close();

// End: Broadcast Channel

	return { // public interface
		centerItem: centerItem,
		centerPosition: centerPosition,
	};

function centerItem() {
	// Get input values
	//const text 	= o.options[o.selectedIndex].text;		// e.g. Eisenbahn
	const o 	= document.getElementById("selectObject" + EEP_Texts.getLanguage());
	const sel 	= o.options[o.selectedIndex].value;			// e.g. 1-6, I (statt W, S), K
	const val 	= Number(document.getElementById("number").value);

	if (sel >= "1" && sel <= "6") {	// TracksystemNumber

		const TracksystemNumber = Number(sel);
		
		let GleissystemID; // Find GleissystemID for TracksystemNumber 
		for (const key in global.TrackSystem) { 
			if (global.TrackSystem[key] == TracksystemNumber) {
				GleissystemID = key;
			}
		}
		
		const GleisID 		= val;

		const Gleissystem = global.Gleissysteme[GleissystemID];
		if (!Gleissystem) {
			//msg(`Gleissystem ${GleissystemID} ${TrackSystemText(GleissystemID)} existiert nicht`);
			msg('TrackSystemNotExists', GleissystemID);
			return false;
		}
		const Gleis = Gleissystem[GleisID];
		if (!Gleis) {
			//msg(`${TrackSystemText(GleissystemID)} ${GleisID} existiert nicht`);
			msg('TrackNotExists', TrackSystemText(GleissystemID), GleisID);
			return false;
		}

		centerPosition(Gleis.mMid); // Mitte des Gleises
		//msg(`Positionierung auf ${TrackSystemText(GleissystemID)} ${GleisID}`);
		msg('Positioning', TrackSystemText(GleissystemID), GleisID);
		return true;

	} else if (sel === "I" || sel === 'S' || sel === 'W') {		// I = Signal/Weiche (Nummern übergreifend über alle Gleissysteme)
		// Gleis.getAttribute("Key_Id") bzw. Gleis.getAttribute("Meldung").getAttribute("Key_Id")
		const ID 		= val;

		const Meldung = global.Meldungen[Number(ID)];
		if (Meldung) {
			// Signal gefunden (Vorsignal oder Hauptsignal)
			centerPosition(Meldung.mPos);
			//msg(`Das Signal ${ID} befindet sich auf ${TrackSystemText(Meldung.GleissystemID)} ${Meldung.GleisID}`);
			msg('SignalLocation', ID, TrackSystemText(Meldung.GleissystemID), Meldung.GleisID);
			return true;
		}

		const Gleis = global.Weichen[Number(ID)];
		if (Gleis) {
			// Weiche gefunden
			//const GleissystemID = Gleissystem.getAttribute("GleissystemID");
			const GleisID = Gleis.getAttribute("GleisID");
			centerPosition(Gleis.mEnd);
			//msg(`Die Weiche ${ID} befindet sich auf ${TrackSystemText(Gleis.GleissystemID)} ${GleisID}`);
			msg('SwitchLocation', ID, TrackSystemText(Gleis.GleissystemID), GleisID);
			return true;
		}

		//msg(`Signal/Weiche ${ID} existiert nicht`);
		msg('SignalSwitchNotExists', ID);
		return false; // Signal/Weiche nicht gefunden

	} else if (sel === "K") {		// Kontakt
		//...
	}
	return false;
}

function centerPosition(Position) {
	const width 	= panZoom.getSizes().width;
	const height	= panZoom.getSizes().height;
	const realZoom	= panZoom.getSizes().realZoom;
	
	let PosX, PosY, PosZ;
	if (Position.length == 16) { 	// Matrix
		PosX = Position[12];
		PosY = Position[13];
		PosZ = Position[14];
	} else {						// Vector
		PosX = Position[0];
		PosY = Position[1];
		PosZ = Position[2];
	}
		
	const panX 		= width/2	-   PosX  * realZoom;
	const panY 		= height/2	- (-PosY) * realZoom;	// svg: mirrored y-coordinate

	panZoom.pan({x: panX, y: panY});
}

// Show cursor position
function showPosition(panZoom, event) {
	const pan 	= panZoom.getPan();	// (x y)
	const sizes = panZoom.getSizes();	// width height of svg area
								// viewBox (x y width height)
								// realZoom = min(width/viewBox.width, height/viewBox.height)
	//const zoom 	= panZoom.getZoom();	// zoom factor

	const posX	= ( event.offsetX - pan.x) / sizes.realZoom;
	const posY	= ( event.offsetY - pan.y) / sizes.realZoom;

	/* Show cursor position */
	const text = "(" + (posX).toFixed(0) + " " + (-posY).toFixed(0) + ")";
	document.getElementById("cursorPosition").textContent = text;
}

// Show coordinates of visible area
function showArea(panZoom, event) {
	const pan 		= panZoom.getPan();	// (x y)
	const sizes 	= panZoom.getSizes();	// width height of svg area
								// viewBox (x y width height)
								// realZoom = min(width/viewBox.width, height/viewBox.height)
	//const zoom 		= panZoom.getZoom();	// zoom factor

	const minX		= (-pan.x) / sizes.realZoom;
	const minY		= (-pan.y) / sizes.realZoom;
	const centerX	= (-pan.x + sizes.width/2)  / sizes.realZoom;
	const centerY	= (-pan.y + sizes.height/2)	/ sizes.realZoom;
	const maxX		= (-pan.x + sizes.width)  	/ sizes.realZoom;
	const maxY		= (-pan.y + sizes.height) 	/ sizes.realZoom;

	/* Show coordinates of visible area */
	let text = "("  + (minX).toFixed(0) + " " + (-minY).toFixed(0) + ") .. ("
					+ (maxX).toFixed(0) + " " + (-maxY).toFixed(0) + ")";
	document.getElementById("visibleArea").textContent = text;
	/* Show center position */
	text = "(" + (centerX).toFixed(0) + " " + (-centerY).toFixed(0) + ")";
	document.getElementById("centerPosition").textContent = text;
}

// Show element
function showElement(panZoom, event) {
	if (!event || event.target.id === "svg") { return; }
/*
console.log("");

console.log(
"target|" +
event.target.tagName + ":" +
event.target.id + ":" +
event.target.classList[0]
)
if (event.target.parentElement) {
console.log(
"target.parentElement|" +
event.target.parentElement.tagName + ":" +
event.target.parentElement.id  + ":" +
event.target.parentElement.classList[0]
)
if (event.target.parentElement.parentElement) {
	console.log(
	"target.parentElement.parentElement|" +
	event.target.parentElement.parentElement.tagName + ":" +
	event.target.parentElement.parentElement.id  + ":" +
	event.target.parentElement.parentElement.classList[0]
	)
}
}
if (event.rangeParent) {
console.log(
"rangeParent|" +
event.rangeParent.tagName + ":" +
event.rangeParent.id  + ":" +
event.rangeParent.classList[0]
)
if (event.rangeParent.parentElement) {
	console.log(
	"rangeParent.parentElement|" +
	event.rangeParent.parentElement.tagName + ":" +
	event.rangeParent.parentElement.id  + ":" +
	event.rangeParent.parentElement.classList[0]
	)
}
}
*/
/*
Track
target						|path::stil-1353
target.parentElement		|g:G1-3:Weiche
rangeParent					|g:G1-3:Weiche
rangeParent.parentElement	|g:Eisenbahn:undefined

Track text
target						|text::undefined
target.parentElement		|g:G1-51:Normal
rangeParent					|text::undefined
rangeParent.parentElement	|g:G1-51:Normal

Track stil
target|text::Stil
target.parentElement		|g:G1-51:Normal
rangeParent					|text::Stil
rangeParent.parentElement	|g:G1-51:Normal

Track Hoehe
target|text::Hoehe
target.parentElement		|g:G1-51:Normal
rangeParent					|text::Hoehe
rangeParent.parentElement	|g:G1-51:Normal

Weiche text
target						|text:W2:WeicheText
target.parentElement		|g:G1-17:Weiche
rangeParent					|text:W2:WeicheText
rangeParent.parentElement	|g:G1-17:Weiche

Signal text
target						|text::Signal
target.parentElement		|g:S39:Signal
target.parentElement.parentElement|g:G1-47:Normal
rangeParent					|text::Signal
rangeParent.parentElement	|g:S39:Signal

Signal symbol
target						|use::undefined
target.parentElement		|g:S39:Signal
target.parentElement.parentElement|g:G1-47:Normal
rangeParent					|symbol:SymbolSignal:undefined

Signal circle
target						|circle::undefined
target.parentElement		|g:S39:Signal
rangeParent					|g:S39:Signal
rangeParent.parentElement	|g:G1-47:Normal

Kontakt symbol
target						|use::undefined
target.parentElement		|g:K1:Kontakt
target.parentElement.parentElement|g:G1-47:Normal

Kontakt circle
target						|circle::undefined
target.parentElement		|g:G1-47:Normal
rangeParent					|g:G1-47:Normal
rangeParent.parentElement	|g:Eisenbahn:undefined

Virtual connection
event.target.parentElement.parentElement.id					""
event.target.parentElement.parentElement.id					""
event.target.parentElement.classList[0]						virtual
event.target.parentElement.classList.contains("virtual")	true
event.target.classList[0]									undefined	
event.target.parentElement.id								V4
event.target.id												V4-1

Texts for tracks have an additional group element.
*/

if (false) { // Experiment for testing targets
	console.log( "target "               + event.target.id                             + " : " + event.target.classList.toString() );
	console.log( "target.parent "        + event.target.parentElement.id               + " : " + event.target.parentElement.classList.toString() );
	console.log( "target.parent.parent " + event.target.parentElement.parentElement.id + " : " + event.target.parentElement.parentElement.classList.toString() );
}

	if (event.target.parentElement.classList.contains("Signal")) {			// Signal (Vorsignal oder Hauptsignal oder Haltelinie)
		const SignalCode 		= event.target.parentElement.id;
		const SignalID 			= Number(SignalCode.substring(1));

		const GleisCode 		= event.target.parentElement.parentElement.id;
		const GleisTextArray 	= GleisCode.substring(1).split("-");
		const GleissystemID 	= GleisTextArray[0];
		const GleisID 			= GleisTextArray[1];

		showSignalInfo(SignalID, GleissystemID, GleisID);

	} else if (event.target.parentElement.classList.contains("Kontakt")) {	// Kontakt
		const KontaktCode		= event.target.parentElement.id;
		const KontaktID 		= KontaktCode.substring(1);

		const GleisCode 		= event.target.parentElement.parentElement.id;
		const GleisTextArray 	= GleisCode.substring(1).split("-");
		const GleissystemID 	= GleisTextArray[0];
		const GleisID 			= GleisTextArray[1];

		showKontaktInfo(KontaktID, GleissystemID, GleisID);

	} else if (event.target.parentElement.classList.contains("virtual")) {	// virtual connection

		const virtualConnectionCode 		= event.target.id;
		const virtualConnectionTextArray 	= virtualConnectionCode.substring(1).split("-");

		const GleissystemID 	= virtualConnectionTextArray[0];
		const GleisID 			= virtualConnectionTextArray[1];
		const Anschluss 		= virtualConnectionTextArray[2];
		
		showVirtualConnectionInfo(GleissystemID, GleisID, Anschluss);

	} else if (event.target.classList.contains("WeicheText")) { 			// Weiche
		const WeicheCode 		= event.target.id;
		const WeicheID 			= WeicheCode.substring(1);

		const GleisCode 		= event.target.parentElement.id;
		const GleisTextArray 	= GleisCode.substring(1).split("-");
		const GleissystemID 	= GleisTextArray[0];
		const GleisID 			= GleisTextArray[1];

		showWeicheInfo(WeicheID, GleissystemID, GleisID);

	} else if (event.target.parentElement.parentElement.id === "Kamera") {	// Kamera
		const KameraID 				= event.target.parentElement.id;

		// Issue: Name is not an unique key
		showKameraInfo(KameraID);

	} else if (    event.target.classList.contains("GleisID")				// Gleis text
				|| event.target.classList.contains("CurveType")
				|| event.target.classList.contains("Stil")
				|| event.target.classList.contains("Hoehe")
			  ) {
		const GleisCode 		= event.target.parentElement.parentElement.id;
		const GleisTextArray 	= GleisCode.substring(1).split("-");
		const GleissystemID 	= GleisTextArray[0];
		const GleisID 			= GleisTextArray[1];

		showGleisInfo(GleissystemID, GleisID);

	} else if (    event.target.parentElement.classList.contains("active") // Gleis path
				|| event.target.parentElement.classList.contains("inactive")
			  ) {
		const GleisCode 		= event.target.parentElement.id;
		const GleisTextArray 	= GleisCode.substring(1).split("-");
		const GleissystemID 	= GleisTextArray[0];
		const GleisID 			= GleisTextArray[1];

		showGleisInfo(GleissystemID, GleisID);

	} else if (event.target.parentElement.parentElement.classList.contains("Gleisobjekt")) {	// Gleisobjekt
		const GleisobjektCode 	= event.target.parentElement.id;
		const GleisobjektID 	= GleisobjektCode.substring(2);

		showGleisobjektInfo(GleisobjektID);	
	}
}

function showUsedArea(panZoom, pan) {
	// Pan and zoom to used area
	// zoomAtPoint(scale, {x:0,y:0});   or   pan({x:0,y:0}); zoom(scale);
	const width 		= panZoom.getSizes().width;
	const height		= panZoom.getSizes().height;
	const usedwidth 	= global.usedArea.max.x - global.usedArea.min.x;
	const usedheight	= global.usedArea.max.y - global.usedArea.min.y;
	const realZoom		= panZoom.getSizes().realZoom;

	const panX 			= width/2  - ( global.usedArea.min.x + usedwidth/2  ) * realZoom;
	const panY 			= height/2 + ( global.usedArea.max.y - usedheight/2 ) * realZoom;	// svg: mirrored y-coordinate
	const scale 		= Math.min( width  / usedwidth,
									height / usedheight ) / realZoom;

	if (pan) {
		panZoom.pan({x: panX, y: panY});
	}
	panZoom.zoom(scale);
}

} // end function SvgPanZoom

// Handle special keys
global.shiftDown 	= false;
global.strgDown 	= false;
global.altDown 		= false;
// Clear key status when window gets focus (mainly to omit Alt key)
window.addEventListener("focus", function(event) {
	global.shiftDown 	= false;
	global.strgDown 	= false;
	global.altDown 		= false;
});
//window.addEventListener("blur", function(event) {});
// Activate key
document.addEventListener("keydown", function(event){
    if			(event.keyCode === 16 || event.charCode === 16){
        global.shiftDown = true;
    } else if	(event.keyCode === 17 || event.charCode === 17){
        global.strgDown = true;
    } else if	(event.keyCode === 18 || event.charCode === 18){
        global.altDown = true;
    }
});
// Deactivate key
document.addEventListener("keyup", function(event){
    if			(event.keyCode === 16 || event.charCode === 16){
        global.shiftDown = false;
    } else if	(event.keyCode === 17 || event.charCode === 17){
        global.strgDown = false;
    } else if	(event.keyCode === 18 || event.charCode === 18){
        global.altDown = false;
    }
});

})(this); // end module
