// Show information in Info Box
"use strict";
/* global
	EEP_Texts:readonly,
	Signalstellung:readonly,
	global:readonly,
	matrix:readonly,
	_:readonly,
	TrackSystemText:readonly,
	msg:readonly,
	showInfoWindow:readonly,
	getCouplingText:readonly
*/
/* Interface
required standard objects:
	console
required global data:
	EEP_Texts
	Signalstellung
	global.GebaeudesammlungText
	global.GleisDataText
	global.Gleisart
	global.WeichenstellungText
	global
required functions:
	_
	TrackSystemText
	msg
	showInfoWindow
	matrix
	getCouplingText (js/EEP_Gleisplan_DOM2SVG.js)
public api functions:
	getKontaktIcon
	getKontaktText
	objectToHTML
	showGleisInfo
	showGleisobjektInfo
	showKameraInfo
	showKontaktInfo
	showSignalInfo
	showVirtualConnectionInfo
	showWeicheInfo
*/
(function(api) {
// public api
api.getKontaktIcon = getKontaktIcon;
api.getKontaktText = getKontaktText;
api.objectToHTML = objectToHTML;
api.showGleisInfo = showGleisInfo;
api.showKameraInfo = showKameraInfo;
api.showGleisobjektInfo = showGleisobjektInfo;
api.showKontaktInfo = showKontaktInfo;
api.showSignalInfo = showSignalInfo;
api.showVirtualConnectionInfo = showVirtualConnectionInfo;
api.showWeicheInfo = showWeicheInfo;

// Claude-AI: TipTxt, LuaFn, NameFilter, Dateinamen (File/gsbname) usw. stammen direkt aus nutzerdefinierten XML-Attributen der Anlage-Datei – ein klassischer DOM-based XSS über Dateiimport.
// Fix: Eine HTML-Escape-Hilfsfunktion einführen und konsequent auf alle aus der Datei stammenden Freitextfelder anwenden.
function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, c => ({
		'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
	}[c]));
}

function objectToHTML(object) {
	let s = "";

	if (global.altDown) {							// only if alt-key is pressed
		s = object.outerHTML;						// get HTML representation of object
		s = s.replace(/</g,"&lt;");					// escaping of < is required
		s = s.replace(/>(?![a-zA-Z0-9])/g,"&gt;<br>");	// escaping of > is optional but allows adding line breaks (unless followed by Pos, Dir, Nor or Bin)
		s = s.replace(/\t/g," ");					// replace tabs
		s = s.replace(/\s{2,}/g, " ");				// replace duplicate spaces
		s = s.replace(/(\r\n|\n|\r)/g,"");			// remove line breaks
		s = "<br><br><code>" + s + "</code>";		// <br> at the end allows easy copy & paste
	}

	return s;
}

function showVirtualConnectionInfo(GleissystemID, GleisID, Anschluss) {
	const posX = 12, posY = 13, posZ = 14;

	const Gleissystem = global.Gleissysteme[GleissystemID];
	if (!Gleissystem){ return; }

	const Gleis 	= Gleissystem[GleisID];
	if (!Gleis){ return; }

	const connections = global.trackConnections[GleissystemID][GleisID];
	if (!connections){ return; }

	const connection = connections[Anschluss];
	if (!connection){ return; }

	const connectedGleis = global.Gleissysteme[GleissystemID][connection.GleisID];

	const vPos = ( Anschluss            === "Anfang" ? Gleis.mPos          : Gleis.mEnd          );	// Start of virtual connection	
	const vEnd = ( connection.Anschluss === "Anfang" ? connectedGleis.mPos : connectedGleis.mEnd );	// End of virtual connection	

	// Kurzform in msg-Element
	msg("", TrackSystemText(GleissystemID) + " " + GleisID + " " 
			+ Anschluss + " (" + vPos[posX].toFixed(0) + "m, " + vPos[posY].toFixed(0) + "m) "
			+ "⇔" + " "
			+ TrackSystemText(GleissystemID) + " " + connection.GleisID + " "
			+ connection.Anschluss + " (" + vEnd[posX].toFixed(0) + "m, " + vEnd[posY].toFixed(0) + ") "
			+ _('virtuell')
	);

	// Ausführlich im Info Popup
	const _i = "</i>", _a = "</a>";
	showInfoWindow({
		code: "V" + GleissystemID + "-" + GleisID + "-" + Anschluss,
		title: `${TrackSystemText(GleissystemID)} ${GleisID} ⇔ ${connection.GleisID} ${_('virtuell')}`,	// ☍ 260D ↝ 219D ↝ 2192 ↣ 21A3 ↦ 21A6 ⇄ 21C4 ⇔ 21D4 ⇿ 21FF
		content:
		    `${_('virtualConnection')}`
			+ `<br>${TrackSystemText(GleissystemID)} ${GleisID} ${Anschluss} (<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${vPos}])">${vPos[posX].toFixed(0)}m, ${vPos[posY].toFixed(0)}m<\/a>)`
			+ `<br>${_('und')}`
			+ `<br>${TrackSystemText(GleissystemID)} ${connection.GleisID} ${connection.Anschluss} (<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${vEnd}])">${vEnd[posX].toFixed(0)}m, ${vEnd[posY].toFixed(0)}m<\/a>)`
			+ `<br>${_('Länge')}: ${Math.hypot((vPos[posX]-vEnd[posX]), (vPos[posY]-vEnd[posY]), (vPos[posZ]-vEnd[posZ])).toFixed(0)}m`
			//+ objectToHTML( xxx )
	});
}

