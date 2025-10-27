<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UsuarioCreadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nombre;
    public $email;
    public $password;

    /**
     * Create a new message instance.
     */
    public function __construct($nombre, $email, $password)
    {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->password = $password;
    }
    public function build()
    {
        return $this->subject('Tu cuenta fue creada')
                    ->view('emails.usuario_creado');
    }
    /*
      Get the message envelope.
     
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Usuario Creado Mail',
        );
    }

    **
     * Get the message content definition.
     *
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }

    **
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     *
    public function attachments(): array
    {
        return [];
    }*/
}
