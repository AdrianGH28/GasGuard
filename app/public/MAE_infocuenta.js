document.addEventListener("DOMContentLoaded", async function () {
    // Navegación del usuario
    const userContainer = document.getElementById("user-container");

    userContainer.addEventListener("click", function () {
        window.location.href = "page4.html";
    });

    // Activar enlace actual
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(function (link) {
        if (link.getAttribute("href").split("/").pop() === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    if (currentPage === "page4.html") {
        userContainer.classList.add("active");
    } else {
        userContainer.classList.remove("active");
    }

    // Funcionalidad de edición de cuenta
    const editBtn = document.getElementById("edit-btn");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const passwordContainer = document.querySelector(".password-container");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");
    const inputs = document.querySelectorAll("input");

    editBtn.addEventListener("click", async function () {
        // Obtener los valores de los campos
        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const calle = document.getElementById("calle").value;
        const num = document.getElementById("num").value;
        const colonia = document.getElementById("colonia").value;
        const ciudad = document.getElementById("ciudad").value;
        const cp = document.getElementById("cp").value;
        const estado = document.getElementById("estado").value;
        let password = passwordField.value;  // Obtengo la contraseña actual

        // Si la contraseña fue cambiada, la hasheamos
        if (password !== data.user.contra_user && password !== "") {
            const salt = await bcryptjs.genSalt(5);
            password = await bcryptjs.hash(password, salt);  // Hasheamos la nueva contraseña
        }

        // Realizamos la actualización en la base de datos
        try {
            const response = await fetch("https://gasguard-production.up.railway.app/api/update-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    correo,
                    password,
                    calle,
                    num,
                    colonia,
                    ciudad,
                    cp,
                    estado
                })
            });

            const data = await response.json();
            if (data.status === "ok") {
                console.log("✅ Datos actualizados correctamente");
            } else {
                console.error("⚠️ Error al actualizar los datos:", data.message);
            }
        } catch (error) {
            console.error("❌ Error al enviar la actualización:", error);
        }

        inputs.forEach(input => input.removeAttribute("disabled"));
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-flex";
        cancelBtn.style.display = "inline-flex";

        // Mostrar los campos nuevos
        passwordContainer.classList.add("active");
    });

    saveBtn.addEventListener("click", function () {
        inputs.forEach(input => input.setAttribute("disabled", "true"));
        editBtn.style.display = "flex";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";

        // Ocultar los campos nuevos
        passwordContainer.classList.remove("active");
    });

    cancelBtn.addEventListener("click", function () {
        inputs.forEach(input => input.setAttribute("disabled", "true"));
        editBtn.style.display = "flex";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";

        // Ocultar los campos nuevos
        passwordContainer.classList.remove("active");

        // Limpiar campos nuevos
        newPassword.value = "";
        confirmPassword.value = "";
    });

    console.log("¡La página ha cargado!");
    try {
        const response = await fetch("https://gasguard-production.up.railway.app/api/user-info", {
            method: "GET",
            credentials: "include"  // ⚠️ Importante para que las cookies se envíen
        });
        console.log(response);
        if (!response.ok) {
            throw new Error("Error al obtener la información del usuario");
        }
        const text = await response.text(); // 🔥 Capturar respuesta en texto
        console.log("🔥 Respuesta del servidor:", text); // Muestra qué está devolviendo la API

        const data = JSON.parse(text); // Convierte a JSON después de imprimir
        console.log(data);  // Imprime los datos completos para ver qué contiene

        if (data.status === "ok") {
            console.log("✅ Datos del usuario recibidos:", data.user);
        }
        if (data.status === "ok") {
            console.log("✅ Datos del usuario recibidos:", data.user);

            document.getElementById("nombre").value = data.user.nom_user || "VACIO";
            document.getElementById("correo").value = data.user.correo_user || "VACIO";
            document.getElementById("password").value = data.user.contra_user || "VACIO";
            document.getElementById("calle").value = data.user.calle || "VACIO";
            document.getElementById("num").value = data.user.num || "VACIO";
            document.getElementById("colonia").value = data.user.colonia || "VACIO";
            document.getElementById("ciudad").value = data.user.ciudad || "VACIO";
            document.getElementById("cp").value = data.user.cp || "VACIO";
            document.getElementById("estado").value = data.user.estado || "VACIO";
        } else {
            console.error("⚠️ Error en la respuesta:", data.message);
        }
    } catch (error) {
        console.error("❌ Error en la solicitud:", error);
    }
});



const toggleBtn = document.getElementById('toggleNav');
const nav = document.querySelector('nav');

toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Opcional: cerrar panel al hacer clic en un enlace
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
    });
});

