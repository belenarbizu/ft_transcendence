
function live_handler(event){
    const data = JSON.parse(event.data);
    if (data["action"] == "form_update") {
        try {
            const refresh_form = document.querySelector(data["target"]);
            submit_form(refresh_form);
        } catch { }
    }
    if (data["action"] == "page_reload") {
        get_request(window.location.href, "#wrapper", true, true);
    }
    if (data["action"] == "notification") {
        show_notification(data["message"] + '\n');
    }
}
