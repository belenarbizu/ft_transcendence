

var controller_instance;

export class Controller
{

    constructor(model, view)
    {
        this.model = model;
        this.view = view;
        this.home_pad_movement = 0;
        this.guest_pad_movement = 0;
        controller_instance = this;
        this.socket = new WebSocket(
            "ws://localhost:8000/"
        )
        this.item = [];
        document.addEventListener("keyup", this.onKeyUp.bind(this));					
        document.addEventListener("keydown", this.onKeyDown.bind(this));	
    }

    onMessage(message)
    {
        if (message["player"] == "home")
        {
            if (message["type"] == "movement")
            {
                this.model.set_home_movement(message["movement"]);
            }
        }
        else if (message["player"] == "guest")
        {
            if (message["type"] == "movement")
            {
                this.model.set_guest_movement(message["movement"]);
            }
        }
    }

    onKeyDown(event) {
        if (this.item.indexOf(event.key) < 0)
        {
            this.item.push(event.key);
        }
        else
        {
            event.preventDefault();
            return;
        }
        console.log("KEW DOWN");
        if (event.key == "w")
        {
            this.guest_pad_movement += 1;
            this.onMessage({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement
            })
        }
        if (event.key == "s")
        {
            this.guest_pad_movement -= 1;
            this.onMessage({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement
            })
        }
    }

    onKeyUp(event) {
        let i = this.item.indexOf(event.key);
        if (i > -1)
            this.item.splice(i, 1);
        console.log("KEW UP");
        if (event.key == "w")
        {
            this.guest_pad_movement -= 1;
            this.onMessage({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement
            })
        }
        if (event.key == "s")
        {
            this.guest_pad_movement += 1;
            this.onMessage({
                "player": "guest",
                "type": "movement",
                "movement": this.guest_pad_movement
            })
        }
    }
}
