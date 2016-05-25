import { SpriteText2D, textAlign } from 'three-text2d'

import './config/WebVRConfig'

import 'webvr-polyfill/src/main'

import 'webvr-boilerplate'
import dat from 'dat-gui'

import './vendor/three/examples/js/controls/MouseControls'
import 'three/examples/js/controls/VRControls'
import 'three/examples/js/effects/VREffect'

import './vendor/charliehoey/GPUParticleSystem'

import 'fpsmeter/dist/fpsmeter'

import 'jquery-modal'

import 'jquery-modal/jquery.modal.css'

import MobileDetect from 'mobile-detect'

import 'perfnow'

import Stats from 'stats.js'

import './vendor/modernizr/modernizr-custom'

import '../../bower_components/ocean/water-material.js'



var sky, sphere, sphere2, moonLightDebugSphere, sphereContainer, lightDirDebugSphere, cameraContainer, skyboxContainer, skyboxContainer2, scene, renderer, camera, dollyCam;
var starData;
var ms_Water;
var skyBox;
var meter, stats;
var cameraFOV = 45;

var moonScale = 15;

var waterTextureSize = 512;

var aMeshMirror;

var moonLightDirection = new THREE.Vector3(0,0,0);

var controls;

var spriteCount = 0;



var parameters =
{
    rotX: 34, //don't touch - defines rotation of star container to skybox!
    rotY: 32, //don't touch - defines rotation of star container to skybox!
    rotZ: 60, //don't touch - defines rotation of star container to skybox!
    lightDirX: 0,
    lightDirY: 0,
    lightDirZ: -1000,

    moonLightDirX: -50,
    moonLightDirY: -500,
    moonLightDirZ: 100,

    rotXFloor: 270, //defines rotation of floor to sphereContainer
    rotYFloor: 0, //defines rotation of floor to sphereContainer
    rotZFloor: 0, //defines rotation of floor to sphereContainer
    floorOffset: -10, //defines offset of floor to sphereContainer
    cameraContainerRotX: 0, //defines default rotation of camera
    cameraContainerRotY: 160, //defines default rotation of camera - linked to compass direction
    cameraContainerRotZ: 0, //defines default rotation of camera
    cameraOffset: 0, //set to 0 to hide water, set to 1 to show
    sphereRotX: 0, //defines default rotation of sphere used to point to north and south celestial poles
    sphereRotY: 0, //defines default rotation of sphere used to point to north and south celestial poles - if the camera is added to `sphere` and the Y axis is rotated around the sky will appear to rotate around the north / south points
    sphereRotZ: 0, //defines default rotation of sphere used to point to north and south celestial poles
    sphere2RotX: 0, //defines default rotation of sphere used to point to north and south celestial poles
    sphere2RotY: 0, //defines default rotation of sphere used to point to north and south celestial poles
    sphere2RotZ: 0, //defines default rotation of sphere used to point to north and south celestial poles
    sphereContainerRotX: 0, //defines default rotation of sphereContainer. Controls global orientation of camera
    sphereContainerRotY: 0, //defines default rotation of sphereContainer. Controls global orientation of camera
    sphereContainerRotZ: 0, //defines default rotation of sphereContainer. Controls global orientation of camera

    skyboxContainerRotX: 0,
    skyboxContainerRotY: 0, //adjust Y value to rotate sky around fixed point - linked to time of day
    skyboxContainerRotZ: 0,

    skyboxContainer2RotX: 235, //ajust X value to rotate sky into position according to lat
    skyboxContainer2RotY: 0,
    skyboxContainer2RotZ: 175, //ajust X value to rotate sky into position according to long

    skyboxRotX: 54,
    skyboxRotY: 326,
    skyboxRotZ: 347
};

var defaultWaterSide = THREE.FrontSide;

var debugOn = false;

var pointClouds = [];

var spriteContainer;

var md = new MobileDetect(window.navigator.userAgent);

var androidVersion = md.versionStr('Android');

var iOSVersion = md.versionStr('iOS')


var oldAndroid = (androidVersion !== null && cmpVersions(androidVersion,'5', '.') < 0);

