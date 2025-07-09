// Datos dummy
const datosAlertas = [
  { fecha: "18/06/24", hora: "19:56:54", valor: 3500 },
  { fecha: "19/06/24", hora: "19:56:32", valor: 3500 },
  { fecha: "12/06/24", hora: "19:56:30", valor: 3500 },
  { fecha: "18/06/24", hora: "19:56:01", valor: 3500 },
  { fecha: "17/06/24", hora: "18:40:22", valor: 3400 },
  { fecha: "17/06/24", hora: "18:39:59", valor: 3400 },
  { fecha: "16/05/24", hora: "15:12:15", valor: 3300 },
  { fecha: "18/04/24", hora: "19:56:54", valor: 3500 },
  { fecha: "19/04/24", hora: "19:56:32", valor: 3500 },
  { fecha: "9/04/24", hora: "19:56:30", valor: 3500 },
  { fecha: "2/04/24", hora: "19:56:01", valor: 3500 },
  { fecha: "16/06/24", hora: "15:11:01", valor: 3300 }
];

// Ordenar por fecha y hora descendente
datosAlertas.sort((a, b) => {
  const fechaA = new Date(`20${a.fecha.split('/')[2]}-${a.fecha.split('/')[1]}-${a.fecha.split('/')[0]}T${a.hora}`);
  const fechaB = new Date(`20${b.fecha.split('/')[2]}-${b.fecha.split('/')[1]}-${b.fecha.split('/')[0]}T${b.hora}`);
  return fechaB - fechaA; // más recientes primero
});

const maxPorPagina = 4;
let paginaActual = 1;

const tbody = document.getElementById("tabla-body");
const spanMostrados = document.getElementById("registros-mostrados");
const spanTotales = document.getElementById("registros-totales");
const spanPagina = document.getElementById("pagina-actual");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");

// Función para mostrar los datos de la página actual
function mostrarPagina(pagina) {
  const inicio = (pagina - 1) * maxPorPagina;
  const fin = inicio + maxPorPagina;
  const datosMostrados = datosAlertas.slice(inicio, fin);

  // Limpiar tabla
  tbody.innerHTML = "";

  // Insertar nuevas filas
  datosMostrados.forEach(alerta => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${alerta.fecha}</td>
      <td>${alerta.hora}</td>
      <td>${alerta.valor}</td>
    `;
    tbody.appendChild(fila);
  });

  // Actualizar contadores
  spanMostrados.textContent = datosMostrados.length;
  spanTotales.textContent = datosAlertas.length;
  spanPagina.textContent = paginaActual;

  actualizarEstadoBotones();
}

// Función para activar/desactivar botones
function actualizarEstadoBotones() {
  const totalPaginas = Math.ceil(datosAlertas.length / maxPorPagina);

  // Anterior
  if (paginaActual > 1) {
    btnAnterior.classList.add("activo");
  } else {
    btnAnterior.classList.remove("activo");
  }

  // Siguiente
  if (paginaActual < totalPaginas) {
    btnSiguiente.classList.add("activo");
  } else {
    btnSiguiente.classList.remove("activo");
  }
}

// Eventos de navegación
btnAnterior.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    mostrarPagina(paginaActual);
  }
});

btnSiguiente.addEventListener("click", () => {
  const totalPaginas = Math.ceil(datosAlertas.length / maxPorPagina);
  if (paginaActual < totalPaginas) {
    paginaActual++;
    mostrarPagina(paginaActual);
  }
});

// Mostrar la primera página al cargar
mostrarPagina(paginaActual);

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