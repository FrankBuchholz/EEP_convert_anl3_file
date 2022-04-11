// Create data for Lua module "blockControl"
"use strict";
/* Interface
public api:
	calculate

external api:
	BroadcastChannel("blockControl")
*/
(function (api) {
// public api
const blockControl = {};
api.blockControl = blockControl;

/*
Route example short form:
  { 8, turn={2,1}, 10 },
Extended form:
  { 8, turn={
    -- Gleis 1 forward
	-- Gleis 12 forward
    -- Gleis 7 forward	
    2,1,
	-- Gleis 10 forward
	-- Gleis 9 forward
	-- Gleis 8 forward
  }, 10 },

Pseudo code:

for all signals
	store start signal
	track = start track
	direction = start direction
	store track and direction
	followPath(track, direction)
	
with

followPath(track)

	check cycle considering the direction
		return
		
	if new signal is found
		store new signal
		output
		return

	if no connection
		reflect direction
		store track and direction
		followPath(track, direction)
		
	else	
		for all connections
			store turnout
			next track = connected track
			store next track
			followPath(next track, direction)

*/

// Track direction: forward = 1 = Anfang -> Ende, backward = 0 = Ende -> Anfang
const forward 	= 1; 	
const backward 	= 0;

let maxTurnouts = 10; 	// Max count of turnouts between blocks
let maxTracks = 100;	// Max count of tracks between block signals
let message = "";		// Message will be send to the caller

// Two way blocks
// Start routes from every signal and follow the tracks backwards to the next signal on the other side of the track.
// Stop routes at turnouts.
function followTwoWayBlocks(twoWayBlocks, startSignalID, GleissystemID, GleisID, Anschluss) {
	for (let i = maxTracks; i>=0; i--) { // Simplified cycle prevention
		if (i == 0) {
			message = "Incomplete result: Max. count of tracks between potential two way block signals reached";
			console.log("followTwoWayBlocks: cycle prevention on max count of tracks");
		}

		const nextAnschluss = (Anschluss == "Anfang" ? "Ende" : "Anfang");
		const connection = global.trackConnections[GleissystemID][GleisID][nextAnschluss];
		if (!connection) { return; } // stop at dead end

		GleisID = connection.GleisID;
		Anschluss = connection.Anschluss;

		// Get turnout
		const WeicheID = global.Gleissysteme[GleissystemID][GleisID].WeicheID;

		if (WeicheID && Anschluss != "Anfang") { return; } // direction backward: stop at turnout

		// check if next signal is reached
		if (global.trackSignals[GleissystemID][GleisID]) {
			for (const entry of global.trackSignals[GleissystemID][GleisID]) {
				const SignalID 		= +entry.SignalID;
				const signalType	= entry.signalType;		// Signal type: main, pre, FStart, FZiel
				const ParaOderAnti 	= +entry.ParaOderAnti; 	// Track direction: forward = 1 = Anfang -> Ende, backward = 0 = Ende -> Anfang

				if (signalType !== "main") { continue; } // wrong signal type
				
				if (SignalID === startSignalID) { return; } // stop at loop

				if (Anschluss == "Anfang" && ParaOderAnti != forward) { return; } // wrong side of the signal
				if (Anschluss != "Anfang" && ParaOderAnti == forward) { return; } // wrong side of the signal
				
				// omit duplicates
				for (const entry of twoWayBlocks) {
					if (entry[0] == startSignalID || entry[1] == startSignalID) {
						return;	// stop at duplicate entry
					}
				}

				if (startSignalID < SignalID) {
					twoWayBlocks.push([	startSignalID, SignalID ]); // Store two way blocks
				} else {
					twoWayBlocks.push([	SignalID, startSignalID ]); // Store two way blocks
				}
				
				return;
			}
		}
		
		if (WeicheID && Anschluss == "Anfang") { return; } // direction forward: stop at turnout
	}
}

// Routes
// Start routes from every signal and follow the tracks towards the next signal.
// Span routes on turnouts.
// Collect all turnouts on routes.
function followRoute(
	routes, 			// Result (array of all routes)
	startSignalID, 		// start signal of current route
	GleissystemID,
	GleisID, 			// current track
	Anschluss, 			// Anschluss on which track was entered
	length,				// count of turnouts in current route
	turns,				// array of tracks turns of current route
	stopAtTurnout		// signal on other side found: stop searching at next turnout
) {
	
	do { // unrestricted loop following tracks
	
	// Simplified cycle  prevention
	if (length > maxTurnouts) {	// Check count of turnouts between blocks
		message = "Incomplete result: Max. count of turnouts reached";
		console.log("followRoute: cycle prevention on max count of turnouts");
		return;
	}
	if (turns.length > maxTurnouts + maxTracks) {	// Check max count of tracks between block signals 
		message = "Incomplete result: Max. count of tracks between block signals reached";
		console.log("followRoute: cycle prevention on max count of tracks");
		return;
	}
	
	// Get turnout
	const WeicheID = global.Gleissysteme[GleissystemID][GleisID].WeicheID;
	
	// Check if we already have visited this turnout
	if (WeicheID) {
		for (const turn of turns) {
			if (turn.WeicheID && turn.WeicheID == WeicheID) {
				console.log("followRoute: cycle check for turnout " + WeicheID);
				return;
			}
		}

	}
	
	// Direction backward
	if (WeicheID && Anschluss != "Anfang") {
		// signal on other side found: stop searching at next turnout
		if (WeicheID && stopAtTurnout) {
			return;
		}

		// add turnout settings
		turns.push( { WeicheID : WeicheID, Anschluss : Anschluss } );
		length += 1;
	}
	
	// Store current track
	turns.push( { GleisID : GleisID, Anschluss : Anschluss } );

	// check if next signal is reached
	if (global.trackSignals[GleissystemID][GleisID]) {
		for (const entry of global.trackSignals[GleissystemID][GleisID]) {
			const SignalID 		= +entry.SignalID;
			const signalType	= entry.signalType;		// Signal type: main, pre, FStart, FZiel
			const ParaOderAnti 	= +entry.ParaOderAnti; 	// Track direction: forward = 1 = Anfang -> Ende, backward = 0 = Ende -> Anfang

			if (signalType !== "main") { continue; } // wrong signal type
			
			if (length === 0 && SignalID === startSignalID) { continue; } // ignore start signal once

			if (   (Anschluss == "Anfang" && ParaOderAnti != forward)	 // wrong side of the signal
				|| (Anschluss != "Anfang" && ParaOderAnti == forward) ) { 
				
				// Change mode: stop searching at netxt turnout
				stopAtTurnout = true;
				continue; 
			}

			routes.push({	// Store new route
				startSignalID 	: startSignalID,
				SignalID 		: SignalID,
				turns     		: turns,
			});
			return;
		}
	}
	
	// Spawn to next tracks
	let connectionFound = false;
	
	// Direction forward
	if (Anschluss == "Anfang") {
		// signal on other side found: stop searching at next turnout
		if (WeicheID && stopAtTurnout) {
			return;
		}
		const connections = global.trackConnections[GleissystemID][GleisID] || {};
		/* // This native approach of spawning could lead to resource depletion 
		for (const nextAnschluss in connections) { // Anfang, Ende, EndeAbzweig, EndeKoAbzweig
			if (nextAnschluss != "Anfang") {
				const connection = connections[nextAnschluss];
				connectionFound = true;

				// Copy turns before spawning
				//const newRoute = turns.map(a => ({...a}));
				const newRoute = turns.slice();

				// add turnout settings
				if (WeicheID) {
					newRoute.push({
						WeicheID 	: WeicheID,
						Anschluss 	: nextAnschluss,
					});
				}					
								
				followRoute(routes, startSignalID, GleissystemID, connection.GleisID, connection.Anschluss, length+(WeicheID ? 1 : 0), newRoute, stopAtTurnout);
			}
		}
		*/		
		// Spawn for "EndeAbzweig" and "EndeKoAbzweig", but follow "Ende"
		{ 
			const nextAnschluss = "EndeAbzweig";
			const connection = connections[nextAnschluss];
			if (connection) {
//console.log("Signal=",startSignalID," GleisID=",GleisID," WeicheID=",WeicheID," nextAnschluss=",nextAnschluss," length=",length)				
				connectionFound = true;

				// Copy turns before spawning
				//const newRoute = turns.map(a => ({...a}));
				const newRoute = turns.slice();

				// add turnout settings (always)
				if (WeicheID) {
					newRoute.push({
						WeicheID 	: WeicheID,
						Anschluss 	: nextAnschluss,
					});
				}					
								
				followRoute(routes, startSignalID, GleissystemID, connection.GleisID, connection.Anschluss, length+(WeicheID ? 1 : 0), newRoute, stopAtTurnout);
			}
		}
		{ 
			const nextAnschluss = "EndeKoAbzweig";
			const connection = connections[nextAnschluss];
			if (connection) {
//console.log("Signal=",startSignalID," GleisID=",GleisID," WeicheID=",WeicheID," nextAnschluss=",nextAnschluss," length=",length)				
				connectionFound = true;

				// Copy turns before spawning
				//const newRoute = turns.map(a => ({...a}));
				const newRoute = turns.slice();

				// add turnout settings (always)
				if (WeicheID) {
					newRoute.push({
						WeicheID 	: WeicheID,
						Anschluss 	: nextAnschluss,
					});
				}					
								
				followRoute(routes, startSignalID, GleissystemID, connection.GleisID, connection.Anschluss, length+(WeicheID ? 1 : 0), newRoute, stopAtTurnout);
			}
		}
		{ 
			const nextAnschluss = "Ende";
			const connection = connections[nextAnschluss];
			if (connection) {
//console.log("Signal=",startSignalID," GleisID=",GleisID," WeicheID=",WeicheID," nextAnschluss=",nextAnschluss," length=",length)				
				connectionFound = true;

				// Copy turns before spawning
				//const newRoute = turns.map(a => ({...a}));
//				const newRoute = turns.slice();

				// add turnout settings
				if (WeicheID) {
//					newRoute.push({
					turns.push({
						WeicheID 	: WeicheID,
						Anschluss 	: nextAnschluss,
					});
				}					
								
				//followRoute(routes, startSignalID, GleissystemID, connection.GleisID, connection.Anschluss, length+(WeicheID ? 1 : 0), newRoute, stopAtTurnout);
				// Update parameter for next loop iteration
				GleisID		= connection.GleisID;
				Anschluss 	= connection.Anschluss;
				length 		= length+(WeicheID ? 1 : 0);
//				turns 		= newRoute;
				/*
					routes, 			// Result (array of all routes)
					startSignalID, 		// start signal of current route
					GleissystemID,
					GleisID, 			// current track
					Anschluss, 			// Anschluss on which track was entered
					length,				// count of turnouts in current route
					turns,				// array of tracks turns of current route
					stopAtTurnout		// signal on other side found: stop searching at next turnout
				*/
				continue;
			}
		}

	}
	
	// Direction backward
	if (Anschluss != "Anfang") {
		const nextAnschluss = "Anfang";
		const connection = global.trackConnections[GleissystemID][GleisID][nextAnschluss];
		if (connection) { // next track found
			connectionFound = true;
			//followRoute(routes, startSignalID, GleissystemID, connection.GleisID, connection.Anschluss, length, turns, stopAtTurnout);
			// Update parameter for next loop iteration
			GleisID		= connection.GleisID;
			Anschluss 	= connection.Anschluss;
			/*
				routes, 			// Result (array of all routes)
				startSignalID, 		// start signal of current route
				GleissystemID,
				GleisID, 			// current track
				Anschluss, 			// Anschluss on which track was entered
				length,				// count of turnouts in current route
				turns,				// array of tracks turns of current route
				stopAtTurnout		// signal on other side found: stop searching at next turnout
			*/
			continue;
		}
	}
	
	// Reverse direction at dead end
	if (!connectionFound) {
		const nextAnschluss = (Anschluss != "Anfang" ? "Anfang" : "other");
		//followRoute(routes, startSignalID, GleissystemID, GleisID, nextAnschluss, length, turns, stopAtTurnout);
		// Set parameter for next loop iteration
		Anschluss 	= nextAnschluss;
		/*
			routes, 			// Result (array of all routes)
			startSignalID, 		// start signal of current route
			GleissystemID,
			GleisID, 			// current track
			Anschluss, 			// Anschluss on which track was entered
			length,				// count of turnouts in current route
			turns,				// array of tracks turns of current route
			stopAtTurnout		// signal on other side found: stop searching at next turnout
		*/
		continue;
	}

	break; // end loop, no more tracks to follow
	} while (true);

}

// Create data for Lua module "blockControl"
blockControl.calculate = function (GleissystemID = "1") {
/*
Input (see function prepareGleissysteme):
	global.trackSignals					Signals per tracksystem and track
	global.activeTracks					Active tracks
	global.Gleissysteme 				Verwendung: Gleis = global.Gleissysteme[GleissystemID][GleisID];
	global.trackConnections				Connections between tracks
	global.Zugverband					Trains
	
other available data:
	global.Meldungen 		
	global.Weichen 			
	global.Kontakte			
	global.KontaktZiele		
	global.EndRouteSignals				Start-route-signals of end-route-signals
	global.KameraSet 					Verwendung: Kamera = global.KameraSet[index];
	global.Gleisobjekte		
	global.Routen			
	global.Sounds			
	
Output:	
	blockSignals	Block signals
	twoWayBlocks	Two way twin blocks (array or set of related blocks)
	routes			Routes via turnouts from one block to the next block

Limitations:
	The exact position of signals on a track is not used, therefore you cannot have multiple signals on one track.
	The cycle check limits the count of collected turnouts.
*/
	
	// Initialization
	const blockSignals = [];  						// Array of block signals
	const twoWayBlocks = [];						// Array of two way blocks
	const routes = []; 								// Array of routes
	const trains = [];								// Array of trains

	// Process signals on active tracks
//	for (const GleissystemID in global.trackSignals) {
		for (const GleisID in global.trackSignals[GleissystemID]) {
			const activeTrack = global.activeTracks[GleissystemID].includes(GleisID);
			if (!activeTrack) { continue; }
			for (const entry of global.trackSignals[GleissystemID][GleisID]) {
				const SignalID		= +entry.SignalID;
				const signalType	= entry.signalType;		// Signaltyp: main, pre, FStart, FZiel
				const ParaOderAnti 	= +entry.ParaOderAnti; 	// Track direction: forward = 1 = Anfang -> Ende, backbard = 0 = Ende -> Anfang
				const Anschluss 	= (ParaOderAnti === forward ? "Anfang" : "other"); // Simulate entering the start track
				
				if (signalType !== "main") { continue; }

				// Block signals
				// Simply dump the list of signals plus some additional information
				blockSignals.push({
					GleissystemID 	: GleissystemID,
					GleisID 		: GleisID,
					SignalID 		: SignalID,
					name			: entry.Meldung.getAttribute("name"),
				});

				// Two way blocks
				// Start routes from every signal and follow the tracks backwards to the next signal on the other side of the track.
				// Stop routes at turnouts.
				followTwoWayBlocks(twoWayBlocks, SignalID, GleissystemID, GleisID, (Anschluss == "Anfang" ? "Ende" : "Anfang") );

				// Routes
				// Start routes from every signal and follow the tracks towards the next signal.
				// Span routes on turnouts.
				// Collect all turnouts on routes.
				const length = 0;
				const turns = []; // array of tracks turns of current route
				const stopAtTurnout = false;
				followRoute(routes, SignalID, GleissystemID, GleisID, Anschluss, length, turns, stopAtTurnout);
			}
		}
//	}
	
	// Process trains
//	for (const GleissystemID in global.Zugverband) {
		for (const trainName in global.Zugverband[GleissystemID]) {
			const train = global.Zugverband[GleissystemID][trainName];
			trains.push({
				name 		: trainName,
				routeName	: train.routeName,
			});
		}
//	}
	
	// Finalization
	// Sort
	blockSignals.sort(function(a, b) {
		return a.SignalID - b.SignalID;					// sort by signal
	});
	twoWayBlocks.sort(function(a, b) {
		return a[0] - b[0];								// sort by first signal
	});
	routes.sort(function(a, b) {
		const d = a.startSignalID - b.startSignalID;	// sort by start signal
		return (d != 0 ? d : a.SignalID - b.SignalID);	// then sort by second signal
	});
	trains.sort(function(a, b) {						// sort by train name
		const nameA = a.name.toLowerCase();
		const nameB = b.name.toLowerCase();
		if (nameA < nameB) { return -1; }
		if (nameA > nameB) { return  1; } 
		return 0;	
	});

	return {
		blockSignals	: blockSignals,
		twoWayBlocks	: twoWayBlocks,
		routes			: routes,
		trains			: trains,
	}
}

// // Initialization: Connection to a broadcast channel
const blockControlChannel = new BroadcastChannel("blockControl");

// Event handler
blockControlChannel.onmessage = function(ev) {
	const command = ev.data.command;
	
	if (command == "calculate") {
		// receive parameter
		const GleissystemID = ev.data.GleissystemID;
		if (ev.data.maxTurnouts) {
			maxTurnouts 	= +ev.data.maxTurnouts;
		}
		if (ev.data.maxTracks) {
			maxTracks 		= +ev.data.maxTracks;
		}

		if(!global.trackSignals || !global.trackSignals[GleissystemID]) {
			console.log("Module blockControl: no data available");
			return;
		}
	
		// calculate
		const { blockSignals, twoWayBlocks, routes, trains }
			= blockControl.calculate(GleissystemID);

		// Get file name without extension
		const filename = document.getElementById("filename").textContent;	
		
		// send results
		blockControlChannel.postMessage({
			command			: "data",
			filename		: filename,
			blockSignals	: blockSignals,
			twoWayBlocks	: twoWayBlocks,
			routes			: routes,
			trains			: trains,
			message			: message,
		});
	}
}

})(this); // end module