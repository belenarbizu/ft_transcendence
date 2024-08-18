
import { Model } from './newmodel.js';
import { View } from './view.js';
import { Controller, Human, CPU } from './controller.js';


export class PiratesGame
{

    constructor(mode, url)
    {
        this.model = new Model();
        this.view = new View(this.model);
        this.mode = mode;
        this.controller = new Controller(this.model, this.view, url, mode);
        if (mode == "local" || mode == "home" || mode == "cpu")
        {
            this.home = new CPU(this.controller, "home");
        }
        if (mode == "local" || mode == "guest")
        {
            this.guest = new CPU(this.controller, "guest");
        }
    }

    start()
    {
        //this.on_loop();
    }

    on_loop()
    {
        this.view.draw(Date.now());
        window.requestAnimationFrame(this.on_loop.bind(this));
    }

    disconnect()
    {
        this.controller.webSocket.close();
    }
}

window.PiratesGame = PiratesGame;
