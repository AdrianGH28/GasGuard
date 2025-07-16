//form-reporte-fuga es una idea de nombre para el id del forms, camialoo dependiendo de como lo  llames
window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});

/*document.getElementById("form-reporte-fuga").addEventListener("submit", async (e) => {
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
});*/

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/reportes-afiliado", {
            credentials: "include"
        });

        if (!res.ok) {
            throw new Error("Error al obtener los reportes del afiliado.");
        }

        const resJson = await res.json();
        const reportes = resJson.data;

        console.log("Reportes recibidos:", reportes);

        const reportesContainer = document.getElementById("containerreportes");
        if (!reportesContainer) {
            console.error("❌ No se encontró el contenedor con id 'containerreportes'");
            return;
        }

        
        let grupoContenedores = null;

        reportes.forEach((reporte, index) => {
              console.log(`📄 Reporte #${index + 1}:`, reporte);

            const tipoReporte = parseInt(reporte.id_tireporte);
            console.log("➡️ id_tireporte:", tipoReporte);

             if (isNaN(tipoReporte)) {
                 console.warn("❌ id_tireporte inválido. Verifica que venga en el JSON desde el backend.");
                }
            if (index % 4 === 0) {
                grupoContenedores = document.createElement("div");
                grupoContenedores.classList.add("grupodetarjetas");
                reportesContainer.appendChild(grupoContenedores);
            }

            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta");

            // Ícono principal según tipo de reporte (id_tireporte)
            const icono = document.createElement("i");
            switch (reporte.id_tireporte) {
                case 1: // Instalación
                    icono.className = "fa fa-truck-ramp-box";
                    break;
                case 2: // Fuga
                    icono.className = "fa fa-screwdriver-wrench";
                    break;
                case 3: // Desinstalación
                    icono.className = "fa fa-truck";
                    break;
                default:
                    icono.className = "fa fa-file";
            }

            // Bloque texto
            const textotarjeta = document.createElement("div");
            textotarjeta.classList.add("textotarjeta");

            const estado = document.createElement("h2");
            const estadoIcon = document.createElement("i");
            estadoIcon.className = "fa fa-circle";
            estado.appendChild(estadoIcon);
            const estadoTexto = reporte.estado?.toLowerCase() === "realizada" ? "Solucionado" : "Pendiente";
            estado.innerHTML += ` ${estadoTexto}`;

            const encargado = document.createElement("p");
            encargado.textContent = "Encargado:";

            const nombre = document.createElement("p");
            nombre.textContent = reporte.nombre_tecnico || "Sin asignar";

            const fechaRegistro = document.createElement("p");
            fechaRegistro.textContent = "Fecha de registro:";

            const fechaInicio = document.createElement("p");
            fechaInicio.textContent = reporte.fecini_reporte || "No registrada";

            textotarjeta.appendChild(estado);
            textotarjeta.appendChild(encargado);
            textotarjeta.appendChild(nombre);
            textotarjeta.appendChild(fechaRegistro);
            textotarjeta.appendChild(fechaInicio);

            // Si está solucionado, mostrar fecha de solución
            if (reporte.estado?.toLowerCase() === "realizada") {
                const fechaSolucion = document.createElement("p");
                fechaSolucion.textContent = "Fecha de solución:";
                const fechaFin = document.createElement("p");
                fechaFin.textContent = reporte.fecfin_reporte || "No registrada";
                textotarjeta.appendChild(fechaSolucion);
                textotarjeta.appendChild(fechaFin);
            }

            const btnVerMas = document.createElement("button");
            btnVerMas.textContent = "Ver más";
            textotarjeta.appendChild(btnVerMas);

            // Si está pendiente, agregar ícono de cancelar (❌)
            if (reporte.estado?.toLowerCase() === "pendiente") {
                const iconCancel = document.createElement("div");
                iconCancel.classList.add("centrareltache"); // usa tu misma clase
                const tache = document.createElement("i");
                tache.className = "fa fa-xmark";
                iconCancel.appendChild(tache);
                tarjeta.appendChild(iconCancel);
            }

            // Agregar elementos a la tarjeta
            tarjeta.appendChild(icono);
            tarjeta.appendChild(textotarjeta);

            // Agregar tarjeta al grupo
            grupoContenedores.appendChild(tarjeta);
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

///////////////////////barra de filtros
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
        pintarReportes(reportesDummy);
    };

    verificarFiltrosActivos();

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

    const btnAplicar = document.querySelector(".boton-aplicar-filtro");
    if (btnAplicar) {
        btnAplicar.addEventListener("click", function () {
            const getFiltroSeleccionado = (nombreCategoria) => {
                const categoria = Array.from(document.querySelectorAll(".categoria-filtro"))
                    .find(cat => cat.querySelector(".categoria-header span")?.textContent.trim() === nombreCategoria);
                const activa = categoria?.querySelector(".opcion-filtro.activa");
                return activa?.textContent.trim() || "";
            };

            const estado = getFiltroSeleccionado("Estado");
            const tipo = getFiltroSeleccionado("Tipo");
            const mes = getFiltroSeleccionado("Mes");
            const año = getFiltroSeleccionado("Año");

            const fechaReg = document.querySelector("#fecha-registro input")?._flatpickr?.selectedDates?.[0];
            const fechaSol = document.querySelector("#fecha-solucion input")?._flatpickr?.selectedDates?.[0];

            const mesSel = !!mes;
            const añoSel = !!año;
            const fechaRegSel = !!fechaReg;
            const fechaSolSel = !!fechaSol;

            const invalido =
                (mesSel && fechaRegSel) ||
                (mesSel && fechaSolSel) ||
                (añoSel && fechaRegSel && fechaSolSel) ||
                (mesSel && añoSel && fechaRegSel) ||
                (mesSel && añoSel && fechaSolSel);

            if (invalido) {
                console.log("❌ Combinación inválida: no se puede filtrar con fechas y mes/año al mismo tiempo.");
                return;
            }

            const filtrados = reportesDummy.filter(rep => {
                const estadoRep = rep.fechaSol ? "Solucionado" : "Pendiente";

                const cumpleEstado = !estado || estadoRep === estado;
                const cumpleTipo = !tipo || rep.tipo === tipo;

                let cumpleMes = true;
                let cumpleAño = true;
                if (mesSel || añoSel) {
                    const [añoReg, mesReg] = rep.fechaReg.split("-").map(Number);
                    if (mesSel) {
                        const numMes = convertirMesANumero(mes);
                        cumpleMes = mesReg === numMes;
                    }
                    if (añoSel) {
                        cumpleAño = añoReg === parseInt(año);
                    }
                }

                const cumpleFechaReg = fechaRegSel ? rep.fechaReg === formatoFecha(fechaReg) : true;
                const cumpleFechaSol = fechaSolSel ? rep.fechaSol === formatoFecha(fechaSol) : true;

                return cumpleEstado && cumpleTipo && cumpleMes && cumpleAño && cumpleFechaReg && cumpleFechaSol;
            });

            pintarReportes(filtrados);
        });
    }

    function convertirMesANumero(mesTexto) {
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const index = meses.findIndex(m => m.toLowerCase() === mesTexto.toLowerCase());
        return index + 1;
    }

    function formatoFecha(date) {
        return date.toISOString().split("T")[0];
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

