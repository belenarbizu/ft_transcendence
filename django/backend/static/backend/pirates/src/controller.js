/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   controller.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 00:49:29 by plopez-b          #+#    #+#             */
/*   Updated: 2024/08/17 06:42:24 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Mouse } from './mouse.js';

export class Controller
{

    constructor(model, view, url, mode)
    {
        this.model = model;
        this.view = view;
        this.url = url;
        this.mode = mode;
        
        this.model.controller = this;
        this.view.controller = this;

        this.players = {
            "home": null,
            "guest": null
        };
        
        this.webSocket = new WebSocket(url);

        var controller = this;
        this.webSocket.onmessage = function (msg) {
            var data = JSON.parse(msg.data);
            controller.receiver(data);
        };
        this.interface = function (data) {
            var msg = JSON.stringify(data);
            this.webSocket.send(msg);
        };
        this.place_phase("home");
    }
    
    receiver(message)
    {
        if (message["type"] == "placed")
        {
            var opponent = this.model.get_opponent(message["player"]);
            if (this.mode == "local")
            {
                this.model.hide_all();
            }
            if (message["player"] == "home")
            {
                this.place_phase(opponent);
            }
            if (message["player"] == "guest")
            {
                this.shot_phase(opponent);
            }
        }
        else if (message["type"] == "shot")
        {
            var opponent = this.model.get_opponent(message["player"]);
            var shot = this.model.check_shot(
                opponent, message["x"], message["y"]);
            this.interface(shot);
        }
        else if (message["type"] == "hit"
            || message["type"] == "sunk")
        {
            this.activate_controller(null);
            this.view.hit_animation(
                message["player"],
                message["x"],
                message["y"],
                "hit").then(function(){
                    this.model.update_model(message);
                    this.shot_phase(message["player"]);
                }.bind(this));
        }
        else if (message["type"] == "miss")
        {
            this.activate_controller(null);
            this.view.hit_animation(
                message["player"],
                message["x"],
                message["y"],
                "miss").then(function(){
                    this.model.update_model(message);
                    this.shot_phase(message["player"]);
                }.bind(this));
        }
    }

    activate_controller(player)
    {
        if (this.players["home"] != null)
        {
            this.players["home"].is_active = false;
        }
        if (this.players["guest"] != null)
        {
            this.players["guest"].is_active = false;
        }
        if (player == "home" && this.players["home"] != null)
        {
            this.players["home"].is_active = true;
        }
        if (player == "guest" && this.players["guest"] != null)
        {
            this.players["guest"].is_active = true;
        }
    }

    place_phase(player)
    {
        this.activate_controller(null);
        this.view.focus_grid(player).then(function(o){
            var player_controller = this.players[player];
            this.activate_controller(player);
            if (player_controller != null)
            {
                if (player_controller.mouse != null)
                {
                    player_controller.mouse.cells = this.view.get_player_cells(
                        player);
                }
            }
        }.bind(this));
    }

    shot_phase(player)
    {
        this.activate_controller(null);
        var opponent = this.model.get_opponent(player);
        this.view.focus_grid(opponent).then(function(o){
            this.activate_controller(player);
            var player_controller = this.players[player];
            if (player_controller != null)
            {
                if (player_controller.mouse != null)
                {
                    player_controller.mouse.cells = this.view.get_player_cells(
                        opponent);
                }
            }
        }.bind(this));
    }

}

export class Human
{

    constructor(controller, player)
    {
        this.controller = controller;
        this.player = player;
        this.view = controller.view;
        this.model = controller.model;
        this.controller.players[player] = this;

        this.mouse = new Mouse(this.view);
        this.mouse.addEventListener(
            'hover_enter', (o) => this.on_hover_enter(o));
        this.mouse.addEventListener(
            'hover_leave', (o) => this.on_hover_leave(o));
        this.mouse.addEventListener(
            'left_click', (o) => this.on_left_click(o));

        this.dir = "vertical";

        this.is_active = true;
    }

    on_hover_enter(event)
    {
        if (!this.is_active)
        {
            return;
        }
        if (this.model.all_ships_placed(this.player))
        {
            // Shot
            event.cell.material = event.cell.hover_material;
        }
        else
        {
            // Place ship
            var x = event.cell.value[0];
            var y = event.cell.value[1];
            var ship = this.model.next_ship_to_place(this.player);
            if (ship != null)
            {
                this.model.update_model({
                    "type": "preview",
                    "player": this.player,
                    "x": x,
                    "y": y,
                    "ship": this.model.next_ship_to_place(this.player),
                    "direction": this.dir
                });
            }
        }
    }

    on_hover_leave(event)
    {
        if (!this.is_active)
        {
            return;
        }
        if (this.model.all_ships_placed(this.player))
        {
            // Shot
            event.cell.material = event.cell.default_material;
        }
        else
        {
            // Place ship
            var ship = this.model.next_ship_to_place(this.player);
            if (ship != null)
            {
                this.model.update_model({
                    "type": "hide",
                    "player": this.player,
                    "x": -1,
                    "y": -1,
                    "ship": this.model.next_ship_to_place(this.player),
                    "direction": this.dir
                });
            }
        }
    }

    on_left_click(event)
    {
        if (!this.is_active)
        {
            return;
        }
        if (event.cell != null)
        {
            if (this.model.all_ships_placed(this.player))
            {
                // Shot
                var x = event.cell.value[0];
                var y = event.cell.value[1];
                event.cell.material = event.cell.default_material;
                this.controller.interface({
                    "player": this.player,
                    "type": "shot",
                    "x": x,
                    "y": y
                });
            }
            else
            {
                // Place ship
                var x = event.cell.value[0];
                var y = event.cell.value[1];
                this.model.update_model({
                    "type": "placement",
                    "player": this.player,
                    "x": x,
                    "y": y,
                    "ship": this.model.next_ship_to_place(this.player),
                    "direction": this.dir
                });
                if (this.model.all_ships_placed(this.player))
                {
                    this.controller.activate_controller(null);
                    this.controller.interface({
                        "player": this.player,
                        "type": "placed"
                    });
                }
            }
        }        
    }
}
