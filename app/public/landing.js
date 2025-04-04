document.addEventListener('DOMContentLoaded', function() {
    // Función para crear el botón del menú hamburguesa
    function setupMobileMenu() {
        if (window.innerWidth <= 768) {
            const navbar = document.querySelector('.navbar-container');
            const navLinks = document.querySelector('.nav-links');
            
            // Crear botón de menú
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.style.display = 'none'; // Oculto por defecto, CSS lo mostrará en móviles
            
            // Añadir evento de clic
            menuToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });
            
            // Añadir botón al navbar
            navbar.appendChild(menuToggle);
            
            // Cerrar menú al hacer clic en un enlace
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function() {
                    navLinks.classList.remove('active');
                });
            });
        }
    }
    
    // Función para ajustar el layout dinámicamente
    function adjustLayout() {
        const screenWidth = window.innerWidth;
        const heroText = document.querySelector('.hero-text');
        
        // Ajustar hero text para evitar desbordamiento
        if (screenWidth < 400) {
            heroText.style.fontSize = '24px';
            heroText.style.lineHeight = '1.3';
        }
        
        // Ajustar cards en la sección de servicios
        const cards = document.querySelectorAll('.wrapper .card');
        if (screenWidth < 768) {
            cards.forEach(card => {
                card.style.margin = '0 auto 20px';
            });
        }
    }
    
    // Inicializar
    setupMobileMenu();
    adjustLayout();
    
    // Volver a ejecutar al redimensionar
    window.addEventListener('resize', function() {
        setupMobileMenu();
        adjustLayout();
    });
    
    // Smooth scroll para navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

