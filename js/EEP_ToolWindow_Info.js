// toolwindow: Info-Fenster für den EEP Gleisplan
"use strict";
/* global
	global:readonly,
	ToolWindow:readonly
*/
/* Interface
required global data:
	global
required functions:
	ToolWindow
public api:
	showInfoWindow
*/
(function(api) {
// public api
api.showInfoWindow = showInfoWindow;

let infoWindow = { count: 0, };
function showInfoWindow(options) {
	let code = "default";
	if (global.shiftDown) {
		code = options.code;
	}
	if (!infoWindow[code]) {
		infoWindow.count = (infoWindow.count+1)%10;
		infoWindow[code] = new ToolWindow({
			title: options.title, // goes in the title bar,
			//closeButtonText: "x", // ✖ = &#x2716;
			top:       120+infoWindow.count*32,
			left:      120+infoWindow.count*32, // optional: when no top or left are given, this window attempts to center itself
			width:     225, // starting width
			height:    200, // starting height
			minWidth:  100, // don't go thinner than this
			minHeight: 100, // don't go shorter than this
			//placement: "inside,auto",
			//relativeToElement: "#container",
			animated: true,
			content: {
				type: "html",
				value: options.content,
			},
			buttons: [/*{	//  to omit all buttons
				text: 'Dismiss',
				clicked: function() {
					// button click handlers are invoked with the infoWindow as the `this` parameter
					this.hide();
				}
				}, {
				text: 'Refresh',
				clicked: function() {
					// note that we can completely replace the content
					// here and that content.value can be any one of:
					// - string
					// - function producing a string
					// - async function producing a string (ie, promise)
					this.content = {
						type: "html",
						value: '<hr/>This is html<hr/>'
					};
					this.refresh();
				}
			}*/]
		});
	} else {
		infoWindow[code].title = options.title;
		infoWindow[code].content.value = options.content;
		infoWindow[code].fitContent();
	}
	infoWindow[code].show();
}
})(this);