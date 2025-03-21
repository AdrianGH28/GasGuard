document.getElementById('enviar-correov-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('correo').value;

    const response = await fetch('/api/enviar-correo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo })
    });

    const result = await response.json();

    if (result.status === "ok") {
        // Almacenar el correo en el almacenamiento local para usarlo en la siguiente página
        localStorage.setItem('resetEmail', correo);
        window.location.href = result.redirect;
    } else {
        document.querySelector('.error').classList.remove('escondido');
        document.querySelector('.error').textContent = result.message;
    }
});
