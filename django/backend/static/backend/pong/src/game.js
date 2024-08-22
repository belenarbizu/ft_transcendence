import { Model } from './model.js';
import { View } from './view.js';
import { View3D } from './3dview.js';
import { Controller, Human, CPU } from './controller.js';


export class PongGame
{

    constructor(mode, url)
    {
        this.model = new Model(
            0.001,  // Pad velocity
            0.0005, // Ball initial velocity
            0.15,   // Pad height
            5       // Win condition
        );
        this.view = new View3D(this.model);
        this.controller = new Controller(this.model, this.view, url);
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
            this.guest = new CPU(this.controller, "guest", 0);
        }
        if (mode == "2cpu")
        {
            this.home = new CPU(this.controller, "home", 0);
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
        if (this.view.worker != null)
        {
            this.view.worker.terminate();
        }
        this.controller.webSocket.close();
    }
}

window.PongGame = PongGame;
