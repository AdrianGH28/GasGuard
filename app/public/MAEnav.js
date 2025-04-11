document.addEventListener("DOMContentLoaded", function() {
    var userContainer = document.getElementById("user-container");

    // Redirigir a la página cuando se hace clic en el contenedor del usuario
    userContainer.addEventListener("click", function() {
        window.location.href = "/maeseleccioninfo";  // Redirige a la página correcta
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Obtener la ruta completa de la página actual
    var currentPage = window.location.pathname;
    // Seleccionar todos los enlaces de navegación
    var navLinks = document.querySelectorAll("nav a");
    var userContainer = document.querySelector(".user-container");
    var crudicon = document.querySelector('#iralcrud');

    // Iterar a través de cada enlace y añadir la clase 'active' al que corresponde a la ruta actual
    navLinks.forEach(function(link) {
        // Verifica si la ruta de cada enlace coincide con la página actual
        if (link.getAttribute("href").split("/").pop() === currentPage) {
            link.classList.add("active"); // Activar el enlace actual
        } else {
            link.classList.remove("active"); // Eliminar la clase active de otros enlaces
        }
    });

    // Comprobar si estamos en "maeseleccioninfo" o "maeinfocuenta"
    if (currentPage === "/maeseleccioninfo" || currentPage === "/maeinfocuenta") {
        userContainer.classList.add("active");
    } else {
        userContainer.classList.remove("active");
    }
    if (currentPage === "/maecrudcuentasafi") {
        crudicon.classList.add("active");
    } else {
        crudicon.classList.remove("active");
    }
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.container-items');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});
