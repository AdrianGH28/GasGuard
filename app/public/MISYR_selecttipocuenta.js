function toggleCards(selected) {
    const cardEmpresarial = document.getElementById('card-empresarial');
    const cardPersonal = document.getElementById('card-personal');

    if (selected === 'empresarial') {
        // Empresarial expandido
        cardEmpresarial.classList.remove('compact');
        cardEmpresarial.classList.add('expanded');
        cardEmpresarial.innerHTML = `
            <h2 class="card-title expanded">Empresarial</h2>
            <p class="card-description expanded">
                Ideal para empresas que necesiten operar con dos o más dispositivos de manera simultánea y eficiente.
            </p>
            <a href="/repagoempresa" class="action-btn iniciar">Inicia Ya!</a>
        `;

        // Personal compacto
        cardPersonal.classList.remove('expanded');
        cardPersonal.classList.add('compact');
        cardPersonal.innerHTML = `
            <h2 class="card-title compact">Personal</h2>
            <p class="card-description compact">Usuarios individuales</p>
            <button class="action-btn info" onclick="toggleCards('personal')">Más info.</button>
        `;
    } else {
        // Personal expandido
        cardPersonal.classList.remove('compact');
        cardPersonal.classList.add('expanded');
        cardPersonal.innerHTML = `
            <h2 class="card-title expanded">Personal</h2>
            <p class="card-description expanded">
                Ideal para hogares o usuarios individuales que necesiten utilizar un único dispositivo de forma eficaz y sencilla.
            </p>
            <a href="/repagousuario" class="action-btn iniciar">Inicia Ya!</a>
        `;

        // Empresarial compacto
        cardEmpresarial.classList.remove('expanded');
        cardEmpresarial.classList.add('compact');
        cardEmpresarial.innerHTML = `
            <h2 class="card-title compact">Empresarial</h2>
            <p class="card-description compact">Empresas</p>
            <button class="action-btn info" onclick="toggleCards('empresarial')">Más info.</button>
        `;
    }

    
}