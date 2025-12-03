const transporter = require('../config/mailer.config');

class MailService {
  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email, resetLink) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Recuperar tu contraseña - E-commerce',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">Recuperar tu contraseña</h2>
            <p>Recibimos una solicitud para recuperar tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Restablecer Contraseña
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              <strong>Este enlace expira en 1 hora.</strong>
            </p>
            <p style="color: #666; font-size: 12px;">
              Si no solicitaste este cambio, ignora este email.
            </p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a ${email}:`, result.messageId);
      return result;
    } catch (error) {
      console.error(`❌ Error enviando email a ${email}:`, error);
      throw error;
    }
  }

  /**
   * Envía email de confirmación de cambio de contraseña
   */
  async sendPasswordChangedEmail(email) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Contraseña actualizada - E-commerce',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #28a745;">Contraseña Actualizada</h2>
            <p>Tu contraseña ha sido cambiada exitosamente.</p>
            <p>Si no realizaste este cambio, contáctate con soporte de inmediato.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Saludos,<br/>
              E-commerce Team
            </p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmación enviado a ${email}:`, result.messageId);
      return result;
    } catch (error) {
      console.error(`❌ Error enviando email de confirmación a ${email}:`, error);
      throw error;
    }
  }
}

module.exports = new MailService();
