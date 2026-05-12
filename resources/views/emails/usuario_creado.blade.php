<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Cuenta creada exitosamente</title>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: #f9fafb;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 30px;
      }
      h2 {
        color: #2c3e50;
        margin-bottom: 10px;
      }
      p {
        line-height: 1.6;
      }
      .info {
        background-color: #f4f6f8;
        border-left: 4px solid #0078d4;
        padding: 10px 15px;
        margin: 15px 0;
        border-radius: 4px;
      }
      .footer {
        font-size: 13px;
        color: #777;
        text-align: center;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>👋 Hola {{ $nombre }},</h2>

      <p>¡Nos alegra darte la bienvenida! Tu cuenta fue creada exitosamente en nuestro sistema.</p>

      <div class="info">
        <p><strong>Email:</strong> {{ $email }}</p>
        <p><strong>Contraseña inicial:</strong> {{ $password }}</p>
      </div>

      <p>Por seguridad, te recomendamos iniciar sesión y cambiar tu contraseña lo antes posible.</p>

      <p>Si tenés alguna duda o inconveniente, nuestro equipo de soporte está disponible para ayudarte.</p>

      <p>Saludos cordiales,<br><strong>El equipo de soporte</strong></p>

      <div class="footer">
        Este es un correo automático, por favor no respondas directamente.
      </div>
    </div>
  </body>
</html>
