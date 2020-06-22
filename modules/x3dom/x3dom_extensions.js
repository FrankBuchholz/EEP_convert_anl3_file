// Extensions for mode module x3dom
"use strict";

// The ready() method is called once the system initialized and is ready to render the first time.
x3dom.runtime.ready = function() {
	const x3d = document.getElementById('x3d');	// upvalue for local functions
	
	redefineEventFunctions();

function redefineEventFunctions(){
	/* It is possible to use attributes "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onclick", "ondblclick", "onkeydown", "onkeypress", "onkeyup", "ontouchstart", "ontouchmove", "ontouchend", "ontouchcancel", "ontouchleave", "ontouchenter", "ondragstart", "ondrop", "ondragover" 
	at the x3d element to replace the event handler. 
	However, this solution might not work if you just want to extend the existing event handlers. 
	
	The pull request "Expose canvas event handlers" describes how to extend handlers.
	https://github.com/x3dom/x3dom/pull/665

	x3d.runtime.canvas offers following handlers:
	onMouseDown 
	onMouseUp 
	onMouseOver 		Mouse enters canvas area
	onMouseOut			Mouse leaves canvas area
	onDoubleClick		Process depending on pick mode
	onMouseMove
	onDOMMouseScroll
	onKeyPress			keys: SPACE, + - 3 4 6 7 8 9 a c d e f g h i l m n o p r s t u v w y
	onMouseWheel		move forward/backward by changing the y-position
	onKeyUp				keys: return page-up page-down end home  (no operation: left up right down)
	onKeyDown			keys: left up right down
	
	more events: "onclick", "ondblclick", "ontouchstart", "ontouchmove", "ontouchend", "ontouchcancel", "ontouchleave", "ontouchenter", "ondragstart", "ondrop", "ondragover"
	*/
	const x3dCanvas = x3d.runtime.canvas;

	// Store original event functions
	const _onKeyDown 	= x3dCanvas.onKeyDown;
	const _onKeyUp 		= x3dCanvas.onKeyUp;
	const _onKeyPress 	= x3dCanvas.onKeyPress;
	const _onMouseWheel = x3dCanvas.onMouseWheel;

	// Redefine event functions
	
	// onKeyDown
	x3dCanvas.onKeyDown = function(event) {
		// this													<canvas>
		// this.parent === event.target.parent					x3dom.X3DCanvas
		// this.parent.canvas									<canvas>
		// this.parent.doc										x3dom.X3DDocument
		// this.parent.doc._x3dElem
		// this.parent.doc._scene
		// view = this.parent.doc._viewarea
		// navi = this.parent.doc._scene.getNavigationInfo()

		const keyCode = event.keyCode;
		const viewarea = this.parent.doc._viewarea;
		const navi = this.parent.doc._scene.getNavigationInfo();
		const naviType = navi.getType();
		//const env  = this.parent.doc._scene.getEnvironment();
		let callOriginalHandler = true;
		
		// copied from x3dom.X3DDocument.prototype.onKeyDown
		switch (keyCode) {
		case 37: /* left */
			//this._viewarea.strafeLeft();
			//...
			x3dom.debug.logInfo("move left")
			//callOriginalHandler = false;
			break;
		case 38: /* up */
			//this._viewarea.moveFwd();
			//...
			x3dom.debug.logInfo("move forward")
			//callOriginalHandler = false;
			break;
		case 39: /* right */
			//this._viewarea.strafeRight();
			//...
			x3dom.debug.logInfo("move right")
			//callOriginalHandler = false;
			break;
		case 40: /* down */
			//this._viewarea.moveBwd();
			//...
			x3dom.debug.logInfo("move backwards")
			//callOriginalHandler = false;
			break;
		default:
		}
		
		if (callOriginalHandler) {
			// Call original function
			_onKeyDown.call(this, event);
		}
	}
	
	// onKeyUp 
	x3dCanvas.onKeyUp = function(event) {
		
			// Call original function
			_onKeyUp.call(this, event);
	}
	
	// onKeyPress 
	x3dCanvas.onKeyPress = function(event) {
		
			// Call original function
			_onKeyPress.call(this, event);
	}
	
	// onMouseWheel
	x3dCanvas.onMouseWheel = function(event) {
		/* The original function moves forward/backward by changing the y-position 
		*/
		
		// get current viewpoint
		const viewpoint = x3d.runtime.viewpoint();
		
		// Alt+MouseWheel: Zoom in/out by changing fieldofview
		if (event.altKey) {
			let offset = (event.wheelDelta > 0 ? -.01 : .01);
			let fov = 
				parseFloat(viewpoint._xmlNode.getAttribute('fieldofview'))	// long form
				//viewpoint.getFieldOfView() 								// shortcut
				|| 1.571;
			fov = Math.min(2, Math.max(0.001, fov + offset));
			viewpoint._xmlNode.setAttribute('fieldofview', fov)

		} else {
			// Call original function
			_onMouseWheel.call(this, event);
		}
	}

	// Replace event handlers (unable to unbind when handler is anonymous function)
	// see x3dom.X3DCanvas.prototype.bindEventListeners
	x3dCanvas.canvas.removeEventListener('keydown', 	_onKeyDown, 		true);
	x3dCanvas.canvas.removeEventListener('keyup', 		_onKeyUp, 			true);
	x3dCanvas.canvas.removeEventListener('keypress', 	_onKeyPress, 		true);
	x3dCanvas.canvas.removeEventListener('mousewheel', 	_onMouseWheel, 		false);

	x3dCanvas.canvas.addEventListener('keydown', 	x3dCanvas.onKeyDown, 	true);	
	x3dCanvas.canvas.addEventListener('keyup', 		x3dCanvas.onKeyUp, 		true);	
	x3dCanvas.canvas.addEventListener('keypress', 	x3dCanvas.onKeyPress, 	true);	
	x3dCanvas.canvas.addEventListener('mousewheel',	x3dCanvas.onMouseWheel,	false);	
}

} // end x3dom.runtime.ready

