export function loggedinView()
{
    document.getElementById('signup-btn').style.display = 'none';
    document.getElementById('signin-btn').style.display = 'none';
    document.getElementById('col-end').style.display = 'block';
    return `<canvas id="canvasGame" style="background-color: black" height="400" width="640"></canvas>
        <div class="modal modal-sheet" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-3">
            <div class="modal-header">
              <h5 class="modal-title" id="editProfileModalLabel">Edit Profile</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="form-group">
                  <input type="text" class="form-control" id="inputName" placeholder="New user name">
                  <input type="file" class="form-control-file mt-3">
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-danger mt-4 mx-3" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                  <button type="submit" class="btn btn-primary mt-4">Update profile</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;
}