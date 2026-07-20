<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CadeauController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\GagnantController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActionLogController;

Route::middleware('throttle:6,1')->group(function () {
    //{"email": "admin@aziza.tn", "password": "mdp123"}
    Route::post('login', [AuthController::class, 'login']);
    Route::get('login', fn () => response()->json(['message' => 'Unauthenticated.'], 401))->name('login');
    //{"email": "admin@aziza.tn", "otp": "<code>"}
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);

    //{"email": "admin@aziza.tn"}
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);

    //{"email": "admin@aziza.tn", "otp": "326473", "password": "nouveaumdp123" , "password_confirmation": "nouveaumdp123"}
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);

    //{"nom": "Powerbank", "quantite": 10, "couleur": "#FFC107"}
    Route::apiResource('cadeaux', CadeauController::class)->parameters(['cadeaux' => 'cadeau']);

    Route::patch('cadeaux/{cadeau}/toggle', [CadeauController::class, 'toggle']);

    Route::get('participants', [ParticipantController::class, 'index']);
    Route::post('participants/import', [ParticipantController::class, 'import']);

    Route::post('tirages', [GagnantController::class, 'store']);
    Route::get('gagnants', [GagnantController::class, 'index']);
    Route::get('gagnants/export', [GagnantController::class, 'export']);

    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::delete('gagnants/{gagnant}', [GagnantController::class, 'destroy']);
    Route::get('logs', [ActionLogController::class, 'index']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
    Route::post('admins', [AuthController::class, 'register']);
});