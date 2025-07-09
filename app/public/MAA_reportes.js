document.addEventListener("DOMContentLoaded", function () {
    // === FUNCIONALIDAD DRAWER IZQUIERDO ===
    const barraLateral = document.getElementById("barra-lateral");
    const toggleBarra = document.getElementById("toggle-barra");
    const contenedorPrincipal = document.getElementById("contenedor-principal");
  
    if (barraLateral && toggleBarra && contenedorPrincipal) {
      toggleBarra.addEventListener("click", function () {
        barraLateral.classList.toggle("expandida");
        contenedorPrincipal.classList.toggle("expandida");
      });
    }
  
    // === RESALTAR OPCIÓN ACTIVA DEL DRAWER ===
    const opciones = document.querySelectorAll(".opciones-barra .opcion");
    const rutaActual = window.location.pathname;
  
    opciones.forEach(opcion => {
      const texto = opcion.textContent.trim().toLowerCase();
      if (
        (texto === "reportes" && rutaActual.includes("reportes")) ||
        (texto === "técnicos" && rutaActual.includes("tecnicos")) ||
        (texto === "empresas" && rutaActual.includes("empresas")) ||
        (texto === "cuentas afiliadas" && rutaActual.includes("cuentas-afiliadas")) ||
        (texto === "usuarios individuales" && rutaActual.includes("usuarios"))
      ) {
        opcion.classList.add("activa");
      }
    });
  
    // === FUNCIONALIDAD FILTROS ===
    const filtroPanel = document.getElementById("filtro-lateral");
    const botonFiltrar = document.getElementById("filter-btn");
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
  
    function convertirMesANumero(mesTexto) {
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const index = meses.findIndex(m => m.toLowerCase() === mesTexto.toLowerCase());
      return index + 1;
    }
  
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
  
    // === APLICAR FILTROS AL CLIC EN BOTÓN ===
    const botonAplicarFiltro = document.querySelector(".boton-aplicar-filtro");
  
    if (botonAplicarFiltro) {
      botonAplicarFiltro.addEventListener("click", function () {
        function getFiltroSeleccionado(nombreCategoria) {
          const categorias = document.querySelectorAll(".categoria-filtro");
          for (const cat of categorias) {
            const titulo = cat.querySelector(".categoria-header span")?.textContent.trim();
            if (titulo === nombreCategoria) {
              return cat.querySelector(".opcion-filtro.activa")?.textContent.trim();
            }
          }
          return null;
        }
  
        const estadoSeleccionado = getFiltroSeleccionado("Estado");
        const tipoSeleccionado = getFiltroSeleccionado("Tipo");
        const mesSeleccionado = getFiltroSeleccionado("Mes");
        const añoSeleccionado = getFiltroSeleccionado("Año");
  
        let filtrados = reportesDummy.filter(rep => {
          const estadoActual = rep.fechaSol ? "Solucionado" : "Pendiente";
  
          let coincideEstado = estadoSeleccionado ? estadoActual === estadoSeleccionado : true;
          let coincideTipo = tipoSeleccionado ? rep.tipo === tipoSeleccionado : true;
          let coincideMes = true;
          let coincideAño = true;
  
          if (mesSeleccionado) {
            const mesNumero = convertirMesANumero(mesSeleccionado);
            coincideMes = new Date(rep.fechaReg).getMonth() + 1 === mesNumero;
          }
  
          if (añoSeleccionado) {
            coincideAño = new Date(rep.fechaReg).getFullYear().toString() === añoSeleccionado;
          }
  
          return coincideEstado && coincideTipo && coincideMes && coincideAño;
        });
  
        pintarReportes(filtrados);
        ocultarFiltros();
      });
    }
  
    // === DESCARGA EN PDF ===
    const downloadBtn = document.getElementById("download-btn");
  
    downloadBtn.addEventListener("click", async function () {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const fecha = new Date();
      const fechaStr = fecha.toLocaleDateString();
      const horaStr = fecha.toLocaleTimeString();
  
      doc.setFontSize(18);
      doc.text("Reportes", 105, 20, null, null, "center");
  
      doc.setFontSize(11);
      doc.text(`Fecha de descarga: ${fechaStr}`, 14, 30);
      doc.text(`Hora de descarga: ${horaStr}`, 14, 36);
  
      const tarjetas = document.querySelectorAll("#lista-reportes .reporte-card");
      if (tarjetas.length === 0) {
        alert("No hay reportes visibles para exportar.");
        return;
      }
  
      let y = 50;
      let numReporte = 1;
  
      tarjetas.forEach(tarjeta => {
        const idTexto = tarjeta.querySelector(".reporte-titulo")?.textContent;
        const id = idTexto?.split(" ")[1];
        const reporte = reportesDummy.find(r => r.id == id);
        const detalle = detallesDummy[id];
  
        if (!reporte || !detalle) return;
  
        const estado = reporte.fechaSol ? "Solucionado" : "Pendiente";
  
        const contenido = [
          `Reporte ${numReporte}`,
          `ID: ${reporte.id}`,
          `Estado: ${estado}`,
          `Autor: ${detalle.autor}`,
          `Correo del autor: ${detalle.correoAutor}`,
          `Encargado: ${reporte.encargado}`,
          `Correo del encargado: ${detalle.correoEncargado}`,
          `Fecha de registro: ${reporte.fechaReg}`,
          `Fecha de solución: ${reporte.fechaSol || "Sin solución aún"}`,
          `Descripción: ${detalle.descripcion}`
        ];
  
        doc.setFontSize(10);
        contenido.forEach(linea => {
          const lineasAjustadas = doc.splitTextToSize(linea, 180);
          lineasAjustadas.forEach(sublinea => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            doc.text(sublinea, 14, y);
            y += 6;
          });
        });
  
        y += 4;
        numReporte++;
      });
  
      doc.save("reportes_gasguard.pdf");
    });
  
    // === BÚSQUEDA EN VIVO POR ENCARGADO ===
    const inputBusqueda = document.getElementById("input-busqueda-encargado");
  
    if (inputBusqueda) {
      inputBusqueda.addEventListener("input", function () {
        const texto = this.value.toLowerCase().trim();
        const filtrados = reportesDummy.filter(rep =>
          rep.encargado.toLowerCase().includes(texto)
        );
        pintarReportes(filtrados);
      });
    }
  });
  
  /* 1) Datos dummy — sin campo 'estado', se calcula automáticamente */
