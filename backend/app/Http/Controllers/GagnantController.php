<?php

namespace App\Http\Controllers;

use App\Models\Cadeau;
use App\Models\Gagnant;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GagnantController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'cadeau_id' => 'required|exists:cadeaux,id',
        ]);

        try {
            $gagnant = DB::transaction(function () use ($request) {
                $cadeau = Cadeau::findOrFail($request->cadeau_id);

                if (!$cadeau->actif || $cadeau->quantite < 1) {
                    throw new \RuntimeException('Ce cadeau n\'est plus disponible pour le tirage.');
                }

                $participant = Participant::whereDoesntHave('gagnant')
                    ->inRandomOrder()
                    ->first();

                if (!$participant) {
                    throw new \RuntimeException('Tous les participants ont deja remporte un cadeau.');
                }

                $gagnant = Gagnant::create([
                    'participant_id' => $participant->id,
                    'cadeau_id'      => $cadeau->id,
                    'user_id'        => $request->user()?->id,
                ]);

                $cadeau->decrement('quantite');

                return $gagnant;
            });

            return response()->json($gagnant->load(['participant', 'cadeau']), 201);

        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['message' => 'Une erreur est survenue, veuillez relancer le tirage.'], 409);
        }
    }
}