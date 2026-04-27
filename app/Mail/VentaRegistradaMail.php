<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; 
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Venta;

class VentaRegistradaMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $venta_id;
    protected $conPdf;

    public function __construct($venta_id, $conPdf=false)
    {
        $this->venta_id = $venta_id;
        $this->conPdf   = $conPdf;
    }

    public function build(){
        $venta = Venta::with(['cliente','detalles.producto','pagos'])
                      ->find($this->venta_id);

        if (!$venta) {
            \Log::error("VentaRegistradaMail: venta_id {$this->venta_id} no encontrada");
            return $this->subject('Error en venta')
                        ->view('emails.error')
                        ->with(['mensaje' => 'No se encontró la venta']);
        }

        $mail = $this->subject('Compra nueva realizada')
                     ->view('emails.venta_registrada')
                     ->with([ 'venta' => $venta ]);

        if ($this->conPdf) {
            $pdf = Pdf::loadView('pdf.factura', ['venta' => $venta]);
            $mail->attachData($pdf->output(), "factura_{$venta->venta_id}.pdf");
        }

        return $mail;
    }
}
