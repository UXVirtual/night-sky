import { SpriteText2D, textAlign } from 'three-text2d'

import THREE from 'three'

import 'webvr-polyfill/src/main'

import 'webvr-boilerplate'

import $ from 'jquery'

import './vendor/three/examples/js/controls/VRControls'
import './vendor/three/examples/js/effects/VREffect'

import './vendor/charliehoey/GPUParticleSystem'

import './vendor/zz85/SkyShader'
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

var sky, sunSphere, scene, renderer, camera;
var lastCameraX, lastCameraY, lastCameraZ;
var starData;
var ms_Water;

//console.log(THREE);

//sky shader based on: http://threejs.org/examples/webgl_shaders_sky.html
function initSky() {

    // Add Sky Mesh
    sky = new THREE.Sky();
    scene.add( sky.mesh );

    // Add Sun Helper
    sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 20000, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    //scene.add( sunSphere );

    /// GUI

    var effectController  = {
        turbidity: 2,
        reileigh: 4,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.49, // elevation / inclination
        azimuth: 0.25, // Facing front,
        sun: false
    };

    var distance = 400000;

    function guiChanged() {

        var uniforms = sky.uniforms;
        uniforms.turbidity.value = effectController.turbidity;
        uniforms.reileigh.value = effectController.reileigh;
        uniforms.luminance.value = effectController.luminance;
        uniforms.mieCoefficient.value = effectController.mieCoefficient;
        uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        sunSphere.visible = effectController.sun;

        sky.uniforms.sunPosition.value.copy( sunSphere.position );

        //renderer.render( scene, camera );

    }

    /*var gui = new dat.GUI();

    gui.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
    gui.add( effectController, "reileigh", 0.0, 4, 0.001 ).onChange( guiChanged );
    gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, "luminance", 0.0, 2 ).onChange( guiChanged );
    gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
    gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
    gui.add( effectController, "sun" ).onChange( guiChanged );*/

    guiChanged();

}

function loadSkyBox() {
    var path = "assets/img/";
    var format = '.jpg';
    var urls = [
        path + 'skybox_0' + format, path + 'skybox_1' + format,
        path + 'skybox_2' + format, path + 'skybox_3' + format,
        path + 'skybox_4' + format, path + 'skybox_5' + format
    ];

    /*

        ['left','right','up','down','backward','forward']

     */

    /*

     'px.png', 'nx.png',
     'py.png', 'ny.png',
     'pz.png', 'nz.png'

     */

    var cubeMap = THREE.ImageUtils.loadTextureCube(urls);
    cubeMap.format = THREE.RGBFormat;
    cubeMap.flipY = false;

    var cubeShader = THREE.ShaderLib['cube'];
    cubeShader.uniforms['tCube'].value = cubeMap;

    var skyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: cubeShader.fragmentShader,
        vertexShader: cubeShader.vertexShader,
        uniforms: cubeShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    var skyBox = new THREE.Mesh(
        new THREE.BoxGeometry(100000, 100000, 100000),
        skyBoxMaterial
    );
    scene.add(skyBox);
}

function initScene(){

    console.log('initializing scene')

    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: false}); //performance hits if antialias or alpha used
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setClearColor( 0x00a6ec, 1 );

// Append the canvas element created by the renderer to document body element.
    document.body.appendChild(renderer.domElement);

    var debugOn = false;
    //var starCount = 10000;
    var normalizeRadius = 500;
    var pointCloudCount = 3;
    var distanceScale = 1; //keep this at 1 now that we are normalizing star distance
    var starMagnitudes = 6; //number of visible star magnitude buckets
    var starMagnitudeScaleFactor = 4; //higher number = smaller stars
    var starSpriteSize = 5; //scaling factor of star sprites for near stars that make up major constellations

// Create a three.js scene.
    scene = new THREE.Scene();

    //var raycaster = new THREE.Raycaster();

// Create a three.js camera.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000000);

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
    directionalLight.position.set(-400, 100, -500);
    scene.add(directionalLight);

    // Load textures
    var waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    // Create the water effect
    ms_Water = new THREE.Water(renderer, camera, scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: waterNormals,
        alpha: 	1.0,
        sunDirection: directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        betaVersion: 0
    });
    var aMeshMirror = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(1500, 1500, 10, 10),
        ms_Water.material
    );
    aMeshMirror.add(ms_Water);
    aMeshMirror.rotation.x = - Math.PI * 0.5;

    scene.add(aMeshMirror);



    loader.load('assets/img/star_preview3.png', onStarTextureLoaded);
    //var starMapTexture = loader.load('assets/img/starmap_4k_print.jpg');

    /*function onTextureLoaded(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(boxWidth/20, boxWidth/20);

        var geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            color: 0xffba00,
            side: THREE.BackSide,
            wireframe: debugOn
        });

        var skybox = new THREE.Mesh(geometry, material);
        skybox.position.set(0,0,0)
        scene.add(skybox);
    }*/
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
        hideButton: false, // Default: false.
        isUndistorted: false // Default: false.
    };
    var manager = new WebVRManager(renderer, effect, params);


    //if(debugOn){

    var collada = require('three-loaders-collada')(THREE);

    console.log('Collada: ',THREE.ColladaLoader)


    function initStars(texture){
        var x, y, z;

        //generate point cloud geometry

        var pointCloudGeometries = new Array(pointCloudCount);

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

                if(starData.proper[l] !== null || starData.bf[l] !== null || starData.gl[l] !== null){

                    if(debugOn){

                        var starLabel = (starData.proper[l] !== null) ? starData.proper[l] : (starData.bf[l] !== null) ? starData.bf[l] : (starData.gl[l] !== null) ? starData.gl[l] : null;

                        if(starLabel !== null){
                            var sprite = new SpriteText2D(starLabel, { align: new THREE.Vector2(0, 0),  font: '10px Arial', fillStyle: '#ffffff' , antialias: false })
                            sprite.position.set(x,y,z);
                            scene.add(sprite);

                            sprite.lookAt(camera.position);

                        }


                    }
                }

                doInsertSprite = true;








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
                scene.add( sprite );
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

                centerObject(pointCloud);
                scene.add(pointCloud);
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

        // Update VR headset position and apply to camera.
        controls.update();

        ms_Water.material.uniforms.time.value += 1.0 / 60.0;

        ms_Water.render();

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

        //initSky();

        loadSkyBox();
    });
}

console.log('document is ready')

loadStarData();