// Agrega esto antes de cerrar el </body>
document.addEventListener('DOMContentLoaded', function() {
    // 1. Botón de menú para móviles
    const menuToggle = document.createElement('div');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        color: red;
        font-size: 25px;
        z-index: 1000;
        display: none;
        cursor: pointer;
    `;
    document.body.appendChild(menuToggle);

    // 2. Mostrar/ocultar menú
    function toggleMenu() {
        const nav = document.querySelector('nav');
        nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
    }

    // 3. Controlar visibilidad
    function updateMenu() {
        if (window.innerWidth <= 767) {
            menuToggle.style.display = 'block';
            document.querySelector('nav').style.display = 'none';
        } else {
            menuToggle.style.display = 'none';
            document.querySelector('nav').style.display = 'flex';
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    window.addEventListener('resize', updateMenu);
    updateMenu(); // Inicializar
});