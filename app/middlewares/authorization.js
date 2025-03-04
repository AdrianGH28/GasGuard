import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import session from 'express-session';
import { usuarios } from "./../controllers/authentication.controller.js";

dotenv.config();

function soloAdmin(req, res, next) {
    const loggeado = revisarCookie(req);
    if (loggeado) return next();
    return res.redirect("/");
}

function soloPublico(req, res, next) {
    const loggeado = revisarCookie(req);
    if (!loggeado) return next();
    return res.redirect("/principal");
}
// Controlador para vincular dispositivo
const vincularDispositivo = async (req, res) => {
    const { ssid, password, ubicacion } = req.body;
    const id_cliente = req.user.id_cliente;

    console.log('Datos recibidos:', { ssid, password, ubicacion, id_cliente });

    if (!ssid || !password || !ubicacion || !id_cliente) {
        return res.status(400).send({ status: "Error", message: "Todos los campos son requeridos" });
    }

    const ipAleatoria = `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

    try {
        const [result] = await conexion.execute(`
            INSERT INTO mdispositivo (des_dis, id_cliente, id_ubi, wifi_dis, contraseña_dis, ip_dis) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['Dispositivo de Prueba', id_cliente, 1, ssid, password, ipAleatoria]);

        if (result.affectedRows === 0) {
            return res.status(500).send({ status: "Error", message: "Error al vincular el dispositivo" });
        }

        res.send({ status: "ok", message: "Dispositivo vinculado exitosamente" });
    } catch (error) {
        console.error('Error al vincular el dispositivo:', error);
        return res.status(500).send({ status: "Error", message: "Error al vincular el dispositivo" });
    }
};

// Middleware para protección de rutas (autorización)

const proteccion = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send({ status: "Error", message: "No autorizado" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ status: "Error", message: "Token inválido o expirado" });
    }
};
function revisarCookie(req) {
    try {
        if (!req.headers.cookie) {
            throw new Error("No cookies found");
        }

        const cookieJWT = req.headers.cookie.split("; ").find(cookie => cookie.startsWith("jwt="));
        if (!cookieJWT) {
            throw new Error("JWT cookie not found");
        }

        const token = cookieJWT.slice(4);
        const decodificada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        
        const usuarioARevisar = usuarios.find(usuario => usuario.correo === decodificada.correo);
        if (!usuarioARevisar) {
            return false;
        }
        return usuarioARevisar;
    } catch (error) {
        console.error("Error al revisar la cookie:", error.message);
        return false;
    }
}

function verificarRolAdmin(req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).send({ status: "Error", message: "No autorizado" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (decoded.rol !== 'admin') {
            return res.status(403).send({ status: "Error", message: "Acceso denegado" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ status: "Error", message: "Token inválido o expirado" });
    }
}

export const methods = {
    soloAdmin,
    soloPublico,
    proteccion,
    vincularDispositivo,
    verificarRolAdmin
};
