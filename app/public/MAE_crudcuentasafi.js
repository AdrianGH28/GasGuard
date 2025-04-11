
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

        // Si quieres cerrar el modal automáticamente:
        setTimeout(() => {
            cerraralerta();
            document.getElementById("modal").close();
            document.getElementById("cuentas-afiliadas-form").reset();
        }, 3000);
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
