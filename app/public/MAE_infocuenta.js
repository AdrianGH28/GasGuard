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

    // Funcionalidad de edición de cuenta
    const editBtn = document.getElementById("edit-btn");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const passwordContainer = document.querySelector(".password-container");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");
    const inputs = document.querySelectorAll("input");

    editBtn.addEventListener("click", function () {
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