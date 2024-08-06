

export class Model
{

    constructor()
    {
        this.home_pad_movement = 0;
        this.guest_pad_movement = 0;
        this.home_pad_last_position = 0.5;
        this.guest_pad_last_position = 0.5;
        this.pad_velocity = 0.002;
        this.home_pad_last_change = Date.now();
        this.guest_pad_last_change = Date.now();
    }

    set_home_movement(movement)
    {
        var current_time = Date.now();
        this.home_pad_last_position = this.get_home_pad_position(current_time);
        this.home_pad_last_change = current_time;
        this.home_pad_movement = movement;
    }

    set_guest_movement(movement)
    {
        var current_time = Date.now();
        this.guest_pad_last_position = this.get_guest_pad_position(current_time);
        this.guest_pad_last_change = current_time;
        this.guest_pad_movement = movement;
    }

    get_home_pad_position(current_time)
    {
        var elapsed_time = current_time - this.home_pad_last_change;
        var displacement = this.home_pad_movement * this.pad_velocity * elapsed_time;
        var position = this.home_pad_last_position + displacement;
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

    get_guest_pad_position(current_time)
    {
        var elapsed_time = current_time - this.guest_pad_last_change;
        var displacement = this.guest_pad_movement * this.pad_velocity * elapsed_time;
        var position = this.guest_pad_last_position + displacement;
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
}
