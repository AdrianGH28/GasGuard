import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';
import pool from "../generalidades_back_bd.js"

dotenv.config();

/*
const conexion = await mysql.createConnection({
    host: 'localhost',
    database: 'DBGASGUARDAPPVSSC',
    user: 'root',
   // password: 'n0m3l0'
    password: 'jaghSQL2806.'
    //password: 'Sally2007.'
});
*/
// Llamar a la función de conexión


export const usuarios = [{
    nombre: "a",
    appat: "a",
    apmat: "a",
    pais: "a",
    ciudad: "a",
    colonia: "a",
    calle: "a",
    numero: "a",
    correo: "a@a.com",
    password: "$2a$05$lar7vRY9OSa1d4cQzWxy9OFix5j.JoRFH44lQXgXOEsCvwti98y2u"
}];


export async function login(req, res) {
    console.log('Request Body:', req.body);
    const { correo, password } = req.body;
    
    if (!correo || !password) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM musuario WHERE correo_user = ?', [correo]);

        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "Correo o contraseña incorrectos" });
        }

        const usuario = rows[0];
        const loginCorrecto = await bcryptjs.compare(password, usuario.contra_user);

        if (!loginCorrecto) {
            return res.status(400).send({ status: "Error", message: "Correo o contraseña incorrectos" });
        }

        if (usuario.verif_user === 1) {
            const token = jsonwebtoken.sign(
                { id_user: usuario.id_user, correo: usuario.correo_user },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION }
            );
            
            res.cookie("jwt", token, {
                httpOnly: true,  // Evita que sea accesible desde JS en el navegador
                secure: false,   // En producción debe ser `true` si usas HTTPS
                sameSite: "lax", // Controla cómo se envían las cookies
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                path: "/"
            });
            return res.send({ status: "ok", message: "Usuario loggeado", redirect: '/maeseleccioninfo' });
        } else {
            return res.send({ status: "pending", message: "Verificación requerida", redirect: '/paso4' });
        }
    } catch (error) {
        console.error('Error durante login:', error);
        return res.status(500).send({ status: "Error", message: "Error durante login" });
    }
}


/*
async function login(req, res) {
    console.log('Request Body:', req.body);

    const { correo, password } = req.body;
    if (!correo || !password) {
        console.log('Campos incompletos');
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        const [rows] = await conexion.execute('SELECT * FROM mcliente WHERE correo_cli = ?', [correo]);
        if (rows.length === 0) {
            console.log('Usuario no encontrado');
            return res.status(400).send({ status: "Error", message: "Correo o contraseña incorrectos" });
        }

        const usuarioARevisar = rows[0];
        const loginCorrecto = await bcryptjs.compare(password, usuarioARevisar.contra_cli);
        if (!loginCorrecto) {
            console.log('Contraseña incorrecta');
            return res.status(400).send({ status: "Error", message: "Correo o contraseña incorrectos" });
        }

        const token = jsonwebtoken.sign(
            { id_cliente: usuarioARevisar.id_cliente, correo: usuarioARevisar.correo_cli, rol: usuarioARevisar.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            path: "/"
        };

        res.cookie("jwt", token, cookieOption);
        console.log('Usuario loggeado correctamente');

        // Redirigir según el rol del usuario
        const redirectUrl = usuarioARevisar.rol === 'admin' ? '/inicioadmin' : '/principal';
        res.send({ status: "ok", message: "Usuario loggeado", redirect: redirectUrl });
    } catch (error) {
        console.error('Error durante login:', error);
        return res.status(500).send({ status: "Error", message: "Error durante login" });
    }
}
*/
//Login que segun yo es el nuevo pero aun no se si ya integrarlo que segun yo si pero esperaremos a tener la pagina principal donde entraremos una
//vez finalice todo
/*
/*
        // Redirigir según el rol del usuario
        const redirectUrl = usuarioARevisar.rol === 'admin' ? '/inicioadmin' : '/principal';
        */

