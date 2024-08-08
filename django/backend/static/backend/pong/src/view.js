

export class View
{

    constructor(model, controller)
    {
        this.model = model;
        this.controller = controller;
        this.start = document.getElementById("start");
        this.start.onclick = (o) => {this.controller.on_start();};

        this.ball = document.getElementById("ball");
        this.guest_pad_t = document.getElementById("guest-pad-t");
        this.guest_pad_c = document.getElementById("guest-pad-c");
        this.guest_pad_b = document.getElementById("guest-pad-b");
        this.home_pad_t = document.getElementById("home-pad-t");
        this.home_pad_c = document.getElementById("home-pad-c");
        this.home_pad_b = document.getElementById("home-pad-b");
        this.map = document.getElementById("map");
    }

    draw(current_time)
    {


        var positionInfo = this.map.getBoundingClientRect();
        var ballposInfo = this.ball.getBoundingClientRect();
        this.ball.style.left = this.model.get_ball_x(current_time)
            * positionInfo.width - ballposInfo.width / 2 + 'px';
        this.ball.style.top = (1 - this.model.get_ball_y(
            this.model.get_ball_position(current_time))) * positionInfo.height
            - ballposInfo.height / 2 + 'px';

        
        this.guest_pad_t.style.left = - ballposInfo.width / 2 + "px";
        this.guest_pad_c.style.left = - ballposInfo.width / 2 + 'px';
        this.guest_pad_b.style.left = - ballposInfo.width / 2 + 'px';
            
        this.guest_pad_t.style.top = (1 - this.model.get_pad_y(
            "guest", current_time) + this.model.pad_height / 2) * positionInfo.height
            - ballposInfo.height / 2 + 'px';
        this.guest_pad_c.style.top = (1 - this.model.get_pad_y(
            "guest", current_time)) * positionInfo.height
            - ballposInfo.height / 2 + 'px';
        this.guest_pad_b.style.top = (1 - this.model.get_pad_y(
            "guest", current_time) - this.model.pad_height / 2) * positionInfo.height
            - ballposInfo.height / 2 + 'px';
            
        this.home_pad_t.style.left = positionInfo.width - ballposInfo.width / 2 + "px";
        this.home_pad_c.style.left = positionInfo.width - ballposInfo.width / 2 + 'px';
        this.home_pad_b.style.left = positionInfo.width - ballposInfo.width / 2 + 'px';
        
        this.home_pad_t.style.top = (1 - this.model.get_pad_y(
            "home", current_time) + this.model.pad_height / 2) * positionInfo.height
            - ballposInfo.height / 2 + 'px';
        this.home_pad_c.style.top = (1 - this.model.get_pad_y(
            "home", current_time)) * positionInfo.height
            - ballposInfo.height / 2 + 'px';
        this.home_pad_b.style.top = (1 - this.model.get_pad_y(
            "home", current_time) - this.model.pad_height / 2) * positionInfo.height
            - ballposInfo.height / 2 + 'px';
    }
}
