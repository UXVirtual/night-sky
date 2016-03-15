import { SpriteText2D, textAlign } from 'three-text2d'

import THREE from 'three'

import 'webvr-polyfill/src/main'

import 'webvr-boilerplate'

import 'dat-gui'

import $ from 'jquery'

import './vendor/three/examples/js/controls/VRControls'
import './vendor/three/examples/js/effects/VREffect'

import './vendor/charliehoey/GPUParticleSystem'

//import './vendor/zz85/SkyShader'

//import './vendor/CoryG89/MoonShader'

import '../../bower_components/ocean/water-material.js'

WebVRConfig = {
    /**
     * webvr-polyfill configuration
     */

    // Forces availability of VR mode.
    FORCE_ENABLE_VR: false, // Default: false.
    // Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
    K_FILTER: 1, // Default: 0.98.
    // How far into the future to predict during fast motion.
    PREDICTION_TIME_S: 1, // Default: 0.040 (in seconds).
    // Flag to disable touch panner. In case you have your own touch controls
    TOUCH_PANNER_DISABLED: false, // Default: false.
    // Enable yaw panning only, disabling roll and pitch. This can be useful for
    // panoramas with nothing interesting above or below.
    //YAW_ONLY: true, // Default: false.

    /**
     * webvr-boilerplate configuration
     */
    // Forces distortion in VR mode.
    FORCE_DISTORTION: false, // Default: false.
    // Override the distortion background color.
    // DISTORTION_BGCOLOR: {x: 1, y: 0, z: 0, w: 1}, // Default: (0,0,0,1).
    // Prevent distortion from happening.
    PREVENT_DISTORTION: false, // Default: false.
    // Show eye centers for debugging.
    SHOW_EYE_CENTERS: false, // Default: false.
    // Prevent the online DPDB from being fetched.
    NO_DPDB_FETCH: true  // Default: false.
};

var sky, sphere, sphere2, moonLightDirection, moonLightDebugSphere, sphereContainer, lightDirDebugSphere, cameraContainer, skyboxContainer, skyboxContainer2, scene, renderer, camera;
var lastCameraX, lastCameraY, lastCameraZ;
var starData;
var ms_Water;
var skyBox;
var cameraFOV = 45;

var moonScale = 15;

var waterTextureSize = 512;

var aMeshMirror;

var moonLightDirection = new THREE.Vector3(0,0,0);

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

var debugOn = true;

var pointClouds = [];

var spriteContainer;

//console.log(THREE);




