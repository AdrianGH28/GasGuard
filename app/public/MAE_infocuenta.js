document.addEventListener("DOMContentLoaded", function () {
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

    // Variables para botones y campos
    const editBtn = document.getElementById("edit-btn");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const passwordContainer = document.querySelector(".password-container");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");
    const originalPassword = document.getElementById("password");
    const correoInput = document.getElementById("correo");
    const inputs = document.querySelectorAll("input");

    // Objeto para guardar los valores originales
    let datosOriginales = {};

    // Al hacer clic en "Editar información"
    editBtn.addEventListener("click", function () {
        // Guardar valores originales
        datosOriginales = {
            nombre: document.getElementById("nombre").value,
            correo: document.getElementById("correo").value,
            calle: document.getElementById("calle").value,
            num: document.getElementById("num").value,
            colonia: document.getElementById("colonia").value,
            ciudad: document.getElementById("ciudad").value,
            cp: document.getElementById("cp").value,
            estado: document.getElementById("estado").value
        };

        inputs.forEach(input => input.removeAttribute("disabled"));
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-flex";
        cancelBtn.style.display = "inline-flex";

        passwordContainer.classList.add("active");
        originalPassword.style.display = "none";
    });

    // Al hacer clic en "Guardar"
    saveBtn.addEventListener("click", function () {
        const correo = correoInput.value.trim();
        const nueva = newPassword.value.trim();
        const confirmacion = confirmPassword.value.trim();

        // Expresiones de validación
        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
        const passwordValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,12}$/;
        const cpInput = document.getElementById("cp");
        const cp = cpInput.value.trim();
        const cpValido = /^\d{5}$/.test(cp);

        // Validación de campos vacíos
        const camposObligatorios = [
            document.getElementById("nombre"),
            document.getElementById("correo"),
            document.getElementById("calle"),
            document.getElementById("num"),
            document.getElementById("colonia"),
            document.getElementById("ciudad"),
            document.getElementById("cp"),
            document.getElementById("estado")
        ];

        const hayVacios = camposObligatorios.some(input => input.value.trim() === "");
        if (hayVacios) return;

        // Validación del nombre
        const nombreInput = document.getElementById("nombre");
        const nombre = nombreInput.value.trim();
        const nombreValido = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9 ]{2,}$/.test(nombre);
        if (!nombreValido) return;

        // Validar CP
        if (!cpValido) return;

        // Validar correo
        if (!correoValido) return;

        // Validación de contraseña (si se está escribiendo)
        if (nueva || confirmacion) {
            if (!passwordValida.test(nueva)) return;
            if (nueva !== confirmacion) return;
        }

        // Si todo es válido, deshabilitar inputs y ocultar botones
        inputs.forEach(input => input.setAttribute("disabled", "true"));
        editBtn.style.display = "flex";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";

        passwordContainer.classList.remove("active");
        originalPassword.style.display = "block";
    });

    // Al hacer clic en "Cancelar"
    cancelBtn.addEventListener("click", function () {
        // Restaurar valores originales
        document.getElementById("nombre").value = datosOriginales.nombre || "";
        document.getElementById("correo").value = datosOriginales.correo || "";
        document.getElementById("calle").value = datosOriginales.calle || "";
        document.getElementById("num").value = datosOriginales.num || "";
        document.getElementById("colonia").value = datosOriginales.colonia || "";
        document.getElementById("ciudad").value = datosOriginales.ciudad || "";
        document.getElementById("cp").value = datosOriginales.cp || "";
        document.getElementById("estado").value = datosOriginales.estado || "";

        // Deshabilitar inputs y ocultar botones
        inputs.forEach(input => input.setAttribute("disabled", "true"));
        editBtn.style.display = "flex";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";

        passwordContainer.classList.remove("active");
        originalPassword.style.display = "block";

        // Limpiar contraseñas
        newPassword.value = "";
        confirmPassword.value = "";
    });
});
