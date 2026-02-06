<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Alerta de Stock</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table width="600" cellpadding="20" cellspacing="0" 
                       style="background-color: #ffffff; border-radius: 8px; 
                              box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <tr>
                        <td>
                            <h1 style="color: #e74c3c; text-align: center;">⚠️ Alerta de Stock</h1>
                            <p style="font-size: 16px; color: #333; text-align: center;">
                                El producto <strong>{{ $producto->nombre }}</strong> alcanzó el stock mínimo.
                            </p>
                            <table width="100%" cellpadding="10" cellspacing="0" 
                                   style="margin: 20px 0; border: 1px solid #ddd; border-radius: 6px;">
                                <tr>
                                    <td style="font-size: 15px; color: #555;">Stock actual:</td>
                                    <td style="font-size: 15px; color: #000; font-weight: bold;">
                                        {{ $stock->cantidad }}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size: 15px; color: #555;">Stock mínimo definido:</td>
                                    <td style="font-size: 15px; color: #000; font-weight: bold;">
                                        {{ $producto->stock_minimo }}
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size: 16px; color: #333; text-align: center;">
                                📦 Por favor, considere reabastecer este producto.
                            </p>
                            <hr style="margin: 20px 0;">
                            <p style="font-size: 12px; color: #888; text-align: center;">
                                Este es un correo automático generado por el sistema de gestión.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
