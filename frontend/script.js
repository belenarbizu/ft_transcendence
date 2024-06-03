document.addEventListener('DOMContentLoaded', function() {
    // Redirige a la página de inicio de sesión de 42
    var loginButtons = document.querySelectorAll('.login');
    loginButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a5d66ac08de2c71e04180f8d4e281f2b6064474bea92d7595427e42ba870b5e4&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Floggedin.html&response_type=code';
        });
    });

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
