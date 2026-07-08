<?php

namespace App\Http\Controllers;

use App\Models\Cadeau;
use Illuminate\Http\Request;

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

        return response()->json(Cadeau::create($validated), 201);
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
        return $cadeau;
    }

public function destroy(Cadeau $cadeau)
{
    try {
        $cadeau->delete();
        return response()->json(['message' => 'Cadeau supprimé avec succès']);
    } catch (\Illuminate\Database\QueryException $e) {
        return response()->json([
            'message' => 'Impossible de supprimer ce cadeau : il a déjà été attribué à un gagnant. Désactive-le plutôt.',
        ], 409);
    }
}

    public function toggle(Cadeau $cadeau)
    {
        $cadeau->update(['actif' => !$cadeau->actif]);
        return $cadeau;
    }
}