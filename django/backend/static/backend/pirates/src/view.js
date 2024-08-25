import * as THREE from 'three';
import { PlayerGrid, SkyBox, Ship, Asteroid } from "./objects.js";
import { GameView } from '../../gameview.js';

export class View extends GameView
{

    constructor(model)
    {
        super();
        this.container = document.getElementById('threejs-container');
        var positionInfo = this.container.getBoundingClientRect();
        this.model = model;
        this.camera = new THREE.PerspectiveCamera(
            75, positionInfo.width / positionInfo.height, 1, 1100);
        this.camera_x = -(6 / 2 + 2);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();

        this.clock = new THREE.Clock();

        this.item = [];
        this.camera_movement = 0;

        this.mouse_cell = null;
        this.pointer_down_x = 0;
        this.theta = 0;
        this.interacting = false;
        this.lon = 0;
        this.pointer_down_lon = 0;

        this.home_x = -(6 / 2 + 2);
        this.guest_x = (6 / 2 + 2);

        this._lights();
        this._sound();
        this._objects();
        this._renderer();
        this._listeners();

        this.update_view();
    }

    _lights()
    {
        this.ambient_light = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(this.ambient_light);

        this.directional_light = new THREE.DirectionalLight(0xffffaa, 5);
        this.directional_light.position.set(100, 100, 0);
        this.scene.add(this.directional_light);
    }

    _sound()
    {
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.sound = new THREE.Audio(this.listener);
        var sound_ = this.sound;

        this.audioLoader = new THREE.AudioLoader();
        this.audioLoader.load(
            '/static/backend/pirates/pirates_revenge.mp3',
            function(buffer) {
                sound_.setBuffer(buffer);
                sound_.setLoop(true);
                sound_.setVolume(0.5);
                sound_.play();
                this.sound = sound_;
            }.bind(this));
    }

    end()
    {
        this.sound.pause();
    }

    _objects()
    {
        this.skybox = new SkyBox();
        this.scene.add(this.skybox);

        this.home_grid = new PlayerGrid(this.model, "home");
        this.home_grid.position.set(0, 0, -(6 / 2 + 2));
        this.scene.add(this.home_grid);

        this.home_small = new Ship(
            '/static/backend/pirates/ship2.glb', "home", "small",
            0, 0.6, 0.5, this.model);
        this.home_grid.add(this.home_small);
        this.home_medium = new Ship(
            '/static/backend/pirates/ship3.glb', "home", "medium",
            0, 0.8, 0.9, this.model);
            this.home_grid.add(this.home_medium);
        this.home_large = new Ship(
            '/static/backend/pirates/ship4.glb', "home", "large",
            0, 1, 1.6, this.model);
            this.home_grid.add(this.home_large);

        this.guest_grid = new PlayerGrid(this.model, "guest");
        this.guest_grid.position.set(0, 0, 6 / 2 + 2);
        this.guest_grid.rotation.set(0, Math.PI, 0);
        this.scene.add(this.guest_grid);

        this.guest_small = new Ship(
            '/static/backend/pirates/ship2.glb', "guest", "small",
            0, 0.6, 0.5, this.model);
        this.guest_grid.add(this.guest_small);
        this.guest_medium = new Ship(
            '/static/backend/pirates/ship3.glb', "guest", "medium",
            0, 0.8, 0.9, this.model);
            this.guest_grid.add(this.guest_medium);
        this.guest_large = new Ship(
            '/static/backend/pirates/ship4.glb', "guest", "large",
            0, 1, 1.6, this.model);
            this.guest_grid.add(this.guest_large);

        this.asteroid = new Asteroid(0, 0, 0);
        this.scene.add(this.asteroid);
    }

    get_cell(player, x, y)
    {
        var grid = this.get_player_cells(player);
        for (let i = 0; i < grid.length; i++)
        {
            var cell = grid[i];
            if (cell.value[0] == x && cell.value[1] == y)
            {
                return (cell);
            }
        }
    }

