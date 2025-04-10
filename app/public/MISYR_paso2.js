window.addEventListener('load', () => {
    const body = document.body;
    body.style.opacity = '1';
});
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
document.addEventListener('DOMContentLoaded', () => {
    const reenviarBtn = document.getElementById('reenviar-codigo');
    const codigoForm = document.getElementById('codigo-contraseña-form');
    const submitBtn = document.querySelector('button[type="submit"]');
    

    reenviarBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const correo = localStorage.getItem('resetEmail');
        console.log("Reenviando código a:", correo);

        try {
            const response = await fetch('/api/reenvio-codigo-paso2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            if (response.ok && result.status === 'ok') {
                mostraralerta("success", 'Código reenviado a tu correo.');
            } else {
                mostraralerta("error", response.message);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            mostraralerta("error", 'Error al intentar reenviar el código.');
        }
    });

    codigoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codigo = document.getElementById('codigo').value;
        const correo = localStorage.getItem('resetEmail');
        console.log("Enviando código:", codigo);
        console.log("Correo asociado:", correo);
        console.log("Correo almacenado en localStorage:", localStorage.getItem('resetEmail'));

        if (!correo || !codigo) {
            mostraralerta("info", "Todos los campos son obligatorios");
            return;
        }
        const regexnums = /^[1234567890\s]+$/;
        if (!regexnums.test(codigo)) {
            mostraralerta('error', "El código solo debe contener caracteres numéricos.");
            return;
        }
        if (codigo.length !== 6) {
            mostraralerta('error', "El código debe contener 6 dígitos");
            return;
        }

        try {
            const response = await fetch('/api/verifica-contra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, codigo })
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            if (response.ok && result.status === 'ok') {
                submitBtn.disabled = true;
            mostraralerta('success',result.message);
            //mostraralerta('success',"Correo verificado exitosamente");

            // Esperar 4 segundos (4000 ms) antes de cerrar la alerta y redirigir
            await esperar(4000); // Espera 4 segundos

            // Hacer la animación de desvanezca del body
            document.body.style.transition = 'opacity 0.5s';
            document.body.style.opacity = '0'; // Opcional: transición de desvanezca

            // Esperar a que la animación termine antes de redirigir
            await esperar(500); // Esperar el tiempo de la animación (500 ms)

            cerraralerta();
            window.location.href=result.redirect;

            } else {
                //mostraralerta("error", 'Error al validar el código');
                mostraralerta("error", result.message);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error);
            mostraralerta("error", 'Error al intentar validar el código.');
        }
    });
});


let alertaTimeout;
let alertaTipoActual = "";

function isAlertVisible() {
    const alertBox = document.getElementById('alertamodal');
    return alertBox.classList.contains('show');
}

function mostraralerta(type, message) {
    console.log("mostraralerta:", type, message);
    clearTimeout(alertaTimeout);
    
    if (isAlertVisible()) {
        console.log("Alerta ya visible, cerrando la anterior...");
        cerraralerta(() => {
            console.log("Alerta anterior cerrada, mostrando nueva alerta");
            setTimeout(() => {
                mostrarNuevaAlerta(type, message);
            }, 100); // Pequeño retraso para dar tiempo al cierre
        });
        return;
    }
    
    mostrarNuevaAlerta(type, message);
}

