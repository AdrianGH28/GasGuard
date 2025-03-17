import express from "express";
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import nodemailer from 'nodemailer';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { methods as authentication } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./middlewares/authorization.js";
import dotenv from "dotenv";
import pool from "./generalidades_back_bd.js";

console.log("Métodos de autenticación:", authentication);
console.log("Mapa de códigos:", authentication.recoveryCodes);

dotenv.config();

// Fix para __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server
const app = express();
// Configuración del transporte de correo con nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gasguardad1@gmail.com',
        pass: 'jxqgehljwskmzfju'        // Cambia esto por tu contraseña
    }
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secret key from your .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const router = express.Router();

// Conexion con la base de datos



// Configuracion
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 4000; // Usa el puerto de entorno o el 4000 por defecto
app.set("port", PORT);

app.listen(app.get("port"), () => {
    console.log("Servidor corriendo en puerto", app.get("port"));
});


// Rutas
app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/login.html"));
app.get("/registropago", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/registropago.html"));
app.get("/registro", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/registro.html"));
app.get("/forgotpass", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/forgotpass.html"));
app.get("/codigocontra", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/codigocontra.html"));
app.get("/resetpass", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/resetpass.html"));
app.get("/dispositivos", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/dispositivos.html"));
app.get("/usuario", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/usuario.html"));
app.get("/historial", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/historial.html"));
app.get("/principal", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/principal.html"));
app.get("/vincular", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/vincular.html"));
app.get("/inicio", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/inicio.html"));
app.get("/inicioadmin", authorization.verificarRolAdmin, (req, res) => res.sendFile(__dirname + "/pages/inicioadmin.html"));
app.get("/usuarioadmin", authorization.verificarRolAdmin, (req, res) => res.sendFile(__dirname + "/pages/usuarioadmin.html"));
app.get("/dispositivosadmin", authorization.verificarRolAdmin, (req, res) => res.sendFile(__dirname + "/pages/dispositivosadmin.html"));
app.get("/clientesadmin", authorization.verificarRolAdmin, (req, res) => res.sendFile(__dirname + "/pages/clientesadmin.html"));
app.get("/trabajadoresadmin", authorization.verificarRolAdmin, (req, res) => res.sendFile(__dirname + "/pages/trabajadoresadmin.html"));


app.post("/api/registro", authentication.registro);
app.post("/api/login", authentication.login);
app.post("/api/forgot-password", authentication.forgotPassword);
app.post("/api/codigo-contra", authentication.verificaCodigo);
app.post("/api/reset-password", authentication.resetPassword);
app.post("/api/codigo-contra", authentication.verificaCodigo);

// Generar una IP aleatoria
function generarIPAleatoria() {
    return `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// Vincular dispositivo
app.post("/api/vincular", authorization.proteccion, async (req, res) => {
    const { ssid, password, ubicacion } = req.body;
    const id_cliente = req.user.id_cliente; // Asegúrate de obtener el id_cliente del token de autorización

    // Registros de depuración
    console.log('Datos recibidos:', { ssid, password, ubicacion, id_cliente });

    // Verificar que los campos obligatorios estén definidos
    if (!ssid || !password || !ubicacion || !id_cliente) {
        return res.status(400).send({ status: "Error", message: "Todos los campos son requeridos" });
    }

    const ipAleatoria = generarIPAleatoria();

    try {
        // Verificar si la ubicación ya existe
        const [ubicacionRows] = await conexion.execute('SELECT id_ubi FROM dubicacion WHERE nom_ubi = ?', [ubicacion]);

        let id_ubi;
        if (ubicacionRows.length > 0) {
            // La ubicación ya existe, obtener su id
            id_ubi = ubicacionRows[0].id_ubi;
        } else {
            // La ubicación no existe, insertarla y obtener su id
            const [ubicacionResult] = await conexion.execute('INSERT INTO dubicacion (nom_ubi) VALUES (?)', [ubicacion]);
            id_ubi = ubicacionResult.insertId;
        }

        // Insertar el dispositivo con el id de la ubicación
        const [result] = await conexion.execute(`
            INSERT INTO mdispositivo (des_dis, id_cliente, id_ubi, wifi_dis, contraseña_dis, ip_dis) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['Dispositivo de Prueba', id_cliente, id_ubi, ssid, password, ipAleatoria]);

        if (result.affectedRows === 0) {
            return res.status(500).send({ status: "Error", message: "Error al vincular el dispositivo" });
        }

        res.send({ status: "ok", message: "Dispositivo vinculado exitosamente" });
    } catch (error) {
        console.error('Error al vincular el dispositivo:', error);
        return res.status(500).send({ status: "Error", message: "Error al vincular el dispositivo" });
    }
});

// Ruta para obtener los datos del usuario
app.get("/api/usuario", authorization.proteccion, async (req, res) => {
    const correo = req.user.correo;
    try {
        const [rows] = await conexion.execute(`
            SELECT mcliente.*, ddireccion.numero_direc, ccodigop.codigop, cciudad.nom_ciudad, cestado.nom_estado, ccolonia.nom_col, dcalle.nom_calle
            FROM mcliente 
            JOIN ddireccion ON mcliente.id_direccion = ddireccion.id_direccion
            JOIN ccodigop ON ddireccion.id_codigop = ccodigop.id_codigop
            JOIN cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN dcalle ON ddireccion.id_calle = dcalle.id_calle
            WHERE correo_cli = ?`, [correo]);
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }
        const usuario = rows[0];
        res.send({ status: "ok", data: usuario });
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener el usuario" });
    }
});

// Ruta para actualizar los datos del usuario
app.put("/api/usuario", authorization.proteccion, async (req, res) => {
    const { nombre, appat, correo, estado, cp, ciudad, colonia, calle, numero } = req.body;
    const correoOriginal = req.user.correo;

    try {
        const [result] = await conexion.execute(`
            UPDATE mcliente 
            JOIN ddireccion ON mcliente.id_direccion = ddireccion.id_direccion
            JOIN ccodigop ON ddireccion.id_codigop = ccodigop.id_codigop
            JOIN cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN dcalle ON ddireccion.id_calle = dcalle.id_calle
            SET 
                mcliente.nom_cli = ?,
                mcliente.appat_cli = ?,
                mcliente.correo_cli = ?,
                cestado.nom_estado = ?,
                ccodigop.codigop = ?,
                cciudad.nom_ciudad = ?,
                ccolonia.nom_col = ?,
                dcalle.nom_calle = ?,
                ddireccion.numero_direc = ?
            WHERE mcliente.correo_cli = ?
        `, [nombre, appat, correo, estado, cp, ciudad, colonia, calle, numero, correoOriginal]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }

        res.send({ status: "ok", message: "Información actualizada exitosamente" });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al actualizar el usuario" });
    }
});


// Ruta para obtener la lista de dispositivos
app.get("/api/dispositivos", authorization.proteccion, async (req, res) => {
    const id_cliente = req.user.id_cliente; // Asegúrate de obtener el id_cliente del token de autorización

    if (!id_cliente) {
        return res.status(400).send({ status: "Error", message: "ID del cliente no está definido" });
    }

    try {
        const [rows] = await conexion.execute(`
            SELECT d.*, u.nom_ubi 
            FROM mdispositivo d
            JOIN dubicacion u ON d.id_ubi = u.id_ubi
            WHERE d.id_cliente = ?
        `, [id_cliente]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron dispositivos" });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los dispositivos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los dispositivos" });
    }
});

// Ruta para eliminar un dispositivo
app.delete("/api/dispositivos/:id", authorization.proteccion, async (req, res) => {
    const id_dispositivo = req.params.id;

    try {
        const [result] = await conexion.execute(`
            DELETE FROM mdispositivo WHERE id_dispositivo = ?
        `, [id_dispositivo]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ status: "Error", message: "Dispositivo no encontrado" });
        }

        res.send({ status: "ok", message: "Dispositivo eliminado exitosamente" });
    } catch (error) {
        console.error('Error al eliminar el dispositivo:', error);
        return res.status(500).send({ status: "Error", message: "Error al eliminar el dispositivo" });
    }
});



// Ruta para verificar si hay dispositivos vinculados
app.get("/api/dispositivo-activo", authorization.proteccion, async (req, res) => {
    try {
        const [rows] = await conexion.execute(`SELECT COUNT(*) AS count FROM mdispositivo`);
        const deviceCount = rows[0].count;

        res.send({ status: "ok", data: deviceCount });
    } catch (error) {
        console.error('Error al verificar los dispositivos:', error);
        res.status(500).send({ status: "Error", message: "Error al verificar los dispositivos" });
    }
});

app.get("/api/histor", async (req, res) => {
    try {
        const [rows] = await conexion.execute('select fecha, hora, resistencia from dregistro re inner join mpresenciadegas pr on re.id_presenciadegas = pr.id_presenciadegas inner join mdispositivo di on re.id_dispositivo = di.id_dispositivo inner join mcliente cl on di.id_cliente = cl.id_cliente where resistencia > 50 order by fecha desc, hora desc;');
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos del historial:', error.message);
        res.status(500).send('Error al obtener datos del historial');
    }
});

app.post('/guardar-datos', async (req, res) => {
    console.log('Recibida una solicitud para guardar datos:', req.body);

    const { plot0, date, time } = req.body;
    let id_presenciadegas = plot0 > 50 ? 2 : 1;

    try {
        // Verify id_dispositivo exists
        console.log('Checking if id_dispositivo = 1 exists...');
        const [deviceRows] = await conexion.execute('SELECT * FROM mdispositivo WHERE id_dispositivo = 1');
        console.log('Device Rows:', deviceRows);
        if (deviceRows.length === 0) {
            console.log('Error: id_dispositivo no existe');
            return res.status(400).send('Error: id_dispositivo no existe');
        }

        // Verify id_presenciadegas exists
        console.log(`Checking if id_presenciadegas = ${id_presenciadegas} exists...`);
        const [presenceRows] = await conexion.execute('SELECT * FROM mpresenciadegas WHERE id_presenciadegas = ?', [id_presenciadegas]);
        console.log('Presence Rows:', presenceRows);
        if (presenceRows.length === 0) {
            console.log('Error: id_presenciadegas no existe');
            return res.status(400).send('Error: id_presenciadegas no existe');
        }

        // Insert data into the database
        console.log('Inserting data into dregistro...');
        const query = 'INSERT INTO dregistro (fecha, hora, resistencia, id_dispositivo, id_presenciadegas, des_reg) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await conexion.execute(query, [date, time, plot0, 1, id_presenciadegas, 'Valor predeterminado']);
        console.log('Insert Result:', result);

        if (result.affectedRows === 0) {
            console.log('No se insertaron filas en la base de datos');
            return res.status(500).send('Error al insertar datos en la base de datos');
        }

        console.log('Datos insertados correctamente en la base de datos');
        res.status(200).send('Datos insertados correctamente en la base de datos');
    } catch (error) {
        console.error('Error al insertar datos en la base de datos:', error.message);
        res.status(500).send('Error al insertar datos en la base de datos');
    }
});
app.post('/api/forgot-password', async (req, res) => {
    const { correo } = req.body;

    try {
        const [rows] = await conexion.execute('SELECT correo_cli FROM mcliente WHERE correo_cli = ?', [correo]);

        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "No existe un usuario con ese correo" });
        }

        res.status(200).send({ status: "ok", message: "Correo verificado, redirigiendo a restablecer contraseña" });
    } catch (error) {
        console.error('Error al verificar el correo:', error);
        res.status(500).send({ status: "Error", message: "Error al verificar el correo" });
    }
});



// Ruta para reenviar el código con límite de intentos y bloqueo de 1 minuto
app.post('/api/reenvio-codigo', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ status: 'error', message: 'Correo no proporcionado' });
    }

    try {
        const storedData = authentication.recoveryCodes.get(correo);

        if (!storedData) {
            return res.status(400).json({ status: 'error', message: 'No hay código para este correo' });
        }

        if (storedData.reintentos >= 3) {
            return res.status(400).json({ status: 'error', message: 'Límite de reenvíos alcanzado' });
        }

        if (storedData.bloqueo && Date.now() < storedData.bloqueo) {
            return res.status(400).json({ status: 'error', message: 'Debes esperar antes de reenviar el código' });
        }

        // Generar nuevo código
        const nuevoCodigo = Math.floor(100000 + Math.random() * 900000);
        authentication.recoveryCodes.set(correo, { 
            codigo: nuevoCodigo, 
            expiracion: Date.now() + 5 * 60 * 1000, 
            reintentos: storedData.reintentos + 1, 
            bloqueo: Date.now() + 60 * 1000 
        });

        console.log(`Código ${nuevoCodigo} generado para ${correo}`);

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
            subject: 'Código de recuperación de cuenta',
            text: `Tu código de recuperación es: ${nuevoCodigo}`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Código ${nuevoCodigo} enviado correctamente a ${correo}`);

        res.json({ status: 'ok', message: 'Código reenviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ status: 'error', message: 'Error al reenviar el código' });
    }
});



export const verificaCodigo = async (req, res) => {
    const { correo, codigo } = req.body; // Asegúrate de que se envíen ambos datos

    if (!correo || !codigo) {
        return res.status(400).send({ status: "Error", message: "Faltan datos" });
    }

    const storedCode = recoveryCodes.get(correo);
    console.log(recoveryCodes);

    if (!storedCode || storedCode.toString() !== codigo.toString()) {
        return res.status(400).send({ status: "Error", message: "Código incorrecto o expirado" });
    }

    recoveryCodes.delete(correo); // Eliminar el código después de usarlo
    return res.status(200).send({ status: "ok", message: "Código válido", redirect: "/resetpass" });
};



app.post('/api/reset-password', async (req, res) => {
    const { correo, password, confpass } = req.body;

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres." });
    }

    try {
        const [rows] = await conexion.execute('SELECT correo_cli FROM mcliente WHERE correo_cli = ?', [correo]);

        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "El correo no existe" });
        }

        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        await conexion.execute('UPDATE mcliente SET contra_cli = ? WHERE correo_cli = ?', [hashPassword, correo]);

        res.status(200).send({ status: "ok", message: "Contraseña restablecida exitosamente" });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).send({ status: "Error", message: "Error al restablecer la contraseña" });
    }
});




// Ruta para obtener la información de los dispositivos
app.get("/api/dispositivosadmin", authorization.proteccion, async (req, res) => {
    try {
        const [rows] = await conexion.execute(`
            SELECT 
                mdispositivo.id_dispositivo,
                mdispositivo.des_dis,
                mdispositivo.wifi_dis,
                mdispositivo.contraseña_dis,
                mdispositivo.ip_dis,
                mcliente.correo_cli
            FROM 
                mdispositivo
            JOIN 
                mcliente ON mdispositivo.id_cliente = mcliente.id_cliente
        `);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron dispositivos" });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los dispositivos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los dispositivos" });
    }
});

// Ruta para actualizar los datos del usuario
app.put("/api/usuarioadmin", authorization.proteccion, async (req, res) => {
    const { nombre, appat, apmat, pais, ciudad, colonia, calle, numero } = req.body;
    const correo = req.user.correo;

    try {
        // Obtener la dirección actual del usuario
        const [rows] = await conexion.execute(`
            SELECT id_direccion FROM mcliente WHERE correo_cli = ?
        `, [correo]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }

        const id_direccion = rows[0].id_direccion;

        // Actualizar la tabla mcliente
        const [resultCliente] = await conexion.execute(`
            UPDATE mcliente 
            SET 
                nom_cli = ?,
                appat_cli = ?
            WHERE correo_cli = ?
        `, [nombre, appat, correo]);

        // Actualizar la tabla ddireccion
        const [resultDireccion] = await conexion.execute(`
            UPDATE ddireccion 
            JOIN cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN dcalle ON ddireccion.id_calle = dcalle.id_calle
            JOIN ccoidgop ON ddireccion.id_codigop = ccodigo.id_codigop
            SET 
                cestado.nom_estado = ?,
                cciudad.nom_ciudad = ?,
                ccolonia.nom_col = ?,
                dcalle.nom_calle = ?,
                ccodigop.codigop = ?,
                ddireccion.numero_direc = ?
            WHERE ddireccion.id_direccion = ?
        `, [estado, cp, ciudad, colonia, calle, numero, id_direccion]);

        if (resultCliente.affectedRows === 0 || resultDireccion.affectedRows === 0) {
            return res.status(404).send({ status: "Error", message: "Error al actualizar el usuario" });
        }

        res.send({ status: "ok", message: "Información actualizada exitosamente" });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al actualizar el usuario" });
    }
});

// Ruta para obtener la información de los clientes con rol "user"
app.get("/api/clientesadmin", authorization.proteccion, async (req, res) => {
    try {
        const [rows] = await conexion.execute(`
            SELECT 
                mcliente.nom_cli,
                mcliente.appat_cli,
                mcliente.correo_cli,
                CONCAT(
                    dcalle.nom_calle,
                    ' ',
                    ddireccion.numero_direc,
                    ', ',
                    ccolonia.nom_col,
                    ', ',
                    cciudad.nom_ciudad,
                    ', ',
                    cestado.nom_estado
                    ', ',
                    ccodigop.codigop
                    
                    
                    
                ) AS direccion
            FROM 
                mcliente
            JOIN 
                ddireccion ON mcliente.id_direccion = ddireccion.id_direccion
            JOIN 
                dcalle ON ddireccion.id_calle = dcalle.id_calle
            JOIN 
                ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN 
                cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN 
                cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN 
                ccodigop ON ddireccion.id_codigop = ccodigop.id_codigop
            WHERE 
                mcliente.rol = 'user'
        `);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron clientes con rol 'user'" });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los clientes con rol "user":', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los clientes con rol 'user'" });
    }
});

// Ruta para obtener la información de los trabajadores
app.get("/api/trabajadoresadmin", authorization.proteccion, async (req, res) => {
    try {
        const [rows] = await conexion.execute(`
            SELECT 
                mcliente.id_cliente,
                mcliente.nom_cli,
                mcliente.appat_cli,
                mcliente.correo_cli,
                ddireccion.numero_direc,
                cestado.nom_estado,
                cciudad.nom_ciudad,
                ccolonia.nom_col,
                ccodigop.codigop,
                dcalle.nom_calle
            FROM 
                mcliente
            JOIN 
                ddireccion ON mcliente.id_direccion = ddireccion.id_direccion
            JOIN 
                cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN 
                cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN 
                ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN 
                dcalle ON ddireccion.id_calle = dcalle.id_calle
            JOIN 
                ccodigop ON ddireccion.id_codigop = ccodigop.id_codigop
            WHERE
                mcliente.rol = 'trabajador'
        `);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron trabajadores" });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los trabajadores:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los trabajadores" });
    }
});

// Ruta para eliminar un trabajador por su ID de cliente
app.delete("/api/trabajadoresadmin/:idCliente", authorization.proteccion, async (req, res) => {
    const idCliente = req.params.idCliente;

    try {
        // Primero, verifica si el trabajador existe
        const [rows] = await conexion.execute('SELECT * FROM mcliente WHERE id_cliente = ?', [idCliente]);
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "Trabajador no encontrado" });
        }

        // Si el trabajador existe, procede a eliminarlo
        await conexion.execute('DELETE FROM mcliente WHERE id_cliente = ?', [idCliente]);

        // Envía una respuesta de éxito
        res.send({ status: "ok", message: "Trabajador eliminado exitosamente" });
    } catch (error) {
        console.error('Error al eliminar el trabajador:', error);
        return res.status(500).send({ status: "Error", message: "Error al eliminar el trabajador" });
    }
});
