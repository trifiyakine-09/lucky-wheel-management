<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Participant;
use App\Http\Controllers\CadeauController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/participants', fn () => Participant::all());
Route::apiResource('cadeaux', CadeauController::class);
Route::patch('cadeaux/{cadeau}/toggle', [CadeauController::class, 'toggle']);
