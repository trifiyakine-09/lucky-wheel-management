<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Participant;
use App\Http\Controllers\CadeauController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\GagnantController;
use App\Http\Controllers\DashboardController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
//{"nom": "Powerbank", "quantite": 10, "couleur": "#FFC107"}
Route::apiResource('cadeaux', CadeauController::class)->parameters(['cadeaux' => 'cadeau']);
Route::patch('cadeaux/{cadeau}/toggle', [CadeauController::class, 'toggle']);
Route::get('participants', [ParticipantController::class, 'index']);
Route::post('participants/import', [ParticipantController::class, 'import']);
Route::post('tirages', [GagnantController::class, 'store']);
Route::get('gagnants', [GagnantController::class, 'index']);
Route::get('gagnants/export', [GagnantController::class, 'export']);
Route::get('dashboard', [DashboardController::class, 'index']);