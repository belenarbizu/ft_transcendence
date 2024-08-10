

export class View
{

    constructor(model)
    {
        this.model = model;

        this.container = document.getElementById("threejs-container")
        this.container.innerHTML = `
            <div class="card-body m-0 p-0" style="background-color:blanchedalmond">
                <span class="h1 p-0 m-0" style="color:green; position:absolute;" id="ball">·</span>
                <span class="h1 p-0 m-0" style="color:red; position:absolute; left:0px;" id="guest-pad-t">·</span>
                <span class="h1 p-0 m-0" style="color:black; position:absolute; left:0px;" id="guest-pad-c">·</span>
                <span class="h1 p-0 m-0" style="color:red; position:absolute; left:0px;" id="guest-pad-b">·</span>
                <span class="h1 p-0 m-0" style="color:red; position:absolute; left:0px;" id="home-pad-t">·</span>
                <span class="h1 p-0 m-0" style="color:black; position:absolute; left:0px;" id="home-pad-c">·</span>
                <span class="h1 p-0 m-0" style="color:red; position:absolute; left:0px;" id="home-pad-b">·</span>
            </div>`

        this.ball = document.getElementById("ball");
        this.guest_pad_t = document.getElementById("guest-pad-t");
        this.guest_pad_c = document.getElementById("guest-pad-c");
        this.guest_pad_b = document.getElementById("guest-pad-b");
        this.home_pad_t = document.getElementById("home-pad-t");
        this.home_pad_c = document.getElementById("home-pad-c");
        this.home_pad_b = document.getElementById("home-pad-b");
        this.home_score = document.getElementById("home-score");
        this.guest_score = document.getElementById("guest-score");
        this.home_info = document.getElementById("home-info");
        this.guest_info = document.getElementById("guest-info");
    }

    draw(current_time)
    {
        var positionInfo = this.container.getBoundingClientRect();
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

    update_labels()
    {
        this.set_scores(this.model.scores["home"], this.model.scores["guest"]);

        if (this.model.ball["movement"] == -1)
        {
            this.set_turn("guest");
        }
        if (this.model.ball["movement"] == 1)
        {
            this.set_turn("home");
        }

        var winner = this.model.has_winner();
        if (winner != false)
        {
            this.set_winner(winner);
        }
    }

    set_winner(player)
    {
        document.getElementById(player).style.display = "block";
    }

    set_scores(home, guest)
    {
        document.getElementById("home-score").innerHTML = home;
        document.getElementById("guest-score").innerHTML = guest;
    }

    set_turn(player)
    {
        if (player == "home")
        {
            document.getElementById("home-info").classList.remove("text-muted");
            document.getElementById("guest-info").classList.add("text-muted");
        }
        if (player == "guest")
        {
            document.getElementById("home-info").classList.add("text-muted");
            document.getElementById("guest-info").classList.remove("text-muted");
        }
        if (player == "no-player")
        {
            document.getElementById("home-info").classList.remove("text-muted");
            document.getElementById("guest-info").classList.remove("text-muted");
        }
    }

    hide_waiting_screen()
    {
        document.getElementById("waiting-screen").style.display = "none";
    }
}
