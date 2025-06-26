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
            'INSERT INTO musuario (nom_user, correo_user, contra_user, id_direccion, id_estcuenta) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, hashPassword, direccionId, 1]
        );

        return res.status(201).send({ status: "ok", message: `Usuario ${nombre} agregado`, redirect: "/paso2" });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al registrar usuario." });
    }
}

/*--------CUENTAS AFILIADAS */
export const registrarAfiliado = async (req, res) => {
    console.log("Solicitud recibida para registrar afiliado");
    const { nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass } = req.body;
    const idEmpresa = req.user.id_user;

    // Validaciones básicas
    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Todos los campos son obligatorios" });
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres" });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        // Verificar si el correo ya existe
        const [rows] = await pool.execute('SELECT correo_user FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length > 0) {
            return res.status(400).send({ status: "Error", message: "Este correo ya está registrado" });
        }

        // Hashear contraseña
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Insertar o recuperar ID de colonia
        const [coloniaResult] = await pool.execute('SELECT id_colonia FROM ccolonia WHERE nom_col = ?', [colonia]);
        const id_colonia = coloniaResult.length > 0
            ? coloniaResult[0].id_colonia
            : (await pool.execute('INSERT INTO ccolonia (nom_col) VALUES (?)', [colonia]))[0].insertId;

        // Insertar o recuperar ID de calle
        const [calleResult] = await pool.execute('SELECT id_calle FROM dcalle WHERE nom_calle = ?', [calle]);
        const id_calle = calleResult.length > 0
            ? calleResult[0].id_calle
            : (await pool.execute('INSERT INTO dcalle (nom_calle) VALUES (?)', [calle]))[0].insertId;

        // Insertar o recuperar ID de ciudad
        const [ciudadResult] = await pool.execute('SELECT id_ciudad FROM cciudad WHERE nom_ciudad = ?', [ciudad]);
        const id_ciudad = ciudadResult.length > 0
            ? ciudadResult[0].id_ciudad
            : (await pool.execute('INSERT INTO cciudad (nom_ciudad) VALUES (?)', [ciudad]))[0].insertId;

        // Insertar o recuperar ID de estado
        const [estadoResult] = await pool.execute('SELECT id_estado FROM cestado WHERE nom_estado = ?', [estado]);
        const id_estado = estadoResult.length > 0
            ? estadoResult[0].id_estado
            : (await pool.execute('INSERT INTO cestado (nom_estado) VALUES (?)', [estado]))[0].insertId;

        // Insertar o recuperar ID de código postal
        const [cpResult] = await pool.execute('SELECT id_copost FROM ccpostal WHERE cp_copost = ?', [cp]);
        const id_copost = cpResult.length > 0
            ? cpResult[0].id_copost
            : (await pool.execute('INSERT INTO ccpostal (cp_copost) VALUES (?)', [cp]))[0].insertId;

        // Insertar dirección
        const [direccionResult] = await pool.execute(
            'INSERT INTO ddireccion (numero_direc, id_colonia, id_calle, id_ciudad, id_estado, id_copost) VALUES (?, ?, ?, ?, ?, ?)',
            [numero, id_colonia, id_calle, id_ciudad, id_estado, id_copost]
        );
        const id_direccion = direccionResult.insertId;

        // Insertar usuario afiliado
        await pool.execute(
            'INSERT INTO musuario (nom_user, correo_user, contra_user, rol_user, id_direccion, id_relempr, id_estcuenta) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, correo, hashPassword, 'afiliado', id_direccion, idEmpresa, 1]
        );

        console.log("Usuario afiliado registrado correctamente");

        // Enviar la contraseña al correo
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
            subject: 'Registro exitoso en GasGuard',
            text: `Hola ${nombre}, tu cuenta ha sido creada exitosamente. Tu contraseña es: ${password}`
        };

        await transporter.sendMail(mailOptions);
        console.log("Correo enviado con la contraseña al usuario afiliado");

        return res.status(201).send({ status: "ok", message: `Afiliado ${nombre} registrado con éxito` });

    } catch (error) {
        console.error("Error al registrar afiliado:", error);
        return res.status(500).send({ status: "Error", message: "Error en el registro del afiliado" });
    }
};
/*--------CUENTAS AFILIADAS CON CUENTAS RESTANTES */
/*
export const registrarAfiliado = async (req, res) => {
    console.log("Solicitud recibida para registrar afiliado");
    const { nombre, cp, ciudad, colonia, calle, numero, estado, correo, password, confpass } = req.body;
    const idEmpresa = req.user.id_user;

    // Validaciones básicas
    if (!nombre || !cp || !ciudad || !colonia || !calle || !numero || !estado || !correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Todos los campos son obligatorios" });
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres" });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        // Verificar si el correo ya existe
        const [rows] = await pool.execute('SELECT correo_user FROM musuario WHERE correo_user = ?', [correo]);
        if (rows.length > 0) {
            return res.status(400).send({ status: "Error", message: "Este correo ya está registrado" });
        }

        // Agrega esto dentro del try, después de verificar el correo
        // Verificar cuentas restantes antes de registrar
        const [[empresa]] = await pool.execute(
            `SELECT u.id_user, u.afilocup_user, p.id_nmafil 
     FROM musuario u 
     JOIN psuscripcion p ON u.id_susc = p.id_susc 
     WHERE u.id_user = ?`, [idEmpresa]
        );

        if (!empresa) {
            return res.status(404).send({ status: "Error", message: "Empresa no encontrada" });
        }

        const cuentasDisponibles = empresa.id_nmafil - empresa.afilocup_user;
        if (cuentasDisponibles <= 0) {
            return res.status(400).send({ status: "Error", message: "Ya no tienes cuentas afiliadas disponibles" });
        }

        // al final del registro exitoso, incrementa afilocup_user
        await pool.execute(
            `UPDATE musuario SET afilocup_user = afilocup_user + 1 WHERE id_user = ?`, [idEmpresa]
        );
        // Hashear contraseña
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Insertar o recuperar ID de colonia
        const [coloniaResult] = await pool.execute('SELECT id_colonia FROM ccolonia WHERE nom_col = ?', [colonia]);
        const id_colonia = coloniaResult.length > 0
            ? coloniaResult[0].id_colonia
            : (await pool.execute('INSERT INTO ccolonia (nom_col) VALUES (?)', [colonia]))[0].insertId;

        // Insertar o recuperar ID de calle
        const [calleResult] = await pool.execute('SELECT id_calle FROM dcalle WHERE nom_calle = ?', [calle]);
        const id_calle = calleResult.length > 0
            ? calleResult[0].id_calle
            : (await pool.execute('INSERT INTO dcalle (nom_calle) VALUES (?)', [calle]))[0].insertId;

        // Insertar o recuperar ID de ciudad
        const [ciudadResult] = await pool.execute('SELECT id_ciudad FROM cciudad WHERE nom_ciudad = ?', [ciudad]);
        const id_ciudad = ciudadResult.length > 0
            ? ciudadResult[0].id_ciudad
            : (await pool.execute('INSERT INTO cciudad (nom_ciudad) VALUES (?)', [ciudad]))[0].insertId;

        // Insertar o recuperar ID de estado
        const [estadoResult] = await pool.execute('SELECT id_estado FROM cestado WHERE nom_estado = ?', [estado]);
        const id_estado = estadoResult.length > 0
            ? estadoResult[0].id_estado
            : (await pool.execute('INSERT INTO cestado (nom_estado) VALUES (?)', [estado]))[0].insertId;

        // Insertar o recuperar ID de código postal
        const [cpResult] = await pool.execute('SELECT id_copost FROM ccpostal WHERE cp_copost = ?', [cp]);
        const id_copost = cpResult.length > 0
            ? cpResult[0].id_copost
            : (await pool.execute('INSERT INTO ccpostal (cp_copost) VALUES (?)', [cp]))[0].insertId;

        // Insertar dirección
        const [direccionResult] = await pool.execute(
            'INSERT INTO ddireccion (numero_direc, id_colonia, id_calle, id_ciudad, id_estado, id_copost) VALUES (?, ?, ?, ?, ?, ?)',
            [numero, id_colonia, id_calle, id_ciudad, id_estado, id_copost]
        );
        const id_direccion = direccionResult.insertId;

        // Insertar usuario afiliado
        await pool.execute(
            'INSERT INTO musuario (nom_user, correo_user, contra_user, rol_user, id_direccion, id_relempr, id_estcuenta) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, correo, hashPassword, 'afiliado', id_direccion, idEmpresa, 1]
        );

        console.log("Usuario afiliado registrado correctamente");

        // Enviar la contraseña al correo
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
            subject: 'Registro exitoso en GasGuard',
            text: `Hola ${nombre}, tu cuenta ha sido creada exitosamente. Tu contraseña es: ${password}`
        };

        await transporter.sendMail(mailOptions);
        console.log("Correo enviado con la contraseña al usuario afiliado");

        return res.status(201).send({ status: "ok", message: `Afiliado ${nombre} registrado con éxito` });

    } catch (error) {
        console.error("Error al registrar afiliado:", error);
        return res.status(500).send({ status: "Error", message: "Error en el registro del afiliado" });
    }
};
*/
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

