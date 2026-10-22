// Data: Aufbereitung der Daten der Anlage-Datei (ohne SVG)
"use strict";
/* global
	global:readonly,
	_:readonly
*/
/* Interface
required standard objects:
	console
required global data:
	global (js/EEP_Gleisplan_LoadFile.js, muss vor diesem Skript geladen sein, da global.TrackSystemCode und global.unsichtbar beim Laden gesetzt werden)
required functions:
	_ (js/EEP_Texts.js)
public api:
	TrackSystemText
	getCouplingText
	getGleisInterval
	loadStaticTexts
	prepareGleissysteme
global data which is defined here:
	global.activeTracks
	global.Couplings
	global.EEPversion
	global.EndRouteSignals
	global.GebaeudesammlungText
	global.GleisDataText
	global.Gleisart
	global.Gleisobjekte
	global.Gleissysteme
	global.KameraSet
	global.KollektorTracks
	global.KontaktZiele
	global.Kontakte
	global.Meldungen
	global.Rollmaterial
	global.Routen
	global.Sounds
	global.TrackSystem
	global.TrackSystemCode
	global.TrackSystemTexts
	global.Weichen
	global.WeichenstellungText
	global.Zugverband
	global.trackConnections
	global.trackSignals
	global.unsichtbar
	global.usedArea
	global.waitingTrains
*/
(function(api) {
// public api
api.TrackSystemText = TrackSystemText;
api.getCouplingText = getCouplingText;
api.getGleisInterval = getGleisInterval;
api.loadStaticTexts = loadStaticTexts;
api.prepareGleissysteme = prepareGleissysteme;

function TrackSystemText(GleissystemID) {
	return global.TrackSystemTexts[global.TrackSystem[GleissystemID]];
}
	
function loadStaticTexts() {

global.TrackSystemTexts = { 			// per TrackSystemNumber 1-6 (caution: GleissystemID could show other numbers, too) 
	1 : _('Eisenbahn'),
	2 : _('Strassenbahn'),
	3 : _('Strasse'),
	4 : _('Wasserwege'),
	5 : _('Steuerstrecken'),		// nicht in EEP 9
	6 : _('GBS'),					// nicht in EEP 9
};

global.Gleisart = { 					// clsid
	"2E25C8E2-ADCD-469A-942E-7484556FF932" : _('Normal'),
	"C889EADB-63B5-44A2-AAB9-457424CFF15F" : _('Weiche'),
	"B0818DD8-5DFD-409F-8022-993FD3C90759" : _('3-Weg-Weiche'),
	"06D80C90-4E4B-469B-BFE0-509A573EBC99" : _('Prellbock'),
};

// GleisData
global.GleisDataText = {
	1	: _('Oberleitung'),											// 1
	2	: _('Weichenlaterne verstecken'),							// 2
	3	: _('Oberleitung') + ', ' + _('Weichenlaterne verstecken'),	// 1 + 2 
	4	: _('Weichenlaterne rechts'),								// 4
	5	: _('Oberleitung') + ', ' + _('Weichenlaterne rechts'),		// 1 + 4
	8	: _('Weichenlaterne links'),								// 8
	9	: _('Oberleitung') + ', ' + _('Weichenlaterne links'),		// 1 + 8
	16	: _('Weichenlaterne als Immobilie/Straßen-T-Kreuzung'),		//
	18	: _('Doppelkreuzungsweiche'),								// 
	19	: _('Oberleitung') + ', ' + _('Doppelkreuzungsweiche'),		// 
	20	: _('Straßen-T-Kreuzung'),									// 
	64	: _('Spezial'),																	//         64 ?
	65	: _('Oberleitung') + ', ' + _('Spezial'),										// 1 +     64 ?
	69	: _('Oberleitung') + ', ' + _('Weichenlaterne rechts') + ', ' + _('Spezial'),	// 1 + 4 + 64 ?
	73	: _('Oberleitung') + ', ' + _('Weichenlaterne links')  + ', ' + _('Spezial'),	// 1 + 8 + 64 ?
};

// Weichenstellung
global.WeichenstellungText = {
	1 : _('Durchfahrt'),
	2 : _('Abzweig'),
	3 : _('KoAbzweig'),
	5 : _('Spezial'),
};

global.GebaeudesammlungText = {		// GebaeudesammlungID : Text,
	1 : _('Eisenbahn'),
	2 : _('Strassenbahn'),
	3 : _('Strasse'),
	4 : _('Immobilien'),
	5 : _('Landschaftselemente'),
	6 : _('Sonstiges'),			//  (Wasserwege)
};

} // end function loadStaticTexts

global.TrackSystemCode = { 			// TracksystemID : Code,
	1 : "Eisenbahn",
	2 : "Strassenbahn",
	3 : "Strasse",
	4 : "Wasserwege",
	5 : "Steuerstrecken",			// nicht in EEP 9
	6 : "GBS",						// nicht in EEP 9
};

/* Gleisstile:
http://up.picr.de/33875489iu.pdf
http://bahn.hersacher.de/splinekatalog/spkat_intro.htm
*/
global.unsichtbar = [			// unsichtbare Gleisstile
17,		// \Gleisstile\Sonstiges\Wasserweg_unsichtbar.3dm
28,		// Gleis
35,		// Straßenbahn
34,		// \Gleisstile\Sonstiges\Wasserweg_unsichtbar.3dm
36,		// \Gleisstile\Strassen\unsichtbar.3dm
562,	// Gleis
1309, 	// \Gleisstile\Gleise\Unsichtbar_LW1.3dm
1346,	// Gleis
2052,	// \Gleisstile\Gleise\Unsichtbares_Gleis_m_OL_UB3.3dm
3425, 	// \Gleisstile\Strassen\1Spur_unsichtbar_AS3.3dm
5100,	// \Gleisstile\Gleise\Unsichtbar_RB2.3dm
100000,	// Kamerafahrweg
/*
18,		// \Gleisstile\Sonstiges\telegraph.3dm
70,		// \Gleisstile\Sonstiges\Stuetzmauer_Lauscha.3dm
85,		// \Gleisstile\Strassen\Leitplanke.3dm
92,		// \Gleisstile\Gleise\Bahnsteig.3dm
102,	// \Gleisstile\Sonstiges\Gitterzaun.3dm
134,	// \Gleisstile\Gleise\Bahnsteig_KoelnHbf.3dm
184,	// \Gleisstile\Sonstiges\Gelaender.3dm
264,	// \Gleisstile\Gleise\Bahnsteig_Hohenfels.3dm
731,	// \Gleisstile\Gleise\Bhst900_Kreihnsdoerp.3dm
732,	// \Gleisstile\Gleise\Bhst1350_Kreihnsdoerp.def
851,	// \Gleisstile\Sonstiges\851_Gelaender_mit_Stuetze_AF1.3dm
927,	// \Gleisstile\Sonstiges\Schallschutzwand.3dm
1246,	// \Gleisstile\Sonstiges\Sicherheitszaun.3dm
1307,	// \Gleisstile\Sonstiges\Gleis_Abdeckung_C_LW1.3dm
1380,	// \Gleisstile\Sonstiges\Fuehrungsschiene_R_LW1.3dm
1381,	// \Gleisstile\Sonstiges\Nur Fahrdraht_MM_LW1.3dm
1393,	// \Gleisstile\Sonstiges\LW1_Gleis_Fahrdraht_mitte.3dm
1399,	// \Gleisstile\Sonstiges\LW1_Gleis_Fahrdraht_ende.3dm
1401,	// \Gleisstile\Sonstiges\LW1_Gleis_Quertraeger_unten.3dm
1402,	// \Gleisstile\Sonstiges\LW1_Gleis_Quertraeger_oben.3dm
1412,	// \Gleisstile\Sonstiges\LW1_Gleis_Fahrdraht_anf.3dm
1414,	// \Gleisstile\Sonstiges\LW1_Gleis_Fahrdraht_spann.3dm
1445,	// \Gleisstile\Sonstiges\LW1_Gleis_Quertraeger_Stahl_LW1.3dm
1448,	// \Gleisstile\Sonstiges\LW1_Gleis_Quertraeger_leer.3dm
1449,	// \Gleisstile\Sonstiges\LW1_Gleis_Schallschutz_Stuetzmauer_LW1.3dm
1450,	// \Gleisstile\Sonstiges\LW1_Gleis_Spannungsver_A.3dm
1601,	// \Gleisstile\Sonstiges\1601_Gelaender_mit_Stuetze_AF1.3dm
1738,	// \Gleisstile\Sonstiges\Kabelkanal1_MA1.3dm
1958,	// \Gleisstile\Sonstiges\3DVersion\Lattenzaun-3D_SM1.3dm
1959,	// \Gleisstile\Sonstiges\3DVersion\Jaegerzaun-3D_SM1.3dm
1974,	// \Gleisstile\Sonstiges\Steinmauer3_SM1.3dm
1978,	// \Gleisstile\Sonstiges\Arkadenmauer-2gl_SM1.3dm
1979,	// \Gleisstile\Sonstiges\Arkadenmauer-4gl_SM1.3dm
1982,	// \Gleisstile\Sonstiges\3DVersion\Arkadenmauer-einseitig-3D_SM1.3dm
1995,	// \Gleisstile\Sonstiges\Schutzmauer_2_MA1.3dm
2304,	// \Gleisstile\Sonstiges\DB-Gelaender_SB3.3dm
2381,	// \Gleisstile\Sonstiges\DB-Gelaender_10_SB3.3dm
2386,	// \Gleisstile\Sonstiges\Schallschutzwand_grau_SB3.3dm
2387,	// \Gleisstile\Sonstiges\Schallschutzwand_gruen_SB3.3dm
2581,	// \Gleisstile\Sonstiges\BMauer_eben_0_HW1.3dm
5008,	// \Gleisstile\Sonstiges\3DVersion\Sicherheitszaun_mit_Stacheldragt_3D.3dm
5085,	// \Gleisstile\Sonstiges\3DVersion\Hedge_1m_Cypress.3dm
5138,	// \Gleisstile\Sonstiges\3DVersion\ParkHotel_Harz_Zaun.3dm
5145, 5146, 5147, // Farm track
5213,	// \Gleisstile\Sonstiges\3DVersion\Ebrzgl.3dm
5261,	// \Gleisstile\Sonstiges\3DVersion\Schutzplanke_einfach_MA1.3dm
5262,	// \Gleisstile\Sonstiges\3DVersion\Schutzplanke_zweifach_MA1.3dm
5263,	// \Gleisstile\Sonstiges\3DVersion\Schutzplanke_doppel_MA1.3dm
5271,	// \Gleisstile\Sonstiges\IndZaun_Zaun_AE1.3dm
5272,	// \Gleisstile\Sonstiges\IndZaun_Zaun_TT1_AE1.3dm
5274,	// \Gleisstile\Sonstiges\IndZaun_Zaun_TT3_AE1.3dm
5602,	// Fence
7411,	// \Gleisstile\Strassen\Leitpl_3D_mit_Pf_UFS_DH1.3dm
7412,	// \Gleisstile\Sonstiges\Doppel_T_Trg_30x30_blau_DH1.3dm
*/
];

function prepareGleissysteme(sutrackp) {

	// Verwendeter Bereich der Anlage
	global.usedArea = {
		min : {x : 0, y : 0, z : 0},
		max : {x : 0, y : 0, z : 0},
	};

	const Version = sutrackp.getElementsByTagName("Version")[0];
	if (Version) {
		global.EEPversion = Version.getAttribute("EEP");
	}

	// Collections for direct access
	global.Gleissysteme 	= {};	// Verwendung: Gleis = global.Gleissysteme[GleissystemID][GleisID];
	global.Meldungen 		= {};
	global.waitingTrains 	= [], 	// ID (des Zugverbandes), speed
	global.Weichen 			= {};
	global.Kontakte			= {};
	global.KontaktZiele		= {};
	global.EndRouteSignals	= {};	// Start-route-signals of end-route-signals 
	global.KameraSet 		= {};	// Verwendung: Kamera = global.KameraSet[index];
	global.Zugverband 		= {};	// Verwendung: Train = global.Zugverband[GleissystemID][trainName];
	global.Gleisobjekte		= {};
	global.Rollmaterial		= {};	// Verwendung: global.Rollmaterial[name] = {clsid, vUeberhang, hUeberhang}
	global.Routen			= {};
	global.Sounds			= {};
	
	// Schaltverbindungen zwischen Signalen und/oder Weichen
	global.Couplings 		= {}; 	// SignalData, Schaltverbindung zu einem anderen Signal bzw. Weiche
	
	// <Options RouteItems="5" SndId_0="6" SndName_0="ZIEGEN.WAV" SoundItems="1" RouteId_0="1" RouteName_0="Nahverkehr" RouteId_1="2" RouteName_1="Schnellzug" RouteId_2="3" RouteName_2="Gueter" RouteId_3="4" RouteName_3="Nebenbahn" RouteId_4="5" RouteName_4="Sonderzug"/>
	const Options = sutrackp.getElementsByTagName("Options")[0];
	const RouteItems = +Options.getAttribute("RouteItems");
	for (let i = 0; i < RouteItems; i++) {
		const RouteID	= Options.getAttribute("RouteId_" + i);
		const RouteName = Options.getAttribute("RouteName_" + i);

		global.Routen[RouteID] = RouteName;
	}
	const SoundItems 	= +Options.getAttribute("SoundItems");
	for (let i = 0; i < SoundItems; i++) {
		const SoundID 	= Options.getAttribute("SndId_" + i);
		const SoundName = Options.getAttribute("SndName_" + i);

		global.Sounds[SoundID] = SoundName;
	}

	// Preparation: Collect "active" tracks
	const activeTracks = [];		// Gleise, auf denen Züge stehen oder die Kontakte enthalten (Signale werden ignoriert)
									// oder die mit solchen Gleisen verbunden sind
	// Preparation: Collect connected tracks
	const trackConnections = [];	// Gleisverbindungen

	// Preparation: Collect signals on tracks
	const trackSignals = [];		// Vor- und Hauptsignale
	// Start-route-signals of end-route-signals 

	const Gleissysteme 	= sutrackp.getElementsByTagName("Gleissystem");
	for (const Gleissystem of Gleissysteme) {
		// Use both attributes GleissystemID and TrackSystemNumber if available
		let GleissystemID     = Gleissystem.getAttribute('GleissystemID');
		let TrackSystemNumber = Gleissystem.getAttribute('TrackSystemNumber');
		if (GleissystemID && !TrackSystemNumber) {
			TrackSystemNumber = GleissystemID;
		} else if (!GleissystemID && TrackSystemNumber) {
			GleissystemID = TrackSystemNumber;
		}
		
		// Store relationship between GleissystemID and TrackSystemNumber 
		if (!global.TrackSystem) {
			global.TrackSystem = {};
		}
		if (!global.TrackSystem[GleissystemID]) {
			global.TrackSystem[GleissystemID] = TrackSystemNumber;
		}

		global.Gleissysteme[GleissystemID] = {};
		activeTracks[GleissystemID] = [];
		trackSignals[GleissystemID] = [];

		const Gleise 			= Gleissystem.getElementsByTagName("Gleis");
		for (const Gleis of Gleise) {
			const GleisID 	= Gleis.getAttribute("GleisID");
			Gleis.GleissystemID = GleissystemID;
			global.Gleissysteme[GleissystemID][GleisID] = Gleis;

			// Weichen
			const WeicheID = Number(Gleis.getAttribute("Key_Id"));
			if (WeicheID > 0) {
				Gleis.WeicheID = WeicheID;
				global.Weichen[WeicheID] = Gleis;
				//console.log("global.Weichen["+WeicheID+"] on "+GleissystemID+"-"+GleisID)
				
				// Schaltverbindung zu einem anderen Signal bzw. Weiche
				collectCouplings( Gleis, WeicheID );				
			}

			// Weichen mit KontaktZiel
			//const KontaktZielEntry 	= Gleis.getElementsByTagName("KontaktZiel")[0]; // Die könnte auch Kontaktziele von Meldungen finden
			const KontaktZielEntry = Array.from(Gleis.children).find(el => el.tagName === "KontaktZiel");
			if (KontaktZielEntry) {
				const KontaktZiel 	= KontaktZielEntry.textContent;
				if (KontaktZiel != "" && KontaktZiel != 0) {
					global.KontaktZiele[KontaktZiel] = {
						Typ				: _('Weiche'),
						Code				: 'W',	// 1st letter is used to show an svg text.
						ID				: WeicheID,
						GleissystemID 	: GleissystemID,
						GleisID			: GleisID,
					};
				}
			}

			// Collect Meldungen to be able to create individual symbols for Vor- and Hauptsignal
			for (const Meldung of Gleis.getElementsByTagName("Meldung")) {
				const SignalID = Number(Meldung.getAttribute("Key_Id"));
				Meldung.GleissystemID = GleissystemID;
				Meldung.GleisID = GleisID;
				global.Meldungen[SignalID] = Meldung;

				if (!trackSignals[GleissystemID][GleisID]) {
					 trackSignals[GleissystemID][GleisID] = [];
				}
				trackSignals[GleissystemID][GleisID].push({Meldung : Meldung});
				
				// Signale mit wartenden Zügen 
				for (const Wartender of Meldung.getElementsByTagName('Wartender')) {
					const ZugID 		= Wartender.getAttribute('zugverbandID');
					const targetSpeed 	= +Wartender.getAttribute('sollgeschwindigkeit') * 3600 / 1000; // km/h

					global.waitingTrains[ZugID] = {
						SignalID		: SignalID,
						targetSpeed		: targetSpeed,
					};					
				}
				
				// Signale mit KontaktZiel
				const KontaktZielEntry 	= Meldung.getElementsByTagName("KontaktZiel")[0];
				if (KontaktZielEntry) {
					const KontaktZiel 	= KontaktZielEntry.textContent;
					if (KontaktZiel != null && KontaktZiel != 0) {
						global.KontaktZiele[KontaktZiel] = {
							Typ 			: _('Signal'),
						Code				: 'S',	// 1st letter is used to show an svg text.
							ID				: SignalID,
							GleissystemID 	: GleissystemID,
							GleisID			: GleisID,
						};
					}
				}
				
				// Signale für Fahrstraßen: Suche Start-Signale zu Ende-Signalen 
				const Routes		= Meldung.getAttribute('Routes');
				const RouteList	 	= Meldung.getElementsByTagName("Route");
				let RoutesText = '';
				for (const Route of RouteList) {
					const Target 	= Route.getAttribute('Target');
					const Color 	= Route.getAttribute('Color');
					
					if (!global.EndRouteSignals[Target]) {
						global.EndRouteSignals[Target] = [];
					}
					global.EndRouteSignals[Target].push({
							GleissystemID : GleissystemID,
							StartSignal : SignalID,
							Color : Color,
							Route : Route,
					});
				}

				// Schaltverbindung zu einem anderen Signal bzw. Weiche
				const Signal = Meldung.getElementsByTagName('Signal')[0];
				collectCouplings( Signal, SignalID );
			}

			// Signale, die nur zur Anzeige dienen und keine Züge beeinflussen sollen werden gerne auf "inaktive" Gleise gesetzt.
			// Alternativ könnte man nicht-verbundene Einzelgleise als "inaktive" interpretieren.
			// A track having a Signal is an "active" track
			/*
			for (const Meldung of Gleis.getElementsByTagName("Meldung")) {
				if (!activeTracks[GleissystemID].includes(GleisID)) {
					 activeTracks[GleissystemID].push(GleisID);
				}
			}
			*/

			// Kontakte
			// A track having a Kontakt is an "active" track
			for (const Kontakt of Gleis.getElementsByTagName("Kontakt")) {
				if (!activeTracks[GleissystemID].includes(GleisID)) {
					 activeTracks[GleissystemID].push(GleisID);
				}
			}
		} // Gleise

		// Gleisverbindungen
		trackConnections[GleissystemID] = [];
		const Gleisverbindungen = Gleissystem.getElementsByTagName("Gleisverbindung");
		for (const Gleisverbindung of Gleisverbindungen) {
			// <Gleisverbindung GleisID1="1" Anschluss1="Anfang" GleisID2="5" Anschluss2="Anfang" Flags="1"/>
			// Verwendung:
			// prevGleisID   		= trackConnections[GleissystemID][GleisID].Anfang.GleisID
			// prevGleisAnschluss 	= trackConnections[GleissystemID][GleisID].Anfang.Anschluss
			// nextGleisID   		= trackConnections[GleissystemID][GleisID].Ende.GleisID
			// nextGleisAnschluss	= trackConnections[GleissystemID][GleisID].Ende.Anschluss
			// ..
			const GleisID1 		= Gleisverbindung.getAttribute("GleisID1");
			const Anschluss1 	= Gleisverbindung.getAttribute("Anschluss1");
			const GleisID2 		= Gleisverbindung.getAttribute("GleisID2");
			const Anschluss2 	= Gleisverbindung.getAttribute("Anschluss2");
			const Flags 		= Gleisverbindung.getAttribute("Flags");		// undefined: normal connection, 1: virtual connection

			// Store relation GleisID1 -> GleisID2
			if (!trackConnections[GleissystemID][GleisID1]) {
				 trackConnections[GleissystemID][GleisID1] = {};
			}
			trackConnections[GleissystemID][GleisID1][Anschluss1] = { GleisID : GleisID2, Anschluss : Anschluss2, Flags : Flags, Direction : 1 };

			// Store relation GleisID2 -> GleisID1
			if (!trackConnections[GleissystemID][GleisID2]) {
				 trackConnections[GleissystemID][GleisID2] = {};
			}
			trackConnections[GleissystemID][GleisID2][Anschluss2] = { GleisID : GleisID1, Anschluss : Anschluss1, Flags : Flags, Direction : 2 };
		}
	}
	// Now we are able to show connections on detail popups
	global.trackConnections = trackConnections;

	// Meldungen analysieren um Fahrstraßen sowie Vor- zu Hauptsignele zu separieren
	for (const GleissystemID in trackSignals) {
		for (const GleisID in trackSignals[GleissystemID]) {
			for (const entry of trackSignals[GleissystemID][GleisID]) {
				if (entry.signalType) { continue; } // we have added the entry during the loop, however, for..of does not process new entries anyway

				let currentGleisID 	= GleisID;	// Let's start with the current track

				const SignalID		= entry.Meldung.getAttribute("Key_Id");
				let   Position		= entry.Meldung.getAttribute("Position") / 100; 	// Wert zwischen 0 und Gleis.Laenge
				let   ParaOderAnti 	= entry.Meldung.getAttribute("ParaOderAnti"); 	//Gleisrichtung: 0 = Ende -> Anfang, 1 = Anfang -> Ende
				const Distanz		= entry.Meldung.getElementsByTagName("Signal")[0].getAttribute("wirkungsdistanz") / 100; // immmer positiv

				const Name 			= entry.Meldung.getAttribute("name"); // Fahrstraßen: name = "system\Route_SignalS.3ds" bzw. "system\Route_SignalZ.3ds"
				const Routes		= entry.Meldung.getAttribute("Routes"); // Fahrstraßen Start: Routes > 0

				// Store signal data
				entry.SignalID		= SignalID;
				entry.Position 		= Position;
				entry.ParaOderAnti 	= ParaOderAnti;

				// Für Fahrstraßen gilt: name="system\Route_SignalS.3ds" für den Start bzw. name="system\Route_SignalZ.3ds" für das Ziel
				// (Außerdem besitzt die Meldung zu Beginn einer Fahrstraße weitere Elemente <Route> usw.
				if (Name === "system\\Route_SignalS.3ds") {
					entry.signalType 	= "FStart";					// Fahrstraße Start
					continue;
				} else if (Name === "system\\Route_SignalZ.3ds") {
					entry.signalType 	= "FZiel";					// Fahrstraße Ziel
					continue;
				} else if (Distanz === 0) {
					entry.signalType 	= "single";					// Einzel-Signal
					continue;
				}

				// Store Vorsignal
				entry.signalType 	= "pre";						// Vorsignal

				// Now we can follow the tracks to find the position of the main signal on the track
				let Gleis 	= global.Gleissysteme[GleissystemID][currentGleisID];	// current track
				let { near, far, Laenge } = getGleisInterval(Gleis);

				// Do we find the main signal on the same track?
				Position = Position + Distanz * (ParaOderAnti == 1 ? 1 : -1) * (near > far ? -1 : 1);	//###
				if (Position >= 0 && Position <= Laenge) {
					// The main signal is on the same track
					trackSignals[GleissystemID][currentGleisID].push({
						Meldung 		: entry.Meldung,
						SignalID		: SignalID,
						signalType 		: "main",
						Position 		: Position,
						ParaOderAnti	: ParaOderAnti,
					});
					continue;
				}

				if (Position > Laenge) { 					// look forward
					Position	= Position - Laenge;		// remaining position on next track
				} else {									// look backward
					Position	= -Position;				// remaining position on previous track
				}

				// The main signal is on a different track
				while (Position > 0) {
					let nextGleisID, Anschluss;

					if (!trackConnections[GleissystemID][currentGleisID]) { // should not happen
						console.log(`Error: Signal ${SignalID} no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}`);
						break;
					}

					if (ParaOderAnti == 1) { // look forward

						if (trackConnections[GleissystemID][currentGleisID].Ende) { 
							nextGleisID		= trackConnections[GleissystemID][currentGleisID].Ende.GleisID;
							Anschluss		= trackConnections[GleissystemID][currentGleisID].Ende.Anschluss;
							ParaOderAnti	= (Anschluss === "Anfang" ? ParaOderAnti : 1-ParaOderAnti);
						
						} else if (trackConnections[GleissystemID][currentGleisID].EndeAbzweig) {  // should not happen
							console.log(`Error: no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}.Ende`);
							nextGleisID		= trackConnections[GleissystemID][currentGleisID].EndeAbzweig.GleisID;
							Anschluss		= trackConnections[GleissystemID][currentGleisID].EndeAbzweig.Anschluss;
							ParaOderAnti	= (Anschluss === "Anfang" ? ParaOderAnti : 1-ParaOderAnti);
						
						} else {
							console.log(`Error: no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}.EndeAbzweig`);
							break;
						}

					} else {				// look backward

						if (!trackConnections[GleissystemID][currentGleisID].Anfang) { // should not happen
							console.log(`Error: Signal ${SignalID} no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}.Anfang`);
							break;
						}

						nextGleisID		= trackConnections[GleissystemID][currentGleisID].Anfang.GleisID;
						Anschluss		= trackConnections[GleissystemID][currentGleisID].Anfang.Anschluss;
						ParaOderAnti	= (Anschluss !== "Anfang" ? ParaOderAnti : 1-ParaOderAnti);
					}

					Gleis 	= global.Gleissysteme[GleissystemID][nextGleisID];
					if (!Gleis) { // should not happen
						console.log(`Error: Signal ${SignalID} no track for ${GleissystemID}-${nextGleisID}`);
						break;
					}

					let { near, far, Laenge } = getGleisInterval(Gleis);

					if (Position <= Laenge) {
						// The main signal is on the this track
						if (!trackSignals[GleissystemID][nextGleisID]) {
							 trackSignals[GleissystemID][nextGleisID] = [];
						}
						trackSignals[GleissystemID][nextGleisID].push({
							Meldung 		: entry.Meldung,
							SignalID		: SignalID,
							signalType 		: "main",
							Position 		: (Anschluss === "Anfang" ? Position : Laenge - Position),
							ParaOderAnti	: ParaOderAnti,
						});
						break;

					} else {
						// keep going
						currentGleisID 	= nextGleisID;
						Position 		= Position - Laenge;
					}
				} // while searching for tracks

				// Now we can follow the tracks to find the position of the stop point on the track (duplicate code as above)
				const StopAt 	= entry.Meldung.getElementsByTagName("Signal")[0].getAttribute("StopAt") / 100; // immmer positiv
				if (StopAt > 0) {
					let currentGleisID 	= GleisID;	// Let's start with the current track
					let Position		= entry.Meldung.getAttribute("Position") / 100; 	// Wert zwischen 0 und Gleis.Laenge
					let ParaOderAnti 	= entry.Meldung.getAttribute("ParaOderAnti"); 	//Gleisrichtung: 0 = Ende -> Anfang, 1 = Anfang -> Ende
					let Gleis 	= global.Gleissysteme[GleissystemID][currentGleisID];	// current track
					let { near, far, Laenge } = getGleisInterval(Gleis);
					// Do we find the stop position on the same track?
					Position = Position + (Distanz - StopAt) * (ParaOderAnti == 1 ? 1 : -1) * (near > far ? -1 : 1);	//###
					if (Position >= 0 && Position <= Laenge) {
						// The stop point is on the same track
						trackSignals[GleissystemID][currentGleisID].push({
							Meldung 		: entry.Meldung,
							SignalID		: SignalID,
							signalType 		: "StopAt",
							Position 		: Position,
							ParaOderAnti	: ParaOderAnti,
						});
						continue;
					}

					if (Position > Laenge) { 					// look forward
						Position	= Position - Laenge;		// remaining position on next track
					} else {									// look backward
						Position	= -Position;				// remaining position on previous track
					}

					// The stop point is on a different track
					while (Position > 0) {
						let nextGleisID, Anschluss;

						if (!trackConnections[GleissystemID][currentGleisID]) { // should not happen
							console.log(`Error: Signal ${SignalID} no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}`);
							break;
						}

						if (ParaOderAnti == 1) { // look forward

							if (trackConnections[GleissystemID][currentGleisID].Ende) { 
								nextGleisID		= trackConnections[GleissystemID][currentGleisID].Ende.GleisID;
								Anschluss		= trackConnections[GleissystemID][currentGleisID].Ende.Anschluss;
								ParaOderAnti	= (Anschluss === "Anfang" ? ParaOderAnti : 1-ParaOderAnti);
							
							} else if (trackConnections[GleissystemID][currentGleisID].EndeAbzweig) {  // should not happen
								console.log(`Error: no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}.Ende`);
								nextGleisID		= trackConnections[GleissystemID][currentGleisID].EndeAbzweig.GleisID;
								Anschluss		= trackConnections[GleissystemID][currentGleisID].EndeAbzweig.Anschluss;
								ParaOderAnti	= (Anschluss === "Anfang" ? ParaOderAnti : 1-ParaOderAnti);
							
							} else {
								console.log(`Error: no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}.EndeAbzweig`);
								break;
							}

						} else {				// look backward

							if (!trackConnections[GleissystemID][currentGleisID].Anfang) { // should not happen
								console.log(`Error: Signal ${SignalID} no connected track for ${TrackSystemText(GleissystemID)} ${currentGleisID}.Anfang`);
								break;
							}

							nextGleisID		= trackConnections[GleissystemID][currentGleisID].Anfang.GleisID;
							Anschluss		= trackConnections[GleissystemID][currentGleisID].Anfang.Anschluss;
							ParaOderAnti	= (Anschluss !== "Anfang" ? ParaOderAnti : 1-ParaOderAnti);
						}

						Gleis 	= global.Gleissysteme[GleissystemID][nextGleisID];
						if (!Gleis) { // should not happen
							console.log(`Error: Signal ${SignalID} no track for ${GleissystemID}-${nextGleisID}`);
							break;
						}

						let { near, far, Laenge } = getGleisInterval(Gleis);

						if (Position <= Laenge) {
							// The main signal is on the this track
							if (!trackSignals[GleissystemID][nextGleisID]) {
								 trackSignals[GleissystemID][nextGleisID] = [];
							}
							trackSignals[GleissystemID][nextGleisID].push({
								Meldung 		: entry.Meldung,
								SignalID		: SignalID,
								signalType 		: "StopAt",
								Position 		: (Anschluss === "Anfang" ? Position : Laenge - Position),
								ParaOderAnti	: ParaOderAnti,
							});
							break;

						} else {
							// keep going
							currentGleisID 	= nextGleisID;
							Position 		= Position - Laenge;
						}
					} // while searching for tracks
				}


			} // Signale
		} // Gleise
	} // Gleissysteme

	// Now we are able to show all signals in the svg-output
	global.trackSignals = trackSignals;

	// Analyse Fuhrpark to identify "active" tracks
	const Fuhrpark = sutrackp.getElementsByTagName("Fuhrpark")[0];
	if (Fuhrpark) {
	for (const Zugverband of Fuhrpark.getElementsByTagName("Zugverband")) {
		// <Gleisort gleissystemID="3" gleisID="41" parameter="1177.944" ausrichtung="0"/>
		const Gleisort		= Zugverband.getElementsByTagName("Gleisort")[0];
		const GleissystemID	= Gleisort.getAttribute("gleissystemID");
		const GleisID		= Gleisort.getAttribute("gleisID");

		// A track with a Zugverband is an "active" track
		if (!activeTracks[GleissystemID].includes(GleisID)) {
			 activeTracks[GleissystemID].push(GleisID);
		}
		
		// Store Zugverband (used by blockControl)
		if (!global.Zugverband[GleissystemID]) {
			global.Zugverband[GleissystemID] = {};
		}
		const trainName		= Zugverband.getAttribute("name");

		// Current speed
		const currentSpeed 	= +Zugverband.getAttribute('Geschwindigkeit') * 3600 / 1000;		// km/h
		const lastDir 		= Zugverband.getAttribute('LastDir');	// if currentSpeed is zero: currentSpeed = (lastDir == 1 ? '+0' : '-0')

		// Target speed as long as the train is not influenced by a signal
		let targetSpeed 	= +Zugverband.getAttribute('sollgeschwindigkeit') * 3600 / 1000;	// km/h

		// Target speed for trains which are influenced by a signal
		// <Signal>...<Wartender fuhrparkID="1" zugverbandID="7" sollgeschwindigkeit="11.11111"/>
		const ZugID			= Zugverband.getAttribute('ZugID');
		const waitingTrain 	= global.waitingTrains[ZugID];
		if (waitingTrain && waitingTrain.speed != 0) {
			targetSpeed = waitingTrain.targetSpeed;
		}
		
		const depot			= Zugverband.getAttribute("Hide");

		const position		= Gleisort.getAttribute("parameter") / 100; 	// m
		const direction		= Gleisort.getAttribute("ausrichtung");

		const routeID		= Zugverband.getAttribute("Route");
		const routeName		= global.Routen[routeID] || "";

		// Rollmaterial: vorderer und hinterer Überhang (in der Datei in cm, hier in m)
		// clsid	Legt die Art des Rollmaterials fest
		//   16095510-0EAB-46AF-B294-CBB6D3516007	angetrieben
		//   7B0D0A3A-0882-44D6-B3E7-45D933A70F74	nicht angetrieben
		// vUeberhang	Vorderer Überhang in cm (ausgehend vom vorderen Radsatz)
		// hUeberhang	Hinterer Überhang in cm (ausgehend ebenfalls vom vorderen Radsatz)
		/* Beispiel
		<Rollmaterial clsid="16095510-0EAB-46AF-B294-CBB6D3516007" ausrichtung="1" bremsung="0" Flags="12" Masse="87000" Reibung="25" maxbremsung="150" vUeberhang="979" hUeberhang="979" TotalDist="0" name="Lokomotion 189.917 EpVI" typ="SCHIENE\LOKOMOTIVEN\LM_189-917_VI_SB3.3dm" LightStat="-218234880" Hook="0" Active="1" RollIdx="34" Favorite="0" ActCabin="1" ImmoIdx="0" zuStellung="0" Wartender="0" LockEd="0">
		
		Anlage:
		EEP15_Bitte-Einsteigen Export.anl3
		
		#Zug Rheingold, Länge: 113.6m, Fahrzeuge: 6
		<Zugverband ZugID="30" Geschwindigkeit="2.427589" autopilot="1" sollgeschwindigkeit="0" sollgeschwindigkeit_kp="0" wirkungsdistanz="2207.184" kupplungvorn="2" kupplunghinten="2" Route="0" LastDir="1" StepStop="-1" clsid="6FE10FB0-A974-4620-B7A5-D7D047A7903B" name="#Zug Rheingold" LightStat="0" Hide="-1" Favorite="1">

		Schlepptenderlok, Länge: 13.69m, Ausrichtung: vorwärts
		<Rollmaterial clsid="16095510-0EAB-46AF-B294-CBB6D3516007" ausrichtung="1" bremsung="0.8604586" Flags="12" Masse="85000" Reibung="15" maxbremsung="97" vUeberhang="705" hUeberhang="663.793" TotalDist="4407" name="Bayerische S 3/6 (BR 18 478)" typ="SCHIENE\LOKOMOTIVEN\BAYERISCHES3-6_SM2.3dm" LightStat="-214040512" Hook="0" Active="1" RollIdx="64" Favorite="0" ImmoIdx="0" zuStellung="0" Wartender="0" LockEd="0">
 
		Tender, Länge: 9.21m, Ausrichtung: vorwärts
		<Rollmaterial clsid="7B0D0A3A-0882-44D6-B3E7-45D933A70F74" ausrichtung="1" bremsung="0.8604585" Flags="12" Masse="63000" Reibung="8" maxbremsung="56" vUeberhang="419.81" hUeberhang="501" TotalDist="4392" name="Bayerische S 3/6 - Tender (BR 18 478)" typ="SCHIENE\TENDER\BAYERISCHES3-6_TNDR_SM2.3dm" LightStat="-214040512" Hook="0" Active="1" RollIdx="65" Favorite="0" ImmoIdx="0" zuStellung="0" Wartender="0" LockEd="0">

		Personenwaggon, Länge: 23.65m, Ausrichtung: vorwärts
		<Rollmaterial clsid="7B0D0A3A-0882-44D6-B3E7-45D933A70F74" ausrichtung="1" bremsung="0.8604585" Flags="12" Masse="63000" Reibung="8" maxbremsung="56" vUeberhang="419.81" hUeberhang="501" TotalDist="4392" name="Bayerische S 3/6 - Tender (BR 18 478)" typ="SCHIENE\TENDER\BAYERISCHES3-6_TNDR_SM2.3dm" LightStat="-214040512" Hook="0" Active="1" RollIdx="65" Favorite="0" ImmoIdx="0" zuStellung="0" Wartender="0" LockEd="0">

		*/
		for (const Rollmaterial of Zugverband.getElementsByTagName("Rollmaterial")) {
			const rName = Rollmaterial.getAttribute("name");
			if (rName) {
				global.Rollmaterial[rName] = {
					angetrieben : Rollmaterial.getAttribute("clsid") == "16095510-0EAB-46AF-B294-CBB6D3516007",
					vUeberhang : (+Rollmaterial.getAttribute("vUeberhang") || 0) / 100,
					hUeberhang : (+Rollmaterial.getAttribute("hUeberhang") || 0) / 100,
				};
			}
		}

		global.Zugverband[GleissystemID][trainName] = {
			// train data
			routeName		: routeName,

			currentSpeed	: currentSpeed,
			lastDir			: lastDir,		

			targetSpeed		: targetSpeed,

			// position of train
			GleisID		: GleisID,
			position	: position,
			direction	: direction,
			depot		: depot,
		}
		
	}
	}

	// Lade Kollektor-Einträge, die Gleise miteinander verbinden, z.B. bei bestimmten Drehscheiben
	/* Beispiel:
	<Kollektor id="8">
		<Gleis gleisID="171" gleissystemID="1"/>
		<Gleis gleisID="172" gleissystemID="1"/>
		<Gleis gleisID="173" gleissystemID="1"/>
		...
	</Kollektor>
	*/
	const Gleisobjekte = {};
	let countGleisobjekte = 0;
	const KollektorTracks = {};
	for (const Kollektor of sutrackp.getElementsByTagName("Kollektor")) {
		const KollektorID = Kollektor.getAttribute("id");

		const Dreibein 	= Kollektor.getElementsByTagName("Dreibein")[0];
		const Vektor 	= Dreibein.getElementsByTagName("Vektor")[0];
		const PosX 		= +Vektor.getAttribute("x") / 100;
		const PosY 		= +Vektor.getAttribute("y") / 100;
		const PosZ 		= +Vektor.getAttribute("z") / 100;

		const Kollektors = Kollektor.getElementsByTagName("Gleis");

		for (const Gleis of Kollektors) {
			const GleissystemID = Gleis.getAttribute("gleissystemID");
			const GleisID 		= Gleis.getAttribute("gleisID");

			// First entry of Kollektor
			if (!Gleisobjekte[KollektorID]) {
				countGleisobjekte += 1;
				Gleisobjekte[KollektorID] = {
					GleissystemID 	: GleissystemID,
					PosX 			: PosX,
					PosY 			: PosY,
					PosZ 			: PosZ,
					Gleise 			: [],
				};
			}
			// Store Gleis of Kollektor
			Gleisobjekte[KollektorID].Gleise.push({GleissystemID : GleissystemID, GleisID : GleisID, });

			// connected tracks
			// First entry of Gleissystem
			if (!KollektorTracks[GleissystemID]) {
				KollektorTracks[GleissystemID] = {};
			}
			// New Gleis (we assume that a Gleis is part of exactly 1 Gleisobjekt only)
			KollektorTracks[GleissystemID][GleisID] = [];
			KollektorTracks[GleissystemID][GleisID].KollektorID = KollektorID;
			// connected tracks
			for (const Gleis of Kollektor.getElementsByTagName("Gleis")) {
				const GleissystemID2 = Gleis.getAttribute("gleissystemID");
				const GleisID2 		 = Gleis.getAttribute("gleisID");
				if (GleisID !== GleisID2) {
					KollektorTracks[GleissystemID][GleisID].push({
						GleissystemID : GleissystemID2,
						GleisID : GleisID2,
					});
				}
			}
		}
	}

	// Load Immobilien if there exist Gleisobjekte
	if (countGleisobjekte > 0) { //# How to identity empty objects?
		for (const Gebaeudesammlung of sutrackp.getElementsByTagName("Gebaeudesammlung")) {
			const GebaudesammlungID = Gebaeudesammlung.getAttribute("GebaudesammlungID");
			for (const Immobile of Gebaeudesammlung.getElementsByTagName("Immobile")) {
				const KollektorID 	= Immobile.getAttribute("kollektorID");
				if (KollektorID) {
					const ImmoIdx 	= Immobile.getAttribute("ImmoIdx");
					const gsbname 	= Immobile.getAttribute("gsbname");

					// Take care of inconsistend data: Immobilie without Kollektor
					if (!Gleisobjekte[KollektorID]) {
						Gleisobjekte[KollektorID] = { Error : 'missing Collector', };
					}

					Gleisobjekte[KollektorID].GebaudesammlungID	= GebaudesammlungID;
					Gleisobjekte[KollektorID].ImmoIdx 			= ImmoIdx;
					Gleisobjekte[KollektorID].gsbname 			= gsbname;
				}
			}
		}
	}
	global.Gleisobjekte = Gleisobjekte;
	global.KollektorTracks = KollektorTracks;

	// Add connected tracks as "active" tracks because they can be reached by trains as well
	for (const GleissystemID in activeTracks) {
		const usedGleiseArray = activeTracks[GleissystemID];

		// Extend "active" tracks
		for (let i = 0; i < usedGleiseArray.length; i++){ // old-fashioned for statement because we need to extend the array within the loop
			const GleisID1 = usedGleiseArray[i];

			// Get connected tracks of "active" tracks
			const connectedTracks = trackConnections[GleissystemID][GleisID1];
			if (connectedTracks) {
				for (const Anschluss in connectedTracks) {
					// Add new connected tracks
					// These tracks will be processed, too
					if (!activeTracks[GleissystemID].includes(connectedTracks[Anschluss].GleisID)) {
						 activeTracks[GleissystemID].push(connectedTracks[Anschluss].GleisID);
					}
				}
			}

			// Get related tracks from Kollektors
			if (KollektorTracks[GleissystemID]) {
				const collectedTracks = KollektorTracks[GleissystemID][GleisID1];
				if (collectedTracks) {
					for (const Gleis of collectedTracks) {
						// Add new connected tracks
						// These tracks will be processed, too
						if (!activeTracks[Gleis.GleissystemID].includes(Gleis.GleisID)) {
							 activeTracks[Gleis.GleissystemID].push(Gleis.GleisID);
						}
					}
				}
			}


		}
	}
	// Now we are able to mark all "active" tracks in the svg-output
	global.activeTracks = activeTracks;

	return Gleissysteme;
} // end function prepareGleissysteme


// Claude AI: near/far/Laenge werden pro Gleis an mehreren Stellen erneut aus dem DOM gelesen (Haupt-Rendering, Vorsignal->Hauptsignal-Suche, StopAt-Suche). Bei jedem Zugriff wird erneut 
// getElementsByTagName("Interval") bzw. "Charakteristik" durchsucht. Für große Anlagen mit tausenden Gleisen und langen Signal-Suchketten summiert sich das spürbar.
// Fix: Ergebnis einmalig am Gleis-Objekt selbst zwischenspeichern (DOM-Elemente erlauben beliebige zusätzliche Eigenschaften, wie es der Code an anderer Stelle bereits mit 
// Gleis.CurveType, Gleis.mPos usw. tut).
function getGleisInterval(Gleis) {
	if (Gleis.near === undefined) {	// Erstzugriff: einmalig berechnen und cachen
		if (global.EEPversion && global.EEPversion >= 16) { /* EEP 16 */
			const Interval = Gleis.getElementsByTagName("Interval")[0];
			Gleis.near = +Interval.getAttribute("near");
			Gleis.far  = +Interval.getAttribute("far");
		} else {  /* EEP 15 */
			const Charakteristik = Gleis.getElementsByTagName("Charakteristik")[0];
			Gleis.near = 0;
			Gleis.far  = +Charakteristik.getAttribute("Laenge") / 100;
		}
		Gleis.Laenge = Math.abs(Gleis.far - Gleis.near);
	}
	return { near: Gleis.near, far: Gleis.far, Laenge: Gleis.Laenge };
}
// Schaltverbindungen zwischen Signalen und/oder Weichen
	function collectCouplings( Object, SourceID ) {
		const TargetID = +Object.getAttribute('SignalData'); // Schaltverbindung zu einem anderen Signal bzw. Weiche
		if (TargetID) {
			const Connections = [];
			// gekoppelte Stellungen für Signale
			const Count = Object.getAttribute('Count');		// Anzahl der Attribute Fn01, Fn02,...
			if (Count) {
				for (let i = 1; i <= Count; i++) {
					const SourcePos = i;
					const TargetPos = Object.getAttribute('Fn' + i.toString().padStart(2, '0'));	// gekoppelte Stellung
					if (TargetPos && TargetPos != 0) {
						Connections.push({ SourcePos : SourcePos, TargetPos : +TargetPos, });
					}
				}
			}
			// Gekoppelte Stellungen für Weichen 
			for (let i = 1; i <= 5; i++) { // Attribute NextSigFn1 (gerade), NextSigFn2 (Abzweig), NextSigFn3, NextSigFn4, NextSigFn5
				const SourcePos = i;
				const TargetPos = Object.getAttribute('NextSigFn' + i);	// gekoppelte Stellung
				if (TargetPos && TargetPos != 0) {
					Connections.push({ SourcePos : SourcePos, TargetPos : +TargetPos, });
				}
			}			

			if (!global.Couplings[SourceID]) {
				global.Couplings[SourceID] = [];
			}
			global.Couplings[SourceID].push({ TargetID : TargetID, Connections : Connections, });

			if (!global.Couplings[TargetID]) {
				global.Couplings[TargetID] = [];
			}
			global.Couplings[TargetID].push({ SourceID : SourceID, Connections : Connections, });
		}
	} // function collectCouplings

	function getCouplingText( SourceID ) {
		let Text = '';
		for (const i in global.Couplings[SourceID]) {
			//if (Text) {
					Text += '<br>';
			//} else {
			//	Text = '';
			//}

			const Coupling = global.Couplings[SourceID][i]
			let ID;
			let GleissystemID;
			let GleisID;
			if (Coupling.TargetID) { // Signal/Weiche schaltet ein anderes Signal/Weiche
				ID = Coupling.TargetID;
				Text += _('Schaltet') + ' ';
			}	
			if (Coupling.SourceID) { // Signal/Weiche wird von einem anderen Signal/Weiche geschaltet
				ID = Coupling.SourceID;
				Text += _('Wird geschaltet von') + ' ';			
			}
			const Weiche = global.Weichen[ID];
			if (Weiche) {
				Text += _('Weiche') + ' ' 
					+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Weiche.mEnd}]);">${ID}<\/a>`
			}
			const Meldung = global.Meldungen[ID];
			if (Meldung) {
				Text += _('Signal') + ' ' 
					+ `<a href="javascript:void(0);" onclick="javascript:global.SvgPanZoom.centerPosition([${Meldung.mPos}]);">${ID}<\/a>` 
			}
			Text += ' (';
			for (const i in Coupling.Connections) {
				const Connection = Coupling.Connections[i];
				if ( i > 0 ) {
					Text += ', ';
				} 
				//Text += Connection.SourcePos + (Connection.TargetPos > 0 ? '-' + Connection.TargetPos : '');
				Text += Connection.SourcePos + '-' + Connection.TargetPos;
			}
			Text += ')';
		}
		return Text;
	} // function getCouplingText	

})(this); // end module
