const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.querySelector('#correo').value;
    const password = document.querySelector('#password').value;

    try {
        const res = await fetch("https://gasguard-production.up.railway.app//api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                password
            })
        });
        

        if (!res.ok) {
            const resJson = await res.json();
            mensajeError.textContent = resJson.message || "Error al iniciar sesión";
            mensajeError.classList.remove("escondido");
            return;
        }

        const resJson = await res.json();
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeError.textContent = "Error al intentar iniciar sesión";
        mensajeError.classList.remove("escondido");
    }
});
