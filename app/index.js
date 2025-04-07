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
import { getUserInfo } from './controllers/authentication.controller.js';
import { methods as authorization } from "./middlewares/authorization.js";
import dotenv from "dotenv";
import pool from "./generalidades_back_bd.js";
import cors from 'cors';

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

app.use(cors({
    origin: 'https://gasguard-production.up.railway.app',  // Reemplaza con tu dominio o usa '*' para permitir todos los orígenes
    credentials: true  // Importante para permitir el envío de cookies (si las usas)
}));

// Conexion con la base de datos



// Configuracion
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 4000; // Usa el puerto de entorno o el 4000 por defecto
app.set("port", PORT);

app.listen(app.get("port"), () => {
    console.log("Servidor corriendo en puerto", app.get("port"));
});


// Rutas
app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/landing.html"));
app.get("/login", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_login.html"));
app.get("/registropago", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/registropago.html"));
app.get("/paso1", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_paso1.html"));
app.get("/paso2", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_paso2.html"));
app.get("/paso4", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_paso4.html"));
app.get("/recuperacion1", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_recuperacion1.html"));
app.get("/recuperacion2", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_recuperacion2.html"));
app.get("/recuperacion3", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_recuperacion3.html"));
app.get("/verificacorreo2", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_verificacorreo2.html"));
app.get("/genseleccioninfo", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/generalidades_seleccioninfo.html"));
app.get("/maeinfocuenta", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_infocuenta.html"));
app.get("/maecrudcuentasafi", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_crudcuentasafi.html"));
app.get("/maevisualizarrep", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_visualizarrep.html"));
app.get("/maedashboard", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_dashboard.html"));
app.get("/dispositivos", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/dispositivos.html"));
app.get("/usuario", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/usuario.html"));
app.get("/historial", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/historial.html"));
app.get("/principal", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/principal.html"));
app.get("/seleccioninfo", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/seleccion_info.html"));
app.get("/principalprueba", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/paginaprincipalprueba.html"));
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
app.post("/api/verifica-contra", authentication.verificaCorreo);
app.post("/api/enviar-correo", authentication.enviaCorreo);
app.post("/api/verifica-contra-login", authentication.verificaCorreoLogin);
app.post("/api/enviar-correo-login", authentication.enviaCorreoLogin);
app.post("/api/reset-password", authentication.resetPassword);
app.post("/api/registro-afiliados", authentication.registroAfiliados);

app.get("/api/user-info", authentication.getUserInfo);


app.put("/api/update-user", authorization.proteccion, async (req, res) => {
    const { nombre, correo, password, estado, cp, ciudad, colonia, calle, numero } = req.body;
    const correoOriginal = req.user.correo_user; // Usamos 'correo_user' porque es el campo correcto en tu tabla 'musuario'

    try {
        // 1. Verificar si se cambió la contraseña
        let hashPassword = null;
        if (password && password !== req.user.contra_user) {
            const salt = await bcryptjs.genSalt(10);  // Genera un 'salt' con mayor seguridad (10)
            hashPassword = await bcryptjs.hash(password, salt);  // Realiza el hash de la nueva contraseña
        }

        // 2. Asegurarse de que los valores no sean undefined
        // Si algún valor no está definido, lo reemplazamos por null
        const updatedNombre = nombre || null;
        const updatedCorreo = correo || null;
        const updatedEstado = estado || null;
        const updatedCiudad = ciudad || null;
        const updatedColonia = colonia || null;
        const updatedCalle = calle || null;
        const updatedNumero = numero || null;
        const updatedCp = cp || null;

        // 3. Actualizar los datos del usuario en la tabla 'musuario'
        const [result] = await pool.execute(`
            UPDATE musuario 
            JOIN ddireccion ON musuario.id_direccion = ddireccion.id_direccion
            JOIN cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN dcalle ON ddireccion.id_calle = dcalle.id_calle
            JOIN ccpostal ON ddireccion.id_copost = ccpostal.id_copost
            SET 
                musuario.nom_user = ?, 
                musuario.correo_user = ?, 
                ${hashPassword ? 'musuario.contra_user = ?, ' : ''}  // Solo incluye la contraseña si hay un cambio
                cestado.nom_estado = ?, 
                cciudad.nom_ciudad = ?, 
                ccolonia.nom_col = ?, 
                dcalle.nom_calle = ?, 
                ddireccion.numero_direc = ?, 
                ccpostal.cp_copost = ?
            WHERE musuario.correo_user = ?
        `, hashPassword
            ? [updatedNombre, updatedCorreo, hashPassword, updatedEstado, updatedCiudad, updatedColonia, updatedCalle, updatedNumero, updatedCp, correoOriginal]
            : [updatedNombre, updatedCorreo, updatedEstado, updatedCiudad, updatedColonia, updatedCalle, updatedNumero, updatedCp, correoOriginal]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }

        // 4. Si el correo cambia, actualizamos verif_user a 0
        if (correo !== correoOriginal) {
            await pool.execute('UPDATE musuario SET verif_user = 0 WHERE correo_user = ?', [correo]);
        }

        res.send({ status: "ok", message: "Información actualizada exitosamente" });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al actualizar el usuario" });
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

        const ahora = Date.now();

        // Verificar si el usuario está bloqueado y si ya pasó 1 hora
        if (storedData.bloqueo && ahora < storedData.bloqueo) {
            return res.status(400).json({ status: 'error', message: 'Has alcanzado el límite de intentos. Inténtalo nuevamente en 1 hora.' });
        } else if (storedData.bloqueo && ahora >= storedData.bloqueo) {
            // Restablecer intentos después de 1 hora
            storedData.reintentos = 0;
            storedData.bloqueo = null;
        }

        // Si el usuario ha alcanzado el límite de intentos, bloquear por 1 hora
        if (storedData.reintentos >= 3) {
            authentication.recoveryCodes.set(correo, {
                ...storedData,
                bloqueo: ahora + 60 * 60 * 1000 // Bloqueo de 1 hora
            });
            return res.status(400).json({ status: 'error', message: 'Has alcanzado el límite de intentos. Inténtalo nuevamente en 1 hora.' });
        }

        // Verificar si el usuario debe esperar 1 minuto antes de reenviar
        if (storedData.ultimoIntento && ahora - storedData.ultimoIntento < 60 * 1000) {
            return res.status(400).json({ status: 'error', message: 'Debes esperar 1 minuto antes de reenviar el código nuevamente.' });
        }

        // Generar nuevo código
        const nuevoCodigo = Math.floor(100000 + Math.random() * 900000);
        authentication.recoveryCodes.set(correo, { 
            codigo: nuevoCodigo, 
            expiracion: ahora + 5 * 60 * 1000, 
            reintentos: storedData.reintentos + 1, 
            ultimoIntento: ahora 
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

app.get('/api/verificar-bloqueo', (req, res) => {
    const correo = req.query.correo;

    if (!correo) {
        return res.status(400).json({ status: 'error', message: 'Correo no proporcionado' });
    }

    const storedData = authentication.recoveryCodes.get(correo);

    if (!storedData) {
        return res.json({ bloqueado: false });
    }

    const ahora = Date.now();

    if (storedData.bloqueo && ahora < storedData.bloqueo) {
        return res.json({ bloqueado: true, tiempoRestante: storedData.bloqueo - ahora });
    }

    return res.json({ bloqueado: false });
});


app.post('/api/reenvio-codigo-paso2', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ status: 'error', message: 'Correo no proporcionado' });
    }

    try {
        const storedData = authentication.recoveryCodes.get(correo);

        if (!storedData) {
            return res.status(400).json({ status: 'error', message: 'No hay código para este correo' });
        }

        const ahora = Date.now();

        // Verificar si el usuario está bloqueado y si ya pasó 1 hora
        if (storedData.bloqueo && ahora < storedData.bloqueo) {
            return res.status(400).json({ status: 'error', message: 'Has alcanzado el límite de intentos. Inténtalo nuevamente en 1 hora.' });
        } else if (storedData.bloqueo && ahora >= storedData.bloqueo) {
            // Restablecer intentos después de 1 hora
            storedData.reintentos = 0;
            storedData.bloqueo = null;
        }

        // Si el usuario ha alcanzado el límite de intentos, bloquear por 1 hora
        if (storedData.reintentos >= 3) {
            authentication.recoveryCodes.set(correo, {
                ...storedData,
                bloqueo: ahora + 60 * 60 * 1000 // Bloqueo de 1 hora
            });
            return res.status(400).json({ status: 'error', message: 'Has alcanzado el límite de intentos. Inténtalo nuevamente en 1 hora.' });
        }

        // Verificar si el usuario debe esperar 1 minuto antes de reenviar
        if (storedData.ultimoIntento && ahora - storedData.ultimoIntento < 60 * 1000) {
            return res.status(400).json({ status: 'error', message: 'Debes esperar 1 minuto antes de reenviar el código nuevamente.' });
        }

        // Generar nuevo código
        const nuevoCodigo = Math.floor(100000 + Math.random() * 900000);
        authentication.recoveryCodes.set(correo, { 
            codigo: nuevoCodigo, 
            expiracion: ahora + 5 * 60 * 1000, 
            reintentos: storedData.reintentos + 1, 
            ultimoIntento: ahora 
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
            subject: 'Código de verificación de cuenta',
            text: `Tu código de verificación es: ${nuevoCodigo}`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Código ${nuevoCodigo} enviado correctamente a ${correo}`);

        res.json({ status: 'ok', message: 'Código reenviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ status: 'error', message: 'Error al reenviar el código' });
    }
});

app.post('/api/reenvio-codigo-paso4', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ status: 'error', message: 'Correo no proporcionado' });
    }

    try {
        const storedData = authentication.recoveryCodes.get(correo);

        if (!storedData) {
            return res.status(400).json({ status: 'error', message: 'No hay código para este correo' });
        }

        const ahora = Date.now();

        // Verificar si el usuario está bloqueado y si ya pasó 1 hora
        if (storedData.bloqueo && ahora < storedData.bloqueo) {
            return res.status(400).json({ status: 'error', message: 'Has alcanzado el límite de intentos. Inténtalo nuevamente en 1 hora.' });
        } else if (storedData.bloqueo && ahora >= storedData.bloqueo) {
            // Restablecer intentos después de 1 hora
            storedData.reintentos = 0;
            storedData.bloqueo = null;
        }

        // Si el usuario ha alcanzado el límite de intentos, bloquear por 1 hora
        if (storedData.reintentos >= 3) {
            authentication.recoveryCodes.set(correo, {
                ...storedData,
                bloqueo: ahora + 60 * 60 * 1000 // Bloqueo de 1 hora
            });
            return res.status(400).json({ status: 'error', message: 'Has alcanzado el límite de intentos. Inténtalo nuevamente en 1 hora.' });
        }

        // Verificar si el usuario debe esperar 1 minuto antes de reenviar
        if (storedData.ultimoIntento && ahora - storedData.ultimoIntento < 60 * 1000) {
            return res.status(400).json({ status: 'error', message: 'Debes esperar 1 minuto antes de reenviar el código nuevamente.' });
        }

        // Generar nuevo código
        const nuevoCodigo = Math.floor(100000 + Math.random() * 900000);
        authentication.recoveryCodes.set(correo, { 
            codigo: nuevoCodigo, 
            expiracion: ahora + 5 * 60 * 1000, 
            reintentos: storedData.reintentos + 1, 
            ultimoIntento: ahora 
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
            subject: 'Código de verificación de cuenta',
            text: `Tu código de verificación es: ${nuevoCodigo}`
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
