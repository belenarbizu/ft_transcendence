
var tooltipList;

function create_tooltips() {
    tooltipList = [];
    var tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipElement => {
        try{
            tooltipList.push(new bootstrap.Tooltip(tooltipElement));
        } catch { }
    });
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
        let currentModal = bootstrap.Modal.getInstance(modal);
        if (currentModal) {
            currentModal.hide();
        }
    });
    document.body.classList.remove("modal-open");
    document.body.removeAttribute('style');
    document.querySelectorAll(".modal-backdrop").forEach(modal => {
        modal.remove();
    });
}
