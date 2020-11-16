// Extensions for mode module x3dom
"use strict";

/*
Interactive functions of the main program EEP
http://handbuch.eepshopping.de/index.php?title=Hotkey-Tabelle

EEP					X3DOM					Description		
F1											Help
F4					Enter					Full screen (Vollbildmodus)
Esc					Esc						Reset full screen (aus dem Vollbildmodus zurück zur Fensteransicht)

←											Yaw left (Kamera links schwenken)
→ 											Yaw right (Kamera rechts schwenken)
↑ 											Pitch up (Kamera hoch schwenken)
↓											Pitch down (Kamera runter schwenken)

Shift + ←									Circle around object left (Kamera links kreisen)
Shift + → 									Circle around object right (Kamera rechts kreisen)
Shift + ↑ 									Move up and pitch down keeping object in center (Kamera hoch kreisen)
Shift + ↓									Move down and pitch up keeping object in center (Kamera runter kreisen)

Ctrl + ←									Move left on same height (Kamera links bewegen)
Ctrl + → 									Move right on same height (Kamera rechts bewegen)
Ctrl + ↑ 									Move ahead on same height (Kamera nach vorne bewegen)
Ctrl + ↓									Move back on same height (Kamera nach hinten bewegen)

Page up 									Move up (Kamera hoch bewegen)
Page down									Move down (Kamera runter bewegen)

Shift + Page up 							Move up fast (Kamera schnell hoch bewegen)
Shift + Page down							Move down fast (Kamera schnell runter bewegen)

(Ctrl + Page up) 							Move up slowly (Kamera langsam hoch bewegen) (*)
(Ctrl + Page down)							Move down slowly (Kamera langsam runter bewegen) (*)

Space or +									Move forward (Kamera vorwärts bewegen)
R or -										Move backwards (Kamera rückwärts bewegen)
(home)										View all top down (Kamera auf Ursprung zentrieren) (**)

Mouse buttons:
left
middle										Circle around object located at the hit point (Drehen der Kamera um einen Punkt)
right										Move left/right respective ahead/back depending on position relative to center (Kamera bewegen)

Mouse wheel:
at border									Yaw left/right respective pitch up/down (Kamera schwenken: Mausrad drehen am Bildrand)
Ctrl + at border							Move left/right respective ahead/back (Kamera bewegen: Mausrad drehen am Bildrand)
at center 				Alt + left mouse	Move forward/backwards, +: fast, +Ctrl: slow (Kamera vorwärts/rückwärts bewegen: Mausrad drehen im Bildzentrum)
Shift + at center 							Move fast forward/backwards (Kamera schnell vorwärts/rückwärts bewegen: Mausrad drehen im Bildzentrum)
Ctrl + at center 							Move slow forward/backwards (Kamera langsam vorwärts/rückwärts bewegen: Mausrad drehen im Bildzentrum)

(*) Not possible because the browser catches these key events to select previous/next tab
(**) We need this key to choose first viewpoint

Extentions of X3dom

a) Key "a"
Adjust viewarea to show all objects in top down view:
viewarea.showAll("negY");

b) Home, End, Alt + Page up, Alt + Page down
Choose predefined viewpoint and show viewarea with original position and orientation.
viewpoint._stack.switchTo(...);
viewarea.resetView()

c) Alt + Mouse wheel
The mouse wheel performs move forwald / move backward.
In addition it should be possible to zoom in / zoom out the field of view.
This is done via Alt + Mouse wheel.
setAttribute('fieldofview', ...)

*/