    hit_animation(player, x, y, mode)
    {
        var cell = this.get_cell(player, x, y);
        var target = new THREE.Vector3();
        cell.getWorldPosition(target);
        this.asteroid.position.set(target.x, target.y, target.z);
        if (mode == "hit")
        {
            this.asteroid.hit();
        }
        else
        {
            this.asteroid.miss();
        }
        return new Promise(function(resolve, reject){
            setTimeout(resolve, 1400);
        }.bind(this));
    }

    update_view()
    {
        this.home_grid.update_view();
        this.home_small.update_view();
        this.home_medium.update_view();
        this.home_large.update_view();
        this.guest_grid.update_view();
        this.guest_small.update_view();
        this.guest_medium.update_view();
        this.guest_large.update_view();
    }

    get_player_cells(player)
    {
        if (player == "home")
        {
            return (this.home_grid.cells);
        }
        return (this.guest_grid.cells);
    }

    _renderer()
    {
        this.renderer = new THREE.WebGLRenderer();
        var positionInfo = this.container.getBoundingClientRect();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( positionInfo.width, positionInfo.height );
        this.renderer.setAnimationLoop(() => this.animate());
        this.container.appendChild(this.renderer.domElement);
        this.container.style.touchAction = 'none';
    }

    _listeners()
    {
        window.addEventListener('resize', (o) => this.on_window_resize(o));
        this.model.addEventListener('update', (o) => this.on_model_update(o));
        document.addEventListener("keyup", this.on_key_up.bind(this));
        document.addEventListener("keydown", this.on_key_down.bind(this));
    }

    on_window_resize(event)
    {
        var positionInfo = this.container.getBoundingClientRect();
        this.camera.aspect = positionInfo.width / positionInfo.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( positionInfo.width, positionInfo.height );
    }

    on_key_down(event) {
        if (this.item.indexOf(event.key) < 0)
        {
            this.item.push(event.key);
        }
        else
        {
            return;
        }
        if (event.key == "a")
        {
            this.camera_movement += 1;
        }
        if (event.key == "d")
        {
            this.camera_movement -= 1;
        }
    }

    on_key_up(event) {
        let i = this.item.indexOf(event.key);
        if (i > -1)
            this.item.splice(i, 1);
        if (event.key == "a")
        {
            this.camera_movement -= 1;
        }
        if (event.key == "d")
        {
            this.camera_movement += 1;
        }
    }

    on_model_update(event)
    {
        this.update_view();
    }

    focus_grid(player)
    {
        return new Promise(function(resolve, reject){
            var target_x;
            var starting_x = this.camera_x;
            if (player == "home")
            {
                target_x = this.home_x;
            }
            else
            {
                target_x = this.guest_x;
            }
            var movement = target_x - starting_x;
            if (movement != 0)
            {
                var animation_time = 1000;
                var sampling = 33;
                var starting_time = Date.now();
                var interval = setInterval(
                    function () {
                        var current_time = Date.now();
                        var elapsed_time = current_time - starting_time;
                        var step = elapsed_time / animation_time;
                        var smooth_step = this.smooth_step(step);
                        this.camera_x = movement * smooth_step + starting_x;
                        if (elapsed_time > animation_time)
                        {
                            clearInterval(interval);
                            this.camera_x = target_x;
                            resolve("Done");
                        }
                    }.bind(this),
                    sampling);
            }
            else
            {
                resolve("Done");
            }
        }.bind(this));
    }

    smooth_step(x)
    {
        if (x <= 0)
        {
            return (0);
        }
        if (x >= 1)
        {
            return (1);
        }
        return (- 2 * x ** 3 + 3 * x ** 2);
    }

    animate()
    {
        const delta = this.clock.getDelta();

        this.on_window_resize();

        if (this.asteroid.animating == true)
        {
            this.asteroid.mixer.update(delta);
        }

        this.lon += delta * this.camera_movement * 100;
        var phi = THREE.MathUtils.degToRad(55);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        const x = 6 * Math.sin(phi) * Math.cos(this.theta);
        const y = 6 * Math.cos(phi);
        const z = 6 * Math.sin(phi) * Math.sin(this.theta);

        this.camera.position.set(x, y, this.camera_x + z);
        this.camera.lookAt(0, - 1, this.camera_x);
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }
}