import { initPong } from "./main.js";
import { loginView } from "./login.js";
import { loggedinView } from "./loggedin.js";
import { playPongView } from "./play-pong.js";
import { pongView } from "./pong.js";
import { profileView } from "./profile.js";
import { chatView } from "./chat.js";

function homeView()
{
    return '<canvas id="canvasGame" style="background-color: black" height="400" width="640"></canvas>';
}

function handleSPAChange()
{
    const path = window.location.pathname;
    let view;

    document.getElementById('header').style.display = 'block';
    document.getElementById('signin-btn').style.display = 'inline-block';
    document.getElementById('col-end').style.display = 'none';

    switch (path) {
        case '/chat':
            view = chatView();
            break;
        case '/profile':
            view = profileView();
            break;
        case '/pong':
            view = pongView();
            break;
        case '/playpong':
            view = playPongView();
            break;
        case '/loggedin':
            view = loggedinView();
            break;
        case '/login':
            view = loginView();
            break;
        default:
            view = homeView();
    }
    
    document.getElementById('spa').innerHTML = view;

    document.querySelectorAll('.route').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const path = this.getAttribute('data-path');
            history.pushState(null, '', path);
            handleSPAChange();
        });
    });

    if (path === '/polls/' || path === '/pong') {
        initPong();
    }

    if (path === '/login') {
        document.getElementById('signin-btn').style.display = 'none';
    }

    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', function(event) {
            event.preventDefault();
            const modal = bootstrap.Modal.getInstance(document.getElementById('chooseRival'));
            if (modal) {
                modal.hide();
            }
            const path = this.getAttribute('data-path');
            history.pushState(null, '', path);
            handleSPAChange();
        });
    }
}

window.addEventListener('popstate', handleSPAChange);

handleSPAChange();