function loadSkyBox() {
    var path = "assets/img/";
    var format = '.png';
    var urls = [
        path + 'skybox_0' + format, path + 'skybox_1' + format,
        path + 'skybox_2' + format, path + 'skybox_3' + format,
        path + 'skybox_4' + format, path + 'skybox_5' + format
    ];

    /*

        ['left','right',
        'up','down',
        'backward','forward']

     */

    /*

     'px.png', 'nx.png',
     'py.png', 'ny.png',
     'pz.png', 'nz.png'

     */



    /*var cubeMap = THREE.ImageUtils.loadTextureCube(urls);
    cubeMap.format = THREE.RGBFormat;
    cubeMap.flipY = false;

    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        map: cubeMap,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });*/

    /*skyBox = new THREE.Mesh(
        new THREE.SphereGeometry(100000, 32, 32),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('assets/img/starmap_g4k.jpg'),

            side: THREE.BackSide
        })
    );*/

    //skybox is now no longer using shaders and has actual geometry instead so we can rotate it
    var skyGeometry = new THREE.CubeGeometry( 100000, 100000, 100000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( urls[i] ),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    skyBox = new THREE.Mesh( skyGeometry, skyMaterial );

    /*skyBox = new THREE.Mesh(
        new THREE.BoxGeometry(100000, 100000, 100000),
        skyBoxMaterial
    );*/


    skyboxContainer = new THREE.Object3D();

    skyboxContainer2 = new THREE.Object3D();

    scene.add(skyboxContainer2);

    skyboxContainer2.add(skyboxContainer);

    skyboxContainer.add(skyBox);

    skyboxContainer2.add( sphere2 );

    skyBox.add(sphereContainer);

    if(debugOn){
        var dat = require('dat-gui');

        var gui = new dat.GUI();


        // gui.add( parameters )
        gui.add( parameters, 'rotX' ).min(0).max(359).step(1).name('Stars RotX');
        gui.add( parameters, 'rotY' ).min(0).max(359).step(1).name('Stars RotY');
        gui.add( parameters, 'rotZ' ).min(0).max(359).step(1).name('Stars RotZ');

        gui.add( parameters, 'lightDirX' ).min(-2000).max(2000).step(50).name('LightDir X');
        gui.add( parameters, 'lightDirY' ).min(-2000).max(2000).step(50).name('LightDir Y');
        gui.add( parameters, 'lightDirZ' ).min(-2000).max(2000).step(50).name('LightDir Z');

        /*gui.add( parameters, 'moonLightDirX' ).min(-2000).max(2000).step(50).name('MoonLightDir X');
        gui.add( parameters, 'moonLightDirY' ).min(-2000).max(2000).step(50).name('MoonLightDir Y');
        gui.add( parameters, 'moonLightDirZ' ).min(-2000).max(2000).step(50).name('MoonLightDir Z');*/

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

        /*gui.add( parameters, 'sphereContainerRotX' ).min(0).max(359).step(1).name('SphereCon RotX');
        gui.add( parameters, 'sphereContainerRotY' ).min(0).max(359).step(1).name('SphereCon RotY');
        gui.add( parameters, 'sphereContainerRotZ' ).min(0).max(359).step(1).name('SphereCon RotZ');*/

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

function initScene(){

    console.log('initializing scene')

    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
    renderer = new THREE.WebGLRenderer({antialias: false, alpha: false}); //performance hits if antialias or alpha used
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setClearColor( 0x00a6ec, 1 );

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

    //var raycaster = new THREE.Raycaster();

    cameraContainer = new THREE.Object3D();
    //cameraContainer.rotation.order = "YXZ"; // maybe not necessary

// Create a three.js camera.
    camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, 0.1, 2000000);

    cameraContainer.add(camera);


    //cameraContainer.rotation.x = 90 * Math.PI / 180;

    //lastCameraX = camera.rotation.x;
    //lastCameraY = camera.rotation.y;
    //lastCameraZ = camera.rotation.z;

// Apply VR headset positional data to camera.
    var controls = new THREE.VRControls(camera);

    //camera.addEventListener( 'change', render );

// Apply VR stereo rendering to renderer.
    var effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    var tick = 0;

// Add a repeating grid as a skybox.
    var boxWidth = 100;
    var loader = new THREE.TextureLoader();
    //loader.load('assets/img/box.png', onTextureLoaded);

    var rotWorldMatrix;

// Rotate an object around an arbitrary axis in world space
    function rotateAroundWorldAxis(object, axis, radians) {
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
        rotWorldMatrix.multiply(object.matrix);        // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    // Add light
    var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    directionalLight.position.set(parameters.lightDirX, parameters.lightDirY, parameters.lightDirZ);


    /*if(debugOn){
        var geometry = new THREE.PlaneGeometry( 1500, 1500, 10, 10 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, wireframe: true} );
        aMeshMirror = new THREE.Mesh( geometry, material );
    }else{*/
        // Load textures
        var waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg');
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

        console.log('Meshmirror: ',aMeshMirror);



        //ms_Water.render();
    //}




    //aMeshMirror.position.set(0,-20,0);
    //aMeshMirror.lookAt(camera.position);

    //if(debugOn){
        sphereContainer = new THREE.Object3D;
        //cameraContainer.rotation.order = "ZXY"


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

        //var moonTexture = THREE.ImageUtils.loadTexture('assets/img/moon1024x512.jpg');
        //var moonNormal = THREE.ImageUtils.loadTexture('assets/img/normal1024x512.jpg');

        var material3 = new THREE.MeshBasicMaterial( {color: 0xffffffff, wireframe: false, opacity: 1, transparent: false/*, map: moonTexture*/} );

        moonLightDebugSphere = new THREE.Mesh( geometry, material3 );

        console.log(moonLightDebugSphere);

        moonLightDebugSphere.position.set(parameters.moonLightDirX,parameters.moonLightDirY,parameters.moonLightDirZ);

        //var moon = new THREE.Moon(moonTexture,moonNormal,moonLightDebugSphere);






        //lightDirDebugSphere = moon.mesh;

        lightDirDebugSphere = new THREE.Mesh( geometry, material3 );

        //if(debugOn){
            lightDirDebugSphere.position.set(parameters.lightDirX,parameters.lightDirY,parameters.lightDirZ);

            lightDirDebugSphere.rotation.set(0,180,0);
            lightDirDebugSphere.scale.set(moonScale,moonScale,moonScale);
        //}else{
        //    lightDirDebugSphere = new THREE.Object3D;
        //}

        scene.add(lightDirDebugSphere);

        //aMeshMirror.add(moonLightDebugSphere);

        sphereContainer.add( sphere );



    scene.add(aMeshMirror); //reflections don't work correctly unless aMeshMirror added to scene
    scene.add(cameraContainer);
    //sphereContainer.eulerOrder = 'ZXY'; // change the eulerOrder to lock the rotation around the Y axis

    //aMeshMirror.eulerOrder = 'ZXY';

    //sphereContainer.eulerOrder = 'ZXY'; // change the eulerOrder to lock the rotation around the Y axis

    //aMeshMirror.eulerOrder = 'ZXY';
    //sphere.eulerOrder = 'ZXY';


    aMeshMirror.add(directionalLight); //reflections don't work correctly unless light added to scene
    //scene.add(cameraContainer);
    //}




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


    //if(debugOn){

    //var collada = require('three-loaders-collada')(THREE);

    //console.log('Collada: ',THREE.ColladaLoader)


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

        //console.log('Children: ',scene.children);

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



            if(starData.proper[l] !== null && starData.mag[l] < 16 || (starData.proper[l] === "Sol" || starData.mag[l] < 3)/* || starData.proper[l] === "Rigil Kentaurus" || starData.proper[l] === "Hadar"*/){

                //doInsertPoint = false;


                //console.log('Found',starData.proper[l]);
                //targetPointCloudGeometry = pointCloudGeometries[7];

                doInsertSprite = true;





                /*if(!(starData.proper[l] === "Polaris")){
                    doInsertSprite = false;
                    doInsertPoint = false;
                }*/

                if(doInsertSprite && (starData.proper[l] !== null || starData.bf[l] !== null || starData.gl[l] !== null)){

                    if(debugOn){

                        var starLabel = (starData.proper[l] !== null) ? starData.proper[l] : (starData.bf[l] !== null) ? starData.bf[l] : (starData.gl[l] !== null) ? starData.gl[l] : null;

                        if(starLabel !== null){
                            var sprite = new SpriteText2D(starLabel, { align: new THREE.Vector2(0, 0),  font: '10px Arial', fillStyle: '#ffffff' , antialias: false })
                            sprite.position.set(x,y,z);
                            spriteContainer.add(sprite);

                            sprite.lookAt(camera.position);

                        }


                    }
                }










            }//else{

            //doInsertPoint = false;

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
            //}




            //determine which size bucket the star should go into

            var targetSize;

            if (starData.mag[l] < 0) {
                targetSize = 0;
                //doInsertPoint = false;
            } else if (starData.mag[l] >= 0 && starData.mag[l] < 1) {
                targetSize = 1;
                //doInsertPoint = false;
            } else if (starData.mag[l] >= 1 && starData.mag[l] < 2) {
                targetSize = 2;
                //doInsertPoint = false;
            } else if (starData.mag[l] >= 2 && starData.mag[l] < 3) {
                targetSize = 3;
                //doInsertPoint = false;
            } else if (starData.mag[l] >= 3 && starData.mag[l] < 4) {
                targetSize = 4;
                //doInsertPoint = false;
            } else if (starData.mag[l] >= 4 && starData.mag[l] < 5) {
                targetSize = 5;
                //doInsertPoint = false;
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


            /*if(starData.dist[l] <= 35.5745){

             }else if(starData.dist[l] > 35.5745 && starData.dist[l] <= 54.5256){
             //doInsertPoint = false;
             }else if(starData.dist[l] > 54.5256 && starData.dist[l] <= 71.1238){
             //doInsertPoint = false;
             }else if(starData.dist[l] > 71.1238 && starData.dist[l] <= 86.6551){
             //doInsertPoint = false;
             }else if(starData.dist[l] > 86.6551 && starData.dist[l] <= 101.0101){
             //doInsertPoint = false;
             }else if(starData.dist[l] > 101.0101){
             //doInsertPoint = false;
             }*/

            //console.log(targetPointCloudGeometry);

            if(doInsertPoint && typeof targetPointCloudGeometry !== 'undefined' &&  typeof targetPointCloudGeometry[targetSize] !== 'undefined'){
                targetPointCloudGeometry[targetSize].vertices.push(new THREE.Vector3(x,y,z));
            }

            if(doInsertSprite && doInsertPoint){
                var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: false, depthTest: true/*(starMagnitudes-starData.mag[l]+1)*/ } );

                //console.log(material);

                var sprite = new THREE.Sprite( material );
                sprite.position.set(x,y,z);
                spriteContainer.add( sprite );
                sprite.lookAt(camera.position);

                //console.log(starData.mag[l]);

                //sprite.rotation.y = 90 * Math.PI / 180;

                sprite.scale.set((starMagnitudes-starData.mag[l])*starSpriteSize,(starMagnitudes-starData.mag[l])*starSpriteSize,(starMagnitudes-starData.mag[l])*starSpriteSize);
                //sprite.translateZ( -1 );
            }



        }


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
                    //map: texture, blending: THREE.AdditiveBlending, depthTest: false, transparent : true
                    depthTest: false, transparent : false
                    //wireframe property not supported on PointsMaterial
                });

                var pointCloud = new THREE.Points(pointCloudGeometries[j][m], material);

                pointClouds.push(pointCloud);

                centerObject(pointCloud);
                //scene.add(pointCloud);
            }



        }
    }

    //window.addEventListener( 'resize', onWindowResize, false );


    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        render();

    }

    // Request animation frame loop function
    var lastRender = 0;
    function animate(timestamp,skipRenderCheck) {
        //var delta = Math.min(timestamp - lastRender, 500);
        lastRender = timestamp;

        //if(!debugOn){
            ms_Water.material.uniforms.time.value += 1.0 / 60.0;
            ms_Water.render();
        //}

        // Update VR headset position and apply to camera.
        controls.update();


        for(var i = 0; i < pointClouds.length; i++){
            // rotate the skybox around its axis

            pointClouds[i].rotation.set(parameters.rotX * Math.PI / 180,parameters.rotY * Math.PI / 180,parameters.rotZ * Math.PI / 180);

            //console.log('Rotating pointcloud',pointClouds[i].rotation);
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
            //aMeshMirror.rotation.set(parameters.sphereContainerRotX * Math.PI / 180,parameters.sphereContainerRotY * Math.PI / 180,parameters.sphereContainerRotZ * Math.PI / 180);

            /*var position = new THREE.Vector3();
            var quaternion = new THREE.Quaternion();
            var scale = new THREE.Vector3();

            cameraContainer.updateMatrixWorld( true );

            cameraContainer.matrixWorld.decompose( position, quaternion, scale );

            aMeshMirror.quaternion.copy( quaternion );

            //var newQuaternion = THREE.Object3D.getWorldQuaternion( cameraContainer.position );

            //aMeshMirror.matrix.makeRotationFromQuaternion(quaternion);
            //aMeshMirror.matrix.setPosition(parameters.floorOffset,0,0);
            //aMeshMirror.matrixAutoUpdate = false;

            //aMeshMirror.quaternion = quaternion;
            aMeshMirror.updateMatrix();*/

            //if(debugOn){
            sphereContainer.rotation.set(parameters.sphereContainerRotX * Math.PI / 180,parameters.sphereContainerRotY * Math.PI / 180,parameters.sphereContainerRotZ * Math.PI / 180);
            sphere.rotation.set(parameters.sphereRotX * Math.PI / 180,parameters.sphereRotY * Math.PI / 180,parameters.sphereRotZ * Math.PI / 180);
            sphere2.rotation.set(parameters.sphere2RotX * Math.PI / 180,parameters.sphere2RotY * Math.PI / 180,parameters.sphere2RotZ * Math.PI / 180);
            //}

            //aMeshMirror.matrixNeedsUpdate = true;

            //aMeshMirror.applyMatrix( new THREE.Matrix4().makeTranslation(parameters.floorOffset,0,0) );
            //aMeshMirror.verticesNeedUpdate = true

            aMeshMirror.position.set(0,parameters.floorOffset,0);
            //if(debugOn){
                sphereContainer.rotation.set(parameters.sphereContainerRotX * Math.PI / 180,parameters.sphereContainerRotY * Math.PI / 180,parameters.sphereContainerRotZ * Math.PI / 180);
                sphere.rotation.set(parameters.sphereRotX * Math.PI / 180,parameters.sphereRotY * Math.PI / 180,parameters.sphereRotZ * Math.PI / 180);
                sphere2.rotation.set(parameters.sphere2RotX * Math.PI / 180,parameters.sphere2RotY * Math.PI / 180,parameters.sphere2RotZ * Math.PI / 180);
            //}

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








        //if((typeof skipRenderCheck !== 'undefined' && skipRenderCheck) && (camera.rotation.x !== lastCameraX || camera.rotation.y !== lastCameraY || camera.rotation.z !== lastCameraZ)){
            // Render the scene through the manager.
            //manager.render(scene, camera, timestamp);
        //renderer.render(scene, camera);
            render(timestamp);


        //}

        requestAnimationFrame(animate);


    }

    function render(timestamp) {

        //console.log('Rendering...');

        manager.render(scene, camera, timestamp);

    }

// Kick off animation loop
    onWindowResize();
    animate(performance ? performance.now() : Date.now(),true);

// Reset the position sensor when 'z' pressed.
    function onKey(event) {
        if (event.keyCode == 90) { // z
            controls.resetSensor();
        }
    }

    window.addEventListener('keydown', onKey, true);
}


function loadStarData(){

    console.log('Getting star data...')

    $.getJSON( 'assets/data/data.json.gz', {}, function(data){

        //console.log(data);

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

        console.log('Star data loaded.');

        //console.log(data);



        initScene();

        loadSkyBox();

        //initSky();


    });
}

console.log('document is ready')

loadStarData();