function showGleisInfo(GleissystemID, GleisID) {
	const Gleissystem = global.Gleissysteme[GleissystemID];
	if (!Gleissystem){ return; }

	const Gleis 	= Gleissystem[GleisID];
	if (!Gleis){ return; }

	const clsid 	= Gleis.getAttribute("clsid");		// Gleisart
	const stil 		= Gleis.getAttribute("stil");		// Gleisstil
	const gsbname 	= Gleis.getAttribute("gsbname");	// Dateiname

	const Key_Id	= Gleis.getAttribute("Key_Id"); 	// Id einer Weiche
	const GleisData	= Gleis.getAttribute("data"); 		// Bitfeld einer Weiche
														// 1: Oberleitung
														// 18: DKW (Weichen und zentrale Gleise)
														// 16: Zentrale Strecken einer Straßen-T-Kreuzung
														// 20: Weichen einer Straßen-T-Kreuzung

	let GleisobjektText = "";
	let KollektorID;
	if (global.KollektorTracks[GleissystemID]) {
		if (global.KollektorTracks[GleissystemID][GleisID]) {
			KollektorID = global.KollektorTracks[GleissystemID][GleisID].KollektorID;
		}
	}
	if (KollektorID) {
		const Gleisobjekt = global.Gleisobjekte[KollektorID];

		GleisobjektText = "<br>" + _('Gleisobjekt') + ": " + escapeHtml(Gleisobjekt.gsbname)
			+ "<br>" + _('Immobilie') + ": " + global.GebaeudesammlungText[Gleisobjekt.GebaudesammlungID] + " " + Gleisobjekt.ImmoIdx;
	}

	// Kurzform in msg-Element
	msg("", TrackSystemText(GleissystemID) + " " + GleisID,
			global.Gleisart[clsid],
			_('Stil') + " " + stil,
			gsbname
	);

	const Q = matrix.quaternion(Gleis.mPos);					// Calculate quaternion
	const [roll_x, pitch_y, yaw_z] = matrix.euler_angles(Q); 	// Calculate euler angles
	const quaternionText = (global.altDown 
		?   `<br>` 
			+ 'Quaternion: axis ' + Q.axis 
			+ ', trace ' 	+ Q.tr.toFixed(4) 
			+ ', w ' 		+ Q.w.toFixed(4) 
			+ ', x ' 		+ Q.x.toFixed(4) 
			+ ', y ' 		+ Q.y.toFixed(4) 
			+ ', z ' 		+ Q.z.toFixed(4)
			+ ', norm ' 	+ Q.norm.toFixed(4)
			+ ', det ' 		+ matrix.det3x3(Gleis.mMid).toFixed(4)
			//+ ' det4x4'	+ matrix.det(Gleis.mMid).toFixed(4)
			+ ', roll ' 	+ (roll_x 	* 180/Math.PI).toFixed(1) + '°'
			+ ', pitch ' 	+ (pitch_y 	* 180/Math.PI).toFixed(1) + '°'
			+ ', yaw ' 		+ (yaw_z 	* 180/Math.PI).toFixed(1) + '°' 
		: ""
	);

	// Ausführlich im Info Popup
	const posX = 12, posY = 13, posZ = 14;

	// Show connected tracks
	let connectionText = "";
	const connections = global.trackConnections[GleissystemID][GleisID] || {};
	for (const connection in connections) {
		const connectedGleisID = connections[connection].GleisID;
		const connectedGleis = Gleissystem[connectedGleisID];
		connectionText += "<br>" + _(connection)
			+": "
			+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${connectedGleis.mMid}])">${connectedGleisID}<\/a>`
			+ " " + ( connections[connection].Flags ? _('virtuell') : "" );
	}

	const _i = "</i>", _a = "</a>";
	showInfoWindow({
		code: "Gleis " + GleissystemID + "-" + GleisID,
		title: `${TrackSystemText(GleissystemID)} ${GleisID}`,
		content:
			`${_('Position')} ${_('Anfang')}: (<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Gleis.mPos}])">${Gleis.mPos[posX].toFixed(0)}m, ${Gleis.mPos[posY].toFixed(0)}m<\/a>)`
			+ `<br>${_('Mitte')}: (<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Gleis.mMid}])">${Gleis.mMid[posX].toFixed(0)}m, ${Gleis.mMid[posY].toFixed(0)}m<\/a>)`
			+ `<br>${_('Ende')}: (<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Gleis.mEnd}])">${Gleis.mEnd[posX].toFixed(0)}m, ${Gleis.mEnd[posY].toFixed(0)}m<\/a>)`
			+ `<br>${_('Gleisart')}: ${global.Gleisart[clsid]}` + (Key_Id != null ? " " + Key_Id : "" )
			+ (GleisData != 0 
				? `<br>${(global.GleisDataText[GleisData] 
							? global.GleisDataText[GleisData] 
							: _('GleisData') + ": " + GleisData
					)} ` 
				: ""
			  )
			+ `<br>${_('Stil')}: ${stil}`
			+ (gsbname != null ? `<br>${_('Datei')}: ${escapeHtml(gsbname)}` : "")
			+ GleisobjektText
			+ `<br>${_('Länge')}: ${Gleis.Laenge.toFixed(0)}m`
			+ `<br>${_('Höhe')}: ${Gleis.mPos[posZ].toFixed(2)}m`
			+ (Gleis.CurveType === 'classic' || Gleis.CurveType === 'EEPCurve' ? "" : `<br>${_('Kurventyp')}: ${Gleis.CurveType}`)
			+ connectionText
			+ quaternionText
			+ objectToHTML(Gleis)
	});
}

function showWeicheInfo(WeicheID, GleissystemID, GleisID) {
	const Gleissystem = global.Gleissysteme[GleissystemID];
	if (!Gleissystem){ return; }

	const Gleis 	= Gleissystem[GleisID];
	if (!Gleis){ return; }

	const clsid 	= Gleis.getAttribute("clsid");		// Gleisart
	const stil 		= Gleis.getAttribute("stil");		// Gleisstil
	const gsbname 	= Gleis.getAttribute("gsbname");	// Dateiname

	const KontaktZiel 	= Gleis.getElementsByTagName("KontaktZiel")[0].textContent;
	const weichenstellung = Gleis.getAttribute("weichenstellung");
	const GleisData	= Gleis.getAttribute("data"); 		// Bitfeld einer Weiche
														// 1: Oberleitung
														// 18: DKW (Weichen und zentrale Gleise)
														// 16: Zentrale Strecken einer Straßen-T-Kreuzung
														// 20: Weichen einer Straßen-T-Kreuzung
														
	const SignalData = Gleis.getAttribute('SignalData'); // Schaltverbindung zu einem anderen Signal
	let cnt = 0;
	for (let i = 1; i <= 5; i++) { // Attribute NextSigFn1 (Gerade), NextSigFn2 (Abzweig), NextSigFn3 (KoAbzweig), NextSigFn4, NextSigFn5
		const SourcePos = i;
		const TargetPos = Gleis.getAttribute('NextSigFn' + i);	// gekoppelte Stellung
		if (TargetPos && TargetPos != 0) {
			cnt += 1; // Anzahl tatsächlich gekoppelter Stellungen
		}
	}			

	// Kurzform in msg-Element
	//msg(`Weiche ${WeicheID} auf ${TrackSystemText(GleissystemID)} ${GleisID}`);
	msg('SwitchLocation', WeicheID, TrackSystemText(GleissystemID), GleisID);

	// Show connected tracks
	let connectionText = "";
	const connections = global.trackConnections[GleissystemID][GleisID] || {};
	for (const connection in connections) {
		if (connection != "Anfang") {
			const connectedGleisID = connections[connection].GleisID;
			const connectedGleis = Gleissystem[connectedGleisID];
			connectionText += "<br>" + _(connection)
				+": "
				+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${connectedGleis.mMid}])">${connectedGleisID}<\/a>`
				+ " " + ( connections[connection].Flags ? _('virtuell') : "" );
		}
	}

	// Ausführlich im Info Popup
	showInfoWindow({
		code: "Weiche " + WeicheID,
		title: _('Weiche') + " " + WeicheID,
		content:
			`<i>${_('Position')}: `
				+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Gleis.mEnd}]);">${TrackSystemText(GleissystemID)} ${GleisID}<\/a>`
				+ `<\/i>`
			+ `<br>${_('Gleisart')}: ${global.Gleisart[clsid]}`
			+ (GleisData != 0 
				? `<br>${(global.GleisDataText[GleisData] 
							? global.GleisDataText[GleisData] 
							: _('GleisData') + ": " + GleisData
					)} ` 
				: ""
			  )
			+ `<br>${_('Weichenstellung')}: ${global.WeichenstellungText[weichenstellung]}`
			+ `<br>${_('Stil')}: ${stil}`
			+ (gsbname != null ? `<br>${_('Datei')}: ${escapeHtml(gsbname)}` : "")
