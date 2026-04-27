<!DOCTYPE html>
<html lang="es">
  <head>
      <meta charset="UTF-8">
      <title>Caja cerrada</title>
      <style>
          body { font-family: Arial, sans-serif; color: #333; }
          h1 { color: #2c3e50; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #f4f4f4; padding: 8px; text-align: left; }
          .filatd { border: 1px solid #ddd; padding: 8px; text-align: right; }
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
                            <h1 style="font-size: 20px;">Caja cerrada correctamente ✅</h1>

                            <p>La caja con ID <strong>{{ $caja->caja_id }}</strong> fue cerrada el día <strong>{{ $caja->fecha }}</strong>.</p>

                            <p><strong>Monto inicial:</strong> ${{ number_format($caja->monto_inicial, 2, ',', '.') }}</p>

                            <div style="margin-top: 20px; font-weight: bold; text-align: center">Según el sistema</div>
                            <table width="100%">
                                <tr>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                </tr>
                                <tr><td class="filatd">Efectivo</td><td class="filatd">${{ number_format($caja->efectivo, 2, ',', '.') }}</td></tr>
                                <tr><td class="filatd">Débito</td><td class="filatd">${{ number_format($caja->debito, 2, ',', '.') }}</td></tr>
                                <tr><td class="filatd">Transferencia</td><td class="filatd">${{ number_format($caja->transferencia, 2, ',', '.') }}</td></tr>
                                <tr><td class="filatd"><strong>Total</strong></td><td class="filatd"><strong>${{ number_format($caja->total_sistema, 2, ',', '.') }}</strong></td></tr>
                            </table>

                            <div style="margin-top: 20px; font-weight: bold; text-align: center">Según el usuario</div>
                            <table width="100%">
                                <tr>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                </tr>
                                <tr><td class="filatd">Efectivo</td><td class="filatd">${{ number_format($caja->efectivo_user, 2, ',', '.') }}</td></tr>
                                <tr><td class="filatd">Débito</td><td class="filatd">${{ number_format($caja->debito_user, 2, ',', '.') }}</td></tr>
                                <tr><td class="filatd">Transferencia</td><td class="filatd">${{ number_format($caja->transferencia_user, 2, ',', '.') }}</td></tr>
                                <tr><td class="filatd"><strong>Total</strong></td><td class="filatd"><strong>${{ number_format($caja->total_user, 2, ',', '.') }}</strong></td></tr>
                            </table>

                            <p><strong>Diferencia:</strong> ${{ number_format($caja->diferencia, 2,  ',', '.') }}</p>

                            <p><em>Descripción:</em> {{ $caja->descripcion }}</p>

                            <div class="section-title"><h4>Gastos asociados a la caja</h4></div>

                            @if($caja->gastos->count())
                                <table width="100%">
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
                                            <td class="filatd">${{ number_format($gasto->monto, 2, ',', '.') }}</td>
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
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  </body>
</html>