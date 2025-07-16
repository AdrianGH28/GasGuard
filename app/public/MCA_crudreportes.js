//form-reporte-fuga es una idea de nombre para el id del forms, camialoo dependiendo de como lo  llames
window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});

document.getElementById("form-reporte-fuga").addEventListener("submit", async (e) => {
    e.preventDefault();

    const descripcion = document.querySelector('#descripcion').value;

    if (!descripcion || descripcion.trim() === "") {
        mostraralerta('info', "Debes escribir una descripción del reporte.");
        return;
    }

    try {
        const res = await fetch("/api/reporte-fuga", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ descripcion })
        });

        const data = await res.json();

        if (!res.ok) {
            mostraralerta('error', data.message || "Error al generar el reporte.");
            return;
        }

        mostraralerta('success', data.message || "Reporte generado correctamente.");
        // Aquí puedes limpiar el campo o cerrar el modal si hace falta
        document.querySelector('#descripcion').value = "";

    } catch (error) {
        console.error('Error al generar reporte:', error);
        mostraralerta('error', "Error de conexión con el servidor.");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/reportes-afiliado", {
            credentials: "include" // Para enviar cookies de sesión automáticamente
        });

        if (!res.ok) {
            throw new Error("Error al obtener los reportes del afiliado.");
        }

        const resJson = await res.json();
        //lo de reportes y reportesContainer es una idea de nombre, cambialo
        // si quieres
        const reportes = resJson.data;

        const reportesContainer = document.getElementById("containerreportes"); // /aqui va el id del contenedor donde pondras los reportes/

        let grupoContenedores = null;
        reportes.forEach((reporte, index) => {
            // /aqui generas los contenedores de reporte/
       
        });


    } catch (error) {
        console.error("Error:", error);
    }
});

///////////////////////////////////////////////////////////ALERTAAAAAAAAAAAAAAAAAAAAAAAAA

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


