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
  <h2>Stock Disponible</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Producto</th>
        <th>Cantidad</th>
      </tr>
    </thead>
    <tbody>
      @foreach($stocks as $s)
      <tr>
        <td>{{ $s->producto_id }}</td>
        <td>{{ $s->producto->nombre }}</td>
        <td>{{ $s->cantidad }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