const reportesDummy = [
  { id: 70, tipo: "Instalación", encargado: "Javier Muñoz", fechaReg: "2025-03-12", fechaSol: "2025-03-18" },
  { id: 71, tipo: "Retiro",      encargado: "Javier Muñoz", fechaReg: "2025-03-12", fechaSol: ""           },
  { id: 72, tipo: "Reparación",  encargado: "Javier Muñoz", fechaReg: "2025-03-12", fechaSol: ""           },
  { id: 73, tipo: "Reparación",  encargado: "Laura Torres",  fechaReg: "2025-03-15", fechaSol: "2025-03-20"},
  { id: 74, tipo: "Instalación", encargado: "Javier Muñoz", fechaReg: "2025-03-12", fechaSol: "2025-03-18" },
  { id: 75, tipo: "Retiro",      encargado: "Javier Muñoz", fechaReg: "2025-03-12", fechaSol: ""           },
  { id: 76, tipo: "Reparación",  encargado: "Javier Muñoz", fechaReg: "2025-03-12", fechaSol: ""           },
];

/* 2) Íconos por tipo */
const iconMap = {
  Instalación: "fa-solid fa-dolly",
  Reparación : "fa-solid fa-screwdriver-wrench",
  Retiro     : "fa-solid fa-truck",
};

