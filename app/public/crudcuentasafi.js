//cambia el getId del form
document.getElementById("enviar-correov-form").addEventListener("submit", async (e) => {
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

    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        mostraralerta('info', "Todos los campos son obligatorios.");
        return;
    }
    
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (password.length < 8 || password.length > 12) {
        mostraralerta('error', "La contraseña debe tener entre 8 y 12 caracteres.");
        return;
    }
    
    if (!regexLetras.test(nombre) || !regexLetras.test(ciudad) || !regexLetras.test(colonia) || !regexLetras.test(estado)) {
        mostraralerta('error', "Los campos de nombre, ciudad, colonia y estado solo deben contener letras y espacios.");
        return;
    }
    if (password !== confpass) {
        mostraralerta('error', "Las contraseñas no coinciden.");
        return;
    }
    const regexnums = /^[1234567890\s]+$/;

    if (!regexnums.test(cp) || !regexnums.test(numero)) {
        mostraralerta('error', "Los campos de CP y número solo deben contener caracteres numéricos.");
        return;
    }

    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/registro-afiliados", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass
            })
        });
    
        const resJson = await res.json();
    
        if (!res.ok) {
            mostraralerta('error', resJson.message || "Error desconocido al registrar.");
            return;
        }
    ///esto cambia, si todo esta bien pues cierra modal o algo
    const result = await response.json();
    if (result.status === "ok") {
        
        } else {
            

            
        }
    } catch (error) {
        mostraralerta('error', "Error de conexión con el servidor.");
        console.log("Error:", error);
    }
});