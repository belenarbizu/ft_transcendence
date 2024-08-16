import { GameView } from '../../gameview.js';
import * as THREE from 'three';
import { SkyBox, GridCell } from '../../pirates/src/objects.js';

export class View3D extends GameView{

    constructor(model)
    {
        super();
        this.model = model;
        this.theta = 0;
        this.lon = 0;
        this.container = document.getElementById('threejs-container');
        this.positionInfo = this.container.getBoundingClientRect();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.positionInfo.width / this.positionInfo.height, 1, 1100);
        this.directional_light = new THREE.DirectionalLight(0xffffff, 1);
        this.directional_light.position.set(0, 100, 100);
        this.point_light = new THREE.PointLight( 0xffffff, 10, 100 );
        this.home_light = new THREE.PointLight( 0x0d6efd, 100, 100 );
        this.guest_light = new THREE.PointLight( 0x0d6efd, 100, 100 );
        this.ambient_light = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(this.ambient_light);
        this.scene.add(this.directional_light);
        this.skybox = new SkyBox();
        this.scene.add(this.skybox);

        this._listeners();

/*
        // Game group
        this.game_group = new THREE.Group();
        this.game_group.add(this.point_light);
        this.game_group.add(this.home_light);
        this.game_group.add(this.guest_light);
        this.game_group.position.y = 0.6;
        this.scene.add(this.game_group);
        this.game_group.scale.x = 6.5;
        this.game_group.scale.z = 6.5;
        this.game_group.scale.y = 6.5;
        this.game_group.rotation.x = - Math.PI / 1.7;

        // Board

        this.board = new GridCell();
        this.game_group.add(this.board);  
        this.board.scale.x = 1.618;
        
        this.geometry = new THREE.BoxGeometry( 0.02, 0.04, this.model.pad_height );
        this.material = new THREE.MeshPhongMaterial(
            { color: 0x0d6efd, side: THREE.DoubleSide });
        this.ball_material = new THREE.MeshPhongMaterial( { color: 0xffffff } );

        this.pad_guest = new THREE.Mesh( this.geometry, this.material );
        this.pad_guest.position.x = - this.board.scale.x / 2 - 0.02;
        this.game_group.add(this.pad_guest);
        
        this.pad_home = new THREE.Mesh( this.geometry, this.material );
        this.pad_home.position.x = this.board.scale.x / 2 + 0.02;

        this.game_group.add(this.pad_home);
        this.ball_geometry = new THREE.SphereGeometry(0.02, 10, 10);
        this.ball = new THREE.Mesh( this.ball_geometry, this.ball_material );
        this.game_group.add(this.ball);*/
    
        
        
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( this.positionInfo.width, this.positionInfo.height );
        this.container.appendChild( this.renderer.domElement );
        
        this.camera.position.z = 5;

        

        this.animate();
        this.renderer.setAnimationLoop( this.animate.bind(this) );

    }

    _listeners()
    {
        window.addEventListener('resize', (o) => this.on_window_resize(o));
        document.addEventListener('wheel', (o) => this.on_mouse_wheel(o));
        //this.model.addEventListener('home_grid', (o) => this.on_home_grid(o));
        //this.model.addEventListener('guest_grid', (o) => this.on_guest_grid(o));
        //this.model.addEventListener('player_change', (o) => this.on_player_change(o));
    }

    _objects()
    {
        this.skybox = new SkyBox();
        this.scene.add(this.skybox);

        //this.hit = new Hit(0, 0, 0);
        //this.scene.add(this.hit);
    }

    on_mouse_wheel(event)
    {
        this.lon = this.lon + event.deltaY * 0.05;
        this.camera.updateProjectionMatrix();
    }

    on_window_resize(event)
    {
        var positionInfo = this.container.getBoundingClientRect();
        this.camera.aspect = positionInfo.width / positionInfo.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( positionInfo.width, positionInfo.height );
    }
    
    animate() {

        var phi = THREE.MathUtils.degToRad(55);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        const x = 6 * Math.sin(phi) * Math.cos(this.theta);
        const y = 6 * Math.cos(phi);
        const z = 6 * Math.sin(phi) * Math.sin(this.theta);

        this.camera.position.set(x, y, this.camera_x + z);
        this.camera.lookAt(0, - 1, this.camera_x);
        this.camera.updateProjectionMatrix();

        this.renderer.render( this.scene, this.camera );
    }

    draw(t)
    {}
}