let camera, scene, renderer, controls;
let mesh;

init();

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.z = 2;

    scene = new THREE.Scene();

    const texture = new THREE.TextureLoader().load( 'wood.jpg' );
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { map: texture } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );
    //

    window.addEventListener( 'resize', onWindowResize );

    createControls( camera );

    geometry.scale( 1, 0.7, 0.1 );



}

function test(){
    console.log("youpi")
}

function createControls( camera ) {

    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.;

    controls.noPan = true;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

    controls.addEventListener( 'change', test );
    // Ou bien on peut mettre "end" si c'est trop long, auquel cas on ne repositionne le micro qu'à la fin de l'inrteraction

    }

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    controls.update();

    renderer.render( scene, camera );

    // mesh.rotation.x += 0.005;
    // mesh.rotation.y += 0.01;

    // renderer.render( scene, camera );

}

document.addEventListener('dblclick', function(e){
    console.log("oulga")
    controls.reset()
});
 