async function registro(req, res) {
    const { nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass } = req.body;

    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres." });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        const [rows] = await pool.execute('SELECT correo_user FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length > 0) {
            return res.status(400).send({ status: "Error", message: "Este usuario ya existe" });
        }

        const apiKey = process.env.HUNTER_API_KEY;
        const apiURL = `https://api.hunter.io/v2/email-verifier?email=${correo}&api_key=${apiKey}`;

        const response = await fetch(apiURL);
        const data = await response.json();

        console.log('Hunter API response:', data);

        if (!data || !data.data || data.data.status !== 'valid') {
            return res.status(400).send({ status: "Error", message: "El correo no es válido." });
        }

        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        const [coloniaResult] = await pool.execute('SELECT id_colonia FROM ccolonia WHERE nom_col = ?', [colonia]);
        let id_colonia;
        if (coloniaResult.length > 0) {
            id_colonia = coloniaResult[0].id_colonia;
        } else {
            const [insertColoniaResult] = await pool.execute('INSERT INTO ccolonia (nom_col) VALUES (?)', [colonia]);
            id_colonia = insertColoniaResult.insertId;
        }

        const [calleResult] = await pool.execute('SELECT id_calle FROM dcalle WHERE nom_calle = ?', [calle]);
        let id_calle;
        if (calleResult.length > 0) {
            id_calle = calleResult[0].id_calle;
        } else {
            const [insertCalleResult] = await pool.execute('INSERT INTO dcalle (nom_calle) VALUES (?)', [calle]);
            id_calle = insertCalleResult.insertId;
        }

        const [ciudadResult] = await pool.execute('SELECT id_ciudad FROM cciudad WHERE nom_ciudad = ?', [ciudad]);
        let id_ciudad;
        if (ciudadResult.length > 0) {
            id_ciudad = ciudadResult[0].id_ciudad;
        } else {
            const [insertCiudadResult] = await pool.execute('INSERT INTO cciudad (nom_ciudad) VALUES (?)', [ciudad]);
            id_ciudad = insertCiudadResult.insertId;
        }

        const [estadoResult] = await pool.execute('SELECT id_estado FROM cestado WHERE nom_estado = ?', [estado]);
        let id_estado;
        if (estadoResult.length > 0) {
            id_estado = estadoResult[0].id_estado;
        } else {
            const [insertEstadoResult] = await pool.execute('INSERT INTO cestado (nom_estado) VALUES (?)', [estado]);
            id_estado = insertEstadoResult.insertId;
        }

        const [copostResult] = await pool.execute('SELECT id_copost FROM ccpostal WHERE cp_copost = ?', [cp]);
        let id_copost;
        if (copostResult.length > 0) {
            id_copost = copostResult[0].id_copost;
        } else {
            const [insertCopostalResult] = await pool.execute('INSERT INTO ccpostal (cp_copost) VALUES (?)', [cp]);
            id_copost = insertCopostalResult.insertId;
        }

        const [direccionResult] = await pool.execute(
            'INSERT INTO ddireccion (numero_direc, id_colonia, id_calle, id_ciudad, id_estado, id_copost) VALUES (?, ?, ?, ?, ?, ?)',
            [numero, id_colonia, id_calle, id_ciudad, id_estado, id_copost]
        );
        const direccionId = direccionResult.insertId;

        await pool.execute(
            'INSERT INTO musuario (nom_user, correo_user, contra_user, id_direccion) VALUES (?, ?, ?, ?)',
            [nombre, correo, hashPassword, direccionId]
        );

        return res.status(201).send({ status: "ok", message: `Usuario ${nombre} agregado`, redirect: "/paso2" });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al registrar usuario." });
    }
}

