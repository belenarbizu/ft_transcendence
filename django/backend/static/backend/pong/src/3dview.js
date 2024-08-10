import { GameView } from '../../gameview.js';
import * as THREE from 'three';
import { SkyBox, GridCell } from '../../pirates/src/objects.js';

export class View3D extends GameView{

    constructor(model)
    {
        super();
        this.model = model;
        this.container = document.getElementById('threejs-container');
        this.positionInfo = this.container.getBoundingClientRect();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.positionInfo.width / this.positionInfo.height, 1, 1100);
        this.directional_light = new THREE.DirectionalLight(0xff0000, 500000);
        this.directional_light.position.set(100, 100, 100);
        this.scene.add(this.directional_light);
        this.skybox = new SkyBox();
        this.scene.add(this.skybox);
        this.board = new GridCell();
        this.scene.add(this.board);   
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( this.positionInfo.width, this.positionInfo.height );
        this.container.appendChild( this.renderer.domElement );
        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.cube = new THREE.Mesh( this.geometry, this.material );
        this.camera.position.z = 5;

        this.animate();
        //this.renderer.setAnimationLoop( this.animate );
    }
    
    animate() {
        //cube.rotation.x += 0.01; 
        //cube2.rotation.y += 0.01;
        this.skybox.rotation.y += 0.0003;
        //cube2.scale.x = 2;
        //cube2.scale.y = 0.2;
        this.renderer.render( this.scene, this.camera );
    }
}