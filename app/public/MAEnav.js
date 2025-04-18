document.addEventListener("DOMContentLoaded", function() {
    const userContainer = document.getElementById("user-container");
    const navLinks = document.querySelector('.container-items');
    const currentPage = window.location.pathname.split("/").pop(); // solo el nombre final

    const hamburger = document.querySelector('.hamburger');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Mapeo de IDs a sus respectivas páginas
    const navItems = {
        'iralcrud': '/maecrudcuentasafi',
        'iralhistorial': '/maevisualizarrep',
        'iraldashboard': '/maedashboard'
    };

    // Función para desvanecer y redirigir
    function fadeAndRedirect(url) {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    // Activar ítem de navegación correcto
    Object.entries(navItems).forEach(([id, url]) => {
        const element = document.getElementById(id);
        if (element) {
            // Activar clase si es la página actual
            const pageName = url.split("/").pop();
            if (currentPage === pageName) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }

            // Click con transición
            element.addEventListener("click", function(e) {
                e.preventDefault();
                fadeAndRedirect(url);
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
            e.preventDefault();
            fadeAndRedirect("/maeseleccioninfo");
        });
    }

});