async function Obtenerprecioempr(req, res) {
    const {tiplan, noAfiliados} = req.body;

    if (!tiplan || isNaN(noAfiliados)) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (tiplan === "selectop") {
        return res.status(400).send({ status: "Error", message: "Elige un tipo de plan" });
    }

    if (noAfiliados < 1 || noAfiliados > 20) {
        return res.status(400).send({ status: "Error", message: "El número de afiliados debe estar entre 2 y 20."});
    }

    try {
        console.log("Datos recibidos:", { tiplan, noAfiliados });

        // Realiza la consulta y almacena los resultados
        const [rows] = await pool.execute(`
            SELECT ppp_nmafil, pbas_tiplan 
            FROM cplan pl
            JOIN ctipoplan tp ON pl.id_tiplan = tp.id_tiplan
            JOIN cnumafil na ON pl.id_nmafil = na.id_nmafil
            WHERE na.id_nmafil = ? AND tp.dura_tiplan = ?
        `, [noAfiliados, tiplan]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron datos." });
        }
        return res.status(200).send({ 
            status: "ok", 
            message: "Monto calculado", 
            planes: rows  
        });

    } catch (error) {
        console.error('Error durante Obtenerprecio:', error);
        return res.status(500).send({ status: "Error", message: "Error durante la consulta." });
    }
};

