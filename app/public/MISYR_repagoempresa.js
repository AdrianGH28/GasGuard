window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});

let montoTotal = 0;
let mesespl = 0;

async function calcularMonto() {
    const tiplan = document.querySelector('#subscription').value;
    const noAfiliados = parseInt(document.querySelector('#disp').value) || 0;
    
    console.log("Datos enviados al backend:", { tiplan, noAfiliados });
    
    if (!tiplan || !noAfiliados) {
        alert('info', "Todos los campos son obligatorios.");
        return;
    }

    if (isNaN(noAfiliados) || noAfiliados < 1 || noAfiliados > 20) {
        alert('error', "El número de afiliados debe estar entre 1 y 20.");
        return;
    }
    
    try {
        const res = await fetch('/api/obtener-precio-empr', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tiplan, noAfiliados
            })
        });

        const resJson = await res.json();

        if (!res.ok) {
            alert('error', resJson.message || "Error desconocido al obtener los datos");
            return;
        }

        const data = resJson;
        console.log("Datos recibidos:", data);

        if (!data || !data.planes || data.planes.length === 0) {
            alert('error', "Datos inválidos recibidos.");
            return;
        }
         
        const planData = data.planes[0];
        
        // Obtener los valores del plan
        const precioPlan = parseFloat(planData.pbas_tiplan) || 0;
        const precioAfiliado = parseFloat(planData.ppp_nmafil) || 0;
        
        // Cálculo del monto
        let porcentaje = 1;
        switch (tiplan) {
            case "mensual":
                mesespl = 1;
                porcentaje = 0.5;
                break;
            case "semestral":
                mesespl = 6;
                porcentaje = 1.5;
                break;
            case "anual":
                mesespl = 12;
                porcentaje = 2.5;
                break;
            default:
                alert('error', "Tipo de plan no válido.");
                return;
        }

        montoTotal = precioPlan + (precioAfiliado * noAfiliados * porcentaje);
        
        document.getElementById("montoPagar").innerText = `$${montoTotal.toFixed(2)} MXN`;
        
    } catch (error) {
        console.error("Error al calcular el monto:", error);
        alert('error', "Hubo un problema al calcular el monto.");
    }
}

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const tiplan = document.querySelector('#subscription').value;
    const noAfiliados = parseInt(document.querySelector('#disp').value) || 0;
    const correo = localStorage.getItem('resetEmail');
    
    
    if (!tiplan || !noAfiliados) {
        alert('info', "Todos los campos son obligatorios.");
        return;
    }

    if (isNaN(noAfiliados) || noAfiliados < 1 || noAfiliados > 20) {
        alert('error', "El número de afiliados debe estar entre 1 y 20.");
        return;
    }

    try {
        // Verificar que se haya calculado el monto primero
        if (!montoTotal) {
            alert('info', "Por favor, calcule el monto primero.");
            return;
        }
        
        // Enviar la suscripción al backend
        const res = await fetch("/api/repagoempresa", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                tiplan, 
                noAfiliados, // Asegurar que los nombres coincidan con el backend
                correo, 
                monto: montoTotal, 
                meses: mesespl 
            })
        });

        const resJson = await res.json();
        console.log("Respuesta del servidor:", resJson);

        if (resJson.status === "ok") {
            alert("Suscripción registrada exitosamente");
            // Agregar redirección cuando la respuesta es exitosa
            if (resJson.redirect) {
                window.location.href = resJson.redirect;
            }
        } else {
            alert('error', "Error: " + resJson.message);
        }
    } catch (error) {
        console.error("Error al procesar la suscripción:", error);
        alert('error', "Hubo un problema al procesar la suscripción.");
    }
});