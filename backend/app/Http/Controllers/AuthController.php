<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'canal' => 'nullable|in:email,sms',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        $canal = $request->canal ?? 'email';

        if ($canal === 'sms' && !$user->telephone) {
            return response()->json(['message' => 'Aucun numero de telephone associe a ce compte.'], 422);
        }

        OtpService::generateAndSend($user, $canal);

        $label = $canal === 'sms' ? 'par SMS' : 'par email';
        return response()->json(['message' => "Code de verification envoye {$label}."]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required']);

        $user = User::where('email', $request->email)
            ->where('otp_code', $request->otp)
            ->where('otp_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Code invalide ou expire.'], 422);
        }

        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'canal' => 'nullable|in:email,sms',
        ]);

        $user = User::where('email', $request->email)->first();
        $canal = $request->canal ?? 'email';

        if ($canal === 'sms' && !$user->telephone) {
            return response()->json(['message' => 'Aucun numero de telephone associe a ce compte.'], 422);
        }

        OtpService::generateAndSend($user, $canal);

        $label = $canal === 'sms' ? 'par SMS' : 'par email';
        return response()->json(['message' => "Code de reinitialisation envoye {$label}."]);
    }

   public function resetPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp' => 'required',
        'password' => 'required|min:8|confirmed',
    ]);

    $user = User::where('email', $request->email)
        ->where('otp_code', $request->otp)
        ->where('otp_expires_at', '>', now())
        ->first();

    if (!$user) {
        return response()->json(['message' => 'Code invalide ou expire.'], 422);
    }

    if (\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Le nouveau mot de passe doit être différent de l\'ancien.'], 422);
    }

    $user->password = $request->password;
    $user->otp_code = null;
    $user->otp_expires_at = null;
    $user->save();

    return response()->json(['message' => 'Mot de passe reinitialise avec succes.']);
}

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Deconnecte.']);
    }
    public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'password' => 'required|min:8|confirmed',
    ]);

    $user = $request->user();

    if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
        return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
    }

    if (\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Le nouveau mot de passe doit être différent de l\'ancien.'], 422);
    }

    $user->password = $request->password;
    $user->save();

    \App\Models\ActionLog::ecrire('mdp_modifie', $user->name, $user->id);

    return response()->json(['message' => 'Mot de passe modifié avec succès.']);
}
public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'telephone' => 'required|string|max:20',
        'password' => 'required|min:8|confirmed',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'telephone' => $request->telephone,
        'password' => $request->password,
    ]);

    \App\Models\ActionLog::ecrire('admin_cree', $user->name, $request->user()?->id);

    return response()->json($user, 201);
}
}