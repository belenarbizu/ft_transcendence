document.addEventListener('DOMContentLoaded', function() {
    //Muestra el modal para editar el perfil
    var editProfileBtn = document.getElementById('editProfile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            var modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            modal.show();
        });
    }

    //Redirige a la página principal después de iniciar sesión
    var profileButton = document.getElementById("profile-btn");
    if (profileButton) {
        profileButton.addEventListener("click", function() {
            window.location.href = "loggedin.html";
        });
    }

    //Redirige a la página de perfil
    var viewProfileButton = document.getElementById("viewProfile");
    if (viewProfileButton) {
        viewProfileButton.addEventListener("click", function() {
            window.location.href = "profile.html";
        });
    }

    //Calcula y establece el ancho de la barra de win rate
    const victories = 15;
    const defeats = 3;
    const totalMatches = victories + defeats;
    const winRate = (victories / totalMatches) * 100;
    var winRateElement = document.getElementById('winRate');
    if (winRateElement) {
        winRateElement.style.width = winRate.toFixed(2) + "%";
    }
});
