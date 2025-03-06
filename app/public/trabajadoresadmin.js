document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/trabajadoresadmin");
        if (!res.ok) {
            throw new Error("Error al obtener la información de los trabajadores");
        }

        const resJson = await res.json();
        const trabajadores = resJson.data;

        const trabajadoresContainer = document.getElementById("trabajadores-container");

        trabajadores.forEach(trabajador => {
            const trabajadorElement = document.createElement("div");
            trabajadorElement.classList.add("trabajador");

            trabajadorElement.innerHTML = `
                <h3>${trabajador.nom_cli} ${trabajador.appat_cli} ${trabajador.apmat_cli}</h3>
                <p><strong>Correo:</strong> ${trabajador.correo_cli}</p>
                <p><strong>Dirección:</strong> ${trabajador.nom_calle} ${trabajador.numero_direc}, ${trabajador.nom_col}, ${trabajador.nom_ciudad}, ${trabajador.nom_pais}</p>
                <button class="delete-button" onclick="eliminarTrabajador(${trabajador.id_cliente})">Eliminar</button>
            `;

            trabajadoresContainer.appendChild(trabajadorElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

async function eliminarTrabajador(idCliente) {
    if (confirm("¿Está seguro de que desea eliminar este trabajador?")) {
        try {
            const res = await fetch(`https://gasguard-production.up.railway.app/api/trabajadoresadmin/${idCliente}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Error al eliminar el trabajador");
            }

            const resJson = await res.json();
            alert(resJson.message);

            // Recargar la página para reflejar los cambios
            location.reload();
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al eliminar el trabajador.');
        }
    }
}