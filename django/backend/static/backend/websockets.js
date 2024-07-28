
const ws_protocol = "ws://";

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
                this.sockets[group] = new WebSocket(
                    ws_protocol + window.location.host + '/' + group + '/');
                if (socket_element.hasAttribute("onmessage")){
                    var callback = socket_element.getAttribute("onmessage");
                    this.sockets[group].onmessage = function (e){
                        window[callback](e);
                    }
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
