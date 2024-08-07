

export class View
{

    constructor(model)
    {
        this.model = model;

        this.home_pad = document.getElementById("home-pad");
        this.guest_pad = document.getElementById("guest-pad");
        this.ball_x = document.getElementById("ball-x");
        this.ball_y = document.getElementById("ball-y");
        this.last_hit = document.getElementById("last-hit");
        this.slope = document.getElementById("slope");
        this.ball_movement = document.getElementById("ball-movement");
    }

    draw(current_time)
    {
        this.home_pad.value = this.model.get_pad_position("home", current_time);
        this.guest_pad.value = this.model.get_pad_position("guest", current_time);
        this.ball_x.value = this.model.get_ball_x(current_time);
        this.ball_y.value = this.model.get_ball_y(this.model.get_ball_x(current_time));
        this.last_hit.value = this.model.ball["last_height"];
        this.slope.value = this.model.ball["slope"];
        this.ball_movement.value = this.model.ball["movement"];
    }
}
