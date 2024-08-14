/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   model.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: plopez-b <plopez-b@student.42malaga.com    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/06/09 22:31:24 by plopez-b          #+#    #+#             */
/*   Updated: 2024/08/14 01:22:30 by plopez-b         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { EventDispatcher } from "three";

export class ShipModel extends EventDispatcher
{

    constructor(length, grid, model)
    {
        super();
        this.model = model;
        this.length = length;
        this.grid = grid;
        this.x_position = -1;
        this.z_position = -1;
        this.direction = -1;
        this.cells = [];
        this.touched_cells = [];
    }

    is_sunk()
    {
        return this.cells.length > 0
            && this.cells.length == this.touched_cells.length;
    }

    is_touched_at(x, z)
    {
        for (let i = 0; i < this.touched_cells.length; i++)
        {
            if (this.touched_cells[i][0] == x
                && this.touched_cells[i][1] == z)
            {
                return true;
            }
        }
    }

    has_definitive_location()
    {
        return this.cells.length != 0;
    }

    is_well_located()
    {
        let grid = this.grid;
        let t = this;
        for (let i = 0; i < this.grid.ships.length; i++)
        {
            if (!this.is_inside_grid())
            {
                this.dispatchEvent({type: 'outside_grid', ship: this});
                return false;
            }
            if (this.overlaps(this.grid.ships[i]))
            {
                this.dispatchEvent({type: 'overlap', ship: this});
                return false;
            }
        }
        this.dispatchEvent({type: 'good_location', ship: this});
        return true;
    }

    hide()
    {
        this.dispatchEvent({type: 'hide', ship: this});
    }

    get_occupied_cells()
    {
        let occupied_cells = [];
        let x_pos, z_pos;

        for (let i = 0; i < this.length; i++)
        {
            x_pos = this.x_position + this.direction * i;
            z_pos = this.z_position + (1 - this.direction) * i;
            occupied_cells.push([x_pos, z_pos]);
        }
        return occupied_cells;
    }

    is_at(x, z)
    {
        for (let i = 0; i < this.get_occupied_cells().length; i++)
        {
            if (this.get_occupied_cells[i][0] == x
                && this.get_occupied_cells[i][1] == z)
            {
                return true;
            }
        }
        return false;
    }

    move(x, z, direction)
    {
        this.x_position = x;
        this.z_position = z;
        this.direction = direction;
        this.is_well_located();
        this.dispatchEvent({type: 'move', ship: this});
    }

    set_location()
    {
        if (this.is_well_located())
        {
            this.cells = this.get_occupied_cells();
            this.dispatchEvent({type: 'locate', ship: this});
        }
        if (this.grid.is_ready())
        {
            this.model.change_player();
        }
    }

    set_random_location()
    {
        do
        {
            this.x_position = Math.floor(Math.random() * 5);
            this.z_position = Math.floor(Math.random() * 5);
            this.direction = Math.floor(Math.random() * 2);
        }
        while (!this.is_well_located());
        this.set_location();
    }

    set_sunk_location(x, z, direction)
    {
        this.x_position = x;
        this.z_position = z;
        this.direction = direction;
        this.touched_cells = this.get_occupied_cells();
        this.set_location();
    }

    overlaps(ship)
    {
        let occupied_cells = this.get_occupied_cells();

        if (ship.grid != this.grid || this == ship)
        {
            return false;
        }
        for (let i = 0; i < occupied_cells.length; i++)
        {
            for (let j = 0; j < ship.cells.length; j++)
            {
                if (ship.cells[j][0] == occupied_cells[i][0]
                    && ship.cells[j][1] == occupied_cells[i][1])
                {
                    return true;
                }
            }
        }
        return false;
    }

    is_inside_grid()
    {
        let occupied_cells = this.get_occupied_cells();

        for (let i = 0; i < occupied_cells.length; i++)
        {
            if (occupied_cells[i][0] >= this.grid.width_x
                || occupied_cells[i][0] < 0
                || occupied_cells[i][1] >= this.grid.width_z
                || occupied_cells[i][1] < 0)
            {
                return false;
            }
        }
        return true;
    }

    touch(x, z)
    {
        for (let i = 0; i < this.cells.length; i++)
        {
            if (this.cells[i][0] == x
                && this.cells[i][1] == z
                && !this.is_touched_at(x, z))
            {
                this.touched_cells.push([x, z]);
            }
        }
        if (this.is_sunk())
        {
            this.dispatchEvent({type: 'sunk', target: this});
        }
    }

}


export class GridModel extends EventDispatcher
{

    constructor(width_x, width_z, model)
    {
        super();
        this.model = model;
        this.width_x = width_x;
        this.width_z = width_z;
        this.ships = [];
    }

    is_ready()
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            if (!this.ships[i].has_definitive_location())
            {
                return false;
            }
        }
        return true;
    }

    add_ship(ship)
    {
        if (!this.contains_ship(ship))
        {
            this.ships.push(ship);
            this.dispatchEvent({type: 'add_ship', ship: ship});
        }
    }

    contains_ship(ship)
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            if (this.ships[i] === ship)
            {
                return true;
            }
        }
        return false;
    }

    set_random_location()
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            this.ships[i].set_random_location();
        }
    }

    touch(x, z)
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            this.ships[i].touch(x, z);
            if (this.ships[i].is_touched_at(x, z))
            {
                this.dispatchEvent({type: 'hit', cell: [x, z]});
                return;
            }
        }
        this.dispatchEvent({type: 'miss', cell: [x, z]})
    }

    is_touched_at(x, z)
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            if (this.ships[i].is_touched_at(x, z))
            {
                return true;
            }
        }
        return false;
    }

    ships_sunk()
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            if (!this.ships[i].is_sunk())
            {
                return false;
            }
        }
        return true;
    }

    ship_at(x, z)
    {
        for (let i = 0; i < this.ships.length; i++)
        {
            if (this.ships[i].is_at(x, z))
            {
                return this.ships[i];
            }
        }
        return null;
    }

    hide_ships()
    {
        this.ships.forEach((ship) => ship.hide());
    }

}


export class GameModel extends EventDispatcher
{

    constructor(width_x, width_z, ships, starting_player)
    {
        super();
        this.width_x = width_x;
        this.width_z = width_z;
        this.player = starting_player;
        this.ships = ships;
    }

    init()
    {
        this.home_grid = new GridModel(this.width_x, this.width_z, this);
        this.dispatchEvent({type: 'home_grid', grid: this.home_grid});
        this.guest_grid = new GridModel(this.width_x, this.width_z, this);
        this.dispatchEvent({type: 'guest_grid', grid: this.guest_grid});
        for (let i = 0; i < this.ships.length; i++)
        {
            this.home_grid.add_ship(
                new ShipModel(this.ships[i], this.home_grid, this));
            this.guest_grid.add_ship(
                new ShipModel(this.ships[i], this.guest_grid, this));
        }
    }

    get_player_grid(player)
    {
        if (player == 1)
        {
            return this.home_grid;
        }
        return this.guest_grid;
    }

    utility()
    {
        if (this.home_grid.ships_sunk())
        {
            return 1;
        }
        if (this.guest_grid.ships_sunk())
        {
            return -1;
        }
        return 0;
    }

    ev_()
    {
        this.dispatchEvent('hola', "Hellooo");
    }

    hide_ships()
    {
        this.home_grid.hide_ships();
        this.guest_grid.hide_ships();
    }

    is_terminal()
    {
        return this.utility() != 0;
    }

    change_player()
    {
        this.player = -1 * this.player;
        console.log(this.player);
        this.dispatchEvent({type: 'player_change', new_player: this.player});
    }

    move(x, z)
    {
        let target_grid = this.get_player_grid(this.player);
        target_grid.touch(x, z);
        this.change_player();
    }

}
