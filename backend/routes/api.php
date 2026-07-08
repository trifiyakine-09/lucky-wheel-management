<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Participant;
use App\Http\Controllers\CadeauController;
use App\Http\Controllers\ParticipantController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::apiResource('cadeaux', CadeauController::class)->parameters(['cadeaux' => 'cadeau']);
Route::patch('cadeaux/{cadeau}/toggle', [CadeauController::class, 'toggle']);
Route::get('participants', [ParticipantController::class, 'index']);
Route::post('participants/import', [ParticipantController::class, 'import']);