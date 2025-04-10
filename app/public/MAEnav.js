document.addEventListener("DOMContentLoaded", function() {
    var userContainer = document.getElementById("user-container");

    userContainer.addEventListener("click", function() {
        window.location.href = "MAE_seleccioninfo.html";  // Redirige a la página de usuario
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Obtener el nombre de la página actual (sin la ruta completa)
    var currentPage = window.location.pathname.split("/").pop();

    // Seleccionar todos los enlaces de navegación
    var navLinks = document.querySelectorAll("nav a");
    var userContainer = document.querySelector(".user-container");

    // Iterar a través de cada enlace y añadir la clase 'active' al que corresponde a la página actual
    navLinks.forEach(function(link) {
        // Verificar si el enlace apunta a la página actual
        if (link.getAttribute("href").split("/").pop() === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Comprobar si estamos en la página de usuario (por ejemplo, "pagina4.html")
    if (currentPage === "MAE_infocuenta.html" ||currentPage === "MAE_infopago.html" || currentPage === "MAE_seleccioninfo.html"  ) {  // Página de usuario
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
