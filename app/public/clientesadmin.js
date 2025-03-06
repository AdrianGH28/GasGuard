document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/clientesadmin");
        if (!res.ok) {
            throw new Error("Error al obtener la información de los clientes");
        }

        const resJson = await res.json();
        const clientes = resJson.data;

        const clientesContainer = document.getElementById("clientes-container");

        clientes.forEach(cliente => {
            const clienteElement = document.createElement("div");
            clienteElement.classList.add("cliente");

            clienteElement.innerHTML = `
                <h3>Cliente: ${cliente.nom_cli} ${cliente.appat_cli} ${cliente.apmat_cli}</h3>
                <p><strong>Correo:</strong> ${cliente.correo_cli}</p>
                <p><strong>Dirección:</strong> ${cliente.direccion}</p>
            `;

            clientesContainer.appendChild(clienteElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});