/*--------CUENTAS AFILIADAS */
async function registroAfiliados(req, res) {
    const { nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass } = req.body;

    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres." });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        const [rows] = await pool.execute('SELECT correo_user FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length > 0) {
            return res.status(400).send({ status: "Error", message: "Este usuario ya existe" });
        }

        const apiKey = process.env.HUNTER_API_KEY;
        const apiURL = `https://api.hunter.io/v2/email-verifier?email=${correo}&api_key=${apiKey}`;

        const response = await fetch(apiURL);
        const data = await response.json();

        console.log('Hunter API response:', data);

        if (!data || !data.data || data.data.status !== 'valid') {
            return res.status(400).send({ status: "Error", message: "El correo no es válido." });
        }

        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Obtener o insertar colonia
        const [coloniaResult] = await pool.execute('SELECT id_colonia FROM ccolonia WHERE nom_col = ?', [colonia]);
        let id_colonia = coloniaResult.length > 0 ? coloniaResult[0].id_colonia : (await pool.execute('INSERT INTO ccolonia (nom_col) VALUES (?)', [colonia]))[0].insertId;

        // Obtener o insertar calle
        const [calleResult] = await pool.execute('SELECT id_calle FROM dcalle WHERE nom_calle = ?', [calle]);
        let id_calle = calleResult.length > 0 ? calleResult[0].id_calle : (await pool.execute('INSERT INTO dcalle (nom_calle) VALUES (?)', [calle]))[0].insertId;

        // Obtener o insertar ciudad
        const [ciudadResult] = await pool.execute('SELECT id_ciudad FROM cciudad WHERE nom_ciudad = ?', [ciudad]);
        let id_ciudad = ciudadResult.length > 0 ? ciudadResult[0].id_ciudad : (await pool.execute('INSERT INTO cciudad (nom_ciudad) VALUES (?)', [ciudad]))[0].insertId;

        // Obtener o insertar estado
        const [estadoResult] = await pool.execute('SELECT id_estado FROM cestado WHERE nom_estado = ?', [estado]);
        let id_estado = estadoResult.length > 0 ? estadoResult[0].id_estado : (await pool.execute('INSERT INTO cestado (nom_estado) VALUES (?)', [estado]))[0].insertId;

        // Obtener o insertar código postal
        const [copostResult] = await pool.execute('SELECT id_copost FROM ccpostal WHERE cp_copost = ?', [cp]);
        let id_copost = copostResult.length > 0 ? copostResult[0].id_copost : (await pool.execute('INSERT INTO ccpostal (cp_copost) VALUES (?)', [cp]))[0].insertId;

        // Insertar dirección
        const [direccionResult] = await pool.execute(
            'INSERT INTO ddireccion (numero_direc, id_colonia, id_calle, id_ciudad, id_estado, id_copost) VALUES (?, ?, ?, ?, ?, ?)',
            [numero, id_colonia, id_calle, id_ciudad, id_estado, id_copost]
        );
        const direccionId = direccionResult.insertId;

        // Insertar usuario con rol "afiliado"
        await pool.execute(
            'INSERT INTO musuario (nom_user, correo_user, contra_user, rol_user, id_direccion) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, hashPassword, 'afiliado', direccionId]
        );
        //esto debe de cambiar pq no te debe redigir como tal solo inserta y cierra el modal
        return res.status(201).send({ status: "ok", message: `Usuario ${nombre} agregado con rol afiliado`, redirect: "/verificacorreo1" });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al registrar usuario." });
    }
}

