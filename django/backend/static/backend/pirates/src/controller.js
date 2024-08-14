/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   controller.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/10 00:49:29 by plopez-b          #+#    #+#             */
/*   Updated: 2024/08/14 02:05:14 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { GameView } from './view.js';
import { Mouse } from './mouse.js';

class StateController
{

    constructor(model)
    {
        this.model = model;
    }

    get_controller()
    {
        return null;
    }

    on_hover_enter(event)
    {
        let controller = this.get_controller();

        if (controller != null)
        {
            this.get_controller().on_hover_enter(event);
        }
    }

    on_hover_leave(event)
    {
        let controller = this.get_controller();

        if (controller != null)
        {
            this.get_controller().on_hover_leave(event);
        }
    }

    on_left_click(event)
    {
        let controller = this.get_controller();

        if (controller != null)
        {
            this.get_controller().on_left_click(event);
        }
    }

    on_right_click(event)
    {
        let controller = this.get_controller();

        if (controller != null)
        {
            this.get_controller().on_right_click(event);
        }
    }
}

export class LocalController extends StateController
{
    
    constructor(model, view, player)
    {
        super(model);
        this.player = player;
        this.place_controller = new ShipPlaceController(this.model, view, player);
        this.shoot_controller = new ShootController(this.model, view, player);
        this.view = view;
        this.view_ready = true;
        
        this.mouse = new Mouse(view);
        this.mouse.addEventListener(
            'hover_enter', (o) => this.on_hover_enter(o));
        this.mouse.addEventListener(
            'hover_leave', (o) => this.on_hover_leave(o)); 
        this.mouse.addEventListener(
            'left_click', (o) => this.on_left_click(o));
        this.mouse.addEventListener(
            'right_click', (o) => this.on_right_click(o));
        this.view.addEventListener(
            'view_ready', (o) => this.on_view_ready(o));
        this.view.addEventListener(
            'view_busy', (o) => this.on_view_busy(o));
    }

    get_controller()
    {
        let grid = this.model.get_player_grid(this.player);

        if (this.model.player != this.player
            || this.view_ready == false)
        {
            return null;
        }
        if (grid.is_ready())
        {
            return this.shoot_controller;
        }
        return this.place_controller;
    }

    on_view_ready(event)
    {
        this.view_ready = true;
    }

    on_view_busy(event)
    {
        this.view_ready = false;
    }
}

class ShipPlaceController extends StateController
{

    constructor(model, view, player)
    {
        super(model);
        this.player = player;
        this.view = view;
        this.dir = 0;
    }

    on_hover_enter(event)
    {
        let grid = this.model.get_player_grid(this.player);
        let ship;

        for (let i = 0; i < grid.ships.length; i++)
        {
            ship = grid.ships[i];
            if (!ship.has_definitive_location())
            {
                ship.move(event.cell.value[0], event.cell.value[1], this.dir);
                return;
            }
        }
    }

    on_hover_leave(event)
    {
        let grid = this.model.get_player_grid(this.player);
        let ship;

        for (let i = 0; i < grid.ships.length; i++)
        {
            ship = grid.ships[i];
            if (!ship.has_definitive_location())
            {
                ship.move(-1, -1, this.dir);
                return;
            }
        }
    }

    on_left_click(event)
    {
        let grid = this.model.get_player_grid(this.player);
        let ship;

        for (let i = 0; i < grid.ships.length; i++)
        {
            ship = grid.ships[i];
            if (!ship.has_definitive_location())
            {
                ship.move(event.cell.value[0], event.cell.value[1], this.dir);
                ship.set_location();
                if (grid.is_ready())
                {
                    this.model.hide_ships();
                }
                return;
            }
        }
    }

    on_right_click(event)
    {
        let grid = this.model.get_player_grid(this.player);
        let ship;
        this.dir = 1 - this.dir;

        for (let i = 0; i < grid.ships.length; i++)
        {
            ship = grid.ships[i];
            if (!ship.has_definitive_location())
            {
                ship.move(event.cell.value[0], event.cell.value[1], this.dir);
                return;
            }
        }

        
    }

}

class ShootController extends StateController
{

    constructor(model, player)
    {
        super(model);
        this.player = player;
    }

    on_hover_enter(event)
    {
        event.cell.material = event.cell.hover_material;
    }

    on_hover_leave(event)
    {
        event.cell.material = event.cell.default_material;
    }

    on_left_click(event)
    {
        event.cell.material = event.cell.default_material;
        let grid = this.model.get_player_grid(this.player);
        let cell = event.cell.value;
        this.model.move(cell[0], cell[1]);
    }

}
