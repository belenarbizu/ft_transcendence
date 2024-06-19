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
    document.getElementById('col-end').style.display = 'none';

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

    document.querySelectorAll('.route').forEach(button => {
        button.addEventListener('click', function() {
            const path = this.getAttribute('data-path');
            history.pushState(null, '', path);
            handleSPAChange();
        });
    });    

    if (path === '/loggedin') {
        var editProfileBtn = document.getElementById('editProfile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                var modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
                modal.show();
            });
        }
        initPong();
    }

    if (path === '/polls/') {
        initPong();
    }

    if (path === '/signup') {
        document.getElementById('signup-btn').style.display = 'none';
    }

    if (path === '/login') {
        document.getElementById('signin-btn').style.display = 'none';
    }

}

window.addEventListener('popstate', handleSPAChange);

handleSPAChange();