
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

        await esperar(4000); // Espera 4 segundos
            // Esperar a que la animación termine antes de redirigir
            await esperar(500); // Esperar el tiempo de la animación (500 ms)

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
        const res = await fetch("https://gasguard-production.up.railway.app/api/afiliadosempre");
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
    return alertBox && alertBox.classList.contains('open'); // corregido aquí
}

function mostraralerta(type, message) {
    console.log("mostraralerta:", type, message);
    clearTimeout(alertaTimeout);

    const alertBox = document.getElementById('alertamodal');

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
    const cancelarButton = document.querySelector('.cancelar');

    // Limpiar configuraciones anteriores
    alertBox.style.visibility = 'hidden';
    alertBox.style.transform = 'translateX(-50%) translateY(-20px)';
    alertBox.style.opacity = 0;

    // Configurar según el tipo de alerta
    if (type === 'info') {
        alertBox.style.borderColor = '#4B85F5';
        alertIcon.className = "fa-solid fa-circle-info";
        alertHeading.textContent = 'Información';
    } else if (type === 'warning') {
        alertBox.style.borderColor = '#FDCD0F';
        alertIcon.className = "fa-solid fa-circle-exclamation";
        alertHeading.textContent = 'Advertencia';
    } else if (type === 'error') {
        alertBox.style.borderColor = '#F04349';
        alertIcon.className = 'fa-solid fa-circle-xmark';
        alertHeading.textContent = 'Error';
    } else if (type === 'success') {
        alertBox.style.borderColor = '#01E17B';
        alertIcon.className = 'fa-solid fa-circle-check';
        alertHeading.textContent = 'Éxito';
    }

    alertContent.textContent = message;

    // Mostrar la alerta con la transición
    setTimeout(() => {
        alertBox.style.visibility = 'visible';
        alertBox.style.opacity = 1;
        alertBox.style.transform = 'translateX(-50%) translateY(0)';
        alertBox.classList.add('open'); // ← AÑADIDO para marcarla como abierta
    }, 10);

    console.log("Alerta mostrada correctamente");

    // Si la alerta no requiere intervención, cerrar automáticamente
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

    aceptarButton.onclick = () => cerraralerta();
}

function cerraralerta(callback) {
    console.log("Iniciando cierre de alerta");
    const alertBox = document.getElementById('alertamodal');

    if (!alertBox.classList.contains('open')) {
        console.log("La alerta ya está cerrada");
        if (callback) callback();
        return;
    }

    alertBox.style.opacity = 0;
    alertBox.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
        alertBox.style.visibility = 'hidden';
        alertBox.classList.remove('open'); // ← QUITAR la clase cuando se cierre
        if (callback) callback();
        console.log("Alerta cerrada y oculta");
    }, 300);
}


document.getElementById('enviar-correov-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const correo = document.getElementById('correo').value;
    console.log("Correo ingresado:", correo);

    // Validación: evitar campos vacíos
    if (!correo) {
        mostraralerta('error', 'El campo de correo no puede estar vacío.');
        document.getElementById('correo').focus();
        return;
    }

    try {
        // Enviar el correo al backend
        const response = await fetch('/api/enviar-correo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });

        const result = await response.json();

        if (result.status === "ok") {
            // Guardar el correo en localStorage
            localStorage.setItem('resetEmail', correo);
            console.log("Correo almacenado en localStorage:", localStorage.getItem('resetEmail'));

            
        } else {
            document.querySelector('.error').classList.remove('escondido');
            document.querySelector('.error').textContent = result.message;
        }
    } catch (error) {
        console.error("Error al enviar correo:", error);
        mostraralerta('error', 'Error en el servidor. Intenta nuevamente.');
    }
});
