//form-reporte-fuga es una idea de nombre para el id del forms, camialoo dependiendo de como lo  llames


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

