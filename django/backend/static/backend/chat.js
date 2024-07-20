
function sentMessageTemplate(message) {
    return `<li class="d-flex justify-content-between mb-2">
                <div class="m-4"></div>
                <div class="card">
                    <div class="card-body">
                        <p class="mb-0">
                            ${message}
                        </p>
                    </div>
                </div>
            </li>`
}

function receivedMessageTemplate(message) {
    return `<li class="d-flex justify-content-between mb-2">
                <div class="card">
                    <div class="card-body">
                        <p class="mb-0">
                            ${message}
                        </p>
                    </div>
                </div>
                <div class="mx-4"></div>
            </li>`
}

function handleMessageEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}

function clearChat() {
    document.querySelector('ul[chat-box]').innerHTML += "";
}

function sendMessage() {
    const message = document.querySelector('input[chat]').value;
    document.querySelector('input[chat]').value = "";
    console.log(message);
    document.querySelector('ul[chat]').innerHTML
        += sentMessageTemplate(message);
    document.querySelector('ul[chat]').innerHTML
        += receivedMessageTemplate(message);
}
