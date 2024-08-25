
class WebSocketManager{

    constructor(){
        this.sockets = {};
    }

    update_sockets(){
        this.create_sockets();
        this.remove_sockets();
    }

    create_sockets(){
        var socket_elements = document.querySelectorAll('socket[group]');
        socket_elements.forEach(socket_element => {
            var group = socket_element.getAttribute("group");
            if (!this.sockets[group]){
                var url = ws_protocol + window.location.host + '/' + group + '/';
                this.sockets[group] = new WebSocket(url);
                if (socket_element.hasAttribute("onmessage")){
                    var callback = socket_element.getAttribute("onmessage");
                    this.sockets[group].onmessage = function (e){
                        window[callback](e);
                    }
                }
                if (socket_element.hasAttribute("autoreload"))
                {
                    get_request(window.location.href, "#wrapper", true, true);
                }
            }
        });
    }

    remove_sockets(){
        for (var group in this.sockets){
            var socket_elements = document.querySelectorAll(
                `socket[group="${group}"]`);
            if (socket_elements.length == 0){
                this.sockets[group].close();
                delete this.sockets[group];
            }
        }
    }
    
}

webSocketManager = new WebSocketManager();
