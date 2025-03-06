const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.querySelector('#nombre').value;
    const appat = document.querySelector('#appat').value;
    const apmat = document.querySelector('#apmat').value;
    const cp = document.querySelector('#cp').value;
    const ciudad = document.querySelector('#ciudad').value;
    const colonia = document.querySelector('#colonia').value;
    const calle = document.querySelector('#calle').value;
    const numero = document.querySelector('#numero').value;
    const estado = document.querySelector('#estado').value;
    const correo = document.querySelector('#correo').value;
    const confcorreo = document.querySelector('#conf-correo').value;
    const password = document.querySelector('#password').value;
    const confpass = document.querySelector('#conf-pass').value;

        

    if (password.length < 8 || password.length > 12) {
        alert("La contraseña debe tener entre 8 y 12 caracteres.");
        return;
    }

    try{

    const res = await fetch("https://gasguard-production.up.railway.app/api/registro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre: nombre,
            appat: appat,
            apmat: apmat,
            cp: cp,
            ciudad: ciudad,
            colonia: colonia,
            calle: calle,
            numero: numero,
            estado: estado,
            correo: correo,
            confcorreo: confcorreo,
            password: password,
            confpass: confpass
        })
    });

    
    if (!res.ok){
        mensajeError.classList.toggle("escondido",false);
    return;
}  
    
    const resJson = await res.json();

    if (resJson.redirect) {
        window.location.href = resJson.redirect;
    } 
}catch (error){
    console.log("Error:", error);
}

});
