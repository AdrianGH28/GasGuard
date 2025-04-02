window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity = '1';
});
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
document.getElementById('login-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevenir la redirección inmediata
    document.body.style.opacity = '0'; // Hacer que la página se desvanezca

    setTimeout(() => {
        window.location.href = this.href; // Redirigir después de la animación
    }, 500); // Tiempo suficiente para la transición
});


document.getElementById('forgot-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('correo').value;
    const mensajeError = document.getElementsByClassName("error")[0];
    const submitBtn = document.querySelector('button[type="submit"]');
    if (!correo) {
        mostraralerta('info', 'Todos los campos son obligatorios');
        return;
    }

    // Aquí comienza el flujo del código de la alerta
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo })
        });

        const result = await response.json();
        

        if (result.status === "ok") {
            // Almacenar el correo en el almacenamiento local para usarlo en la siguiente página
            localStorage.setItem('resetEmail', correo);
            submitBtn.disabled = true;
            mostraralerta('success', 'Correo enviado correctamente. Revisa tu bandeja de entrada.');

            await esperar(4000); // Espera 4 segundos

            document.body.style.transition = 'opacity 0.5s';
            document.body.style.opacity = '0'; // Opcional: transición de desvanezca

                await esperar(500); // Esperar el tiempo de la animación (500 ms)
    
                cerraralerta();
                window.location.href=result.redirect;
        } else {
            mostraralerta('error', result.message || 'Hubo un problema al enviar el correo. Intenta de nuevo.');
        }
    } catch (error) {
        mostraralerta('error', 'Error de conexión con el servidor. Por favor, intenta de nuevo.');
        console.log("Error:", error);
    }
});

let alertaTimeout;
let alertaTipoActual = "";

function isAlertVisible() {
    const alertBox = document.getElementById('alertamodal');
    return alertBox.classList.contains('show');
}

function mostraralerta(type, message) {
    console.log("mostraralerta:", type, message);
    clearTimeout(alertaTimeout);

    if (isAlertVisible()) {
        console.log("Alerta ya visible, cerrando la anterior...");
        cerraralerta(() => {
            console.log("Alerta anterior cerrada, mostrando nueva alerta");
            setTimeout(() => {
                mostrarNuevaAlerta(type, message);
            }, 100); // Pequeño retraso para dar tiempo al cierre
        });
        return;
    }

    mostrarNuevaAlerta(type, message);
}

function mostrarNuevaAlerta(type, message) {
    console.log("mostrarNuevaAlerta:", type, message);
    const alertBox = document.getElementById('alertamodal');
    const alertIcon = alertBox.querySelector('.alerticon i');
    const alertHeading = alertBox.querySelector('.alertheading');
    const alertContent = alertBox.querySelector('.alertcontentcont');
    const closeButton = alertBox.querySelector('.closebtn'); // Botón de cierre
    const aceptarButton = document.getElementById('aceptarbtnalerta');
    const cancelarButton = document.querySelector('.cancelar');

    alertBox.classList.remove('show');
    alertBox.offsetHeight;

    alertBox.style.visibility = "visible";
    alertBox.classList.remove('alert-info', 'alert-warning', 'alert-error', 'alert-success', 'hide');
    alertBox.style.borderColor = '';
    alertIcon.className = 'fa-solid';
    if (cancelarButton) {
        cancelarButton.style.display = 'none'; // Ocultar el botón
    }

    // Configuración de la alerta según el tipo
    if (type === 'info') {
        alertBox.classList.add('alert-info');
        alertIcon.classList.add("fa-circle-info");
        alertHeading.textContent = 'Información';
        alertIcon.style.color = '#4B85F5';
        alertBox.style.borderColor = '#4B85F5';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    } else if (type === 'warning') {
        alertBox.classList.add('alert-warning');
        alertIcon.classList.add("fa-circle-exclamation");
        alertHeading.textContent = 'Advertencia';
        alertIcon.style.color = '#FDCD0F';
        alertBox.style.borderColor = '#FDCD0F';
        aceptarButton.style.color = '#FDCD0F';
        aceptarButton.style.fontWeight = '700';
        if (cancelarButton) {
            cancelarButton.style.display = 'inline';
        }
    } else if (type === 'error') {
        alertBox.classList.add('alert-error');
        alertIcon.classList.add('fa-circle-xmark');
        alertHeading.textContent = 'Error';
        alertIcon.style.color = '#F04349';
        alertBox.style.borderColor = '#F04349';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    } else if (type === 'success') {
        alertBox.classList.add('alert-success');
        alertIcon.classList.add('fa-circle-check');
        alertHeading.textContent = 'Éxito';
        alertIcon.style.color = '#01E17B';
        alertBox.style.borderColor = '#01E17B';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    }

    // Establecer el mensaje
    alertContent.textContent = message;
    alertaTipoActual = type;

    // Mostrar la alerta
    alertBox.classList.add('show');
    console.log("Alerta mostrada correctamente");

    if (type !== 'warning' && type !== 'confirmation') {
        alertaTimeout = setTimeout(() => {
            console.log("Timeout alcanzado, cerrando alerta");
            cerraralerta();
        }, 3000);
    }

    closeButton.onclick = () => {
        console.log("Cierre manual de alerta");
        cerraralerta();
    };
    if (type === 'warning') {
        aceptarButton.onclick = () => {
            console.log("Botón Aceptar (warning) presionado: regresando a la página anterior");
            document.body.style.opacity = '0';
            window.location.href = '/';
        };
    } else {
        aceptarButton.onclick = () => cerraralerta();
    }
}

function cerraralerta(callback) {
    console.log("Iniciando cierre de alerta");
    const alertBox = document.getElementById('alertamodal');
    if (!alertBox.classList.contains('show')) {
        console.log("La alerta ya está cerrada");
        if (callback) callback();
        return;
    }
    alertBox.classList.remove('show');
    alertBox.classList.add('hide');
    setTimeout(() => {
        alertBox.classList.remove('hide');
        alertBox.style.visibility = "hidden";
        alertaTipoActual = "";
        console.log("Alerta cerrada y oculta");
        clearTimeout(alertaTimeout);
        if (callback) callback();
    }, 300);
}