var oldIOS = (iOSVersion !== null && cmpVersions(iOSVersion,'9', '_') < 0);

var canHandleOrientation = false;

(function() {

    var originalGetExtensionFunction = WebGLRenderingContext.prototype.getExtension;

    // start with this array empty. Once you know which extensions
    // the app is requesting you can then selectively add them here
    // to figure out which ones are required.
    var extensionToReject = [
        "OES_texture_float",
        "OES_texture_float_linear",
    ];

    WebGLRenderingContext.prototype.getExtension = function() {
        var name = arguments[0];
        if (extensionToReject.indexOf(name) >= 0) {
            return null;
        }
        var ext = originalGetExtensionFunction.apply(this, arguments);
        return ext;
    };

}());

window.addEventListener("compassneedscalibration", function(event) {

}, true);



function checkCanHandleOrientation(){

    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", handleOrientation, false);
    }

    function handleOrientation(event){
        canHandleOrientation = (event !== null); // event will be either null or with event data
    }
}

function cmpVersions (a, b, delimeter) {
    var i, l, diff, segmentsA, segmentsB;

    segmentsA = a.replace(/(\.0+)+$/, '').split(delimeter);
    segmentsB = b.replace(/(\.0+)+$/, '').split(delimeter);
    l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff !== 0) {
            return diff;
        }
    }
    return segmentsA.length - segmentsB.length;
}

function initFPSMeter(){
    // Meter will be attached to `document.body` with all default options.
    meter = new FPSMeter({
        interval:  100,     // Update interval in milliseconds.
        smoothing: 10,      // Spike smoothing strength. 1 means no smoothing.
        show:      'fps',   // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
        toggleOn:  'click', // Toggle between show 'fps' and 'ms' on this event.
        decimals:  1,       // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
        maxFps:    60,      // Max expected FPS value.
        threshold: 100,     // Minimal tick reporting interval in milliseconds.

        // Meter position
        position: 'absolute', // Meter position.
        zIndex:   10,         // Meter Z index.
        left:     '5px',      // Meter left offset.
        top:      '5px',      // Meter top offset.
        right:    'auto',     // Meter right offset.
        bottom:   'auto',     // Meter bottom offset.
        margin:   '0 0 0 0',  // Meter margin. Helps with centering the counter when left: 50%;

        // Theme
        theme: 'dark', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
        heat:  1,      // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

        // Graph
        graph:   1, // Whether to show history graph.
        history: 20 // How many history states to show in a graph.
    });
}