//			+ (SignalData != null 
//				? `<br>${_('Schaltverbindung')}: ${SignalData}, ${_('Anzahl gekoppelter Stellungen')}: ${cnt}` 
//				: "")
			+ getCouplingText( WeicheID ) // Schaltverbindungen
			+ (KontaktZiel != null && KontaktZiel != 0 ? `<br>${_('Kontaktziel')}: ${KontaktZiel}` : "")
			+ connectionText
			+ objectToHTML(Gleis)
		});
}

function showSignalInfo(SignalID, GleissystemID, GleisID) {
	const Meldung 		= global.Meldungen[SignalID];
	if (!Meldung) { return; }

	const File 			= Meldung.getAttribute("name");		// Dateiname
	const Position		= Meldung.getAttribute("Position") / 100;
	const ParaOderAnti 	= Meldung.getAttribute("ParaOderAnti");
	const TipTxt	 	= Meldung.getAttribute('TipTxt');

	const KontaktZiel 	= Meldung.getElementsByTagName("KontaktZiel")[0].textContent;

	const Signal		= Meldung.getElementsByTagName("Signal")[0];
	const Stellung		= Signal.getAttribute("stellung");

	const SignalData	= Signal.getAttribute('SignalData'); // Schaltverbindung zu einem anderen Signal bzw. Weiche
	const Count			= Signal.getAttribute('Count');		// Anzahl gekoppelter Stellungen Fn01, Fn02,...
	let cnt = 0;
	for (let i = 1; i <= Count; i++) {
		const SourcePos = i;
		const TargetPos = Signal.getAttribute('Fn' + i.toString().padStart(2, '0'));	// gekoppelte Stellung
		if (TargetPos && TargetPos != 0) {
			cnt += 1; // Anzahl tatsächlich gekoppelter Stellungen
		}
	}

 	const Distanz		= Signal.getAttribute("wirkungsdistanz") / 100; // Abstand zwischen Vor- und Hauptsignal
 	const StopAt		= Signal.getAttribute("StopAt") / 100; // Halteabstand

	// Vor- / Hauptsignal
	let signalType      = "";
	const trackSignalEntries = global.trackSignals[GleissystemID][GleisID];
	if (trackSignalEntries) {
		for (const trackSignalEntry of trackSignalEntries) {
			const Meldung		= trackSignalEntry.Meldung;
			if (SignalID == Meldung.getAttribute("Key_Id")) {
				signalType	= trackSignalEntry.signalType;
			}
		}
	}

	// Fahrstraßen
	const RoutesCount	= Meldung.getAttribute("Routes");
	const RouteList	 	= Meldung.getElementsByTagName("Route");

		function getSignalName(File) {
			let Name = '';
			if (!Signalstellung[File]) {
				// no name
			} else if (typeof(Signalstellung[File].Name) === "string") {
				Name = Signalstellung[File].Name;
			} else if (typeof(Signalstellung[File].Name) === "object") {
				Name = Signalstellung[File].Name[EEP_Texts.getLanguage()]
					|| Signalstellung[File].Name.DE
					|| Signalstellung[File].Name.EN
					;
			} else {
				// no name
			}
			return Name;
		}
		
		function getSignalPositionText(File, Position) {
			let Text = '';
			if (!Signalstellung[File]) {
				// no text
			} else if (typeof(Signalstellung[File].Pos[Position]) === "string") {
				Text = Signalstellung[File].Pos[Position];
			} else if (typeof(Signalstellung[File].Pos[Position]) === "object") {
				Text = Signalstellung[File].Pos[Position][EEP_Texts.getLanguage()]
					|| Signalstellung[File].Pos[Position].DE	// primary language
					|| Signalstellung[File].Pos[Position].EN	// secondary language
					;
			} else {
				// no text
			}

			// Default translations
			if (Text === "Fahrt") 	{ Text = _("Fahrt"); }
			if (Text === "Halt") 	{ Text = _("Halt"); }

			return Text;
		}
		
	let SignalTypeText;
	let SignalstellungText = "";	// Die Bedeutung der Signalstellung für Fahrstraßen ist noch unklar
	if (File === "system\\Route_SignalS.3ds") {
		SignalTypeText = _('Fahrstraße') + " " + _('Startsignal');
	} else if (File === "system\\Route_SignalZ.3ds") {
		SignalTypeText = _('Fahrstraße') + " " + _('Endesignal');
	} else {
		if (signalType == "pre") {
			SignalTypeText = _('Vorsignal');
		} else {
			SignalTypeText = _('Signal');
		}
		if (Signalstellung[File]) {
			// 1st try: Get texts (case sensitive file name)
			SignalstellungText = getSignalPositionText(File, Stellung);
		} else {
			// 2nd try: Get texts (case insensitive file name)
			for (const SignalFile in Signalstellung) {
console.log(
	'SignalFile.toLowerCase() == File.toLowerCase()' 
	+ ' : ' 
	+ SignalFile.toLowerCase() 
	+ ' == ' 
	+ File.toLowerCase()
);
				if (SignalFile.toLowerCase() === File.toLowerCase()) {
					SignalstellungText = getSignalPositionText(SignalFile, Stellung);
				}
			}
		}
	}

	// Kurzform in msg-Element
	msg("", `${SignalTypeText} ${SignalID} ${escapeHtml(File)} ${_('auf')} ${TrackSystemText(GleissystemID)} ${GleisID}`
		+ `, ${_('Signalstellung')} ${Stellung} ${SignalstellungText}`
		+ (KontaktZiel != null && KontaktZiel != 0 ? `, ${_('Kontaktziel')}=${KontaktZiel}` : ""));

	// Ausführlich im Info Popup

	// Fahrstraßen
	const ColorText = { // <color> modulo 8
		0: { name: _('grau'),		color: "rgb(180,180,180)", 	},
		1: { name: _('rot'),		color: "rgb(220,0,0)", 		},
		2: { name: _('grün'),		color: "rgb(0,220,0)", 		},
		3: { name: _('blau'),		color: "rgb(0,0,220)", 		},
		4: { name: _('gelb'),		color: "rgb(220,220,0)", 	},
		5: { name: _('pink'),		color: "rgb(220,0,220)", 	},
		6: { name: _('hellblau'), 	color: "rgb(0,180,220)", 	},
		7: { name: _('orange'),		color: "rgb(220,110,0)",	},
	};
	let RoutesText = "";
	// Details für Start-Signale
	for (const Route of RouteList) {
		const TargetID 	= Route.getAttribute("Target");
		const Color 	= Route.getAttribute("Color");

		RoutesText 	+= `<br>${_('Zielsignal')}: `
					+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${global.Meldungen[TargetID].mPos}]);">`
					+ TargetID
					+ `<\/a>, `
					+ `<span style="color:${ColorText[Color%8].color};">${_('Farbe')}: ${Color} ${ColorText[Color%8].name}<\/span>`;
	}
	
	// Details für Ende-Signale
	const EndRouteSignal = global.EndRouteSignals[SignalID];
	if (EndRouteSignal) {
		RoutesText 	+= `<br>`
		for (const EndRoute of EndRouteSignal) {
			RoutesText +=
					_('Startsignal') + ': ' 
					+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${global.Meldungen[EndRoute.StartSignal].mPos}]);">`
					+ EndRoute.StartSignal
					+ `<\/a>, `
					+ ', ' + '<span style="color:' + ColorText[EndRoute.Color%8].color + ';">' + _('Farbe') + ': ' + EndRoute.Color + ' ' + ColorText[EndRoute.Color%8].name + '</span><br>'
					;
		}
	}

	// Show color of all routes directly
	//showRoutes(GleissystemID, SignalID, true);
	
	showInfoWindow({
		code: "Signal " + SignalID + signalType,
		title: `${SignalTypeText} ${SignalID}`,
		content:
			`<i>${_('Position')}: `
				+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Meldung.mPos}]);">${TrackSystemText(GleissystemID)} ${GleisID}`
				+ ` +${Position.toFixed(1)}m<\/a><\/i>`
			//+ `<br>${(signalType ? signalType : "")}`
			+ `<br>${_('Name')}: ${escapeHtml(File)}`
			+ (Signalstellung[File] && File !== getSignalName(File) ? `<br>${getSignalName(File)}` : "")
			+ `<br>${_('Signalstellung')} ${Stellung}: ${SignalstellungText}`
			+ (Distanz !=0 ? `<br>${(signalType == "pre" ? _('Distanz zum Hauptsignal') :  _('Distanz zum Vorsignal'))}: ${Distanz.toFixed(0)}m` : "")
			+ (StopAt != 0 ? `<br>${_('Halteabstand')}: ${StopAt.toFixed(0)}m`: "")
			+ `<br>${_('Gleisrichtung')}: ${ParaOderAnti} ` + (ParaOderAnti == 1 ? _('in Gleisrichtung') : _('gegen Gleisrichtung'))
			//+ (SignalData != null 
			//	? `<br>${_('Schaltverbindung')}: ${SignalData}, ${_('Anzahl gekoppelter Stellungen')}: ${cnt}` 
			//	: "")
			+ getCouplingText( SignalID ) // Schaltverbindungen
			+ (KontaktZiel != null && KontaktZiel != 0 ? `<br>${_('Kontaktziel')}: ${KontaktZiel}` : "")
			//+ (RoutesCount ? `<br>${_('Fahrstraßen')}: ${RoutesCount}` : "")
			+ (RoutesText !== "" ? `<br>${_('Fahrstraßen')}`
							 + ` <button onclick="javascript:showRoutes(${GleissystemID}, ${SignalID}, true);">${_('zeigen')}<\/button>` 
							 + ` <button onclick="javascript:showRoutes(${GleissystemID}, ${SignalID}, false);">${_('verstecken')}<\/button>` 
							 + RoutesText
						   : "")
			+ (TipTxt && TipTxt !== "" ? `<br>${_('TipTxt')}: ${escapeHtml(TipTxt)}` : "")
			+ objectToHTML(Meldung)
		});
}

