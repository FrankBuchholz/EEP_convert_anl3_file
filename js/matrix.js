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

matrix.det3x3 = function (A) { // Determinant of the upper left 3x3 sub matrix
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

})(this); // end module