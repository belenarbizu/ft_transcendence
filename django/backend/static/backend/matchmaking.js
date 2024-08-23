class MatchmakingSystem{

    constructor(){
        this.interval = null;
        this.value = 0;
    }

    update()
    {
        this.remove_matchmaking();
        this.create_matchmaking();
    }

    reload()
    {
        try{
            document.getElementById("matchmaking-range").value = this.value;
            this.value += 10;
            submit_form(document.getElementById("matchmaking-form"));
        } catch {}
    }

    create_matchmaking(){
        var socket_elements = document.querySelectorAll(
            '[group="ws/matchmaking"]');
        if (socket_elements.length != 0 && this.interval == null)
        {
            this.interval = setInterval(
                this.reload.bind(this),
                1000
            );
        }
    }

    remove_matchmaking(){
        for (var group in this.games){
            var sockets = document.querySelectorAll('[group="ws/matchmaking"]');
            if (sockets.length == 0 && this.interval != null){
                clearInterval(this.interval);
                this.interval = null;
                this.value = 0;
                console.log(this.value);
            }
        }
    }
    
}

matchmakingSystem = new MatchmakingSystem();
