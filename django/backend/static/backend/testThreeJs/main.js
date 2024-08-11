
import * as THREE from 'three';
import { SkyBox, GridCell } from '../pirates/src/objects.js';

const container = document.getElementById('threejs-container');
var positionInfo = container.getBoundingClientRect();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, positionInfo.width / positionInfo.height, 1, 1100);

var directional_light = new THREE.DirectionalLight(0xff0000, 500000);
directional_light.position.set(100, 100, 100);
scene.add(directional_light);

var skybox = new SkyBox();
scene.add(skybox);

var board = new GridCell();
scene.add(board);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( positionInfo.width, positionInfo.height );
container.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const transparent_material = new THREE.MeshPhongMaterial(
    { color: 0xff7f7f, side: THREE.DoubleSide });
transparent_material.opacity = 0.3;
transparent_material.transparent = true;

const cube = new THREE.Mesh( geometry, material );
const cube2 = new THREE.Mesh( geometry, transparent_material );
board.rotation.x += Math.PI/2;
board.scale.x += 5;
board.scale.z += 5/1.618;
//scene.add( cube );
scene.add( cube2 );
cube2.position.x = -2.5;
cube2.position.y = 0;
//cube2.position.z = 1;
cube2.rotation.z = Math.PI / 2;

camera.position.z = 5;
function animate() {
    //cube.rotation.x += 0.01; 
    //cube2.rotation.y += 0.01;
    skybox.rotation.y += 0.0003;
    cube2.scale.x = 2;
    cube2.scale.y = 0.2;
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );