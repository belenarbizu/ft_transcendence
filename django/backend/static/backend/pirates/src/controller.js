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

        this.home_placed = false;
        this.guest_placed = false;
    }
    
    receiver(message)
    {
        if (message["type"] == "ready")
        {
            this.view.hide_waiting_screen();
            if (this.mode == "guest")
            {
                this.place_phase("guest");
            }
            if (this.mode == "home" || this.mode == "local"
                || this.mode == "cpu")
            {
                this.place_phase("home");
            }
        }
        else if (message["type"] == "placed")
        {
            var opponent = this.model.get_opponent(message["player"]);
            if (this.mode == "local")
            {
                this.model.hide_all("home");
                this.model.hide_all("guest");
            }
            if (message["player"] == "home")
            {
                this.home_placed = true;
                if (this.mode == "local" || this.mode == "cpu")
                    this.place_phase(opponent);
            }
            else if (message["player"] == "guest")
            {
                this.guest_placed = true;
            }
            if (this.home_placed && this.guest_placed)
            {
                this.shot_phase(opponent);
            }
        }
        else if (message["type"] == "goal")
        {
            this.view.set_scores(
                this.model.get_score("home"),
                this.model.get_score("guest"));
            var winner = this.model.get_winner();
            if (winner != null)
            {
                this.interface({
                    "type": "end",
                    "winner": winner
                });
                return;
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
                    this.view.set_scores(
                        this.model.get_score("home"),
                        this.model.get_score("guest"));
                    if (message["type"] == "sunk")
                    {
                        this.interface({
                            "player": message["player"],
                            "type": "goal"
                        });
                    }
                    if (this.model.get_winner() == null)
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
        else if (message["type"] == "end")
        {
            this.view.set_winner(message["winner"]);
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
        this.view.set_turn(player);
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
                if (player_controller.on_place_phase != null)
                {
                    player_controller.on_place_phase();
                }
            }
        }.bind(this));
    }

    shot_phase(player)
    {
        this.view.set_turn(player);
        var opponent = this.model.get_opponent(player);
        this.activate_controller(null);
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
                if (player_controller.on_shot_phase != null)
                {
                    player_controller.on_shot_phase();
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
            'hover_enter', this.on_hover_enter.bind(this));
        this.mouse.addEventListener(
            'hover_leave', this.on_hover_leave.bind(this));
        this.mouse.addEventListener(
            'left_click', this.on_left_click.bind(this));
        document.addEventListener("keyup", this.on_key_up.bind(this));
        document.addEventListener("keydown", this.on_key_down.bind(this));

        this.dir = "vertical";
        this.item = [];

        this.is_active = true;
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
        if (event.key == "s")
        {
            this.dir = this.dir == "vertical" ? "horizontal" : "vertical";
        }
    }

    on_key_up(event) {
        let i = this.item.indexOf(event.key);
        if (i > -1)
            this.item.splice(i, 1);
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
                this.controller.activate_controller(null);
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

export class CPU
{

    constructor(controller, player)
    {
        this.controller = controller;
        this.player = player;
        this.view = controller.view;
        this.model = controller.model;
        this.controller.players[player] = this;
        this.is_active = true;
        this.opponent = this.model.get_opponent(this.player);

        this.grid = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
        this.count = [];
        this.has_hit = 0;
    }

    _update_sunk_ship(ship)
    {
        var ships = this.model.state[this.opponent]["ships"];
        if (ships[ship]["state"] == "sunk")
        {
            var cells = this.model._get_cells(
                ship,
                ships[ship]["x"],
                ships[ship]["y"],
                ships[ship]["direction"]);
            for (let i = 0; i < cells.length; i++)
            {
                var cell = cells[i];
                this.grid[cell[0]][cell[1]] = "miss";
            }
        }
    }

    _update_grid()
    {
        this.has_hit = 0;
        for (let x = 0; x < 6; x++)
        {
            for (let y = 0; y < 6; y++)
            {
                this.grid[x][y] = this.model.state[this.opponent]["grid"][x][y];
            }
        }
        this._update_sunk_ship("small");
        this._update_sunk_ship("medium");
        this._update_sunk_ship("large");
        for (let x = 0; x < 6; x++)
        {
            for (let y = 0; y < 6; y++)
            {
                if (this.grid[x][y] == "hit")
                {
                    this.has_hit += 1;
                }
            }
        }
    }

    _add_count(ship, direction)
    {
        if (this.model.state[this.opponent]["ships"][ship]["state"] 
            != "sunk")
        {
            for (let x = 0; x < 6; x++)
            {
                for (let y = 0; y < 6; y++)
                {
                    if (this.model.placement_inside_grid(
                        ship, x, y, direction))
                    {
                        var cells = this.model._get_cells(
                            ship, x, y, direction);
                        var valid = true;
                        var hit = 0
                        for (let i = 0; i < cells.length; i++)
                        {
                            var cell = cells[i];
                            if (this.grid[cell[0]][cell[1]] == "miss")
                            {
                                valid = false;
                            }
                            if (this.grid[cell[0]][cell[1]] == "hit")
                            {
                                hit += 1;
                            }
                        }
                        if (this.has_hit > 0)
                        {
                            valid = valid && hit > 0;
                        }
                        if (valid)
                        {
                            for (let i = 0; i < cells.length; i++)
                            {
                                var cell = cells[i];
                                if (this.grid[cell[0]][cell[1]] != "hit")
                                    this.count[cell[0]][cell[1]] += 1;
                            }
                        }
                    }
                }
            }
        }
    }

    _max_count()
    {
        for (let x = 0; x < 6; x++)
        {
            for (let y = 0; y < 6; y++)
            {
                if (this.count[x][y] > this.max_count)
                {
                    this.max_count = this.count[x][y];
                }
            }
        }
    }

    _get_options()
    {
        var options = [];
        for (let x = 0; x < 6; x++)
        {
            for (let y = 0; y < 6; y++)
            {
                if (this.count[x][y] == this.max_count)
                {
                    options.push([x, y]);
                }
            }
        }
        return (options);
    }

    _update_count()
    {
        this.count = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
        this.max_count = 0;
        this._add_count("small", "horizontal");
        this._add_count("small", "vertical");
        this._add_count("medium", "horizontal");
        this._add_count("medium", "vertical");
        this._add_count("large", "horizontal");
        this._add_count("large", "vertical");
        this._max_count();
    }

    on_place_phase()
    {
        while (!this.model.all_ships_placed(this.player))
        {
            this.model.update_model({
                "type": "placement",
                "player": this.player,
                "x": Math.floor(Math.random() * 6),
                "y": Math.floor(Math.random() * 6),
                "ship": this.model.next_ship_to_place(this.player),
                "direction": Math.floor(
                    Math.random() * 2) == 0 ? "horizontal" : "vertical"
            });
        }
        this.model.hide_all(this.player);
        this.controller.interface({
            "player": this.player,
            "type": "placed"
        });
    }

    on_shot_phase()
    {
        this._update_grid();
        this._update_count();
        var options = this._get_options();
        var option_id = Math.floor(Math.floor(Math.random() * options.length));
        var option = options[option_id];
        this.controller.interface({
            "player": this.player,
            "type": "shot",
            "x": option[0],
            "y": option[1]
        });
    }

}
