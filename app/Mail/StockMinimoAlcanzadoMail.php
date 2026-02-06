<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StockMinimoAlcanzadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $producto;
    public $stock;

    /**
     * Create a new message instance.
     */
    public function __construct($producto, $stock)
    {
        $this->producto = $producto;
        $this->stock    = $stock;
    }

    public function build(){
        return $this->subject('AVISO: Stock Mínimo alcanzado')
                    ->view('emails.stock_minimo');
    }
    /**
     * Get the message envelope.
     */
    /*public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Stock Minimo Alcanzado Mail',
        );
    }*/

    /**
     * Get the message content definition.
     */
    /*public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }*/

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    /*public function attachments(): array
    {
        return [];
    }*/
}
