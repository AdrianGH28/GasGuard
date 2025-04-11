
const modal = document.querySelector('#modal');
const pageContainer = document.querySelector('.page-container');
const addca = document.getElementById('anadircuenta');
const cerrarmodal = document.querySelector('#cerrarmodal')

// Función para mostrar u ocultar el modal
addca.addEventListener('click', () => {
        modal.showModal();
});
cerrarmodal.addEventListener('click', () => {
    modal.close();
});
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
document.getElementById("cuentas-afiliadas-form").addEventListener("submit", async (e) => {
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
    const submitBtn = document.querySelector('button[type="submit"]');

    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        mostraralerta('info', "Todos los campos son obligatorios.");
        return;
    }

    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexNums = /^[0-9]+$/;

    if (!regexLetras.test(nombre) || !regexLetras.test(ciudad) || !regexLetras.test(colonia) || !regexLetras.test(estado)) {
        mostraralerta('error', "Los campos de nombre, ciudad, colonia y estado solo deben contener letras y espacios.");
        return;
    }

    if (!regexNums.test(cp) || cp.length !== 5) {
        mostraralerta('error', "El código postal debe contener 5 caracteres numéricos.");
        return;
    }

    if (!regexNums.test(numero)) {
        mostraralerta('error', "El número debe contener solo caracteres numéricos.");
        return;
    }

    if (password.length < 8 || password.length > 12) {
        mostraralerta('error', "La contraseña debe tener entre 8 y 12 caracteres.");
        return;
    }

    if (password !== confpass) {
        mostraralerta('error', "Las contraseñas no coinciden.");
        return;
    }

    try {
        const res = await fetch("/api/registrar-afiliado", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass
            })
        });

        const data = await res.json();

        if (!res.ok) {
            mostraralerta('error', data.message || "Error al registrar afiliado.");
            return;
        }

        mostraralerta('success', data.message || "Afiliado registrado correctamente.");

        await esperar(3000); // Espera 4 segundos
            // Esperar a que la animación termine antes de redirigir
            cerraralerta();
            modal.close();
        // Si quieres cerrar el modal automáticamente:

    } catch (err) {
        console.error(err);
        mostraralerta('error', "Error de conexión con el servidor.");
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    try {
        
        const res = await fetch("https://gasguard-production.up.railway.app/api/afiliadosempre", {
            credentials: "include" // esto permite que se envíen las cookies automáticamente
        });

        if (!res.ok) {
            throw new Error("Error al obtener la información de las cuentas afiliadas");
        }

        const resJson = await res.json();
        const afiliados = resJson.data;

        const afiliadosContainer = document.getElementById("containercuentas");

        afiliados.forEach(afiliado => {
            // Aquí se crearán las tarjetas de las cuentas afiliadas
        });

    } catch (error) {
        console.error("Error:", error);
    }
});


let alertaTimeout;
let alertaTipoActual = "";

function isAlertVisible() {
    const alertBox = document.getElementById('alertamodal');
    return alertBox && alertBox.open;
}

function mostraralerta(type, message) {
    console.log("mostraralerta:", type, message);
    clearTimeout(alertaTimeout);
    const alerta = document.getElementById('alertamodal');

    if (isAlertVisible()) {
        console.log("Alerta ya visible, cerrando la anterior...");
        cerraralerta(() => {
            console.log("Alerta anterior cerrada, mostrando nueva alerta");
            setTimeout(() => mostrarNuevaAlerta(type, message), 100);
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
    const closeButton = alertBox.querySelector('.closebtn');
    const aceptarButton = document.getElementById('aceptarbtnalerta');
    const cancelarButton = alertBox.querySelector('.cancelar');

    // Limpiar clases anteriores
    alertBox.className = 'modalalert custom-alert'; // Asegúrate de usar "custom-alert"
    alertIcon.className = 'fa-solid';
    if (cancelarButton) cancelarButton.style.display = 'none';

    const tipos = {
        info:    { clase: 'alert-info',    icon: 'fa-circle-info',      titulo: 'Información', color: '#4B85F5', aceptarColor: '#6C7D7D', aceptarBold: '400' },
        warning: { clase: 'alert-warning', icon: 'fa-circle-exclamation', titulo: 'Advertencia', color: '#FDCD0F', aceptarColor: '#FDCD0F', aceptarBold: '700' },
        error:   { clase: 'alert-error',   icon: 'fa-circle-xmark',      titulo: 'Error',        color: '#F04349', aceptarColor: '#6C7D7D', aceptarBold: '400' },
        success: { clase: 'alert-success', icon: 'fa-circle-check',       titulo: 'Éxito',        color: '#01E17B', aceptarColor: '#6C7D7D', aceptarBold: '400' },
    };

    const config = tipos[type] || tipos.info;

    alertBox.classList.add(config.clase);
    alertIcon.classList.add(config.icon);
    alertHeading.textContent = config.titulo;
    alertIcon.style.color = config.color;
    aceptarButton.style.color = config.aceptarColor;
    aceptarButton.style.fontWeight = config.aceptarBold;

    // Establecer el borde izquierdo dinámicamente
    alertBox.style.borderLeftColor = config.color; // Actualiza el borde izquierdo

    if (type === 'warning' && cancelarButton) cancelarButton.style.display = 'inline';

    alertContent.textContent = message;
    alertaTipoActual = type;

    // Mostrar alerta
    if (!alertBox.open) {
        alertBox.showModal();
    }
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

    aceptarButton.onclick = () => {
        if (type === 'warning') {
            console.log("Botón Aceptar (warning) presionado: regresando a la página anterior");
            document.body.style.opacity = '0';
            window.location.href = '/';
        } else {
            cerraralerta();
        }
    };
}

function cerraralerta(callback) {
    console.log("Iniciando cierre de alerta");
    const alertBox = document.getElementById('alertamodal');

    if (!isAlertVisible()) {
        console.log("La alerta ya está cerrada");
        if (callback) callback();
        return;
    }

    alertBox.close();
    console.log("Alerta cerrada");
    alertaTipoActual = "";
    clearTimeout(alertaTimeout);

    if (callback) callback();
}


window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});

//Aqui tratare de generar los containers de las cuentas afiliadas dinamicamente, o sea conectado al back