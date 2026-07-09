<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client;

class OtpService
{
    public static function generateAndSend(User $user, string $canal = 'email'): void
    {
        $otp = random_int(100000, 999999);

        $user->otp_code = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        if ($canal === 'sms') {
            self::envoyerSms($user->telephone, $otp);
        } else {
            self::envoyerEmail($user->email, $otp);
        }
    }

    private static function envoyerEmail(string $email, int $otp): void
    {
        Mail::raw("Votre code de verification Lucky Wheel : {$otp} (valable 10 minutes)", function ($message) use ($email) {
            $message->to($email)->subject('Code de verification - Lucky Wheel');
        });
    }

    private static function envoyerSms(string $telephone, int $otp): void
    {
        $client = new Client(config('services.twilio.sid'), config('services.twilio.token'));

        $client->messages->create($telephone, [
            'from' => config('services.twilio.from'),
            'body' => "Lucky Wheel : votre code de verification est {$otp} (valable 10 minutes).",
        ]);
    }
}