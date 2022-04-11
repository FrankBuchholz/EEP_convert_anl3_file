// https://www.nayuki.io/page/convex-hull-algorithm
/* Explanations and animation of the algorithm
https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
*/
/*
 * Convex hull algorithm - Library (JavaScript)
 *
 * Copyright (c) 2018 Project Nayuki
 * https://www.nayuki.io/page/convex-hull-algorithm
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program (see COPYING.txt and COPYING.LESSER.txt).
 * If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";
/* Interface
public api:
	convexhull
*/

(function(api) {
// public api
const convexhull = {}
api.convexhull = convexhull;

// Returns a new array of points representing the convex hull of
// the given set of points. The convex hull excludes collinear points.
// This algorithm runs in O(n log n) time.
convexhull.makeHull = function(points) {
	const newPoints = points.slice();					// copy array
	newPoints.sort(POINT_COMPARATOR);					// sort first by x-coordinate, and in case of a tie, by y-coordinate
	return this.makeHullPresorted(newPoints);
};


// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
convexhull.makeHullPresorted = function(points) {
	if (points.length <= 1) {							// just 0 or 1 point
		return points.slice();
	}

	// Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
	// as per the mathematical convention, instead of "down" as per the computer
	// graphics convention. This doesn't affect the correctness of the result.

	// The upper hull is the part of the convex hull, which is visible from above.
	const upperHull = [];
	for (let i = 0; i < points.length; i++) {			// inspect all points from left to right
		const p = points[i];							// current point
		while (upperHull.length >= 2) {					// do we at least have 2 more points in this part of the hull
			const q = upperHull[upperHull.length - 1];	// last point in this part of the hull
			const r = upperHull[upperHull.length - 2];	// pre-last point in this part of the hull
			if ( cross(q, p, r) ) {						// check turn direction of these 3 points
				upperHull.pop();						// wrong turn direction -> remove inner point q
			} else {
				break;
			}
		}
		upperHull.push(p);								// add current point temporarily to this part of the hull
	}
	upperHull.pop();									// Remove the last point of each list (it's the same as the first point of the other list).

	// The lower hull is the part of the convex hull, which is visible from below.
	const lowerHull = [];
	for (let i = points.length - 1; i >= 0; i--) {		// inspect all points from right to left
		const p = points[i];							// current point
		while (lowerHull.length >= 2) {					// do we at least have 2 more points in this part of the hull
			const q = lowerHull[lowerHull.length - 1];	// last point in this part of the hull
			const r = lowerHull[lowerHull.length - 2];	// pre-last point in this part of the hull
			if ( cross(q, p, r) ) {						// check turn direction of these 3 points
				lowerHull.pop();						// wrong turn direction -> remove inner point q
			} else {
				break;
			}
		}
		lowerHull.push(p);								// add current point temporarily to this part of the hull
	}
	lowerHull.pop();									// Remove the last point of each list (it's the same as the first point of the other list).

	if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) {
		return upperHull;					// just 1 point
	} else {
		return upperHull.concat(lowerHull);	// multiple points in the result will be listed in counter-clockwise order.
	}
};

function POINT_COMPARATOR(a, b) {
	// return a.x == b.x ? a.y - b.y : a.x - b.x;
	if 		(a.x < b.x)	return -1;			// sort first by x-coordinate,
	else if (a.x > b.x)	return +1;
	else if (a.y < b.y)	return -1;			// and in case of a tie, by y-coordinate
	else if (a.y > b.y)	return +1;
	else				return 0;			// identical points
}

function cross(q, p, r) {
	return 	(q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x);
}

})(this); // end module