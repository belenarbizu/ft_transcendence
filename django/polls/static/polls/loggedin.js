export function loggedinView()
{
    document.getElementById('signin-btn').style.display = 'none';
    document.getElementById('col-end').style.display = 'block';
    return `<button type="button" class="btn btn-image mb-4" data-bs-toggle="modal" data-bs-target="#chooseRival">PLAY PONG</button>
      <button type="button" class="btn btn-image mb-4" data-bs-toggle="modal" data-bs-target="#chooseRival">PLAY BARCOS</button>
      <button type="button" class="btn btn-image mb-4" data-bs-toggle="modal" data-bs-target="#exampleModalInvite">CREATE A TOURNAMENT</button>
      <button type="button" class="btn btn-image route" data-path="/chat">CHAT ROOM</button>`;
}