async function Obtenerpreciouser(req, res) {
    const {tiplan} = req.body;

    if (!tiplan ) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (tiplan === "selectop") {
        return res.status(400).send({ status: "Error", message: "Elige un tipo de plan" });
    }

    try {
        console.log("Datos recibidos:", { tiplan });

        // Realiza la consulta y almacena los resultados
        const [rows] = await pool.execute(`
            SELECT pbas_tiplan 
            FROM cplan pl
            JOIN ctipoplan tp ON pl.id_tiplan = tp.id_tiplan
            WHERE tp.dura_tiplan = ?
        `, [tiplan]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron datos." });
        }
        return res.status(200).send({ 
            status: "ok", 
            message: "Monto calculado", 
            planes: rows  
        });

    } catch (error) {
        console.error('Error durante Obtenerprecio:', error);
        return res.status(500).send({ status: "Error", message: "Error durante la consulta." });
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


async function repagoempresa(req, res) {
    const { tiplan, noAfiliados, correo, monto, meses } = req.body;


    if (!tiplan || !noAfiliados) {
        return res.status(400).json({ status: "Error", message: "Los campos están incompletos" });
    }


    if (noAfiliados < 1 || noAfiliados > 20) {
        return res.status(400).json({ status: "Error", message: "El número de afiliados debe estar entre 1 y 20." });
    }

    try {
        // Verificar si el usuario ya tiene una suscripción
        const [rows] = await pool.execute('SELECT id_susc FROM musuario WHERE correo_user = ?', [correo]);

        // Verificar si el usuario tiene suscripción (corregido)
        if (rows.length > 0 && rows[0].id_susc !== null) {
            return res.status(400).json({ status: "Error", message: "Este usuario tiene una suscripción activa" });
        }

        const ahora = new Date();

        // Para la fecha de inicio (formato YYYY-MM-DD)
        const fechaInicio = ahora.toISOString().split('T')[0];

        // Para la fecha de fin, añadir meses
        const fechaFin = new Date();
        fechaFin.setMonth(fechaFin.getMonth() + parseInt(meses));
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        const estatus = 1;

        // Obtener id_tiplan
        const [tipoplanResult] = await pool.execute('SELECT id_tiplan FROM ctipoplan WHERE dura_tiplan = ?', [tiplan]);
        let id_tiplan;
        if (tipoplanResult.length > 0) {
            id_tiplan = tipoplanResult[0].id_tiplan; // Corregido de id_colonia a id_tiplan
        } else {
            const [inserttipoplanResult] = await pool.execute('INSERT INTO ctipoplan (dura_tiplan) VALUES (?)', [tiplan]);
            id_tiplan = inserttipoplanResult.insertId;
        }

        // Obtener id_plan
        const [planResult] = await pool.execute('SELECT id_plan FROM cplan WHERE id_tiplan = ? AND id_nmafil = ?', [id_tiplan, noAfiliados]);
        let id_plan;
        if (planResult.length > 0) {
            id_plan = planResult[0].id_plan;
        } else {
            const [insertplanResult] = await pool.execute(
                'INSERT INTO cplan (id_tiplan, id_nmafil) VALUES (?, ?)',
                [id_tiplan, noAfiliados]
            );
            id_plan = insertplanResult.insertId;
        }

        // Insertar suscripción
        const [suscripcionResult] = await pool.execute(
            'INSERT INTO msuscripcion (fecini_susc, fecfin_susc, estado_susc, monto_susc, id_plan) VALUES (?, ?, ?, ?, ?)',
            [fechaInicio, fechaFinStr, estatus, monto, id_plan] // Eliminado id_estado que no estaba definido
        );
        const suscriId = suscripcionResult.insertId;

        const rol = "empresa";
        // Actualizar usuario
        await pool.execute(
            'UPDATE musuario SET id_susc = ?, rol_user = ? WHERE correo_user = ?',
            [suscriId, rol, correo]
        );

        return res.status(201).json({ status: "ok", message: "Suscripción activada", redirect: "/login" });
    } catch (error) {
        console.error('Error al realizar la suscripcion:', error);
        return res.status(500).json({ status: "Error", message: "Error al realizar la suscripcion." });
    }
}

async function repagousuario(req, res) {
    const { tiplan, correo, monto, meses } = req.body;
    
    
    if (monto === 0) {
        return res.status(400).json({ status: "Error", message: "Falta calcular el monto" });
    }
    
    
    try {
        // Verificar si el usuario ya tiene una suscripción
        const [rows] = await pool.execute('SELECT id_susc FROM musuario WHERE correo_user = ?', [correo]);
        
        // Verificar si el usuario tiene suscripción (corregido)
        if (rows.length > 0 && rows[0].id_susc !== null) {
            return res.status(400).json({ status: "Error", message: "Este usuario tiene una suscripción activa" });
        }
        
        const ahora = new Date();
        
        // Para la fecha de inicio (formato YYYY-MM-DD)
        const fechaInicio = ahora.toISOString().split('T')[0];
        
        // Para la fecha de fin, añadir meses
        const fechaFin = new Date();
        fechaFin.setMonth(fechaFin.getMonth() + parseInt(meses));
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        const estatus = 1;
        const noAfiliados = 1;
        
        // Obtener id_tiplan
        const [tipoplanResult] = await pool.execute('SELECT id_tiplan FROM ctipoplan WHERE dura_tiplan = ?', [tiplan]);
        let id_tiplan;
        if (tipoplanResult.length > 0) {
            id_tiplan = tipoplanResult[0].id_tiplan; // Corregido de id_colonia a id_tiplan
        } else {
            const [inserttipoplanResult] = await pool.execute('INSERT INTO ctipoplan (dura_tiplan) VALUES (?)', [tiplan]);
            id_tiplan = inserttipoplanResult.insertId;
        }
        
        // Obtener id_plan
        const [planResult] = await pool.execute('SELECT id_plan FROM cplan WHERE id_tiplan = ? AND id_nmafil = ?', [id_tiplan, noAfiliados]);
        let id_plan;
        if (planResult.length > 0) {
            id_plan = planResult[0].id_plan; 
        } else {
            const [insertplanResult] = await pool.execute(
                'INSERT INTO cplan (id_tiplan, id_nmafil) VALUES (?, ?)', 
                [id_tiplan, noAfiliados]
            );
            id_plan = insertplanResult.insertId;
        }
        
        // Insertar suscripción
        const [suscripcionResult] = await pool.execute(
            'INSERT INTO msuscripcion (fecini_susc, fecfin_susc, estado_susc, monto_susc, id_plan) VALUES (?, ?, ?, ?, ?)',
            [fechaInicio, fechaFinStr, estatus, monto, id_plan] // Eliminado id_estado que no estaba definido
        );
        const suscriId = suscripcionResult.insertId;
        
        const rol = "user";
        // Actualizar usuario
        await pool.execute(
            'UPDATE musuario SET id_susc = ?, rol_user = ? WHERE correo_user = ?',
            [suscriId, rol, correo]
        );
        
        return res.status(201).json({ status: "ok", message: "Suscripción activada", redirect: "/" });
    } catch (error) {
        console.error('Error al realizar la suscripcion:', error);
        return res.status(500).json({ status: "Error", message: "Error al realizar la suscripcion." });
    }
}

export const obtenerCuentasRestantes = async (req, res) => {
    const idEmpresa = req.user.id_user;

    try {
        const [[empresa]] = await pool.execute(`
            SELECT u.afilocup_user, p.id_nmafil 
            FROM musuario u 
            JOIN psuscripcion p ON u.id_susc = p.id_susc 
            WHERE u.id_user = ?
        `, [idEmpresa]);

        if (!empresa) {
            return res.status(404).send({ status: "Error", message: "Empresa no encontrada" });
        }

        const cuentasDisponibles = empresa.id_nmafil - empresa.afilocup_user;

        res.status(200).send({ status: "ok", cuentasDisponibles });
    } catch (error) {
        console.error("Error al obtener cuentas restantes:", error);
        res.status(500).send({ status: "Error", message: "Error al consultar cuentas restantes" });
    }
};

export const desactivarAfiliado = async (req, res) => {
    const { idAfiliado } = req.body;

    try {
        // 1. Obtener el id del estado 'inactiva'
        const [[estado]] = await pool.execute(`
            SELECT id_estcuenta 
            FROM cestadocuenta 
            WHERE nom_estcuenta = 'inactiva'
        `);

        if (!estado) {
            return res.status(500).send({ status: "Error", message: "No se encontró el estado 'inactiva'" });
        }

        const idEstadoInactiva = estado.id_estcuenta;

        // 2. Obtener el id de la empresa que registró al afiliado
        const [[afiliado]] = await pool.execute(`
            SELECT id_relempr 
            FROM musuario 
            WHERE id_user = ?
        `, [idAfiliado]);

        if (!afiliado || !afiliado.id_relempr) {
            return res.status(404).send({ status: "Error", message: "Afiliado no encontrado o sin empresa asociada" });
        }

        const idEmpresa = afiliado.id_relempr;

        // 3. Actualizar el estado del afiliado a 'inactiva'
        await pool.execute(`
            UPDATE musuario 
            SET id_estcuenta = ? 
            WHERE id_user = ?
        `, [idEstadoInactiva, idAfiliado]);

        // 4. Disminuir el contador de afiliados ocupados de la empresa
        await pool.execute(`
            UPDATE musuario 
            SET afilocup_user = afilocup_user - 1 
            WHERE id_user = ?
        `, [idEmpresa]);

        res.status(200).send({ status: "ok", message: "Afiliado desactivado correctamente" });

    } catch (error) {
        console.error("Error al desactivar afiliado:", error);
        res.status(500).send({ status: "Error", message: "Error al desactivar afiliado" });
    }
};


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
    registrarAfiliado,
    recoveryCodes,
    getUserInfo,
    repagoempresa,
    Obtenerprecioempr,
    repagousuario,
    Obtenerpreciouser,
    obtenerCuentasRestantes,
    desactivarAfiliado
};