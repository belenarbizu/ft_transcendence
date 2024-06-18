import { initPong } from "./main.js";
import { signupView } from "./signup.js";
import { loginView } from "./login.js";
import { loggedinView } from "./loggedin.js";

function homeView()
{
    return '<canvas id="canvasGame" style="background-color: black" height="400" width="640"></canvas>';
}

function handleSPAChange()
{
    const path = window.location.pathname;
    let view;

    document.getElementById('signup-btn').style.display = 'inline-block';
    document.getElementById('signin-btn').style.display = 'inline-block';

    console.log(path);
    switch (path) {
        case '/loggedin':
            view = loggedinView();
            break;
        case '/login':
            view = loginView();
            break;
        case '/signup':
            view = signupView();
            break;
        default:
            view = homeView();
    }
    
    document.getElementById('spa').innerHTML = view;

    if (path === '/polls/' || path === '/loggedin') {
        initPong();
    }

    if (path === '/signup') {
        document.getElementById('signup-btn').style.display = 'none';
    }

    if (path === '/login') {
        document.getElementById('signin-btn').style.display = 'none';
    }

}

document.querySelectorAll('.route').forEach(button => {
    button.addEventListener('click', function() {
        const path = this.getAttribute('data-path');
        history.pushState(null, '', path);
        handleSPAChange();
    });
});

window.addEventListener('popstate', handleSPAChange);

handleSPAChange();