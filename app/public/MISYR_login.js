// === Ajustes de layout y viewport ===

function adjustLayout() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const container = document.querySelector('.container');
    const imageOverlay = document.querySelector('.image-overlay');

    if (container) {
        container.style.minHeight = `${windowHeight * 0.8}px`;
    }

    if (imageOverlay && windowWidth <= 1024) {
        imageOverlay.style.width = '100%';
        imageOverlay.style.height = '100%';
        imageOverlay.style.top = '0';
        imageOverlay.style.left = '0';
        imageOverlay.style.transform = 'none';
    }

    if (windowWidth > 1920) {
        document.documentElement.style.fontSize = '20px';
    } else {
        document.documentElement.style.fontSize = '';
    }
}

adjustLayout();
window.addEventListener('resize', adjustLayout);

window.addEventListener('orientationchange', function () {
    setTimeout(adjustLayout, 100);
});

function setViewport() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (window.innerWidth <= 768) {
        viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
    } else {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
}

setViewport();
window.addEventListener('resize', setViewport);


document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById('correo').value.trim();
    const password = document.getElementById('password').value.trim();
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    // Verifica si hay campos vacíos
    if (correo === '' || password === '') {
        mostrarAlertaCamposVacios('Es necesario completar todos los campos');
        return;
    }

    // Verifica si el correo es inválido
    if (!correoValido) {
        mostrarAlertaPersonalizada('Correo y/o contraseña incorrectos, intente de nuevo');
        return;
    }

    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                correo,
                password,
            }),
        });

        if (!res.ok) {
            const resJson = await res.json();
            mostrarAlerta(resJson.message || "Usuario o contraseña incorrecto");
            return;
        }

        const resJson = await res.json();
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }
    } catch (error) {
        console.error("Error en login:", error);
    }

    
    // === Función para mostrar alerta personalizada (correo/contraseña incorrectos) ===
    function mostrarAlertaPersonalizada(mensaje) {
        const alerta = document.getElementById('custom-alert');
        const texto = alerta.querySelector('.custom-message');
        texto.textContent = mensaje;
        alerta.classList.add('show');
        alerta.style.display = 'flex';

        setTimeout(() => {
            alerta.classList.remove('show');
            setTimeout(() => {
                alerta.style.display = 'none';
            }, 300);
        }, 2000);
    }

    // === Función para mostrar alerta de campos vacíos ===
    function mostrarAlertaCamposVacios(mensaje) {
        const alerta = document.getElementById('alert-campos-vacios');
        const texto = alerta.querySelector('.custom-message');
        texto.textContent = mensaje;
        alerta.classList.add('show');
        alerta.style.display = 'flex';

        setTimeout(() => {
            alerta.classList.remove('show');
            setTimeout(() => {
                alerta.style.display = 'none';
            }, 300);
        }, 2000);
    }
});


document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const correo = document.getElementById('correo').value;
    console.log("Correo ingresado:", correo);

    if (!correo) {
        mostraralerta('error', 'El campo de correo no puede estar vacío.');
        document.getElementById('correo').focus();
        return;
    }

    // Guardar el correo en localStorage ANTES de hacer la petición
    localStorage.setItem('resetEmail', correo);
    console.log("Correo guardado en localStorage:", localStorage.getItem('resetEmail'));

    try {
        const response = await fetch('/api/enviar-correo-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });

        const result = await response.json();

        if (result.status === "ok") {
            window.location.href = result.redirect;
        } else {
            document.querySelector('.error').classList.remove('escondido');
            document.querySelector('.error').textContent = result.message;
        }
    } catch (error) {
        console.error("Error al enviar correo:", error);
        mostraralerta('error', 'Error en el servidor. Intenta nuevamente.');
    }

    
});


// === Ajustes responsive adicionales ===
function handleResponsive() {
    if (window.innerWidth < 992) {
        const navbarHeight = document.querySelector('.navbar-container').offsetHeight;
        const container = document.querySelector('.container');
        container.style.minHeight = `calc(100vh - ${navbarHeight}px)`;
    }

    const imageOverlay = document.querySelector('.image-overlay');
    if (window.innerWidth < 992) {
        imageOverlay.style.width = '100%';
        imageOverlay.style.height = '50%';
        imageOverlay.style.top = '0';
        imageOverlay.style.transform = 'none';
    } else {
        imageOverlay.style.width = '920px';
        imageOverlay.style.height = '830px';
        imageOverlay.style.top = '50%';
        imageOverlay.style.transform = 'translateY(-50%)';
    }
}

window.addEventListener('load', handleResponsive);
window.addEventListener('resize', handleResponsive);
