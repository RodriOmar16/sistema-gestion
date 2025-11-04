<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Listado de Proyectos</title>
  <style>
    body { font-family: sans-serif; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
  </style>
</head>
<body>
  <h2>Listado de Proyectos</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Descripcion</th>
        <th>Inhabilitado</th>
        <th>Creado</th>
        <th>Modificado</th>
      </tr>
    </thead>
    <tbody>
      @foreach($projects as $p)
      <tr>
        <td>{{ $p->id }}</td>
        <td>{{ $p->name }}</td>
        <td>${{ $p->descripcion }}</td>
        <td>{{ $p->inhabilitado ? 'Sí' : 'No' }}</td>
        <td>
          {{ $p->created_at }}
        </td>
        <td>
          {{ $p->updated_at }}
        </td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
