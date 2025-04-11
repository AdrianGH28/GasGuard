document.addEventListener("DOMContentLoaded", function() {
    const userContainer = document.getElementById("user-container");
    const hamburger = document.getElementById("hamburger");
    const containerItems = document.querySelector('.container-items');
    const currentPage = window.location.pathname.split("/").pop(); // solo el nombre final

    // Mapeo de IDs a sus respectivas páginas
    const navItems = {
        'iralcrud': 'maecrudcuentasafi',
        'iralhistorial': 'maevisualizarrep',
        'iraldashboard': 'maedashboard'
    };

    // Activar ítem de navegación correcto
    Object.entries(navItems).forEach(([id, page]) => {
        const element = document.getElementById(id);
        if (element) {
            if (currentPage === page) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        }
    });

    // Activar user-container si corresponde
    if (userContainer) {
        if (currentPage === "maeseleccioninfo" || currentPage === "maeinfocuenta") {
            userContainer.classList.add("active");
        } else {
            userContainer.classList.remove("active");
        }

        // Click para redirigir
        userContainer.addEventListener("click", function() {
            window.location.href = "/maeseleccioninfo";
        });
    }

    // Menú hamburguesa
    if (hamburger && containerItems) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            containerItems.classList.toggle('active');
        });
    }
});