/*


    const nuevoUsuario = {
        nombre,
        appat,
        apmat,
        pais,
        ciudad,
        colonia,
        calle,
        numero,
        correo,
        password: hashPassword
    };

    usuarios.push(nuevoUsuario);
    console.log(usuarios);
    return res.status(201).send({ status: "ok", message: `Usuario ${nuevoUsuario.nombre} agregado`, redirect: "/" });
*/
//Comentare las funciones antiguas de forgot y reset por si acaso que segun yo ya no se deben ocupar
/*
export const forgotPassword = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send({ status: "Error", message: "El campo de correo está vacío" });
    }

    try {
        const [rows] = await conexion.execute('SELECT * FROM mcliente WHERE correo_cli = ?', [correo]);
        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "El correo no está registrado" });
        }

        req.session.resetEmail = correo;
        return res.status(200).send({ status: "ok", message: "Correo verificado", redirect: "/resetpass" });
    } catch (error) {
        console.error('Error durante forgotPassword:', error);
        return res.status(500).send({ status: "Error", message: "Error durante forgotPassword" });
    }
};

export const resetPassword = async (req, res) => {
    const { correo, password, confpass } = req.body;

    if (!correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        const [rows] = await conexion.execute('SELECT * FROM mcliente WHERE correo_cli = ?', [correo]);
        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "Correo no encontrado" });
        }

        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        await conexion.execute('UPDATE mcliente SET contra_cli = ? WHERE correo_cli = ?', [hashPassword, correo]);

        return res.status(200).send({ status: "ok", message: "Contraseña restablecida correctamente", redirect: "/" });
    } catch (error) {
        console.error('Error durante resetPassword:', error);
        return res.status(500).send({ status: "Error", message: "Error durante resetPassword" });
    }
};
*/
export const recoveryCodes = new Map(); // Almacén temporal de códigos (correo -> código)

export const forgotPassword = async (req, res) => {
    console.log("Solicitud recibida en /api/forgot-password");
    console.log("Cuerpo de la petición:", req.body);

    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send({ status: "Error", message: "El campo de correo está vacío" });
    }

    try {
        recoveryCodes.delete(correo);

        // Generar un nuevo código
        const codigo = Math.floor(100000 + Math.random() * 900000);
        recoveryCodes.set(correo, { codigo, expiracion: Date.now() + 5 * 60 * 1000 });

        console.log("Códigos almacenados:", recoveryCodes);
        // Configurar transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gasguardad1@gmail.com',
                pass: 'jxqgehljwskmzfju'
            }
        });

        const mailOptions = {
            from: 'gasguardad1@gmail.com',
            to: correo,
            subject: 'Código de recuperación de contraseña',
            text: `Tu código de recuperación es: ${codigo}`
        };

        await transporter.sendMail(mailOptions);

        // Eliminar código después de 5 minutos
        setTimeout(() => recoveryCodes.delete(correo), 5 * 60 * 1000);

        return res.status(200).send({ status: "ok", message: "Código enviado", redirect: "/recuperacion2" });

    } catch (error) {
        console.error('Error durante forgotPassword:', error);
        return res.status(500).send({ status: "Error", message: "Error durante forgotPassword" });
    }
};
const esperarCorreoEnDB = async (correo, intentos = 5, delay = 1000) => {
    for (let i = 0; i < intentos; i++) {
        const [rows] = await pool.execute('SELECT * FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length > 0) return rows; // Si ya existe, regresamos la información
        console.log(`Intento ${i + 1}: Correo aún no en BD, esperando...`);
        await new Promise(resolve => setTimeout(resolve, delay)); // Esperar antes de volver a intentar
    }
    return null; // Si después de varios intentos no aparece, regresamos null
};
export const enviaCorreo = async (req, res) => {
    console.log("Solicitud recibida en /api/enviar-correo");
    console.log("Cuerpo de la petición:", req.body);

    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send({ status: "Error", message: "El campo de correo está vacío" });
    }

    try {
        // Verificar si el correo ya tenía un código generado y eliminarlo
        recoveryCodes.delete(correo);

        // Generar un nuevo código
        const codigo = Math.floor(100000 + Math.random() * 900000);
        recoveryCodes.set(correo, { codigo, expiracion: Date.now() + 5 * 60 * 1000 });

        console.log("Códigos almacenados:", recoveryCodes);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gasguardad1@gmail.com',
                pass: 'jxqgehljwskmzfju'
            }
        });

        const mailOptions = {
            from: 'gasguardad1@gmail.com',
            to: correo,
            subject: 'Código de verificación de contraseña',
            text: `Tu código de verificación es: ${codigo}`
        };

        await transporter.sendMail(mailOptions);

        // Programar la eliminación del código después de 5 minutos
        setTimeout(() => recoveryCodes.delete(correo), 5 * 60 * 1000);
        
        res.status(200).send({ status: "ok", message: "Correo enviado correctamente", redirect: "/paso2" });

    } catch (error) {
        console.error('Error durante el envío de correo:', error);
        return res.status(500).send({ status: "Error", message: "Error durante el envío de correo" });
    }
};


