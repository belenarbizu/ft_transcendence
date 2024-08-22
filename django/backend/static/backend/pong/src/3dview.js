import { GameView } from '../../gameview.js';
import * as THREE from 'three';
import { SkyBox, GridCell } from '../../pirates/src/objects.js';

export class View3D extends GameView{

    constructor(model)
    {
        super();
        window.addEventListener('resize', (o) => this.on_window_resize(o));
        window.addEventListener('blur', this.on_window_blur.bind(this));
        window.addEventListener('focus', this.on_window_focus.bind(this));
        this.model = model;
        this.controller = null;
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
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( this.positionInfo.width, this.positionInfo.height );
        this.container.appendChild( this.renderer.domElement );
        
        this.camera.position.z = 5;

        this.ball_geometry = new THREE.SphereGeometry(0.02, 10, 10);
        this.ball = new THREE.Mesh( this.ball_geometry, this.ball_material );
        this.game_group.add(this.ball);

        this.animate();
        this.renderer.setAnimationLoop( this.animate.bind(this) );

    }

    on_window_blur(event)
    {
        if (this.worker == null)
        {
            this.worker = new Worker("/static/backend/pong/src/pong_worker.js");
            this.worker.onmessage = this.animate.bind(this);
        }
    }

    on_window_focus(event)
    {
        if (this.worker != null)
        {
            this.worker.terminate();
            this.worker = null;
        }
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
        //this.game_group.rotation.x += 0.01; 
        //cube2.rotation.y += 0.01;

        if (this.controller != null)
        {
            this.controller.on_loop();
        }

        // Move ball
        this.skybox.rotation.y += 0.0003;
        var current_time = Date.now();
        this.ball.position.x = this.model.get_ball_x(current_time) - 0.5;
        this.ball.position.z = this.model.get_ball_y(this.model.get_ball_position(current_time)) - 0.5;
        this.ball.position.x *= this.board.scale.x;
        this.point_light.position.set( this.ball.position.x, this.ball.position.y, this.ball.position.z );

        // Move guest pad
        this.pad_guest.position.z = this.model.get_pad_y("guest", current_time) - 0.5;
        // Move guest pad
        this.pad_home.position.z = this.model.get_pad_y("home", current_time) - 0.5;

        this.guest_light.position.set( this.pad_guest.position.x, this.pad_guest.position.y, this.pad_guest.position.z );
        this.home_light.position.set( this.pad_home.position.x, this.pad_home.position.y, this.pad_home.position.z );

        //cube2.scale.x = 2;
        //cube2.scale.y = 0.2;
        this.renderer.render( this.scene, this.camera );
    }

    draw(t)
    {}
}