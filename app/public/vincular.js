document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('vincular-form');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            ssid: formData.get('ssid'),
            password: formData.get('password'),
            ubicacion: formData.get('ubicacion')
        };
        
        console.log('Datos enviados:', data); // Añadir registro de depuración

        try {
            const response = await fetch('/api/vincular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.status === "ok") {
                alert("Dispositivo vinculado exitosamente");
                form.reset();
                // Redirigir a la página de dispositivos
                window.location.href = "/dispositivos";
            } else {
                document.querySelector('.error').classList.remove('escondido');
            }
        } catch (error) {
            console.error('Error al vincular el dispositivo:', error);
            document.querySelector('.error').classList.remove('escondido');
        }
    });
});
