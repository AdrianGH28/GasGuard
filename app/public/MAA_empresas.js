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
        (texto === "cuentas afiliadas" && rutaActual.includes("cuentasafiliadas")) ||
        (texto === "usuarios individuales" && rutaActual.includes("usuarios"))
      ) {
        opcion.classList.add("activa");
      }
    });
    
  
    // === LLAMADA A TU FUNCIÓN PARA PINTAR REPORTES ===
    pintarReportes(reportesDummy);
  
    // === FUNCIONALIDAD DE BÚSQUEDA EN VIVO POR ID ===
    const inputBusqueda = document.getElementById("input-busqueda-encargado");
  
    if (inputBusqueda) {
      inputBusqueda.addEventListener("input", function () {
        const texto = this.value.toLowerCase().trim();
        const tarjetas = document.querySelectorAll(".usuario-card");
  
        tarjetas.forEach(tarjeta => {
          const nombreID = tarjeta.querySelector(".usuario-id").textContent.toLowerCase();
          if (nombreID.includes(texto)) {
            tarjeta.style.display = "flex";
          } else {
            tarjeta.style.display = "none";
          }
        });
      });
    }
  });
  
  // 1) Datos dummy de empresas
const usuariosDummy = [
  {
    id: "Autonomus Gas",
    correo: "valentinaxanaeth1@gasguard.com",
    direccion: "Mar Mediterráneo 117, Popotla Miguel Hidalgo CDMX",
    cuentasContratadas: 10,
    cuentasAfiliadas: 5
  },
  {
    id: "GasGuard",
    correo: "ejemplo2@gasguard.com",
    direccion: "Av. Reforma 12, Centro Cuauhtémoc CDMX",
    cuentasContratadas: 7,
    cuentasAfiliadas: 2
  },
  {
    id: "Liverpool",
    correo: "valentinaxanaethhaha1@gasguard.com",
    direccion: "Insurgentes Sur 345, Del Valle Benito Juárez CDMX",
    cuentasContratadas: 12,
    cuentasAfiliadas: 6
  },
  {
    id: "Toyota",
    correo: "ejemplo3@gasguard.com",
    direccion: "Insurgentes Sur 345, Del Valle Benito Juárez CDMX",
    cuentasContratadas: 5,
    cuentasAfiliadas: 0
  }
];

// 2) Función para pintar las tarjetas
function pintarUsuarios(lista) {
  const contenedor = document.getElementById("lista-reportes");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  lista.forEach(usuario => {
    const card = document.createElement("article");
    card.className = "usuario-card";

    card.innerHTML = `
      <div class="usuario-info">
        <i class="fa-solid fa-user reporte-icono"></i>
        <div class="usuario-id">${usuario.id}</div>
        <div class="usuario-correo">${usuario.correo}</div>
        <div class="usuario-direccion">${usuario.direccion}</div>
        <div class="contenedor-boton">
          <button class="usuario-boton" data-id="${usuario.id}">Ver más</button>
        </div>
      </div>
    `;

    contenedor.appendChild(card);
  });
}

// 3) Cargar todo cuando la página esté lista
window.addEventListener("load", () => {
  pintarUsuarios(usuariosDummy);

  // Filtro de búsqueda en tiempo real (por ID y empresa)
  const inputBusqueda = document.getElementById("input-busqueda-encargado");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", function () {
      const texto = this.value.toLowerCase().trim();
      const filtrados = usuariosDummy.filter(usuario =>
        usuario.id.toLowerCase().includes(texto) ||
        usuario.empresa.toLowerCase().includes(texto)
      );
      pintarUsuarios(filtrados);
    });
  }
});

// 4) Evento para el botón "Ver más"
document.addEventListener("click", e => {
  if (!e.target.classList.contains("usuario-boton")) return;

  const id = e.target.dataset.id;
  const usuario = usuariosDummy.find(u => u.id === id);
  if (!usuario) return;

  // Mostrar datos en el modal
  const modal = document.getElementById("modalEmpresas");
  if (!modal) return;

  document.getElementById("modal-id").textContent = usuario.id;
  document.getElementById("modal-correo").textContent = usuario.correo;
  document.getElementById("modal-direccion").textContent = usuario.direccion;
  document.getElementById("modal-cuentas").textContent = usuario.cuentasContratadas;
  document.getElementById("modal-afiliadas").textContent = usuario.cuentasAfiliadas;

  modal.showModal();
});

// 5) Cerrar el modal
function cerrarModal() {
  const modal = document.getElementById("modalEmpresas");
  if (modal) modal.close();
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