// The ready() method is called once the system initialized and is ready to render the first time.
x3dom.runtime.ready = function() {

    x3dom.canvases.forEach(redefineEventFunctions);

    function redefineEventFunctions(x3dCanvas) {
        /* It is possible to use attributes "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onclick", "ondblclick", "onkeydown", "onkeypress", "onkeyup", "ontouchstart", "ontouchmove", "ontouchend", "ontouchcancel", "ontouchleave", "ontouchenter", "ondragstart", "ondrop", "ondragover" 
        at the x3d element to replace the event handler. 
        However, this solution would not work if you want to extend the existing event handlers. 

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
        onKeyUp				keys: return page-up page-down end home  (no operation on left up right down)
        onKeyDown			keys: left up right down

        more events: "onclick", "ondblclick", "ontouchstart", "ontouchmove", "ontouchend", "ontouchcancel", "ontouchleave", "ontouchenter", "ondragstart", "ondrop", "ondragover"
        */
        //const x3dCanvas = x3d.runtime.canvas;

        // Store original event functions
        const _onKeyDown = x3dCanvas.onKeyDown;
        const _onKeyUp = x3dCanvas.onKeyUp;
        const _onKeyPress = x3dCanvas.onKeyPress;
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

            const keyCode = event.keyCode;

            const canvas = this.parent.canvas; // == x3dom.Runtime.getCanvas()

            const doc = this.parent.doc;
            const viewarea = doc._viewarea;

            const scene = doc._scene;
            const viewpoint = scene.getViewpoint(); // == x3dom.Runtime.viewpoint()
            const navi = scene.getNavigationInfo();
            const env = scene.getEnvironment();

            const naviType = navi.getType(); // == x3dom.Runtime.navigationType()
            const speed = navi._vf.speed; // == x3dom.Runtime.speed()

            let callOriginalHandler = true;

            let speedFactor;

            // see x3dom.X3DDocument.prototype.onKeyDown
            switch (keyCode) {
                case 33: // page up
                    // Page up 				Move up (Kamera hoch bewegen)
                    // Shift + Page up 		Move up fast (Kamera schnell hoch bewegen)
                    // (Ctrl + Page up)		Move up slowly (Kamera langsam hoch bewegen) (*)
                    // (*) Not possible because the browser catches these key events to select previous/next tab
                    if (!event.altKey) {
                        speedFactor = (event.shiftKey ? 2 : (event.ctrlKey ? 0.5 : 1));
                        move(doc, "up", speedFactor);
                        callOriginalHandler = false;
                    }
                    break;

                case 34: // page down
                    // Page down			Move down (Kamera runter bewegen)
                    // Shift + Page down	Move down fast (Kamera schnell runter bewegen)
                    // (Ctrl + Page down)	Move down slowly (Kamera langsam runter bewegen) (*)
                    // (*) Not possible because the browser catches these key events to select previous/next tab
                    if (!event.altKey) {
                        speedFactor = (event.shiftKey ? 2 : (event.ctrlKey ? 0.5 : 1));
                        move(doc, "down", speedFactor);
                        callOriginalHandler = false;
                    }
                    break;

                case 37: // left 
                    if (event.shiftKey) {
                        // Shift + ←		Circle around object left (Kamera links kreisen)
                        circle("left");
                    } else if (event.ctrlKey) {
                        // Ctrl + ←			Move left on same height (Kamera links bewegen)
                        move(doc, "left");
                    } else {
                        // ←				Yaw left (Kamera links schwenken)
                        yaw("left");
                    }
                    //callOriginalHandler = false;
                    break;

                case 38: // up
                    if (event.shiftKey) {
                        // Shift + ↑ 	Move up and pitch down keeping object in center (Kamera hoch kreisen)
                        movePitch(doc, "up");
                    } else if (event.ctrlKey) {
                        // Ctrl + ↑ 	Move ahead on same height (Kamera nach vorne bewegen)
                        move(doc, "ahead");
                    } else {
                        // ↑ 			Pitch up (Kamera hoch schwenken)
                        pitch(doc, "up");
                    }
                    callOriginalHandler = false;
                    break;

                case 39: // right
                    if (event.shiftKey) {
                        // Shift + →	Circle around object right (Kamera rechts kreisen)
                        circle("right");
                    } else if (event.ctrlKey) {
                        // Ctrl + → 	Move right on same height (Kamera rechts bewegen)
                        move(doc, "right");
                    } else {
                        // → 			Yaw right (Kamera rechts schwenken)
                        yaw("right");
                    }
                    callOriginalHandler = false;
                    break;

                case 40: // down
                    if (event.shiftKey) {
                        // Shift + ↓	Move down and pitch up keeping object in center (Kamera runter kreisen)
                        movePitch(doc, "down");
                    } else if (event.ctrlKey) {
                        // Ctrl + ↓		Move back on same height (Kamera nach hinten bewegen)
                        move(doc, "back");
                    } else {
                        // ↓			Pitch down (Kamera runter schwenken)
                        pitch("down");
                    }

                    callOriginalHandler = false;
                    break;
                default:
            }

            if (callOriginalHandler) {
                // Call original function
                _onKeyDown.call(this, event);
            }

            function circle(direction) { // direction: left right

            };

            function move(doc, direction, speedFactor = 1) { // direction: left right ahead back forward backwards up down
                const canvas    = doc.canvas;                // == x3dom.Runtime.getCanvas()
                const viewarea  = doc._viewarea;
    
                const scene     = doc._scene;
                const viewpoint = scene.getViewpoint();      // == x3dom.Runtime.viewpoint()
                const navi      = scene.getNavigationInfo();
                const env       = scene.getEnvironment();
    
                const naviType  = navi.getType();            // == x3dom.Runtime.navigationType()
                const speed     = navi._vf.speed;            // == x3dom.Runtime.speed()

                const distance = 10;
                const duration = Math.max(0.5, Math.log((1 + distance) / (speedFactor * speed)));

                const targetViewpoint = viewpoint; 

                const viewMatrix = viewarea.getViewMatrix();

                let d = (viewarea._scene._lastMax.subtract(viewarea._scene._lastMin)).length();
                d = Math.min(d, viewpoint.getFar()); // use zfar if smaller to allow for large scenes with defined zfar
                d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed * speedFactor;

                let dir, vec; 
                switch ( direction ) {
                    case 'ahead': 
                        dir = 1;
                        vec = new x3dom.fields.SFVec3f(d * dir / viewarea._width, 0, 0 );
                        break;
                    case 'back':  
                        dir = -1;
                        vec = new x3dom.fields.SFVec3f(d * dir / viewarea._width, 0, 0 );
                        break;
                    case 'up':    
                        dir = 1;
                        vec = new x3dom.fields.SFVec3f(0, d * dir / viewarea._width, 0 );
                        break;
                    case 'down':  
                        dir = -1;
                        vec = new x3dom.fields.SFVec3f(0, d * dir / viewarea._width, 0 );
                        break;
                    case 'right': 
                        dir = 1;
                        vec = new x3dom.fields.SFVec3f(0, 0, d * dir / viewarea._height);
                        break;
                    case 'left':  
                        dir = -1;
                        vec = new x3dom.fields.SFVec3f(0, 0, d * dir / viewarea._height);
                        break;
                };
console.log(direction, vec);

                const target = viewpoint._viewMatrix.add(vec);

                doc._viewarea.animateTo(target, viewpoint, duration);
return;
// copied from x3dom.DefaultNavigation.prototype.zoom(view, zoomAmount)
/*
    const view = viewarea;
    const zoomAmount = (direction === "ahead" ? 1 : (direction === "back" ? -1 : 0));

    let d = (view._scene._lastMax.subtract(view._scene._lastMin)).length();
    d = Math.min(d, viewpoint.getFar()); // use zfar if smaller to allow for large scenes with defined zfar
    d = ((d < x3dom.fields.Eps) ? 1 : d) * navi._vf.speed * speedFactor;
    var vec = new x3dom.fields.SFVec3f(0, 0, d * (zoomAmount) / view._height);
    if (x3dom.isa(viewpoint, x3dom.nodeTypes.OrthoViewpoint)) {
        viewpoint.setZoom(Math.abs(viewpoint._fieldOfView[0]) - vec.z);
    }
    // else //### yes, this statement is commented in the original code
    {
        if (navi._vf.typeParams.length >= 6) {
            var min = -navi._vf.typeParams[5];  // turntable max orbit rotation angle phi
            var max = navi._vf.typeParams[4];   // turntable min orbit rotation angle phi
            view._movement.z = Math.min(Math.max(view._movement.z, min), max);
        }
        view._movement = view._movement.add(vec);
        var mat = view.getViewpointMatrix().mult(view._transMat);
        //TODO; move real distance along viewing ray
        view._transMat = mat.inverse()
                            .mult(x3dom.fields.SFMatrix4f.translation(view._movement))
                            .mult(mat);
    }
*/

                doc.needRender = true;
            };

            function pitch(doc, direction) { // direction: up down

            };

            function movePitch(doc, direction) { // direction: up down

            };

            function yaw(doc, direction) { // direction: left right

            };
        };

        // onKeyUp 
        x3dCanvas.onKeyUp = function(event) {
            const keyCode = event.keyCode;
            const viewpoint = this.parent.doc._scene.getViewpoint(); // up-value
            const viewarea = this.parent.doc._viewarea; // up-value
            //const navi = this.parent.doc._scene.getNavigationInfo();
            //const naviType = navi.getType();
            //const env  = this.parent.doc._scene.getEnvironment();
            let callOriginalHandler = true;

            var stack = null;
            switch (keyCode) {
                case 33: // page up
                    if (event.altKey) {
                        // page up is used to move the viewpoint, therefore we need an alternate key combination
                        switchToViewpoint('prev');
                    }
                    callOriginalHandler = false;
                    break;

                case 34: // page down
                    if (event.altKey) {
                        // page up is used to move the viewpoint, therefore we need an alternate key combination
                        switchToViewpoint('next');
                    }
                    callOriginalHandler = false;
                    break;

                case 35: // end
                    switchToViewpoint('last');
                    callOriginalHandler = false;
                    break;

                case 36: // home
                    switchToViewpoint('first');
                    callOriginalHandler = false;
                    break;

                default:
            }

            if (callOriginalHandler) {
                // Call original function
                _onKeyUp.call(this, event);
            }

            function switchToViewpoint(command) {
                let callOriginalHandler = true;

                if (viewpoint._stack) {
                    viewpoint._stack.switchTo(command);
                    viewarea.resetView();
                    callOriginalHandler = false;
                } else {
                    x3dom.debug.logError('No valid ViewBindable stack.');
                    callOriginalHandler = true;
                }
                return callOriginalHandler;
            }
        };

        // onKeyPress 
        x3dCanvas.onKeyPress = function(event) {
            const keyCode = event.keyCode;
            //const viewpoint = this.parent.doc._scene.getViewpoint();
            const viewarea = this.parent.doc._viewarea;
            //const navi = this.parent.doc._scene.getNavigationInfo();
            //const naviType = navi.getType();
            //const env  = this.parent.doc._scene.getEnvironment();
            let callOriginalHandler = true;

            switch (keyCode) {
                case 97: // a	show all elements and move to top view
                    viewarea.showAll("negY");
                    x3dom.debug.logInfo("showAll")
                    callOriginalHandler = false;
                    break;
            }

            if (callOriginalHandler) {
                // Call original function
                _onKeyPress.call(this, event);
            }
        };

        // onMouseWheel
        x3dCanvas.onMouseWheel = function(event) {

            // get current viewpoint
            const viewpoint = this.parent.doc._scene.getViewpoint(); // == x3dom.Runtime.viewpoint()

            // Alt+MouseWheel: Zoom in/out by changing fieldofview
            if (event.altKey) {
                let offset = (event.wheelDelta > 0 ? -.01 : .01);
                let fov =
                    //parseFloat(viewpoint._xmlNode.getAttribute('fieldofview')) // long form
                    viewpoint.getFieldOfView() 								    // shortcut
                    || Math.PI / 2;                                             // default
                fov = Math.min(2, Math.max(0.001, fov + offset));
                viewpoint._xmlNode.setAttribute('fieldofview', fov)

            } else {
                // Call original function
                _onMouseWheel.call(this, event);
            }
        };

        // Replace event handlers (unable to unbind when handler is anonymous function)
        // see x3dom.X3DCanvas.prototype.bindEventListeners
        x3dCanvas.canvas.removeEventListener('keydown', _onKeyDown, true);
        x3dCanvas.canvas.removeEventListener('keyup', _onKeyUp, true);
        x3dCanvas.canvas.removeEventListener('keypress', _onKeyPress, true);
        x3dCanvas.canvas.removeEventListener('mousewheel', _onMouseWheel, false);

        x3dCanvas.canvas.addEventListener('keydown', x3dCanvas.onKeyDown, true);
        x3dCanvas.canvas.addEventListener('keyup', x3dCanvas.onKeyUp, true);
        x3dCanvas.canvas.addEventListener('keypress', x3dCanvas.onKeyPress, true);
        x3dCanvas.canvas.addEventListener('mousewheel', x3dCanvas.onMouseWheel, false);

        function moveForward(view, navi) {
            x3dom.debug.logInfo("move forward")
                // copied from x3dom.DefaultNavigation.prototype.moveForward
                /* let's ignore collision detection
                		var avatarRadius = 0.25;
                		if (navi._vf.avatarSize.length > 2) {
                			avatarRadius = navi._vf.avatarSize[0];
                		}
                */
            var speed = 5 * view._deltaT * navi._vf.speed;
            var yRotRad = (view._yaw / 180 * Math.PI);
            var xRotRad = (view._pitch / 180 * Math.PI);
            /*
            		var dist = 0;
            		var fMat = view.getViewMatrix();
            		view._scene._nameSpace.doc.ctx.pickValue(view, view._width / 2, view._height / 2, view._lastButton);
            		if (view._pickingInfo.pickObj) {
            			dist = view._pickingInfo.pickPos.subtract(fMat.e3()).length();
            			if (dist <= 2 * avatarRadius) {}
            			else {
            */
            view._eyePos.x -= Math.sin(yRotRad) * speed;
            view._eyePos.z += Math.cos(yRotRad) * speed;
            view._eyePos.y += Math.sin(xRotRad) * speed;
            /*				
            			}
            */
        };

        function moveBackwards(view, navi) {
            x3dom.debug.logInfo("move backwards")
                // copied from x3dom.DefaultNavigation.prototype.moveBackwards
            var speed = 5 * view._deltaT * navi._vf.speed;
            var yRotRad = (view._yaw / 180 * Math.PI);
            var xRotRad = (view._pitch / 180 * Math.PI);
            view._eyePos.x += Math.sin(yRotRad) * speed;
            view._eyePos.z -= Math.cos(yRotRad) * speed;
            view._eyePos.y -= Math.sin(xRotRad) * speed;
        };

        function moveLeft(view, navi) {
            x3dom.debug.logInfo("move left")
                // copied from x3dom.DefaultNavigation.prototype.strafeLeft
            var speed = 5 * view._deltaT * navi._vf.speed;
            var yRotRad = (view._yaw / 180 * Math.PI);
            view._eyePos.x += Math.cos(yRotRad) * speed;
            view._eyePos.z += Math.sin(yRotRad) * speed;
            // view._eyePos.y no change 
        };

        function moveRight(view, navi) {
            // copied from x3dom.DefaultNavigation.prototype.strafeRight
            var speed = 5 * view._deltaT * navi._vf.speed;
            var yRotRad = (view._yaw / 180 * Math.PI);
            view._eyePos.x -= Math.cos(yRotRad) * speed;
            view._eyePos.z -= Math.sin(yRotRad) * speed;
            // view._eyePos.y no change 
        };

    }; // end redefineEventFunctions
}; // end x3dom.runtime.ready