document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/dispositivos')
        .then(response => response.json())
        .then(data => {
            if (data.status === "ok") {
                const deviceContainer = document.querySelector('.device-container');
                deviceContainer.innerHTML = ""; // Limpiar contenido previo
                data.data.forEach(device => {
                    const deviceDiv = document.createElement('div');
                    deviceDiv.className = 'device';

                    // Simulación de traducción de IP a dirección
                    const direccion = `Calle ${Math.floor(Math.random() * 100)}, Colonia ${Math.floor(Math.random() * 100)}, Ciudad ${Math.floor(Math.random() * 100)}, País ${Math.floor(Math.random() * 100)}`;

                    deviceDiv.innerHTML = `
                        <h2>Dispositivo ${device.id_dispositivo}</h2>
                        <p>SSID: ${device.wifi_dis}</p>
                        <p>IP: ${device.ip_dis}</p>
                        <p>Direccion: ${direccion}</p>
                        <p>Ubicación: ${device.nom_ubi}</p>
                        <button class="delete-button" data-id="${device.id_dispositivo}">Eliminar</button>
                    `;
                    deviceContainer.appendChild(deviceDiv);
                });

                // Añadir lógica de eliminación de dispositivo
                document.querySelectorAll('.delete-button').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const deviceId = event.target.getAttribute('data-id');
                        try {
                            const response = await fetch(`/api/dispositivos/${deviceId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            const result = await response.json();
                            if (result.status === "ok") {
                                alert("Dispositivo eliminado exitosamente");
                                // Recargar la lista de dispositivos
                                window.location.reload();
                            } else {
                                console.error('Error al eliminar el dispositivo:', result.message);
                            }
                        } catch (error) {
                            console.error('Error en la solicitud de eliminación:', error);
                        }
                    });
                });
            } else {
                console.error('Error al obtener los dispositivos:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
});
