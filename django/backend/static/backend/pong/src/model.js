

export class Model
{

    constructor(pad_velocity, ball_velocity, pad_height)
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
        };
        this.ball = {
            "movement": 1,
            "last_position": 0.5,
            "last_change": Date.now(),
            "last_height": 0.5,
            "slope": 2,
            "velocity": 0,
        };
        this.scores = {
            "home": 0,
            "guest": 0,
        };
        this.pad_velocity = pad_velocity;
        this.pad_height = pad_height;
        this.ball_initial_velocity = ball_velocity;
        this.pad_fantasy = 0.02;
        this.turns = 0;
        this.goal = false;
        this.hit = false;
        this.goal_position = 1.1;
    }

    set_pad_movement(player, movement, position)
    {
        if (position == -1)
        {
            this.pads[player]["last_position"] = this.get_pad_position(
                player, Date.now());
        }
        else
        {
            this.pads[player]["last_position"] = position;
        }
        var current_time = Date.now();
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

    get_pad_y(player, current_time)
    {
        return (1 - this.pad_height) 
            * this.get_pad_position(player, current_time)
            + this.pad_height / 2;
    }

    set_ball_movement(movement, position, last_height, slope, velocity)
    {
        this.ball["movement"] = movement;
        this.ball["last_position"] = position;
        this.ball["last_height"] = last_height;
        this.ball["slope"] = slope;
        this.ball["last_change"] = Date.now();
        this.ball["velocity"] = velocity;
        this.goal = false;
        this.hit = false;
        this.turns += 1;
    }

    get_ball_position(current_time)
    {
        var elapsed_time = current_time - this.ball["last_change"];
        var displacement = this.ball["velocity"] * elapsed_time;
        var position = this.ball["last_position"] + displacement;
        if (position > 1 && !this.goal && !this.hit)
        {
            if (this.check_hit(current_time))
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
            this.hit = true;
        }
        return (position);
    }

    get_new_slope()
    {
        return ((Math.random() - 0.5) * 2);
    }

    score(player)
    {
        this.scores[player] += 1;
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
        let mov = 1 - this.ball["last_height"] - this.ball["slope"]
            * (ball_x - this.ball["last_position"]);
        let floor = Math.floor(mov);
        let res = 2 * (floor / 2 - Math.floor(floor / 2));
        let par = res * 2 - 1;
        return (par * (mov - Math.floor(mov)) + (par == -1 ? 1 : 0));
    }

    get_ball_velocity()
    {
        return (this.ball["velocity"] + 0.00001);
    }

    check_hit(current_time)
    {
        let player = "guest";
        if (this.ball["movement"] == 1)
        {
            player = "home";
        }
        let pad_y = this.get_pad_y(player, current_time);
        let ball_y = this.get_ball_y(1);
        return (Math.abs(pad_y - ball_y) - this.pad_fantasy < this.pad_height / 2);
    }
}
