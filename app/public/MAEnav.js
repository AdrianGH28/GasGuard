document.addEventListener("DOMContentLoaded", function() {
    const userContainer = document.getElementById("user-container");
    const currentPage = window.location.pathname.split("/").pop(); // solo el nombre final

    // Mapeo de IDs a sus respectivas páginas
    const navItems = {
        'iralcrud': 'maecrudcuentasafi',
        'iralhistorial': 'maevisualizarrep',
        'iraldashboard': 'maedashboard'
    };

    // Función para desvanecer y redirigir
    function fadeAndRedirect(url) {
        document.body.style.transition = 'opacity 0.5s'; // Transición suave
        document.body.style.opacity = '0'; // Comenzar desvanecimiento
        setTimeout(() => {
            window.location.href = url;
        }, 500); // Después de 500ms redirigir
    }

    // Activar ítem de navegación correcto
    Object.entries(navItems).forEach(([id, page]) => {
        const element = document.getElementById(id);
        if (element) {
            if (currentPage === page) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }

            // Click con transición
            element.addEventListener("click", function(e) {
                e.preventDefault(); // Prevenir redirección inmediata
                fadeAndRedirect(this.href);
            });
        }
    });

    // Activar user-container si corresponde
    if (userContainer) {
        if (currentPage === "maeseleccioninfo" || currentPage === "maeinfocuenta") {
            userContainer.classList.add("active");
        } else {
            userContainer.classList.remove("active");
        }

        // Click con transición
        userContainer.addEventListener("click", function(e) {
            e.preventDefault(); // Prevenir redirección inmediata
            fadeAndRedirect("/maeseleccioninfo");
        });
    }

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.container-items');

    hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    });

});
