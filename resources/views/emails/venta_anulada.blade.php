<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Venta Anulada</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table width="600" cellpadding="20" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <tr>
                        <td>
                            <h1 style="color: #2c3e50; text-align: center;">❌ Venta anulada</h1>
                            <p style="font-size: 16px; color: #333;">Saludos, {{ $venta->cliente->nombre ?? 'Cliente'}} </p>
                            <p style="font-size: 16px; color: #333;">
                                Se anuló la venta con número: <strong>{{ $venta->venta_id }}</strong>
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                Total a devolver: <strong>${{ number_format($venta->total, 2, ',', '.') }}</strong>
                            </p>
                            <p style="font-size: 16px; color: #333;">Esperamos verte de nuevo 😊</p>
                            <hr style="margin: 20px 0;">
                            <p style="font-size: 12px; color: #888; text-align: center;">
                                Este es un correo automático, por favor no responder.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
