export function chatView() {
    document.getElementById('signin-btn').style.display = 'none';
    document.getElementById('col-end').style.display = 'block';
    return `
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div class="row chat-container w-100">
        <div class="col-3 chat-column d-flex flex-column">
          <div class="p-3 border-bottom">
            <h5>Chats</h5>
          </div>
          <ul class="list-group list-group-flush flex-grow-1">
            <li class="list-group-item active" aria-current="true">Chat 1</li>
            <li class="list-group-item">Chat 2</li>
            <li class="list-group-item">Chat 3</li>
            <li class="list-group-item">Chat 4</li>
            <li class="list-group-item">Chat 5</li>
          </ul>
        </div>
        <div class="col-6 chat-column d-flex flex-column">
          <div class="p-3 border-bottom">
            <h5>Mensajes</h5>
          </div>
          <div class="chat-messages flex-grow-1 p-3" id="chatMessages">
            <div class="message mb-2">
              <strong>Usuario 1:</strong> Hola, ¿cómo estás?
            </div>
            <div class="message mb-2">
              <strong>Usuario 2:</strong> ¡Hola! Bien, ¿y tú?
            </div>
            <div class="message mb-2">
              <strong>Usuario 1:</strong> Todo bien, gracias.
            </div>
          </div>
          <div class="message-input p-3">
            <input type="text" class="form-control" placeholder="Escribe un mensaje...">
            <button class="btn btn-primary mt-2">Enviar</button>
          </div>
        </div>
        <div class="col-3 chat-column d-flex flex-column">
          <div class="p-3 border-bottom">
            <h5>Participantes</h5>
          </div>
          <ul class="list-group list-group-flush flex-grow-1">
            <li class="list-group-item">Usuario 1 <button type="button" class="btn">...</button></li>
            <li class="list-group-item">Usuario 2 <button type="button" class="btn">...</button></li>
            <li class="list-group-item">Usuario 3 <button type="button" class="btn">...</button></li>
            <li class="list-group-item">Usuario 4 <button type="button" class="btn">...</button></li>
            <li class="list-group-item">Usuario 5 <button type="button" class="btn">...</button></li>
          </ul>
        </div>
      </div>
    </div>
    `;
}