// toolwindow: Export-Fenster für den EEP Gleisplan
"use strict";
/* global
	_:readonly,
	ToolWindow:readonly,
	msg:readonly
*/
/* Interface
required standard objects:
	Blob
	Image
	URL
	XMLSerializer
	console
	document
required functions:
	_
	ToolWindow
	msg
public api:
	showExportWindow
*/
(function(api) {
// public api
api.showExportWindow = showExportWindow;

let exportWindow;
function showExportWindow() {
	if (!exportWindow) {
		const content = _('exportWindow',
			`<input type="number" name="exportSize" id="exportSize" value="3000" min="1" autocomplete="off" \/>`,
			`<input type="number" name="jpgQuality" id="jpgQuality" value="92" min="1" max="100" step="1" autocomplete="off" \/>`,
			`href="https:\/\/www.eepforum.de\/gallery\/" target="_blank"`
		);
/*
`<p>Wähle die Größe <input type="number" name="exportSize" id="exportSize" value="3000" min="1" autocomplete="off" \/> und das gewünschte Datenformat:<\/p>
<dl>
<dt>PNG<\/dt>
<dd>Verlustfreie Pixel-Graphik in bestimmter Größe; ideal für Computergraphik<\/dd>
<dt>JPG<\/dt>
<dd>Verlustbehaftetes Pixel-Bild in bestimmter Größe und Qualität; ideal für Fotos.<br>
Qualität (%): <input type="number" name="jpgQuality" id="jpgQuality" value="92" min="1" max="100" step="1" autocomplete="off" \/><br><br>
Nur Bilder in diesem Format können direkt in das <a href="https:\/\/www.eepforum.de\/gallery\/" target="_blank">EEP-Forum<\/a> hochgeladen werden: <i>Die Bilder dürfen die Dateiendungen jpg, jpeg besitzen und sie dürfen maximal 2 MB groß sein. Die minimale Bildgröße beträgt 800×500 Pixel und die maximale Größe beträgt 1920×1080 Pixel.<\/i> Daher wird die Größe der exportieren Graphik nach Möglichkeit auf diese Werte begrenzt.<\/dd>
<dt>SVG<\/dt>
<dd>Beliebig zoombare, verlustfreie Vektor-Graphik; ideal zur Weiterverarbeitung in anderen Programmen<br>
Es wird nur der gewählte Ausschnitt exportiert.<\/dd>
<\/dl>`;
*/

		exportWindow = new ToolWindow({
			title: _('Gleisplan exportieren'),
			//closeButtonText: "x", // ✖ = &#x2716;
			//top: 120+exportWindow,
			//left: 120+exportWindow, // optional: when no top or left are given, this window attempts to center itself
			width: 225, // starting width
			height: 200, // starting height
			minWidth: 100, // don't go thinner than this
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
					text: "PNG",
					clicked: function() {
						exportGraphic("png");
					}
				}, {
					text: "JPG",
					clicked: function() {
						exportGraphic("jpg");
					}
				}, {
					text: "SVG",
					clicked: function() {
						exportGraphic("svg");
					}
				},
			],
		});
	}
	exportWindow.show();
}

