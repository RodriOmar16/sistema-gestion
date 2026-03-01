<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VentaAnuladaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $venta;

    /**
     * Create a new message instance.
     */
    public function __construct($venta)
    {
        $this->venta = $venta;
    }

   public function build()
    {
        return $this->subject('Se anuló una venta')
                    ->view('emails.venta_anulada');
    }
}
