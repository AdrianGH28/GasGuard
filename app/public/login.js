const mensajeError = document.getElementsByClassName("error")[0];
const alertContainer = document.createElement("div");

window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity='1';
});
// Crear la alerta de error
alertContainer.id = "customAlert";
alertContainer.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    z-index: 1000;
`;

// Ícono de información
const alertIcon = document.createElement("i");
alertIcon.className = "fa-solid fa-circle-info";
alertIcon.style.color = "#721c24";

const alertText = document.createElement("span");
alertText.textContent = "Usuario o contraseña incorrecto";

// Agregar elementos al contenedor
alertContainer.appendChild(alertIcon);
alertContainer.appendChild(alertText);
document.body.appendChild(alertContainer);

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.querySelector("#correo").value;
    const password = document.querySelector("#password").value;

    try {
        const res = await fetch("https://gasguard-production.up.railway.app/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                correo,
                password,
            }),
        });

        if (!res.ok) {
            const resJson = await res.json();
            mostrarAlerta(resJson.message || "Usuario o contraseña incorrecto");
            return;
        }

        const resJson = await res.json();
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarAlerta("Error al intentar iniciar sesión");
    }
});

// Función para mostrar la alerta
function mostrarAlerta(mensaje) {
    alertText.textContent = mensaje;
    alertContainer.style.opacity = "1";

    setTimeout(() => {
        alertContainer.style.opacity = "0";
    }, 3000);
}
