import { EventDispatcher } from "three";

export class Model extends EventDispatcher
{

    constructor()
    {
        super();
        this.state = {
            "player": "home",
            "home": {
                "grid": [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
                "ships": {
                    "small": {
                        "x": -1,
                        "y": -1,
                        "direction": 0,
                        "cells": [],
                        "hit_cells": [],
                        "state": "invisible"
                    },
                    "medium": {
                        "x": -1,
                        "y": -1,
                        "direction": 0,
                        "cells": [],
                        "hit_cells": [],
                        "state": "invisible"
                    },
                    "large": {
                        "x": -1,
                        "y": -1,
                        "direction": 0,
                        "cells": [],
                        "hit_cells": [],
                        "state": "invisible"
                    },
                },
                "score": 0,
            },
            "guest": {
                "grid": [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
                "ships": {
                    "small": {
                        "x": -1,
                        "y": -1,
                        "direction": 0,
                        "cells": [],
                        "hit_cells": [],
                        "state": "invisible"
                    },
                    "medium": {
                        "x": -1,
                        "y": -1,
                        "direction": 0,
                        "cells": [],
                        "hit_cells": [],
                        "state": "invisible"
                    },
                    "large": {
                        "x": -1,
                        "y": -1,
                        "direction": 0,
                        "cells": [],
                        "hit_cells": [],
                        "state": "invisible"
                    },
                },
                "score": 0,
            }
        };
    }

    _cell_in_list(list, x, y)
    {
        for (let i = 0; i < list.length; i++)
        {
            var cell = list[i];
            if (cell[0] == x && cell[1] == y)
            {
                return (true);
            }
        }
        return (false);
    }

    _get_ship_at_pos(player, x, y)
    {
        var ships = ["small", "medium", "large"];
        for (let i = 0; i < ships.length; i++)
        {
            for (let j = 0;
                j < this.state[player]["ships"][ships[i]]["cells"].length; j++)
            {
                var cell = this.state[player]["ships"][ships[i]]["cells"][j];
                if (cell[0] == x && cell[1] == y)
                {
                    return (ships[i]);
                }
            }
        }
        return (null);
    }

    _get_cells(ship, x, y, direction)
    {
        var horizontal = direction == "horizontal" ? 1 : 0;
        var vertical = direction == "vertical" ? 1 : 0;
        var cells = [
            [x + vertical * 0, y + horizontal * 0],
            [x + vertical * 1, y + horizontal * 1]
        ];
        if (ship == "medium")
        {
            cells.push([x + vertical * 2, y + horizontal * 2]);
        }
        if (ship == "large")
        {
            cells.push([x + vertical * 2, y + horizontal * 2]);
            cells.push([x + vertical * 3, y + horizontal * 3]);
        }
        return (cells);
    }

    _cell_outside_grid(cell)
    {
        return (cell[0] < 0 || cell[0] > 5 || cell[1] < 0 || cell[1] > 5);
    }

    _is_sinking_shot(player, ship, x, y)
    {
        var cells = this.state[player]["ships"][ship]["cells"];
        var hit_cells = this.state[player]["ships"][ship]["hit_cells"];
        if (hit_cells.length != cells.length - 1)
        {
            return (false);
        }
        if (this._cell_in_list(hit_cells, x, y))
        {
            return (false);
        }
        return (true);
    }

    get_score(player)
    {
        var opponent = this.get_opponent(player);
        var score = 0;
        if (this.state[opponent]["ships"]["small"]["state"] == "sunk")
            score ++;
        if (this.state[opponent]["ships"]["medium"]["state"] == "sunk")
            score ++;
        if (this.state[opponent]["ships"]["large"]["state"] == "sunk")
            score ++;
        return (score);
    }

    get_winner()
    {
        if (this.get_score("home") == 3)
            return ("home");
        if (this.get_score("guest") == 3)
            return ("guest");
        return (null);
    }

    next_ship_to_place(player)
    {
        if (this.state[player]["ships"]["small"]["state"] != "placed"
            && this.state[player]["ships"]["small"]["state"] != "sunk"
            && this.state[player]["ships"]["small"]["state"] != "hidden")
        {
            return ("small");
        }
        if (this.state[player]["ships"]["medium"]["state"] != "placed"
            && this.state[player]["ships"]["medium"]["state"] != "sunk"
            && this.state[player]["ships"]["medium"]["state"] != "hidden")
        {
            return ("medium");
        }
        if (this.state[player]["ships"]["large"]["state"] != "placed"
            && this.state[player]["ships"]["large"]["state"] != "sunk"
            && this.state[player]["ships"]["large"]["state"] != "hidden")
        {
            return ("large");
        }
        return (null);
    }

    all_ships_placed(player)
    {
        return (this.next_ship_to_place(player) == null);
    }

    valid_placement(player, ship, x, y, direction)
    {
        var cells = this._get_cells(ship, x, y, direction);
        for (let i = 0; i < cells.length; i++)
        {
            var cell = cells[i];
            var ship = this._get_ship_at_pos(player, cell[0], cell[1]);
            if (ship != null 
                && (this.state[player]["ships"][ship]["state"] == "placed"))
            {
                return (false);
            }
            if (this._cell_outside_grid(cell))
            {
                return (false);
            }
        }
        return (true);
    }

    placement_inside_grid(ship, x, y, direction)
    {
        var cells = this._get_cells(ship, x, y, direction);
        for (let i = 0; i < cells.length; i++)
        {
            var cell = cells[i];
            if (this._cell_outside_grid(cell))
            {
                return (false);
            }
        }
        return (true);
    }

    get_opponent(player)
    {
        if (player == "home")
        {
            return ("guest");
        }
        return ("home");
    }

    check_shot(player, x, y)
    {
        var ship = this._get_ship_at_pos(player, x, y);
        if (ship == null)
        {
            return ({
                "player": player,
                "type": "miss",
                "x": x,
                "y": y
            });
        }
        else
        {
            if (this._is_sinking_shot(player, ship, x, y))
            {
                return ({
                    "player": player,
                    "type": "sunk",
                    "x": x,
                    "y": y,
                    "ship_x": this.state[player]["ships"][ship]["x"],
                    "ship_y": this.state[player]["ships"][ship]["y"],
                    "ship": ship,
                    "direction": this.state[player]["ships"][ship]["direction"]
                });
            }
            else
            {
                return ({
                    "player": player,
                    "type": "hit",
                    "x": x,
                    "y": y
                });
            }
        }
    }

    hide_all(player)
    {
        if (this.state[player]["ships"]["small"]["state"] == "placed")
            this.state[player]["ships"]["small"]["state"] = "hidden";
        if (this.state[player]["ships"]["medium"]["state"] == "placed")
            this.state[player]["ships"]["medium"]["state"] = "hidden";
        if (this.state[player]["ships"]["large"]["state"] == "placed")
            this.state[player]["ships"]["large"]["state"] = "hidden";
        this.dispatchEvent({type: 'update', ship: this});
    }

    update_model(message)
    {
        if (message["type"] == "preview")
        {
            var player = message["player"];
            var x = message["x"];
            var y = message["y"];
            var ship = message["ship"];
            var direction = message["direction"];
            this.state[player]["ships"][ship]["direction"] = direction;
            this.state[player]["ships"][ship]["x"] = x;
            this.state[player]["ships"][ship]["y"] = y;
            if (this.valid_placement(player, ship, x, y, direction))
            {
                this.state[player]["ships"][ship]["state"] = "valid";
            }
            else
            {
                this.state[player]["ships"][ship]["state"] = "invalid";
            }
            this.state[player]["ships"][ship]["cells"] = this._get_cells(
                ship, x, y, direction);
            this.state[player]["ships"][ship]["hit_cells"] = [];
        }
        if (message["type"] == "hide")
        {
            var player = message["player"];
            var x = message["x"];
            var y = message["y"];
            var ship = message["ship"];
            this.state[player]["ships"][ship]["x"] = x;
            this.state[player]["ships"][ship]["y"] = y;
            this.state[player]["ships"][ship]["hit_cells"] = [];
            this.state[player]["ships"][ship]["state"] = "invisible";
        }
        if (message["type"] == "placement")
        {
            var player = message["player"];
            var x = message["x"];
            var y = message["y"];
            var ship = message["ship"];
            var direction = message["direction"];
            if (this.valid_placement(player, ship, x, y, direction))
            {
                this.state[player]["ships"][ship]["direction"] = direction;
                this.state[player]["ships"][ship]["x"] = x;
                this.state[player]["ships"][ship]["y"] = y;
                this.state[player]["ships"][ship]["state"] = "placed";
                this.state[player]["ships"][ship]["cells"] = this._get_cells(
                    ship, x, y, direction);
                this.state[player]["ships"][ship]["hit_cells"] = [];
            }
        }
        else if (message["type"] == "hit")
        {
            var player = message["player"];
            var x = message["x"];
            var y = message["y"];
            var ship = this._get_ship_at_pos(player, x, y);
            this.state[player]["grid"][x][y] = "hit";
            if (ship != null)
            {
                var hit_cells = this.state[player]["ships"][ship]["hit_cells"];
                if (!this._cell_in_list(hit_cells, x, y))
                {
                    this.state[player]["ships"][ship]["hit_cells"].push([x, y]);
                }
            }
        }
        else if (message["type"] == "miss")
        {
            var player = message["player"];
            var x = message["x"];
            var y = message["y"];
            this.state[player]["grid"][x][y] = "miss";
        }
        else if (message["type"] == "sunk")
        {
            var player = message["player"];
            var x = message["x"];
            var y = message["y"];
            this.state[player]["grid"][x][y] = "hit";
            var ship_x = message["ship_x"];
            var ship_y = message["ship_y"];
            var ship = message["ship"];
            var direction = message["direction"];
            var hit_cells = this.state[player]["ships"][ship]["hit_cells"];
            this.state[player]["ships"][ship]["direction"] = direction;
            this.state[player]["ships"][ship]["x"] = ship_x;
            this.state[player]["ships"][ship]["y"] = ship_y;
            this.state[player]["ships"][ship]["state"] = "sunk";
        }
        this.dispatchEvent({type: 'update', ship: this});
    }

}
