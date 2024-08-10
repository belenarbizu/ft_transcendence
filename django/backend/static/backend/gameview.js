

export class GameView
{

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
