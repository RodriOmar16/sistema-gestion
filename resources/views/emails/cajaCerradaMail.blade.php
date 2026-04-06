<!DOCTYPE html>
<html lang="es">
  <head>
      <meta charset="UTF-8">
      <title>Caja cerrada</title>
      <style>
          body { font-family: Arial, sans-serif; color: #333; }
          h1 { color: #2c3e50; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background-color: #f4f4f4; text-align: left; }
          .section-title { margin-top: 20px; font-weight: bold; }
      </style>
  </head>
  <body>
      <h1>Caja cerrada correctamente ✅</h1>

      <p>La caja con ID <strong>{{ $caja->caja_id }}</strong> fue cerrada el día <strong>{{ $caja->fecha }}</strong>.</p>

      <p><strong>Monto inicial:</strong> ${{ number_format($caja->monto_inicial, 2, ',', '.') }}</p>

      <div class="section-title">Según el sistema:</div>
      <table>
          <tr>
              <th>Concepto</th>
              <th>Monto</th>
          </tr>
          <tr><td>Efectivo</td><td>${{ number_format($caja->efectivo, 2, ',', '.') }}</td></tr>
          <tr><td>Débito</td><td>${{ number_format($caja->debito, 2, ',', '.') }}</td></tr>
          <tr><td>Transferencia</td><td>${{ number_format($caja->transferencia, 2, ',', '.') }}</td></tr>
          <tr><td><strong>Total</strong></td><td><strong>${{ number_format($caja->total_sistema, 2, ',', '.') }}</strong></td></tr>
      </table>

      <div class="section-title">Según el usuario:</div>
      <table>
          <tr>
              <th>Concepto</th>
              <th>Monto</th>
          </tr>
          <tr><td>Efectivo</td><td>${{ number_format($caja->efectivo_user, 2, ',', '.') }}</td></tr>
          <tr><td>Débito</td><td>${{ number_format($caja->debito_user, 2, ',', '.') }}</td></tr>
          <tr><td>Transferencia</td><td>${{ number_format($caja->transferencia_user, 2, ',', '.') }}</td></tr>
          <tr><td><strong>Total</strong></td><td><strong>${{ number_format($caja->total_user, 2, ',', '.') }}</strong></td></tr>
      </table>

      <p><strong>Diferencia:</strong> ${{ number_format($caja->diferencia, 2,  ',', '.') }}</p>

      <p><em>Descripción:</em> {{ $caja->descripcion }}</p>

      <div class="section-title"><h4>Gastos asociados a la caja</h4></div>

      @if($caja->gastos->count())
          <table>
              <tr>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Categoría</th>
                  <th>Forma de pago</th>
                  <th>Monto</th>
                  <th>Descripción</th>
              </tr>
              @foreach($caja->gastos as $gasto)
                  <tr>
                      <td>{{ $gasto->fecha }}</td>
                      <td>{{ $gasto->proveedor?->nombre ?? '-' }}</td>
                      <td>{{ $gasto->categoria?->nombre ?? '-' }}</td>
                      <td>{{ $gasto->formaPago?->nombre ?? '-' }}</td>
                      <td>${{ number_format($gasto->monto, 2, ',', '.') }}</td>
                      <td>{{ $gasto->descripcion }}</td>
                  </tr>
              @endforeach
          </table>
      @else
          <h4>No hay gastos registrados para esta caja.</h4>
      @endif

      <p>Gracias,{{ config('app.name') }}.</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">
          Este es un correo automático, por favor no responder.
      </p>
  </body>
</html>