

export class Controller
{

    constructor(model, view)
    {
        this.model = model;
        this.model.controller = this;
        this.view = view;
        this.home_pad_movement = 0;
        this.guest_pad_movement = 0;
        this.item = [];
        this.interface = this.receiver;
        document.addEventListener("keyup", this.on_key_up.bind(this));					
        document.addEventListener("keydown", this.on_key_down.bind(this));	
    }

    receiver(message)
    {
        if (message["type"] == "hit")
        {
            this.model.set_ball_movement(
                message["movement"], message["position"],
                message["last_height"], message["slope"]);
        }
        if (message["type"] == "movement")
        {
            this.model.set_pad_movement(
                message["player"], message["movement"], message["position"]);
        }
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
        if (event.key == "w")
        {
            this.guest_pad_movement += 1;
            this.interface({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement,
                "position": this.model.get_pad_position("guest", Date.now()),
            })
        }
        if (event.key == "s")
        {
            this.guest_pad_movement -= 1;
            this.interface({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement,
                "position": this.model.get_pad_position("guest", Date.now()),
            })
        }
        if (event.key == "o")
        {
            this.home_pad_movement += 1;
            this.interface({
                "player": "home",
                "type": "movement",
                "movement": this.home_pad_movement,
                "position": this.model.get_pad_position("home", Date.now()),
            })
        }
        if (event.key == "l")
        {
            this.home_pad_movement -= 1;
            this.interface({
                "player": "home",
                "type": "movement",
                "movement": this.home_pad_movement,
                "position": this.model.get_pad_position("home", Date.now()),
            })
        }
    }

    on_key_up(event) {
        let i = this.item.indexOf(event.key);
        if (i > -1)
            this.item.splice(i, 1);
        if (event.key == "w")
        {
            this.guest_pad_movement -= 1;
            this.interface({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement,
                "position": this.model.get_pad_position("guest", Date.now()),
            })
        }
        if (event.key == "s")
        {
            this.guest_pad_movement += 1;
            this.interface({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement,
                "position": this.model.get_pad_position("guest", Date.now()),
            })
        }
        if (event.key == "o")
        {
            this.home_pad_movement -= 1;
            this.interface({
                "player": "home",
                "type": "movement",
                "movement": this.home_pad_movement,
                "position": this.model.get_pad_position("home", Date.now()),
            })
        }
        if (event.key == "l")
        {
            this.home_pad_movement += 1;
            this.interface({
                "player": "home",
                "type": "movement",
                "movement": this.home_pad_movement,
                "position": this.model.get_pad_position("home", Date.now()),
            })
        }
    }

    on_hit()
    {
        this.interface({
            "player": "guest",
            "type": "hit",
            "movement": this.model.ball["movement"] * -1,
            "position": 0,
            "last_height": this.model.get_ball_y(1),
            "slope": (Math.random() - 0.5) * 4
        });
    }

    on_goal()
    {
        this.interface({
            "player": "guest",
            "type": "hit",
            "movement": this.model.ball["movement"] * -1,
            "position": 0.5,
            "last_height": this.model.get_ball_y(1),
            "slope": Math.random() * 2 - 1
        });
    }
}
