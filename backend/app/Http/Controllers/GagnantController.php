<?php

namespace App\Http\Controllers;

use App\Models\Cadeau;
use App\Models\Gagnant;
use App\Models\Participant;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

            $gagnant->load(['participant', 'cadeau']);

            ActionLog::ecrire(
                'tirage',
                "{$gagnant->participant->prenom} {$gagnant->participant->nom} a gagné : {$gagnant->cadeau->nom}",
                $request->user()?->id
            );

            return response()->json($gagnant, 201);

        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['message' => 'Une erreur est survenue, veuillez relancer le tirage.'], 409);
        }
    }
    public function destroy(Request $request, Gagnant $gagnant)
{
    $details = '';

    DB::transaction(function () use ($gagnant, &$details) {
        $gagnant->load(['participant', 'cadeau']);
        $details = "{$gagnant->participant->prenom} {$gagnant->participant->nom} — {$gagnant->cadeau->nom}";
        $gagnant->cadeau->increment('quantite');
        $gagnant->delete();
    });

    ActionLog::ecrire('tirage_annule', $details, $request->user()?->id);

    return response()->json(['message' => 'Tirage annulé : le participant redevient éligible et le stock a été restauré.']);
}
    public function index(Request $request)
{
    return $this->requeteFiltree($request)->get();
}

public function export(Request $request)
{
    $gagnants = $this->requeteFiltree($request)->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Gagnants');
    $sheet->fromArray(['Nom', 'Prenom', 'Telephone', 'Cadeau', 'Date du tirage'], null, 'A1');

    $ligne = 2;
    foreach ($gagnants as $gagnant) {
        $sheet->fromArray([
            $gagnant->participant->nom,
            $gagnant->participant->prenom,
            $gagnant->participant->telephone,
            $gagnant->cadeau->nom,
            $gagnant->created_at->format('d/m/Y H:i'),
        ], null, "A{$ligne}");
        $ligne++;
    }

    foreach (range('A', 'E') as $colonne) {
        $sheet->getColumnDimension($colonne)->setAutoSize(true);
    }

    $nomFichier = 'gagnants-' . now()->format('Y-m-d_His') . '.xlsx';
    $chemin = storage_path("app/{$nomFichier}");
    (new Xlsx($spreadsheet))->save($chemin);

    return response()->download($chemin)->deleteFileAfterSend(true);
}

private function requeteFiltree(Request $request)
{
    $query = Gagnant::with(['participant', 'cadeau'])->orderBy('created_at', 'desc');

    if ($request->filled('search')) {
        $recherche = $request->search;
        $query->whereHas('participant', function ($q) use ($recherche) {
            $q->where('nom', 'like', "%{$recherche}%")
              ->orWhere('prenom', 'like', "%{$recherche}%")
              ->orWhere('telephone', 'like', "%{$recherche}%");
        });
    }

    if ($request->filled('date_debut')) {
        $query->whereDate('created_at', '>=', $request->date_debut);
    }

    if ($request->filled('date_fin')) {
        $query->whereDate('created_at', '<=', $request->date_fin);
    }

    return $query;
}
}