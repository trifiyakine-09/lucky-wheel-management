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
            'gagnants_par_cadeau' => Cadeau::withCount('gagnants')->get()
    ->filter(fn ($c) => $c->gagnants_count > 0)
    ->sortByDesc('gagnants_count')
    ->map(fn ($c) => ['nom' => $c->nom, 'couleur' => $c->couleur, 'total' => $c->gagnants_count])
    ->values(),
'tirages_par_jour' => Gagnant::selectRaw('DATE(created_at) as jour, COUNT(*) as total')
    ->where('created_at', '>=', now()->subDays(6)->startOfDay())
    ->groupBy('jour')->orderBy('jour')->get(),
        ]);
    }
}