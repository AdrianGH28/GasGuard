document.addEventListener("DOMContentLoaded", async () => {
    // Cerrar sesión
    document.getElementById("cerrars").addEventListener("click", () => {
        document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.location.href = "/";
    });

    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/usuario");
        if (!res.ok) {
            throw new Error("Error al obtener la información del usuario");
        }

        const resJson = await res.json();
        const usuario = resJson.data;

        document.getElementById("nombre").value = usuario.nom_cli;
        document.getElementById("appat").value = usuario.appat_cli;
        document.getElementById("correo").value = usuario.correo_cli;
        document.getElementById("cp").value = usuario.codigop;
        document.getElementById("estado").value = usuario.nom_estado;
        document.getElementById("ciudad").value = usuario.nom_ciudad;
        document.getElementById("colonia").value = usuario.nom_col;
        document.getElementById("calle").value = usuario.nom_calle;
        document.getElementById("numero").value = usuario.numero_direc;
    } catch (error) {
        console.error('Error:', error);
    }
});

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validarNumero(numero) {
    return /^\d+$/.test(numero);
}

async function actualizarUsuario() {
    if (confirm("¿Está seguro de que desea actualizar los datos?")) {
        const nombre = document.getElementById("nombre").value;
        const appat = document.getElementById("appat").value;
        const apmat = document.getElementById("apmat").value;
        const correo = document.getElementById("correo").value;
        const cp = document.getElementById("cp").value;
        const estado = document.getElementById("estado").value;
        const ciudad = document.getElementById("ciudad").value;
        const colonia = document.getElementById("colonia").value;
        const calle = document.getElementById("calle").value;
        const numero = document.getElementById("numero").value;

        if (!validarEmail(correo)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return;
        }

        if (!validarNumero(numero)) {
            alert('Por favor, ingrese solo números en el campo de número del hogar.');
            return;
        }

        const datos = {
            nombre,
            appat,
            apmat,
            correo,
            cp,
            estado,
            ciudad,
            colonia,
            calle,
            numero
        };

        try {
            const res = await fetch("http://localhost:4000/api/usuario", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            if (!res.ok) {
                throw new Error("Error al actualizar la información del usuario");
            }

            const resJson = await res.json();
            alert(resJson.message);

            // Recargar datos actualizados
            const usuarioActualizado = await res.json();
            document.getElementById("nombre").value = usuarioActualizado.data.nom_cli;
            document.getElementById("appat").value = usuarioActualizado.data.appat_cli;
            document.getElementById("apmat").value = usuarioActualizado.data.apmat_cli;
            document.getElementById("correo").value = usuarioActualizado.data.correo_cli;
            document.getElementById("estado").value = usuarioActualizado.data.nom_estado;
            document.getElementById("cp").value = usuarioActualizado.data.codigop;
            document.getElementById("ciudad").value = usuarioActualizado.data.nom_ciudad;
            document.getElementById("colonia").value = usuarioActualizado.data.nom_col;
            document.getElementById("calle").value = usuarioActualizado.data.nom_calle;
            document.getElementById("numero").value = usuarioActualizado.data.numero_direc;
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al actualizar la información.');
        }
    }
}