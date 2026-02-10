<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VentaRegistradaDuenioMail extends Mailable
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

    public function build(){
        return $this->subject('Se registró una nueva venta')
                    ->view('emails.venta_registrada_duenio');
    }
}
