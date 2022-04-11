/* Multi range slider

https://leaverou.github.io/multirange/
Features:
	Only 0.6KB minified & gzipped!
	No dependencies.
	Uses feature detection, will not run if two-handle sliders are natively supported.
	Keyboard accessible
	Clicking on the track still works
	Handles can be moved past each other
	Customizable styling
	JS properties polyfilled too (input.value, input.valueLow, input.valueHigh)
API:
	JS: Use the multirange(element) function to process sliders added to the page later.
	CSS: Use the --range-color property to change the color of the range. Use the --track-background property for more extensive customization.
	HTML: Use the multiple attribute to enable the second handle. Use data-drag-middle attribute to enable moving both handles by dragging the middle of the track between them.
Check for updates(on top of #45):
	https://github.com/LeaVerou/multirange/pull/46		IE compatibility												-> No need to apply this update
	https://github.com/LeaVerou/multirange/issues/47	In chrome browser the color left to the left handle looks wrong	-> No solution yet
	https://github.com/LeaVerou/multirange/pull/48		Made polyfill not apply on SSR									-> No need to apply this update

*/

"use strict";
/* Interface
required standard objects:
	HTMLInputElement
	document
	module
	self
required functions:
	changeHeightRange
public api:
	multirange
*/
(function(api) {
// public api (via self respective module)
//	multirange

var supportsMultiple = self.HTMLInputElement && "valueLow" in HTMLInputElement.prototype;

var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

var multirange = function(input) {
	if (supportsMultiple || input.classList.contains("multirange")) {
		return;
	}

	var value = input.getAttribute("value");
	var values = value === null ? [] : value.split(",");
	var min = +(input.min || 0);
	var max = +(input.max || 100);
	var ghost = input.cloneNode();
	var dragMiddle = input.getAttribute("data-drag-middle") !== null;
	var middle = input.cloneNode();

	input.classList.add("multirange", "original");
	ghost.classList.add("multirange", "ghost");

	input.value = values[0] || min + (max - min) / 2;
	ghost.value = values[1] || min + (max - min) / 2;

	input.parentNode.insertBefore(ghost, input.nextSibling);

	Object.defineProperty(input, "originalValue", descriptor.get ? descriptor : {
		// Fuck you Safari >:(
		get: function() { return this.value; },
		set: function(v) { this.value = v; }
	});

	Object.defineProperties(input, {
		valueLow: {
			get: function() { return Math.min(this.originalValue, ghost.value); },
			set: function(v) { this.originalValue = v; update(); },
			enumerable: true
		},
		valueHigh: {
			get: function() { return Math.max(this.originalValue, ghost.value); },
			set: function(v) { ghost.value = v; update(); },
			enumerable: true
		}
	});

	if (descriptor.get) {
		// Again, fuck you Safari
		Object.defineProperty(input, "value", {
			get: function() { return this.valueLow + "," + this.valueHigh; },
			set: function(v) {
				var values = v.split(",");
				this.valueLow = values[0];
				this.valueHigh = values[1];
				update();
			},
			enumerable: true
		});
	}

	if (typeof input.oninput === "function") {
		ghost.oninput = input.oninput.bind(input);
	}

	function update(mode) {
		ghost.style.setProperty("--low", 100 * ((input.valueLow - min) / (max - min)) + 1 + "%");
		ghost.style.setProperty("--high", 100 * ((input.valueHigh - min) / (max - min)) - 1 + "%");

		if (dragMiddle && mode !== 1) {
			let w = input.valueHigh - input.valueLow;
			if (w>1) w-=0.5;
			middle.style.setProperty("--size", (100 * w / (max - min)) + "%");
			middle.value = min + (input.valueHigh + input.valueLow - 2*min - w)*(max - min)/(2*(max - min - w));
		}

		// Process changed values (this should be a callback function instead)
		changeHeightRange(input.valueLow, input.valueHigh);
	}

	ghost.addEventListener("mousedown", function passClick(evt) {
		// Find the horizontal position that was clicked
		let clickValue = min + (max - min)*evt.offsetX / this.offsetWidth;
		let middleValue = (input.valueHigh + input.valueLow)/2;
		if ( (input.valueLow == ghost.value) == (clickValue > middleValue) ) {
			// Click is closer to input element and we swap thumbs
			input.value = ghost.value;
		}
	});
	input.addEventListener("input", update);
	ghost.addEventListener("input", update);

	if (dragMiddle) {
		middle.classList.add("multirange", "middle");
		input.parentNode.insertBefore(middle, input.nextSibling);
		middle.addEventListener("input", function () {
			let w = input.valueHigh - input.valueLow;
			let m = min + w/2 + (middle.value - min)*(max - min - w)/(max-min);
			input.valueLow = m - w/2;
			input.valueHigh = input.valueLow+w;
			update(1);
		});
	}

	update();
};

multirange.init = function() {
	[].slice.call(document.querySelectorAll("input[type=range][multiple]:not(.multirange)")).forEach(multirange);
};

if (typeof module === "undefined") {
	self.multirange = multirange;
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", multirange.init);
	}
	else {
		multirange.init();
	}
} else {
	module.exports = multirange;
}
})(this); // end module