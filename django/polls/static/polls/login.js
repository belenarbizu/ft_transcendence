export function loginView()
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
            <button class="btn btn-primary w-100 py-2 route" type="button" id="profile-btn" data-path="/loggedin">Sign in</button>
        </form>
        <div class="d-flex justify-content-center py-2">
            <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a5d66ac08de2c71e04180f8d4e281f2b6064474bea92d7595427e42ba870b5e4&redirect_uri=https%3A%2F%2Flocalhost%3A1025%2Floggedin&response_type=code" class="fw-bold">Login with 42</a>
        </div>
    </main>
    `;
}