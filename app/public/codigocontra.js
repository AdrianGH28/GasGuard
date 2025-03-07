document.addEventListener('DOMContentLoaded', () => {
    const reenviarBtn = document.getElementById('reenviar-codigo');
    const codigoForm = document.getElementById('codigo-contraseña-form');

    // Evento para reenviar el código
    reenviarBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Evitar el comportamiento por defecto del enlace
        const correo = localStorage.getItem('resetEmail'); // Asumimos que el correo está en localStorage

        if (!correo) {
            alert("No se pudo obtener el correo. Intenta de nuevo.");
            return;
        }

        // Mostrar un mensaje temporal mientras se envía el código
        reenviarBtn.textContent = 'Enviando...';

        try {
            // Enviar solicitud para reenviar el código
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
            } else {
                alert(result.message || 'Error al reenviar el código');
            }
        } catch (error) {
            alert('Hubo un error al intentar reenviar el código. Intenta de nuevo más tarde.');
        }

        // Restaurar el texto del enlace
        reenviarBtn.textContent = 'Reenviar';
    });

    // Evento para el formulario de verificación de código
    codigoForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir el envío por defecto del formulario
    
        const codigo = document.getElementById('codigo').value;
        const correo = localStorage.getItem('resetEmail'); // Obtener el correo desde localStorage
    
        // Validar que el código solo contiene números
        const regex = /^\d{6}$/; // Regex para validar solo 6 dígitos numéricos
        if (!codigo.match(regex)) {
            alert("El código debe ser un número de 6 dígitos.");
            return;
        }
    
        if (!correo || !codigo) {
            alert("Faltan datos: Código o correo");
            return;
        }
    
        // Enviar solicitud para verificar el código
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
                window.location.href = result.redirect; // Redirige a /resetpass
            } else {
                alert(result.message || 'Error al validar el código');
            }
        } catch (error) {
            alert('Hubo un error al intentar validar el código');
        }
    });    
});
