<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Caja anulada</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
    </style>
</head>
<body>
    <div style="text-align:center; margin-bottom:30px;">
        <img src="{{ $message->embed(public_path('images/logo/logo.png')) }}"
            style="width:100px; height:auto; margin:0 auto 10px auto; display:block;"
            alt="Logo" 
        />
        <p style="margin:0;">Innovartic - CUIT 20-12345678-9</p>
        <p style="margin:0;">Av. Siempre Viva 123, Salta</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="20" cellspacing="0" 
                       style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <tr>
                        <td>
                            <h2>🚫 Caja anulada</h2>

                            <p>La caja con ID: <strong>{{ $caja->caja_id }}</strong>, correspondiente al turno: <strong>{{ $caja->turno?->nombre ?? '-' }}</strong> fue anulada/eliminada.</p>

                            <p><strong>Fecha:</strong> {{ $caja->fecha }}</p>
                            <p><strong>Monto inicial:</strong> ${{ number_format($caja->monto_inicial, 2, ',', '.') }}</p>
                            <p><strong>Descripción:</strong> {{ $caja->descripcion }}</p>

                            <p>Gracias,{{ config('app.name') }}.</p>
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