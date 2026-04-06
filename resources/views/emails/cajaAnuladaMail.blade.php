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
    <h2>🚫 Caja anulada</h2>

    <p>La caja con ID:<strong>{{ $caja->caja_id }}</strong>, correspondiente al turno:<strong>{{ $caja->turno?->nombre ?? '-' }}</strong> fue anulada/eliminada.</p>

    <p><strong>Fecha:</strong> {{ $caja->fecha }}</p>
    <p><strong>Monto inicial:</strong> ${{ number_format($caja->monto_inicial, 2, ',', '.') }}</p>
    <p><strong>Descripción:</strong> {{ $caja->descripcion }}</p>

    <p>Gracias,{{ config('app.name') }}.</p>
    <hr style="margin: 20px 0;">
    <p style="font-size: 12px; color: #888; text-align: center;">
        Este es un correo automático, por favor no responder.
    </p>
</body>
</html>