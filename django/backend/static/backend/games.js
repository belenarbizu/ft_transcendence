

class GameManager{

    constructor(){
        this.games = {};
    }

    update_games(){
        this.create_games();
        this.remove_games();
    }

    create_games(){
        var socket_elements = document.querySelectorAll('game[group]');
        socket_elements.forEach(socket_element => {
            var group = socket_element.getAttribute("group");
            var url = ws_protocol + window.location.host + '/' + group + '/';
            var type = socket_element.getAttribute("type");
            var mode = socket_element.getAttribute("mode");
            if (!this.games[group]){

                if (type == "pong")
                {
                    this.games[group] = new PongGame(mode, url);
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
                delete this.games[group];
            }
        }
    }
    
}

gameManager = new GameManager();
