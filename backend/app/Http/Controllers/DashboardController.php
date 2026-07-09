<?php

namespace App\Http\Controllers;

use App\Models\Cadeau;
use App\Models\Gagnant;
use App\Models\Participant;

class DashboardController extends Controller
{
    public function index()
    {
        $totalParticipants = Participant::count();
        $totalGagnants = Gagnant::count();

        return response()->json([
            'total_participants'    => $totalParticipants,
            'total_gagnants'        => $totalGagnants,
            'participants_restants' => $totalParticipants - $totalGagnants,
            'cadeaux_actifs'        => Cadeau::where('actif', true)->where('quantite', '>', 0)->count(),
            'stock_restant'         => Cadeau::where('actif', true)->sum('quantite'),
        ]);
    }
}