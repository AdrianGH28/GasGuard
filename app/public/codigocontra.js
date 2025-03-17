document.addEventListener('DOMContentLoaded', () => {
    const reenviarBtn = document.getElementById('reenviar-codigo');
    const codigoForm = document.getElementById('codigo-contraseña-form');
    let reintentos = 0; // Contador de reenvíos

    reenviarBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (reintentos >= 3) {
            alert('Has alcanzado el límite de reenvíos');
            return;
        }

        reenviarBtn.textContent = 'Enviando...';
        reenviarBtn.disabled = true; // Bloquear botón

        const correo = localStorage.getItem('resetEmail');

        if (!correo) {
            alert("No se pudo obtener el correo. Intenta de nuevo.");
            reenviarBtn.textContent = 'Reenviar';
            reenviarBtn.disabled = false;
            return;
        }

        try {
            const response = await fetch('/api/reenvio-codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo })
            });

            const result = await response.json();

            if (response.ok && result.status === 'ok') {
                alert('El código ha sido reenviado a tu correo.');
                reintentos++;

                // Bloquear botón durante 60 segundos
                reenviarBtn.disabled = true;
                let segundos = 60;
                reenviarBtn.textContent = `Reenviar (${segundos}s)`;

                const intervalo = setInterval(() => {
                    segundos--;
                    reenviarBtn.textContent = `Reenviar (${segundos}s)`;

                    if (segundos <= 0) {
                        clearInterval(intervalo);
                        reenviarBtn.textContent = 'Reenviar';
                        reenviarBtn.disabled = false;
                    }
                }, 1000);
            } else {
                alert(result.message || 'Error al reenviar el código');
                reenviarBtn.disabled = false;
                reenviarBtn.textContent = 'Reenviar';
            }
        } catch (error) {
            alert('Hubo un error al intentar reenviar el código. Intenta de nuevo más tarde.');
            reenviarBtn.disabled = false;
            reenviarBtn.textContent = 'Reenviar';
        }
    });

    codigoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const codigo = document.getElementById('codigo').value;
        const correo = localStorage.getItem('resetEmail');
    
        const regex = /^\d{6}$/;
        if (!codigo.match(regex)) {
            alert("El código debe ser un número de 6 dígitos.");
            return;
        }
    
        if (!correo || !codigo) {
            alert("Faltan datos: Código o correo");
            return;
        }
    
        try {
            const response = await fetch('/api/codigo-contra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, codigo })
            });
    
            const result = await response.json();
    
            if (response.ok && result.status === 'ok') {
                window.location.href = result.redirect;
            } else {
                alert(result.message || 'Error al validar el código');
            }
        } catch (error) {
            alert('Hubo un error al intentar validar el código');
        }
    });    
});
