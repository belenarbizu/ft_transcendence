

export class Controller
{

    constructor(model, view, url)
    {
        this.model = model;
        this.model.controller = this;
        this.view = view;
        this.view.controller = this;
        this.players = {
            "home": null,
            "guest": null
        };
        this.item = [];
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
    }

    receiver(message)
    {
        if (message["type"] == "hit")
        {
            this.model.set_ball_movement(
                message["movement"], message["position"],
                message["last_height"], message["slope"],
                message["velocity"]);
        }
        if (message["type"] == "goal")
        {
            this.model.goal_to(message["player"]);
            this.model.set_ball_movement(
                message["movement"], message["position"],
                message["last_height"], message["slope"],
                message["velocity"]);
            var winner = this.model.has_winner();
            if (winner != false)
            {
                this.on_end(winner);
            }
            this.view.set_scores(
                this.model.scores["home"], this.model.scores["guest"]);
        }
        if (message["type"] == "movement")
        {
            this.model.set_pad_movement(
                message["player"], message["movement"],
                message["position"]);
        }
        if (message["type"] == "start")
        {
            this.model.set_ball_movement(
                message["movement"], message["position"],
                message["last_height"], message["slope"],
                message["velocity"]);
        }
        if (message["type"] == "end")
        {
            request_confirmation = false;
            this.view.set_winner(message["winner"]);
            this.model.set_ball_movement(
                1, 0.5,
                0.5, 0,
                0);
        }
        if (this.players["home"] != null)
        {
            this.players["home"].receiver(message);
        }
        if (this.players["guest"] != null)
        {
            this.players["guest"].receiver(message);
        }
    }

    on_loop(current_time)
    {
        if (this.players["home"])
        {
            this.players["home"].on_loop(current_time);
        }
        if (this.players["guest"])
        {
            this.players["guest"].on_loop(current_time);
        }
    }

    on_hit()
    {
        if (this.model.ball["movement"] == 1)
        {
            this.interface({
                "player": "home",
                "type": "hit",
                "movement": this.model.ball["movement"] * -1,
                "position": 0,
                "last_height": this.model.get_ball_y(1),
                "slope": this.model.get_new_slope(this.model.ball["movement"]),
                "velocity": this.model.get_ball_velocity(),
            });
        }
        else
        {
            this.interface({
                "player": "guest",
                "type": "hit",
                "movement": this.model.ball["movement"] * -1,
                "position": 0,
                "last_height": this.model.get_ball_y(1),
                "slope": this.model.get_new_slope(this.model.ball["movement"]),
                "velocity": this.model.get_ball_velocity(),
            });
        }
    }

    on_goal()
    {
        if (this.model.ball["movement"] == 1)
        {
            this.interface({
                "player": "home",
                "type": "goal",
                "movement": this.model.ball["movement"],
                "position": 0.5,
                "last_height": 0.5,
                "slope": this.model.get_new_slope(this.model.ball["movement"]),
                "velocity": this.model.ball_initial_velocity
            });
        }
        else
        {
            this.interface({
                "player": "guest",
                "type": "goal",
                "movement": this.model.ball["movement"] * -1,
                "position": 0.5,
                "last_height": 0.5,
                "slope": this.model.get_new_slope(this.model.ball["movement"]),
                "velocity": this.model.ball_initial_velocity
            });
        }
    }

    on_start()
    {
        this.interface({
            "type": "start",
            "movement": this.model.ball["movement"] * -1,
            "position": 0.5,
            "last_height": 0.5,
            "slope": (Math.random() - 0.5) * 2,
            "velocity": this.model.ball_initial_velocity
        })
    }

    on_end(winner)
    {
        this.interface({
            "type": "end",
            "winner": winner,
        })
    }
}


export class Human
{

