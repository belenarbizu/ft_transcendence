
import { GameModel } from './model.js';
import { GameView } from './view.js';
import { LocalController } from './controller.js';


export class PiratesGame
{

    constructor(mode, url)
    {
        this.model = new GameModel(6, 6, [2, 3, 3, 4, 4], 1);
        this.view = new GameView(this.model);
        this.model.init();
        this.controller_home = new LocalController(this.model, this.view, 1);
        this.controller_guest = new LocalController(this.model, this.view, -1);
    }

    start()
    {
        //this.on_loop();
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

window.PiratesGame = PiratesGame;
