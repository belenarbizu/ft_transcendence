export function playPongView()
{
    document.getElementById('signin-btn').style.display = 'none';
    document.getElementById('col-end').style.display = 'block';
    return `<button type="button" class="btn btn-image mb-4 route" data-path="/pong">PLAY PONG</button>
        <button type="button" class="btn btn-image mb-4" id="buttonModalPlay" data-bs-toggle="modal" data-bs-target="#exampleModalInvite">PLAY PONG WITH A FRIEND</button>
        <button type="button" class="btn btn-image mb-4">PLAY PONG WITH A RANDOM RIVAL</button>
        <button type="button" class="btn btn-image route" data-path="/pong">PLAY PONG WITH AN AI</button>`;
}