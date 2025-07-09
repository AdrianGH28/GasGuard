/**
 * 
 * import dotenv from "dotenv";
dotenv.config();

// Manejador de pagos exitosos
export async function handleInvoicePaymentSucceeded(invoice) {
  // Para facturas de creación o renovación de suscripción
  if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
    try {
      // Obtener la suscripción
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      // Obtener el cliente
      const customer = await stripe.customers.retrieve(invoice.customer);
      
      // Extraer metadatos
      const tiplan = subscription.metadata.tiplan || 'mensual';
      const noAfiliados = parseInt(subscription.metadata.afiliados) || 1;
      const monto = parseFloat(invoice.amount_paid) / 100; // Convertir de centavos a pesos
      
      // Calcular meses según el plan
      let meses = 1;
      if (tiplan === 'semestral') meses = 6;
      if (tiplan === 'anual') meses = 12;
      
      console.log(`Pago exitoso para ${customer.email}. Plan: ${tiplan}, Afiliados: ${noAfiliados}, Monto: $${monto} MXN, Duración: ${meses} meses`);
      
      // Aquí implementarías la lógica para guardar en tu base de datos
      // Por ejemplo:
      /*
      await pool.query(
        'CALL registrar_suscripcionempr(?, ?, ?, ?, ?)',
        [customer.email, tiplan, noAfiliados, monto, meses]
      );
      */
 /*     
    } catch (error) {
      console.error('Error procesando pago exitoso:', error);
    }
  }
}

 */

// Manejador de pagos fallidos
export async function handleInvoicePaymentFailed(invoice) {
  try {
    // Obtener el cliente
    const customer = await stripe.customers.retrieve(invoice.customer);
    
    console.log(`Pago fallido para ${customer.email}: ${invoice.id}`);
    
    // Opcional: Enviar correo al cliente notificando del fallo
    // await sendPaymentFailureEmail(customer.email);
    
  } catch (error) {
    console.error('Error procesando pago fallido:', error);
  }
}

// Manejador de suscripciones canceladas
export async function handleSubscriptionDeleted(subscription) {
  try {
    // Obtener el cliente
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    console.log(`Suscripción cancelada para ${customer.email}`);
    
    // Aquí actualizarías el estado de la suscripción en tu base de datos
    
  } catch (error) {
    console.error('Error procesando cancelación de suscripción:', error);
  }
}

// Manejador de suscripciones actualizadas
export async function handleSubscriptionUpdated(subscription) {
  try {
    // Aquí puedes manejar cambios en la suscripción como cambios de plan, etc.
    console.log(`Suscripción actualizada: ${subscription.id}`);
    
  } catch (error) {
    console.error('Error procesando actualización de suscripción:', error);
  }
}
import pool from "./generalidades_back_bd.js";

import dotenv from "dotenv";
dotenv.config();

export function createWebhookHandlers(stripe) {
  return {
    async handleInvoicePaymentSucceeded(invoice) {
      if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
        try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(invoice.customer);

      const tiplan = subscription.metadata.tiplan || 'mensual';
      const noAfiliados = parseInt(subscription.metadata.afiliados) || 1;
      const monto = parseFloat(invoice.amount_paid) / 100;
      const correo = customer.email;

      let meses = 1;
      if (tiplan === 'mensual') meses = 1;
      if (tiplan === 'semestral') meses = 6;
      if (tiplan === 'anual') meses = 12;

      const [rows] = await pool.execute('SELECT id_susc FROM musuario WHERE correo_user = ?', [correo]);
      if (rows.length > 0 && rows[0].id_susc !== null) {
        console.log(`⚠️ Usuario con correo ${correo} ya tiene suscripción activa`);
        return;
      }

      const ahora = new Date();
      const fechaInicio = ahora.toISOString().split('T')[0];
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + meses);
      const fechaFinStr = fechaFin.toISOString().split('T')[0];
      const estatus = 1;

      const [tipoplanResult] = await pool.execute('SELECT id_tiplan FROM ctipoplan WHERE dura_tiplan = ?', [tiplan]);
      let id_tiplan;
      if (tipoplanResult.length > 0) {
        id_tiplan = tipoplanResult[0].id_tiplan;
      } else {
        const [insertTipoplanResult] = await pool.execute('INSERT INTO ctipoplan (dura_tiplan) VALUES (?)', [tiplan]);
        id_tiplan = insertTipoplanResult.insertId;
      }

      const [planResult] = await pool.execute('SELECT id_plan FROM cplan WHERE id_tiplan = ? AND id_nmafil = ?', [id_tiplan, noAfiliados]);
      let id_plan;
      if (planResult.length > 0) {
        id_plan = planResult[0].id_plan;
      } else {
        const [insertPlanResult] = await pool.execute('INSERT INTO cplan (id_tiplan, id_nmafil) VALUES (?, ?)', [id_tiplan, noAfiliados]);
        id_plan = insertPlanResult.insertId;
      }

      const [suscripcionResult] = await pool.execute(
        'INSERT INTO msuscripcion (fecini_susc, fecfin_susc, estado_susc, monto_susc, id_plan) VALUES (?, ?, ?, ?, ?)',
        [fechaInicio, fechaFinStr, estatus, monto, id_plan]
      );
      const suscriId = suscripcionResult.insertId;

      await pool.execute(
        'UPDATE musuario SET id_susc = ?, rol_user = ? WHERE correo_user = ?',
        [suscriId, 'empresa', correo]
      );

      console.log(` Suscripción registrada para ${correo}`);

    } catch (error) {
      console.error(' Error procesando pago exitoso:', error);
    }
  }
},

    async handleInvoicePaymentFailed(invoice) {
      try {
        const customer = await stripe.customers.retrieve(invoice.customer);
        console.log(`Pago fallido para ${customer.email}: ${invoice.id}`);
      } catch (error) {
        console.error('Error procesando pago fallido:', error);
      }
    },

    async handleSubscriptionDeleted(subscription) {
      try {
        const customer = await stripe.customers.retrieve(subscription.customer);
        console.log(`Suscripción cancelada para ${customer.email}`);
      } catch (error) {
        console.error('Error procesando cancelación de suscripción:', error);
      }
    },

    async handleSubscriptionUpdated(subscription) {
      try {
        console.log(`Suscripción actualizada: ${subscription.id}`);
      } catch (error) {
        console.error('Error procesando actualización de suscripción:', error);
      }
    }
  };
}


