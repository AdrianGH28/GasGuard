
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
    return alertBox.classList.contains('show');

}

function mostraralerta(type, message) {
    console.log("mostraralerta:", type, message);
    clearTimeout(alertaTimeout);
    const alerta = document.querySelector('#alertamodal');
    
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
