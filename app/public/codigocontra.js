document.addEventListener('DOMContentLoaded', () => {
    const reenviarBtn = document.getElementById('reenviar-codigo');
    const codigoForm = document.getElementById('codigo-contraseña-form');

    reenviarBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const correo = localStorage.getItem('resetEmail');
        if (!correo) {
            alert("No se pudo obtener el correo. Intenta de nuevo.");
            return;
        }

        console.log("Reenviando código a:", correo);

        try {
            const response = await fetch('/api/reenvio-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            if (response.ok && result.status === 'ok') {
                alert('Código reenviado a tu correo.');
            } else {
                alert(result.message || 'Error al reenviar el código');

                // Si el mensaje es sobre el bloqueo, mostrar temporizador en el botón
                if (result.message.includes('Inténtalo nuevamente en 1 hora')) {
                    reenviarBtn.disabled = true;
                    let tiempoRestante = 3600; // 1 hora en segundos

                    const intervalo = setInterval(() => {
                        reenviarBtn.textContent = `Reintentar en ${tiempoRestante} s`;
                        tiempoRestante--;

                        if (tiempoRestante <= 0) {
                            clearInterval(intervalo);
                            reenviarBtn.disabled = false;
                            reenviarBtn.textContent = 'Reenviar código';
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert('Error al intentar reenviar el código.');
        }
    });

    codigoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codigo = document.getElementById('codigo').value;
        const correo = localStorage.getItem('resetEmail');

        console.log("Enviando código:", codigo);
        console.log("Correo asociado:", correo);

        if (!correo || !codigo) {
            alert("Faltan datos: Código o correo");
            return;
        }

        try {
            const response = await fetch('/api/codigo-contra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, codigo })
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            if (response.ok && result.status === 'ok') {
                window.location.href = result.redirect;
            } else {
                alert(result.message || 'Error al validar el código');
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            alert('Error al intentar validar el código.');
        }
    });
});