function loadSkyBox() {
    var path = "assets/img/skybox3-hr/";
    var format = '.png';
    var urls = [
        path + 'skybox_0' + format, path + 'skybox_1' + format,
        path + 'skybox_2' + format, path + 'skybox_3' + format,
        path + 'skybox_4' + format, path + 'skybox_5' + format
    ];

    //skybox is now no longer using shaders and has actual geometry instead so we can rotate it
    var skyGeometry = new THREE.CubeGeometry( 100000, 100000, 100000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(urls[i]),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    skyBox = new THREE.Mesh( skyGeometry, skyMaterial );

    skyboxContainer = new THREE.Object3D();

    skyboxContainer2 = new THREE.Object3D();

    scene.add(skyboxContainer2);

    skyboxContainer2.add(skyboxContainer);

    skyboxContainer.add(skyBox);

    skyboxContainer2.add( sphere2 );

    skyBox.add(sphereContainer);

    if(debugOn){


        var gui = new dat.GUI();

        gui.add( parameters, 'rotX' ).min(0).max(359).step(1).name('Stars RotX');
        gui.add( parameters, 'rotY' ).min(0).max(359).step(1).name('Stars RotY');
        gui.add( parameters, 'rotZ' ).min(0).max(359).step(1).name('Stars RotZ');

        gui.add( parameters, 'lightDirX' ).min(-2000).max(2000).step(50).name('LightDir X');
        gui.add( parameters, 'lightDirY' ).min(-2000).max(2000).step(50).name('LightDir Y');
        gui.add( parameters, 'lightDirZ' ).min(-2000).max(2000).step(50).name('LightDir Z');

        gui.add( parameters, 'rotXFloor' ).min(0).max(359).step(1).name('Floor RotX');
        gui.add( parameters, 'rotYFloor' ).min(0).max(359).step(1).name('Floor RotY');
        gui.add( parameters, 'rotZFloor' ).min(0).max(359).step(1).name('Floor RotZ');

        gui.add( parameters, 'floorOffset' ).min(-200).max(200).step(5).name('Floor Offset');

        gui.add( parameters, 'cameraContainerRotX' ).min(0).max(359).step(1).name('Camera RotX');
        gui.add( parameters, 'cameraContainerRotY' ).min(0).max(359).step(1).name('Camera RotY');
        gui.add( parameters, 'cameraContainerRotZ' ).min(0).max(359).step(1).name('Camera RotZ');

        gui.add( parameters, 'cameraOffset' ).min(-100).max(100).step(1).name('Camera Offset');


        gui.add( parameters, 'sphereRotX' ).min(0).max(359).step(1).name('Sphere RotX');
        gui.add( parameters, 'sphereRotY' ).min(0).max(359).step(1).name('Sphere RotY');
        gui.add( parameters, 'sphereRotZ' ).min(0).max(359).step(1).name('Sphere RotZ');

        gui.add( parameters, 'sphere2RotX' ).min(0).max(359).step(1).name('Sphere2 RotX');
        gui.add( parameters, 'sphere2RotY' ).min(0).max(359).step(1).name('Sphere2 RotY');
        gui.add( parameters, 'sphere2RotZ' ).min(0).max(359).step(1).name('Sphere2 RotZ');

        gui.add( parameters, 'skyboxRotX' ).min(0).max(359).step(1).name('Skybox RotX');
        gui.add( parameters, 'skyboxRotY' ).min(0).max(359).step(1).name('Skybox RotY');
        gui.add( parameters, 'skyboxRotZ' ).min(0).max(359).step(1).name('Skybox RotZ');

        gui.add( parameters, 'skyboxContainerRotX' ).min(0).max(359).step(1).name('SkyboxCon RotX');
        gui.add( parameters, 'skyboxContainerRotY' ).min(0).max(359).step(1).name('SkyboxCon RotY');
        gui.add( parameters, 'skyboxContainerRotZ' ).min(0).max(359).step(1).name('SkyboxCon RotZ');

        gui.add( parameters, 'skyboxContainer2RotX' ).min(0).max(359).step(1).name('SkyboxCon2 RotX');
        gui.add( parameters, 'skyboxContainer2RotY' ).min(0).max(359).step(1).name('SkyboxCon2 RotY');
        gui.add( parameters, 'skyboxContainer2RotZ' ).min(0).max(359).step(1).name('SkyboxCon2 RotZ');

        gui.open();
    }


}

function addBasicGroundPlane(){
    var geometry = new THREE.PlaneGeometry( 1500, 1500, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {color: 0x181818, side: THREE.FrontSide} );
    aMeshMirror = new THREE.Mesh( geometry, material );
}

function initScene(){

    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
    // Only enable it if you actually need to.
    renderer = new THREE.WebGLRenderer({antialias: false, alpha: false}); //performance hits if antialias or alpha used
    renderer.setPixelRatio(window.devicePixelRatio);

    // Append the canvas element created by the renderer to document body element.
    document.body.appendChild(renderer.domElement);


    //var starCount = 10000;
    var normalizeRadius = 500;
    var pointCloudCount = 3;
    var distanceScale = 1; //keep this at 1 now that we are normalizing star distance
    var starMagnitudes = 6; //number of visible star magnitude buckets
    var starMagnitudeScaleFactor = 4; //higher number = smaller stars
    var starSpriteSize = 5; //scaling factor of star sprites for near stars that make up major constellations

    // Create a three.js scene.
    scene = new THREE.Scene();

    window.scene = scene; //export as window.scene so the THREE.js inspector can access it

    cameraContainer = new THREE.Object3D();

    // Create a three.js camera.
    camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, 0.1, 2000000);
    dollyCam = new THREE.PerspectiveCamera();

    dollyCam.add(camera);

    cameraContainer.add(dollyCam);

    // Apply VR headset positional data to camera.

    controls = new THREE.VRControls(camera);

    // Apply VR stereo rendering to renderer.
    var effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    var loader = new THREE.TextureLoader();

    // Add light
    var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    directionalLight.position.set(parameters.lightDirX, parameters.lightDirY, parameters.lightDirZ);


    if(oldAndroid || oldIOS){
        addBasicGroundPlane();
    }else{
        // Load textures
        var waterNormals = new THREE.TextureLoader().load('assets/img/waternormals.jpg');
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;


        // Create the water effect - use THREE.BackSide or THREE.FrontSide depending on the default rotation of the cameraContainer
        ms_Water = new THREE.Water(renderer, camera, scene, {
            textureWidth: waterTextureSize,
            textureHeight: waterTextureSize,
            waterNormals: waterNormals,
            alpha: 	1.0,
            sunDirection: directionalLight.position.normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 50.0,
            //side: (parameters.cameraContainerRotY == 180) ? THREE.FrontSide : THREE.BackSide
            side: defaultWaterSide
        });
        aMeshMirror = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(1500, 1500, 10, 10),
            ms_Water.material
        );

        aMeshMirror.add(ms_Water);
    }


    sphereContainer = new THREE.Object3D;

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );

    if(debugOn){
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true, opacity: 0.05, transparent: true} );

        sphere = new THREE.Mesh( geometry, material );
    }else{
        sphere = new THREE.Object3D;
    }



    if(debugOn){

        var material2 = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true, opacity: 0.05, transparent: true} );

        sphere2 = new THREE.Mesh( geometry, material2 );
    }else{
        sphere2 = new THREE.Object3D;
    }

    var moonMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: false, opacity: 1, transparent: false/*, map: moonTexture*/} );

    moonLightDebugSphere = new THREE.Mesh( geometry, moonMaterial );


    moonLightDebugSphere.position.set(parameters.moonLightDirX,parameters.moonLightDirY,parameters.moonLightDirZ);


    lightDirDebugSphere = new THREE.Mesh( geometry, moonMaterial );


    lightDirDebugSphere.position.set(parameters.lightDirX,parameters.lightDirY,parameters.lightDirZ);

    lightDirDebugSphere.rotation.set(0,180,0);
    lightDirDebugSphere.scale.set(moonScale,moonScale,moonScale);


    scene.add(lightDirDebugSphere);

    sphereContainer.add( sphere );

    scene.add(aMeshMirror); //reflections don't work correctly unless aMeshMirror added to scene
    scene.add(cameraContainer);
    aMeshMirror.add(directionalLight); //reflections don't work correctly unless light added to scene


    loader.load('assets/img/star_preview3.png', onStarTextureLoaded);

    function onStarTextureLoaded(texture){
        initStars(texture);
    }

    function centerObject(obj){
        var box = new THREE.Box3().setFromObject( obj );
        box.center( obj.position ); // this re-sets the mesh position
        obj.position.multiplyScalar( - 1 );
    }


    // Create a VR manager helper to enter and exit VR mode.
    var params = {
        hideButton: true, // Default: false.
        isUndistorted: true // Default: false.
    };
    var manager = new WebVRManager(renderer, effect, params);

    function initStars(texture){
        var x, y, z;

        //generate point cloud geometry

        var pointCloudGeometries = new Array(pointCloudCount);

        spriteContainer = new THREE.Object3D();
        skyBox.add(spriteContainer);

        for(var k = 0; k < pointCloudCount; k++){
            pointCloudGeometries[k] = new Array(starMagnitudes);
            for(var a = 0; a < starMagnitudes; a++){
                pointCloudGeometries[k][a] = new THREE.Geometry();
            }
        }

        for(var l = 0; l < starData.count; l++){

            x = starData.x[l]*distanceScale;
            y = starData.y[l]*distanceScale;
            z = starData.z[l]*distanceScale;

            //normalize distance of stars, but keep apparent position in sky - we'll use the mag value to determine size later
            x = x * normalizeRadius/starData.dist[l];
            y = y * normalizeRadius/starData.dist[l];
            z = z * normalizeRadius/starData.dist[l];

            var targetPointCloudGeometry;
            var doInsertPoint = true;
            var doInsertSprite = false;

            var starLabel = (starData.proper[l] !== null) ? starData.proper[l] : (starData.bf[l] !== null) ? starData.bf[l] : (starData.gl[l] !== null) ? starData.gl[l] : null;


            if(starLabel !== null && starData.mag[l] < 4){

                doInsertSprite = true;

                if(debugOn){


                    if(starLabel !== null){
                        var sprite = new SpriteText2D(starLabel, { align: new THREE.Vector2(0, 0),  font: '10px Arial', fillStyle: '#ffffff' , antialias: false })
                        sprite.position.set(x,y,z);
                        spriteContainer.add(sprite);

                        sprite.lookAt(camera.position);

                    }

                }
            }

            //assign points to geometries with specific colors - use first letter of spect value to define color
            //determine which color bucket the star should go into
            if(starData.spect[l] !== null){
                switch(starData.spect[l].charAt(0)){
                    case "O":
                        targetPointCloudGeometry = pointCloudGeometries[0];
                        break;
                    case "B":
                        targetPointCloudGeometry = pointCloudGeometries[1];
                        break;
                    case "A":
                        targetPointCloudGeometry = pointCloudGeometries[2];
                        break;
                    case "F":
                        targetPointCloudGeometry = pointCloudGeometries[3];
                        break;
                    case "G":
                        targetPointCloudGeometry = pointCloudGeometries[4];
                        break;
                    case "K":
                        targetPointCloudGeometry = pointCloudGeometries[5];
                        break;
                    case "M":
                        targetPointCloudGeometry = pointCloudGeometries[6];
                        break;
                }
            }else{
                targetPointCloudGeometry = pointCloudGeometries[2];
            }

            targetPointCloudGeometry = pointCloudGeometries[2];

            //determine which size bucket the star should go into

            var targetSize;

            if (starData.mag[l] < 0) {
                targetSize = 0;
            } else if (starData.mag[l] >= 0 && starData.mag[l] < 1) {
                targetSize = 1;
            } else if (starData.mag[l] >= 1 && starData.mag[l] < 2) {
                targetSize = 2;
            } else if (starData.mag[l] >= 2 && starData.mag[l] < 3) {
                targetSize = 3;
            } else if (starData.mag[l] >= 3 && starData.mag[l] < 4) {
                targetSize = 4;
            } else if (starData.mag[l] >= 4 && starData.mag[l] < 5) {
                targetSize = 5;
            } else if (starData.mag[l] >= 5 && starData.mag[l] < 6) {
                targetSize = 6;
                doInsertPoint = false;
            } else if (starData.mag[l] >= 6 && starData.mag[l] < 7) {
                targetSize = 7;
                doInsertPoint = false;
            } else if (starData.mag[l] >= 7 && starData.mag[l] < 16) {
                doInsertPoint = false;
            } else {
                doInsertPoint = false;
            }

            if(doInsertPoint && typeof targetPointCloudGeometry !== 'undefined' &&  typeof targetPointCloudGeometry[targetSize] !== 'undefined'){
                targetPointCloudGeometry[targetSize].vertices.push(new THREE.Vector3(x,y,z));
            }

            if(doInsertSprite && doInsertPoint){
                var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: false, depthTest: true} );

                spriteCount++;


                var sprite = new THREE.Sprite( material );
                sprite.position.set(x,y,z);
                spriteContainer.add( sprite );
                sprite.lookAt(camera.position);


                sprite.scale.set((starMagnitudes-starData.mag[l])*starSpriteSize,(starMagnitudes-starData.mag[l])*starSpriteSize,(starMagnitudes-starData.mag[l])*starSpriteSize);

            }
        }

        console.log("Stars generated: ",spriteCount);


        for(var j = 0; j < pointCloudCount; j++){

            var color;

            switch(j){
                case 0:
                    color = 0x0000FF;
                    break;
                case 1:
                    color = 0xADD8E6;
                    break;
                case 2:
                    color = 0xFFFFFF;
                    break;
                case 3:
                    color = 0xFFFFE0;
                    break;
                case 4:
                    color = 0xFFFF00;
                    break;
                case 5:
                    color = 0xFFA500;
                    break;
                case 6:
                    color = 0xFF0000;
                    break;
                case 7:
                    color = 0x663399;
                    break;
            }

            for(var m = 0; m < starMagnitudes; m++){
                var material = new THREE.PointsMaterial({
                    color: color,
                    size: (starMagnitudes-m+1)/starMagnitudeScaleFactor,
                    depthTest: false, transparent : false
                    //wireframe property not supported on PointsMaterial
                });

                var pointCloud = new THREE.Points(pointCloudGeometries[j][m], material);

                pointClouds.push(pointCloud);

                centerObject(pointCloud);
            }
        }
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();

    }

    // Request animation frame loop function
    var lastRender = 0;
    function animate(timestamp) {

        requestAnimationFrame(animate);

        if(typeof meter !== 'undefined'){
            meter.tickStart();
        }

        if(typeof stats !== 'undefined'){
            stats.begin();
        }

        lastRender = timestamp;

        //dont render water if it doesnt exist
        if(typeof ms_Water !== 'undefined'){

            if(ms_Water !== null){

                ms_Water.material.uniforms.time.value += 1.0 / 60.0;
                ms_Water.render();

            }

        }

        // Update VR headset position and apply to camera.

        if(typeof controls !== 'undefined'/* && typeof dollyControls !== 'undefined'*/){

            controls.update();
        }



        for(var i = 0; i < pointClouds.length; i++){
            // rotate the skybox around its axis

            pointClouds[i].rotation.set(parameters.rotX * Math.PI / 180,parameters.rotY * Math.PI / 180,parameters.rotZ * Math.PI / 180);
        }

        if(typeof cameraContainer !== 'undefined'){
            cameraContainer.rotation.set(parameters.cameraContainerRotX * Math.PI / 180,parameters.cameraContainerRotY * Math.PI / 180,parameters.cameraContainerRotZ * Math.PI / 180);
            camera.position.set(0,parameters.cameraOffset,0);

        }


        if(typeof spriteContainer !== 'undefined'){
            spriteContainer.rotation.set(parameters.rotX * Math.PI / 180,parameters.rotY * Math.PI / 180,parameters.rotZ * Math.PI / 180);
        }

        if(typeof aMeshMirror !== 'undefined' && aMeshMirror !== null){
            aMeshMirror.rotation.set(parameters.rotXFloor * Math.PI / 180,parameters.rotYFloor * Math.PI / 180,parameters.rotZFloor * Math.PI / 180);

            sphereContainer.rotation.set(parameters.sphereContainerRotX * Math.PI / 180,parameters.sphereContainerRotY * Math.PI / 180,parameters.sphereContainerRotZ * Math.PI / 180);
            sphere.rotation.set(parameters.sphereRotX * Math.PI / 180,parameters.sphereRotY * Math.PI / 180,parameters.sphereRotZ * Math.PI / 180);
            sphere2.rotation.set(parameters.sphere2RotX * Math.PI / 180,parameters.sphere2RotY * Math.PI / 180,parameters.sphere2RotZ * Math.PI / 180);


            aMeshMirror.position.set(0,parameters.floorOffset,0);

            sphereContainer.rotation.set(parameters.sphereContainerRotX * Math.PI / 180,parameters.sphereContainerRotY * Math.PI / 180,parameters.sphereContainerRotZ * Math.PI / 180);
            sphere.rotation.set(parameters.sphereRotX * Math.PI / 180,parameters.sphereRotY * Math.PI / 180,parameters.sphereRotZ * Math.PI / 180);
            sphere2.rotation.set(parameters.sphere2RotX * Math.PI / 180,parameters.sphere2RotY * Math.PI / 180,parameters.sphere2RotZ * Math.PI / 180);


        }

        if(typeof skyBox !== 'undefined'){
            skyBox.rotation.set(parameters.skyboxRotX * Math.PI / 180,parameters.skyboxRotY * Math.PI / 180,parameters.skyboxRotZ * Math.PI / 180);

            skyboxContainer.rotation.set(parameters.skyboxContainerRotX * Math.PI / 180,parameters.skyboxContainerRotY * Math.PI / 180,parameters.skyboxContainerRotZ * Math.PI / 180);

            skyboxContainer2.rotation.set(parameters.skyboxContainer2RotX * Math.PI / 180,parameters.skyboxContainer2RotY * Math.PI / 180,parameters.skyboxContainer2RotZ * Math.PI / 180);
        }

        if(typeof ms_Water !== 'undefined' && typeof directionalLight !== 'undefined'){


            moonLightDirection.set(parameters.moonLightDirX,parameters.moonLightDirY,parameters.moonLightDirZ);

            moonLightDebugSphere.position.set(parameters.moonLightDirX,parameters.moonLightDirY,parameters.moonLightDirZ);

            directionalLight.position.set(parameters.lightDirX,parameters.lightDirY,parameters.lightDirZ);
            lightDirDebugSphere.position.set(parameters.lightDirX,parameters.lightDirY,parameters.lightDirZ);
            ms_Water.material.uniforms.sunDirection.value = directionalLight.position.normalize();
        }

        render(timestamp);


        if(typeof meter !== 'undefined') {

            meter.tick();

        }

        if(typeof stats !== 'undefined'){
            stats.end();
        }

    }

    function render(timestamp) {

        manager.render(scene, camera, timestamp);

    }

    // Kick off animation loop
    onWindowResize();
    animate(performance ? performance.now() : Date.now(),true);

    // Reset the position sensor when 'z' pressed.
    function onKey(event) {
        if (typeof controls !== 'undefined' && event.keyCode == 90) { // z
            controls.resetSensor();
        }
    }

    window.addEventListener('keydown', onKey, true);
}