function getKontaktIcon(GleissystemID, SetType, SetValue) {
	// https://www.compart.com/de/unicode/category/So
	const KontaktIcon = { 	// Sometimes the symbol works fine but sometime the unicode-code is necessary in Notepad++
		0 		: '⭢', 		// Weiche/Signal			⭢ \u2B62 → \u8594 &rarr;

		8 		: '🛑', 		// Halt nach x m			🛑 \u1f6d1
		
		128 	: '🧍', 		// Omegas					🧍 \u1F9CD
		256 	: '\u266C', // Sound					🔊 \u1F50A ♫ \u266B ♬ \u266C
		512 	: '📷', 	// Kamera 					📷 \u1F4F7
		768 	: '🏠', 	// Immobilie				🏠 \u1F3E0
		1024 	: '\u2387', // DKW/EKW					💢 ⎇ \u2387
		1280 	: '\u21E4', // Einfahrt Depot			⇤ \u21E4 ⇥ \u21E5 ⍖ \u2356 ⭢
		1536 	: '\u21A4', // Ausfahrt Depot			↤ \u21A4 ↦ \u21A6 ⍏ \u234F ⭢
		2048 	: '\u2398', // Animationen				⮔ 2B94 ⎘ \u2398 ↬ \u21AC ↝ \u219D
		32768	: '\u2042',	// Gruppe					⁂ \u2042 ⭢
							// 							⌂ \u2302 ⌥ \u2325   → = &rarr; = \u8594;   ⭢ = \u2B62
	};

	let Icon;

	// spezielle Kontakte
	if (SetType >= 1 && SetType <= 39 && SetType != 8) {				// Fahrzeug je nach Gleissystem	
		// Eisenbahn:	🚂🚃🚄🚅🚆🚇🚈🚉🚊🚝🚞
		// Straßenbahn:	🚎🚟🚠🚡
		// Straße:		🚌🚍🚐🚑🚒🚓🚔🚕🚖🚗🚘🚙🚚🚛🚜🚲🚴🚵⛟
		// Wasserwege:	⛴🚢🚣🚤⛵🚀🚁✈
		// Immobilien:	🏠🏡🏢🏣🏤🏥🏦🏧🏨🏩🏪🏫🏬🏭🏮🏯🏰
		Icon = { 1: '🚂', 2: '🚎', 3: '🚗', 4: '⛴', 5: '🚕', 6: ""}[GleissystemID];	// 	🚆 \u1F686 🚗 \u1f697 ⛴ \u26f4 ⛟ \u26DF

	} else if (SetType == 256 && SetValue && global.Sounds[SetValue]) { // Sound vorhanden
		Icon = '🔊';

	} else {
		Icon = (KontaktIcon[SetType] ? KontaktIcon[SetType] : ""); 		// see above
	}

	return Icon;
}

