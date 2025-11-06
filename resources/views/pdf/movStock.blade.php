<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Movimientos de Stock</title>
  <style>
    body { font-family: sans-serif; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
  </style>
</head>
<body>
  <h2>Movimientos de Stock</h2>
  <table>
    <thead>
      <tr>
        <th>ID mov</th>
        <th>Fecha</th>
        <th>Producto</th>
        <th>Tipo</th>
        <th>Origen</th>
        <th>Cantidad</th>
      </tr>
    </thead>
    <tbody>
      @foreach($movs as $m)
      <tr>
        <td>{{ $m->movimiento_id }}</td>
        <td>{{ $m->fecha }}</td>
        <td>{{ $m->producto_nombre }}</td>
        <td>{{ $m->tipo_nombre }}</td>
        <td>{{ $m->origen_nombre }}</td>
        <td>{{ $m->cantidad }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
