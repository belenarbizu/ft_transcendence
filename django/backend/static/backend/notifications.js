
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
