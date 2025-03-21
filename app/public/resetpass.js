window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});
document.addEventListener('DOMContentLoaded', () => {
    const correo = localStorage.getItem('resetEmail');
    if (!correo) {
        window.location.href = "/forgotpass"; // Redirigir si no hay correo
    }
    document.getElementById('correo').value = correo;
});


document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const confpass = document.getElementById('confpass').value;

    if (!correo || !password || !confpass) {
        mostraralerta("error", "Todos los campos son obligatorios");
        return;
    }
    // Validar que las contraseñas coincidan
    if (password !== confpass) {
        mostraralerta("error", "Las contraseñas no coinciden.");
        return;
    }
    if (password.length < 8 || password.length > 12) {
        mostraralerta("error", "La contraseña debe tener entre 8 y 12 caracteres.");
        return;
    }

    // Enviar la solicitud de restablecimiento de contraseña
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, password, confpass })
        });

        const result = await response.json();

        if (result.status === "ok") {
            // Mostrar alerta de éxito
            mostraralerta("success", "Contraseña restablecida correctamente.");

            // Después de 3 segundos, cerrar la alerta y redirigir
            setTimeout(() => {
                cerraralerta();
                localStorage.removeItem('resetEmail');
                window.location.href = result.redirect;
            }, 3000); // Esperar 3 segundos
        } else {
            // Mostrar alerta de error
            mostraralerta("error", result.message || "Error al restablecer la contraseña.");
        }
    } catch (error) {
        console.error("Error al restablecer la contraseña:", error);
        mostraralerta("error", "Hubo un problema al procesar tu solicitud.");
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
    
    // Forzar reflow para reiniciar la transición
    alertBox.classList.remove('show');
    alertBox.offsetHeight; // Forzamos el reflow
    
    // Asegurarse de que el modal se muestre
    alertBox.style.visibility = "visible";
    alertBox.classList.remove('alert-info','alert-warning','alert-error','alert-success','hide');
    alertBox.style.borderColor = '';
    alertIcon.className = 'fa-solid';
    if (cancelarButton) {
        cancelarButton.style.display = 'none'; // Ocultar el botón
    }
    
    // Configurar según el tipo de alerta
    if (type === 'info') {
        console.log("Configurando alerta tipo 'info'");
        alertBox.classList.add('alert-info');
        alertIcon.classList.add("fa-circle-info");
        alertHeading.textContent = 'Información';
        alertIcon.style.color = '#4B85F5';
        alertBox.style.borderColor = '#4B85F5';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    } else if (type === 'warning') {
        console.log("Configurando alerta tipo 'warning'");
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
        console.log("Configurando alerta tipo 'error'");
        alertBox.classList.add('alert-error');
        alertIcon.classList.add('fa-circle-xmark');
        alertHeading.textContent = 'Error';
        alertIcon.style.color = '#F04349';
        alertBox.style.borderColor = '#F04349';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    } else if (type === 'success') {
        console.log("Configurando alerta tipo 'success'");
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
    
    // Si la alerta no es de tipo que requiera intervención (warning o confirmation), se cierra automáticamente
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
            window.location.href='/';
        };
    } else {
        // Para otros tipos, el botón Aceptar simplemente cierra la alerta (o mantiene su comportamiento predeterminado)
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