function mostrarNuevaAlerta(type, message) {
    console.log("mostrarNuevaAlerta:", type, message);
    const alertBox = document.getElementById('alertamodal');
    const alertIcon = alertBox.querySelector('.alerticon i');
    const alertHeading = alertBox.querySelector('.alertheading');
    const alertContent = alertBox.querySelector('.alertcontentcont');
    const closeButton = alertBox.querySelector('.closebtn'); // Botón de cierre
    const aceptarButton = document.getElementById('aceptarbtnalerta');
    const cancelarButton = document.querySelector('.cancelar');
    
    // Forzar reflow para reiniciar la transición
    alertBox.classList.remove('show');
    alertBox.offsetHeight; // Forzamos el reflow
    
    // Asegurarse de que el modal se muestre
    alertBox.style.visibility = "visible";
    alertBox.classList.remove('alert-info','alert-warning','alert-error','alert-success','hide');
    alertBox.style.borderColor = '';
    alertIcon.className = 'fa-solid';
    if (cancelarButton) {
        cancelarButton.style.display = 'none'; // Ocultar el botón
    }
    
    // Configurar según el tipo de alerta
    if (type === 'info') {
        console.log("Configurando alerta tipo 'info'");
        alertBox.classList.add('alert-info');
        alertIcon.classList.add("fa-circle-info");
        alertHeading.textContent = 'Información';
        alertIcon.style.color = '#4B85F5';
        alertBox.style.borderColor = '#4B85F5';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    } else if (type === 'warning') {
        console.log("Configurando alerta tipo 'warning'");
        alertBox.classList.add('alert-warning');
        alertIcon.classList.add("fa-circle-exclamation");
        alertHeading.textContent = 'Advertencia';
        alertIcon.style.color = '#FDCD0F';
        alertBox.style.borderColor = '#FDCD0F';
        aceptarButton.style.color = '#FDCD0F';
        aceptarButton.style.fontWeight = '700';
        if (cancelarButton) {
            cancelarButton.style.display = 'inline';
        }
    } else if (type === 'error') {
        console.log("Configurando alerta tipo 'error'");
        alertBox.classList.add('alert-error');
        alertIcon.classList.add('fa-circle-xmark');
        alertHeading.textContent = 'Error';
        alertIcon.style.color = '#F04349';
        alertBox.style.borderColor = '#F04349';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    } else if (type === 'success') {
        console.log("Configurando alerta tipo 'success'");
        alertBox.classList.add('alert-success');
        alertIcon.classList.add('fa-circle-check');
        alertHeading.textContent = 'Éxito';
        alertIcon.style.color = '#01E17B';
        alertBox.style.borderColor = '#01E17B';
        aceptarButton.style.color = '#6C7D7D';
        aceptarButton.style.fontWeight = '400';
    }
    
    // Establecer el mensaje
    alertContent.textContent = message;
    alertaTipoActual = type;
    
    // Mostrar la alerta
    alertBox.classList.add('show');
    console.log("Alerta mostrada correctamente");
    
    // Si la alerta no es de tipo que requiera intervención (warning o confirmation), se cierra automáticamente
    if (type !== 'warning' && type !== 'confirmation') {
        alertaTimeout = setTimeout(() => {
            console.log("Timeout alcanzado, cerrando alerta");
            cerraralerta();
        }, 3000);
    }
    
    closeButton.onclick = () => {
        console.log("Cierre manual de alerta");
        cerraralerta();
    };
    if (type === 'warning') {
        aceptarButton.onclick = () => {
            console.log("Botón Aceptar (warning) presionado: regresando a la página anterior");
            document.body.style.opacity = '0';
            window.location.href='/';
        };
    } else {
        // Para otros tipos, el botón Aceptar simplemente cierra la alerta (o mantiene su comportamiento predeterminado)
        aceptarButton.onclick = () => cerraralerta();
    }
}

function cerraralerta(callback) {
    console.log("Iniciando cierre de alerta");
    const alertBox = document.getElementById('alertamodal');
    if (!alertBox.classList.contains('show')) {
        console.log("La alerta ya está cerrada");
        if (callback) callback();
        return;
    }
    alertBox.classList.remove('show');
    alertBox.classList.add('hide');
    setTimeout(() => {
        alertBox.classList.remove('hide');
        alertBox.style.visibility = "hidden";
        alertaTipoActual = "";
        console.log("Alerta cerrada y oculta");
        clearTimeout(alertaTimeout);
        if (callback) callback();
    }, 300);
}

