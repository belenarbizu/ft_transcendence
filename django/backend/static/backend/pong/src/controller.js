

export class Controller
{

    constructor(model)
    {
        this.model = model;
        this.model.controller = this;
        this.players = {
            "home": null,
            "guest": null
        };
        this.item = [];
        this.interface = this.receiver;
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
                "slope": (Math.random() - 0.5) * 2,
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
                "slope": (Math.random() - 0.5) * 2,
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
                "type": "hit",
                "movement": this.model.ball["movement"] * -1,
                "position": 0.5,
                "last_height": 0.5,
                "slope": (Math.random() - 0.5) * 2,
                "velocity": this.model.ball_initial_velocity
            });
        }
        else
        {
            this.interface({
                "player": "guest",
                "type": "hit",
                "movement": this.model.ball["movement"] * -1,
                "position": 0.5,
                "last_height": 0.5,
                "slope": (Math.random() - 0.5) * 2,
                "velocity": this.model.ball_initial_velocity
            });
        }
    }

    on_start()
    {
        this.interface({
            "type": "hit",
            "movement": this.model.ball["movement"] * -1,
            "position": 0.5,
            "last_height": 0.5,
            "slope": (Math.random() - 0.5) * 2,
            "velocity": this.model.ball_initial_velocity
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

    constructor(controller, player)
    {
        this.controller = controller;
        this.controller.players[player] = this;
        this.player = player;
        this.pad_movement = 0;
        this.target = 0.5;
    }

    receiver(message)
    {
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
        if (message["type"] == "hit" || message["type"] == "start")
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
            if (current_position < this.target)
            {
                this.pad_movement = 1;
            }
            if (current_position > this.target)
            {
                this.pad_movement = -1;
            }
            console.log("Current", current_position);
            console.log("Target", this.target);
            console.log("Movement", this.pad_movement);
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
