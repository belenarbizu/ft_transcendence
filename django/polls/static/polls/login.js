export function loginView()
{
    return `
        <div class="row justify-content-evenly">
            <div class="col">
                <main class="form-signin w-100 m-auto">
                    <form>
                        <div class="form-floating mb-2">
                            <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
                            <label for="floatingInput">Email address</label>
                        </div>
                        <div class="form-floating mb-2">
                            <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
                            <label for="floatingPassword">Password</label>
                        </div>
                        <!--type tiene que ser button en vez de submit para que vaya a la siguiente pagina-->
                        <button class="btn btn-image w-100 py-2 route" type="button" id="profile-btn" data-path="/loggedin">Sign in</button>
                    </form>
                    <div class="d-flex justify-content-center py-2">
                        <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a5d66ac08de2c71e04180f8d4e281f2b6064474bea92d7595427e42ba870b5e4&redirect_uri=https%3A%2F%2Flocalhost%3A1025%2Floggedin&response_type=code" class="fw-bold">Login with 42</a>
                    </div>
                </main>
            </div>
            <div class="col">
                <main class="form-signin w-100 m-auto">
                    <form>
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
                        <!--tiene que mostrar un mensaje para que haga sign in despues de hacer sign up-->
                        <button class="btn btn-image w-100 py-2 route" type="button" id="profile-btn" data-path="/login">Sign up</button>
                    </form>
                </main>
            </div>
        </div>
    `;
}