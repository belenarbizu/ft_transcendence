/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   objects.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 00:46:06 by plopez-b          #+#    #+#             */
/*   Updated: 2024/08/18 05:06:41 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GridCell extends THREE.Object3D
{
    constructor(x, z, model, player)
    {
        super();

        this.model = model;
        this.player = player;

        this.line_material = new THREE.LineBasicMaterial({color: 0x505050});

        this.default_material = new THREE.MeshPhongMaterial(
            { color: 0x606060 * 1, side: THREE.DoubleSide });
        this.default_material.opacity = 0.1;
        this.default_material.transparent = true;

        this.hover_material = new THREE.MeshPhongMaterial(
            { color: 0x7fffff, side: THREE.DoubleSide });
        this.hover_material.opacity = 0.3;
        this.hover_material.transparent = true;

        this.hit_material = new THREE.MeshPhongMaterial(
            { color: 0xff0000, side: THREE.DoubleSide });
        this.hit_material.opacity = 0.3;
        this.hit_material.transparent = true;

        this.miss_material = new THREE.MeshPhongMaterial(
            { color: 0xffffff, side: THREE.DoubleSide });
        this.miss_material.opacity = 0.3;
        this.miss_material.transparent = true;

        let shape = new THREE.Shape()
            .moveTo( -0.5, -0.5 )
            .lineTo( -0.5, 0.5 )
            .lineTo( 0.5, 0.5 )
            .lineTo( 0.5, -0.5 )
            .lineTo( -0.5, -0.5 );
        shape.autoClose = true;
        
        const points = shape.getPoints();
            
        let geometry = new THREE.ShapeGeometry( shape );

        const geometryPoints =
            new THREE.BufferGeometry().setFromPoints( points );

        this.mesh = new THREE.Mesh(geometry, this.default_material);
        this.value = [x, z];
        this.mesh.value = [x, z];
        this.mesh.default_material = this.default_material;
        this.mesh.hover_material = this.hover_material;
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(Math.PI / 2, 0, 0);
        this.add(this.mesh);
    
        let line = new THREE.Line( geometryPoints, this.line_material);
        line.position.set(0, 0, 0);
        line.rotation.set(Math.PI / 2, 0, 0);
        this.add(line);
    }

    update_view()
    {
        var cells = this.model.state[this.player]["grid"];
        var cell = cells[this.value[0]][this.value[1]];
        if (cell == "miss")
        {
            this.mesh.default_material = this.miss_material;
            this.mesh.material = this.mesh.default_material;
        }
        if (cell == "hit")
        {
            this.mesh.default_material = this.hit_material;
            this.mesh.material = this.mesh.default_material;
        }
    }
}

export class PlayerGrid extends THREE.Object3D
{
    constructor(model, player)
    {
        super();
        this.cells = [];
        this.ships = [];
        this.cell_objects = [];

        this.model = model;
        this.player = player;

        this.group = new THREE.Group();
        this.group.position.set(
            -(6 / 2 - 0.5), 0, -(6 / 2 - 0.5));
        super.add(this.group);
            
        for (let x_ = 0; x_ < 6; x_++)
        {
            for (let z_ = 0; z_ < 6; z_++)
            {
                let cell = new GridCell(x_, z_, this.model, this.player);
                this.cell_objects.push(cell);
                cell.position.set(z_, 0, x_);
                this.cells.push(cell.mesh);
                this.add(cell);
            }
        }
    }

    add(object)
    {
        this.group.add(object);
    }

    update_view()
    {
        for (let i = 0; i < this.cell_objects.length; i++)
        {
            this.cell_objects[i].update_view();
        }
    }
}

export class Ship extends THREE.Object3D
{
    constructor(file, player, ship, x, y, z, model)
    {
        super();
        this.length = 0;
        this.player = player;
        this.ship = ship;
        this.model = model;

        this.group = new THREE.Group();
        this.add(this.group);
        this.group.position.set(0, 0, 0);

        this.hover_material = new THREE.MeshPhongMaterial(
            { color: 0x7fffff, side: THREE.DoubleSide });
        this.hover_material.opacity = 0.3;
        this.hover_material.transparent = true;

        this.overlap_material = new THREE.MeshPhongMaterial(
            { color: 0xff7f7f, side: THREE.DoubleSide });
        this.overlap_material.opacity = 0.3;
        this.overlap_material.transparent = true;

        this.death_material = new THREE.MeshPhongMaterial(
            { color: 0x000000, side: THREE.DoubleSide });

        this.ship_loader = new GLTFLoader();
        var _this = this;
        this.ship_loader.load(
            file,
            function ( gltf ) {
                gltf.scene.traverse((o) => {
                    if (o.isMesh){
                        _this.group.add(o);
                        o.default_material = o.material;
                        o.rotation.set(0, -Math.PI / 2, 0);
                        o.position.set(x, y, z);
                    }
                });
            }
        );

        this.visible = true;
    }

    update_view()
    {
        var ship = this.model.state[this.player]["ships"][this.ship];
        var direction = ship["direction"] == "horizontal" ? 1 : 0;
        this.position.set(
            this.model.state[this.player]["ships"][this.ship]["y"],
            0,
            this.model.state[this.player]["ships"][this.ship]["x"]
        );
        this.rotation.set(0, direction * Math.PI / 2, 0);
        if (ship["state"] == "invisible" || ship["state"] == "hidden")
        {
            this.visible = false;
        }
        else if (ship["state"] == "placed")
        {
            this.visible = true;
            this.traverse((o) => {
                if (o.isMesh)
                {
                    o.material = o.default_material;
                }
            })
        }
        else if (ship["state"] == "sunk")
        {
            this.visible = true;
            this.traverse((o) => {
                if (o.isMesh)
                {
                    o.material = this.death_material;
                }
            });
        }
        else if (ship["state"] == "valid")
        {
            this.visible = true;
            this.traverse((o) => {
                if (o.isMesh)
                {
                    o.material = this.hover_material;
                }
            });
        }
        else if (ship["state"] == "invalid")
        {
            this.visible = true;
            this.traverse((o) => {
                if (o.isMesh)
                {
                    o.material = this.overlap_material;
                }
            });
        }
    }

    set_default_material()
    {
        this.visible = true;
        this.traverse((o) => {
            if (o.isMesh)
            {
                o.material = o.default_material;
            }
        })
    }

    rotate(direction)
    {
        this.rotation.set(0, direction * Math.PI / 2, 0);
    }
}

export class SkyBox extends THREE.Object3D
{
    constructor()
    {
        super();
        this.geometry = new THREE.SphereGeometry(500, 60, 40);
        this.geometry.scale(-1, 1, 1);

        this.texture = new THREE.TextureLoader().load( '/static/backend/pirates/space.jpg' );
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.material = new THREE.MeshBasicMaterial({map: this.texture});

        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.add(this.mesh);
    }
}

export class Asteroid extends THREE.Object3D
{
    constructor(x, y, z)
    {
        super();

        this.animating = false;
        this.loader = new GLTFLoader();
        this.scale.set(0.3, 0.3, 0.3);
        var _this = this;
        this.loader.load(
            "/static/backend/pirates/hit.glb",
            function ( gltf ) {
                gltf.scene.traverse((o) => {
                    if (o.isMesh){
                        _this.add(gltf.scene);
                        _this.animations = gltf.animations;
                        _this.scene = gltf.scene;
                        o.position.set(x, y, z);
                    }
                });
            }
        );
        this.visible = false;
    }

    hit()
    {
        this.visible = true;
        this.animating = true;
        this.mixer = new THREE.AnimationMixer(this.scene);
        const firstAction = this.mixer.clipAction(this.animations[0]);
        const secondAction = this.mixer.clipAction(this.animations[1]);
        firstAction.timeScale = 2;
        secondAction.timeScale = 2;
        firstAction.setLoop(THREE.LoopOnce);
        secondAction.setLoop(THREE.LoopOnce);
        firstAction.clampWhenFinished = true;
        secondAction.clampWhenFinished = true;
        firstAction.play();
        secondAction.play();
    }

    miss()
    {
        this.visible = true;
        this.animating = true;
        this.mixer = new THREE.AnimationMixer(this.scene);
        const firstAction = this.mixer.clipAction(this.animations[0]);
        firstAction.timeScale = 2;
        firstAction.setLoop(THREE.LoopOnce);
        firstAction.clampWhenFinished = true;
        firstAction.play();
    }
}