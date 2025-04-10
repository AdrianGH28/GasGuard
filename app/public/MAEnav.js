document.addEventListener("DOMContentLoaded", function() {
    var userContainer = document.getElementById("user-container");

    userContainer.addEventListener("click", function() {
        window.location.href = "/maeseleccioninfo";  // Redirige a la página de usuario
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Obtener la ruta completa de la página actual
    var currentPage = window.location.pathname;

    // Seleccionar todos los enlaces de navegación
    var navLinks = document.querySelectorAll("nav a");
    var userContainer = document.querySelector(".user-container");

    // Iterar a través de cada enlace y añadir la clase 'active' al que corresponde a la ruta actual
    navLinks.forEach(function(link) {
        // Verificar si el enlace apunta a la ruta actual
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Comprobar si estamos en "maeseleccioninfo" o "maeinfocuenta"
    if (currentPage === "/maeseleccioninfo" || currentPage === "/maeinfocuenta") {
        userContainer.classList.add("active");
    } else {
        userContainer.classList.remove("active");
    }
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.container-items');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});
