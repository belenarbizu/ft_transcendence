
var tooltipList;

function toast_message(message) {
    var toastLiveExample = document.getElementById('liveToastInfo');
    var toastMessage = document.getElementById('liveToastInfoMessage');
    if (toastLiveExample && toastMessage) {
        var toastBootstrap = bootstrap.Toast.getOrCreateInstance(
            toastLiveExample);
        toastMessage.textContent = message;
        toastBootstrap.show();
    }
}

function prepareTooltips() {
    var tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]');
    tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function disposeTooltips()
{
    tooltipList.forEach(ttip => {
        ttip.dispose();
    });
}

function prepareLinks() {
    document.querySelectorAll('a[spa]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const href = link.getAttribute('href');
            history.pushState({ path: href }, '', href);
            followLink(href);
        });
    });
}

function prepareForms() {
    document.querySelectorAll('button[spa]').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            submitForm(button);
        });
    });
}

function prepareSPA() {
    prepareLinks();
    prepareForms();
    prepareTooltips();
}

function endSPA()
{
    disposeTooltips();
}

function followLink(path) {
    endSPA();
    fetch(path + "?SPA=True")
        .then(response => response.text())
        .then(partHtml => {
            document.querySelector('.wrapper').innerHTML = partHtml;
            prepareSPA();
        })
        .catch(error => toast_message(error));
}

function submitForm(button) {
    endSPA();
    form = button.closest('form')
    const action = form.getAttribute('action');
    const data = new URLSearchParams();
    for (const pair of new FormData(form)) {
        if (pair[0] == 'next')
        {
            data.append(pair[0], pair[1]+"?SPA=True");
        }
        else
        {
        data.append(pair[0], pair[1]);
        }
    }
    fetch(action, {
        method: 'post',
        body: data,
    })
        .then(response => {
            const url = response.url.split('?')[0]
            history.pushState({ path: url }, '', url);
            return response.text();
        })
        .then(partHtml => {
            document.querySelector('.wrapper').innerHTML = partHtml;
            prepareSPA();
        })
        .catch(error => toast_message(error));
}

function handleSPAChange(event)
{
    const path = window.location.pathname;

    if (path[0] == '/')
    {
        event.preventDefault();
        followLink(path);
    }
}

window.addEventListener('popstate', handleSPAChange);
prepareSPA();
