const mensajeError = document.getElementsByClassName("error")[0];

window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});
document.getElementById('login-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevenir la redirección inmediata
    document.body.style.opacity = '0'; // Hacer que la página se desvanezca

    setTimeout(() => {
        window.location.href = this.href; // Redirigir después de la animación
    }, 500); // Tiempo suficiente para la transición
});

document.getElementById("enviar-correov-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.querySelector('#nombre').value;
    const cp = document.querySelector('#cp').value;
    const ciudad = document.querySelector('#ciudad').value;
    const colonia = document.querySelector('#colonia').value;
    const calle = document.querySelector('#calle').value;
    const numero = document.querySelector('#numero').value;
    const estado = document.querySelector('#estado').value;
    const correo = document.querySelector('#correo').value;
    const password = document.querySelector('#password').value;
    const confpass = document.querySelector('#conf-pass').value;

    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        mostraralerta('info', "Todos los campos son obligatorios.");
        return;
    }
    
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (password.length < 8 || password.length > 12) {
        mostraralerta('error', "La contraseña debe tener entre 8 y 12 caracteres.");
        return;
    }
    
    if (!regexLetras.test(nombre) || !regexLetras.test(ciudad) || !regexLetras.test(colonia) || !regexLetras.test(estado)) {
        mostraralerta('error', "Los campos de nombre, ciudad, colonia y estado solo deben contener letras y espacios.");
        return;
    }
    if (password !== confpass) {
        mostraralerta('error', "Las contraseñas no coinciden.");
        return;
    }
    const regexnums = /^[1234567890\s]+$/;

    if (!regexnums.test(cp) || !regexnums.test(numero)) {
        mostraralerta('error', "Los campos de CP y número solo deben contener caracteres numéricos.");
        return;
    }

    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass
            })
        });
    
        const resJson = await res.json();
    
        if (!res.ok) {
            mostraralerta('error', resJson.message || "Error desconocido al registrar.");
            return;
        }
    
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        } else {
            window.location.href='/';

            mostraralerta('success', resJson.message || "Se ha completado el paso 1 exitosamente");
        }
    } catch (error) {
        mostraralerta('error', "Error de conexión con el servidor.");
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

window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});
document.getElementById('enviar-correov-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('correo').value;
    
    console.log("Correo enviado:", correo);
    const response =  await fetch('/api/enviar-correo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo })
    });

    const result = await response.json();

    // Validación: evitar campos vacíos
    if (!correo) {
        mostraralerta('error', 'El campo de correo no puede estar vacío.');
        document.getElementById('correo').focus();
        return;
    }

    if (result.status === "ok") {
        // Almacenar el correo en el almacenamiento local para usarlo en la siguiente página
        localStorage.setItem('resetEmail', correo);
        console.log("Correo almacenado en localStorage:", localStorage.getItem('resetEmail'));

        window.location.href = result.redirect;
    } else {
        document.querySelector('.error').classList.remove('escondido');
        document.querySelector('.error').textContent = result.message;
    }
});
