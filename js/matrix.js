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

})(this); // end module