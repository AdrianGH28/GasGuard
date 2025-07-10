import dotenv from "dotenv";
dotenv.config();

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
import pool from "./generalidades_back_bd.js";
import cors from 'cors';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { createWebhookHandlers } from './webhook-handler.js';
const {
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated
} = createWebhookHandlers(stripe);


console.log("Métodos de autenticación:", authentication);
console.log("Mapa de códigos:", authentication.recoveryCodes);
console.log("CLAVE STRIPE:", process.env.STRIPE_SECRET_KEY); // debe imprimir algo que empiece con "sk_test_"



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
app.get("/repagoempresa", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_repagoempresa.html"));
app.get("/tipocuenta", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_selecttipocuenta.html"));
app.get("/paso4", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_paso4.html"));
app.get("/recuperacion1", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_recuperacion1.html"));
app.get("/recuperacion2", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_recuperacion2.html"));
app.get("/recuperacion3", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_recuperacion3.html"));
app.get("/verificacorreo2", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/MISYR_verificacorreo2.html"));
app.get("/maeseleccioninfo", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_seleccioninfo.html"));
app.get("/maeinfocuenta", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_infocuenta.html"));
app.get("/maecrudcuentasafi", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_crudcuentasafi.html"));
app.get("/maevisualizarrep", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_visualizarrep.html"));
app.get("/maedashboard", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAE_dashboard.html"));
app.get("/mcainfocuenta", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MCA_infocuenta.html"));
app.get("/mcacrudreportes", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MCA_crudreportes.html"));
app.get("/mcahistorial", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MCA_historial.html"));
app.get("/mcapaginaprincipal", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MCA_paginaprincipal.html"));
app.get("/mgtinfocuenta", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MGT_infocuenta.html"));
app.get("/mgtconclurep", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MGT_reportesconcluidos.html"));
app.get("/maainfocuenta", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAA_infocuenta.html"));
app.get("/maacuentafil", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAA_cuentasafiliadas.html"));
app.get("/maaempresas", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAA_empresas.html"));
app.get("/maareportes", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAA_reportes.html"));
app.get("/maauserindiv", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/MAA_usuariosindivuales.html"));


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
app.post("/api/registrar-afiliado", authorization.proteccion, authentication.registrarAfiliado);
app.get("/api/cuentas-restantes", authorization.proteccion, authentication.obtenerCuentasRestantes);
app.post("/api/desactivar-afiliado", authorization.proteccion, authentication.desactivarAfiliado);

app.post("/api/repagoempresa", authentication.repagoempresa);
app.post("/api/obtener-precio-empr", authentication.Obtenerprecioempr);
app.post("/api/repagousuario", authentication.repagousuario);
app.post("/api/obtener-precio-empr", authentication.Obtenerpreciouser);

app.get("/api/user-info", authentication.getUserInfo);






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
app.put("/api/update-user", authorization.proteccion, async (req, res) => {
    const { nombre, correo, password, calle, num, colonia, ciudad, cp, estado } = req.body;
    const correoOriginal = req.user.correo; // El correo original del usuario

    // Verificamos si los campos necesarios para la dirección están presentes
    if (!num || !cp || !calle || !colonia || !ciudad || !estado) {
        return res.status(400).send({ status: "error", message: "Faltan datos necesarios para actualizar la dirección." });
    }

    try {
        // 1. Verificamos que los valores de colonia, ciudad y estado sean válidos
        const [[coloniaRow]] = await pool.execute(
            'SELECT id_colonia FROM ccolonia WHERE nom_col = ? LIMIT 1',
            [colonia]
        );
        const [[ciudadRow]] = await pool.execute(
            'SELECT id_ciudad FROM cciudad WHERE nom_ciudad = ? LIMIT 1',
            [ciudad]
        );
        const [[estadoRow]] = await pool.execute(
            'SELECT id_estado FROM cestado WHERE nom_estado = ? LIMIT 1',
            [estado]
        );

        if (!coloniaRow || !ciudadRow || !estadoRow) {
            return res.status(400).send({ status: "error", message: "Colonia, ciudad o estado no válidos" });
        }

        // 2. Obtener la contraseña actual del usuario desde la base de datos
const [[userRow]] = await pool.execute(
    'SELECT contra_user FROM musuario WHERE correo_user = ? LIMIT 1',
    [correoOriginal]
);

// Verificar si el usuario fue encontrado
if (!userRow) {
    return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
}

// 3. Si la nueva contraseña no es null, la comparamos con la contraseña actual
let hashPassword = userRow.contra_user; // Mantener la contraseña original por defecto

if (password) {
    console.log("🔐 Contraseña recibida del frontend:", password);
    console.log("🔒 Contraseña actual de la base de datos (hash):", userRow.contra_user);

    // Comparamos la contraseña actual con la nueva
    const mismaPassword = await bcryptjs.compare(password, userRow.contra_user);
    console.log("🟢 ¿La contraseña es la misma?:", mismaPassword);

    if (!mismaPassword) {
        // Si la contraseña es diferente, la encriptamos
        const salt = await bcryptjs.genSalt(5);
        hashPassword = await bcryptjs.hash(password, salt);
        console.log("🔁 Nueva contraseña hasheada:", hashPassword);
    } else {
        console.log("✅ La contraseña no cambió, se mantiene el hash actual.");
    }
}


        // 4. Actualización de usuario y dirección en una sola consulta
        let updateQuery = ` 
            UPDATE musuario
            JOIN ddireccion ON musuario.id_direccion = ddireccion.id_direccion
            JOIN cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN dcalle ON ddireccion.id_calle = dcalle.id_calle
            JOIN ccpostal ON ddireccion.id_copost = ccpostal.id_copost
            SET 
                musuario.nom_user = ?, 
                musuario.correo_user = ?, 
                musuario.contra_user = ?, 
                cestado.nom_estado = ?, 
                cciudad.nom_ciudad = ?, 
                ccolonia.nom_col = ?, 
                dcalle.nom_calle = ?, 
                ddireccion.numero_direc = ?, 
                ccpostal.cp_copost = ?
            WHERE musuario.correo_user = ?`;

        const params = [
            nombre, correo, hashPassword, estado, ciudad, colonia, calle, num, cp, correoOriginal
        ];

        const [result] = await pool.execute(updateQuery, params);

        // Si el resultado de la actualización es 0, significa que no se encontró el usuario
        if (result.affectedRows === 0) {
            return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
        }

        // 5. Si el correo cambió, actualizar el valor de verif_user a 0
        if (correo !== correoOriginal) {
            await pool.execute('UPDATE musuario SET verif_user = 0 WHERE correo_user = ?', [correo]);
        }

        res.send({ status: "ok", message: "Datos del usuario y dirección actualizados correctamente" });

    } catch (error) {
        console.error("Error al actualizar los datos:", error);
        res.status(500).send({ status: "error", message: "Error al actualizar los datos" });
    }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });
    res.json({ status: "ok", message: "Sesión cerrada" });
});


// Ruta para obtener las cuentas afiliadas de la empresa logueada
app.get("/api/afiliadosempre", authorization.proteccion, async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user);

        const idEmpresa = req.user.id_user;
        const [rows] = await pool.execute(`
            SELECT 
                musuario.id_user,
                musuario.nom_user,
                musuario.correo_user,
                ddireccion.numero_direc,
                dcalle.nom_calle,
                ccolonia.nom_col,
                cciudad.nom_ciudad,
                ccpostal.cp_copost,
                cestado.nom_estado
            FROM 
                musuario
            JOIN 
                ddireccion ON musuario.id_direccion = ddireccion.id_direccion
            JOIN 
                dcalle ON ddireccion.id_calle = dcalle.id_calle
            JOIN 
                ccolonia ON ddireccion.id_colonia = ccolonia.id_colonia
            JOIN 
                cciudad ON ddireccion.id_ciudad = cciudad.id_ciudad
            JOIN 
                ccpostal ON ddireccion.id_copost = ccpostal.id_copost
            JOIN 
                cestado ON ddireccion.id_estado = cestado.id_estado
            JOIN 
                cestadocuenta ON musuario.id_estcuenta = cestadocuenta.id_estcuenta
            WHERE 
                musuario.rol_user = 'afiliado'
                AND musuario.id_relempr = ?
                AND cestadocuenta.nom_estcuenta = 'activa'
        `, [idEmpresa]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron cuentas afiliadas activas" });
        }

        res.send({ status: "ok", data: rows });

    } catch (error) {
        console.error('Error al obtener las cuentas afiliadas:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener las cuentas afiliadas" });
    }
});

app.get("/api/reportesempre", authorization.proteccion, async (req, res) => {
    try {
        console.log("Usuario autenticado:", req.user);

        const idEmpresa = req.user.id_user;
        const [rows] = await pool.execute(`
            SELECT
                autor.nom_user AS nombre_autor,
		        autor.correo_user AS correo_autor,
                encargado.nom_user AS nombre_encargado,
		        encargado.correo_user AS correo_encargado,
                rp.nmticket_reporte,
		        rp.estado_reporte,
		        rp.descri_reporte,
		        rp.fecini_reporte,
		        rp.imagen_fuga,
		        rp.fecfin_reporte,
		        rp.pagado,
		        tp.nom_tireporte
		    FROM 
		    	mreporte rp
		    JOIN 
		    	ctiporeporte tp ON rp.id_tireporte = tp.id_tireporte
		    JOIN 
		    	musuario AS autor ON rp.id_user = autor.id_user
		    LEFT JOIN 
		    	musuario AS encargado ON rp.id_reltecnico = encargado.id_user
		    WHERE 
			    autor.id_relempr = ?
        `, [idEmpresa]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron reportes" });
        }

        res.send({ status: "ok", data: rows });

    } catch (error) {
        console.error('Error al obtener los reportes:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los reportes" });
    }
});

// Ruta para registrar reporte tipo "fuga" por afiliado
app.post("/api/reporte-fuga", authorization.proteccion, async (req, res) => {
    const { descripcion } = req.body;

    if (!descripcion || descripcion.trim() === "") {
        return res.status(400).send({ status: "Error", message: "La descripción es obligatoria." });
    }

    const id_user = req.user.id_user; // Usuario logueado
    const estado = 'pendiente';
    const fecini = new Date(); // Fecha actual
    const id_tireporte = 2; // Tipo "fuga"

    try {
        // Insertamos primero dejando nmticket_reporte en 0
        const [insert] = await pool.execute(`
            INSERT INTO mreporte (nmticket_reporte, estado_reporte, descri_reporte, fecini_reporte, id_tireporte, id_user)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [0, estado, descripcion, fecini, id_tireporte, id_user]);

        const idInsertado = insert.insertId;

        // Usamos el mismo id como número de ticket
        await pool.execute(
            `UPDATE mreporte SET nmticket_reporte = ? WHERE id_reporte = ?`,
            [idInsertado, idInsertado]
        );

        return res.status(201).send({ status: "ok", message: `Reporte #${idInsertado} generado correctamente.` });

    } catch (error) {
        console.error("Error al insertar reporte:", error);
        return res.status(500).send({ status: "Error", message: "No se pudo registrar el reporte." });
    }
});

// Ruta para obtener reportes generados por el usuario logueado
app.get("/api/reportes-afiliado", authorization.proteccion, async (req, res) => {
    try {
        const id_user = req.user.id_user;

        const [rows] = await pool.execute(`
            SELECT 
                id_reporte,
                nmticket_reporte,
                estado_reporte,
                descri_reporte,
                DATE_FORMAT(fecini_reporte, '%Y-%m-%d') AS fecini_reporte,
                DATE_FORMAT(fecfin_reporte, '%Y-%m-%d') AS fecfin_reporte,
                id_reltecnico
            FROM mreporte
            WHERE id_user = ?
        `, [id_user]);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron reportes." });
        }

        return res.send({ status: "ok", data: rows });

    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return res.status(500).send({ status: "Error", message: "Error al obtener reportes." });
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

app.post('/api/create-customer', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }
    
    // Buscar si el cliente ya existe
    const existingCustomers = await stripe.customers.list({ email });
    let customer;
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }
    
    res.json({ customerId: customer.id });
  } catch (error) {
    console.error("Error creando cliente:", error);
    res.status(500).json({ error: "Error al crear cliente en Stripe" });
  }
});

app.post('/api/attach-payment-method', async (req, res) => {
  try {
    const { customerId, paymentMethodId, setAsDefault } = req.body;
    
    if (!customerId || !paymentMethodId) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    
    // Adjuntar método de pago al cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    
    // Si se solicitó, establecer este método como predeterminado
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error adjuntando método de pago:", error);
    res.status(500).json({ error: "Error al adjuntar método de pago: " + error.message });
  }
});

// Crear suscripción en Stripe

app.post("/api/create-subscription", async (req, res) => {
  const { customerId, tiplan, afiliados, montoTotal, paymentMethodId } = req.body;

  if (!customerId || !tiplan || !afiliados || !montoTotal || !paymentMethodId) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  // Configuración del intervalo según el plan
  let interval = "month";
  let intervalCount = 1;
  
  if (tiplan === "semestral") {
    interval = "month";
    intervalCount = 6;
  } else if (tiplan === "anual") {
    interval = "year";
    intervalCount = 1;
  }

  try {
    // Primero, crear un producto para esta suscripción
    const product = await stripe.products.create({
      name: `Plan ${tiplan} con ${afiliados} afiliados`,
      metadata: {
        tiplan: tiplan,
        afiliados: afiliados.toString()
      }
    });

    // Luego crear un precio para este producto
    const price = await stripe.prices.create({
      product: product.id,
      currency: "mxn",
      unit_amount: montoTotal,
      recurring: {
        interval: interval,
        interval_count: intervalCount
      }
    });

    // Crear la suscripción con el precio y método de pago
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: price.id,
      }],
      default_payment_method: paymentMethodId,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        tiplan: tiplan,
        afiliados: afiliados.toString(),
        montoTotal: montoTotal.toString()
      }
    });

    // Si necesitas un client_secret para confirmación en el frontend,
    // crea un PaymentIntent separado
    const paymentIntent = await stripe.paymentIntents.create({
      amount: montoTotal,
      currency: 'mxn',
      customer: customerId,
      payment_method: paymentMethodId,
      setup_future_usage: 'off_session',
      confirm: false,
      description: `Pago inicial para suscripción ${subscription.id}`,
      metadata: {
        subscription_id: subscription.id
      }
    });

    res.json({
      subscription: subscription, 
      clientSecret: paymentIntent.client_secret
    });

  } catch (err) {
    console.error("Error creando suscripción:", err);
    res.status(500).json({ error: "No se pudo crear la suscripción: " + err.message });
  }
});

// Webhook para manejar eventos de Stripe
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar los eventos según su tipo
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }
    res.json({received: true});
  } catch (error) {
    console.error(`Error procesando evento ${event.type}:`, error);
    res.status(500).json({error: 'Error procesando el evento'});
  }
});

// Endpoint para actualizar una suscripción existente
app.post('/api/update-subscription', async (req, res) => {
  const { subscriptionId, tiplan, afiliados, montoTotal } = req.body;
  
  if (!subscriptionId || !tiplan || !afiliados || !montoTotal) {
    return res.status(400).json({ error: "Datos incompletos" });
  }
  
  try {
    // Configuración del intervalo según el plan
    let interval = "month";
    let intervalCount = 1;
    
    if (tiplan === "semestral") {
      interval = "month";
      intervalCount = 6;
    } else if (tiplan === "anual") {
      interval = "year";
      intervalCount = 1;
    }
    
    // Obtener la suscripción actual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Crear un nuevo producto para el plan actualizado
    const product = await stripe.products.create({
      name: `Plan ${tiplan} con ${afiliados} afiliados`,
      metadata: {
        tiplan: tiplan,
        afiliados: afiliados.toString()
      }
    });
    
    // Crear un nuevo precio para el producto
    const newPrice = await stripe.prices.create({
      product: product.id,
      currency: "mxn",
      unit_amount: montoTotal,
      recurring: {
        interval: interval,
        interval_count: intervalCount
      },
    });
    
    // Actualizar la suscripción con el nuevo precio
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPrice.id,
        },
      ],
      metadata: {
        tiplan: tiplan,
        afiliados: afiliados.toString(),
        montoTotal: montoTotal.toString()
      },
      proration_behavior: 'create_prorations',
    });
    
    res.json({
      updated: true,
      subscriptionId: updatedSubscription.id
    });
    
  } catch (error) {
    console.error("Error actualizando suscripción:", error);
    res.status(500).json({ error: "No se pudo actualizar la suscripción" });
  }
});

app.post('/api/cancel-subscription', async (req, res) => {
  const { subscriptionId } = req.body;
  
  if (!subscriptionId) {
    return res.status(400).json({ error: "ID de suscripción requerido" });
  }
  
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    
    // Actualizar el estado en tu base de datos
    // Aquí deberías incluir tu código para actualizar la BD
    
    res.json({
      canceled: true,
      subscriptionId: canceledSubscription.id
    });
    
  } catch (error) {
    console.error("Error cancelando suscripción:", error);
    res.status(500).json({ error: "No se pudo cancelar la suscripción" });
  }
});

 app.post("/api/pago", authorization.proteccion, async (req, res) => {
    const { tipo_pago, num_tarjeta, fecha_pago } = req.body;
    if (!tipo_pago || !num_tarjeta || !fecha_pago) {
        return res.status(400).send({ status: "Error", message: "Faltan datos" });
    }

    try {
        const [result] = await conexion.execute(
            "INSERT INTO dpago (tipo_pago, nmcrd_pago, fecha_pago) VALUES (?, ?, ?)",
            [tipo_pago, num_tarjeta, fecha_pago]
        );

        res.status(201).send({ status: "ok", message: "Pago registrado", id_pago: result.insertId });
    } catch (error) {
        console.error("Error al registrar pago:", error);
        return res.status(500).send({ status: "Error", message: "Error interno" });
    }
});

app.get("/api/precios", async (req, res) => {
    const { plan, noAfiliados } = req.body;
    

    try {
        const [result] = await conexion.execute(`
            SELECT ppp_nmafil, pbas_tiplan 
            FROM cplan pl
            JOIN cnumafil na on pl.id_nmafil = na.id_nmafil
            JOIN ctipoplan tp on pl.id_tiplan = tp.id_tiplan
            WHERE na.id_nmafil=? AND tp.dura_tiplan=?
        `, [noAfiliados, plan]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }

        res.send({ status: "ok", message: "Información actualizada exitosamente" });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al actualizar el usuario" });
    }
});

// Registro de suscripción
app.post("/api/suscripcion", authorization.proteccion, async (req, res) => {
    const { id_plan, id_pago, num_afiliados } = req.body;
    if (!id_plan || !id_pago || !num_afiliados) {
        return res.status(400).send({ status: "Error", message: "Faltan datos" });
    }

    try {
        // Obtener precio base del plan
        const [planResult] = await conexion.execute("SELECT precio FROM ctipoplan WHERE id_tiplan = ?", [id_plan]);
        if (planResult.length === 0) {
            return res.status(404).send({ status: "Error", message: "Plan no encontrado" });
        }
        const precioBase = planResult[0].precio;
        
        // Calcular costo por afiliados
        const [afiliadoResult] = await conexion.execute("SELECT precio FROM cnumafil WHERE id_nmafil = ?", [num_afiliados]);
        if (afiliadoResult.length === 0) {
            return res.status(404).send({ status: "Error", message: "Número de afiliados no encontrado" });
        }
        let precioAfiliados = afiliadoResult[0].precio * 6; // Multiplicar por 6 si es semestral

        const montoTotal = precioBase + precioAfiliados;
        
        const [result] = await conexion.execute(
            "INSERT INTO msuscripcion (id_plan, id_fact, monto_susc) VALUES (?, ?, ?)",
            [id_plan, id_pago, montoTotal]
        );

        res.status(201).send({ status: "ok", message: "Suscripción registrada", id_susc: result.insertId });
    } catch (error) {
        console.error("Error al registrar suscripción:", error);
        return res.status(500).send({ status: "Error", message: "Error interno" });
    }
});

// Registro de factura
app.post("/api/factura", authorization.proteccion, async (req, res) => {
    const { id_pago } = req.body;
    if (!id_pago) {
        return res.status(400).send({ status: "Error", message: "Falta el ID de pago" });
    }

    try {
        const folio_fact = crypto.randomBytes(6).toString("hex").toUpperCase();
        const [result] = await conexion.execute(
            "INSERT INTO dfact (folio_fact, id_pago) VALUES (?, ?)",
            [folio_fact, id_pago]
        );

        res.status(201).send({ status: "ok", message: "Factura generada", folio: folio_fact });
    } catch (error) {
        console.error("Error al generar factura:", error);
        return res.status(500).send({ status: "Error", message: "Error interno" });
    }
});



app.post('/api/reenvio-codigo', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ status: 'error', message: 'Correo no proporcionado' });
    }

    try {
        const storedData = authentication.recoveryCodes.get(correo);
        const ahora = Date.now();

        if (storedData && storedData.ultimoIntento && ahora - storedData.ultimoIntento < 60 * 1000) {
            return res.status(400).json({ status: 'error', message: 'Debes esperar 1 minuto antes de reenviar el código nuevamente.' });
        }

        // Generar nuevo código
        const nuevoCodigo = Math.floor(100000 + Math.random() * 900000);

        authentication.recoveryCodes.set(correo, {
            codigo: nuevoCodigo,
            expiracion: ahora + 5 * 60 * 1000,
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

app.post('/api/sensor-value', async (req, res) => {
    try {
        const { resistencia } = req.body;

        if (typeof resistencia !== 'number') {
            return res.status(400).json({ status: 'Error', message: 'Valor inválido de resistencia' });
        }

        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD
        const hora = fechaActual.toTimeString().split(' ')[0]; // HH:MM:SS

        const des_reg = 'Lectura automática desde ESP32';

        await pool.execute(
            'INSERT INTO dregistro (fecha, hora, des_reg, resistencia) VALUES (?, ?, ?, ?)',
            [fecha, hora, des_reg, resistencia]
        );

        res.status(200).json({ status: 'OK', message: 'Registro guardado exitosamente' });
    } catch (error) {
        console.error('Error al guardar el valor del sensor:', error);
        res.status(500).json({ status: 'Error', message: 'Error interno del servidor' });
    }
});


app.get('/api/sensor-value', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT resistencia, fecha, hora FROM dregistro ORDER BY id_registro DESC LIMIT 1'
        );

        if (rows.length > 0) {
            const { resistencia, fecha, hora } = rows[0];
            res.json({ resistencia, fecha, hora });
        } else {
            res.json({ resistencia: null, fecha: null, hora: null });
        }
    } catch (error) {
        console.error('Error al obtener el valor del sensor:', error);
        res.status(500).json({ status: 'Error', message: 'Error al obtener los datos del sensor' });
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