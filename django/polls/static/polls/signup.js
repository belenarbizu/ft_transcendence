export function signupView()
{
    return `
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
                <button class="btn btn-image w-100 py-2 route" type="button" id="profile-btn" data-path="/login">Sign up</button>
            </form>
        </main>
    `;
}