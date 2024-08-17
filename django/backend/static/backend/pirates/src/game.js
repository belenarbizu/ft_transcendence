
import { Model } from './newmodel.js';
import { GameView } from './view.js';
import { Controller, Human } from './controller.js';


export class PiratesGame
{

    constructor(mode, url)
    {
        this.model = new Model();
        this.view = new GameView(this.model);
        this.controller = new Controller(this.model, this.view, url);
        this.home = new Human(this.controller, "home");
        this.guest = new Human(this.controller, "guest");
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
