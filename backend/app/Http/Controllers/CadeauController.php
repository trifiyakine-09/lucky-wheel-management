<?php

namespace App\Http\Controllers;

use App\Models\Cadeau;
use Illuminate\Http\Request;
use App\Models\ActionLog;

class CadeauController extends Controller
{
    public function index()
    {
        return Cadeau::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantite'    => 'required|integer|min:0',
            'couleur'     => 'nullable|string|max:20',
            'actif'       => 'boolean',
        ]);

        $cadeau = Cadeau::create($validated);

        ActionLog::ecrire('cadeau_cree', $cadeau->nom, $request->user()?->id);

        return response()->json($cadeau, 201);
    }

    public function show(Cadeau $cadeau)
    {
        return $cadeau;
    }

    public function update(Request $request, Cadeau $cadeau)
    {
        $validated = $request->validate([
            'nom'         => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'quantite'    => 'sometimes|required|integer|min:0',
            'couleur'     => 'nullable|string|max:20',
            'actif'       => 'boolean',
        ]);

        $cadeau->update($validated);

        ActionLog::ecrire('cadeau_modifie', $cadeau->nom, $request->user()?->id);

        return $cadeau;
    }

    public function destroy(Request $request, Cadeau $cadeau)
    {
        try {
            $cadeau->delete();

            ActionLog::ecrire('cadeau_supprime', $cadeau->nom, $request->user()?->id);

            return response()->json(['message' => 'Cadeau supprimé avec succès']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'Impossible de supprimer ce cadeau : il a déjà été attribué à un gagnant. Désactive-le plutôt.',
            ], 409);
        }
    }

    public function toggle(Request $request, Cadeau $cadeau)
    {
        $cadeau->update(['actif' => !$cadeau->actif]);

        ActionLog::ecrire($cadeau->actif ? 'cadeau_active' : 'cadeau_desactive', $cadeau->nom, $request->user()?->id);

        return $cadeau;
    }
}