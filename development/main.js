
import { Model } from './src/model.js';
import { View } from './src/view.js';
import { Controller } from './src/controller.js';


let model = new Model();
let view = new View(model);
let controller = new Controller(model, view);

while (true)
{
    view.draw(Date.now());
}
