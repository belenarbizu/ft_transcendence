/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   objects.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 00:46:06 by plopez-b          #+#    #+#             */
/*   Updated: 2024/06/10 00:46:06 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GridCell extends THREE.Object3D
{
    constructor(x, z)
    {
        super();

        this.line_material = new THREE.LineBasicMaterial({color: 0x505050});

        this.default_material = new THREE.MeshPhongMaterial(
            { color: 0x606060 * 1, side: THREE.DoubleSide });
        this.default_material.opacity = 0.1;
        this.default_material.transparent = true;

        this.hover_material = new THREE.MeshPhongMaterial(
            { color: 0x7fffff, side: THREE.DoubleSide });
        this.hover_material.opacity = 0.3;
        this.hover_material.transparent = true;

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
}

function ship_factory(length)
{
    if (length == 2)
    {
        return new Ship('/static/backend/pirates/ship2.glb', 2, 0, 0.6, 0.5);
    }
    if (length == 3)
    {
        return  new Ship('/static/backend/pirates/ship3.glb', 3, 0, 0.8, 0.9);
    }
    if (length == 4)
    {
        return  new Ship('/static/backend/pirates/ship4.glb', 4, 0, 1, 1.6);
    }
}

export class PlayerGrid extends THREE.Object3D
{
    constructor(x_width, z_width)
    {
        super();
        this.cells = [];
        this.ships = [];

        this.group = new THREE.Group();
        this.group.position.set(
            -(x_width / 2 - 0.5), 0, -(z_width / 2 - 0.5));
        super.add(this.group);
            
        for (let x_ = 0; x_ < x_width; x_++)
        {
            for (let z_ = 0; z_ < z_width; z_++)
            {
                let cell = new GridCell(x_, z_);
                cell.position.set(x_, 0, z_);
                this.cells.push(cell.mesh);
                this.add(cell);
            }
        }
    }

    on_new_ship(event)
    {
        let ship = ship_factory(event.ship.length);
        this.ships.push(ship);
        this.add(ship);
        event.ship.addEventListener(
            'good_location', (o) => ship.on_good_location(o));
        event.ship.addEventListener(
            'outside_grid', (o) => ship.on_bad_location(o));
        event.ship.addEventListener(
            'overlap', (o) => ship.on_overlap(o));
        event.ship.addEventListener(
            'move', (o) => ship.on_move(o));
        event.ship.addEventListener(
            'locate', (o) => ship.on_locate(o));
        event.ship.addEventListener(
            'sunk', (o) => ship.on_sunk(o));
    }

    on_hit(event)
    {
        for (let i = 0; i < this.cells.length; i++)
        {
            let cell = this.cells[i];
            if (cell.value[0] == event.cell[0]
                && cell.value[1] == event.cell[1])
            {
                cell.default_material = new THREE.MeshPhongMaterial(
                    { color: 0xff0000, side: THREE.DoubleSide });
                cell.default_material.opacity = 0.3;
                cell.default_material.transparent = true
                cell.material = cell.default_material;
            }
        }
    }

    on_miss(event)
    {
        for (let i = 0; i < this.cells.length; i++)
        {
            let cell = this.cells[i];
            if (cell.value[0] == event.cell[0]
                && cell.value[1] == event.cell[1])
            {
                cell.default_material = new THREE.MeshPhongMaterial(
                    { color: 0xffffff, side: THREE.DoubleSide });
                cell.default_material.opacity = 0.3;
                cell.default_material.transparent = true
                cell.material = cell.default_material;
            }
        }
    }

    add(object)
    {
        this.group.add(object);
    }
}

export class Ship extends THREE.Object3D
{
    constructor(file, length, x, y, z)
    {
        super();
        this.length = length;

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

        this.visible = false;
    }

    on_good_location(event)
    {
        this.visible = true;
        this.traverse((o) => {
            if (o.isMesh)
            {
                o.material = this.hover_material;
            }
        });
    }

    on_overlap(event)
    {
        this.visible = true;
        this.traverse((o) => {
            if (o.isMesh)
            {
                o.material = this.overlap_material;
            }
        });
    }

    on_bad_location(event)
    {
        this.visible = false;
    }

    on_move(event)
    {
        this.position.set(event.ship.x_position, 0, event.ship.z_position);
        this.rotation.set(0, event.ship.direction * Math.PI / 2, 0);
    }

    on_locate(event)
    {
        this.visible = true;
        this.traverse((o) => {
            if (o.isMesh)
            {
                o.material = o.default_material;
            }
        })
    }

    on_sunk(event)
    {
        this.visible = true;
        this.traverse((o) => {
            if (o.isMesh)
            {
                o.material = this.death_material;
            }
        });
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

export class Hit extends THREE.Object3D
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
        firstAction.setLoop(THREE.LoopOnce);
        firstAction.clampWhenFinished = true;
        firstAction.play();
    }
}