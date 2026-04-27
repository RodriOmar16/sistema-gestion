<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Factura {{ $venta->venta_id }}</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; }
        th { background: #2c3e50; color: #fff; text-transform: uppercase; font-size: 11px; }
        tr:nth-child(even) { background: #f9f9f9; }
        h1, h2 { text-align: center; }
        td.num { text-align: right; }
    

    </style>
</head>
<body>
    <div style="text-align:center; margin-bottom:20px;">
        <img src="{{ public_path('images/logo/logo.png') }}" alt="Logo" style="height:60px; margin-bottom:10px;">
        <h1 style="margin:0;">Factura N° {{ $venta->venta_id }}</h1>
        <p style="margin:0;">Innovartic - CUIT 20-12345678-9</p>
        <p style="margin:0;">Av. Siempre Viva 123, Salta</p>
    </div>

    <p><strong>Cliente:</strong> {{ $venta->cliente->nombre }}</p>
    <p><strong>Total:</strong> ${{ number_format($venta->total, 2, ',', '.') }}

    <h2>Detalle de la compra</h2>
    <table>
        <thead>
            <tr>
                <th>Artículo</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($venta->detalles as $det)
            <tr>
                <td>{{ $det->producto->nombre }}</td>
                <td class="num" >${{ number_format($det->precio_unitario, 2, ',', '.') }}</td>
                <td class="num">{{ $det->cantidad }}</td>
                <td class="num">${{ number_format($det->subtotal, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h2>Formas de pago</h2>
    <table>
        <thead>
            <tr>
                <th>Tipo de pago</th>
                <th>Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($venta->pagos as $fp)
            <tr>
                <td>{{ $fp->formaPago->nombre }}</td>
                <td class="num">${{ number_format($fp->monto, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <footer>
        <p style="text-align:center; font-size:10px; color:#888; margin-top:30px;">
            Este documento fue generado automáticamente por el sistema.  
            Gracias por su compra.
        </p>
    </footer>
</body>
</html>
