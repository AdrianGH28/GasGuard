document.addEventListener('DOMContentLoaded', () => {
    const correo = localStorage.getItem('resetEmail');
    if (correo) {
        document.getElementById('correo').value = correo;
    }
});

document.getElementById('reset-password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const confpass = document.getElementById('confpass').value;

    const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, password, confpass })
    });

    const result = await response.json();

    if (result.status === "ok") {
        localStorage.removeItem('resetEmail');
        window.location.href = result.redirect;
    } else {
        document.querySelector('.error').classList.remove('escondido');
        document.querySelector('.error').textContent = result.message;
    }
});
