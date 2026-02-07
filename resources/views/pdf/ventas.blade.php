<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte de Ventas</title>
  <style>
    body { font-family: sans-serif; font-size: 12px; }
    h2 { margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
    th { background: #f0f0f0; }
    td.num { text-align: right; }
  </style>
</head>
<body>
  <h1>Ventas</h1>

  @foreach($ventas as $venta)
    <h2>Venta #{{ $venta->venta_id }}</h2>

    {{-- Tabla de datos generales --}}
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Fecha Anulación</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ $venta->venta_id }}</td>
          <td>{{ $venta->fecha_grabacion->format('d/m/Y H:i') }}</td>
          <td>{{ $venta->cliente->nombre ?? 'Sin cliente' }}</td>
          <td class="num">${{ number_format($venta->total, 2) }}</td>
          <td>{{ $venta->anulada ? 'Anulada' : 'Aprobada' }}</td>
          <td>{{ $venta->fecha_anulacion ? $venta->fecha_anulacion->format('d/m/Y') : '-' }}</td>
        </tr>
      </tbody>
    </table>

    {{-- Tabla de productos --}}
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        @foreach($venta->detalles as $det)
          <tr>
            <td>{{ $det->producto->nombre ?? 'Sin producto' }}</td>
            <td class="num">${{ number_format($det->precio, 2) }}</td>
            <td class="num">{{ $det->cantidad }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>

    {{-- Tabla de pagos --}}
    <table>
      <thead>
        <tr>
          <th>Forma de Pago</th>
          <th>Monto</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        @foreach($venta->pagos as $pago)
          <tr>
            <td>{{ $pago->formaPago->nombre ?? 'Sin tipo' }}</td>
            <td class="num">${{ number_format($pago->monto, 2) }}</td>
            <td>{{ $pago->fecha_pago ? \Carbon\Carbon::parse($pago->fecha_pago)->format('d/m/Y') : '-' }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>

    <hr/>
  @endforeach
</body>
</html>
