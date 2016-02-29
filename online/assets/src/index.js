// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

var debugOn = false;
var starCount = 10000;
var pointCloudCount = 5;

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
    //scene.add(skybox);
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

for(var j = 0; j < pointCloudCount; j++){
    var value = Math.random() * 0xFF | 0;
    var grayscale = (value << 16) | (value << 8) | value;

    var geometry = new THREE.Geometry();


    var material = new THREE.PointsMaterial({
        color: grayscale
        //wireframe property not supported on PointsMaterial
    });


    for(var i = 0; i < starCount/pointCloudCount; i++){
        x = getRandomArbitrary(boxWidth/16, boxWidth*4);
        y = getRandomArbitrary(boxWidth/16, boxWidth*4);
        z = getRandomArbitrary(boxWidth/16, boxWidth*4);

        geometry.vertices.push(new THREE.Vector3(x, y, z));
    }

    var pointCloud = new THREE.Points(geometry, material);
    centerObject(pointCloud);
    scene.add(pointCloud);
}





/*for(var p = 0; p < 10000; p++){

    var value = Math.random() * 0xFF | 0;
    var grayscale = (value << 16) | (value << 8) | value;
    var color = grayscale;
    var target = pointCloud.children[p];

    target.color.set(color);
    target.geometry.colorsNeedUpdate = true;
}*/



//pointCloud.position.set(-boxWidth*2,-boxWidth*2,-boxWidth*2);




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