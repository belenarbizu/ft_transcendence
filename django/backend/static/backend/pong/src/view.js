

export class View
{

    constructor(model)
    {
        this.model = model;

        this.home_pad = document.getElementById("home-pad");
        this.guest_pad = document.getElementById("guest-pad");
    }

    draw(current_time)
    {
        this.home_pad.value = this.model.get_home_pad_position(current_time);
        this.guest_pad.value = this.model.get_guest_pad_position(current_time);
    }
}
