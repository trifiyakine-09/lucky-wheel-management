<?php

namespace App\Services;

use App\Models\User;
use Twilio\Rest\Client;

class OtpService
{
    public static function generateAndSend(User $user): void
    {
        $otp = random_int(100000, 999999);

        $user->otp_code = $otp;
        $user->otp_expires_at = now()->addMinutes(10);
        $user->save();

        $client = new Client(config('services.twilio.sid'), config('services.twilio.token'));

        $client->messages->create($user->telephone, [
            'from' => config('services.twilio.from'),
            'body' => "Lucky Wheel : votre code de verification est {$otp} (valable 10 minutes).",
        ]);
    }
}