function getKontaktText(GleissystemID, SetType, SetValue, Wartender, VolDist, ConnectF) {
	// Achtung: die Variable $1 wird ersetzt
	const KontaktText = {	// SetValue
		0 		: _('Weiche/Signal'),

		8 		: _('Halt $1 m'), // Haltekontakt für befahrbares Rollmaterial
		
		1 		: _('Fahrzeug')+(+SetValue > 0 ? " "+_('Geschwindigkeit')+" "+_('nicht langsamer als $1 km/h') : ""),
		2 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('nicht schneller als $1 km/h'),
		3 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('festlegen auf $1 km/h'),

		5 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+(+SetValue > 0 ? ", "+_('Geschwindigkeit')+" "+_('nicht langsamer als $1 km/h') : ""),
		6 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('nicht schneller als $1 km/h'),
		7 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('festlegen auf $1 km/h'),
		
		17 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('wiederherstellen')+(+SetValue > 0 ? ", "+_('nicht langsamer als $1 km/h') : ""),
		18 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('wiederherstellen')+", "+_('nicht schneller als $1 km/h'),
		19 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('wiederherstellen')+", "+_('festlegen auf $1 km/h'),

		21 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('wiederherstellen')+(+SetValue > 0 ? ", "+_('nicht langsamer als $1 km/h') : ""),
		22 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('wiederherstellen')+", "+_('nicht schneller als $1 km/h'),
		23 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('wiederherstellen')+", "+_('festlegen auf $1 km/h'),
		
		33 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('vormerken')+(+SetValue > 0 ? ", "+_('nicht langsamer als $1 km/h') : ""),
		34 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('vormerken')+", "+_('nicht schneller als $1 km/h'),
		35 		: _('Fahrzeug')+" "+_('Geschwindigkeit')+" "+_('vormerken')+", "+_('festlegen auf $1 km/h'),

		37 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('vormerken')+(+SetValue > 0 ? ", "+_('nicht langsamer als $1 km/h') : ""),
		38 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('vormerken')+", "+_('nicht schneller als $1 km/h'),
		39 		: _('Fahrzeug')+" "+_('Fahrtrichtungsumkehr')+", "+_('Geschwindigkeit')+" "+_('vormerken')+", "+_('festlegen auf $1 km/h'),
		
		128 	: _('Omegas'),
		256 	: _('Sound'),
		512 	: _('Kamera'),
		768 	: _('Immobilie'),
		1024 	: _('DKW/EKW'),
		1280 	: _('Einfahrt Depot')+" "+Wartender, 	// Depot-ID = Wartender (0=default)
		1536 	: _('Ausfahrt Depot')+" "+SetValue,		// Depot-ID = SetValue
		2048 	: _('Animationen'),
		32768 	: _('Gruppen-Kontaktpunkt'),
	};

	let Text 	= (KontaktText[SetType] ? KontaktText[SetType] : _('unbekannt'));

	// Spezielle Kontakt-Typen
	if 		  (SetType == 0) {	// Weiche/Signal
		//if      (Weichen.find(function(Weiche) { return Weiche.ID == KontaktZiel}) ) 	{ KontaktTypText = _('Weiche'); }
		//else if (Signale.find(function(Signal) { return Signal.ID == KontaktZiel}) ) 	{ KontaktTypText = _('Signal'); }
		//else 																			{ KontaktTypText = 'Kontaktziel nicht gefunden'; }

	} else if (SetType >= 1 && SetType <= 39) {		// Fahrzeug
		Text = Text.replace("$1", SetValue);		// Geschwindigkeit eintragen

	} else if (SetType == 256 && SetValue && global.Sounds[SetValue]) {	// Sound vorhanden
			Text 	= global.Sounds[SetValue];

	} else if (SetType == 512) {	// Kamera
		/* ConnectF: 4 Byte Ganzzahl
			Byte 1 (LSB):	KameraID Start
			Byte 2:			Perspektive Start
			Byte 3:			KameraID Ende
			Byte 4:			Perspektive Ende
		*/
		const Perspektive = {
			0 : _('keine Perspektive festgelegt'),
			1 : _('Fahrzeug von links'),
			2 : _('Fahrzeug von rechts'),
			3 : _('Fahrzeug von links oben'),
			4 : _('Fahrzeug von rechts oben'),
			5 : _('Sicht in Fahrtrichtung'),
			6 : _('Rückwärtige Sicht'),
			7 : _('Folgemodus'),
			8 : _('Sicht in Kabine'),
		};

		// convert 32bit int to array of 4 bytes
		function convertIntToBytes( x ) {
			const bytes = [0, 0, 0, 0,];
			let i = 4;
			do {
				bytes[--i] = x & (255);
				x = x>>8;
			} while ( i && x > 0 );
			return bytes;
		}

		if (ConnectF) {
			const [EndePerspektive, EndeKameraID, StartPerspektive, StartKameraID] = convertIntToBytes( ConnectF );
			const StartKamera = global.KameraSet[StartKameraID];
			const EndeKamera = global.KameraSet[EndeKameraID];

console.log('Kamera'
	+ ' StartKameraID=' + StartKameraID
	+ ' StartPerspektive=' + StartPerspektive
	+ ' EndeKameraID=' + EndeKameraID
	+ ' EndePerspektive=' + EndePerspektive
);

			Text = ""		// <Kamera Icon> <Start Kamera> [<Perspektive>] / <Ende Kamera> nach <t> Sek. [<Perspektive>]
				+ (StartKamera
					? `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${StartKamera.mPos}])">${escapeHtml(StartKamera.Name)}<\/a>`
					: "" )
				+ (StartPerspektive > 0
					? ` [${Perspektive[StartPerspektive]}]`
					: "" )
				+ (EndeKamera
					? ` / <a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${EndeKamera.mPos}])">${escapeHtml(EndeKamera.Name)}<\/a> ${_('nach')} ${SetValue} ${_('Sekunden')}`
					: "" )
				+ (EndePerspektive > 0
					? ` [${Perspektive[EndePerspektive]}]`
					: "" );
		} else {
			Text = _('Kamera');
		}

	} else if (SetType == 1024) {	// DKW/EKW Weichenstellung
		const VolDistText = {
			0 : _('Umschalter'),
			1 : _('links-links'),
			2 : _('links-rechts'),
			3 : _('rechts-rechts'),
			4 : _('rechts-links'),
		};

		Text += " " + VolDistText[VolDist];

	}

	return Text;
}

