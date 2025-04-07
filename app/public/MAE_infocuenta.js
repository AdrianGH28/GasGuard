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

    if (currentPage === "MAE_infocuenta.html") {
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

    // Obtener los datos del usuario
    let data; // Variable que almacenará los datos del usuario

    try {
        const response = await fetch("https://gasguard-production.up.railway.app/api/user-info", {
            method: "GET",
            credentials: "include"  // ⚠️ Importante para que las cookies se envíen
        });
        if (!response.ok) {
            throw new Error("Error al obtener la información del usuario");
        }
        const text = await response.text(); // 🔥 Capturar respuesta en texto
        data = JSON.parse(text); // Convierte a JSON después de imprimir

        if (data.status === "ok") {
            console.log("✅ Datos del usuario recibidos:", data.user);

            // Llenar los campos con los datos del usuario
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

    // Funcionalidad de edición de cuenta
    editBtn.addEventListener("click", function () {
        // Habilitar los campos para edición
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.removeAttribute("disabled"));
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-flex";
        cancelBtn.style.display = "inline-flex";
        passwordContainer.classList.add("active");
    });

    // Funcionalidad de guardar cambios
    saveBtn.addEventListener("click", async function () {
        // Obtener los valores de los campos
        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const calle = document.getElementById("calle").value;
        const num = document.getElementById("num").value;
        const colonia = document.getElementById("colonia").value;
        const ciudad = document.getElementById("ciudad").value;
        const cp = document.getElementById("cp").value;
        const estado = document.getElementById("estado").value;
        const password = document.getElementById("password").value;  // Si se cambia, pasarlo como está
    
        // Realizamos la actualización en la base de datos
        try {
            const response = await fetch("https://gasguard-production.up.railway.app/api/update-user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    correo,
                    password,  // Ya se envía tal cual, sin hashear
                    calle,
                    num,
                    colonia,
                    ciudad,
                    cp,
                    estado
                })
            });
    
            const responseData = await response.json();
            if (responseData.status === "ok") {
                console.log("✅ Datos actualizados correctamente");
            } else {
                console.error("⚠️ Error al actualizar los datos:", responseData.message);
            }
        } catch (error) {
            console.error("❌ Error al enviar la actualización:", error);
        }
    
    
        // Deshabilitar los campos nuevamente
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.setAttribute("disabled", "true"));
        editBtn.style.display = "flex";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";

        // Ocultar los campos de contraseña
        passwordContainer.classList.remove("active");
    });

    // Funcionalidad de cancelar cambios
    cancelBtn.addEventListener("click", function () {
        // Deshabilitar los campos nuevamente
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.setAttribute("disabled", "true"));
        editBtn.style.display = "flex";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";

        // Ocultar los campos de contraseña
        passwordContainer.classList.remove("active");

        // Limpiar los campos de contraseña
        newPassword.value = "";
        confirmPassword.value = "";
    });


    console.log("¡La página ha cargado!");
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

