export { connect_to_user_websocket };
import { show_notification, submit_form } from "./spa.js";

var chatSocket = null;

var ws_protocol = 'ws://';

function connect_to_user_websocket() {
    try {
        if (chatSocket == null) {
            const user_id = document.getElementById('user_id').value;
            chatSocket = new WebSocket(
                ws_protocol + window.location.host + '/ws/user/' + user_id + '/');
            chatSocket.onmessage = function (e) {
                const data = JSON.parse(e.data);
                if (data["type"] == "chat_message") {
                    show_notification(data.message + '\n');
                    try {
                        const refresh_form = document.querySelector('#chat-refresh');
                        submit_form(refresh_form);
                    } catch { }
                }
                if (data["type"] == "form_update"){
                    try {
                        const refresh_form = document.querySelector(data["target"]);
                        submit_form(refresh_form);
                    } catch { }
                }
            };
            chatSocket.onclose = function (e) {
                chatSocket = null;
            };
        }
    }
    catch { }
}

connect_to_user_websocket();
