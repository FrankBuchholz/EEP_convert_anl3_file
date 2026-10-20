// DOM2SVG: Erzeugung der SVG-Elemente des Gleisplans
"use strict";
/* global
	global:readonly,
	matrix:readonly,
	convexhull:readonly,
	_:readonly,
	getKontaktIcon:readonly,
	TrackSystemText:readonly,
	getGleisInterval:readonly,
	loadStaticTexts:readonly,
	prepareGleissysteme:readonly,
	calcBezierCurve:readonly,
	calcBezierPoint:readonly,
	calcClothoidCurve:readonly,
	calcHelixCurve:readonly,
	calcRotatorCurve:readonly,
	getArcLength3D:readonly,
	projectFrame:readonly,
	projectPoint:readonly,
	registerLabel:readonly,
	resetLabels:readonly
*/
/* Interface
required standard objects:
	console
	document
required global data:
	global
	matrix
required functions:
	_ (js/EEP_Texts.js)
	convexhull (js/convexhull.js)
	getKontaktIcon (js/EEP_Gleisplan_InfoPopup.js)
	TrackSystemText, getGleisInterval, loadStaticTexts, prepareGleissysteme (js/EEP_Gleisplan_Data.js)
	calcBezierCurve, calcBezierPoint, calcClothoidCurve, calcHelixCurve, calcRotatorCurve,
	getArcLength3D, projectFrame, projectPoint (js/EEP_Gleisplan_Geometry.js)
	registerLabel, resetLabels (js/EEP_Gleisplan_LabelLayout.js)
public api:
	createSVG
global data which is changed here:
	global.Kontakte, global.KameraSet, global.usedArea, global.timestamp.svgCreated
	global.__showCircles__ (debugging feature, wird nur gelesen)
*/
(function(api) {
// public api
api.createSVG = createSVG;


function createSVG(sutrackp, initProgress, incrementProgress) {
	resetLabels();
	loadStaticTexts();

	const Gleissysteme = prepareGleissysteme(sutrackp);

	// Zeige die Checkbox für den Kurventyp nur bei Dateien ab EEP 16
	if (global.EEPversion >= 16) {
		document.getElementById("CheckboxCurveType").classList.remove("hidden");
	}

	// Append new svg elements to this root node which we append to the svg node later
	const SVGfragment = document.createDocumentFragment();

	return initProgress(Gleissysteme.length).then(function() {
		let promise = null;
		for (const Gleissystem of Gleissysteme) {
			if (promise === null) {
				createSVGforGleissystem(Gleissystem, SVGfragment);
				promise = incrementProgress();
			} else {
				promise = promise.then(function() {
					createSVGforGleissystem(Gleissystem, SVGfragment);
					return incrementProgress();
				});
			}
		}
		return promise;

	}).then(function() {
		createSVGfinalize(SVGfragment, sutrackp);
		return;
	});
} // end function createSVG

function createSVGforGleissystem(Gleissystem, SVGfragment) {

	const GleissystemID 	= Gleissystem.getAttribute("GleissystemID");
	
	// Append groups to the root node; append other elements to these group nodes
	const svgGleissystemGroup = svgAppend(SVGfragment, {
		svg_tag	: `g`,
		id		: `${global.TrackSystemCode[global.TrackSystem[GleissystemID]]}`, // optional
		"class"	: `${global.TrackSystemCode[global.TrackSystem[GleissystemID]]}`,
	});

	const Gleise = Gleissystem.getElementsByTagName("Gleis");

	// Zeige die Checkbox zum ein-/ausblenden (und andere Elemente) nur dann an, wenn ein Gleissystem auch Gleise enthält
	if (Gleise.length > 0) {
		for (const ele of document.getElementsByClassName(global.TrackSystemCode[global.TrackSystem[GleissystemID]])) {
			ele.classList.remove("hidden");
		}
	}

	// Process Gleise
	for (const Gleis of Gleise) {

	/* Example:
	<Gleis GleisID="1" clsid="2E25C8E2-ADCD-469A-942E-7484556FF932" data="0" scale="1" ElectSideS="0" ElectSideE="0" stil="1353" gsbname="\Gleisstile\Gleise\Beton2_Sch_C_LW1.3dm" LockEd="0">
		<Dreibein>
			<Vektor x="-12359.88" y="-1854.389" z="30">Pos</Vektor>
			<Vektor x="0.699066" y="-0.715057" z="0">Dir</Vektor>
			<Vektor x="0.715057" y="0.699066" z="0">Nor</Vektor>
			<Vektor x="-0" y="0" z="1">Bin</Vektor>
		</Dreibein>
		<Anfangsfuehrungsverdrehung Wert="0"/>
		<Charakteristik Kruemmung="0" Torsion="0" Fuehrungsverdrehung="-0" Kurve="0" Laenge="2580"/>
	</Gleis>
	*/

	/*
	Das Kordinatensystem von SVG ist gegenüber dem üblichen Koordinatensystem (also auch dem von EEP) an der x-Achse gespiegelt.
	Die Spiegelung ließe sich über CSS einfach zurücknehmen:
	svg { transform: scale(1,-1); }
	Damit würde allerdings auch der Text gespiegelt und müsste daher erneut gespiegelt und verschoben werden.
	Daher werden hier stattdessen bei der Ausgabe alle y-Koordinaten und y-Winkel negativ angegeben (also z.Z. -PosY -DirY -NorY)
	Statt cm soll als Einheit m verwendet werden, daher wird Laenge, Kruemmung, PosX und PosY geeignet skaliert.
	*/

		const GleisID 	= Gleis.getAttribute("GleisID");
		const clsid 	= Gleis.getAttribute("clsid");		// Gleisart
		const stil 		= Gleis.getAttribute("stil");		// Gleisstil
		const gsbname 	= Gleis.getAttribute("gsbname");	// Dateiname
		const Key_Id	= Gleis.getAttribute("Key_Id"); 	// Id einer Weiche
		const GleisData	= Gleis.getAttribute("data"); 		// Bitfeld einer Weiche
															// 1: Oberleitung
															// 18: DKW (Weichen und zentrale Gleise)
															// 16: Zentrale Strecken einer Straßen-T-Kreuzung
															// 20: Weichen einer Straßen-T-Kreuzung

		const { near, far, Laenge } = getGleisInterval(Gleis); // Charakteristik.Laenge bzw. Interval.far - Interval.near

		let CurveType, Kruemmung, mMatrix;
		let PosX, PosY, PosZ, DirX, DirY, DirZ, NorX, NorY, NorZ, BinX, BinY, BinZ;

		if (global.EEPversion && global.EEPversion >= 16) { /* EEP 16 */

			// Common attributes
			const Curve 	= Gleis.getElementsByTagName("Curve")[0];

			
			const Frame		= Gleis.getElementsByTagName("Frame")[0];
			const FramePos	= Frame.getElementsByTagName("Position")[0];
			const FrameVectors = Frame.getElementsByTagName("Vector");
			const FrameDir	= FrameVectors[0];
			/* Strange: Sometimes we need to swap Nor and Bin
			which would be a matrix multiplication with
			1 0 0 0
			0 1 0 0
			0 0 0 1
			0 0 1 0
			*/
			const swap = (   Math.abs(+FrameVectors[1].getAttribute("dz")) > 0.99
						  && Math.abs(+FrameVectors[2].getAttribute("dz")) < 0.01
						  ? true : false);
/*
Neue Anlage_Test_288 - repariert
Swap frame vektor Nor<->Bin for Eisenbahn 215

HSB_Sued
Swap frame vektor Nor<->Bin for Wasserwege 156
Swap frame vektor Nor<->Bin for Wasserwege 164

*/
if (swap) { console.log('Swap frame vektor Nor<->Bin for '
	+ TrackSystemText(GleissystemID) + ' ' + GleisID
);}
			const FrameNor	= FrameVectors[(swap ? 2 : 1)];
			const FrameBin	= FrameVectors[(swap ? 1 : 2)];

			// Depending on CurveType some adjustments will be done later
			PosX	= +FramePos.getAttribute("x");
			PosY	= +FramePos.getAttribute("y");
			PosZ	= +FramePos.getAttribute("z");

			DirX	= +FrameDir.getAttribute("dx");
			DirY	= +FrameDir.getAttribute("dy");
			DirZ	= +FrameDir.getAttribute("dz");

			NorX	= +FrameNor.getAttribute("dx");
			NorY	= +FrameNor.getAttribute("dy");
			NorZ	= +FrameNor.getAttribute("dz");

			BinX	= +FrameBin.getAttribute("dx");
			BinY	= +FrameBin.getAttribute("dy");
			BinZ	= +FrameBin.getAttribute("dz");

			if (DirX === 0 && DirY === 0 && DirZ === 1 && NorX !== 0 && NorY !== 0 && NorZ === 0) { // wrong order Bin - Dir - Nor
console.log('wrong order Bin - Dir - Nor for '
	+ TrackSystemText(GleissystemID) + ' ' + GleisID
);
				const FrameBin	= FrameVectors[0];
				const FrameDir	= FrameVectors[1];
				const FrameNor	= FrameVectors[2];

				DirX		= +FrameDir.getAttribute("dx");
				DirY		= +FrameDir.getAttribute("dy");
				DirZ		= +FrameDir.getAttribute("dz");

				NorX		= +FrameNor.getAttribute("dx");
				NorY		= +FrameNor.getAttribute("dy");
				NorZ		= +FrameNor.getAttribute("dz");

				BinX		= +FrameBin.getAttribute("dx");
				BinY		= +FrameBin.getAttribute("dy");
				BinZ		= +FrameBin.getAttribute("dz");
			}
/*
if (DirX == NorY ) {
	console.log(TrackSystemText(GleissystemID) + ' ' + GleisID
		+ ' DirX == NorY'
	);
}
if (BinZ == -1 ) {
	console.log(TrackSystemText(GleissystemID) + ' ' + GleisID
		+ ' BinZ == -1'
	);
	//BinZ = 1;
}
*/

			//  	   0     1     2     3     4     5     6     7     8     9     10    11    12    13    14    15
			mMatrix = [DirX, DirY, DirZ, 0,    NorX, NorY, NorZ, 0,    BinX, BinY, BinZ, 0,    PosX, PosY, PosZ, 1 ];

			// Identify CurveType
			// https://www.eepforum.de/forum/thread/27426-neue-splinefunktionen-war-neue-gleise/
			/* Optimierung durch Claude AI:
			Zur Kurventyp-Erkennung werden nacheinander 10 erschiedene getElementsByTagName-Aufrufe auf Curve gemacht, obwohl nur einer davon ein Ergebnis liefert.
			Für die Kurventyp-Erkennung wäre Curve.children[0].tagName (bzw. .nodeName) ein einziger Zugriff auf das erste Kind-Element von Curve, das den Kurventyp bestimmt. 
			Das ist effizienter, da es nur einen Zugriff benötigt und nicht 10 separate Aufrufe.
			*/
			/*
			const EEPCurve  = Curve.getElementsByTagName("EEPCurve")[0];
			const Line		= Curve.getElementsByTagName("Line")[0];
			const Arc		= Curve.getElementsByTagName("Arc")[0];
			const Helix		= Curve.getElementsByTagName("Helix")[0];
			const Clothoid	= Curve.getElementsByTagName("Clothoid")[0];
			//const Cubic	= Curve.getElementsByTagName("Cubic")[0];			// This catches the first element of Curve.Cubic as well as from Curve.Spline.Cubic 
			const CubicList = Curve.getElementsByTagName("Cubic");				// This catches Curve.Cubic (one entry) as well as Curve.Spline.Cubic (multiple entries) 
			const Spline	= Curve.getElementsByTagName("Spline")[0];
			const Rotator	= Curve.getElementsByTagName("Rotator")[0];
			const RotatorChain	= Curve.getElementsByTagName("RotatorChain")[0];
			const PolygonalChain = Curve.getElementsByTagName("PolygonalChain")[0]; // Available as of EEP 17.1
			*/
			// Identify CurveType — ein Zugriff auf das (laut Schema einzige) Kind-Element
			const CurveChild    	= Curve.firstElementChild;
			const CurveChildTag 	= CurveChild ? CurveChild.tagName : null;

			const EEPCurve			= (CurveChildTag === "EEPCurve")       	? CurveChild : null;
			const Line				= (CurveChildTag === "Line")           	? CurveChild : null;
			const Arc				= (CurveChildTag === "Arc")             ? CurveChild : null;
			const Helix				= (CurveChildTag === "Helix")           ? CurveChild : null;
			const Clothoid			= (CurveChildTag === "Clothoid")        ? CurveChild : null;
			const Spline			= (CurveChildTag === "Spline")          ? CurveChild : null;
			const Rotator			= (CurveChildTag === "Rotator")         ? CurveChild : null;
			const RotatorChain		= (CurveChildTag === "RotatorChain")    ? CurveChild : null;
			const PolygonalChain	= (CurveChildTag === "PolygonalChain")  ? CurveChild : null;

			// Cubic bleibt Sonderfall: direkt unter Curve ODER mehrfach unter Curve > Spline
			const CubicList 		= (CurveChildTag === "Cubic")			? [CurveChild] : (Spline ? Spline.getElementsByTagName("Cubic") : []);

			// Get track geometry per CurveType
			if (EEPCurve) {	// EEPCurve = Line or Arc
				CurveType 	= 'EEPCurve';
				Kruemmung	= +EEPCurve.getAttribute("Kruemmung") * 100;

				 // assumption: Gleis.Frame does not contain relevant data
				if (Math.abs(+FramePos.getAttribute("x")) > 1 ) {
					console.log(`EEPCurve ${TrackSystemText(GleissystemID)} ${GleisID} has Frame value`);
				}

				const Frame2	= EEPCurve.getElementsByTagName("Frame")[0];
				const Frame2Pos	= Frame2.getElementsByTagName("Position")[0];
				const Frame2Vectors = Frame2.getElementsByTagName("Vector");
				const Frame2Dir	= Frame2Vectors[0];
				const Frame2Nor	= Frame2Vectors[1];
				const Frame2Bin	= Frame2Vectors[2];

				PosX		= +Frame2Pos.getAttribute("x") / 100;
				PosY		= +Frame2Pos.getAttribute("y") / 100;
				PosZ		= +Frame2Pos.getAttribute("z") / 100;

				DirX		= +Frame2Dir.getAttribute("dx");
				DirY		= +Frame2Dir.getAttribute("dy");
				DirZ		= +Frame2Dir.getAttribute("dz");

				NorX		= +Frame2Nor.getAttribute("dx");
				NorY		= +Frame2Nor.getAttribute("dy");
				NorZ		= +Frame2Nor.getAttribute("dz");

				BinX		= +Frame2Bin.getAttribute("dx");
				BinY		= +Frame2Bin.getAttribute("dy");
				BinZ		= +Frame2Bin.getAttribute("dz");

/*
Problematische Gleise:

Makinista_GRAFENBURG 16

<Gleis GleisID="4944" clsid="2E25C8E2-ADCD-469A-942E-7484556FF932" data="0" scale="1" ElectSideS="0" ElectSideE="0" stil="17" gsbname="\Gleisstile\Sonstiges\Wasserweg_unsichtbar.3dm" LockEd="0">
<Frame>
<Position x="4.882813E-04" y="6.103516E-03" z="0"/>
<Vector dx="1" dy="0" dz="0"/>
<Vector dx="0" dy="1" dz="0"/>
<Vector dx="0" dy="0" dz="1"/>
</Frame>
<Interval near="0" far="2.3"/>
<Curve>
<EEPCurve Kruemmung="0" Torsion="0" Fuehrungsverdrehung="-0" Laenge="230" Kurve="0" Anfangsfuehrungsverdrehung="0">
<Frame>
<Position x="-572287.6" y="-28208.7" z="4840"/>
<Vector dx="0" dy="0" dz="1"/>
<Vector dx="-0.7071068" dy="0.7071068" dz="0"/>
<Vector dx="-0.7071068" dy="-0.7071068" dz="0"/>
</Frame>
</EEPCurve>
</Curve>

-> Falsche Reihenfolge von EEPCurve Vector: Bin - Dir - Nor

*/
//if (GleissystemID == "4" && GleisID == "4944") debugger;
//if (GleissystemID == "4" && GleisID == "5817") debugger;
				if (DirX === 0 && DirY === 0 && DirZ === 1 && NorX !== 0 && NorY !== 0 && NorZ === 0) { // wrong order Bin - Dir - Nor
console.log('wrong order Frame2 Bin - Dir - Nor for '
	+ TrackSystemText(GleissystemID) + ' ' + GleisID
);
					const Frame2Vectors = Frame2.getElementsByTagName("Vector");
					const Frame2Bin	= Frame2Vectors[0];
					const Frame2Dir	= Frame2Vectors[1];
					const Frame2Nor	= Frame2Vectors[2];

					DirX		= +Frame2Dir.getAttribute("dx");
					DirY		= +Frame2Dir.getAttribute("dy");
					DirZ		= +Frame2Dir.getAttribute("dz");

					NorX		= +Frame2Nor.getAttribute("dx");
					NorY		= +Frame2Nor.getAttribute("dy");
					NorZ		= +Frame2Nor.getAttribute("dz");

					BinX		= +Frame2Bin.getAttribute("dx");
					BinY		= +Frame2Bin.getAttribute("dy");
					BinZ		= +Frame2Bin.getAttribute("dz");
				}

				//  	   0     1     2     3     4     5     6     7     8     9     10    11    12    13    14    15
				mMatrix = [DirX, DirY, DirZ, 0,    NorX, NorY, NorZ, 0,    BinX, BinY, BinZ, 0,    PosX, PosY, PosZ, 1 ];	// replace Frame with Frame2

			} else if (Line) {
				CurveType 	= 'Line';
				Kruemmung	= 0;

				/* The line geometry is partly stored in <Gleis><Frame> as well as in
				<Line><VectorBundle><Position> 		Position of parameter s=0
				<Line><VectorBundle><Vector>   		.. and tangent of the line.
				<Line><Vector>						Up direction [0 0 1] respective [0 0 -1]
				*/

				const VectorBundle = Line.getElementsByTagName("VectorBundle")[0];
				const Position	= VectorBundle.getElementsByTagName("Position")[0];
				const Tangent	= VectorBundle.getElementsByTagName("Vector")[0];
				const UpDirection = Line.getElementsByTagName("Vector")[1];	// Caution: getElementsByTagName searches in all decendant elements!
																			// Vector[0] is the vector within VectorBundle
/* Try this from https://stackoverflow.com/questions/1241525/java-element-getelementsbytagname-restrict-to-top-level/18090152
function getChildrenByTagName(parent, name) {
var nodeList = [];
for (var child = parent.firstChild; child != null; child = child.nextSibling) {
if (child.nodeType == 1 && name == child.nodeName) {
	nodeList.push(child);
}
}
return nodeList;
}
*/
				const PosX2		= +Position.getAttribute("x");		// dX
				const PosY2		= +Position.getAttribute("y");		// dY
				const PosZ2		= +Position.getAttribute("z");		// dZ

				const DirX2		= +Tangent.getAttribute("dx");		// cos(a)
				const DirY2		= +Tangent.getAttribute("dy");		// -sin(a)
				const DirZ2		= +Tangent.getAttribute("dz");		// ?

				const NorX2		= -DirY2;							// sin(a)
				const NorY2		= DirX2;  							// cos(a)
				const NorZ2		= 0;								// ?

				const BinX2		= 0; //+UpDirection.getAttribute("dx");	// Flipped texts on ZZA_Diorama for Line with UpDirection = [ 0 0 -1]
				const BinY2		= 0; //+UpDirection.getAttribute("dy");
				const BinZ2		= 1; //+UpDirection.getAttribute("dz");

/* Special tracks of ZZA_Diorama

Flipped texts:
<Gleis GleisID="1" clsid="2E25C8E2-ADCD-469A-942E-7484556FF932" data="0" scale="1" ElectSideS="0" ElectSideE="0" stil="5603" gsbname="\Gleisstile\Gleise\3DVersion\UIC60_Schienen_Eisenbahn.3dm" LockEd="0">
<Frame>
	<Position x="14.28571" y="0" z="0"/>
	<Vector dx="1" dy="0" dz="0"/>
	<Vector dx="0" dy="1" dz="0"/>
	<Vector dx="0" dy="0" dz="1"/>
</Frame>
<Interval near="0" far="50"/>
<Curve>
	<Line>
		<VectorBundle>
			<Position x="-990" y="238.5" z="-100"/>
			<Vector dx="1" dy="1.592085E-09" dz="2.656702E-16"/>
		</VectorBundle>
		<Vector dx="1.264857E-16" dy="8.742278E-08" dz="-1"/>
	</Line>
</Curve>

Texts are ok:

<Gleis GleisID="6" clsid="2E25C8E2-ADCD-469A-942E-7484556FF932" data="0" scale="1" ElectSideS="0" ElectSideE="0" stil="5603" gsbname="\Gleisstile\Gleise\3DVersion\UIC60_Schienen_Eisenbahn.3dm" LockEd="0">
<Frame>
	<Position x="-925.7143" y="243" z="-100"/>
	<Vector dx="-1" dy="1.509958E-07" dz="0"/>
	<Vector dx="-1.509958E-07" dy="-1" dz="-8.742278E-08"/>
	<Vector dx="-1.320047E-14" dy="-8.742278E-08" dz="1"/>
</Frame>
<Interval near="0" far="50"/>
<Curve>
	<Line>
		<VectorBundle>
			<Position x="0" y="0" z="0"/>
			<Vector dx="1" dy="0" dz="0"/>
		</VectorBundle>
		<Vector dx="0" dy="0" dz="1"/>
	</Line>
</Curve>
*/

/*
console.log(
	CurveType
	+ "\t" + GleissystemID + "-" + GleisID
	+ "\t" + BinX2.toFixed(1) + "\t" + BinY2.toFixed(1) + "\t" + BinZ2.toFixed(1)
);
*/

				mMatrix = [
							mMatrix,
							[DirX2, DirY2, DirZ2, 0, NorX2, NorY2, NorZ2, 0, BinX2, BinY2, BinZ2, 0, PosX2, PosY2, PosZ2, 1 ],
						  ].reduce(matrix.multiply);


			} else if (Arc) {
				CurveType 	= 'Arc';
// if (GleissystemID == 1 && GleisID == 726) debugger; // TT-Anlage wrong end point, more errors in ZZA_Demo 

				// relative position of center point of the Arc
				const VectorBundle2 = Arc.getElementsByTagName("VectorBundle2");
				const VectorBundle2Vectors = VectorBundle2[0].getElementsByTagName("Vector");

				const Pos 	= VectorBundle2[0].getElementsByTagName("Position")[0];
				const PosX2 = +Pos.getAttribute("x");
				const PosY2 = +Pos.getAttribute("y");
				const PosZ2 = +Pos.getAttribute("z");

				// Tangent (= normalized direction vector with dx^2 + dy^2 + dz^2 = 1)
				const Dir 	= VectorBundle2Vectors[0];
				const DirX2 = +Dir.getAttribute("dx");
				const DirY2 = +Dir.getAttribute("dy");
				const DirZ2 = +Dir.getAttribute("dz");

				// The distance of the center point = curve radius is the length of the second vector
				const Nor 	= VectorBundle2Vectors[1];
				const CenterX2 = +Nor.getAttribute("dx");
				const CenterY2 = +Nor.getAttribute("dy");
				const CenterZ2 = +Nor.getAttribute("dz");

				const Radius = Math.hypot(CenterX2, CenterY2, CenterZ2)					// The curve radius is the length of the second vector
								 * (DirX2 >= 0 ? 1 : -1) * (CenterY2 >= 0 ? 1 : -1);	// Adjustment according to quadrant (1, 3 counter clockwise; 2, 4 clock wise)
								 ;
				Kruemmung = 1 / Radius;
				
				// Rotate with tangent of circle defined by DirX, DirY
				const tangentAngle = ( DirX2 === 1 && DirY2 === 0 ? 0 : Math.atan2(DirY2, DirX2) );	// skip 0° Rotation

				// Rotate curve around center with angle defined by near
				// (Move point to origin, rotate, move point back)
				const startAngle = Math.min( near, far ) / Radius; 

				mMatrix = [
						mMatrix,
						matrix.translate(PosX2, PosY2, PosZ2),					// Relative position of center point of the Arc
						matrix.translate(- CenterX2, - CenterY2, - CenterZ2),	// Translate by distance of mid point of circle
						matrix.rotateZ( tangentAngle ),							// Rotate with tangent of circle
						[
							matrix.translate(+ CenterX2, + CenterY2, + CenterZ2),	// Translate center of circle
							matrix.rotateZ( startAngle ),							// Rotate with angle defined by starting point
							matrix.translate(- CenterX2, - CenterY2, - CenterZ2),	// Undo translate center point of circle
						].reduce(matrix.multiply),
					].reduce(matrix.multiply);

/* Special tracks
if (GleissystemID == "4" && GleisID == "52") debugger;
if (GleissystemID == "3" && GleisID == "351") debugger;	// <Interval near="26.99997" far="0"/>
if (GleissystemID == "3" && GleisID == "358") debugger;	//
if (GleissystemID == "3" && GleisID == "360") debugger;	// <Interval near="99.66833" far="0"/>
if (GleissystemID == "4" && GleisID == "156") debugger;	// <Interval near="99.66833" far="0"/>

Anlage "fehlerhaft_TM"
Eisenbahn 1	Arc	Länge: 47m	Anfang: 3	Ende: 4		Abzweigung: 28		near="70.18061" far="23.53859"
Eisenbahn 2	Arc	Länge: 46m	Anfang: 5	Ende: 27	Abzweigung: 29		near="68.94401" far="23.07648"
Eisenbahn 3	Arc	Länge: 70m	Anfang: 1									near="0"        far="70.18061"
*/

			} else if (Helix) {
				CurveType 	= 'Helix';

				// relative position of center point of the Helix
				const VectorBundle2 = Helix.getElementsByTagName("VectorBundle2");
				const VectorBundle2Vectors = VectorBundle2[0].getElementsByTagName("Vector");

				const Pos2 	= VectorBundle2[0].getElementsByTagName("Position")[0];
				const PosX2 = +Pos2.getAttribute("x");
				const PosY2 = +Pos2.getAttribute("y");
				const PosZ2 = +Pos2.getAttribute("z");

				// Tangent (= normalized direction vector with dx^2 + dy^2 + dz^2 = 1)
				const Dir2 	= VectorBundle2Vectors[0];
				const DirX2 = +Dir2.getAttribute("dx");
				const DirY2 = +Dir2.getAttribute("dy");
				const DirZ2 = +Dir2.getAttribute("dz");

				// Normal (= normalized direction vector with dx^2 + dy^2 + dz^2 = 1)
				const Nor2 	= VectorBundle2Vectors[1];
				const NorX2 = +Nor2.getAttribute("dx");
				const NorY2 = +Nor2.getAttribute("dy");
				const NorZ2 = +Nor2.getAttribute("dz");

				// Radius and height per circle
				const a = +Helix.getAttribute("a");			// Radius (= offset) in x direction
				const b = +Helix.getAttribute("b");			// height per circle in z direction

				// Analyzed and developed by HStoni54, https://www.eepforum.de/user/6783-hstoni54/

				// Frame (= mMatrix)
				const mFrame = [			DirX,  DirY,  DirZ,  0,
											NorX,  NorY,  NorZ,  0,
											BinX,  BinY,  BinZ,  0,
											PosX,  PosY,  PosZ,  1,	];

				// VectorBundle2
				const mVectorBundle2 = [	DirX2, DirY2, DirZ2, 0,
											NorX2, NorY2, NorZ2, 0,
											0,     0,     1,     0,
											PosX2, PosY2, PosZ2, 1,	];

				// Orientation forward/backward
				const mOrientation = matrix.scale(1, (far > near ? 1 : -1), 1); //### Not correct yet: position ok, direction wrong 							

				// Helix

				// Rotation of point on helix related to start point (0° at start point = Identity)
				/*
				//const s 	= Math.atan(b/a); // better use atan2 to get the orientation automatically
				const s 	= Math.atan2(b, a);
				const w0 	= Math.cos(s);
				const w     = (-near) 		/ a * w0;
				const wMid	= (far-near)/2 / a * w0;
				const wEnd	= (far) 		/ a * w0;
				const dh 	= b * w; // * (DirX2 * NorY2 >= 0 ? 1 : -1);
				*/
				const r    = Math.hypot(a, b);
				const wPos = (-near)		/ r;
				const wMid = (far-near)/2 	/ r;
				const wEnd = (far) 			/ r;

				// mPos
				mMatrix = [
							mFrame,
							mVectorBundle2,
							mOrientation,
							matrix.rotateZ(wPos),
							matrix.translate(a, 0, b*wPos),
							matrix.swapXY(),		// swap x/y and mirror at x axis because of upside-down orientation in SVG
						  ].reduce(matrix.multiply);
				const mPos = mMatrix;
				const mMid = [
							mFrame,
							mVectorBundle2,
							mOrientation,
							matrix.rotateZ(wMid),
							matrix.translate(a, 0, b*wPos),
							matrix.swapXY(),		// swap x/y and mirror at x axis because of upside-down orientation in SVG
						  ].reduce(matrix.multiply);
				const mEnd = [
							mFrame,
							mVectorBundle2,
							mOrientation,
							matrix.rotateZ(wEnd),
							matrix.translate(a, 0, b*wPos),
							matrix.swapXY(),		// swap x/y and mirror at x axis because of upside-down orientation in SVG
						  ].reduce(matrix.multiply);
/*
				const Radius = a;
				Kruemmung 	= 1 / Radius;

				// Compare the endpoint of primitive projection of an Arc with the endpoint of the Helix
				// If the difference is small use the Arc, otherwise use a Cubic to interpolate the Helix

				const posX = 12, posY = 13, posZ = 14; // Index in mMatrix

				const Winkel 	= Kruemmung * Laenge;	// Winkel = Laenge / Radius
				const DeltaX	= Math.sin(Winkel) * Radius;
				const DeltaY 	= (1 - Math.cos(Winkel)) * Radius;
				const DeltaZ	= 0;
				const d1		= Math.hypot(DeltaX, DeltaY, DeltaZ);
				const d2		= Math.hypot((mEnd[posX]-mPos[posX]), (mEnd[posY]-mPos[posY]), (mEnd[posZ]-mPos[posZ]));
				const dDiff		= Math.abs(d1-d2);
				if (dDiff > 1) {	// difference is too large, go für Cubic interpolation
console.log("Helix Vergleich\t" + TrackSystemText(GleissystemID) + " " + GleisID
	+ "\tDelta:\t" + d1 + "\t" + d2 + "\t" + dDiff
);
					/* Interpolate Helix with Cubic:
					Analyzed and developed by HStoni54, https://www.eepforum.de/user/6783-hstoni54/

					f = |far - near| / 2 / sqrt(a^2 + b^2)
					B1 = mPos
					B2 = mPos * translate3d(a*f,  0,  b*f)
					B3 = mEnd * translate3d(-a*f, 0, -b*f)
					B4 = mEnd
					*/
/*
					const f = Math.abs(far - near) / 2 / Math.hypot(a, b);	// f = Math.abs(wMid);
					const mB1 = mPos;
					const mB2 = matrix.multiply(mPos, matrix.translate( a*f, 0,  b*f) );
					const mB3 = matrix.multiply(mEnd, matrix.translate(-a*f, 0, -b*f) );
					const mB4 = mEnd;

					// hack to split the result into absolute coordinates for the start point and relative coordinates for the bezier points
					mMatrix = matrix.translate(mPos[posX], mPos[posY], mPos[posZ]);
					Gleis.BezierPoints = []; // We need just one segment
					Gleis.BezierPoints[0] = [	
												[mB1[posX] - mPos[posX], mB1[posY] - mPos[posY], mB1[posZ] - mPos[posZ]],
												[mB2[posX] - mPos[posX], mB2[posY] - mPos[posY], mB2[posZ] - mPos[posZ]],
												[mB3[posX] - mPos[posX], mB3[posY] - mPos[posY], mB3[posZ] - mPos[posZ]],
												[mB4[posX] - mPos[posX], mB4[posY] - mPos[posY], mB4[posZ] - mPos[posZ]],
												getArcLength3D( 
																[mB1[posX] - mPos[posX], mB2[posX] - mPos[posX], mB3[posX] - mPos[posX], mB4[posX] - mPos[posX]], 
																[mB1[posY] - mPos[posY], mB2[posY] - mPos[posY], mB3[posY] - mPos[posY], mB4[posY] - mPos[posY]],
																[mB1[posZ] - mPos[posZ], mB2[posZ] - mPos[posZ], mB3[posZ] - mPos[posZ], mB4[posZ] - mPos[posZ]],
															),
											];
				}
/*
console.log( 
      "\t" + CurveType 
	+ "\t" + GleisID
	+ "\tPos\t" + mPos[12] + "\t" + mPos[13]+ "\t" + mPos[14]
	+ "\tMid\t" + mMid[12] + "\t" + mMid[13]+ "\t" + mMid[14]
	+ "\tEnd\t" + mEnd[12] + "\t" + mEnd[13]+ "\t" + mEnd[14]
	+ "\tRadius\t" + a // Radius 
	+ "\tHeight\t" + b // Height
	+ "\tr\t" + r // Math.hypot(a, b) 
)
*/

// Error: wrong positions of Helix
/*
if ( 1 === 1
// generic
||	((PosX2 != 0 || PosY2 != 0) && (DirX2 != 1 || DirY2 != 0))
// Makinista_GRAFENBURG 16
||	(GleissystemID == "1" && GleisID == "5675"	)
||	(GleissystemID == "1" && GleisID == "5902"	)
||	(GleissystemID == "1" && GleisID == "5935"	)
||	(GleissystemID == "1" && GleisID == "6096"	)
||	(GleissystemID == "2" && GleisID == "888"	)
||	(GleissystemID == "2" && GleisID == "970"	)
||	(GleissystemID == "3" && GleisID == "4065"	)
||	(GleissystemID == "3" && GleisID == "5011"	)
||	(GleissystemID == "3" && GleisID == "5027"	)
||	(GleissystemID == "3" && GleisID == "5649"	)
||	(GleissystemID == "3" && GleisID == "5650"	)
||	(GleissystemID == "4" && GleisID == "3170"	)
||	(GleissystemID == "4" && GleisID == "5627"	)
||	(GleissystemID == "4" && GleisID == "6049"	)
||	(GleissystemID == "4" && GleisID == "6051"	)
||	(GleissystemID == "4" && GleisID == "6056"	)
||	(GleissystemID == "4" && GleisID == "6057"	)
||	(GleissystemID == "4" && GleisID == "6059"	)
||	(GleissystemID == "4" && GleisID == "6060"	)
||	(GleissystemID == "4" && GleisID == "6072"	)
// Gleismauerbau
||	(GleissystemID == "1" && GleisID == "687"	)
// Nouveau projet 18a
||	(GleissystemID == "1" && GleisID == "54"	)
||	(GleissystemID == "1" && GleisID == "55"	)
||	(GleissystemID == "1" && GleisID == "70"	)
||	(GleissystemID == "3" && GleisID == "87"	)
||	(GleissystemID == "3" && GleisID == "290"	)
||	(GleissystemID == "3" && GleisID == "546"	)
||	(GleissystemID == "3" && GleisID == "557"	)
||	(GleissystemID == "3" && GleisID == "559"	)
||	(GleissystemID == "3" && GleisID == "568"	)
||	(GleissystemID == "3" && GleisID == "573"	)
||	(GleissystemID == "3" && GleisID == "592"	)
){
	console.log('\t' + TrackSystemText(GleissystemID) + '\t' + GleisID
		+ '\t'
		+ '\tPos\t'  + PosX  + '\t' + PosY  + '\t' + PosZ
		+ '\tDir\t'  + DirX  + '\t' + DirY  + '\t' + DirZ
		+ '\tNor\t'  + NorX  + '\t' + NorY  + '\t' + NorZ
		+ '\tBin\t'  + BinX  + '\t' + BinY  + '\t' + BinZ
		+ '\ta\t' + a
		+ '\tb\t' + b
		+ '\tPos2\t' + PosX2 + '\t' + PosY2 + '\t' + PosZ2
		+ '\tDir2\t' + DirX2 + '\t' + DirY2 + '\t' + DirZ2
		+ '\tNor2\t' + NorX2 + '\t' + NorY2 + '\t' + NorZ2
	);
}
*/
				const Radius = a;
				Kruemmung 	= 1 / Radius;	// nur noch informativ, nicht mehr fürs Rendering (siehe unten)

				/* Claude AI: Fix: Die bisherige "einfacher Arc vs. Cubic"-Entscheidung (dDiff) verglich
				die Endpunkte fehlerhaft (d2 addierte die Achsdifferenzen statt sie zu quadrieren)
				und berücksichtigte damit den 3D-Effekt der Kippung von
				mFrame/mVectorBundle2/mOrientation nicht korrekt - siehe GleisID 575, wo der
				Endpunkt dadurch komplett verfehlt wurde. Außerdem war ein einzelnes Bezier-Segment
				für das gesamte near..far-Intervall bei größerem Drehwinkel zu grob und wirkte
				"eckig" (siehe GleisID 129). Daher wird jetzt immer eine segmentierte, exakte
				Bezier-Näherung verwendet (analog zu calcRotatorCurve). */
				const posX = 12, posY = 13, posZ = 14; // Index in mMatrix

				const helixCurve = calcHelixCurve(mFrame, mVectorBundle2, mOrientation, a, b, near, far);
				Gleis.BezierPoints = helixCurve.BezierPoints;

				// hack to split the result into absolute coordinates for the start point and relative coordinates for the bezier points
				mMatrix = matrix.translate(helixCurve.mPos[posX], helixCurve.mPos[posY], helixCurve.mPos[posZ]);
				Gleis.Helix = {	// Store Helix parameters
					a: 		a,
					b: 		b,
					mPos:	mPos,
					mMid:	mMid,
					mEnd:	mEnd,
				};

			} else if (Clothoid) {
				CurveType 	= 'Clothoid';

/*
Curve parameter:
k = 1/r

k(s) = s/a^2
s = a^2*k(s)

r(s) = a^2/s 				für s != 0
s = a^2/r(s)
a^2 = s*r(s)

L = s2 - s1
L = a^2/r2 - a^2/r1
L = a^2(k2-k1)

Curve characteristic:
a^2 = L/(k2-k1)
a^2 = L*r1*r2/(r1-r2)

Clothoid.anl3
																a2 = a^2 	near	far		nor.y	bin.z
Id 1: From radius k1=0m 	to radius r2=100m	length 	l=60m 	a2=6000 	near=0 	far=60	1		1
Id 2: From radius k1=0m 	to radius r2=50m 	length 	l=60m 	a2=3000 	near=0 	far=60	1		1
Id 3: From radius r1=100m 	to radius r2=50m 	length 	l=60m 	a2=6000 	near=60 far=120	1		1
Id 4: From radius r1=50m 	to radius k2=0m		length 	l=60m 	a2=3000 	near=60 far=0	-1		-1
Id 5: From radius r1=50m 	to radius k2=0m		length 	l=60m 	a2=3000 	near=0 	far=60	1		1

How to calculate [x(s), y(s)] ?
https://link.springer.com/article/10.1007/s12544-013-0119-8
*/

				const a2 		= +Clothoid.getAttribute("a2");		// not used anymore, replaced by "a"
				const a 		= (a2 ? Math.sqrt(a2) : +Clothoid.getAttribute("a") );

				//const l		= far - near;	// Laenge
				//const k1		= near / a**2;	// Krümmung am Startpunkt
				//const k2		= far / a**2;	// Krümmung am Endpunkt

				//const r1		= (k1 != 0 ? 1 / k1 : 0);	// Radius am Anfangspunkt
				//const r2		= (k2 != 0 ? 1 / k2 : 0);	// Radius am Endpunkt

				Gleis.Clothoid = {
					A: 				a,
					L1: 			near,
					L2: 			far,
					RotationCCW: 	-1,
				};

			} else if (CubicList[0]) {	// Cubic or Spline
				if (Spline) {
					CurveType 	= 'Spline';
				} else {
					CurveType 	= 'Cubic';
				}
				// How to map the Bezier vector [a b c d] to the Bezier points B1 B2 B3 B4?
				// https://developer.mozilla.org/de/docs/Web/SVG/Tutorial/Pfade#Bezier-Kurven
				// http://blogs.sitepointstatic.com/examples/tech/svg-curves/cubic-curve.html
				// https://pomax.github.io/bezierinfo/
				// https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-837-computer-graphics-fall-2012/lecture-notes/MIT6_837F12_Lec01.pdf

/*
Pattern A:
	<Frame>
		<Position 		x="0" 				y="0" 				z="0"/>
		<Vector 		dx="1" 				dy="0" 				dz="0"/>
		<Vector 		dx="0" 				dy="1" 				dz="0"/>
		<Vector 		dx="0" 				dy="0" 				dz="1"/>
	</Frame>
	<Interval near="0" far="7.290804"/>
	<Curve>
		<Cubic>
			<Position 	x="-308.2468" 		y="1647.528" 		z="234.1985"/>
			<Vector 	dx="-4.936119" 		dy="4.789839" 		dz="-0.4930255"/>
			<Vector 	dx="-0.2395048" 	dy="3.452314" 		dz="1.185636"/>
			<Vector 	dx="2.73141" 		dy="-1.794522" 		dz="-0.6260821"/>
		</Cubic>
	</Curve>
Strasse
Rotator	393	Anfang	-301	-1643	Ende	-308	-1645
Cubic	20
Arc		392	Anfang	-310	-1656	Ende	-311	-1654

Cubic 390

Pattern B:
	<Frame>
		<Position 		x="1546.876" 		y="-1850.316" 		z="12.383"/>
		<Vector 		dx="-0.9830491" 	dy="0.1833427" 		dz="1.704315E-05"/>
		<Vector 		dx="-0.1833427" 	dy="-0.9830491" 	dz="1.721977E-07"/>
		<Vector 		dx="1.678582E-05" 	dy="-2.955457E-06" 	dz="1"/>
	</Frame>
	<Interval near="0" far="84.4156"/>
	<Curve>
		<Cubic>
			<Position 	x="0" 				y="0" 				z="0"/>
			<Vector 	dx="84.86435" 		dy="0" 				dz="0"/>
			<Vector 	dx="1.134216" 		dy="-14.52291" 		dz="-3.315334E-05"/>
			<Vector 	dx="-2.8041" 		dy="1.988125" 		dz="-4.251127E-04"/>
		</Cubic>
	</Curve>

Strasse
Arc 	346	x	1691.981	y	-1825.882	z	12.382	Length	65.57804
Cubic	347	x	1630.569	y	-1848.626	z	12.382	Length	84.41406
Cubic	348	x	1546.876	y	-1850.316	z	12.383	Length	84.41560
Arc 	215	x	1467.390	y	-1822.741	z	12.384

*/

			
/* A "Spline" is a series of Cubic tracks

<Gleis ...
	<Frame>
		<Position 			x="-6.598236" 	y="52.4" 		z="0.3"/>
		<Vector 			dx="1" 			dy="0" 			dz="0"/>
		<Vector 			dx="0" 			dy="1" 			dz="0"/>
		<Vector 			dx="0" 			dy="0" 			dz="1"/>
	</Frame>
	<Interval near="0" far="66.98232"/>
	<Curve>
		<Spline>
			<Cubic>
				<Position 	x="0" 			y="0" 			z="0"/>
				<Vector 	dx="12.3316" 	dy="0" 			dz="0"/>
				<Vector 	dx="-3.862404" 	dy="5.308939" 	dz="0"/>
				<Vector 	dx="2.008226" 	dy="-2.913866" 	dz="0"/>
			</Cubic>
			<Cubic>
				<Position 	x="10.47742" 	y="2.395073" 	z="0"/>
				<Vector 	dx="10.63147" 	dy="1.876281" 	dz="0"/>
				<Vector 	dx="10.73391" 	dy="-7.958102" 	dz="-5.722046E-08"/>
				<Vector 	dx="-8.044571" 	dy="7.886748" 	dz="3.814697E-08"/>
			</Cubic>
			<Cubic>
				<Position 	x="23.79824" 	y="4.2" 		z="-1.907349E-08"/>
				<Vector 	dx="7.965585" 	dy="9.62032" 	dz="0"/>
				<Vector 	dx="-20.69972" 	dy="11.5925" 	dz="0"/>
				<Vector 	dx="12.33414" 	dy="-7.412821" 	dz="0"/>
			</Cubic>
			<Cubic>
				<Position 	x="23.39824" 	y="18" 			z="-1.907349E-08"/>
				<Vector 	dx="3.568552" 	dy="10.56686" 	dz="0"/>
				<Vector 	dx="5.751632" 	dy="-2.380146" 	dz="5.722046E-08"/>
				<Vector 	dx="-1.649505" 	dy="-0.4574642" dz="-3.814697E-08"/>
			</Cubic>
			<Cubic>
				<Position 	x="31.06892" 	y="25.72925" 	z="0"/>
				<Vector 	dx="10.1233" 	dy="4.434174" 	dz="0"/>
				<Vector 	dx="12.86992" 	dy="3.519638" 	dz="-5.722046E-08"/>
				<Vector 	dx="-6.463902" 	dy="-5.083059" 	dz="3.814697E-08"/>
			</Cubic>
		</Spline>
	</Curve>
</Gleis>

*/				
				
				Gleis.BezierPoints = [];
				
				//for (Cubic of CubicList) {
				for (let Index = 0; Index < CubicList.length; Index++) {
				const Cubic = CubicList[Index];

				// If Frame.Position = 0 and first Cubic.Position <> 0 then treat this Cubic.Position as the starting point of the curve
				const PositionA	= Cubic.getElementsByTagName("Position")[0];
				let pX			= +PositionA.getAttribute("x");
				let pY			= +PositionA.getAttribute("y");
				let pZ			= +PositionA.getAttribute("z");
				
				if (Index == 0 
					//&& PosX == 0 && PosY == 0 && PosZ == 0 // some Cubic show non-zero values
				) {
					if (pX != 0 || pY != 0 || pZ != 0) {
/*
console.log( TrackSystemText(GleissystemID) + "-" + GleisID 
	+ "\tCubic Pos=0"
	+ "\t" + pX + "\t" + pY
)
*/
						mMatrix = [
								mMatrix,
								matrix.translate(pX, pY, pZ),
							].reduce(matrix.multiply);
						pX = 0; pY = 0; pZ = 0;	
					}
				}

				// The Cubic element stores the canonical monomial basis values of the bezier curve
				// The values of Cubic.Vector are relative to the starting point.
				// Therefore we define a=0 and use the Cubic.Vector for b, c, d.
				const Vercors 	= Cubic.getElementsByTagName("Vector");
				const VectorB	= Vercors[0];
				const VectorC	= Vercors[1];
				const VectorD	= Vercors[2];

				const aX		= pX;
				const aY		= pY;
				const aZ		= pZ;
				const bX		= +VectorB.getAttribute("dx");
				const bY		= +VectorB.getAttribute("dy");
				const bZ		= +VectorB.getAttribute("dz");
				const cX		= +VectorC.getAttribute("dx");
				const cY		= +VectorC.getAttribute("dy");
				const cZ		= +VectorC.getAttribute("dz");
				const dX		= +VectorD.getAttribute("dx");
				const dY		= +VectorD.getAttribute("dy");
				const dZ		= +VectorD.getAttribute("dz");

				/* Bezier points
				Multipy the Bezier vector [a b c d] with the matrix
				1  1   1  1
				0 1/3 2/3 1
				0  0  1/3 1
				0  0   0  1
				to get the coordinates of the Bezier points B1 B2 B3 B4.
				*/
				const B1X 		= aX;
				const B1Y 		= aY;
				const B1Z 		= aZ;
				
				const B2X 		= aX + bX/3;
				const B2Y 		= aY + bY/3;
				const B2Z 		= aZ + bZ/3;
				
				const B3X 		= aX + bX*2/3 + cX/3;
				const B3Y 		= aY + bY*2/3 + cY/3;
				const B3Z 		= aZ + bZ*2/3 + cZ/3;
				
				const B4X 		= aX + bX     + cX   + dX;
				const B4Y 		= aY + bY     + cY   + dY;
				const B4Z 		= aZ + bZ     + cZ   + dZ;

				// Calculate length of bezier segment
				// Source: http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5
				//const arcLength2D = getArcLength( [B1X, B2X, B3X, B4X], [B1Y, B2Y, B3Y, B4Y] ); // Claude AI: not needed anymore, replaced by 3D version
				// Claude AI: Calculate length of bezier segment in 3D
				const arcLength3D = getArcLength3D( [B1X, B2X, B3X, B4X], [B1Y, B2Y, B3Y, B4Y], [B1Z, B2Z, B3Z, B4Z] );

				Gleis.BezierPoints[Index] = [ [B1X, B1Y, B1Z], [B2X, B2Y, B2Z], [B3X, B3Y, B3Z], [B4X, B4Y, B4Z], arcLength3D ];

				}

			} else if (Rotator) {
				CurveType 	= 'Rotator';
				// A Rotator looks like an Arc if we can ignore the z-axis
				Kruemmung = +Rotator.getAttribute("a");
				const KruemmungZ = +Rotator.getAttribute("b");

				// Claude AI: Die bisherige Entscheidung "einfacher Arc vs. exakte Kurve" verglich simpleEnd und exactEnd NUR in der lokalen (x,y)-Ebene (dDiff).
				// Der lokale z-Anteil (Wirkung von KruemmungZ/b) ging in diesen Vergleich nicht ein. Bei stark gekipptem Frame (Bin-Vektor mit
				// nennenswerten x/y-Komponenten) kann aber bereits ein kleiner lokaler z-Unterschied von wenigen Metern nach der Projektion über
				// Bin zu einem großen Fehler im Welt-x/y-Endpunkt führen (siehe z.B. GleisID 152, 236: dDiff < 1 trotz mehreren Metern
				// sichtbarer Abweichung). Daher wird jetzt immer die exakte, segmentierte Kurve verwendet. Für echte einfache Bögen (kleiner
				// Rotationswinkel) liefert calcRotatorCurve ohnehin nur 1-2 fast identische Segmente, sodass kein spürbarer Mehraufwand entsteht.
				Gleis.BezierPoints = calcRotatorCurve(Kruemmung, KruemmungZ, near, far);

			} else if (RotatorChain) {
				CurveType 	= 'RotatorChain';
				console.log(`RotatorChain not supported yet: ${TrackSystemText(GleissystemID)} ${GleisID}`);
				Gleis.mPos = Gleis.mMid = Gleis.mEnd = mMatrix; // hack to avoid errors in later code
				continue;

			} else if (PolygonalChain) {
				CurveType 	= 'PolygonalChain';

				//const VectorBundleList = PolygonalChain.getElementsByTagName("VectorBundle");
				const PositionList = PolygonalChain.getElementsByTagName("Position");
				const VectorList   = PolygonalChain.getElementsByTagName("Vector");

				const Position = PositionList[0];
				const pX = +Position.getAttribute("x"); 
				const pY = +Position.getAttribute("y"); 
				const pZ = +Position.getAttribute("z"); 
				
				// Calculate start point
				mMatrix = [
						mMatrix,
						matrix.translate(pX, pY, pZ),
					].reduce(matrix.multiply);
				
				Gleis.BezierPoints = [];
				for (let Index = 1; Index < PositionList.length; Index++) {
					// First point of current Bezier segment
					const aPoint    = PositionList[Index-1];
					const B1X		= +aPoint.getAttribute("x") - pX; 
					const B1Y		= +aPoint.getAttribute("y") - pY; 
					const B1Z		= +aPoint.getAttribute("z") - pZ; 
					// Last point of current Bezier segment
					const dPoint    = PositionList[Index];
					const B4X		= +dPoint.getAttribute("x") - pX; 
					const B4Y 		= +dPoint.getAttribute("y") - pY; 
					const B4Z 		= +dPoint.getAttribute("z") - pZ; 
					// Distance between first and last point
					const d 		= 1/3 * Math.hypot( (B1X-B4X), (B1Y-B4Y), (B1Z-B4Z) );
					// Control point with 1/3 distance from first point in +vector direction 
					const aVector 	= VectorList[Index-1];
					const B2X 		= B1X + d * (+aVector.getAttribute("dx"));
					const B2Y 		= B1Y + d * (+aVector.getAttribute("dy"));
					const B2Z 		= B1Z + d * (+aVector.getAttribute("dz"));
					// Control point with 1/3 distance from last point in -vector direction 
					const dVector 	= VectorList[Index];
					const B3X 		= B4X + d * (-dVector.getAttribute("dx"));
					const B3Y 		= B4Y + d * (-dVector.getAttribute("dy"));
					const B3Z 		= B4Z + d * (-dVector.getAttribute("dz"));

					// Calculate length of bezier segment
					// Source: http://bl.ocks.org/hnakamur/e7efd0602bfc15f66fc5
					//const arcLength2D = getArcLength( [B1X, B2X, B3X, B4X], [B1Y, B2Y, B3Y, B4Y] ); // Claude AI: not needed anymore, replaced by 3D version
					// Claude AI: Calculate length of bezier segment in 3D
					const arcLength3D = getArcLength3D( [B1X, B2X, B3X, B4X], [B1Y, B2Y, B3Y, B4Y], [B1Z, B2Z, B3Z, B4Z] );

					Gleis.BezierPoints[Index-1] = [ [B1X, B1Y, B1Z], [B2X, B2Y, B2Z], [B3X, B3Y, B3Z], [B4X, B4Y, B4Z], arcLength3D ];
				}

			} else { // curve not supported yet
				CurveType 	= 'others';
				console.log(`other curve type not supported yet:  ${TrackSystemText(GleissystemID)} ${GleisID}`);
				Gleis.mPos = Gleis.mMid = Gleis.mEnd = mMatrix; // hack to avoid errors in later code
				continue;
			}

		} else {  /* EEP 15 */
			CurveType 		= 'classic';
			const Charakteristik = Gleis.getElementsByTagName("Charakteristik")[0];
			const Dreibein	= Gleis.getElementsByTagName("Dreibein")[0];
			const FramePos	= Dreibein.getElementsByTagName("Vektor")[0];
			const FrameDir	= Dreibein.getElementsByTagName("Vektor")[1];
			const FrameNor	= Dreibein.getElementsByTagName("Vektor")[2];
			const FrameBin	= Dreibein.getElementsByTagName("Vektor")[3];

			Kruemmung	= +Charakteristik.getAttribute("Kruemmung") * 100;

			PosX		= +FramePos.getAttribute("x") / 100;
			PosY		= +FramePos.getAttribute("y") / 100;
			PosZ		= +FramePos.getAttribute("z") / 100;

			DirX		= +FrameDir.getAttribute("x");
			DirY		= +FrameDir.getAttribute("y");
			DirZ		= +FrameDir.getAttribute("z");

			NorX		= +FrameNor.getAttribute("x");
			NorY		= +FrameNor.getAttribute("y");
			NorZ		= +FrameNor.getAttribute("z");

			BinX		= +FrameBin.getAttribute("x");
			BinY		= +FrameBin.getAttribute("y");
			BinZ		= +FrameBin.getAttribute("z");

			//  	   0     1     2     3     4     5     6     7     8     9     10    11    12    13    14    15
			mMatrix = [DirX, DirY, DirZ, 0,    NorX, NorY, NorZ, 0,    BinX, BinY, BinZ, 0,    PosX, PosY, PosZ, 1 ];
		} /* EEP 15 */

/*
if (near != 0) {
	console.log(`near != 0 ${TrackSystemText(GleissystemID)} ${GleisID} ${CurveType}`
	+ ' ' + near
	+ ' ' + far
	);
}
*/

/* //###
Modellbahn_Landbrücken
Arc near 60 > far 0 for Eisenbahn 22
Arc near 59.21461 > far 0 for Eisenbahn 129
Arc near 73.93141 > far 0 for Eisenbahn 134
Arc near 73.93142 > far 0 for Eisenbahn 135
Arc near 52.93141 > far 0 for Eisenbahn 137
Arc near 52.93141 > far 0 for Eisenbahn 139
Line near 59.99967 > far 0 for Eisenbahn 140
Line near 60 > far 0 for Eisenbahn 144
Line near 60.00001 > far 0 for Eisenbahn 145
Arc near 56.8584 > far 0 for Eisenbahn 146
Arc near 56.85841 > far 0 for Eisenbahn 147
Arc near 56.85843 > far 0 for Eisenbahn 148
Arc near 72.93145 > far 0 for Eisenbahn 149
Arc near 4.77981 > far 0 for Eisenbahn 406
Line near 7 > far 0 for Straße 25
Line near 60 > far 0 for Straße 73
Arc near 43.76994 > far 0 for Straße 97
Arc near 43.76992 > far 0 for Straße 98

Gleismauerbau2
Arc near 48.6691 > far 0 for Eisenbahn 294
Arc near 61.89311 > far 0 for Straße 122
Arc near 61.89329 > far 0 for Straße 124
Arc near 48.83204 > far 0 for Straße 144
Line near 60 > far 0 for Straße 400
Line near 60 > far 0 for Straße 403

Neue Anlage_Test_288 - repariert
Cubic near 76.67825 > far 0 for Eisenbahn 222
Cubic near 77.51543 > far 0 for Eisenbahn 223
Cubic near 78.34965 > far 0 for Eisenbahn 224
Line near 60 > far -16.17879 for Eisenbahn 728			<-----
Line near 60 > far -16.17879 for Straßenbahn 57			<-----
Arc near 7.569722 > far -21.23326 for Straßenbahn 72	<-----
Line near 4.997559 > far -32.4624 for Straße 13			<-----
Line near 80 > far 53.87793 for Straße 130				<-----	
Rotator near 74.91347 > far 0 for Straße 303
Arc near 10.00001 > far -0.1558323 for Straße 352		<-----
Line near 73.99999 > far 49.7773 for Straße 455  		<-----
Rotator near 20.36278 > far 0 for Straße 530
Line near 72.39453 > far 7.073486 for Straße 536		<-----
Line near 40 > far -14.45385 for Straße 830				<-----
Arc near 61.33142 > far 17.66124 for Straße 921			<-----
Rotator near 36.81652 > far 0 for Straße 977
Line near 39.55864 > far -12.09861 for Straße 1070		<-----
Line near 51.7168 > far 15.13037 for Wasserwege 61		<-----
...

Nouveau projet 18a
Helix near 67.46526 > far 0 for Eisenbahn 55
...

HSB_Sued

DKW-Schaltung-mit GBS-Fahrstrasse-Normgleis-V16

*/
if (near > far) { //###
	console.log(
		CurveType 
		+ " near " + near + " > far " + far
		+ " for " + TrackSystemText(GleissystemID) + " " + GleisID
);}

		let Winkel, DeltaX, DeltaY, DeltaZ;
		const posX = 12, posY = 13, posZ = 14; // Index in mMatrix

		// Log defect data
		if (isNaN( mMatrix[posX] )) {
			console.log("NaN Error: "
				+ TrackSystemText(GleissystemID) + '-' + GleisID + ' ' + CurveType
			);
			// Replace defect data with initial data to avoid followup errors.
			mMatrix = matrix.identity();
		}

		Gleis.CurveType = CurveType;
		Gleis.Laenge 	= Laenge;
		Gleis.mPos 		= mMatrix;

		// Group node for Gleis
		const classList = global.Gleisart[clsid] 
			+ " " + CurveType
			+ " " + `stil-${stil}`
			+ " " + (global.activeTracks[GleissystemID].includes(GleisID) ? "active" : "inactive")
			+ " " + (near > far ? "near-far" : "")	//### Enable highlighing 
			+ " " + `height=${mMatrix[posZ].toFixed(2)}`	// Height
			// Ein Kamerafahrweg ist immer unsichtbar
			+ " " + (stil == 100000 || (global.unsichtbar.includes(parseInt(stil)) && GleisData != 16) ? "unsichtbar" : "sichtbar");
		const svgGleisGroup = svgAppend(svgGleissystemGroup, {
			svg_tag	: `g`,
			id		: `G${GleissystemID}-${GleisID}`,
			"class"	: classList,
		});

		// Calculate end point and create svg curve
		const KRUEMMUNG_EPSILON = 0.0001;
		if (Gleis.BezierPoints) { // SVG for tracks for CurveType: Cubic, Spline, PolygonalChain, Rotator
			// Claude AI: Create svg curve
			// Die Kontrollpunkte werden jetzt vollständig über mMatrix (inkl. Bin) projiziert, 
			// statt lokale (x,y) zu verwenden + 2D-only matrixToTransform() auf den <path>.
			// Andernfalls geht bei stark gekippten Frames der lokale z-Anteil (Bin.x/Bin.y * localZ)
			// verloren -> falsche Endpunkte bei steilen Gleisen (z.B. Rotator mit a=0).
			let d = "";
			for (let I = 0; I < Gleis.BezierPoints.length; I++) {
				const Index = (near > far ? Gleis.BezierPoints.length - 1 - I : I);	// reverse / normal
				const BezierPoints = Gleis.BezierPoints[Index];

				// BezierPoints = [ [B1X, B1Y, B1Z], [B2X, B2Y, B2Z], [B3X, B3Y, B3Z], [B4X, B4Y, B4Z], arcLength ];
				const [B1X, B1Y] = projectPoint(mMatrix, BezierPoints[0]);
				const [B2X, B2Y] = projectPoint(mMatrix, BezierPoints[1]);
				const [B3X, B3Y] = projectPoint(mMatrix, BezierPoints[2]);
				const [B4X, B4Y] = projectPoint(mMatrix, BezierPoints[3]);
				//const arcLength = BezierPoints[4];
				
				if (d === "") {
					d += (near > far
							? `M ${B4X} ${B4Y} C ${B3X} ${B3Y} ${B2X} ${B2Y} ${B1X} ${B1Y}`
							: `M ${B1X} ${B1Y} C ${B2X} ${B2Y} ${B3X} ${B3Y} ${B4X} ${B4Y}`
						)
				} else {
					d += (near > far
							? ` S ${B2X} ${B2Y} ${B1X} ${B1Y}`
							: ` S ${B3X} ${B3Y} ${B4X} ${B4Y}`
						)
				}
				
			}
			
			svgAppend(svgGleisGroup, {
				svg_tag				: `path`,
				//class				: `stil-${stil}`,
				d 					: d,
				// KEIN transform mehr nötig: die obigen Koordinaten sind bereits vollständig
				// 3D-projizierte Welt-Koordinaten (inkl. gespiegeltem y).
			});

			// Calculate end point
			const t 	= (near > far ? 0 : 1);
			const Index = (near > far ? 0 : Gleis.BezierPoints.length - 1);
			[DeltaX, DeltaY, DeltaZ, Winkel] = calcBezierCurve(Gleis.BezierPoints[Index], t);

		} else if (CurveType === 'Clothoid') {
			let points, svgPath;
			[points, svgPath] = calcClothoidCurve(
				Gleis.Clothoid.A,
				Gleis.Clothoid.L1,
				Gleis.Clothoid.L2,
				Gleis.Clothoid.RotationCCW
			);
			DeltaX		= points.End.x;
			DeltaY 		= points.End.y;
			DeltaZ		= points.End.z;
			Winkel		= points.End.Winkel;

			svgAppend(svgGleisGroup, {
				svg_tag				: `path`,
				class				: `stil-${stil}`,
				d 					: svgPath,	 //### Bug: adjustment for near>far required
				transform 			: matrixToTransform(mMatrix)
			});

			// Adjust Gleis.mPos
			Gleis.mPos = [
					mMatrix,
					matrix.translate(points.Pos.x, points.Pos.y, points.Pos.z),
				].reduce(matrix.multiply);

		} else if (Math.abs(Kruemmung) < KRUEMMUNG_EPSILON) { // Show line. The svg-arc is not shown if the radius is too big
			/* SVG: Gerades Gleis
			Alternativen (line erlaubt allerdings kein text-path, daher wird path verwendet)
			a) <line x1="0" y1="0" x2="Laenge" y2="0" transform="translate(PosX PosY) matrix(DirX DirY NorX NorY 0 0)"/>
			b) <line x1="0" y1="0" x2="Laenge" y2="0" transform="matrix(DirX DirY NorX NorY PosX PosY)"/>
			b) <path d="M 0 0 H Laenge" transform="matrix(DirX DirY NorX NorY PosX PosY)"/>
			*/
			DeltaX		= Laenge;
			DeltaY 		= 0;
			DeltaZ		= 0;
			Winkel		= 0;

			svgAppend(svgGleisGroup, {
				svg_tag				: `path`,
				//class				: `stil-${stil}`,
				d 					: //`M 0 0 H ${Laenge}`,
									  `M ${near} 0 L ${far} 0`,	//### This is the correct placement of the track
																//    however, all of this should be part mMatrix / mPos / mEnd 
																//	  to allow correct placement of switches, signals and contacts
									  /*
									  (near > far 				//### This works only if far == 0
										? `M ${Laenge} 0 L 0 0`	// reverse
										: `M 0 0 H ${Laenge}`	// normal
										),
									  */	
									  transform 			: matrixToTransform(mMatrix)
			});

		} else { // Show arc. Kruemmung != 0

			/* SVG: Gebogenes Gleis

			Winkel (rad) = Kruemmung * Laenge
			ArcFlag = 0 für Winkel im Bereich -180° bis +180°, ansonsten 1
			SweepFlag = 1 für Winkel >= 0, 0 für Winkel < 0
			Radius = 1 / Kruemmung
			DeltaX = sin(Winkel) * Radius
			DeltaY = (1-cos(Winkel)) * Radius

			Kreisbogen als Spezialfall eines Ausschnittes einer allgenmeinen Ellipse:
			<path d="M PosX PosY A RadiusX RadiusY RotateX ArcFlag SweepFlag PosEndX PosEndY" />
			PosX = 0			x-Koordinate des Anfangpunktes
			PosY = 0			Y-Koordinate des Anfangpunktes
			RadiusX = Radius	Radius der x-Achse der Ellipse
			RadiusY	= Radius	Radius der y-Achse der Ellipse
			RotateX = 0 		Rotation der x-Achse der Ellipse in Grad (0: keine Rotation)
			ArcFlag = 0			large-arc-flag: kurzer Weg um die Ellipse: 0, langer Weg um die Ellipse: 1
			SweepFlag = ...		Zeichnung entgegen den Uhrzeigersinn: 0, Zeichnung mit dem Uhrzeigersinn: 1
			PosEndX = DeltaX	x-Koordinate des Endpunktes
			PosEndY = DeltaY	Y-Koordinate des Endpunktes

			Dies ergibt folgende vereinfachte Form:
			<path d="M 0 0 A Radius Radius 0 ArcFlag SweepFlag DeltaX DeltaY" />
			*/
			Winkel 	= Kruemmung * Laenge;
			const Radius	= 1 / Kruemmung;

			DeltaX		= Math.sin(Winkel) * Radius;
			DeltaY 		= (1 - Math.cos(Winkel)) * Radius;
			DeltaZ		= 0;

			const ArcFlag 	= ( Winkel <= Math.PI && Winkel >= -Math.PI ? 0 : 1); 	// small respective large arc of the curve
			const SweepFlag = ( Winkel >= 0 ? 1 : 0);								// counter clock wise respective clock wise

			svgAppend(svgGleisGroup, {
				svg_tag				: `path`,
				//class				: `stil-${stil}`,
				d 					: (near > far //###
										? `M ${DeltaX} ${DeltaY} A ${Radius} ${Radius} 0 ${ArcFlag} ${1-SweepFlag} 0 0`	// reverse
										: `M 0 0 A ${Radius} ${Radius} 0 ${ArcFlag} ${SweepFlag} ${DeltaX} ${DeltaY}`	// normal
										),
				transform 			: matrixToTransform(mMatrix)
			});

		}

		// Calculate end of track
		if (Gleis.Helix) {
			Gleis.mEnd = Gleis.Helix.mEnd;
		} else {
			Gleis.mEnd = projectFrame(mMatrix, [DeltaX, DeltaY, DeltaZ], Winkel);
		}

		// Swap mPos and mEnd if near > far //### I guess that's incomplete
		if (near > far) {
			const tempPos = Gleis.mEnd;
			Gleis.mEnd = Gleis.mPos;
			Gleis.mPos = tempPos;
		}

		let flipText, flipInfo = "";

		if (Key_Id) {
			// Flip mirrored texts
			if (matrix.isFlipped(Gleis.mEnd)) {
				flipText = ``;	//` scale(1 1)`;
			} else {
				flipText = ` scale(1 -1)`;
			}		
			// Show text of Weiche at the end of the track
			let Code = "W";
			if (GleisData == 18 || GleisData == 19) { Code = "DWK"; }
			if (GleisData == 20 || GleisData == 21) { Code = "T-W"; }
			registerLabel(svgAppend(svgGleisGroup, {
				svg_tag			: `text`,
				id				: `W${Key_Id}`,
				text			: `${Code}${Key_Id}`,
				dy				: `1em`, 		// Shift text below the track
				"class"			: `WeicheText` + (near > far ? "" : ` text-anchor-end`),	//###
				transform 		: matrixToTransform(Gleis.mEnd)
								  + flipText,
			}), { kind: "weiche", anchor: (near > far ? "start" : "end") });	// Text kann bei Überlappung verschoben werden (EEP_Gleisplan_LabelLayout.js)
		}

		// Calculate mid point
		if (Gleis.BezierPoints) { // Mid point for CurveType: Cubic, Spline, PolygonalChain, Rotator

			[DeltaX, DeltaY, DeltaZ, Winkel] = calcBezierPoint(Gleis.BezierPoints, Laenge / 2, near, far) 

		} else if (CurveType === 'Clothoid') {
			let points, svgPath;
			[points, svgPath] = calcClothoidCurve(
				Gleis.Clothoid.A,
				0,
				Gleis.Clothoid.L1 + (Gleis.Clothoid.L2 - Gleis.Clothoid.L1)/2,
				Gleis.Clothoid.RotationCCW
			);
			DeltaX			= points.End.x;
			DeltaY 			= points.End.y;
			DeltaZ			= points.End.z;
			Winkel			= points.End.Winkel;

		} else if (Math.abs(Kruemmung) < KRUEMMUNG_EPSILON) { // The svg-arc is not shown if the radius is too big
			DeltaX			= Laenge / 2;
			DeltaY			= 0;
			DeltaZ			= 0;
			Winkel			= 0;

		} else {  // Kruemmung != 0
			Winkel 	= Kruemmung * Laenge / 2;
			// const ArcFlag 	= ( Winkel <= Math.PI && Winkel >= -Math.PI ? 0 : 1);
			// const SweepFlag = ( Winkel >= 0 ? 1 : 0);
			const Radius	= 1 / Kruemmung;

			DeltaX 			= Math.sin(Winkel) * Radius;
			DeltaY 			= (1 - Math.cos(Winkel)) * Radius;
			DeltaZ			= 0;
		}

		if (Gleis.Helix) {
			Gleis.mMid = Gleis.Helix.mMid;
		} else {
			Gleis.mMid = projectFrame(mMatrix, [DeltaX, DeltaY, DeltaZ], Winkel);
		}

		// Flip mirrored texts
		if (matrix.isFlipped(Gleis.mMid)) {
			//flipInfo = " flip";
			flipText = ``;	//` scale(1 1)`;
		} else {
			flipText = ` scale(1 -1)`;
		}

		// Rotate text to upper left (works fine except for some Helix tracks)
		const [ roll_x, pitch_y, yaw_z ] = matrix.euler_angles(Gleis.mMid);
		//flipInfo += " " + (yaw_z*180/Math.PI).toFixed(1) + "°";
		if (   (yaw_z < -Math.PI/2 + (flipText == `` ? -0.01 : +0.01)) 
			|| (yaw_z >  Math.PI/2 + (flipText == `` ? -0.01 : +0.01)) ) {
			//flipInfo += ` rotate`;
			flipText += ` rotate(180)`;
		}

if (false) { // Experiment for using quaternions
const Q = matrix.quaternion(Gleis.mMid);

if (CurveType == "Helix" ) {
	const [ DirX, DirY, DirZ, d0, 
		NorX, NorY, NorZ, n0, 
		BinX, BinY, BinZ, b0, 
		PosX, PosY, PosZ, scale ] = Gleis.mMid;
	console.log( 
		  "\t" 			+ CurveType 
		+ "\t" 			+ GleissystemID + "\t" + GleisID
		+ "\tLaenge\t"	+ Laenge
		+ "\tWinkel°\t"	+ ( Winkel  *180/Math.PI ) + "°"
		+ "\troll°\t"	+ ( roll_x  *180/Math.PI ) + "°"
		+ "\tpitch°\t"	+ ( pitch_y *180/Math.PI ) + "°"
		+ "\tyaw°\t"	+ ( yaw_z   *180/Math.PI ) + "°"
		//+ "\tKruemmung\t"	+ Kruemmung
		//+ "\tRadius\t"	+ (1 / Kruemmung)
		+ "\tArcFlag\t" + ( Winkel <= Math.PI && Winkel >= -Math.PI ? 0 : 1)
		+ "\taxis\t" 	+ Q.axis
		//+ "\tDelta\t" 	+ DeltaX + "\t" + DeltaY
		//+ "\tmMatrix\t" + DirX + "\t" + DirY + "\t" + DirZ + "\t" + d0
		//+ "\t"          + NorX + "\t" + NorY + "\t" + NorZ + "\t" + n0
		//+ "\t"          + BinX + "\t" + BinY + "\t" + BinZ + "\t" + b0
		//+ "\t"          + PosX + "\t" + PosY + "\t" + PosZ + "\t" + scale
		+ "\t"          + flipInfo
		+ "\t"          + flipText
		+ "\ttrace\t"	+ Q.tr
		+ "\tQ\t"		+ Q.w + "\t" + Q.x + "\t" + Q.y + "\t" + Q.z 
		+ "\tnorm\t"	+ Q.norm
		+ "\tdet3x3\t"	+ matrix.det3x3(Gleis.mMid)
		+ "\tdet\t"		+ matrix.det(Gleis.mMid)
	);
}
}

		// Group for all texts in the middle of the track
		const svgGleisMid = svgAppend(svgGleisGroup, {
			svg_tag	: `g`,
			transform 			: matrixToTransform(Gleis.mMid) 
								  + flipText,
		});
		
		// show GleisID in the middle above the track (left-adjusted)
		registerLabel(svgAppend(svgGleisMid, {
			svg_tag				: `text`,
			text				: `${GleisID}` + flipInfo,
			dx					: `-0.5em`, 	// Shift text left to move it a little bit towards the center
			dy					: `-0.1em`, 	// Shift text up
			"class"				: `GleisID`,
			//transform			: matrixToTransform(Gleis.mMid) 
 			//					  + flipText,
		}), { kind: "gleis", anchor: "start" });
		// show CurveType in the middle above the track (right-adjusted)
		if (CurveType != 'classic' && CurveType != 'EEPCurve') {
		registerLabel(svgAppend(svgGleisMid, {
			svg_tag				: `text`,
			text				: `${CurveType}`,
			dx					: `-0.7em`, 	// Shift text left to get away from GleisID
			dy					: `-0.1em`, 	// Shift text up
			"class"				: `CurveType`,
			//transform			: matrixToTransform(Gleis.mMid) 
 			//					  + flipText,
		}), { kind: "gleis", anchor: "end" });
		}
		// show Gleisstil in the middle below the track (right-adjusted)
		registerLabel(svgAppend(svgGleisMid, {
			svg_tag				: `text`,
			text				: `${stil}`,
			dx					: `-0.1em`, 	// Shift text left a little bit
			dy					: `1em`, 		// Shift text below the track
			"class"				: `Stil`,
			//transform			: matrixToTransform(Gleis.mMid) 
 			//					  + flipText,
		}), { kind: "gleis", anchor: "end" });
		// show Hoehe in the middle below the track (left-adjusted)
		registerLabel(svgAppend(svgGleisMid, {
			svg_tag				: `text`,
			text				: `[${mMatrix[posZ].toFixed(2)}m]`,
			dx					: `+0.1em`, 	// Shift text right a little bit
			dy					: `1em`, 		// Shift text below the track
			"class"				: `Hoehe`,
			//transform			: matrixToTransform(Gleis.mMid) 
 			//					  + flipText,
		}), { kind: "gleis", anchor: "start" });

		if (global.__showCircles__) {	// debugging feature
			if (Gleis.BezierPoints) { // Debugging for CurveType: Cubic, Spline, PolygonalChain, Rotator
				for (const BezierPoints of Gleis.BezierPoints) {
					// Claude AI
					const [p0x, p0y] = projectPoint(mMatrix, BezierPoints[0]);
					const [p1x, p1y] = projectPoint(mMatrix, BezierPoints[1]);
					const [p2x, p2y] = projectPoint(mMatrix, BezierPoints[2]);
					const [p3x, p3y] = projectPoint(mMatrix, BezierPoints[3]);

					svgAppend(svgGleisGroup, { svg_tag: `circle`, r: 0.2, transform: `translate(${p0x} ${p0y})` });
					svgAppend(svgGleisGroup, { svg_tag: `circle`, r: 0.4, transform: `translate(${p1x} ${p1y})` });
					svgAppend(svgGleisGroup, { svg_tag: `circle`, r: 0.8, transform: `translate(${p2x} ${p2y})` });
					svgAppend(svgGleisGroup, { svg_tag: `circle`, r: 1.2, transform: `translate(${p3x} ${p3y})` });
				}
			}

			if (Gleis.Helix) {
				// Show circle at Point
				svgAppend(svgGleisGroup, {
					svg_tag				: `circle`,
					r					: 0.2, //Gleis.Helix.a,
					transform 			: matrixToTransform(Gleis.Helix.mPos),
				});
				svgAppend(svgGleisGroup, {
					svg_tag				: `circle`,
					r					: 0.3,
					transform 			: matrixToTransform(Gleis.Helix.mMid),
				});
				svgAppend(svgGleisGroup, {
					svg_tag				: `circle`,
					r					: 0.4,
					transform 			: matrixToTransform(Gleis.Helix.mEnd),
				});
			}
			// Show circle at Point
			svgAppend(svgGleisGroup, {
				svg_tag				: `circle`,
				r					: 1.5,
				transform 			: matrixToTransform(Gleis.mPos),
			});
			svgAppend(svgGleisGroup, {
				svg_tag				: `circle`,
				r					: 0.5,
				transform 			: matrixToTransform(Gleis.mMid),
			});
			svgAppend(svgGleisGroup, {
				svg_tag				: `circle`,
				r					: 1,
				transform 			: matrixToTransform(Gleis.mEnd),
			});
		}

		// Verwendeten Bereich der Anlage anpassen
		const border = 20;
		global.usedArea.min.x = Math.min( global.usedArea.min.x, Gleis.mPos[posX]-border, Gleis.mMid[posX]-border, Gleis.mEnd[posX]-border );
		global.usedArea.min.y = Math.min( global.usedArea.min.y, Gleis.mPos[posY]-border, Gleis.mMid[posY]-border, Gleis.mEnd[posY]-border );
		global.usedArea.min.z = Math.min( global.usedArea.min.z, Gleis.mPos[posZ],        Gleis.mMid[posZ],        Gleis.mEnd[posZ] );

		global.usedArea.max.x = Math.max( global.usedArea.max.x, Gleis.mPos[posX]+border, Gleis.mMid[posX]+border, Gleis.mEnd[posX]+border );
		global.usedArea.max.y = Math.max( global.usedArea.max.y, Gleis.mPos[posY]+border, Gleis.mMid[posY]+border, Gleis.mEnd[posY]+border );
		global.usedArea.max.z = Math.max( global.usedArea.max.z, Gleis.mPos[posZ],        Gleis.mMid[posZ],        Gleis.mEnd[posZ] );

		// Signale
		// <Meldung Position="3449.492" ParaOderAnti="1" fireOnPara="1" fireOnAnti="0" name="PI5_HP02_Form_oVSig" Key_Id="5" >
		//     <KontaktZiel>6</KontaktZiel>
		//     <Signal stellung="1" wirkungsdistanz="10856.51"/>
		// </Meldung>

		// Fahrstraßen: name = "system\Route_SignalS.3ds" bzw. "system\Route_SignalZ.3ds"
		// <Meldung Position="5190" ParaOderAnti="1" fireOnPara="1" fireOnAnti="0" name="system\Route_SignalS.3ds" Key_Id="141" Routes="7">
		// 		<KontaktZiel>0</KontaktZiel>
		// 		<Signal stellung="1" wirkungsdistanz="0" StopAt="0" Delay="0" ActDelay="0"/>
		// 		<Route Target="142" Start="5190" Stop="1890" Color="13">
		//		...
		// </Meldung>

		const trackSignalEntries = global.trackSignals[GleissystemID][GleisID];
		if (trackSignalEntries) {
		for (const trackSignalEntry of trackSignalEntries) {
			const Meldung		= trackSignalEntry.Meldung;
			const SignalID		= Meldung.getAttribute("Key_Id");
			const signalType	= trackSignalEntry.signalType;
			const Position		= (near > far	//###
									? Laenge - trackSignalEntry.Position	// reverse
									: trackSignalEntry.Position 			// normal
									);
			const Distanz		= Meldung.getElementsByTagName("Signal")[0].getAttribute("wirkungsdistanz") / 100; // Abstand zwischen Vor-und Hauptsignal
			const ParaOderAnti 	= trackSignalEntry.ParaOderAnti; //Gleisrichtung: 0 = Ende -> Anfang, 1 = Anfang -> Ende

			// Calculate point
			if (Gleis.BezierPoints) { // SVG for signals for CurveType: Cubic, Spline, PolygonalChain, Rotator
				//const t = (Laenge ? Position / Laenge : 0);
				//const BezierPoints = Gleis.BezierPoints[0]; // Incomplete: only the first segment is supported yet
				//[DeltaX, DeltaY, DeltaZ, Winkel] = calcBezierCurve(BezierPoints, t);
				[DeltaX, DeltaY, DeltaZ, Winkel] = calcBezierPoint(Gleis.BezierPoints, Position, near, far) 

			} else if (CurveType === 'Clothoid') {
				let points, svgPath;
				[points, svgPath] = calcClothoidCurve(
					Gleis.Clothoid.A,
					0,
					Gleis.Clothoid.L1 + Position * (Gleis.Clothoid.L1 < Gleis.Clothoid.L2 ? +1 : -1),
					Gleis.Clothoid.RotationCCW
				);
				DeltaX			= points.End.x;
				DeltaY 			= points.End.y;
				DeltaZ			= points.End.z;
				Winkel			= points.End.Winkel;

			} else if (Math.abs(Kruemmung) < KRUEMMUNG_EPSILON) { // The svg-arc is not shown if the radius is too big
				DeltaX			= Position;
				DeltaY			= 0;
				DeltaZ			= 0;
				Winkel 			= 0;

			} else { // Kruemmung != 0
				Winkel 			= Kruemmung * Position;
				const Radius 	= 1 / Kruemmung;

				DeltaX 			= Math.sin(Winkel) * Radius;
				DeltaY 			= (1 - Math.cos(Winkel)) * Radius;
				DeltaZ			= 0;
			}

			Meldung.mPos = projectFrame(
				mMatrix, 
				[DeltaX, DeltaY, DeltaZ], 
				Winkel					// Rotate to tangent of track
				+ ParaOderAnti*Math.PI 	// Rotate text to the side of the symbol
			);

			const SignalCode = (  signalType === "FStart" 	? "S"
								: signalType === "FZiel" 	? "S"
								: signalType === "pre" 		? "P"
								: signalType === "StopAt" 	? "H"
								: 							  "S"
							   );

			// Group node for Signal (Multiple groups for pre signal, stop position and main signal?)
			const svgSignalGroup = svgAppend(svgGleisGroup, {
				svg_tag		: `g`,
				id			: `${SignalCode}${SignalID}`,
				class		: `Signal`,
				transform	: matrixToTransform(Meldung.mPos),
			});

			if (global.__showCircles__) {	// debugging feature
				// Show circle at Point
				svgAppend(svgSignalGroup, {
					svg_tag				: `circle`,
					r					: 1,
					//transform			: matrixToTransform(Meldung.mPos),
				});
			}

			// Flip mirrored symbols (for some reasons it' the other way around than for texts)
			if (matrix.isFlipped(Meldung.mPos)) {
				flipText = ` scale(1 -1)`;
			} else {
				flipText = ``;	//` scale(1 1)`;
			}
		
			// Show symbol for Signal / Fahrstraße
			svgAppend(svgSignalGroup, {
				svg_tag				: `use`,
				href				: (	  signalType === "FStart" 	? "#SymbolFStart"
										: signalType === "FZiel" 	? "#SymbolFZiel"
										: signalType === "pre" 		? "#SymbolPreSignal"
										: signalType === "StopAt" 	? "#SymbolStopAt"
										: 							  "#SymbolSignal"
									  ),
				transform 			: //matrixToTransform(Meldung.mPos)
 										//+ 
										` translate(-10 0)` // required to move the origin of the symbol to the Signal position
										+ flipText,
			});
			
			// Flip mirrored texts
			if (matrix.isFlipped(Meldung.mPos)) {
				flipText = ``;	//` scale(1 1)`;
			} else {
				flipText = ` scale(1 -1)`;
			}
			
			// Show text of Signal / Fahrstraße
			if (signalType !== "pre") { // do not show any text for pre-signals or stop points
			registerLabel(svgAppend(svgSignalGroup, {
				svg_tag				: `text`,
				text				: (	  signalType === "FStart"	? _('FStartKurz')
										: signalType === "FZiel"	? _('FZielKurz')
										: signalType === "pre" 		? 'S'
										: signalType === "StopAt" 	? 'H'
										: 						  	  'S'
									  )
										+ SignalID
										+ (signalType === "pre" ? ` ${Distanz.toFixed(0)}m` : ``)
										,
				"dy"				: `-2.3`, 								// Shift text above the symbol (fixed distance: the baseline matches the fixed height of the symbol)
				transform 			: //matrixToTransform(Meldung.mPos)
										//+ 
										flipText,
			}), { kind: "signal", anchor: "middle" });
			} // do not show any text for pre-signals

		}} // Signale

		// Kontakte
		for (const Kontakt of Gleis.getElementsByTagName("Kontakt")) {
			const Position		= (near > far 	//###
									? Laenge - Kontakt.getAttribute("Position") / 100	// reverse
									: Kontakt.getAttribute("Position") / 100 			// normal
									);
			const ParaOderAnti 	= Kontakt.getAttribute("ParaOderAnti"); // Gleisrichtung 1: 0 = Ende -> Anfang, 1 = Anfang -> Ende
			const fireOnPara  	= Kontakt.getAttribute("fireOnPara"); 	// Kontakt aktiv für Gleisrichtung 1
			const fireOnAnti  	= Kontakt.getAttribute("fireOnAnti"); 	// Kontakt aktiv für Gleisrichtung 2
			const SetType 		= Number(Kontakt.getAttribute("SetType"));
			const SetValue 		= Number(Kontakt.getAttribute("SetValue"));
			const Wartender		= Number(Kontakt.getAttribute("Wartender"));
			const KontaktZiel 	= Number(Kontakt.getAttribute("KontaktZiel"));
			const LuaFn 		= Kontakt.getAttribute("LuaFn");

			if (!global.Kontakte.Anzahl) {
				global.Kontakte.Anzahl = 0;				// initialization
			}
			const KontaktID = global.Kontakte.Anzahl; 	// arbitrary identfication
			global.Kontakte[KontaktID] = Kontakt;
			global.Kontakte.Anzahl += 1;

			// Calculate point
			if (Gleis.BezierPoints) { // SVG for contacts for CurveType: Cubic, Spline, PolygonalChain, Rotator
				[DeltaX, DeltaY, DeltaZ, Winkel] = calcBezierPoint(Gleis.BezierPoints, Position, near, far) 

			} else if (CurveType === 'Clothoid') {
				let points, svgPath;
				[points, svgPath] = calcClothoidCurve(
					Gleis.Clothoid.A,
					0,
					Gleis.Clothoid.L1 + Position * (Gleis.Clothoid.L1 < Gleis.Clothoid.L2 ? +1 : -1),
					Gleis.Clothoid.RotationCCW
				);
				DeltaX			= points.End.x;
				DeltaY 			= points.End.y;
				DeltaZ			= points.End.z;
				Winkel			= points.End.Winkel;

			} else if (Math.abs(Kruemmung) < KRUEMMUNG_EPSILON) { // The svg-arc is not shown if the radius is too big
				Winkel 			= 0;
				DeltaX			= Position;
				DeltaY			= 0;
				DeltaZ			= 0;

			} else { // Kruemmung != 0
				Winkel 			= Kruemmung * Position;
				const Radius 	= 1 / Kruemmung;

				DeltaX 			= Math.sin(Winkel) * Radius;
				DeltaY 			= (1 - Math.cos(Winkel)) * Radius;
				DeltaZ			= 0;
			}

			Kontakt.mPos = projectFrame(
				mMatrix, 
				[DeltaX, DeltaY, DeltaZ], 
				Winkel									// Rotate to tangent of track
				+ (ParaOderAnti == 1 ? Math.PI : 0) 	// Rotate text to the side of the symbol
			);
				
			// Show text of Kontakt 
			let KontaktTypText = getKontaktIcon(GleissystemID, SetType, SetValue);
			if (SetType === 1280 && Wartender != 0) {	// Einfahrt Depot, Depot-ID = Wartender
				KontaktTypText = Wartender + KontaktTypText;
			}
			if (SetType === 1536) {						// Ausfahrt Depot, Depot-ID = SetValue
				KontaktTypText = KontaktTypText + SetValue;
			}
			if (LuaFn && LuaFn !== "") {				// Lua-Function 
				KontaktTypText += "Lua";
			}
			if (KontaktZiel > 0 ) {
				const Ziel = global.KontaktZiele[KontaktZiel];
				KontaktTypText += (Ziel ? `${Ziel.Code}${Ziel.ID}` : `?${KontaktZiel}`);
			}

			// Group node for Kontakt
			const svgKontaktGroup = svgAppend(svgGleisGroup, {
				svg_tag		: `g`,
				id			: `K${KontaktID}`,
				class		: `Kontakt`,
				transform	: matrixToTransform(Kontakt.mPos),
			});

			if (global.__showCircles__) {
				// Show circle at Point
				svgAppend(svgKontaktGroup, {
					svg_tag				: `circle`,
					r					: 2,
					//transform 			: matrixToTransform(Kontakt.mPos),
				});
			}
			
			// Flip mirrored symbols
			if (matrix.isFlipped(Kontakt.mPos)) {
				flipText = ` scale(1 -1)`;
			} else {
				flipText = ``;	//` scale(1 1)`;
			}
			
			// Show symbols for Kontakt
			if (fireOnPara == 1) {
				svgAppend(svgKontaktGroup, {
					svg_tag				: `use`,
					"href"				: `#SymbolKontakt`,
					transform 			: //matrixToTransform(Kontakt.mPos)
											(ParaOderAnti !== fireOnPara ? ` rotate(180)` :"")		// Rotate symbol to the side of the symbol
											+ ` translate(-10 0)` // required to move the origin of the symbol to the Kontakt position
											+ flipText,
				});
			}
			
			if (fireOnAnti == 1) {
				svgAppend(svgKontaktGroup, {
					svg_tag				: `use`,
					"href"				: `#SymbolKontakt`,
					transform 			: //matrixToTransform(Kontakt.mPos)
											//+ 
											(ParaOderAnti == fireOnAnti ? ` rotate(180)` :"")		// Rotate symbol to the side of the symbol
											+ ` translate(-10 0)` // required to move the origin of the symbol to the Kontakt position
											+ flipText,
				});
			}

			// Flip mirrored texts
			if (matrix.isFlipped(Kontakt.mPos)) {
				flipText = ``;	//` scale(1 1)`;
			} else {
				flipText = ` scale(1 -1)`;
			}
			
			// Show text on one side only
			if (KontaktTypText != "") {
				registerLabel(svgAppend(svgKontaktGroup, {
					svg_tag				: `text`,
					text				:  KontaktTypText,
					"dy"				: `-2.3`, 												// Shift text above the symbol (fixed distance: the baseline matches the fixed height of the symbol)
					transform 			: //matrixToTransform(Kontakt.mPos)
											//+ 
											(ParaOderAnti !== fireOnPara ? ` rotate(180)` :"")		// Rotate text to the side of the symbol
											+ flipText,
				}), { kind: "kontakt", anchor: "middle" });
			}

		} // Kontakte

	} // Gleise

	// Process virtual connections
	let svgVirtuellGroup;
	for ( const GleisID in global.trackConnections[GleissystemID]) {

		const Gleis   = global.Gleissysteme[GleissystemID][GleisID];

		const connections = global.trackConnections[GleissystemID][GleisID] || {};
		for (const Anschluss in connections) {	// Anfang, Ende, EndeAbzweig, EndeKoAbzweig

			const connection = connections[Anschluss];
			//if (connection.Flags && Anschluss === "Anfang") {	// Virtual connection in backward direction
			if (connection.Flags && connection.Direction === 1) {	// Virtual connection (in first direction)

				const connectedGleis   = global.Gleissysteme[GleissystemID][connection.GleisID];

				const vPos = ( Anschluss            === "Anfang" ? Gleis.mPos          : Gleis.mEnd          );	// Start of virtual connection	
				const vEnd = ( connection.Anschluss === "Anfang" ? connectedGleis.mPos : connectedGleis.mEnd );	// End of virtual connection	

/*
console.log( "Gleis\t"
	+ GleissystemID + " " + GleisID + "\t"
	+ Anschluss + "\t"
	+ vPos[12].toFixed(1)  + "\t" + vPos[13].toFixed(1)  + "\t" // + vPos[14].toFixed(1) + "\t"
	+ "Gleis\t"
	+ GleissystemID + " " + connection.GleisID + "\t"
	+ connection.Anschluss+ "\t"
	+ vEnd[12].toFixed(1)  + "\t" + vEnd[13].toFixed(1)  + "\t" // + vEnd[14].toFixed(1) + "\t"
)
*/

				if (!svgVirtuellGroup) {
					svgVirtuellGroup = svgAppend(svgGleissystemGroup, {
						svg_tag	: `g`,
						id		: `V${GleissystemID}`,
						"class"	: "virtual",
					});	
				}
				svgAppend(svgVirtuellGroup, {
					svg_tag	: `path`,
					id		: `V${GleissystemID}-${GleisID}-${Anschluss}`,
					d 		: `M ${vPos[12]} ${-vPos[13]} L ${vEnd[12]} ${-vEnd[13]}`,
				});

			}
		}
	}
} // end function createSVGforGleissystem

function createSVGfinalize(SVGfragment, sutrackp) {

	const SVGfragmentBackground 	= document.createDocumentFragment();

	createSVGforGleisobjekte(SVGfragmentBackground);
	createSVGforRahmen(SVGfragmentBackground, sutrackp);

	createSVGforKameras(SVGfragment, sutrackp);

	// Now we can append the fragments to the svg node
	// Order: 1. Gleisobjekte (Flächen), 2. Rahmen, 3. Gleise (Linien), 4. Kameras
	document.getElementById("sutrackpSVG").appendChild(SVGfragmentBackground);
	document.getElementById("sutrackpSVG").appendChild(SVGfragment);

	global.timestamp.svgCreated = Date.now();
	console.log('create svg:' + (global.timestamp.svgCreated - global.timestamp.fileParsed) / 1000 + 'sec');
}

function createSVGforGleisobjekte(SVGfragment) {
/*
	in:
		global.Gleisobjekte
		global.Gleissysteme
		global.TrackSystemCode

	mod:
		document.getElementById("CheckboxGleisobjekt")
		SVGfragment

*/

	// Process Gleisobjekte
	// to be discussed: should Gleisobjekt get aktiv/inaktiv status? (current: no - this could be a feature)

	let svgGleisobjekteGroup;
	for (const GleisobjektID in global.Gleisobjekte) {
		const Gleisobjekt = global.Gleisobjekte[GleisobjektID];
		const GleissystemID = Gleisobjekt.GleissystemID;				// GleissystemID of Gleisobjekt

		let minX, minY, maxX, maxY;
		const points = [];
		for (const i in Gleisobjekt.Gleise) {
			const GleissystemID = Gleisobjekt.Gleise[i].GleissystemID;	// GleissystemID of Gleis
			const GleisID 		= Gleisobjekt.Gleise[i].GleisID;

			const Gleis = global.Gleissysteme[GleissystemID][GleisID];
			if (Gleis) {

				// simplified: calculate outer rectangle
				const posX = 12, posY = 13;

				if (minX === undefined ||
					minX > Gleis.mPos[posX]) { minX = Gleis.mPos[posX]; }
				if (maxX === undefined ||
					maxX < Gleis.mPos[posX]) { maxX = Gleis.mPos[posX]; }
				if (minY === undefined ||
					minY > Gleis.mPos[posY]) { minY = Gleis.mPos[posY]; }
				if (maxY === undefined ||
					maxY < Gleis.mPos[posY]) { maxY = Gleis.mPos[posY]; }

				if (minX > Gleis.mMid[posX]) { minX = Gleis.mMid[posX]; }
				if (maxX < Gleis.mMid[posX]) { maxX = Gleis.mMid[posX]; }
				if (minY > Gleis.mMid[posY]) { minY = Gleis.mMid[posY]; }
				if (maxY < Gleis.mMid[posY]) { maxY = Gleis.mMid[posY]; }

				if (minX > Gleis.mEnd[posX]) { minX = Gleis.mEnd[posX]; }
				if (maxX < Gleis.mEnd[posX]) { maxX = Gleis.mEnd[posX]; }
				if (minY > Gleis.mEnd[posY]) { minY = Gleis.mEnd[posY]; }
				if (maxY < Gleis.mEnd[posY]) { maxY = Gleis.mEnd[posY]; }

				// Collect start- mid- and end-points of Gleise to calculate the convex hull
				//points.push({ x: Gleis.mPos[posX], y: Gleis.mPos[posY], });
				//points.push({ x: Gleis.mMid[posX], y: Gleis.mMid[posY], });
				//points.push({ x: Gleis.mEnd[posX], y: Gleis.mEnd[posY], });

				// Extend the area of the hull a litte bit
				const d = 1;
				points.push({ x: Gleis.mPos[posX]+d, y: Gleis.mPos[posY]+d, });
				points.push({ x: Gleis.mMid[posX]+d, y: Gleis.mMid[posY]+d, });
				points.push({ x: Gleis.mEnd[posX]+d, y: Gleis.mEnd[posY]+d, });

				points.push({ x: Gleis.mPos[posX]+d, y: Gleis.mPos[posY]-d, });
				points.push({ x: Gleis.mMid[posX]+d, y: Gleis.mMid[posY]-d, });
				points.push({ x: Gleis.mEnd[posX]+d, y: Gleis.mEnd[posY]-d, });

				points.push({ x: Gleis.mPos[posX]-d, y: Gleis.mPos[posY]+d, });
				points.push({ x: Gleis.mMid[posX]-d, y: Gleis.mMid[posY]+d, });
				points.push({ x: Gleis.mEnd[posX]-d, y: Gleis.mEnd[posY]+d, });

				points.push({ x: Gleis.mPos[posX]-d, y: Gleis.mPos[posY]-d, });
				points.push({ x: Gleis.mMid[posX]-d, y: Gleis.mMid[posY]-d, });
				points.push({ x: Gleis.mEnd[posX]-d, y: Gleis.mEnd[posY]-d, });
			}
		}
/*console.log('Gleisobjekt ' + GleisobjektID
	+ ' min(' + minX.toFixed(1) + ' ' + minY.toFixed(1) + ') max(' + maxX.toFixed(1) + ' ' + maxY.toFixed(1) + ')'
)*/

		// Create svg group node
		if (!svgGleisobjekteGroup) {		// First Gleisobjekt
			// Show checkbox
			document.getElementById("CheckboxGleisobjekt").classList.remove("hidden");

			// Create svg group node
			svgGleisobjekteGroup = svgAppend(SVGfragment, {
				svg_tag	: `g`,
				id		: `Gleisobjekt`, // optional
				"class"	: `Gleisobjekt`,
			});
		}
		const svgGleisobjektGroup = svgAppend(svgGleisobjekteGroup, {
			svg_tag	: `g`,
			id		: `GO` + GleisobjektID,
			"class"	: `${global.TrackSystemCode[global.TrackSystem[GleissystemID]]}`
						+ ` height=${Gleisobjekt.PosZ.toFixed(2)}`	// Height
		});
		// simplified: show outer rectangle
		// <rect x="50" y="20" width="150" height="150"
		/*
		svgAppend(svgGleisobjektGroup, {
			svg_tag				: `rect`,
			x					: minX,
			y					: minY,
			width				: maxX - minX,
			height				: maxY - minY,
			//transform 			: matrixToTransform(...),
		});
		*/
		// Create svg for convex hull of Gleisobjekt
		// see https://www.nayuki.io/page/convex-hull-algorithm
		const hull = convexhull.makeHull(points);
		const svgPath = hull.map(function(point, i) {
								return (i === 0 ? "M" : " L") + point.x + " " + (-point.y);	// svg: mirrored y-coordinate
							}).join("") + "Z";
		svgAppend(svgGleisobjektGroup, {
			svg_tag				: `path`,
			d					: svgPath,
		});

	}
}

function createSVGforKameras(SVGfragment, sutrackp) {
/*
	in:
		sutrackp.getElementsByTagName("Kammerasammlung")

	mod:
		SVGfragment

*/
	// Process Kameras
/*
		Wendelsteins_Kurvenbrueck_v12

		<Kammera name="Stellwerk West" DOF="0" Dynamic="0" FocalIdx="193" FStopIdx="13" SubDist="100" DOFSubDist="100" DOFShiftNear="9.65" DOFShiftFar="11.96" FOV="0" TakeSwitch="0">
			<Dreibein>
				<Vektor x="-25064" y="-25576" z="2098">Pos</Vektor>
				<Vektor x="0.9711025" y="-0.2179571" z="-9.723549E-02">Dir</Vektor>
				<Vektor x="0.2189948" y="0.975726" z="0">Nor</Vektor>
				<Vektor x="0.0948752" y="-2.129407E-02" z="0.9952614">Bin</Vektor>
			</Dreibein>
		</Kammera>
		Position X:					-250.64	PosX
		Position Y:					-255.76	PosY
		Position Z:					20.98	PosZ
		Neigung X:					0.00
		Neigung Y:					5.58
		Neigung Z:					-12.65
		Sichtfeld:					0.00
		Schärfentiefe:				aus 	DOF (die nachfolgenden Parameter sind dann fix)
		Brennweite:					100.00	Brennweite[FocalIdx]
		Blendenwert:				f/3.6	Blende[FStopIdx]
		Objektentfernung:			100.0	SubDist
		Hyperfokale Entfernung: 	935.48
		Vor dem Zielobjekt:			9.65	DOFShiftNear
		Hinter dem Zielobjekt:		11.96	DOFShiftFar
		Objektentfernung:			100.0	DOFSubDist

		<Kammera name="Einfahrsignal West" DOF="0" Dynamic="0" FocalIdx="193" FStopIdx="13" SubDist="100" DOFSubDist="100" DOFShiftNear="9.65" DOFShiftFar="12.965" FOV="0" TakeSwitch="0">
			<Dreibein>
				<Vektor x="-45815.86" y="-23729.89" z="1437.605">Pos</Vektor>
				<Vektor x="7403.506" y="-2208.023" z="35.84314">Dir</Vektor>
				<Vektor x="0.2858036" y="0.9582962" z="3.385832E-08">Nor</Vektor>
				<Vektor x="-4.623935E-02" y="1.379063E-02" z="0.9988322">Bin</Vektor>
			</Dreibein>
		</Kammera>
		Position X:					-458.16	PosX
		Position Y:					-237.30	PosY
		Position Z:					14.38	PosZ
		Neigung X:					0.00
		Neigung Y:					-0.27
		Neigung Z:					-16,61
		Sichtfeld:					0.00
		Schärfentiefe:				aus 	DOF (die nachfolgenden Parameter sind dann fix)
		Brennweite:					100.00	Brennweite[FocalIdx]
		Blendenwert:				f/3.6	Blende[FStopIdx]
		Objektentfernung:			100.0	SubDist
		Hyperfokale Entfernung: 	935.48
		Vor dem Zielobjekt:			9.65	DOFShiftNear
		Hinter dem Zielobjekt:		11.96	DOFShiftFar
		Objektentfernung:			100.0	DOFSubDist
*/
	let svgKamerasGroup;
	const Kamerasammlung = sutrackp.getElementsByTagName("Kammerasammlung")[0];
	const Kameras = Kamerasammlung.getElementsByTagName("Kammera");
	let KameraID = 0;
	for (const Kamera of Kameras) {
		KameraID += 1;

		const Name 	= Kamera.getAttribute("name");
		/* Ignore not-used cameras
		Should we check the default name or the default position to identify such cameras?
		Some observations:
		- The default name is language dependent, see file eep.lng entry [OTHER]CAMERA_NAME
		- Pos and Dir seem to have quite specific values
		- Dir is not a unit vector
		- Nor and Bin values might vary
		<Kammera name="Leer" DOF="0" Dynamic="0" FocalIdx="193" FStopIdx="13" SubDist="100" DOFSubDist="100" DOFShiftNear="9.65" DOFShiftFar="12.965" FOV="0" TakeSwitch="0">
			<Dreibein>
				<Vektor x="6000" y="-6000" z="400">Pos</Vektor>
				<Vektor x="-6000" y="6000" z="-400">Dir</Vektor>
				<Vektor x="-0.7071068" y="-0.7071068" z="0">Nor</Vektor>
				<Vektor x="-3.329636E-02" y="3.329636E-02" z="0.9988908">Bin</Vektor>
			</Dreibein>
		</Kammera>
		*/
		if (Name === "Leer" || Name === "blank" || Name === "Vide" ) {
			continue;
		}

		// Store Kamera
		Kamera.Name 				= Name;
		Kamera.KameraID 			= KameraID;
		global.KameraSet[KameraID] 	= Kamera;

		/*
		<Kammera name="Anlage" DOF="0" Dynamic="0" FocalIdx="193" FStopIdx="13" SubDist="100" DOFSubDist="100" DOFShiftNear="9.65" DOFShiftFar="11.96" FOV="0.6981317" TakeSwitch="0">
		*/
		Kamera.Dynamic 	= Kamera.getAttribute("Dynamic");

		let mMatrix;
		let PosX, PosY, PosZ, DirX, DirY, DirZ, NorX, NorY, NorZ, BinX, BinY, BinZ;

		const Dreibein	= Kamera.getElementsByTagName("Dreibein")[0];
		const FramePos	= Dreibein.getElementsByTagName("Vektor")[0];
		const FrameDir	= Dreibein.getElementsByTagName("Vektor")[1];
		const FrameNor	= Dreibein.getElementsByTagName("Vektor")[2];
		const FrameBin	= Dreibein.getElementsByTagName("Vektor")[3];

		PosX = +FramePos.getAttribute("x") / 100;
		PosY = +FramePos.getAttribute("y") / 100;
		PosZ = +FramePos.getAttribute("z") / 100;

		// Bei den Kameras gibt der Dir-Vektor zum Teil sowohl die Blickrichtung wie auch die Sichtweite an und muss daher normalisiert werden
		DirX = +FrameDir.getAttribute("x");
		DirY = +FrameDir.getAttribute("y");
		DirZ = +FrameDir.getAttribute("z");
		const norm = Math.hypot(DirX, DirY, DirZ);
		DirX /= norm;
		DirY /= norm;
		DirZ /= norm;

		NorX = +FrameNor.getAttribute("x");
		NorY = +FrameNor.getAttribute("y");
		NorZ = +FrameNor.getAttribute("z");

		BinX = +FrameBin.getAttribute("x");
		BinY = +FrameBin.getAttribute("y");
		BinZ = +FrameBin.getAttribute("z");

		mMatrix = [DirX, DirY, DirZ, 0,    NorX, NorY, NorZ, 0,    BinX, BinY, BinZ, 0,    PosX, PosY, PosZ, 1 ];
		Kamera.mPos = mMatrix;

		// Process Kamera
		if (!svgKamerasGroup) { // First Kamera
			// Show checkbox
			document.getElementById("CheckboxKamera").classList.remove("hidden");
		}
		svgKamerasGroup = createSVGforCamera(SVGfragment, svgKamerasGroup, Kamera);
	}
}

function createSVGforCamera(SVGfragment, svgKamerasGroup, Kamera) {

	const Laenge = 40; // arbitrary length

	if (!svgKamerasGroup) { // First Kamera
		// Create svg group node
		svgKamerasGroup = svgAppend(SVGfragment, {
			svg_tag	: `g`,
			id		: `Kamera`,
			"class"	: `Kamera`,
		});
	}

	const svgKameraGroup = svgAppend(svgKamerasGroup, {
		svg_tag	: `g`,
		id		: Kamera.KameraID,
	});

	// Show circle at Point
	svgAppend(svgKameraGroup, {
		svg_tag				: `circle`,
		r					: 2,
		transform 			: matrixToTransform(Kamera.mPos),
	});

	// Draw Line
	svgAppend(svgKameraGroup, {
		svg_tag				: `path`,
		d 					: `M 2 0 H ${Laenge}`,
		transform 			: matrixToTransform(Kamera.mPos)
	});

	//Show Name
	svgAppend(svgKameraGroup, {
		svg_tag			: `text`,
		text			: Kamera.Name,			// 📷 \u1F4F7
		dx				: `2`, 			// Shift text right
		dy				: `-0.3em`, 	// Shift text up
		//dy			: `1em`, 		// Shift text below the track
		transform: matrixToTransform(Kamera.mPos)
			+ ` scale(1 -1)`,																   
	});

	// show Hoehe in the middle below the track (left-adjusted)
	svgAppend(svgKameraGroup, {
		svg_tag			: `text`,
		text			: `[${Kamera.mPos[14].toFixed(0)}m]`, // PosZ
		dx				: `2`, 		// Shift text right a little bit
		dy				: `1em`, 		// Shift text below the track
		"class"			: `Hoehe`,
		transform: matrixToTransform(Kamera.mPos)
			+ ` scale(1 -1)`,
	});				   

	return svgKamerasGroup;									   
}

function createSVGforRahmen(SVGfragment, sutrackp) {
/*
	in:
		sutrackp.getElementsByTagName("Schandlaft")
		global.usedArea

	mod:
		document.getElementById("heightArea")
		global.usedArea
		SVGfragment

*/
	// Show min/max height
	const text = (global.usedArea.min.z).toFixed(0) + " .. " + (global.usedArea.max.z).toFixed(0);
	document.getElementById("heightArea").textContent = text;

	// Groesse der Anlage (alle Positionsangaben in m statt cm)
	const Schandlaft 	= sutrackp.getElementsByTagName("Schandlaft")[0];
	const Area = {
		min : {
			x : Schandlaft.getAttribute("posX") / 100,
			y : Schandlaft.getAttribute("posY") / 100,
		},
		width  	: Math.abs(Schandlaft.getAttribute("posX") * 2 / 100),
		height 	: Math.abs(Schandlaft.getAttribute("posY") * 2 / 100),
	};

	// Verwendeter Bereich der Anlage anpassen (nicht größer als die Anlage selber)
	global.usedArea.min.x = Math.max( global.usedArea.min.x, Area.min.x );
	global.usedArea.min.y = Math.max( global.usedArea.min.y, Area.min.y );
	global.usedArea.max.x = Math.min( global.usedArea.max.x, Area.min.x + Area.width  );
	global.usedArea.max.y = Math.min( global.usedArea.max.y, Area.min.y + Area.height );

	// Group for additional general elements
	let svg_general_group = svgAppend(SVGfragment, {
		svg_tag	: `g`,
		id		: `general`, // optional
		"class"	: `general`,
	});

	// Box zur Anzeige der Groesse der Anlage
	// <rect class="box" x="-503" y="-303" width="1006" height="606" />
	svgAppend(svg_general_group, {
		svg_tag	: `rect`,
		"class"	: `box`,
		x		:  Area.min.x,
		y		:  - Area.height - Area.min.y,	// svg: mirrored y-coordinate
		width	:  Area.width,
		height	:  Area.height,
	});
	// Box zur Anzeige des verwendeten Teils der Anlage
	// <rect class="box" x="-175" y="-140" width="382" height="305" />
	svgAppend(svg_general_group, {
		svg_tag	: `rect`,
		"class"	: `box`,
		x		:  global.usedArea.min.x,
		y		:  - global.usedArea.max.y,	// svg: mirrored y-coordinate
		width	:  global.usedArea.max.x - global.usedArea.min.x,
		height	:  global.usedArea.max.y - global.usedArea.min.y,
	});
	// Zusätzliche Markierung des Zentrums
	// <circle id="center" cx="0" cy="0" r="1" />
	svgAppend(svg_general_group, {
		svg_tag	: `circle`,
		id		: `center`,
		cx		:  `0`,
		cy		:  `0`,
		r		:  `1`,
	});
}

// Generate matrix command for svg
function matrixToTransform(m) {
	//       `matrix(${DirX} ${DirY} ${NorX} ${NorY} ${PosX} ${PosY})`
	//return `matrix(${m[0]} ${m[1]} ${m[4]} ${m[5]} ${m[12]} ${(m[13])})`;

/* https://wiki.selfhtml.org/wiki/SVG/Transformationen#matrix
transform="matrix(1,0,0,1,0,0)" ist die Identität. Diese Angabe hat also überhaupt keinen Effekt.
transform="matrix(1,0,0,1,x,y)" entspricht transform="translate(x,y)".
transform="matrix(x,0,0,y,0,0)" entspricht transform="scale(x,y)".
transform="matrix(1,0,tan(α),1,0,0)" entspricht transform="skewX(α)".
transform="matrix(1,tan(α),0,1,0,0)" entspricht transform="skewY(α)".
transform="matrix(cos(α),sin(α),-sin(α),cos(α),0,0)" entspricht transform="rotate(α)".
Eigentlich entspricht diese Drehmatrix der Drehung gegen den Uhrzeigersinn während rotate im Uhrzeigersinn dreht, sodass der Parameter der trigonometrischen Funktionen -α statt α sein müsste. Jedoch ist in SVG die y-Achse falschherum, wodurch sich dies gegenseitig aufhebt.
transform="matrix(cos(α),sin(α),-sin(α),cos(α),x,y) matrix(1,0,0,1,-x,-y)" entspricht transform="rotate(α,x,y)"
*/

	const [	DirX, DirY, DirZ, d0,
			NorX, NorY, NorZ, n0,
			BinX, BinY, BinZ, b0,
			PosX, PosY, PosZ, scale ] = m;
	return `matrix(${DirX} ${-DirY} ${NorX} ${-NorY} ${PosX} ${-PosY})`;	// svg: mirrored y-coordinate
}

function svgAppend(svg_node, obj) {
	const svgNS 	= "http://www.w3.org/2000/svg";
	//const xlinkNS	= "http://www.w3.org/1999/xlink";

	// The lightweight library for manipulating and animating SVG: https://github.com/svgdotjs/svg.js
	// https://svgjs.dev/docs/3.0/

	// planned: optimize sequence of transform operations based on https://github.com/svg/svgo
	/*
	https://github.com/svg/svgo/blob/master/plugins/convertTransform.js
	Convert matrices to the short aliases,
	Convert long translate, scale or rotate transform notations to the shorts ones,
	Convert transforms to the matrices and multiply them all into one,
	Remove useless transforms.
	Limit transform precision with matrix one. Calculating with larger precision doesn't add any value.
	No sense in angle precision more then number of significant digits in matrix.
	Convert fixed-point numbers: 12.754997 → 12.755
	Convert long translate transform notation to the shorts one: translate(10 0) → translate(10)
	Convert long scale transform notation to the shorts one: scale(2 2) → scale(2)
	Convert long rotate transform notation to the short one: translate(cx cy) rotate(a) translate(-cx -cy) → rotate(a cx cy)
	Decrease accuracy of floating-point numbers in transforms keeping a specified number of decimals: Smart rounds values like 2.349 to 2.35.
	*/
	
	/* SVG operates in 2D, however, using CSS styles for the SVG elements we could enable 3D:
	https://oreillymedia.github.io/Using_SVG/extras/ch11-3d.html
	https://css-tricks.com/things-watch-working-css-3d/
	
	transform-style: preserve-3d: 
	translate3d(tx, ty, tz): translate it by the given lengths along each axis
	translateZ(tz): similar to the new translateX and translateY functions, this shorthand allows you to specify a translation along the z-axis only
	scale3d(sx,sy,sz): change the scale in all dimensions by the specified factors
	scaleZ(sz): change the z-scale only (similar to the new scaleX and scaleY functions)
	rotateX(a): use the x-axis as a pivot (or hinge) to rotate the coordinate system by the specified angle; x-coordinates will not change, but y and z coordinates will
	rotateY(a): use the y-axis as a pivot to rotate the coordinate system by the specified angle; y-coordinates will not change, but x and z coordinates will
	rotateZ(a): use the z-axis as a pivot to rotate the coordinate system by the specified angle; this has the same effect on coordinates as the 2D rotate function, but it forces 3D drawing methods to be used
	rotate3d(vx,vy,vz,a): create a pivot using the vector (straight line) from the origin to the point (vx,vy,vz), and rotate the coordinate system around it by the angle a. The official definition of how to calculate the rotation involves extensive trigonometry. As an heuristic, the direction of rotation for a positive angle is determined by pointing the thumb along the pivot vector, and then curving the fingers; as always, you would use the left hand for the default coordinate system and the right hand for a reflected coordinate system.
	For all these functions, the CSS syntax rules apply: angles and lengths must include units.

	Another option would be to replace svg with x3d based on https://www.x3dom.org/
	*/

	let element = document.createElementNS(svgNS, obj.svg_tag);

	// copy all attributes except the tag and the text
	for (const [key, value] of Object.entries(obj)) {
		if (key !== "svg_tag" && key !== "text") {
			// reduce precission of numbers ( simulated floor() operation )
			// Claude AI: Diese Regex wurde auch auf id, class, href (Strings ohne Nachkommastellen) angewendet – unnötiger Aufwand bei jedem einzelnen SVG-Element-Attribut, 
			// das erzeugt wird (also potenziell zehntausende Male pro Anlage).
			// Fix: Nur bei numerischen Schlüsseln anwenden, z. B. über eine Positivliste (d, transform, x, y, cx, cy, r, dx, dy) oder einen Typ-Check typeof value === "number".
			if (key === "d" || key === "transform" 
				// || key === "x" || key === "y" || key === "cx" || key === "cy" || key === "r" || key === "dx" || key === "dy"
				) {
				// mostly changed: d, transform
				const valueString = (""+value).replace(/(\.\d{0,5})\d*/g, "$1");
				element.setAttribute(key, valueString);
			} else {
				// No change: class, id, href, dx, dy
				element.setAttribute(key, value);
			}
		}
	}

	if (obj.svg_tag === "text") {
		const textNode 	= document.createTextNode(obj.text);
		element.appendChild(textNode);
	}

	svg_node.appendChild(element);
	return element;
}

/* Not used anymore
function svgAppendTextPath(svg_node, obj) {
	const svgNS 	= "http://www.w3.org/2000/svg";
	const xlinkNS	= "http://www.w3.org/1999/xlink";

	// Create special element using attributes href, text, text-anchor (optional)
	// Example:
	// <text><textPath startOffset="50%" href="#G1-1">1</textPath></text>

	const textNode 	= document.createTextNode(obj.text);

	const textPath 	= document.createElementNS(svgNS, "textPath");
	textPath.setAttribute("class", obj.class);
	if (obj["text-anchor"] === "middle") {
		textPath.setAttribute("startOffset", "50%");
	}
	else if (obj["text-anchor"] === "end") {
		textPath.setAttribute("startOffset", "90%"); // How to put the text exactly to the end?
	}
	textPath.setAttributeNS(xlinkNS, "xlink:href", obj.href);
	textPath.appendChild(textNode);

	const text 		= document.createElementNS(svgNS, "text");
	if (obj["text-anchor"]) { text.setAttribute("text-anchor", obj["text-anchor"]); }
	text.appendChild(textPath);
	text.setAttribute("dy", "-0.1em"); // Shift text up the track

	svg_node.appendChild(text);

	return text;
}
*/

})(this); // end module
