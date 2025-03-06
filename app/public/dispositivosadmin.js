document.addEventListener("DOMContentLoaded", async () => {
    // Cerrar sesión
    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/dispositivosadmin");
        if (!res.ok) {
            throw new Error("Error al obtener la información de los dispositivos");
        }

        const resJson = await res.json();
        const dispositivos = resJson.data;

        const dispositivosContainer = document.getElementById("dispositivos-container");

        dispositivos.forEach(dispositivo => {
            const dispositivoElement = document.createElement("div");
            dispositivoElement.classList.add("dispositivo");

            dispositivoElement.innerHTML = `
                <h3>Dispositivo</h3>
                <p><strong>ID:</strong> ${dispositivo.id_dispositivo}</p>
                <p><strong>WiFi:</strong> ${dispositivo.wifi_dis}</p>
                <p><strong>Contraseña:</strong> ${dispositivo.contraseña_dis}</p>
                <p><strong>IP:</strong> ${dispositivo.ip_dis}</p>
                <p><strong>Correo del Cliente:</strong> ${dispositivo.correo_cli}</p>
            `;

            dispositivosContainer.appendChild(dispositivoElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});