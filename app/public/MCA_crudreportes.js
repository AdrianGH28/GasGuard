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


document.addEventListener("DOMContentLoaded", function () {
    const filtroPanel = document.getElementById("filtro-lateral");
    const botonFiltrar = document.getElementById("filter-btn");
    const contenedorPrincipal = document.getElementById("contenedor-principal");
    const btnLimpiar = document.querySelector(".btn-limpiar-filtros");

    if (botonFiltrar && filtroPanel && contenedorPrincipal) {
        botonFiltrar.addEventListener("click", function () {
            filtroPanel.classList.add("activo");
            contenedorPrincipal.classList.add("expandido");
            botonFiltrar.style.display = "none";
        });
    }

    const cerrarBtn = document.querySelector('.cerrar-filtro');
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', ocultarFiltros);
    }

    document.querySelectorAll('.opcion-filtro').forEach(opcion => {
        opcion.addEventListener('click', function () {
            const grupo = this.closest('.contenedor-opciones');
            const yaSeleccionada = this.classList.contains('activa');

            grupo.querySelectorAll('.opcion-filtro').forEach(opt => {
                opt.classList.remove('activa', 'no-hover');
            });

            if (!yaSeleccionada) {
                this.classList.add('activa', 'no-hover');
                grupo.classList.add('tiene-seleccion');
            } else {
                grupo.classList.remove('tiene-seleccion');
            }

            verificarFiltrosActivos();
        });
    });

    document.querySelectorAll('.categoria-header').forEach(header => {
        header.addEventListener('click', function () {
            const categoria = this.closest('.categoria-filtro');
            const esFecha = categoria.querySelector(".categoria-header span")?.textContent.includes("Fecha");
            const dropdown = categoria.querySelector('.opciones-dropdown');
            const yaTieneFlatpickr = dropdown.classList.contains("calendario-insertado");

            categoria.classList.toggle('abierto');

            // Solo si es de fecha y no se ha insertado aún
            if (esFecha && !yaTieneFlatpickr) {
                configurarFlatpickr(dropdown);
                dropdown.classList.add("calendario-insertado");
            }
        });
    });

    const filtrosConBuscador = ["Mes", "Año"];
    document.querySelectorAll(".categoria-filtro").forEach(categoria => {
        const header = categoria.querySelector(".categoria-header span")?.textContent.trim();
        const contenedorOpciones = categoria.querySelector(".contenedor-opciones");

        if (contenedorOpciones && filtrosConBuscador.includes(header)) {
            const yaExiste = contenedorOpciones.querySelector(".input-buscador-filtro");
            if (!yaExiste) {
                const inputBusqueda = document.createElement("input");
                inputBusqueda.type = "text";
                inputBusqueda.placeholder = "Buscar...";
                inputBusqueda.classList.add("input-buscador-filtro");

                contenedorOpciones.classList.add("contenedor-opciones-scroll");
                contenedorOpciones.insertBefore(inputBusqueda, contenedorOpciones.firstChild);

                inputBusqueda.addEventListener("input", function () {
                    const valor = this.value.toLowerCase();
                    contenedorOpciones.querySelectorAll(".opcion-filtro").forEach(op => {
                        const texto = op.textContent.toLowerCase();
                        op.style.display = texto.includes(valor) ? "block" : "none";
                    });
                });
            }
        }
    });

    function verificarFiltrosActivos() {
        const algunActivo = document.querySelector(".opcion-filtro.activa");
        btnLimpiar.style.display = algunActivo ? "block" : "none";
    }

    window.limpiarFiltros = function () {
        document.querySelectorAll('.opcion-filtro').forEach(opt => {
            opt.classList.remove('activa', 'no-hover');
        });
        document.querySelectorAll('.contenedor-opciones').forEach(grupo => {
            grupo.classList.remove('tiene-seleccion');
        });
        verificarFiltrosActivos();
    };

    verificarFiltrosActivos();

    // ⬇️ Función que realmente inserta el calendario
    function configurarFlatpickr(container) {
        const calendarWrapper = document.createElement("div");
        container.appendChild(calendarWrapper);

        flatpickr(calendarWrapper, {
            inline: true,
            locale: "es",
            dateFormat: "Y-m-d",
            showMonths: 1,
            onReady: function (selectedDates, dateStr, instance) {
                const btnHoy = document.createElement("span");
                btnHoy.textContent = "Hoy";
                btnHoy.className = "flatpickr-today-btn";
                btnHoy.style.cssText = "color:#333;cursor:pointer;font-size:14px;";

                const btnLimpiar = document.createElement("span");
                btnLimpiar.textContent = "Limpiar";
                btnLimpiar.className = "flatpickr-clear-btn";
                btnLimpiar.style.cssText = "color:#333;cursor:pointer;font-size:14px;";

                btnHoy.addEventListener("click", () => instance.setDate(new Date()));
                btnLimpiar.addEventListener("click", () => instance.clear());

                const footer = document.createElement("div");
                footer.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-top:1px solid #e6e6e6;margin-top:5px;";
                footer.appendChild(btnLimpiar);
                footer.appendChild(btnHoy);

                instance.calendarContainer.appendChild(footer);
            }
        });
    }
});

function ocultarFiltros() {
    const filtroPanel = document.getElementById("filtro-lateral");
    const botonFiltrar = document.getElementById("filter-btn");
    const contenedorPrincipal = document.getElementById("contenedor-principal");

    if (filtroPanel && botonFiltrar && contenedorPrincipal) {
        filtroPanel.classList.remove("activo");
        contenedorPrincipal.classList.remove("expandido");
        botonFiltrar.style.display = "inline-block";
    }
}

//Aqui tratare de generar los containers de las cuentas afiliadas dinamicamente, o sea conectado al back