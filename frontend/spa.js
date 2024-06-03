function homeView() {
    return '<h1>ft_transcendence</h1>';
}

function signupView() {
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
            <button type="button" class="btn btn-dark w-100 my-2 login">Login with 42</button>
        </main>
    `;
}

function handleSPAChange() {
    const path = window.location.pathname;
    let view;

    switch (path) {
        case '/signup':
            view = signupView();
            break;
        default:
            view = homeView();
    }
    
    document.getElementById('spa').innerHTML = view;
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