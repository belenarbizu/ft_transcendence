import { show_notification, submit_form } from "./spa.js";

var chatSocket;


function connect_to_user_websocket() {
    try {
        const user_id = document.getElementById('user_id').value;
        console.log(user_id);
        chatSocket = new WebSocket(
            'ws://' + window.location.host + '/ws/user/' + user_id + '/');
        show_notification("Hola mundo");
        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            show_notification(data.message + '\n');
            try {
                const chat_refresh_form = document.querySelector('#chat-refresh');
                submit_form(chat_refresh_form);
            } catch { }
        };
    }
    catch { }
}

connect_to_user_websocket();
