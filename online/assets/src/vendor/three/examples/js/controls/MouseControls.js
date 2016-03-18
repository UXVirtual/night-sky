/**
 * @author dmarcos / http://github.com/dmarcos
 *
 * This controls allow to change the orientation of the camera using the mouse
 */

var Util = require('webvr-polyfill/src/util');

THREE.MouseControls = function ( object, domElement ) {

    var scope = this;



    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };


    var PI_2 = Math.PI / 2;
    var mouseQuat = {
        x: new THREE.Quaternion(),
        y: new THREE.Quaternion()
    };
    var object = object;
    var xVector = (Util.isIOS()) ? new THREE.Vector3( 0, 0, 1 ) : new THREE.Vector3( 1, 0, 0 ); //on IOS we have to invert the X axis, so we need to correct it here otherwise it will show up as a Z rotation
    var yVector = new THREE.Vector3( 0, 1, 0 );

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var STATE = { NONE : - 1, ROTATE : 0, TOUCH_ROTATE : 3 };

    var state = STATE.NONE;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // Mouse buttons
    this.mouseButtons = { ROTATE: THREE.MOUSE.LEFT };

    this.enabled = true;

    this.orientation = {
        x: 0,
        y: 0,
    };

    function onMouseDown( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        if ( event.button === scope.mouseButtons.ROTATE ) {

            console.log('mouse down');

            if ( scope.enableRotate === false ) return;

            handleMouseDownRotate( event );

            state = STATE.ROTATE;

            console.log(state)

        }

        if ( state !== STATE.NONE ) {

            scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
            scope.domElement.addEventListener( 'mouseup', onMouseUp, false );
            scope.domElement.addEventListener( 'mouseout', onMouseUp, false );

            scope.dispatchEvent( startEvent );

        }

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        if ( state === STATE.ROTATE ) {

            if ( scope.enableRotate === false ) return;

            handleMouseMoveRotate( event );

        }

    }

    function onMouseUp( event ) {

        if ( scope.enabled === false ) return;

        handleMouseUp( event );

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );
        document.removeEventListener( 'mouseout', onMouseUp, false );

        scope.dispatchEvent( endEvent );

        state = STATE.NONE;

    }



    function onTouchStart( event ) {

        if ( scope.enabled === false ) return;

        console.log('touchstart');

        switch ( event.touches.length ) {

            case 1:	// one-fingered touch: rotate

                if ( scope.enableRotate === false ) return;

                handleTouchStartRotate( event );

                state = STATE.TOUCH_ROTATE;

                break;

            default:

                state = STATE.NONE;

        }

        if ( state !== STATE.NONE ) {

            scope.dispatchEvent( startEvent );

        }

    }

    function onTouchMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate

                if ( scope.enableRotate === false ) return;
                if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

                handleTouchMoveRotate( event );

                break;

            default:

                state = STATE.NONE;

        }

    }

    function onTouchEnd( event ) {

        if ( scope.enabled === false ) return;

        handleTouchEnd( event );

        scope.dispatchEvent( endEvent );

        state = STATE.NONE;

    }

    function onContextMenu( event ) {

        event.preventDefault();

    }

    function handleTouchStartRotate( event ) {

        //console.log( 'handleTouchStartRotate' );

        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    function handleTouchEnd( event ) {

        console.log( 'handleTouchEnd' );

    }

    function handleTouchMoveRotate( event ) {

        console.log( 'handleTouchMoveRotate' );



        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        rotateDelta.subVectors(rotateEnd, rotateStart);
        rotateStart.copy(rotateEnd);

        // On iOS, direction is inverted.
        if (Util.isIOS()) {
            //rotateDelta.x *= -1;
        }

        var orientation = scope.orientation;

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        orientation.x += 2 * Math.PI * rotateDelta.y / element.clientWidth * scope.rotateSpeed;

        orientation.y += 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed;

        //orientation.x = Math.max( - PI_2, Math.min( PI_2, orientation.x ) );

        scope.update();

    }

    function handleMouseMoveRotate( event ) {

        console.log( 'handleMouseMoveRotate' );

        rotateEnd.set( event.clientX, event.clientY );
        rotateDelta.subVectors( rotateEnd, rotateStart );

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        /*rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

        rotateStart.copy( rotateEnd );*/

        rotateStart.copy( rotateEnd );

        var orientation = scope.orientation;

        var movementX = rotateDelta.x;
        var movementY = rotateDelta.y;

        orientation.y += movementX * 0.0025;
        orientation.x += movementY * 0.0025;

        orientation.x = Math.max( - PI_2, Math.min( PI_2, orientation.x ) );

        scope.update();

    }

    function handleMouseDownRotate( event ) {

        console.log( 'handleMouseDownRotate' );

        rotateStart.set( event.clientX, event.clientY );

    }

    function handleMouseUp( event ) {

        console.log( 'handleMouseUp' );

    }

    this.update = function() {

        if ( scope.enabled === false ) return;

        mouseQuat.x.setFromAxisAngle( xVector, scope.orientation.x );
        mouseQuat.y.setFromAxisAngle( yVector, scope.orientation.y );
        object.quaternion.copy( mouseQuat.y ).multiply( mouseQuat.x );
        return;

    };

    this.dispose = function() {

        scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
        scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );
        document.removeEventListener( 'mouseout', onMouseUp, false );


    }

    //scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
    scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
    scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
    scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
    scope.domElement.addEventListener( 'touchmove', onTouchMove, false );
    scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

};

THREE.MouseControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.MouseControls.prototype.constructor = THREE.MouseControls;
