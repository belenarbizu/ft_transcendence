

export class Model
{

    constructor()
    {
        this.pads = {
            "home": {
                "movement": 0,
                "last_position": 0.5,
                "last_change": Date.now()
            },
            "guest": {
                "movement": 0,
                "last_position": 0.5,
                "last_change": Date.now()
            }
        }
        this.ball = {
            "movement": 1,
            "last_position": 0.5,
            "last_change": Date.now(),
            "last_height": 0.5,
            "slope": 2
        }

        this.pad_velocity = 0.001;
        this.ball_last_position = 0.5;
        this.ball_velocity = 0.001;
        this.ball_last_change = Date.now();
        this.ball_movement = 1;
        this.goal = false;
        this.hit = false;
        this.goal_position = 1.5;
    }

    set_pad_movement(player, movement, position)
    {
        var current_time = Date.now();
        this.pads[player]["last_position"] = position;
        this.pads[player]["last_change"] = current_time;
        this.pads[player]["movement"] = movement;
    }

    get_pad_position(player, current_time)
    {
        var elapsed_time = current_time - this.pads[player]["last_change"];
        var displacement = this.pads[player]["movement"]
            * this.pad_velocity * elapsed_time;
        var position = this.pads[player]["last_position"] + displacement;
        if (position < 0)
        {
            return (0);
        }
        if (position > 1)
        {
            return (1);
        }
        return (position);
    }

    set_ball_movement(movement, position, last_height, slope)
    {
        this.ball["movement"] = movement;
        this.ball["last_position"] = position;
        this.ball["last_height"] = last_height;
        this.ball["slope"] = slope;
        this.ball["last_change"] = Date.now();
        this.goal = false;
        this.hit = false;
    }

    get_ball_position(current_time)
    {
        var elapsed_time = current_time - this.ball["last_change"];
        var displacement = this.ball_velocity * elapsed_time;
        var position = this.ball["last_position"] + displacement;
        if (position > 1 && !this.goal && !this.hit)
        {
            if (this.check_hit(current_time,
                0))
            {
                this.hit = true;
                this.controller.on_hit();
            }
            else
            {
                this.goal = true;
            }
        }
        if (position > this.goal_position && this.goal)
        {
            this.controller.on_goal();
            this.goal = false;
        }
        return (position);
    }

    get_ball_x(current_time)
    {
        if (this.ball["movement"] == 1)
        {
            return this.get_ball_position(current_time);
        }
        else if (this.ball["movement"] == -1)
        {
            return 1 - this.get_ball_position(current_time);
        }
    }

    get_ball_y(ball_x)
    {
        let mov = 1 - this.ball["last_height"] - this.ball["slope"] * ball_x;
        let floor = Math.floor(mov);
        let res = 2 * (floor / 2 - Math.floor(floor / 2));
        let par = res * 2 - 1;
        return (par * (mov - Math.floor(mov)) + (par == -1 ? 1 : 0));
    }

    check_hit(current_time, position)
    {
        return true;
    }
}
