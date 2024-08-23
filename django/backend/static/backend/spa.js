
var request_confirmation = false;

/**
 * Retrieves action and target attributes from HTML elements.
 *
 * Functions:
 * - get_action(element): Retrieves the value of the "href" or "action"
 *   attribute from the specified element. If neither attribute is present,
 *   returns an empty string.
 *   - element: The HTML element from which to retrieve the attribute.
 *   - RETURN: A string representing the value of the "href" or "action" 
 *     attribute, or an empty string if neither attribute is found.
 *
 * - get_target(element): Retrieves the value of the "target" attribute from
 *   the specified element. If the attribute is not present, returns a default
 *   selector "#wrapper".
 *   - element: The HTML element from which to retrieve the attribute.
 *   - RETURN: A string representing the value of the "target" attribute, or 
 *     "#wrapper" if the attribute is not found.
 */

function get_action(element) {
    if (element.hasAttribute("href")) {
        return element.getAttribute("href");
    }
    if (element.hasAttribute("action")) {
        return element.getAttribute("action");
    }
    else {
        return "";
    }
}

function get_target(element) {
    if (element.hasAttribute("target")) {
        return element.getAttribute("target");
    }
    else {
        return "#wrapper";
    }
}

function get_hide(element) {
    return element.hasAttribute("hide");
}

function get_push(element) {
    return element.hasAttribute("push");
}

function get_reset(element) {
    return element.hasAttribute("reset");
}

/**
 * Handles link navigation and form submission for a single-page application 
 * (SPA).
 *
 * Functions:
 * - follow_link(event): Intercepts link clicks, retrieves the action and target
 *   from the clicked element, and initiates a GET request for SPA navigation.
 *   - event: The Event object from the link click event.
 *
 * - submit_form(event): Intercepts form submission, gathers form data,
 *   appends the "SPA=True" parameter if the field name is "next", and
 *   initiates a POST request with the form data for SPA navigation.
 *   - event: The Event object from the form submission event.
 */

function follow_link(element) {
    get_request(get_action(element), get_target(element), true, true);
}

function submit_form(element) {
    if (element.nodeName != "form") {
        element = element.closest("form");
    }
    const data = new URLSearchParams();
    const formData = new FormData(element);
    for (const pair of new FormData(element)) {
        if (pair[0] == 'next') {
            formData.append(pair[0], pair[1] + "?SPA=True");
        }
        else {
            formData.append(pair[0], pair[1]);
        }
    }
    post_request(get_action(element), formData, get_target(element),
        get_push(element), get_hide(element));
    if (get_reset(element)){
        element.reset();
    }
}

/**
 * Manages the initialization and teardown of a single-page application (SPA)
 * environment.
 *
 * Functions:
 * - start_spa(): Sets up event listeners for SPA link navigation and form
 *   submission, and initializes Bootstrap tooltips. Links and forms with the 
 *   `spa` attribute are intercepted to handle SPA behavior.
 *
 * - end_spa(): Disposes of all initialized Bootstrap tooltips to clean up
 *   resources.
 */

function link_event_listener(event) {
    event.preventDefault();
    var element = event.target;
    follow_link(element);
}

function form_event_listener(event) {
    event.preventDefault();
    var element = event.target;
    submit_form(element);
}

function start_spa() {
    document.querySelectorAll('a[spa]').forEach(link => {
        link.addEventListener('click', link_event_listener);
    });
    document.querySelectorAll('form[spa]').forEach(button => {
        button.addEventListener('submit', form_event_listener);
    });
    document.querySelectorAll('input[spa]').forEach(button => {
        button.oninput = form_event_listener;
    });
    create_tooltips();
    webSocketManager.update_sockets();
    gameManager.update_games();
    matchmakingSystem.update();
}

function end_spa(hide) {
    dispose_tooltips();
    if (hide) {
        hide_modals();
    }
}

/**
 * Handles server responses for SPA navigation and fetch requests,
 * updates the DOM, and manages browser history.
 *
 * Functions:
 * - handle_response(response, target, push): Processes the server response.
 *   If the response status is 200, updates the specified DOM element with
 *   the response HTML and optionally updates the browser's history.
 *   If the response status is not 200, displays a notification with the
 *   response content.
 *   - response: The Response object from the fetch request.
 *   - target: The CSS selector of the DOM element to be updated.
 *   - push: A boolean indicating whether to update the browser's history.
 *
 * - get_request(href, target): Sends a GET request to the specified URL with
 *   an SPA parameter and handles the response.
 *   - href: The URL to send the GET request to.
 *   - target: The CSS selector of the DOM element to be updated.
 *
 * - post_request(action, data, target): Sends a POST request with the specified
 *   data to the given URL and handles the response.
 *   - action: The URL to send the POST request to.
 *   - data: The data to be sent in the body of the POST request.
 *   - target: The CSS selector of the DOM element to be updated.
 */

function handle_response(response, target, push, hide) {
    if (response.status == 200) {
        end_spa(hide);
        const url = response.url.split('?')[0];
        if (push == true && window.location.href != url) {
            history.pushState({ path: url }, '', url);
        }
        response.text().then(partHtml => {
            try
            {
                document.querySelector(target).innerHTML = partHtml;
            } catch {}
            start_spa();
        })
    }
    else if (response.status == 401) {
        get_request(window.location.href, "#wrapper", true, true);
    }
    else if (response.status == 409){
        response.text().then(partHtml => {
            show_notification(partHtml);
        })
    }
    else {
        response.text().then(partHtml => {
            document.documentElement.innerHTML = partHtml;
        })
    }
}

function confirm_request()
{
    return new Promise(function (resolve) {
        if (!request_confirmation)
        {
            resolve(true);
        }
        else
        {
            const myModal = new bootstrap.Modal(
                document.getElementById('confirmModal'));
            hide_modals();
            myModal.show();
            document.getElementById('confirmYes').addEventListener('click',
                function() {
                    myModal.hide();
                    resolve(true);
                });
            document.getElementById('confirmNo').addEventListener('click',
                function() {
                    myModal.hide();
                    resolve(false);
                });
        }
    });
}

function get_request(action, target, push, hide) {
    confirm_request().then(function(value){
        if (value)
        {
            fetch(action + "?SPA=True")
            .then(response => {
                handle_response(response, target, push, hide);
            });
        }
    });
}

function post_request(action, data, target, push, hide) {
    confirm_request().then(function(value){
        if (value)
        {
            fetch(action, { method: 'post', body: data, })
            .then(response => {
                handle_response(response, target, push, hide);
            });
        }
    });
}

/**
 * Handles the browser's popstate event to manage SPA navigation.
 *
 * This function intercepts the popstate event, retrieves the current path,
 * and initiates a GET request to update the content of the specified target
 * element if the path starts with a '/'.
 */

function handle_popstate(event) {
    const path = window.location.pathname;
    if (path[0] == '/') {
        event.preventDefault();
        get_request(path, "#wrapper", false);
    }
}

/**
 * Initializes the single-page application (SPA) environment and sets up 
 * the popstate event listener for handling browser navigation.
 */

window.addEventListener('popstate', handle_popstate);
start_spa();
