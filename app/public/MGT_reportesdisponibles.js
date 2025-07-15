window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/reportes-disponibles", {
            credentials: "include"
        });

        if (!res.ok) {
            throw new Error("Error al obtener los reportes disponibles.");
        }

        const resJson = await res.json();
        const reportes = resJson.reportes;
        const reportesContainer = document.getElementById("containerreportesdisponibles");

        if (!reportesContainer) {
            console.error("Contenedor de reportes no encontrado.");
            return;
        }

        if (reportes.length === 0) {
            reportesContainer.innerHTML = "<p>No hay reportes disponibles.</p>";
            return;
        }

        reportes.forEach((reporte) => {
            const contenedor = document.createElement("div");
            contenedor.classList.add("tarjeta-reporte"); // estilo sugerido, puedes definirlo en CSS

            contenedor.innerHTML = `
                <h3>Ticket #${reporte.nmticket_reporte}</h3>
                <p><strong>Tipo:</strong> ${reporte.tipo_reporte}</p>
                <p><strong>Usuario:</strong> ${reporte.nombre_usuario}</p>
                <p><strong>Fecha de inicio:</strong> ${new Date(reporte.fecini_reporte).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> ${reporte.estado_reporte}</p>
                <p><strong>Descripción:</strong> ${reporte.descri_reporte}</p>
            `;

            reportesContainer.appendChild(contenedor);
        });

    } catch (error) {
        console.error("Error:", error);
    }
});