export async function enviaCorreoLogin(req, res) {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send({ status: "Error", message: "El campo de correo está vacío" });
    }

    try {
        const [rows] = await pool.execute('SELECT verif_user FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length === 0 || rows[0].verif_user === 1) {
            return res.status(400).send({ status: "Error", message: "Correo no encontrado o ya verificado" });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000);
        recoveryCodes.set(correo, { codigo, expiracion: Date.now() + 5 * 60 * 1000 });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'gasguardad1@gmail.com', pass: 'jxqgehljwskmzfju' }
        });

        await transporter.sendMail({ from: 'gasguardad1@gmail.com', to: correo, subject: 'Código de verificación', text: `Tu código es: ${codigo}` });

        setTimeout(() => recoveryCodes.delete(correo), 5 * 60 * 1000);
        return res.send({ status: "ok", message: "Correo enviado", redirect: "/paso4" });
    } catch (error) {
        return res.status(500).send({ status: "Error", message: "Error enviando correo" });
    }
}



export const verificaCodigo = async (req, res) => {
    const { correo, codigo } = req.body;
    console.log("Cuerpo de la petición:", req.body);

    console.log("Recibiendo solicitud de verificación...");
    console.log("Correo recibido:", correo);
    console.log("Código recibido:", codigo);

    if (!correo || !codigo) {
        console.log("Faltan datos en la solicitud.");
        return res.status(400).send({ status: "Error", message: "Faltan datos" });
    }

    // Verificar que el código sea un número de 6 dígitos
    if (!/^\d{6}$/.test(codigo)) {
        console.log("Código inválido:", codigo);
        return res.status(400).send({ status: "Error", message: "El código debe ser un número de 6 dígitos" });
    }

    const storedData = recoveryCodes.get(correo);
    console.log("Datos almacenados en recoveryCodes:", storedData);

    if (!storedData) {
        console.log("Código no encontrado o expirado.");
        return res.status(400).send({ status: "Error", message: "Código incorrecto o expirado" });
    }

    if (Date.now() > storedData.expiracion) {
        console.log("Código expirado. Eliminando...");
        recoveryCodes.delete(correo);
        return res.status(400).send({ status: "Error", message: "Código expirado" });
    }

    console.log(`Código esperado: ${storedData.codigo}, Código recibido: ${codigo}`);

    if (parseInt(storedData.codigo) !== parseInt(codigo)) {
        console.log("Código incorrecto.");
        return res.status(400).send({ status: "Error", message: "Código incorrecto" });
    }

    console.log("Código válido. Redirigiendo...");
    recoveryCodes.delete(correo);
    return res.status(200).send({ status: "ok", message: "Código válido", redirect: "/recuperacion3" });
};

