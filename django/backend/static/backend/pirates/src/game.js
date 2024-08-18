import { Model } from './model.js';
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
            this.home = new Human(this.controller, "home");
        }
        if (mode == "local" || mode == "guest")
        {
            this.guest = new Human(this.controller, "guest");
        }
        if (mode == "cpu")
        {
            this.guest = new CPU(this.controller, "guest");
        }
    }

    start()
    { }

    disconnect()
    {
        this.controller.webSocket.close();
        this.view.end();
    }
}

window.PiratesGame = PiratesGame;
