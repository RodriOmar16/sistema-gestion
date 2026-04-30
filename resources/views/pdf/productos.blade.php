<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Listado de Productos</title>
  <style>
    body { font-family: sans-serif; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
  </style>
</head>
<body>
  <h2>Listado de Productos</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Stock</th>
        <th>Categorías</th>
        <th>Marca</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      @foreach($productos as $p)
      <tr>
        <td>{{ $p->producto_id }}</td>
        <td>{{ $p->nombre }}</td>
        <td style="text-align: right;">${{ number_format($p->precio, 2, ',', '.') }}</td>
        <td style="text-align: right;">{{ $p->stock->cantidad }}</td>
        <td>
          @foreach($p->categorias as $c)
            {{ $c->nombre }}@if(!$loop->last), @endif
          @endforeach
        </td>
        <td>{{ $p->marca->nombre }}</td>
        <td>{{ $p->inhabilitado ? 'Inactivo' : 'Activo' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
