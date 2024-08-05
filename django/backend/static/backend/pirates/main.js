
import { GameModel } from './src/model.js';
import { GameView } from './src/view.js';
import { LocalController } from './src/controller.js';


let model = new GameModel(6, 6, [2, 3, 3, 4, 4], 1);
let view = new GameView(model);
model.init();
let controller_home = new LocalController(model, view, 1);
let controller_guest = new LocalController(model, view, -1);

