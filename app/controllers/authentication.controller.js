import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

dotenv.config();

const conexion = await mysql.createConnection({
    host: 'localhost',
    database: 'DBGASGUARDAPPVSSC',
    user: 'root',
   // password: 'n0m3l0'
    password: 'jaghSQL2806.'
    //password: 'Sally2007.'
});

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

async function registro(req, res) {

    const { nombre, appat, apmat, pais, ciudad, colonia, calle, numero, correo, confcorreo, password, confpass } = req.body;

    if (!nombre || !appat || !apmat || !pais || !ciudad || !colonia || !calle || !numero || !correo || !confcorreo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres." });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    if (correo !== confcorreo) {
        return res.status(400).send({ status: "Error", message: "Los correos electrónicos no coinciden" });
    }

    try {
        const [rows] = await conexion.execute('SELECT correo_cli FROM mcliente WHERE correo_cli = ?', [correo]);
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

        const [coloniaResult] = await conexion.execute('SELECT id_colonia FROM ccolonia WHERE nom_col = ?', [colonia]);
        let id_colonia;
        if (coloniaResult.length > 0) {
            id_colonia = coloniaResult[0].id_colonia;
        } else {
            const [insertColoniaResult] = await conexion.execute('INSERT INTO ccolonia (nom_col) VALUES (?)', [colonia]);
            id_colonia = insertColoniaResult.insertId;
        }

        const [calleResult] = await conexion.execute('SELECT id_calle FROM dcalle WHERE nom_calle = ?', [calle]);
        let id_calle;
        if (calleResult.length > 0) {
            id_calle = calleResult[0].id_calle;
        } else {
            const [insertCalleResult] = await conexion.execute('INSERT INTO dcalle (nom_calle) VALUES (?)', [calle]);
            id_calle = insertCalleResult.insertId;
        }

        const [ciudadResult] = await conexion.execute('SELECT id_ciudad FROM cciudad WHERE nom_ciudad = ?', [ciudad]);
        let id_ciudad;
        if (ciudadResult.length > 0) {
            id_ciudad = ciudadResult[0].id_ciudad;
        } else {
            const [insertCiudadResult] = await conexion.execute('INSERT INTO cciudad (nom_ciudad) VALUES (?)', [ciudad]);
            id_ciudad = insertCiudadResult.insertId;
        }

        const [paisResult] = await conexion.execute('SELECT id_pais FROM cpais WHERE nom_pais = ?', [pais]);
        let id_pais;
        if (paisResult.length > 0) {
            id_pais = paisResult[0].id_pais;
        } else {
            const [insertPaisResult] = await conexion.execute('INSERT INTO cpais (nom_pais) VALUES (?)', [pais]);
            id_pais = insertPaisResult.insertId;
        }

        const [direccionResult] = await conexion.execute(
            'INSERT INTO ddireccion (numero_direc, id_colonia, id_calle, id_ciudad, id_pais) VALUES (?, ?, ?, ?, ?)',
            [numero, id_colonia, id_calle, id_ciudad, id_pais]
        );
        const direccionId = direccionResult.insertId;

        await conexion.execute(
            'INSERT INTO mcliente (nom_cli, appat_cli, apmat_cli, correo_cli, contra_cli, id_direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, appat, apmat, correo, hashPassword, direccionId]
        );

        return res.status(201).send({ status: "ok", message: `Usuario ${nombre} agregado`, redirect: "/" });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al registrar usuario." });
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
}

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

export const methods = {
    login,
    registro,
    forgotPassword,
    resetPassword
};
