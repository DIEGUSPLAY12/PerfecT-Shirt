<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $codigo;

    public function __construct($codigo)
    {
        $this->codigo = $codigo;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu código de verificación - perfecT-shirt',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "<div style='font-family: Arial, sans-serif; text-align: center; padding: 20px;'>
                            <h1 style='color: #1b3a57;'>¡Bienvenido a perfecT-shirt!</h1>
                            <p>Para completar tu registro, introduce el siguiente código de 6 dígitos en la página web:</p>
                            <div style='background: #f4f4f4; padding: 15px; margin: 20px auto; width: 200px; border-radius: 8px;'>
                                <h2 style='margin: 0; font-size: 28px; letter-spacing: 5px; color: #ea580c;'>{$this->codigo}</h2>
                            </div>
                            <p style='color: #64748b; font-size: 12px;'>Si no has solicitado este registro, ignora este correo.</p>
                         </div>"
        );
    }
}