window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});


const modal = document.querySelector('#modal');
const pageContainer = document.querySelector('.page-container');


function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Iniciando petición a la API...");
        
        const res = await fetch("https://gasguard-production.up.railway.app/api/reportesempre", {
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Status de respuesta:", res.status);

        if (!res.ok) {
            if (res.status === 401) {
                console.error("No autenticado - redirigir al login");
                alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
                // window.location.href = "/login"; // Descomenta si tienes página de login
                return;
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const resJson = await res.json();
        console.log("Datos recibidos:", resJson);
        const reportes = resJson.data;

        const reportesContainer = document.getElementById("containerreportes");
        
        if (!reportesContainer) {
            console.error("No se encontró el contenedor 'containerreportes' en el HTML");
            return;
        }

        // Limpiar contenedor antes de agregar nuevos reportes
        reportesContainer.innerHTML = '';

        if (!reportes || reportes.length === 0) {
            reportesContainer.innerHTML = '<p>No se encontraron reportes</p>';
            return;
        }

        let grupoTarjetas = null;
        reportes.forEach((reporte, index) => {
            // Crear nuevo grupo cada 4 tarjetas
            if (index % 4 === 0) {
                grupoTarjetas = document.createElement("div");
                grupoTarjetas.classList.add("grupodetarjetas");
                reportesContainer.appendChild(grupoTarjetas);
            }

            // Crear tarjeta
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta");

            // Icono
            const icono = document.createElement("i");
            icono.classList.add("fa", "fa-user");
            icono.setAttribute("data-id", reporte.nmticket_reporte); 

            // Contenedor de texto
            const textoTarjeta = document.createElement("div");
            textoTarjeta.classList.add("textotarjeta");

            // Número de ticket
            const nombreLabel = document.createElement("h2");
            nombreLabel.textContent = "Ticket:";

            const nombre = document.createElement("h2");
            nombre.textContent = reporte.nmticket_reporte;

            // Autor del reporte
            const encargLabel = document.createElement("p");
            encargLabel.textContent = "Autor:";

            const encarg = document.createElement("p");
            encarg.textContent = reporte.nombre_autor;

            // Fecha de inicio
            const feciniLabel = document.createElement("p");
            feciniLabel.textContent = "Fecha de registro:";

            const fecini = document.createElement("p");
            fecini.textContent = reporte.fecini_reporte;

            // Añadir elementos básicos
            textoTarjeta.appendChild(nombreLabel);
            textoTarjeta.appendChild(nombre);
            textoTarjeta.appendChild(encargLabel);
            textoTarjeta.appendChild(encarg);
            textoTarjeta.appendChild(feciniLabel);
            textoTarjeta.appendChild(fecini);

            // ✅ CORREGIDO: Solo agregar fecha de solución si existe
            if (reporte.estado_reporte === "realizado" && reporte.fecfin_reporte) {
                const fecfinLabel = document.createElement("p");
                fecfinLabel.textContent = "Fecha de solución:";

                const fecfin = document.createElement("p");
                fecfin.textContent = reporte.fecfin_reporte;

                textoTarjetas.appendChild(fecfinLabel);
                textoTarjeta.appendChild(fecfin);
            }

            // Estado del reporte
            const estadoLabel = document.createElement("p");
            estadoLabel.textContent = "Estado del reporte:";

            const estado = document.createElement("p");
            const estadoIcono = document.createElement("i");
            estadoIcono.classList.add("fa", "fa-circle");
            
            // Color del icono según el estado
            if (reporte.estado_reporte === "realizado") {
                estadoIcono.style.color = "green";
            } else if (reporte.estado_reporte === "pendiente") {
                estadoIcono.style.color = "orange";
            } else {
                estadoIcono.style.color = "red";
            }
            
            estado.appendChild(estadoIcono);
            estado.innerHTML += ` ${reporte.estado_reporte}`;

            textoTarjeta.appendChild(estadoLabel);
            textoTarjeta.appendChild(estado);

            // Añadir icono y texto a la tarjeta
            tarjeta.appendChild(icono);
            tarjeta.appendChild(textoTarjeta);

            // Añadir tarjeta al grupo
            grupoTarjetas.appendChild(tarjeta);
        });

        console.log(`Se crearon ${reportes.length} reportes`);

    } catch (error) {
        console.error("Error detallado:", error);
        const reportesContainer = document.getElementById("containerreportes");
        if (reportesContainer) {
            reportesContainer.innerHTML = `<p style="color: red;">Error al cargar los reportes: ${error.message}</p>`;
        }
    }
});



document.getElementById("searchInput").addEventListener("input", function () {
    const valorBusqueda = this.value.toLowerCase();
    const tarjetas = document.querySelectorAll(".tarjeta");

    tarjetas.forEach(tarjeta => {
        const nombre = tarjeta.querySelector("h2").textContent.toLowerCase();
        if (nombre.includes(valorBusqueda)) {
            tarjeta.style.display = "flex"; 
        } else {
            tarjeta.style.display = "none";
        }
    });
});
/*
async function actualizarCuentasRestantes() {
    try {
        const res = await fetch("/api/cuentas-restantes");
        const data = await res.json();

        if (res.ok) {
            const countSpan = document.getElementById('remaining-count');
            const btnAñadir = document.getElementById('anadircuenta');

            countSpan.textContent = data.cuentasDisponibles;

            if (data.cuentasDisponibles <= 0) {
                btnAñadir.classList.add('disabled');
                btnAñadir.style.pointerEvents = 'none';
                btnAñadir.style.opacity = '0.5';
                btnAñadir.title = "Ya no puedes añadir más cuentas";
            } else {
                btnAñadir.classList.remove('disabled');
                btnAñadir.style.pointerEvents = 'auto';
                btnAñadir.style.opacity = '1';
                btnAñadir.title = "";
            }
        }
    } catch (error) {
        console.error("Error actualizando cuentas restantes:", error);
    }
}

window.addEventListener('load', actualizarCuentasRestantes);
*/
/*
document.getElementById("eliminarcuentas").addEventListener("click", function () {
    const boton = document.getElementById("eliminarcuentas");
    const iconotarjetas = document.querySelectorAll('.fa');

    if (boton.classList.contains('fa-user-minus')) {
        // Cambiar todos los íconos de usuario a xmark
        iconotarjetas.forEach(icono => {
            if (icono.classList.contains('fa-user')) {
                icono.classList.remove('fa-user');
                icono.classList.add('fa-user-xmark');
            }
        });

        // Cambiar ícono del botón
        boton.classList.remove('fa-user-minus');
        boton.classList.add('fa-xmark');

    } else {
        // Volver todos los íconos a usuario
        iconotarjetas.forEach(icono => {
            if (icono.classList.contains('fa-user-xmark')) {
                icono.classList.remove('fa-user-xmark');
                icono.classList.add('fa-user');
            }
        });

        // Cambiar ícono del botón de vuelta
        boton.classList.remove('fa-xmark');
        boton.classList.add('fa-user-minus');
    }
});

document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("fa-user-xmark")) {
        const idAfiliado = e.target.getAttribute("data-id");

        if (!confirm("¿Estás seguro que deseas desactivar esta cuenta afiliada?")) return;

        try {
            const res = await fetch("/api/desactivar-afiliado", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ idAfiliado })
            });

            const result = await res.json();

            if (res.ok) {
                alert("Cuenta desactivada correctamente");

                // Recarga la página para reflejar los cambios
                location.reload(); // 🔁 Esto recarga la página
            } else {
                alert("Error: " + result.message);
            }

        } catch (error) {
            console.error("Error al desactivar:", error);
            alert("Error al desactivar afiliado");
        }
    }
});
*/

//DESACTIVAR AFILIADO CON CUENTAS RESTANTES
/*
document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("fa-user-xmark")) {
        const idAfiliado = e.target.getAttribute("data-id");

        if (!confirm("¿Estás seguro que deseas desactivar esta cuenta afiliada?")) return;

        try {
            const res = await fetch("/api/desactivar-afiliado", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ idAfiliado })
            });

            const result = await res.json();

            if (res.ok) {
                alert("Cuenta desactivada correctamente");

                // Elimina visualmente la tarjeta
                const tarjeta = e.target.closest(".tarjeta-afiliado");
                if (tarjeta) tarjeta.remove();

                // Actualiza el contador
                await actualizarCuentasRestantes();
            } else {
                alert("Error: " + result.message);
            }

        } catch (error) {
            console.error("Error al desactivar:", error);
            alert("Error al desactivar afiliado");
        }
    }
});
*/


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