function loadStarData(){

    $.getJSON( 'assets/data/data.json', {}, function(data){

        //init typed arrays for star data
        var n = data.length;

        starData = {
            dist: new Float64Array(n),
            proper: new Array(n),
            x: new Float64Array(n),
            y: new Float64Array(n),
            z: new Float64Array(n),
            spect: new Array(n),
            mag: new Float64Array(n),
            count: n,
            absmag: new Float64Array(n),
            con: new Array(n),
            bf: new Array(n),
            gl: new Array(n)
        };

        //populated typed arrays with star data
        var i = 0;
        while (i < n ) {
            starData.dist[i] = data[i].dist;

            starData.proper[i] = data[i].proper;
            starData.x[i] = data[i].x;
            starData.y[i] = data[i].y;
            starData.z[i] = data[i].z;
            starData.spect[i] = data[i].spect;
            starData.mag[i] = data[i].mag;
            starData.absmag[i] = data[i].absmag;
            starData.con[i] = data[i].con;
            starData.bf[i] = data[i].bf;
            starData.gl[i] = data[i].gl;

            i++;
        }

        Modernizr.addTest('highres', function() {
            // for opera
            var ratio = '2.99/2';
            // for webkit
            var num = '1.499';
            var mqs = [
                'only screen and (-o-min-device-pixel-ratio:' + ratio + ')',
                'only screen and (min--moz-device-pixel-ratio:' + num + ')',
                'only screen and (-webkit-min-device-pixel-ratio:' + num + ')',
                'only screen and (min-device-pixel-ratio:' + num + ')'
            ];
            var isHighRes = false;

            // loop through vendors, checking non-prefixed first
            for (var i = mqs.length - 1; i >= 0; i--) {
                isHighRes = Modernizr.mq( mqs[i] );
                // if found one, return early
                if ( isHighRes ) {
                    return isHighRes;
                }
            }
            // not highres
            return isHighRes;
        });

        //rendering appears to be partially broken on iOS 8 on latest version of three.js iOS 9 has about 90% market
        //share so we can recommend users update to that version
        //TODO: add three-orbit-controls library to allow mouse controls to be used by default on devices that don't
        //support motion controls

        //TODO: move these checks out into a first-run function along with the FPS test to determin if device is capable
        //of running the experience. Magnometer should be optional as it is only required to get the correct
        //orientation, but user should be warned that their direction won't be accurate

        checkCanHandleOrientation();

        initScene();

        loadSkyBox();

        initFPSMeter();
    });
}



$(document).ready(function(){
    loadStarData();
});