function showKontaktInfo(KontaktID, GleissystemID, GleisID) {
//<Kontakt Position="2186.82" ParaOderAnti="0" fireOnPara="1" fireOnAnti="0" Teiler="1" ActTeiler="0" TrainSide="0" Route="0" Route2="0" SetType="0" SetValue="0" Delay="0" ActDelay="0" TrainID="0" TrainID2="0" Light="2" LastTrainID="6" LastOfs="2213.881" ConnectF="2" ConnectR="2" VolDist="28" zuStellung="1" Wartender="0" AxisPos="0" AxisFilter="" NameFilter="" TrainNewName="" KontaktDist="0" TrainDist="0" LuaFn="" Group="0" SignalData="0" KontaktZiel="1" Wechseln="0" clsid="5E9A3049-D465-4602-A285-6A9774DCF1BF"/>
	const Kontakt		= global.Kontakte[KontaktID];
	const SetType 		= +Kontakt.getAttribute("SetType");
	const SetValue 		= +Kontakt.getAttribute("SetValue");
	const KontaktZiel 	= +Kontakt.getAttribute("KontaktZiel");
	const Position		= Kontakt.getAttribute("Position") / 100;
	const ParaOderAnti 	= Kontakt.getAttribute("ParaOderAnti"); // Gleisrichtung 0: Ende -> Anfang, 1: Anfang -> Ende
	const fireOnPara 	= Kontakt.getAttribute("fireOnPara");
	const fireOnAnti 	= Kontakt.getAttribute("fireOnAnti");
	const Teiler 		= Kontakt.getAttribute("Teiler");
	const ActTeiler 	= Kontakt.getAttribute("ActTeiler");
	const Delay 		= Kontakt.getAttribute("Delay");
	const ActDelay 		= Kontakt.getAttribute("ActDelay");
	const TrainSide 	= Kontakt.getAttribute("TrainSide");
	const RouteID 		= Kontakt.getAttribute("Route");
	const RouteID2 		= Kontakt.getAttribute('Route2');
	const TrainID 		= Kontakt.getAttribute("TrainID");
	const TrainID2 		= Kontakt.getAttribute('TrainID2');
	const Light 		= Kontakt.getAttribute('Light');
	const LastTrainID	= Kontakt.getAttribute('LastTrainID');
	const LastOfs		= Kontakt.getAttribute('LastOfs');
	const NameFilter 	= Kontakt.getAttribute("NameFilter");
	const TrainNewName 	= Kontakt.getAttribute("TrainNewName");
	const KontaktDist 	= Kontakt.getAttribute('KontaktDist');
	const TrainDist 	= Kontakt.getAttribute('TrainDist');
	const zuStellung 	= Kontakt.getAttribute("zuStellung");
	const Wartender 	= Kontakt.getAttribute("Wartender");
	const Wechseln 		= Kontakt.getAttribute("Wechseln");
	const ConnectF 		= Kontakt.getAttribute("ConnectF");
	const ConnectR 		= Kontakt.getAttribute("ConnectR");
	const VolDist 		= Kontakt.getAttribute("VolDist");
	const SignalData 	= Kontakt.getAttribute("SignalData");
	const AxisPos 		= Kontakt.getAttribute('AxisPos'); 
	const AxisFilter 	= Kontakt.getAttribute('AxisFilter');
	const LuaFn 		= Kontakt.getAttribute("LuaFn");
	const Group		 	= Kontakt.getAttribute('Group');
	const TipTxt	 	= Kontakt.getAttribute('TipTxt');

	const TrainSidetext = {
		0 : _('Spitze'),
		1 : _('Schluss'),
		[-1] : _('Gruppen-Kontaktpunkt'),
	};

	// SignalData
	/*
	Byte 1 - 2 (LSB)
		Key-ID des abgefragten Signals oder Weiche
	Byte 3 - 4 (MSB)
		Signal- oder Weichenstellung, die gegeben sein muss, damit der Kontakt schaltet
		Signal:
			1=Fahrt
			2=Halt
		Weiche:
			1=Durchfahrt
			2=Abzweig
			3=Koabzweig
		EKW:
			1=von links nach rechts
			2=von rechts nach rechts
			3=von rechts nach links
		DKW:
			1=von links nach links
			2=von links nach rechts
			3=von rechts nach rechts
			4=von rechts nach links
	*/
	const SignalDataStellung = Math.floor(SignalData / 65536);
	const SignalDataID   	 = SignalData - SignalDataStellung * 65536;

	let Meldung, Gleis;
	const Ziel = global.KontaktZiele[KontaktZiel];
	if (Ziel) {
		Meldung = global.Meldungen[Number(Ziel.ID)];
		Gleis = global.Weichen[Number(Ziel.ID)];
	}

	// Zugverband`
	//const Zugverband = Zugverbaende.get(Number(TrainID)); // Zugverbaende.find(function(Zugverband) { return Zugverband.ID == TrainID});

	// Kurzform in msg-Element
	//msg(`Kontakt auf ${TrackSystemText(GleissystemID)} ${GleisID}`);
	msg('ContactLocation', TrackSystemText(GleissystemID), GleisID);

	// Ausführlich im Info Popup
	showInfoWindow({
		code: "Kontakt " + KontaktID,
		title: _('Kontakt'),
		content:
			`<i>${_('Position')}: `
				+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Kontakt.mPos}]);">`
				+ `${TrackSystemText(GleissystemID)} ${GleisID} +${Position.toFixed(1)}m<\/a><\/i>`
			+ `<br>${_('Kontakttyp')} ` + SetType + ": "
			// KontaktTyp[SetType] mit Modifikation
			+ getKontaktIcon(GleissystemID, SetType, SetValue) + " "
			+ getKontaktText(GleissystemID, SetType, SetValue, Wartender, VolDist, ConnectF)
			+ (SetType == 768 ||  SetType == 1024 ? `<br>${_('ImmoIdx')}: ` + SetValue : "")	// Verweis auf ImmoIdx
			//+ (SetType == 512 && ConnectF != 0 ? `<br>ConnectF: ` + ConnectF : "")
			+ (KontaktZiel != null && KontaktZiel != 0
				? `<br>${_('Kontaktziel')} ${KontaktZiel}: `
					+ ( Ziel ?
							`<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${(Meldung ? Meldung.mPos : (Gleis ? Gleis.mEnd : undefined))}]);">`
							+ `${Ziel.Typ} ${Ziel.ID} ${_('auf')} ${TrackSystemText(Ziel.GleissystemID)} ${Ziel.GleisID}`
							+ `<\/a>`
						  : _('unbekannt')
					  )
				: "")
			+ `<br>${_('Auslösung')}: `		+ (			fireOnPara == 1 && fireOnAnti == 0 ? (ParaOderAnti == 1 ? _('in Gleisrichtung') : _('gegen Gleisrichtung'))
											: ( 	fireOnPara == 0 && fireOnAnti == 1 ? (ParaOderAnti == 0 ? _('in Gleisrichtung') : _('gegen Gleisrichtung'))
												: ( fireOnPara == 1 && fireOnAnti == 1 ? _('beide Richtungen') : "" )
											  )
										  )
			+ (Teiler != 0 			? `<br>${_('Zug-Zähler')}: ` + Teiler : "")
			+ (ActTeiler != 0 		? `<br>${_('Zählerstand')}: `		+ ActTeiler : "")
			+ (Delay != 0 			? `<br>${_('Zeitverzögerung')}: `	+ Delay : "")
			+ (ActDelay != 0 		? `<br>${_('Zeit abgelaufen')}: `	+ ActDelay : "")
			+ `<br>${_('Zugposition')}: ` + (TrainSidetext[TrainSide] ? TrainSidetext[TrainSide] : TrainSide)
			+ (RouteID != 0 		? `<br>${_('für Route')}: ` + global.Routen[RouteID] : "")
			+ (TrainID != 0 		? `<br>${_('für Zug')}: ` + TrainID /*+ " " + (Zugverband ? Zugverband.Name : 'nicht vorhanden') */ : "")
			+ (NameFilter !== ""	? `<br>${_('Zug-Filter')}: `		 + escapeHtml(NameFilter) : "")
			+ (TrainNewName !== ""	? `<br>${_('Neuer Zugname')}: `	 + escapeHtml(TrainNewName) : "")
			+ (zuStellung > 0 && Wechseln == 0 ? `<br>${_('zu Stellung')}: ` + zuStellung : (Wechseln == 1 ? _('Umschalter') : ""))
			+ (SignalData != 0 		? `<br>${_('SignalData')}: ID=${SignalDataID} ${_('Signalstellung')}=${SignalDataStellung}` : "")
			+ (AxisPos && AxisPos != 0 ? `<br>` + (SetType == 1 // Fahrzeug 
													? _("Achsengruppe") + ": " + (-AxisPos)
													: _("AxisPos")      + ": " + AxisPos 
												  ) 
										: '')
			+ (LuaFn && LuaFn !== "" ? `<br>${_('LuaFn')}: <kbd>${escapeHtml(LuaFn)}<\/kbd>` : "")
			+ (TipTxt && TipTxt !== "" ? `<br>${_('TipTxt')}: ${escapeHtml(TipTxt)}` : "")
			+ objectToHTML(Kontakt)
	});
}

