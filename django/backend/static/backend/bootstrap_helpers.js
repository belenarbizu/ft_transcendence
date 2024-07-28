
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
    tooltipList = [];
    for (tooltipElement in tooltipTriggerList){
        try{
            tooltipList.push(new bootstrap.Tooltip(tooltipElement));
        } catch { }
    }

   // tooltipList = [...tooltipTriggerList].map(
   //     tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

}

function dispose_tooltips() {
    tooltipList.forEach(tooltip => {
        try {
            tooltip.dispose();
        } catch { }
    });
}

function hide_modals() {
    dispose_tooltips();
    document.querySelectorAll('.modal').forEach(modal => {
        console.log(modal); let currentModal = bootstrap.Modal.getInstance(modal)
        if (currentModal) currentModal.hide()
    });
}
