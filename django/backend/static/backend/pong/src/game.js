import { Model } from './model.js';
import { View } from './view.js';
import { Controller, Human, CPU } from './controller.js';


export class PongGame
{

    constructor(mode, url)
    {
        this.model = new Model(
            0.001,  // Pad velocity
            0.0005, // Ball initial velocity
            0.15    // Pad height
        );
        this.controller = new Controller(this.model, url);
        this.view = new View(this.model, this.controller);

        if (mode == "home" || mode == "local" || mode == "cpu")
        {
            this.home = new Human(this.controller, "home", "o", "l");
        }
        if (mode == "guest" || mode == "local")
        {
            this.guest = new Human(this.controller, "guest", "w", "s");
        }
        if (mode == "cpu" || mode == "2cpu")
        {
            this.guest = new CPU(this.controller, "guest");
        }
        if (mode == "2cpu")
        {
            this.home = new CPU(this.controller, "home");
        }
    }

    start()
    {
        this.on_loop();
    }

    on_loop()
    {
        this.controller.on_loop();
        this.view.draw(Date.now());
        window.requestAnimationFrame(this.on_loop.bind(this));
    }

    disconnect()
    {
        this.controller.webSocket.close();
    }
}

window.PongGame = PongGame;
