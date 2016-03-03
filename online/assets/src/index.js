import { SpriteText2D, textAlign } from 'three-text2d'

import THREE from 'three'

import 'webvr-polyfill/src/main'

import 'webvr-boilerplate'

import $ from 'jquery'

import './vendor/three/examples/js/controls/VRControls'
import './vendor/three/examples/js/effects/VREffect'

import './vendor/charliehoey/GPUParticleSystem'

WebVRConfig = {
    /**
     * webvr-polyfill configuration
     */

    // Forces availability of VR mode.
    FORCE_ENABLE_VR: false, // Default: false.
    // Complementary filter coefficient. 0 for accelerometer, 1 for gyro.
    K_FILTER: 0.98, // Default: 0.98.
    // How far into the future to predict during fast motion.
    PREDICTION_TIME_S: 0.040, // Default: 0.040 (in seconds).
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

var starData;

//console.log(THREE);

function initScene(){

    console.log('initializing scene')

    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas element created by the renderer to document body element.
    document.body.appendChild(renderer.domElement);

    var debugOn = true;
    var starCount = 10000;
    var pointCloudCount = 8;
    var distanceScale = 5;
    var starMagnitudes = 8; //number of visible star magnitude buckets

// Create a three.js scene.
    var scene = new THREE.Scene();

// Create a three.js camera.
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

// Apply VR headset positional data to camera.
    var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
    var effect = new THREE.VREffect(renderer);
    effect.setSize(window.innerWidth, window.innerHeight);

    var tick = 0;

// Add a repeating grid as a skybox.
    var boxWidth = 100;
    var loader = new THREE.TextureLoader();
    loader.load('assets/img/box.png', onTextureLoaded);

    function onTextureLoaded(texture) {
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

// Create 3D objects.
    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(geometry, material);

// Position cube mesh
    cube.position.z = -5;


// Add cube mesh to your three.js scene
//scene.add(cube);

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }




    var x, y, z;

    //generate point cloud geometry

    var pointCloudGeometries = new Array(pointCloudCount);

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

        //assign points to geometries with specific colors - use first letter of spect value to define color


        var targetPointCloudGeometry;
        var doInsertPoint = true;

        //determine which color bucket the star should go into
        if(starData.proper[l] === 'Sol'){
            console.log('Found the sun');
            //doInsertPoint = false;
            targetPointCloudGeometry = pointCloudGeometries[7];



            var sprite = new SpriteText2D(starData.proper[l], { align: new THREE.Vector2(0, 0),  font: '40px Arial', fillStyle: '#ffffff' , antialias: false })
            scene.add(sprite);

            sprite.lookAt(camera.position);

            console.log(starData.proper[l],starData.spect[l]);
        }else{
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
        }

        //determine which size bucket the star should go into

        var targetSize;

        if(starData.mag[l] < 0){
            targetSize = 0;
        }else if(starData.mag[l] >= 0 && starData.mag[l] < 1){
            targetSize = 1;
        }else if(starData.mag[l] >= 1 && starData.mag[l] < 2){
            targetSize = 2;
        }else if(starData.mag[l] >= 2 && starData.mag[l] < 3){
            targetSize = 3;
        }else if(starData.mag[l] >= 3 && starData.mag[l] < 4){
            targetSize = 4;
        }else if(starData.mag[l] >= 4 && starData.mag[l] < 5){
            targetSize = 5;
        }else if(starData.mag[l] >= 5 && starData.mag[l] < 6){
            targetSize = 6;
        }else if(starData.mag[l] >= 6 && starData.mag[l] < 7){
            targetSize = 7;
        }

        if(starData.dist[l] <= 35.5745){
            //doInsertPoint = false;
        }else if(starData.dist[l] > 35.5745 && starData.dist[l] <= 54.5256){
            doInsertPoint = false;
        }else if(starData.dist[l] > 54.5256 && starData.dist[l] <= 71.1238){
            doInsertPoint = false;
        }else if(starData.dist[l] > 71.1238 && starData.dist[l] <= 86.6551){
            doInsertPoint = false;
        }else if(starData.dist[l] > 86.6551 && starData.dist[l] <= 101.0101){
            doInsertPoint = false;
        }else if(starData.dist[l] > 101.0101){
            //doInsertPoint = false;
        }

        //console.log(targetPointCloudGeometry);

        if(doInsertPoint){
            targetPointCloudGeometry[targetSize].vertices.push(new THREE.Vector3(x,y,z));
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

        //var value = Math.random() * 0xFF | 0;
        //var grayscale = (value << 16) | (value << 8) | value;

        for(var m = 0; m < starMagnitudes; m++){
            var material = new THREE.PointsMaterial({
                color: color,
                size: (starMagnitudes-m+1)
                //wireframe property not supported on PointsMaterial
            });

            var pointCloud = new THREE.Points(pointCloudGeometries[j][m], material);

            centerObject(pointCloud);
            scene.add(pointCloud);
        }



    }


// Request animation frame loop function
    var lastRender = 0;
    function animate(timestamp) {
        //var delta = Math.min(timestamp - lastRender, 500);
        lastRender = timestamp;

        // Apply rotation to cube mesh
        //cube.rotation.y += delta * 0.0006;

        // Update VR headset position and apply to camera.
        controls.update();

        // Render the scene through the manager.
        manager.render(scene, camera, timestamp);

        requestAnimationFrame(animate);
    }

    function render() {

        renderer.render(scene, camera);

    }

// Kick off animation loop
    animate(performance ? performance.now() : Date.now());

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

        console.log(data);

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
            count: n
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
            i++;
        }

        console.log('Star data loaded.');

        //console.log(data);

        initScene();
    });
}

console.log('document is ready')

loadStarData();