let mesespl = 0;
let stripeInstance = null;
let cardElement = null;

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "1";
  
  // Inicializar Stripe (solo una vez)
  stripeInstance = Stripe("pk_test_51RElTVAcJ5RjOoMexAKGLDDfthpBSUdYSSkxEJ4Hzs8GbPcLBcaDvghV8lioRWdLypc91xTTDswFSTUEnRLbZQGi00a8oTlbv8");
  const elements = stripeInstance.elements();
  
  // Crear el elemento para la tarjeta
  cardElement = elements.create("card", {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    }
  });
  
  // Montar el elemento de tarjeta
  cardElement.mount("#card-element");
  
  // Manejar errores de validación
  cardElement.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
      displayError.textContent = error.message;
    } else {
      displayError.textContent = '';
    }
    
    // Habilitar/deshabilitar el botón de pago según la validez de la tarjeta
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
      submitButton.disabled = !!error;
    }
  });
  
  // Preparar el formulario de pago
  const paymentForm = document.getElementById('pagos-form');
  
  if (paymentForm) {
    paymentForm.addEventListener("submit", function(event) {
      event.preventDefault(); // Prevenir que el formulario se envíe de forma tradicional
      handleSubmit(event);
    });
    
    // Asegurarnos de que el botón de cálculo funcione
    const calculateButton = document.getElementById('monto');
    if (calculateButton) {
      calculateButton.addEventListener('click', calcularMonto);
    }
  } else {
    console.error("No se encontró el formulario de pago");
  }
});

// Variable global para el monto total (declarada una sola vez)
let montoTotal = 0;

async function calcularMonto() {
    const tiplan = document.querySelector('#subscription').value;
    
    console.log("Datos enviados al backend:", { tiplan });
    
    if (tiplan === "selectop") {
        alert('info', "Elige un tipo de plan.");
        return;
    }
    
    try {
        const response = await fetch('/api/obtener-precio-user', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tiplan
            })
        });

        const data = await response.json();
    
    // Verificar respuesta correcta
    if (!response.ok) {
      throw new Error(data.message || "Error al calcular el monto");
    }
    
    if (!data?.planes?.length) {
      throw new Error("No se encontraron datos de precios");
    }
    
    // Calcular monto total
    const plan = data.planes[0];
    const precioBase = parseFloat(plan.pbas_tiplan) || 0;
    
    // Obtener multiplicador según el plan
    mesespl = { mensual: 1, semestral: 6, anual: 12 }[tiplan] || 1;
    
    // Calcular precio con descuento para planes semestrales y anuales
    const porcentajeDescuento = tiplan === "mensual" ? 1 : tiplan === "semestral" ? 0.9 : 0.8;
    montoTotal = (precioBase) * mesespl * porcentajeDescuento;

        document.getElementById("montoPagar").innerText = `$${montoTotal.toFixed(2)} MXN`;
    
    // Habilitar el botón de pago
    document.getElementById('submit-button').disabled = false;
    
    // Informar al usuario
    mostrarAlerta("success", "Monto calculado correctamente");
    
  } catch (error) {
    mostrarAlerta("error", error.message || "Error al calcular el precio");
    console.error("Error:", error);
  }
}


