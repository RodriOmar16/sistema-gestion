<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Compra registrada</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 15px;">
    <div style="text-align:center; margin-bottom:30px;">
        <img src="{{ $message->embed(public_path('images/logo/logo.png')) }}"
            style="width:100px; height:auto; margin:0 auto 10px auto; display:block;"
            alt="Logo" 
        />
        <p style="margin:0;">Innovartic - CUIT 20-12345678-9</p>
        <p style="margin:0;">Av. Siempre Viva 123, Salta</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0"
        style="margin:0 auto; max-width:600px; width:100%;"
    >
        <tr>
            <td align="center">
                <table cellpadding="15" cellspacing="0" 
                    width="100%"
                    style="background-color:#ffffff; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); 
                           max-width:600px; margin:0 auto;"
                >
                    <tr>
                        <td>
                            <h1 style="color: #2c3e50; text-align: center;">✅ Compra realizada</h1>
                            <p style="font-size: 16px; color: #333;">Hola {{ $venta->cliente->nombre ?? 'Cliente' }},</p>
                            <p style="font-size: 16px; color: #333;">
                                Se grabó la venta con número: <strong>{{ $venta->venta_id }}</strong>
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                Total: <strong>${{ number_format($venta->total, 2, ',', '.') }}</strong>
                            </p>
                            <p style="font-size: 16px; color: #333;">Gracias por tu compra 🎉</p>
                            <hr style="margin: 20px 0;">
                            <h2 style="color: #2c3e50; text-align: center;">Detalle de la compra</h2>
                            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 13px; color: #333;">
                                <thead>
                                    <tr style="background-color: #f4f4f4;">
                                        <th align="left" style="border-bottom: 1px solid #ddd; font-size:13px;">Artículo</th>
                                        <th align="right" style="border-bottom: 1px solid #ddd; font-size:13px;">Precio</th>
                                        <th align="center" style="border-bottom: 1px solid #ddd; font-size:13px;">Cantidad</th>
                                        <th align="right" style="border-bottom: 1px solid #ddd; font-size:13px;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($venta->detalles as $det)
                                    <tr>
                                        <td style="font-size:13px; word-break:break-word; white-space:normal;">{{ $det->producto->nombre }}</td>
                                        <td align="right" style="font-size:13px;">${{ number_format($det->precio_unitario, 2, ',', '.') }}</td>
                                        <td align="center" style="font-size:13px;">{{ $det->cantidad }}</td>
                                        <td align="right" style="font-size:13px;">${{ number_format($det->subtotal, 2, ',', '.') }}</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                            <hr style="margin: 20px 0;">
                            <h2 style="color: #2c3e50; text-align: center;">Formas de pago</h2>
                            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 13px; color: #333;">
                                <thead>
                                    <tr style="background-color: #f4f4f4;">
                                        <th align="left" style="border-bottom: 1px solid #ddd; font-size:13px;">Tipo de pago</th>
                                        <th align="right" style="border-bottom: 1px solid #ddd; font-size:13px;">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($venta->pagos as $fp)
                                    <tr>
                                        <td style="font-size:13px; word-break:break-word;">{{ $fp->formaPago->nombre }}</td>
                                        <td align="right" style="font-size:13px;">${{ number_format($fp->monto, 2, ',', '.') }}</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
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
