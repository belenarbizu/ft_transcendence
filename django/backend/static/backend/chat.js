
function chat_handler(event){
    const data = JSON.parse(event.data);
    if (data["type"] == "chat_message") {
        show_notification(data.message + '\n');
        try {
            const refresh_form = document.querySelector('#chat-refresh');
            submit_form(refresh_form);
        } catch { }
    }
    if (data["type"] == "online_status") {
        try {
            const refresh_form = document.querySelector('#chat-refresh');
            submit_form(refresh_form);
        } catch { }
    }
}
