export function loggedinView()
{
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('signin-btn').style.display = 'none';
    document.getElementById('col-end').innerHTML = `<div class="row">
              <div class="col">
                  <div class="dropdown">
                      <button id="dropdownMenu" type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false">name</button>
                      <ul class="dropdown-menu" aria-labelledby="dropdownMenu">
                          <li><a class="dropdown-item" href="#" id="viewProfile">View profile</a></li>
                          <li><a class="dropdown-item" href="#" id="editProfile">Edit profile</a></li>
                          <li><a class="dropdown-item" href="#">Log out</a></li>
                      </ul>
                  </div>
              </div>
              <div class="col">
                  <img src="icon.png" class="img-fluid" style="max-height: 45px; margin-top: -3px;">
              </div>
            </div>`;
    return `<canvas id="canvasGame" style="background-color: black" height="400" width="640"></canvas>`;
}