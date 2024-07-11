export function profileView() {
    document.getElementById('signin-btn').style.display = 'none';
    document.getElementById('col-end').style.display = 'block';
    return `
    <div class="container">
      <div class="row">
        <div class="col">
          <div class="container py-5">
            <div class="row d-flex justify-content-center align-items-center">
              <div class="col-lg-12 mb-4 mb-lg-0">
                <div class="card" style="border-radius: .5rem;">
                  <div class="row g-0">
                    <div class="col-md-4 gradient-custom text-center" style="border-top-left-radius: .5rem; border-bottom-left-radius: .5rem;">
                      <h3 class="mt-3">Name</h3>
                      <img src="images/icon.png" class="img-fluid my-4" style="width: 120px;">
                    </div>
                    <div class="col-md-4">
                      <div class="card-body p-4">
                        <div class="row mt-2">
                          <h3>
                            Wins
                            <span class="p-4" style="color: rgb(223, 41, 255); font-size: 28px; font-weight: bold;">15</span>
                          </h3>
                        </div>
                        <div class="row">
                          <h3 class="mt-2">
                            Losses
                            <span class="p-4" style="color: rgb(94, 158, 255); font-size: 28px; font-weight: bold;">3</span>
                          </h3>
                        </div>
                        <div class="row">
                          <div class="d-flex align-items-center">
                            <h3 class="me-3 mt-2">Win Rate</h3>
                            <div class="progress mt-2" style="width:200px;">
                              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="background-color: rgb(158, 99, 240);" id="winRate" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="row">
                        <button type="button" class="btn btn-image w-75 mb-2 mt-3" data-bs-toggle="modal" data-bs-target="#chooseRival">EDIT PROFILE</button>
                      </div>
                      <div class="row">
                        <button type="button" class="btn btn-image w-75 mb-2" data-bs-toggle="modal" data-bs-target="#chooseRival">PLAY</button>
                      </div>
                      <div class="row">
                        <button type="button" class="btn btn-image w-75 mb-2" data-bs-toggle="modal" data-bs-target="#exampleModalInvite">CREATE A TOURNAMENT</button>
                      </div>
                      <div class="row">
                        <button type="button" class="btn btn-image w-75 route" data-path="/chat">CHAT ROOM</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="container py-5">
            <div class="row d-flex justify-content-center align-items-center">
              <div class="col-lg-12 mb-4 mb-lg-0">
                <div class="card" style="border-radius: .5rem; background-color: rgb(158, 99, 240);">
                  <h4 class="p-3">Match History</h4>
                  <div class="container text-start mt-1">
                    <div class="row align-items-start">
                      <div class="col">
                        <p style="font-style: oblique;">Oponent</p>
                        <p>@srogmro</p>
                        <p>@otgtgr</p>
                        <p>@ffrf</p>
                      </div>
                      <div class="col">
                        <p style="font-style: oblique;">Date</p>
                        <p>01-01-2000</p>
                        <p>01-01-2000</p>
                        <p>01-01-2000</p>
                      </div>
                      <div class="col">
                        <p style="font-style: oblique;">Result</p>
                        <p>Win</p>
                        <p>Lose</p>
                        <p>Win</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="container py-5">
            <div class="row d-flex justify-content-center align-items-center">
              <div class="col-lg-12 mb-4 mb-lg-0">
                <div class="card" style="border-radius: .5rem; background-color: rgb(158, 99, 240);">
                  <h4 class="p-3">Friends</h4>
                  <div class="container text-start mt-1">
                    <!-- Friend 1 -->
                  <div class="row align-items-center">
                    <div class="col">
                      <img src="icon.png" style="max-height: 45px;">
                    </div>
                    <div class="col">
                      <p>@srogmro</p>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Profile</button>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Chat</button>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Play</button>
                    </div>
                  </div>
                  <!-- Friend 2 -->
                  <div class="row align-items-center mt-2">
                    <div class="col">
                      <img src="icon.png" style="max-height: 45px;">
                    </div>
                    <div class="col">
                      <p>@otgtgr</p>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Profile</button>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Chat</button>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Play</button>
                    </div>
                  </div>
                  <!-- Friend 3 -->
                  <div class="row align-items-center mt-2">
                    <div class="col">
                      <img src="icon.png" style="max-height: 45px;">
                    </div>
                    <div class="col">
                      <p>@ffrf</p>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Profile</button>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Chat</button>
                    </div>
                    <div class="col">
                      <button type="button" class="btn btn-dark w-100">Play</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}