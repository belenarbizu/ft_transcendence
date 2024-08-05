/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   view.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 00:44:48 by plopez-b          #+#    #+#             */
/*   Updated: 2024/06/10 00:44:48 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as THREE from 'three';
import { PlayerGrid, SkyBox, Hit } from "./objects.js";

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
        this.camera_x = -(this.model.width_z / 2 + 2);
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

        //this.hit = new Hit(0, 0, 0);
        //this.scene.add(this.hit);
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
        // window.addEventListener('resize', onWindowResize);
        document.addEventListener('wheel', (o) => this.on_mouse_wheel(o));
        this.model.addEventListener('home_grid', (o) => this.on_home_grid(o));
        this.model.addEventListener('guest_grid', (o) => this.on_guest_grid(o));
        this.model.addEventListener('player_change', (o) => this.on_player_change(o));
    }

    on_home_grid(event)
    {
        let player_grid = new PlayerGrid(
            this.model.width_x, this.model.width_z);
        event.grid.addEventListener(
            'add_ship', (o) => player_grid.on_new_ship(o));
        event.grid.addEventListener(
            'hit', (o) => player_grid.on_hit(o));
        event.grid.addEventListener(
            'miss', (o) => player_grid.on_miss(o));
        player_grid.position.set(0, 0, -(this.model.width_z / 2 + 2));
        this.cells = this.cells.concat(player_grid.cells);
        this.scene.add(player_grid);
    }

    on_guest_grid(event)
    {
        let player_grid = new PlayerGrid(
            this.model.width_x, this.model.width_z);
        event.grid.addEventListener(
            'add_ship', (o) => player_grid.on_new_ship(o));
        event.grid.addEventListener(
            'hit', (o) => player_grid.on_hit(o));
        event.grid.addEventListener(
            'miss', (o) => player_grid.on_miss(o));
        player_grid.position.set(0, 0, +(this.model.width_z / 2 + 2));
        player_grid.rotation.set(0, Math.PI, 0);
        this.cells = this.cells.concat(player_grid.cells);
        this.scene.add(player_grid);
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

        const x = 6 * Math.sin(phi) * Math.cos(this.theta);
        const y = 6 * Math.cos(phi);
        const z = 6 * Math.sin(phi) * Math.sin(this.theta);

        this.model.ev_();
        this.camera.position.set(x, y, this.camera_x + z);
        this.camera.lookAt(0, - 1, this.camera_x);
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }
}
