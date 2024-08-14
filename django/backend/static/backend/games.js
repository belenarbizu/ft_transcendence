

class GameManager{

    constructor(){
        this.games = {};
        import("./pong/src/game.js").then(
            this.set_pong_loaded.bind(this)
        )
        import ("./pirates/src/game.js").then(
            this.set_pirates_loaded.bind(this)
        )
        this.pong_loaded = false;
        this.pirates_loaded = false;
    }

    set_pong_loaded()
    {
        this.pong_loaded = true;
        this.update_games();
    }

    set_pirates_loaded()
    {
        this.pirates_loaded = true;
        this.update_games();
    }

    update_games(){
        this.create_games();
        this.remove_games();
    }

    create_games(){
        if (!this.pong_loaded)
        {
            return;
        }
        var socket_elements = document.querySelectorAll('game[group]');
        socket_elements.forEach(socket_element => {
            var group = socket_element.getAttribute("group");
            var url = ws_protocol + window.location.host + '/' + group + '/';
            var type = socket_element.getAttribute("type");
            var mode = socket_element.getAttribute("mode");
            if (!this.games[group]){
                if (type == "po" && this.pong_loaded)
                {
                    this.games[group] = new PongGame(mode, url);
                    this.games[group].start();
                }
                if (type == "pr" && this.pirates_loaded)
                {
                    this.games[group] = new PiratesGame(mode, url);
                    this.games[group].start();
                }
            }
        });
    }

    remove_games(){
        for (var group in this.games){
            var game = document.querySelectorAll(
                `game[group="${group}"]`);
            if (game.length == 0){
                this.games[group].disconnect();
                delete this.games[group];
            }
        }
    }
    
}

gameManager = new GameManager();
