// Geometry: Reine Geometrie ohne Zugriff auf DOM oder SVG
"use strict";
/* global
	matrix:readonly
*/
/* Interface
required global data:
	matrix (js/matrix.js)
public api:
	calcBezierCurve
	calcBezierPoint
	calcClothoidCurve
	calcHelixCurve
	calcRotatorCurve
	getArcLength3D
	projectFrame
	projectPoint

Die Funktionen rechnen nur mit Zahlen, Arrays und Matrizen (16 Werte, siehe js/matrix.js).
Sie lesen weder das DOM noch die Variable global und lassen sich daher einzeln testen.
*/
(function(api) {
// public api
api.calcBezierCurve = calcBezierCurve;
api.calcBezierPoint = calcBezierPoint;
api.calcClothoidCurve = calcClothoidCurve;
api.calcHelixCurve = calcHelixCurve;
api.calcRotatorCurve = calcRotatorCurve;
api.getArcLength3D = getArcLength3D;
api.projectFrame = projectFrame;
api.projectPoint = projectPoint;


// Claude AI: Projiziert einen lokalen Punkt [x, y, z] vollständig über das 3D-Frame (Dir/Nor/Bin + Pos) des Gleises in Welt-Koordinaten.
// Im Unterschied zu matrixToTransform() geht hier auch der Bin-Anteil (lokales z) korrekt ein - relevant bei stark gekippten Frames (steile Rotator/Helix-Abschnitte).
function projectPoint(mMatrix, point) {
	// point = [x, y, z] in lokalen Koordinaten des Gleises
	const mPoint = matrix.multiply(mMatrix, matrix.translate(point[0], point[1], point[2]));
	return [ mPoint[12], -mPoint[13] ];	// svg: gespiegelte y-Koordinate, wie in matrixToTransform()
}

// Claude AI: Projiziert einen lokalen Punkt [x, y, z] + Rotationswinkel über das 3D-Frame (mMatrix) in eine vollständige Welt-Matrix (Position + Orientierung). 
// Wird für Kurvenmittelpunkt, Signal- und Kontaktpositionen verwendet, deren Winkel je nach CurveType aus Bezier-, Arc- oder Clothoid-Berechnung stammen kann.
function projectFrame(mMatrix, point, angle) {
	return [
			mMatrix,
			matrix.translate(point[0], point[1], point[2]),
			matrix.rotateZ(angle),
		].reduce(matrix.multiply);
}

// Claude AI: 3D-Bogenlänge einer kubischen Bezierkurve (statt bisher nur 2D über getArcLength(xs, ys)).
// Notwendig, weil bei stark geneigten Gleisabschnitten (z.B. Rotator/Helix mit hohem lokalem z-Anteil) die reale 3D-Länge spürbar von der reinen xy-Projektion abweicht. 
// Da diese Länge in calcBezierPoint() zur Positionierung von Signalen/Kontakten entlang der Strecke verwendet wird,
// führte die 2D-Näherung dort zu leicht falsch platzierten Symbolen.
// Eine Gauss-Legendre-Quadratur mit 8 Stützstellen ist für glatte kubische Bezierkurven ausreichend genau.
function getArcLength3D(xs, ys, zs) {
	const GAUSS_LEGENDRE_8 = [ // [Gewicht, Abszisse] auf Intervall [-1, 1]
		[0.362683783378362, -0.181901910219818],
		[0.362683783378362,  0.181901910219818],
		[0.313706645877887, -0.539981529582510],
		[0.313706645877887,  0.539981529582510],
		[0.222381034453374, -0.906179845938664],
		[0.222381034453374,  0.906179845938664],
		[0.101228536290376, -0.973906528517172],
		[0.101228536290376,  0.973906528517172],
	];

	// xs, ys, zs = [P0, P1, P2, P3] je Achse (kubische Bezier-Kontrollpunkte)
	function derivative(t, P0, P1, P2, P3) {
		// P'(t) = 3(1-t)^2 (P1-P0) + 6(1-t)t (P2-P1) + 3t^2 (P3-P2)
		const mt = 1 - t;
		return 3*mt*mt*(P1-P0) + 6*mt*t*(P2-P1) + 3*t*t*(P3-P2);
	}

	let length = 0;
	for (const [weight, x] of GAUSS_LEGENDRE_8) {
		const t  = 0.5 * (x + 1);				// von [-1,1] auf [0,1] abbilden
		const dx = derivative(t, xs[0], xs[1], xs[2], xs[3]);
		const dy = derivative(t, ys[0], ys[1], ys[2], ys[3]);
		const dz = derivative(t, zs[0], zs[1], zs[2], zs[3]);
		length += weight * Math.hypot(dx, dy, dz);
	}
	return length * 0.5;	// Faktor 0.5 aus der Intervall-Transformation [-1,1] -> [0,1]
}

function calcBezierPoint(BezierPointsArray, position, near, far) {
	// find position on bezier curve
	let lengthPrevSegments = 0.0;
	for (let I = 0; I < BezierPointsArray.length; I++) {
	
		const Index = (near > far ? BezierPointsArray.length - 1 - I : I);	// reverse / normal
		const BezierPoints = BezierPointsArray[Index];

		// BezierPoints = [ [B1X, B1Y, B1Z], [B2X, B2Y, B2Z], [B3X, B3Y, B3Z], [B4X, B4Y, B4Z], arcLength ];
		const arcLength = BezierPoints[4];

		if ( I + 1 == BezierPointsArray.length || 			// assertion to end the loop in case of rounding issues
			 lengthPrevSegments + arcLength >= position		// does this segment contains the position?
		   ) {
			// find relative position on this segment		// assertion to stay in interval [0, 1]
			const t = Math.min( Math.max( (position - lengthPrevSegments) / arcLength , 0), 1);
			// [DeltaX, DeltaY, DeltaZ, Winkel] calcBezierCurve(BezierPoints, t); 
			return calcBezierCurve(BezierPoints, t); 

		} else {
			// continue with next segment
			lengthPrevSegments += arcLength;
		}
	}
}

function calcBezierCurve(BezierPoints, t) {
	// BezierPoints = [ [B1X, B1Y, B1Z], [B2X, B2Y, B2Z], [B3X, B3Y, B3Z], [B4X, B4Y, B4Z], arcLength ];
	const B1X = BezierPoints[0][0]; // = aX;
	const B1Y = BezierPoints[0][1]; // = aY;
	const B1Z = BezierPoints[0][2]; // = aZ;
	const B2X = BezierPoints[1][0]; // = aX +bX/3;
	const B2Y = BezierPoints[1][1]; // = aX +bY/3;
	const B2Z = BezierPoints[1][2]; // = aX +bZ/3;
	const B3X = BezierPoints[2][0]; // = aX +bX*2/3 +cX/3;
	const B3Y = BezierPoints[2][1]; // = aX +bY*2/3 +cY/3;
	const B3Z = BezierPoints[2][2]; // = aX +bZ*2/3 +cZ/3;
	const B4X = BezierPoints[3][0]; // = aX +bX     +cX   +dX;
	const B4Y = BezierPoints[3][1]; // = aX +bY     +cY   +dY;
	const B4Z = BezierPoints[3][2]; // = aX +bZ     +cZ   +dZ;
	//const arcLength = BezierPoints[4];

	// Split the Bezier curve into two parts to calculate the position of the point
	// https://pomax.github.io/bezierinfo/#matrixsplit
	// P(t) = (1-t)^3*B1 + 3t(1-t)^2*B2 + 3t^2(1-t)*B3 + t^3*B4
	const DeltaX = (1-t)**3*B1X + 3*t*(1-t)**2*B2X + 3*t**2*(1-t)*B3X + t**3*B4X;
	const DeltaY = (1-t)**3*B1Y + 3*t*(1-t)**2*B2Y + 3*t**2*(1-t)*B3Y + t**3*B4Y;
	const DeltaZ = (1-t)**3*B1Z + 3*t*(1-t)**2*B2Z + 3*t**2*(1-t)*B3Z + t**3*B4Z;

	// Rotation = Winkel of Tangent
	// P(t)     = (1-t)^3*B1    + 3t(1-t)^2*B2             + 3t^2(1-t)*B3         + t^3*B4
	// dP(t)/dt = -3(1-t)^2*B1  + 3(1-t)^2*B2 - 6(1-t)t*B2 + 6t(1-t)*B3 - 3t^2*B3 + 3t^2*B4
	const dPX = -3*B1X*(1-t)**2  + B2X*3*(1-t)**2 - B2X*6*(1-t)*t  + B3X*6*(1-t)*t - B3X*3*t**2  + 3*B4X*t**2;
	const dPY = -3*B1Y*(1-t)**2  + B2Y*3*(1-t)**2 - B2Y*6*(1-t)*t  + B3Y*6*(1-t)*t - B3Y*3*t**2  + 3*B4Y*t**2;
	const dPZ = -3*B1Z*(1-t)**2  + B2Z*3*(1-t)**2 - B2Z*6*(1-t)*t  + B3Z*6*(1-t)*t - B3Z*3*t**2  + 3*B4Z*t**2;
	const Winkel = Math.atan2(dPY, dPX);

	return [DeltaX, DeltaY, DeltaZ, Winkel];
}

function calcClothoidCurve(A, L1, L2, RotationCCW) {
	// Approximate clothoid line
	/*	R = radius
		L = length
		A^2 = R*L

		x  = integral[L1,L2](cos(φ) dl)
		dx = cos(φ) dl
		y  = integral[L1,L2](sin(φ) dl)
		dy = cos(φ) dl

		φ is a function of l
		dφ/dL = 1/R = L/A^2
		φ = L^2/(2*A^2) = ( L/(A*sqrt(2)) )^2

		let
		s = L/(A*sqrt(2))

		then
		φ = s^2
		l = s*A*sqrt(2)
		dl = ds*A*sqrt(2)

		x = A*sqrt(2) * integral[s1,s2](cos(s^2) ds)
		y = A*sqrt(2) * integral[s1,s2](sin(s^2) ds)
	*/

	const STEPCOUNT = 1000;

	const sign 	= RotationCCW;

	const a 	= A*Math.sqrt(2);

	const s1 	= (L1<L2 ? L1 : L2)/a;				// curvature = 1/radius at start point
	const s2 	= (L1<L2 ? L2 : L1)/a;				// curvature = 1/radius at end point

	let   s 	= 0;				// curvature at current point (we have to start at 0 0)
	const s0 	= s*s;				// angle at start point
	let   w;
	let   ds 	= s2/STEPCOUNT;		// delta curvature per step
	const ads	= a * ds;			// factor used in loop

	let   p2 	= {x:0,y:0};		// next point
	let   p		= p2;				// current point

	let   dx, dy;					// delta between points

	let   b1, b2, b3, b4;			// Bezier points

	const pathPoints = [];

	for (let i = 1; i <= STEPCOUNT; i++) {
		p.x = p2.x;													// Set current point
		p.y = p2.y;

		w = s*s-s0;
		p2.x += dx =        ads * Math.cos(w);						// Calculate next point
		p2.y += dy = sign * ads * Math.sin(w);

		if (!b1 && ( Math.abs(s)>=Math.abs(s1) || i === STEPCOUNT ) ) {
			b1 = {x: p.x,   y: p.y,	  dx: dx,  dy: dy,  w: w, };			// first 1. Bezier point

			pathPoints.push( {x: b1.x,   y: -b1.y,  z: 0,  w: b1.w, } );	// first 1. Bezier point
		}

		const f = 4;	// limit 4: max 45°, 3: max 60°
		if ( (b1 && Math.abs(w - b1.w) > (Math.PI / f)) 			// Draw new curve if difference of the angles exceeds limit
			|| i === STEPCOUNT )  {									// or to cover the last point
			// if yes, draw the next part

			b4 = { x: p2.x,  y: p2.y,  dx: dx,  dy: dy,  w: w, };			// 4. Bezier point
																			// 3. Bezier point on intersection of tangents
			if ( ( (b1.dy / b1.dx) == (b4.dy / b4.dx) ) || ( (b4.dy / b4.dx) == (b1.dy / b1.dx) ) ) {
				b3 = {	// dummy point if the tangents are equal
						x: b4.x,
						y: b4.y,
					};
			} else {
				b3 = {
						x: b1.x + ( (b4.x - b1.x) - (b4.y - b1.y) / (b4.dy / b4.dx) ) / ( 1 - ( (b1.dy / b1.dx) / (b4.dy / b4.dx)) ),
						y: b1.y + ( (b4.y - b1.y) - (b4.x - b1.x) * (b4.dy / b4.dx) ) / ( 1 - ( (b4.dy / b4.dx) / (b1.dy / b1.dx)) ),
					};
			}
			b2 = {															// 2. Bezier point on tangent near B1
					x: b1.x + (b3.x - b1.x) / f,							// works fine with f=4, but not with f=3
					y: b1.y + (b3.y - b1.y) / f,							// (I guess we should calculate the factor dependant on s or a)
				};

			if (L1 < L2) {	// forward
				pathPoints.push( 	{x: b2.x,   y: -b2.y, } );					// 2. Bezier point
				pathPoints.push( 	{x: b3.x,   y: -b3.y, } );					// 3. Bezier point
				pathPoints.push( 	{x: b4.x,   y: -b4.y,  z: 0,  w: b4.w, } );	// 4. Bezier point
			} else {		// backward
				pathPoints.unshift( {x: b2.x,   y: -b2.y, } );					// 2. Bezier point
				pathPoints.unshift( {x: b3.x,   y: -b3.y, } );					// 3. Bezier point
				pathPoints.unshift( {x: b4.x,   y: -b4.y,  z: 0,  w: b4.w, } );	// 4. Bezier point
			}

			// Prepare next part
			b1 = { x: b4.x,  y: b4.y,  dx: dx,  dy: dy,  w: w, };	// next 1. Bezier point
		}

		// next
		s += ds;
	}

	// Create svg path command
	let i;
	let svgBezierPath  = "M "  + pathPoints[0].x   + " " + pathPoints[0].y; // Complete path e.g. "M 60 -100 C 100 100 421 154 406 249 C ..."
	for (i=1; i<pathPoints.length; i=i+3) {
		svgBezierPath += " C " + pathPoints[i].x   + " " + pathPoints[i].y
					  +  " "   + pathPoints[i+1].x + " " + pathPoints[i+1].y
					  +  " "   + pathPoints[i+2].x + " " + pathPoints[i+2].y;
	}

	// Get start and end point
	const points = {};									// Result points
	i = 0;
	points.Pos		= {								 	// Start point
		x: 		pathPoints[i].x,
		y: 		pathPoints[i].y,
		z: 		pathPoints[i].z,
		Winkel: pathPoints[i].w + (L1<L2 ? 0 : Math.PI), };
	i = pathPoints.length-1;
	points.End		= {								 	// End point
		x: 		pathPoints[i].x,
		y: 		pathPoints[i].y,
		z: 		pathPoints[i].z,
		Winkel: pathPoints[i].w + (L1<L2 ? 0 : Math.PI), };

	return [points, svgBezierPath];
}

/* Optimization by Claude AI.

	Calculate a 3D rotator curve (a helix) with the given parameters.
	https://en.wikipedia.org/wiki/Helix
	https://en.wikipedia.org/wiki/Parametric_equation
	https://en.wikipedia.org/wiki/Parametric_curve
	https://en.wikipedia.org/wiki/Parametric_surface
	https://en.wikipedia.org/wiki/Parametric_surface#Helicoid
	https://en.wikipedia.org/wiki/Parametric_surface#Helicoid

	a = rotation speed around the z-axis (radians per unit length)
	b = rotation speed around the x-axis (radians per unit length)
	near = start position along the curve
	far = end position along the curve

	The function returns an array of Bezier points for each segment of the curve.
	Each element in the array is an array of 5 elements:
	[ [B1X, B1Y, B1Z], [B2X, B2Y, B2Z], [B3X, B3Y, B3Z], [B4X, B4Y, B4Z], arcLength ]
	where B1, B2, B3, B4 are the control points of the Bezier curve segment,
	and arcLength is the length of the segment in 2D (x,y) space.
*/
function calcRotatorCurve(a, b, near, far) {
	// Segmentanzahl: max. 45° Änderung von a*s ODER b*s pro Segment
	const totalAngleA = Math.abs(a) * Math.abs(far - near);
	const totalAngleB = Math.abs(b) * Math.abs(far - near);
	const maxAngle = Math.max(totalAngleA, totalAngleB);
	const segments = Math.max(1, Math.ceil(maxAngle / (Math.PI/4)));

	function sincTerm(k, s) {
		return (Math.abs(k) < 1e-9) ? s : Math.sin(k*s)/k;
	}
	function cosTerm(k, s) {
		return (Math.abs(k) < 1e-9) ? 0 : (1-Math.cos(k*s))/k;
	}
	function position(s) {
		const p = a-b, q = a+b;
		return [
			0.5*(sincTerm(p,s) + sincTerm(q,s)),
			0.5*(cosTerm(p,s) + cosTerm(q,s)),
			cosTerm(b,s),
		];
	}
	function tangent(s) {
		return [
			Math.cos(a*s)*Math.cos(b*s),
			Math.sin(a*s)*Math.cos(b*s),
			Math.sin(b*s),
		];
	}

	const BezierPoints = [];
	const step = (far-near) / segments;
	let P0 = position(near), T0 = tangent(near);

	for (let i = 0; i < segments; i++) {
		const s1 = near + (i+1)*step;
		const P1 = position(s1);
		const T1 = tangent(s1);

		// Sehnenlänge als Kontrollpunkt-Skalierung (wie im bestehenden PolygonalChain-Code)
		const chord = Math.hypot((P1[0]-P0[0]), (P1[1]-P0[1]), (P1[2]-P0[2]));
		const d = chord/3;

		const B1 = P0;
		const B2 = [P0[0]+d*T0[0], P0[1]+d*T0[1], P0[2]+d*T0[2]];
		const B3 = [P1[0]-d*T1[0], P1[1]-d*T1[1], P1[2]-d*T1[2]];
		const B4 = P1;

		const arcLength3D = getArcLength3D(
			[B1[0],B2[0],B3[0],B4[0]],
			[B1[1],B2[1],B3[1],B4[1]],
			[B1[2],B2[2],B3[2],B4[2]]
		);

		BezierPoints.push([B1, B2, B3, B4, arcLength3D]);
		P0 = P1; T0 = T1;
	}
	return BezierPoints;
}

// Claude AI: Segmentierte 3D-Bezier-Näherung einer Helix-Kurve (analog zu calcRotatorCurve).
// Ersetzt die bisherige Einzelsegment-Näherung (ein Cubic für das gesamte near..far-Intervall),
// die bei größerem Drehwinkel "eckig" wirkte (GleisID 129), sowie die fehlerhafte dDiff-Prüfung,
// die den Endpunkt in manchen Fällen komplett verfehlen ließ, weil sie die Differenzen der
// Achsen addierte statt sie zu quadrieren und daher den 3D-Effekt der Kippung von
// mFrame/mVectorBundle2/mOrientation nicht korrekt erfasste (GleisID 575).
//
// Rückgabe: { BezierPoints, mPos }
// - BezierPoints: wie bei Cubic/Rotator, jedoch relativ zu mPos gespeichert (siehe Aufrufstelle)
// - mPos: die Welt-Frame-Matrix am Startpunkt (w=wPos), dient als Referenzpunkt
function calcHelixCurve(mFrame, mVectorBundle2, mOrientation, a, b, near, far) {
	const r = Math.hypot(a, b);

	// Die lokale Funktion pointMatrix(w) verwendet dieselbe Formel, die bisher nur für w=wPos/wMid/wEnd
	// (Gleis.Helix.mPos/mMid/mEnd) ausgewertet wurde - hier verallgemeinert auf beliebige w,
	// um mehrere Zwischenpunkte für die Segmentierung zu erhalten.
	function pointMatrix(w) {
		return [
				mFrame,
				mVectorBundle2,
				mOrientation,
				matrix.rotateZ(w),
				matrix.translate(a, 0, b*w),
				matrix.swapXY(),
			].reduce(matrix.multiply);
	}

	const wPos = (-near) / r;
	const wEnd = (far)   / r;

	// Segmentanzahl: max. 45° w-Änderung pro Segment, analog zu calcRotatorCurve.
	// Falls trotz kleinem Gesamtwinkel weiterhin "eckig" - Schwelle (Math.PI/4) ggf. verkleinern.
	const totalAngle = Math.abs(wEnd - wPos);
	const segments = Math.max(1, Math.ceil(totalAngle / (Math.PI/16)));

	const posX = 12, posY = 13, posZ = 14;

	const mPos = pointMatrix(wPos);	// Referenzpunkt: alle BezierPoints relativ dazu gespeichert

	const BezierPoints = [];
	const step = (wEnd - wPos) / segments;
	let M0 = mPos;

	for (let i = 0; i < segments; i++) {
		const w1 = wPos + (i+1)*step;
		const M1 = pointMatrix(w1);

		const f = Math.abs(step) / 2;	// Tangentenskalierung, analog zur bisherigen Formel (dort: |far-near|/2/r für das ganze Intervall)

		const mB1 = M0;
		const mB2 = matrix.multiply(M0, matrix.translate( a*f, 0,  b*f));
		const mB3 = matrix.multiply(M1, matrix.translate(-a*f, 0, -b*f));
		const mB4 = M1;

		const B1 = [mB1[posX]-mPos[posX], mB1[posY]-mPos[posY], mB1[posZ]-mPos[posZ]];
		const B2 = [mB2[posX]-mPos[posX], mB2[posY]-mPos[posY], mB2[posZ]-mPos[posZ]];
		const B3 = [mB3[posX]-mPos[posX], mB3[posY]-mPos[posY], mB3[posZ]-mPos[posZ]];
		const B4 = [mB4[posX]-mPos[posX], mB4[posY]-mPos[posY], mB4[posZ]-mPos[posZ]];

		const arcLength3D = getArcLength3D(
			[B1[0],B2[0],B3[0],B4[0]],
			[B1[1],B2[1],B3[1],B4[1]],
			[B1[2],B2[2],B3[2],B4[2]]
		);

		BezierPoints.push([B1, B2, B3, B4, arcLength3D]);
		M0 = M1;
	}

	return { BezierPoints, mPos };
}

})(this); // end module
