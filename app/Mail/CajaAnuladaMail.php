<?php

namespace App\Mail;

use App\Models\Caja;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CajaAnuladaMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $caja;

    public function __construct(Caja $caja)
    {
        $this->caja = $caja;
    }

    public function build()
    {
        return $this->subject('Caja anulada/eliminada')
                    ->view('emails.cajaAnuladaMail');
    }
}
