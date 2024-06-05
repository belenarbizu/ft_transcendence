function homeView()
{
    return '<h1>ft_transcendence</h1>';
}

function signupView()
{
    return `
        <main class="form-signin w-100 m-auto">
            <form>
                <h2 class="mb-3">Please sign up</h2>
                <div class="form-floating mb-2">
                    <input type="name" class="form-control" id="floatingName" placeholder="Name">
                    <label for="floatingInput">Name</label>
                </div>
                <div class="form-floating mb-2">
                    <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
                    <label for="floatingInput">Email address</label>
                </div>
                <div class="form-floating mb-2">
                    <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
                    <label for="floatingPassword">Password</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="floatingConfirmPassword" placeholder="Confirm Password">
                    <label for="floatingPassword">Confirm Password</label>
                </div>
                <!--type tiene que ser button en vez de submit para que vaya a la siguiente pagina-->
                <button class="btn btn-primary w-100 py-2" type="button" id="profile-btn">Sign up</button>
            </form>
            <button type="button" class="btn btn-dark w-100 my-2 login route" data-path="/login">Sign in</button>
        </main>
    `;
}

function loginView()
{
    return `
    <main class="form-signin w-100 m-auto">
        <form>
            <h2 class="mb-3">Please sign in</h2>
            <div class="form-floating mb-2">
                <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
                <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating mb-2">
                <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
                <label for="floatingPassword">Password</label>
            </div>
            <!--type tiene que ser button en vez de submit para que vaya a la siguiente pagina-->
            <button class="btn btn-primary w-100 py-2" type="button" id="profile-btn">Sign in</button>
        </form>
        <div class="d-flex justify-content-center py-2">
            <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a5d66ac08de2c71e04180f8d4e281f2b6064474bea92d7595427e42ba870b5e4&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Floggedin.html&response_type=code" class="fw-bold">Login with 42</a>
        </div>
    </main>
    `;
}

function handleSPAChange()
{
    const path = window.location.pathname;
    let view;

    document.getElementById('signup-btn').style.display = 'inline-block';
    document.getElementById('login-btn').style.display = 'inline-block';

    switch (path) {
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