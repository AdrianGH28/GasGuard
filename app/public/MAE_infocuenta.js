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
const originalPassword = document.getElementById("password");
const inputs = document.querySelectorAll("input");

let datosOriginales = {}; // Almacenar los datos originales aquí

// Cargar los datos del usuario
async function cargarDatosUsuario() {
    try {
        const response = await fetch("https://gasguard-production.up.railway.app/api/user-info", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) throw new Error("Error al obtener la información del usuario");
        const text = await response.text();
        const data = JSON.parse(text);

        if (data.status === "ok") {
            const user = data.user;
            datosOriginales = {
                nombre: user.nom_user || "",
                correo: user.correo_user || "",
                password: user.contra_user || "",
                calle: user.calle || "",
                num: user.num || "",
                colonia: user.colonia || "",
                ciudad: user.ciudad || "",
                cp: user.cp || "",
                estado: user.estado || ""
            };

            document.getElementById("nombre").value = datosOriginales.nombre;
            document.getElementById("correo").value = datosOriginales.correo;
            originalPassword.value = datosOriginales.password;
            document.getElementById("calle").value = datosOriginales.calle;
            document.getElementById("num").value = datosOriginales.num;
            document.getElementById("colonia").value = datosOriginales.colonia;
            document.getElementById("ciudad").value = datosOriginales.ciudad;
            document.getElementById("cp").value = datosOriginales.cp;
            document.getElementById("estado").value = datosOriginales.estado;
        } else {
            console.error("⚠️ Error en la respuesta:", data.message);
        }
    } catch (error) {
        console.error("❌ Error en la solicitud:", error);
    }
}

cargarDatosUsuario();

editBtn.addEventListener("click", () => {
    inputs.forEach(input => input.removeAttribute("disabled"));
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-flex";
    cancelBtn.style.display = "inline-flex";
    passwordContainer.classList.add("active");
    originalPassword.style.display = "none";
});

    // Funcionalidad de guardar cambios
    // GUARDAR cambios
saveBtn.addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const calle = document.getElementById("calle").value.trim();
    const num = document.getElementById("num").value.trim();
    const colonia = document.getElementById("colonia").value.trim();
    const ciudad = document.getElementById("ciudad").value.trim();
    const cp = document.getElementById("cp").value.trim();
    const estado = document.getElementById("estado").value.trim();

    let password = originalPassword.value;
    const nueva = newPassword.value.trim();
    const confirmacion = confirmPassword.value.trim();

    // Validaciones
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    const passwordValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,12}$/;
    const nombreValido = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9 ]{2,}$/.test(nombre);
    const cpValido = /^\d{5}$/.test(cp);

    if (!nombreValido) return alert("❗Nombre inválido.");
    if (!correoValido) return alert("❗Correo inválido.");
    if (!cpValido) return alert("❗Código postal inválido.");
    if ([nombre, correo, calle, num, colonia, ciudad, cp, estado].some(v => v === "")) {
        return alert("❗Todos los campos son obligatorios.");
    }

    // Validación de contraseña solo si hay cambio
    if (nueva || confirmacion) {
        if (!passwordValida.test(nueva)) {
            return alert("❗Contraseña inválida. Requiere mayúscula, minúscula, número, símbolo y entre 8-12 caracteres.");
        }
        if (nueva !== confirmacion) {
            return alert("❗Las contraseñas no coinciden.");
        }
        password = nueva;
    }

    try {
        const response = await fetch("https://gasguard-production.up.railway.app/api/update-user", {
            method: "PUT",
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

        const responseData = await response.json();
        if (responseData.status === "ok") {
            alert("✅ Datos actualizados.");
            // Actualizar valores originales con los nuevos
            datosOriginales = { nombre, correo, password, calle, num, colonia, ciudad, cp, estado };
        } else {
            alert("⚠️ Hubo un error al actualizar los datos.");
        }
    } catch (error) {
        console.error("❌ Error en la solicitud:", error);
        alert("❌ Error al enviar los datos.");
    }

    // Ocultar edición y deshabilitar campos
    inputs.forEach(input => input.setAttribute("disabled", "true"));
    editBtn.style.display = "flex";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
    passwordContainer.classList.remove("active");

    newPassword.value = "";
    confirmPassword.value = "";
});

// CANCELAR cambios
cancelBtn.addEventListener("click", () => {
    document.getElementById("nombre").value = datosOriginales.nombre;
    document.getElementById("correo").value = datosOriginales.correo;
    originalPassword.value = datosOriginales.password;
    document.getElementById("calle").value = datosOriginales.calle;
    document.getElementById("num").value = datosOriginales.num;
    document.getElementById("colonia").value = datosOriginales.colonia;
    document.getElementById("ciudad").value = datosOriginales.ciudad;
    document.getElementById("cp").value = datosOriginales.cp;
    document.getElementById("estado").value = datosOriginales.estado;

    // Deshabilitar inputs y ocultar botones
    inputs.forEach(input => input.setAttribute("disabled", "true"));
    editBtn.style.display = "flex";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";

    // Limpiar y ocultar contraseñas
    newPassword.value = "";
    confirmPassword.value = "";
    passwordContainer.classList.remove("active");
    originalPassword.style.display = "block";
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