    constructor(controller, player, up, down)
    {
        this.controller = controller;
        this.controller.players[player] = this;
        this.player = player;
        this.up = up;
        this.down = down;
        this.pad_movement = 0;
        this.item = [];
        document.addEventListener("keyup", this.on_key_up.bind(this));
        document.addEventListener("keydown", this.on_key_down.bind(this));
    }

    receiver(message)
    {
        if (message["type"] == "ready")
        {
            this.controller.view.hide_waiting_screen();
            if (this.player == "home")
            {
                new Promise((resolve) => setTimeout(resolve, 5000)).then(
                    this.controller.on_start.bind(this.controller));
            }
        }
    }

    on_loop(current_time)
    {

    }

    on_key_down(event) {
        if (this.item.indexOf(event.key) < 0)
        {
            this.item.push(event.key);
        }
        else
        {
            event.preventDefault();
            return;
        }
        if (event.key == this.up)
        {
            this.pad_movement += 1;
            this.controller.interface({
                "player": this.player,
                "type": "movement",
                "movement": this.pad_movement,
                "position": this.controller.model.get_pad_position(
                    this.player, Date.now()),
            })
        }
        if (event.key == this.down)
        {
            this.pad_movement -= 1;
            this.controller.interface({
                "player": this.player,
                "type": "movement",
                "movement": this.pad_movement,
                "position": this.controller.model.get_pad_position(
                    this.player, Date.now()),
            })
        }
    }

    on_key_up(event) {
        let i = this.item.indexOf(event.key);
        if (i > -1)
            this.item.splice(i, 1);
        if (event.key == this.up)
        {
            this.pad_movement -= 1;
            this.controller.interface({
                "player": this.player,
                "type": "movement",
                "movement": this.pad_movement,
                "position": this.controller.model.get_pad_position(
                    this.player, Date.now()),
            })
        }
        if (event.key == this.down)
        {
            this.pad_movement += 1;
            this.controller.interface({
                "player": this.player,
                "type": "movement",
                "movement": this.pad_movement,
                "position": this.controller.model.get_pad_position(
                    this.player, Date.now()),
            })
        }
    }
}


export class CPU
{

    constructor(controller, player, error_rate)
    {
        this.controller = controller;
        this.controller.players[player] = this;
        this.player = player;
        this.pad_movement = 0;
        this.target = 0.5;
        this.error = error_rate;
    }

    receiver(message)
    {
        if (message["type"] == "ready")
        {
            this.controller.view.hide_waiting_screen();
            if (this.player == "home")
            {
                new Promise((resolve) => setTimeout(resolve, 5000)).then(
                    this.controller.on_start.bind(this.controller));
            }
        }
        let opponent = "guest";
        if (this.player == "guest")
        {
            opponent = "home";
        }
        let movement = 1;
        if (this.player == "guest")
        {
            movement = -1;
        }
        if (message["type"] == "hit" || message["type"] == "start"
            || message["type"] == "goal")
        {
            let current_position = this.controller.model.get_pad_y(
                this.player, Date.now());
            if (message["player"] == opponent
                || message["movement"] == movement)
            {
                this.target = this.controller.model.get_ball_y(1);
            }
            else
            {
                this.target = 0.5;
            }
            this.target += this.error * (Math.random() * this.controller.model.pad_height - this.controller.model.pad_height / 2);
            if (current_position < this.target)
            {
                this.pad_movement = 1;
            }
            if (current_position > this.target)
            {
                this.pad_movement = -1;
            }
            this.controller.interface({
                "player": this.player,
                "type": "movement",
                "movement": this.pad_movement,
                "position": -1,
            })
        }
    }

    on_loop()
    {
        let current_position = this.controller.model.get_pad_y(
            this.player, Date.now());
        if (Math.abs(current_position - this.target) < 0.01
            && this.pad_movement != 0)
        {
            this.pad_movement = 0;
            this.controller.interface({
                "player": this.player,
                "type": "movement",
                "movement": this.pad_movement,
                "position": -1,
            })
        }
    }
}
