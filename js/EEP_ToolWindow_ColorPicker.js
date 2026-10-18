// colorPicker
"use strict";
/* global
	_:readonly,
	ToolWindow:readonly
*/
/* Interface
required standard objects:
	document
	localStorage
required functions:
	_
	ToolWindow
public api:
	loadColors
	showColorPickerWindow
*/
(function(api) {
// public api
api.loadColors = loadColors;
api.showColorPickerWindow = showColorPickerWindow;

const GleissystemFarbDefinition = [{
	name: "Eisenbahn",
	color: "#FF0000"	/* red; */
}, {
	name: "Strassenbahn",
	color: "#A9A9A9"	/* darkgray; */
}, {
	name: "Strasse",
	color: "#808080"	/* grey; */
}, {
	name: "Wasserwege",
	color: "#0000FF"	/* blue; */
}, {
	name: "Steuerstrecken",
	color: "#800080"	/* purple; */
}, {
	name: "GBS",
	color: "#A52A2A"	/* brown; */
}, {
	name: "Kamera",
	color: "#00FF00"	/* green; */
}, {
	name: "Hintergrund",
	color: "#FFFFFF"	/* white; */
}];
let GleissystemFarbe;

function loadColors() {
	GleissystemFarbe = JSON.parse(localStorage.getItem("GleissystemFarbe"));

	if (GleissystemFarbe) {
		setColors();
	} else {
		resetColors();
	}
}

function resetColors() {
	// reset color values
	GleissystemFarbe = {};
	GleissystemFarbDefinition.forEach(function(farbe) {
		GleissystemFarbe[farbe.name] = farbe.color;
	});

	// set SVG CSS variables
	setColors();

	// purge local storage
	localStorage.removeItem("GleissystemFarbe");
}

function setColors() {
	// set SVG CSS variables
	const colorVariables = GleissystemFarbDefinition.map(function(farbe) {
		return `--${farbe.name}-color: ${GleissystemFarbe[farbe.name] || farbe.color};`;
	}).join("");
	document.getElementById("css-track-colors").textContent = `svg { ${colorVariables} }`;

	// Update color in storage
	localStorage.setItem("GleissystemFarbe", JSON.stringify(GleissystemFarbe));
}

let colorPickerWindow;

function showColorPickerWindow() {
	if (!colorPickerWindow) {
		const content = GleissystemFarbDefinition.map(function(farbe) {
			return `<div><label><input type="color" class="colorPicker" id="colorPicker-${farbe.name}" name="${farbe.name}">&nbsp;${_(farbe.name)}<\/label><\/div><br>`;
		}).join("");

		colorPickerWindow = new ToolWindow({
			title: _('Farben wählen'),
			//closeButtonText: "x", // ✖ = &#x2716;
			//top:     120,
			//left:    120, // optional: when no top or left are given, this window attempts to center itself
			width:     225, // starting width
			height:    200, // starting height
			minWidth:  100, // don't go thinner than this
			minHeight: 100, // don't go shorter than this
			//placement: "inside,auto",
			//relativeToElement: "#container",
			animated: true,
			content: {
				type: "html",
				value: content,
			},
			buttons: [
				{
					text: _('Reset'),
					clicked: function() {
						resetColors();
						this.hide();
					},
				},
			],
		});
	}
	colorPickerWindow.show();

	GleissystemFarbDefinition.forEach(function(farbe) {
		const colorPicker = document.getElementById("colorPicker-" +  farbe.name);
		colorPicker.value = GleissystemFarbe[farbe.name] || farbe.color;
		// Add event handlers again (because the popup)
		colorPicker.addEventListener("input", setColor);
	});
} // end function showColorPickerWindow

function setColor(event) {
	const name 	= event.target.name;
	const color = event.target.value;

	GleissystemFarbe[name] = color;
	setColors();
}
})(this); // end module