async function handleSubmit(event) {
  event.preventDefault();
  const stripeEmail = document.getElementById("email").value; // Solo para Stripe
  const userEmail = localStorage.getItem('resetEmail'); // Usuario que recibirá la suscripción
  const cardholderName = document.getElementById("cardholder-name").value;
        console.log("Correo asociado:", userEmail);
        console.log("Correo almacenado en localStorage:", localStorage.getItem('resetEmail'));
  if (!stripeEmail) {
    mostrarAlerta("error", "Se requiere un correo electrónico para el pago");
    return;
  }
  
  if (!userEmail) {
    mostrarAlerta("error", "No se encontró el usuario logueado");
    return;
  }
  
  if (!cardholderName) {
    mostrarAlerta("error", "Se requiere el nombre del titular de la tarjeta");
    return;
  }
  
  if (!montoTotal) {
    mostrarAlerta("error", "Por favor calcula el monto primero");
    return;
  }
  
  const tiplan = document.getElementById("subscription").value;
  const noAfiliados = parseInt(document.getElementById("disp").value);
  
  const submitButton = document.getElementById('submit-button');
  submitButton.disabled = true;
  submitButton.textContent = "Procesando...";
  
  try {
    // 1. Crear cliente en Stripe (con email del formulario)
    const customerResponse = await fetch("/api/create-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: stripeEmail }),
    });
    
    if (!customerResponse.ok) {
      const errorData = await customerResponse.json();
      throw new Error(errorData.error || "Error al crear cliente");
    }
    
    const { customerId } = await customerResponse.json();
    
    // 2. Crear método de pago
    const { error: setupError, paymentMethod } = await stripeInstance.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        email: stripeEmail,
        name: cardholderName
      }
    });
    
    if (setupError) {
      throw new Error(setupError.message || "Error al configurar el método de pago");
    }
    
    // 3. Asociar método de pago
    const attachResponse = await fetch("/api/attach-payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        paymentMethodId: paymentMethod.id,
        setAsDefault: true
      }),
    });
    
    if (!attachResponse.ok) {
      const errorData = await attachResponse.json();
      throw new Error(errorData.error || "Error al asociar método de pago");
    }
    
    // 4. Crear suscripción con metadata del usuario real
    const subscriptionResponse = await fetch("/api/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        tiplan,
        afiliados: noAfiliados,
        montoTotal: Math.round(montoTotal * 100),
        paymentMethodId: paymentMethod.id,
        userEmail: userEmail // IMPORTANTE: Email del usuario que recibirá la suscripción
      }),
    });
    
    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      throw new Error(errorData.error || "Error al crear suscripción");
    }
    
    const { subscription } = await subscriptionResponse.json();
    
    // 5. Registrar en BD directamente (opcional, el webhook también lo hará)
    const dbResponse = await fetch("/api/repagousuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: userEmail, // Usuario que recibirá la suscripción
        nombre: cardholderName,
        tiplan,
        noAfiliados,
        monto: montoTotal,
        meses: mesespl,
        subscriptionId: subscription.id
      })
    });
    
    if (!dbResponse.ok) {
      console.error("Error al registrar en BD, pero la suscripción fue creada");
    }
    
    document.getElementById("payment-message").innerHTML = 
      `<div class="success-message">¡Suscripción creada exitosamente! Redirigiendo...</div>`;
    
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    
  } catch (error) {
    document.getElementById("payment-message").innerHTML = 
      `<div class="error-message">${error.message}</div>`;
    console.error("Error en el proceso de pago:", error);
    
    submitButton.disabled = false;
    submitButton.textContent = "Pagar ahora";
  }
}
function mostrarAlerta(tipo, mensaje) {
  const alertamodal = document.getElementById("alertamodal");
  const alertheading = document.querySelector(".alertheading");
  const alertcontentcont = document.querySelector(".alertcontentcont");
  const iconElement = document.querySelector(".alerticon i");
  
  // Configurar icono según tipo
  if (tipo === "error") {
    iconElement.className = "fa-solid fa-circle-exclamation";
    iconElement.style.color = "#f44336";
    alertheading.textContent = "Error";
  } else if (tipo === "success") {
    iconElement.className = "fa-solid fa-circle-check";
    iconElement.style.color = "#4CAF50";
    alertheading.textContent = "Éxito";
  } else if (tipo === "warning") {
    iconElement.className = "fa-solid fa-circle-info";
    iconElement.style.color = "#ff9800";
    alertheading.textContent = "Advertencia";
  }
  
  // Establecer mensaje
  alertcontentcont.textContent = mensaje;
  
  // Mostrar alerta
  alertamodal.style.display = "flex";
  
  // Auto-cerrar después de 3 segundos para mensajes no críticos
  if (tipo !== "warning") {
    setTimeout(() => {
      cerraralerta();
    }, 3000);
  }
}

// Función para cerrar alerta
function cerraralerta() {
  document.getElementById("alertamodal").style.display = "none";
}

// Función para mostrar alerta con confirmación
function mostraralerta(tipo, mensaje) {
  mostrarAlerta(tipo, mensaje);
  // Configurar botón de aceptar para regresar a la página anterior
  document.getElementById("aceptarbtnalerta").onclick = function() {
    window.location.href = "/tipocuenta";
  };
}