export const verificaCorreo = async (req, res) => {
    console.log("Recibiendo solicitud de verificación...");
    
    const { correo, codigo } = req.body;
    console.log("Correo recibido:", correo);
    console.log("Código recibido:", codigo);
    if (!correo || !codigo) {
        return res.status(400).send({ status: "Error", message: "Faltan datos" });
    }

    if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).send({ status: "Error", message: "El código debe ser un número de 6 dígitos" });
    }

    const storedData = recoveryCodes.get(correo);

    if (!storedData) {
        return res.status(400).send({ status: "Error", message: "Código incorrecto o expirado" });
    }

    if (Date.now() > storedData.expiracion) {
        recoveryCodes.delete(correo);
        return res.status(400).send({ status: "Error", message: "Código expirado" });
    }

    if (parseInt(storedData.codigo) !== parseInt(codigo)) {
        return res.status(400).send({ status: "Error", message: "Código incorrecto" });
    }

    
    try {
        await pool.execute('UPDATE musuario SET verif_user = 1 WHERE correo_user = ?', [correo]);
        recoveryCodes.delete(correo);
        return res.status(200).send({ status: "ok", message: "Verificación exitosa", redirect: "/login" });
    } catch (error) {
        console.error("Error al actualizar la base de datos:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
};

//falta que te redirija a la seccion de pagos pero hasta que este hecho


export const verificaCorreoLogin = async (req, res) => {
    console.log("Recibiendo solicitud de verificación...");
    
    const { correo, codigo } = req.body;
    console.log("Correo recibido:", correo);
    console.log("Código recibido:", codigo);

    if (!correo || !codigo) {
        return res.status(400).send({ status: "Error", message: "Faltan datos" });
    }

    if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).send({ status: "Error", message: "El código debe ser un número de 6 dígitos" });
    }

    const storedData = recoveryCodes.get(correo);

    if (!storedData) {
        return res.status(400).send({ status: "Error", message: "Código incorrecto o expirado" });
    }

    if (Date.now() > storedData.expiracion) {
        recoveryCodes.delete(correo);
        return res.status(400).send({ status: "Error", message: "Código expirado" });
    }

    if (parseInt(storedData.codigo) !== parseInt(codigo)) {
        return res.status(400).send({ status: "Error", message: "Código incorrecto" });
    }

    // El código es válido, se actualiza en la base de datos
    try {
        await pool.execute('UPDATE musuario SET verif_user = 1 WHERE correo_user = ?', [correo]);
        recoveryCodes.delete(correo);
        return res.status(200).send({ status: "ok", message: "Verificación exitosa", redirect: "/login" });
    } catch (error) {
        console.error("Error al actualizar la base de datos:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor" });
    }
};



export const resetPassword = async (req, res) => {
    const { correo, password, confpass } = req.body;

    if (!correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "Correo no encontrado" });
        }

        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        await pool.execute('UPDATE musuario SET contra_user = ? WHERE correo_user = ?', [hashPassword, correo]);

        return res.status(200).send({ status: "ok", message: "Contraseña restablecida correctamente", redirect: "/login" });
    } catch (error) {
        console.error('Error durante resetPassword:', error);
        return res.status(500).send({ status: "Error", message: "Error durante resetPassword" });
    }
};
export async function getUserInfo(req, res) {
    try {
        console.log("Headers de la solicitud:", req.headers);
        console.log("Cookies recibidas:", req.cookies); 
        

        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).send({ status: "Error", message: "No autenticado, no hay token" });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        console.log("Token decodificado:", decoded); // 🔥 Verifica el contenido del token

        const [rows] = await pool.execute(`
            SELECT 
                u.nom_user, 
                u.correo_user, 
                u.contra_user, 
                d.numero_direc AS num,
                calle.nom_calle AS calle,
                colonia.nom_col AS colonia,
                ciudad.nom_ciudad AS ciudad,
                estado.nom_estado AS estado,
                cp.cp_copost AS cp
            FROM musuario u
            LEFT JOIN ddireccion d ON u.id_direccion = d.id_direccion
            LEFT JOIN dcalle calle ON d.id_calle = calle.id_calle
            LEFT JOIN ccolonia colonia ON d.id_colonia = colonia.id_colonia
            LEFT JOIN cciudad ciudad ON d.id_ciudad = ciudad.id_ciudad
            LEFT JOIN cestado estado ON d.id_estado = estado.id_estado
            LEFT JOIN ccpostal cp ON d.id_copost = cp.id_copost
            WHERE u.id_user = ?`, [decoded.id_user]);

        console.log("Datos del usuario:", rows); // 🔥 Verifica qué devuelve la consulta

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }

        return res.send({ status: "ok", user: rows[0] });

    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error en el servidor" });
    }
}




export const methods = {
    login,
    registro,
    forgotPassword,
    verificaCodigo,
    verificaCorreo,
    enviaCorreo,
    verificaCorreoLogin,
    enviaCorreoLogin,
    resetPassword,
    registroAfiliados,
    recoveryCodes,
    getUserInfo
};