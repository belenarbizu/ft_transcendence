
import * as THREE from 'three';

export class GameView extends THREE.EventDispatcher
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
        if (player == "guest")
        {
            document.getElementById("home-info").classList.remove("player-turn");
            document.getElementById("guest-info").classList.add("player-turn");
        }
        else if (player == "home")
        {
            document.getElementById("home-info").classList.add("player-turn");
            document.getElementById("guest-info").classList.remove("player-turn");
        }
        else
        {
            document.getElementById("home-info").classList.remove("player-turn");
            document.getElementById("guest-info").classList.remove("player-turn");
        }
    }

    hide_waiting_screen()
    {
        document.getElementById("waiting-screen").style.display = "none";
    }
}
