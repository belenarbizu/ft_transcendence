export { show_notification, submit_form };

/**
 * Displays a Bootstrap toast notification with a specified message.
 *
 * This function targets a specific toast element and updates its message
 * content before displaying it. The toast element and its message container
 * are expected to have specific IDs.
 *
 * Elements:
 * - #liveToastInfo: The ID of the toast element to be shown.
 * - #liveToastInfoMessage: The ID of the element inside the toast where the
 *   message text will be set.
 */

function show_notification(message) {
    var toastLiveExample = document.getElementById('liveToastInfo');
    var toastMessage = document.getElementById('liveToastInfoMessage');
    if (toastLiveExample && toastMessage) {
        var toastBootstrap = bootstrap.Toast.getOrCreateInstance(
            toastLiveExample);
        toastMessage.textContent = message;
        toastBootstrap.show();
    }
}

/**
 * Manages the initialization and disposal of Bootstrap tooltips,
 * and prepares single-page application (SPA) style link handling.
 * 
 * Functions:
 * - create_tooltips(): Initializes Bootstrap tooltips for elements
 *   with the attribute `data-bs-toggle="tooltip"`.
 * 
 * - dispose_tooltips(): Disposes of all initialized Bootstrap tooltips
 *   to free up resources.
 * 
 * Variables:
 * - tooltipList: An array holding references to all initialized
 *   Bootstrap tooltips.
 */

var tooltipList;

function create_tooltips() {
    var tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]');
    tooltipList = [...tooltipTriggerList].map(
        tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function dispose_tooltips() {
    tooltipList.forEach(tooltip => {
        try {
            tooltip.dispose();
        } catch { }
    });
}

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
    return element.hasAttribute("push-state");
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

function follow_link(event) {
    const element = event.target;
    get_request(get_action(element), get_target(element), true);
}

function submit_form(form) {
    if (form.nodeName != "form") {
        form = form.closest("form");
    }
    const data = new URLSearchParams();
    for (const pair of new FormData(form)) {
        if (pair[0] == 'next') {
            data.append(pair[0], pair[1] + "?SPA=True");
        }
        else {
            data.append(pair[0], pair[1]);
        }
    }
    post_request(get_action(form), data, get_target(form), get_push(form), get_hide(form));
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
    follow_link(event);
}

function form_event_listener(event) {
    event.preventDefault();
    var form = event.target;
    submit_form(form);
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
}

function end_spa(hide) {
    dispose_tooltips();
    if (hide) {
        hide_modals();
    }
}

function hide_modals() {
    dispose_tooltips();
    document.querySelectorAll('.modal').forEach(modal => {
        console.log(modal); let currentModal = bootstrap.Modal.getInstance(modal)
        if (currentModal) currentModal.hide()
    });
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
            document.querySelector(target).innerHTML = partHtml;
            start_spa();
        })
    }
    else {
        response.text().then(partHtml => {
            show_notification(partHtml);
        })
    }
}

function get_request(action, target, push) {
    fetch(
        action + "?SPA=True"
    ).then(response => { handle_response(response, target, push); });
}

function post_request(action, data, target, push, hide) {
    fetch(action, { method: 'post', body: data, })
        .then(response => {
            handle_response(response, target, push, hide);
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
