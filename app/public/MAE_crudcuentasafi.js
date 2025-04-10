
const modal = document.querySelector('#modal');
const pageContainer = document.querySelector('.page-container');
const addca = document.getElementById('anadircuenta');
const cerrarmodal = document.querySelector('#cerrarmodal')

// Función para mostrar u ocultar el modal
addca.addEventListener('click', () => {
        modal.showModal();
});
cerrarmodal.addEventListener('click', () => {
    modal.close();
});

