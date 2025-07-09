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
        } catch (error) {
          console.error('Error procesando pago exitoso:', error);
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


