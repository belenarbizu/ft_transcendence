
import { Model } from './src/model.js';
import { View } from './src/view.js';
import { Controller, Human, CPU } from './src/controller.js';


let model = new Model(
    0.001, // Pad velocity
    0.0005, // Ball initial velocity
    0.15 // Pad height
);
let controller = new Controller(model);
let view = new View(model, controller);
//let home = new Human(controller, "home", "o", "l");
//let guest = new Human(controller, "guest", "w", "s");
let home = new CPU(controller, "home");
let guest = new CPU(controller, "guest");

function    loop(time)
{
    controller.on_loop();
    view.draw(Date.now());
    window.requestAnimationFrame(loop);
}

loop();