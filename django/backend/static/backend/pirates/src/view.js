/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   view.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 00:44:48 by plopez-b          #+#    #+#             */
/*   Updated: 2024/08/16 03:14:44 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as THREE from 'three';
import { PlayerGrid, SkyBox, Ship, Hit } from "./objects.js";

export class GameView extends THREE.EventDispatcher
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

        this.cells = [];
        this.mouse_cell = null;
        this.pointer_down_x = 0;
        this.theta = 0;
        this.interacting = false;
        this.lon = 0;
        this.pointer_down_lon = 0;

        this._lights();
        this._objects();
        this._renderer();
        this._listeners();
    }

    _lights()
    {
        this.ambient_light = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(this.ambient_light);

        this.directional_light = new THREE.DirectionalLight(0xffffaa, 5);
        this.directional_light.position.set(100, 100, 0);
        this.scene.add(this.directional_light);
    }

    _objects()
    {
        this.skybox = new SkyBox();
        this.scene.add(this.skybox);

        this.home_grid = new PlayerGrid(this.model, "home");
        this.home_grid.position.set(0, 0, -(6 / 2 + 2));
        this.scene.add(this.home_grid);

        this.home_small = new Ship(
            '/static/backend/pirates/ship2.glb', "home", "small", 0, 0.6, 0.5, this.model);
        this.home_grid.add(this.home_small);
        this.home_medium = new Ship(
            '/static/backend/pirates/ship3.glb', "home", "medium", 0, 0.8, 0.9, this.model);
            this.home_grid.add(this.home_medium);
        this.home_large = new Ship(
            '/static/backend/pirates/ship4.glb', "home", "large", 0, 1, 1.6, this.model);
            this.home_grid.add(this.home_large);

        this.guest_grid = new PlayerGrid(this.model, "guest");
        this.guest_grid.position.set(0, 0, 6 / 2 + 2);
        this.guest_grid.rotation.set(0, Math.PI, 0);
        this.scene.add(this.guest_grid);

        this.guest_small = new Ship(
            '/static/backend/pirates/ship2.glb', "guest", "small", 0, 0.6, 0.5, this.model);
        this.guest_grid.add(this.guest_small);
        this.guest_medium = new Ship(
            '/static/backend/pirates/ship3.glb', "guest", "medium", 0, 0.8, 0.9, this.model);
            this.guest_grid.add(this.guest_medium);
        this.guest_large = new Ship(
            '/static/backend/pirates/ship4.glb', "guest", "large", 0, 1, 1.6, this.model);
            this.guest_grid.add(this.guest_large);

        //this.hit = new Hit(0, 0, 0);
        //this.scene.add(this.hit);
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

        if (this.model.state["player"] == "home")
        {
            this.cells = this.home_grid.cells;
        }
        else
        {
            this.cells = this.guest_grid.cells;
        }
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
        document.addEventListener('wheel', (o) => this.on_mouse_wheel(o));
        //this.model.addEventListener('home_grid', (o) => this.on_home_grid(o));
        //this.model.addEventListener('guest_grid', (o) => this.on_guest_grid(o));
        //this.model.addEventListener('player_change', (o) => this.on_player_change(o));
    }

    on_window_resize(event)
    {
        var positionInfo = this.container.getBoundingClientRect();
        this.camera.aspect = positionInfo.width / positionInfo.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( positionInfo.width, positionInfo.height );
    }
    
    on_mouse_wheel(event)
    {
        this.lon = this.lon + event.deltaY * 0.05;
        this.camera.updateProjectionMatrix();
    }

    on_player_change(event)
    {
        this.dispatchEvent({type: 'view_busy'});
        let total_time_ms = 30;
        let sampling = 10;
        let timer = total_time_ms;
        let _this = this;
        let final_camera_pos = -event.new_player * (2 + this.model.width_z / 2);
        let interval = setInterval(
            function () {
                if (Math.abs(_this.camera_x) < Math.abs(final_camera_pos) || total_time_ms - timer < sampling) {
                    timer -= sampling;
                    _this.camera_x += final_camera_pos * (1 / total_time_ms);
                } else {
                    clearInterval(interval);
                    _this.dispatchEvent({type: 'view_ready'});
                    _this.camera_x = final_camera_pos;
                }
            },
            10);
    }


    animate()
    {
        var phi = THREE.MathUtils.degToRad(55);
        this.theta = THREE.MathUtils.degToRad(this.lon);
        this.update_view();

        const x = 6 * Math.sin(phi) * Math.cos(this.theta);
        const y = 6 * Math.cos(phi);
        const z = 6 * Math.sin(phi) * Math.sin(this.theta);

        this.camera.position.set(x, y, this.camera_x + z);
        this.camera.lookAt(0, - 1, this.camera_x);
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }
}