function showKameraInfo(KameraID) {
//<Kammera name="..." DOF="0" Dynamic="0" FocalIdx="193" FStopIdx="13" SubDist="100" DOFSubDist="100" DOFShiftNear="9.65" DOFShiftFar="12.965" FOV="0" TakeSwitch="0">
	function angle(rad) {
		return (rad*180/Math.PI).toFixed(1) + "°";
	}

	const Kamera 		= global.KameraSet[KameraID];
	if (!Kamera) { return; }

	const [DirX, DirY, DirZ, d0, NorX, NorY, NorZ, n0, BinX, BinY, BinZ, b0, PosX, PosY, PosZ, scale ] = Kamera.mPos;

	// https://www.matheplanet.com/default3.html?call=viewtopic.php?topic=140833&ref=https%3A%2F%2Fwww.google.com%2F

	// https://www.java-forum.org/thema/rotationswinkel-aus-einer-tansformationsmatrix-berechnen.158869/
	// oder  https://de.wikipedia.org/wiki/Roll-Nick-Gier-Winkel#Berechnung_aus_Rotationsmatrix
	// beta	= atan2( -r[2][0], sqrt(pow(r[0][0], 2) + pow(r[1][0], 2)) )
	// if beta <> Math.PI/2
	// 	 alpha = atan2( r[1][0]/cos(beta), r[0][0]/cos(beta) )
	// 	 gamma = atan2( r[2][1]/cos(beta), r[2][2]/cos(beta) )
	// else
	// 	 alpha = 0
	// 	 gamma = sign(beta) * atan2( r[0][1], r[1][1] );

/*
Deep Ocean						X°					Y° 					Z°
													Neigung					Richtung
								atan2(NorZ, BinZ)	-asin(DirZ)			-acos( DirX/cos(angleY) )
Anleger ELSA Kurhotel 			X: 0.0° 			Y: -2.4° 			Z: -72.0°
Bhf Einstädt					X: 0.0° 			Y: 9.6° 			Z: -162.0°
DANGER! Frachter 				X: 0.0° 			Y: 16.8° 			Z: -150.0°
Des Käptn´s Häuschen 			X: 0.0° 			Y: 2.4° 			Z: -72.0°
Industrieruine  				X: 0.0° 			Y: 12.0° 			Z: 36.0°
Kamerarundblick 				X: 0.0° 			Y: 2.4° 			Z: -90.0°
Kuhl bleiben 					X: 0.0° 			Y: -4.8° 			Z: -107.9°
Leuchtturmidylle 				X: 0.0° 			Y: 31.2° 			Z: 126°
Lokverladung in die VOGELFLUG 	X: 0.0° 			Y: 9.6° 			Z: -113.7°
Motorbootanleger 				X: 0.0° 			Y: -2.4° 			Z: -138.0°
Roofer 							X: 0.0° 			Y: 40.8° 			Z: -18.0°
Schuettgutverladung 			X: 0.0° 			Y: 7.2° 			Z: -42.2°
*/

	const angleY 	= -Math.asin( DirZ );
				//	= Math.acos( BinZ );
				//	= -Math.atan2( DirZ, BinZ );

	const angleX 	= ( Math.cos(angleY) === 0 ? 0 :
						 Math.asin( Math.min(1, Math.max(-1, NorZ/Math.cos(angleY)) )) 	// protect against rounding errors
						 );
				//	= Math.atan2( NorZ, BinZ );

	const angleZ 	= ( Math.cos(angleY) === 0 ? 'error' :
						-Math.acos( Math.min(1, Math.max(-1, DirX/Math.cos(angleY)) )) 	// protect against rounding errors
						* (DirY<0 ? -1 : 1) );											// adjust sign

/*console.log(Kamera.Name
//	+ '\nasin( DirX )=\t' + angle( -Math.asin( DirX ) )
//	+ '\nacos( DirX )=\t' + angle( Math.acos( DirX ) )
	+ '\nY: asin( DirZ )=\t' + angle( -Math.asin( DirZ ) )
//	+ '\nacos( DirZ )=\t' + angle( Math.acos( DirZ ) )
//	+ '\nasin( BinX )=\t' + angle( -Math.asin( BinX ) )
//	+ '\nacos( BinX )=\t' + angle( Math.acos( BinX ) )
//	+ '\nasin( BinZ )=\t' + angle( -Math.asin( BinZ ) )
	+ '\nY: acos( BinZ )=\t' + angle( Math.acos( BinZ ) )

//	+ '\natan2( DirX, NorX )=\t' + angle( Math.atan2( DirX, NorX ) )
//	+ '\natan2( NorX, BinX )=\t' + angle( Math.atan2( NorX, BinX ) )
//	+ '\natan2( BinX, DirX )=\t' + angle( Math.atan2( BinX, DirX ) )

//	+ '\natan2( DirZ, NorZ )=\t' + angle( Math.atan2( DirZ, NorZ ) )
	+ '\nX: atan2( NorZ, BinZ )=\t' + angle( Math.atan2( NorZ, BinZ ) )
//	+ '\natan2( BinZ, DirZ )=\t' + angle( Math.atan2( BinZ, DirZ ) )

//	+ '\natan2( DirX, BinX )=\t' + angle( Math.atan2( DirX, BinX ) )
//	+ '\natan2( NorX, DirX )=\t' + angle( Math.atan2( NorX, DirX ) )
//	+ '\natan2( BinX, NorX )=\t' + angle( Math.atan2( BinX, NorX ) )

	+ '\nY: atan2( DirZ, BinZ )=\t' + angle( -Math.atan2( DirZ, BinZ ) )
//	+ '\natan2( NorZ, DirZ )=\t' + angle( Math.atan2( NorZ, DirZ ) )
//	+ '\natan2( BinZ, NorZ )=\t' + angle( Math.atan2( BinZ, NorZ ) )

//	+ '\nasin( DirX/cos(y) )=\t' + angle( Math.asin( DirX/Math.cos(angleY) ) )
//	+ '\nasin( NorX/cos(y) )=\t' + angle( Math.asin( NorX/Math.cos(angleY) ) )
//	+ '\nasin( BinX/cos(y) )=\t' + angle( Math.asin( BinX/Math.cos(angleY) ) )

//	+ '\nasin( DirY/cos(y) )=\t' + angle( Math.asin( DirY/Math.cos(angleY) ) )
//	+ '\nasin( NorY/cos(y) )=\t' + angle( Math.asin( NorY/Math.cos(angleY) ) )
//	+ '\nasin( BinY/cos(y) )=\t' + angle( Math.asin( BinY/Math.cos(angleY) ) )

//	+ '\nasin( DirZ/cos(y) )=\t' + angle( Math.asin( DirZ/Math.cos(angleY) ) )
	+ '\nX: nasin( NorZ/cos(y) )=\t' + angle( Math.asin( NorZ/Math.cos(angleY) ) )
//	+ '\nasin( BinZ/cos(y) )=\t' + angle( Math.asin( BinZ/Math.cos(angleY) ) )

	+ '\nZ: acos( DirX/cos(y) )=\t' + angle( -Math.acos( DirX/Math.cos(angleY) ) * (DirY<0 ? -1 : 1) )
//	+ '\nacos( NorX/cos(y) )=\t' + angle( Math.acos( NorX/Math.cos(angleY) ) )
//	+ '\nacos( BinX/cos(y) )=\t' + angle( Math.acos( BinX/Math.cos(angleY) ) )

//	+ '\nacos( DirY/cos(y) )=\t' + angle( Math.acos( DirY/Math.cos(angleY) ) )
//	+ '\nacos( NorY/cos(y) )=\t' + angle( Math.acos( NorY/Math.cos(angleY) ) )
//	+ '\nacos( BinY/cos(y) )=\t' + angle( Math.acos( BinY/Math.cos(angleY) ) )

//	+ '\nacos( DirZ/cos(y) )=\t' + angle( Math.acos( DirZ/Math.cos(angleY) ) )
//	+ '\nacos( NorZ/cos(y) )=\t' + angle( Math.acos( NorZ/Math.cos(angleY) ) )
//	+ '\nacos( BinZ/cos(y) )=\t' + angle( Math.acos( BinZ/Math.cos(angleY) ) )

)*/

	// Kurzform in msg-Element
	//msg(`Kamera ${Kamera.Name}`);
	msg('Camera', Kamera.Name);

	// Ausführlich im Info Popup
	showInfoWindow({
		code: "Kamera " + KameraID + " " + Kamera.Name,
		title: '📷 ' + escapeHtml(Kamera.Name), // 📷 \u1F4F7
		content: //`<b>${escapeHtml(Kamera.Name)}<\/b><br>` +
			  `${_('Position')}: (<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Kamera.mPos}])">${PosX.toFixed(0)}m, ${PosY.toFixed(0)}m<\/a>)`
			+ `<br>${_('Höhe')}: ${PosZ.toFixed(0)}m`
			+ `<br>${_('Blickrichtung')}: ` 		 + angle( -angleZ )			// svg: mirrored y-coordinate
			+ " " + ['W', 'WNW', 'NW', 'NNW', 'N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W',].map(c => _('dir_' + c))[Math.floor(8+0.5+angleZ/Math.PI*8)] 
			+ `<br>${_('Neigung')}: ` 				 + angle( angleY )			// Neigung Y
			+ (angleX < -0.01 || angleX > 0.01 ? `<br>${_('Kippung')}: ` + angle( angleX ) : "")	// Neigung X
			+ `<br>` + (Kamera.Dynamic == 1 ? _('dynamisch') : _('statisch') )	// Bug: the camera type is not defined by an attribute in EEP 6
			+ objectToHTML(Kamera)
	});
}

function showGleisobjektInfo(GleisobjektID) {
	const Gleisobjekt = global.Gleisobjekte[GleisobjektID];
	if (!Gleisobjekt) { return; }
	
	showInfoWindow({
		code: "Gleisobjekt " + GleisobjektID,
		title: `${_('Gleisobjekt')} ${GleisobjektID}`,
		content:
			`<i>${_('Position')}: `
			+ `(<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Gleisobjekt.PosX},${Gleisobjekt.PosY},${Gleisobjekt.PosZ}])">`
			+ `${Gleisobjekt.PosX.toFixed(0)}m, ${Gleisobjekt.PosY.toFixed(0)}m`
			+ `<\/a>)<\/i>`
			+ `<br>${_('Immobilie')}: ${global.GebaeudesammlungText[Gleisobjekt.GebaudesammlungID] || '-'} ${Gleisobjekt.ImmoIdx || ''}`
			+ `<br>${_('Datei')}: ${escapeHtml(Gleisobjekt.gsbname) || '-'}`
		});
}
})(this); // end module