function exportGraphic(fileType) {
	// Get target size of the raster graphic (png/jpg)
	let   exportSize = Number(document.getElementById("exportSize").value);
	const jpgQuality = Number(document.getElementById("jpgQuality").value) / 100;

	// Read svg
	const svg		= document.getElementById("svg");
	const svgSize	= svg.getBoundingClientRect();

	// serialize svg
	let svgString;
	if (fileType === "svg") {
		// Remove hidden elements and not visible parts 

		// Step 1: identify groups outside of current view
		// This has to be done for the original svg, it's not possible for the clone.
/*		
console.log("\tid\tinBox\tx\ty\twidth\theigth\ttop\tbottom\tleft\tright");
console.log("svgSize\t\t\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s", 
	svgSize.x.toFixed(2),   svgSize.y.toFixed(2),      svgSize.width.toFixed(2), svgSize.height.toFixed(2), 
	svgSize.top.toFixed(2), svgSize.bottom.toFixed(2), svgSize.left.toFixed(2),  svgSize.right.toFixed(2)
);
*/
		for (const element of svg.querySelectorAll("g")) {
			const boundingRect = element.getBoundingClientRect();
			const inBox = 
					boundingRect.top	<= svgSize.bottom
				&&	boundingRect.bottom	>= svgSize.top
				&& 	boundingRect.left	<= svgSize.right
				&&	boundingRect.right	>= svgSize.left
				;
			if (inBox) {
				element.classList.remove("hiddenSVG");
			} else {
				element.classList.add("hiddenSVG");
			}
/*			
console.log("group\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s", 
	element.id,
	inBox,
	boundingRect.x.toFixed(2),   boundingRect.y.toFixed(2),      boundingRect.width.toFixed(2), boundingRect.height.toFixed(2), 
	boundingRect.top.toFixed(2), boundingRect.bottom.toFixed(2), boundingRect.left.toFixed(2),  boundingRect.right.toFixed(2)
);
*/
		}
		
		// Step 2: clone svg element
		const svgClone = svg.cloneNode(true);
		
		// Firefox requires explicit sizes for XMLSerializer
		svgClone.setAttribute("width", svgSize.width);
		svgClone.setAttribute("height", svgSize.height);

		// EEPweb likes to get a viewBox as well
		svgClone.setAttribute("viewBox", '0' + ' ' + '0' + ' ' + svgSize.width + ' ' + svgSize.height);

		// Step 3: remove hidden elements according to class "hidden"
		//for (const element of svgClone.getElementsByClassName("hidden")) {	// this finds exact matches only
		for (const element of svgClone.querySelectorAll(".hidden, .hiddenZ, .hiddenSVG")) {	// this finds all matches
			element.remove();
		}
		
		// Step 4: serialize svg
		svgString	= new XMLSerializer().serializeToString(svgClone);

		// Step 5: reduce precission (only partly required because mostly done in svgAppend)
		svgString = svgString.replace(/(\.\d{0,5})\d*/g, "$1");
		
	} else {
		// serialize svg
		svg.setAttribute("width", svgSize.width);		// Firefox requires explicit sizes for XMLSerializer ..
		svg.setAttribute("height", svgSize.height);
		svgString	= new XMLSerializer().serializeToString(svg);
		svg.removeAttribute("width");					// .. but SvgPanZoom manages the size by itself, therefore we have to remove the size again
		svg.removeAttribute("height");
	} 	

	// Create object url
	const svgType = "image/svg+xml;charset=utf-8";
	const svgBlob = new Blob([svgString], {type: svgType});
	const url = URL.createObjectURL(svgBlob);

	if (fileType === "svg") {
		// Export svg
		exportData(url, fileType);
		return;
	}

	// Convert svg to png/jpg and export it

	// Create canvas
	const canvas = document.createElement("canvas");

	// Set size of canvas
	const ratio = svgSize.width / svgSize.height;

	if (ratio > 1) {
		if (fileType === "jpg") {
			// Das EEP Forum erfordert Bilder mit Breite zwischen 800 und 1920 
			exportSize 	= Math.max(800, Math.min(1920, exportSize));
			// Das EEP Forum erfordert Bilder mit Höhe zwischen 500 und 1080 
			if (exportSize / ratio < 500) {
				exportSize = 500 * ratio;
			}
			if (exportSize / ratio > 1080) {
				exportSize = 1080 * ratio;
			}
		}
		canvas.width 	= exportSize;
		canvas.height 	= exportSize / ratio;
	} else { // ratio < 1
		if (fileType === "jpg") {
			// Das EEP Forum erfordert Bilder mit Höhe zwischen 500 und 1080 
			exportSize 	= Math.max(500, Math.min(1080, exportSize));
			// Das EEP Forum erfordert Bilder mit Breite zwischen 800 und 1920 
			if (exportSize * ratio < 800) {
				exportSize = 800 / ratio
			}
			if (exportSize * ratio > 1920) {
				exportSize = 1920 / ratio
			}
		}
		canvas.width 	= exportSize * ratio;
		canvas.height 	= exportSize;
	}

	const ctx = canvas.getContext("2d");

	// Create image from object url
	const img = new Image();
	img.onload = function() {
		// Paint image into canvas
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		// Remove temporary data
		URL.revokeObjectURL(url);

		// Convert canvas to png/jpg
		// Firefox might raise exception NS_ERROR_FAILURE
		let mimeType;
		if 		(fileType === "png") { mimeType = "image/png"; }
		else if (fileType === "jpg") { mimeType = "image/jpeg"; }
		else {
			msg('Dateityp nicht unterstützt', fileType);
			return false;
		}

		let DataURL;
		try{
			const encoderOptions = jpgQuality; // jpg quality (default 0.92)
			DataURL = canvas.toDataURL(mimeType, encoderOptions);
		} catch(err){
			console.log(err);
			msg('Zu groß, Export nicht möglich', " (toDataURL()): " + mimeType);
			return false;
		}
		// We might get a very short result which is another type of error
		if ( DataURL.length <= 6 ) {
			msg('Zu groß, Export nicht möglich', " (DataURL.length): " + mimeType)
			return false;
		}

		const rc = exportData(DataURL, fileType);
		msg('Graphik-Export', fileType, `${canvas.width}x${canvas.height}`);
		return rc;
	};
	// Load img
	img.src = url;
}

function exportData(dataURL, fileType) {
	// Get file name without extension
	const filename = document.getElementById("filename").textContent;

	// Create download link and click it
	const link = document.createElement("a");
	link.setAttribute("href", dataURL);
	link.setAttribute("download", filename + "." + fileType);
	//link.setAttribute("target", "_blank"); // not required
	link.style.display = "none";
	document.body.appendChild(link); // Required for Firefox(?)
	// Download
	try{
		link.click(); // We might get a network error in case of very huge results (but it's not possible to catch the error)
	} catch(err){
		console.log(err);
		msg('Zu groß, Export nicht möglich', " (link.click)");
		document.body.removeChild(link);
		URL.revokeObjectURL(dataURL);
		return false;
	}
	// Remove temporary data
	document.body.removeChild(link);
	URL.revokeObjectURL(dataURL);
	return true;
}
})(this); // end module