/* 3) Detalles extendidos para el modal */
const detallesDummy = {
  70: { autor:"Mario Pérez",  correoAutor:"mario@gasguard.com",  correoEncargado:"javier@gasguard.com", descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
  71: { autor:"Ana Ruiz",     correoAutor:"ana@gasguard.com",   correoEncargado:"javier@gasguard.com",  descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
  72: { autor:"Carlos López", correoAutor:"carlos@gasguard.com", correoEncargado:"javier@gasguard.com", descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
  73: { autor:"Lucía Torres", correoAutor:"lucia@gasguard.com", correoEncargado:"laura@gasguard.com",   descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
  74: { autor:"Mario Pérez",  correoAutor:"mario@gasguard.com",  correoEncargado:"javier@gasguard.com", descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
  75: { autor:"Ana Ruiz",     correoAutor:"ana@gasguard.com",   correoEncargado:"javier@gasguard.com",  descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
  76: { autor:"Carlos López", correoAutor:"carlos@gasguard.com", correoEncargado:"javier@gasguard.com", descripcion:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " },
};


/* 4) Pinta las tarjetas */
function pintarReportes(lista){
  const cont = document.getElementById("lista-reportes");
  if(!cont) return;
  cont.innerHTML = "";
  lista.forEach(r=>{
    const estado = r.fechaSol ? "Solucionado" : "Pendiente";
    const art = document.createElement("article");
    art.className = `reporte-card ${estado.toLowerCase()}`;
    art.innerHTML = `
      <i class="reporte-icono ${iconMap[r.tipo] || "fa-solid fa-file"}"></i>
      <div class="reporte-info">
        <div class="reporte-titulo">ROJO ${r.id}</div>
        <div class="reporte-encargado">Encargado: ${r.encargado}</div>
        <div class="reporte-fecha">Fecha de registro: ${r.fechaReg}</div>
        ${ r.fechaSol ? `<div class="reporte-fecha">Fecha de solución: ${r.fechaSol}</div>` : "" }
        <div class="reporte-estado">
          Estado: <span class="punto ${estado==="Solucionado"?"solucionado":"pendiente"}"></span> ${estado}
        </div>
        <button class="reporte-boton" data-id="${r.id}">Ver más</button>
      </div>`;
    cont.appendChild(art);
  });
}
window.addEventListener("load",()=>pintarReportes(reportesDummy));

/* 5) Modal “Ver más” */
document.addEventListener("click",e=>{
  if(!e.target.classList.contains("reporte-boton")) return;

  const id      = e.target.dataset.id;
  const rep     = reportesDummy.find(r=>r.id==id);
  const det     = detallesDummy[id];
  if(!rep||!det) return;

  /* -- rellena campos fijos -- */
  document.getElementById("modal-autor").textContent            = det.autor;
  document.getElementById("modal-correo-autor").textContent     = det.correoAutor;
  document.getElementById("modal-encargado").textContent        = rep.encargado;
  document.getElementById("modal-correo-encargado").textContent = det.correoEncargado;
  document.getElementById("modal-fecha-reg").textContent        = rep.fechaReg;
  document.getElementById("modal-descripcion").textContent      = det.descripcion;

  /* -- inserta / actualiza “Tipo” y <hr> justo debajo del título -- */
  const modalInfo = document.querySelector("#modalVerReporte .modal-info");
  let   tipoDiv   = document.getElementById("modal-tipo");
  let   hrDiv     = document.getElementById("modal-divider");

  if(!tipoDiv){
    tipoDiv         = document.createElement("div");
    tipoDiv.id      = "modal-tipo";
    tipoDiv.className = "modal-tipo";
    modalInfo.prepend(tipoDiv);          // va al principio

    hrDiv           = document.createElement("hr");
    hrDiv.id        = "modal-divider";
    hrDiv.className = "modal-divider";
    modalInfo.insertBefore(hrDiv, modalInfo.children[1]);  // inmediatamente después del tipo
  }
  tipoDiv.textContent = `Tipo: ${rep.tipo}`;

  /* -- lógica de fechaSol + botón imagen -- */
  const filaFechaSol = document.getElementById("fila-fecha-sol");
  const btnImagen    = document.getElementById("btn-ver-imagen");
  const estado       = rep.fechaSol ? "Solucionado" : "Pendiente";

  if(rep.tipo==="Instalación" || (rep.tipo==="Reparación" && estado==="Solucionado")){
    filaFechaSol.style.display="block";
    document.getElementById("modal-fecha-sol").textContent = rep.fechaSol;
    btnImagen.style.display="inline-block";
  }else{
    filaFechaSol.style.display="none";
    btnImagen.style.display="none";
  }

  document.getElementById("modalVerReporte").showModal();
  
  // Imagen dummy por ID
  const imagenesDummy = {
    70: "https://tse4.mm.bing.net/th/id/OIP.K275zLzX44QFAPcvxkqUmwHaE8?pid=Api&P=0&h=180",
    73: "https://tse1.mm.bing.net/th/id/OIP.rQ3bWtNSiAt2phUGEtUmmwHaE7?pid=Api&P=0&h=180",
    74: "https://tse2.mm.bing.net/th/id/OIP.heZY9ZTfqhAv6TcN7-mCagHaEK?pid=Api&P=0&h=180"
    // Puedes agregar más aquí
  };

  const modalImagen = document.getElementById("modalImagen");
  const imagenModal = document.getElementById("imagenModal");

  // Delegar al botón de imagen
  const btnVerImagen = document.getElementById("btn-ver-imagen");
  btnVerImagen.onclick = () => {
    const ruta = imagenesDummy[id] || "https://via.placeholder.com/600x400?text=Sin+imagen";
    imagenModal.src = ruta;
    modalImagen.showModal();
  };

});

/* 6) Cerrar modal */
function cerrarModal(){
  document.getElementById("modalVerReporte").close();
}

// 7) Búsqueda en vivo por nombre del encargado
document.addEventListener("DOMContentLoaded", () => {
  const inputBusqueda = document.getElementById("input-busqueda-encargado");

  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", function () {
      const texto = this.value.toLowerCase().trim();

      const filtrados = reportesDummy.filter(rep =>
        rep.encargado.toLowerCase().includes(texto)
      );

      pintarReportes(filtrados);
    });
  }
});

function cerrarModalImagen() {
  document.getElementById("modalImagen").close();
}

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
