// https://github.com/jlmakes/rematrix
// <script type="text/javascript" src="node_modules/rematrix/dist/rematrix.js"></script>
// <script type="text/javascript" src="https://unpkg.com/rematrix"></script> <!-- latest version -->
// <script type="text/javascript" src="https://unpkg.com/rematrix@0.4.1/dist/rematrix.min.js"></script> <!-- version 0.4.1 -->

// Matrix operations optimized for this program
"use strict";
/* Interface
public api:
	matrix
*/

(function (api) {
// public api
const matrix = {};
api.matrix = matrix;

matrix.identity = function () {
	return	[ 1, 0, 0, 0,
			  0, 1, 0, 0,
			  0, 0, 1, 0,
			  0, 0, 0, 1, ];
}
matrix.translate = function (x, y = 0, z = 0) {
	return	[ 1, 0, 0, 0,
			  0, 1, 0, 0,
			  0, 0, 1, 0,
			  x, y, z, 1, ];
}
matrix.scale = function (x, y = 1, z = 1) {
	return	[ x, 0, 0, 0,
			  0, y, 0, 0,
			  0, 0, z, 0,
			  0, 0, 0, 1, ];
}
matrix.rotateZ = function (rad) {	// rotate around Z axix
    const c = Math.cos(rad);
    const s = Math.sin(rad);

	return	[ c,  s,  0,  0,
			 -s,  c,  0,  0,
			  0,  0,  1,  0,
			  0,  0,  0,  1, ];
}
matrix.rotateX = function (rad) {	// rotate around X axix
    const c = Math.cos(rad);
    const s = Math.sin(rad);

	return	[ 1,  0,  0,  0,
			  0,  c,  s,  0,
			  0, -s,  c,  0,
			  0,  0,  0,  1, ];
}
matrix.rotateY = function (rad) {	// rotate around Y axix
    const c = Math.cos(rad);
    const s = Math.sin(rad);

	return	[ c,  0, -s,  0,
			  0,  1,  0,  0,
			  s,  0,  c,  0,
			  0,  0,  0,  1, ];
}
matrix.swapXY = function () {		// swap x/y and mirror at x axis because of upside-down orientation in SVG
	return 	[ 0,  1,  0,  0,
			 -1,  0,  0,  0,
			  0,  0,  1,  0,
			  0,  0,  0,  1, ];
}
matrix.multiply = function (A, B) {	// Matrix multiplication
    const product = [];

    for (let i = 0; i < 4; i++) {
		const row = [ A[i], A[i + 4], A[i + 8], A[i + 12] ];
		for (let j = 0; j < 4; j++) {
			const k = j * 4;
			const col = [ B[k], B[k + 1], B[k + 2], B[k + 3] ];
			const val = row[0] * col[0] + row[1] * col[1] + row[2] * col[2] + row[3] * col[3];
			product[i + k] = val;
		}
	}
	return product;
}

matrix.det3x3 = function (A) { // Determinant of the upper left 3x3 sub matrix (= det if a14 = a24 = a34 = 0 and a44 = 1)
	const [ a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44 ] = A;
	const det = 
			      (a11 * a22 * a33) + (a21 * a32 * a13) + (a31 * a12 * a23) - (a13 * a22 * a31) - (a23 * a32 * a11) - (a33 * a12 * a21);
	return det;
}

matrix.det = function (A) { // Determinant of the 4x4 matrix
	const [ a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44 ] = A;
	const det = 
		- a41 * ( (a12 * a23 * a34) + (a22 * a33 * a14) + (a32 * a13 * a24) - (a14 * a23 * a32) - (a24 * a33 * a12) - (a34 * a13 * a22) )
		+ a42 * ( (a11 * a23 * a34) + (a21 * a33 * a14) + (a31 * a13 * a24) - (a14 * a23 * a31) - (a24 * a33 * a11) - (a34 * a13 * a21) )
		- a43 * ( (a11 * a22 * a34) + (a21 * a32 * a14) + (a31 * a12 * a24) - (a14 * a22 * a31) - (a24 * a32 * a11) - (a34 * a12 * a21) )
		+ a44 * ( (a11 * a22 * a33) + (a21 * a32 * a13) + (a31 * a12 * a23) - (a13 * a22 * a31) - (a23 * a32 * a11) - (a33 * a12 * a21) );
	return det;
}

matrix.quarternion = function (A) {
	// Translate matrix into quarternion
	// https://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/
	let S, w, x, y, z, axis;

	// Name the fields of the matrix
	const [ DirX, DirY, DirZ, d0, 
			NorX, NorY, NorZ, n0, 
			BinX, BinY, BinZ, b0, 
			PosX, PosY, PosZ, scale ] = A;
	
	// Trace = sum of diagonal elements
	const tr = DirX + NorY + BinZ;

	if (tr >= 0.0) { 
		axis = 'W';
		S = Math.sqrt(1.0 + DirX + NorY + BinZ) * 2; // S=4*w 
		w = 0.25 * S;
		x = (BinY - NorZ) / S;
		y = (DirZ - BinX) / S; 
		z = (NorX - DirY) / S;
	// identify which major diagonal element has the greatest value
	} else if ((DirX > NorY) && (DirX > BinZ)) { 
		axis = 'X';
		S = Math.sqrt(1.0 + DirX - NorY - BinZ) * 2; // S=4*x 
		w = (BinY - NorZ) / S;
		x = 0.25 * S;
		y = (DirY + NorX) / S; 
		z = (DirZ + BinX) / S; 
	} else if (NorY > BinZ) { 
		axis = 'Y';
		S = Math.sqrt(1.0 - DirX + NorY - BinZ) * 2; // S=4*y
		w = (DirZ - BinX) / S;
		x = (DirY + NorX) / S; 
		y = 0.25 * S;
		z = (NorZ + BinY) / S; 
	} else { 
		axis = 'Z';
		S = Math.sqrt(1.0 - DirX - NorY + BinZ) * 2; // S=4*z
		w = (NorX - DirY) / S;
		x = (DirZ + BinX) / S;
		y = (NorZ + BinY) / S;
		z = 0.25 * S;
	}			
	const norm = Math.sqrt(w*w + x*x + y*y + z*z);

	// Return result as object
	return {
		tr: 	tr,
		axis: 	axis,
		w: 		w,
		x: 		x,
		y: 		y,
		z: 		z,
		norm: 	norm,
	};
}

matrix.euler_angles = function (obj) {
	// Calculate the euler angles (roll, pitch, yaw) for a quaternion object
	
	let Q;
	if (obj.tr) { 	// The object is a quarternion
		Q = obj; 
	} else {		// The object is a rotation matix
		Q = matrix.quarternion(obj);
	}

	const tr = Q.tr;
	const w  = Q.w;
	const x  = Q.x;
	const y  = Q.y;
	const z  = Q.z;

	const a = Math.acos( (tr - 1) / 2 );
	const b = 2 * Math.atan2( Math.sqrt(x*x + y*y + z*z), w );
	
	// roll is rotation around x in radians (counterclockwise)
	let t1, t2;
	t1 =      + 2.0 * (w*x + y*z);
	t2 = +1.0 - 2.0 * (x*x + y*y);
	const roll_x = Math.atan2(t1, t2);
	
	// pitch is rotation around y in radians (counterclockwise)
	t1 = Math.max(-1.0, Math.min(+1.0, + 2.0 * (w*y - z*x) ));
	const pitch_y = Math.asin(t1);

	// yaw is rotation around z in radians (counterclockwise)
	t1 =      + 2.0 * (w*z + x*y);
	t2 = +1.0 - 2.0 * (y*y + z*z);
	const yaw_z = Math.atan2(t1, t2);
	
	// Return result as vector
	return [ roll_x, pitch_y, yaw_z ];
}

matrix.isFlipped = function (A) {
	// Name the fields of the matrix
	const [ DirX, DirY, DirZ, d0, 
			NorX, NorY, NorZ, n0, 
			BinX, BinY, BinZ, b0, 
			PosX, PosY, PosZ, scale ] = A;
	
	// Trace = sum of diagonal elements
	const tr = DirX + NorY + BinZ;
	const det = matrix.det3x3(A);
	let axis;

	if (tr >= 0.0) { 
		axis = 'W';
		return det < 0;
		
	} else if ((DirX > NorY) && (DirX > BinZ)) { 
		axis = 'X';
		return det >= 0;
		
	} else if (NorY > BinZ) { 
		axis = 'Y';
		return det >= 0; 
		
	} else { 
		axis = 'Z';
		return det < 0; 
	}			
}

})(this); // end module