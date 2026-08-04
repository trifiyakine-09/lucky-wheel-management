<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ParticipantController extends Controller
{
    public function index(Request $request)
{
    $perPage = $request->input('per_page', 25);

    $query = Participant::where('actif', true)->withExists('gagnant as a_gagne');

    if ($request->filtre === 'restants') {
        $query->whereDoesntHave('gagnant');
    } elseif ($request->filtre === 'gagnants') {
        $query->whereHas('gagnant');
    }

    return $query->orderBy('created_at', 'desc')->paginate($perPage);
}

    public function import(Request $request)
{
    $request->validate([
        'fichier' => 'required|file|mimes:xlsx,xls,csv|max:5120',
    ]);

    $anciensRetires = Participant::where('actif', true)->whereDoesntHave('gagnant')->count();
    Participant::where('actif', true)->whereDoesntHave('gagnant')->delete();
    Participant::where('actif', true)->whereHas('gagnant')->update(['actif' => false]);

    $spreadsheet = IOFactory::load($request->file('fichier')->getRealPath());
    $lignes = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);
    $entetes = array_map('strtolower', array_map('trim', array_shift($lignes)));

    $importes = 0;
    $doublons = 0;
    $invalides = 0;

    // 1. Tableau associatif (cle = telephone) : recherche en O(1), plus jamais en O(n)
    $telephonesExistants = array_flip(Participant::pluck('telephone')->all());

    $lot = [];
    $maintenant = now();

    foreach ($lignes as $ligne) {
        $donnee = array_combine($entetes, $ligne);
        $telephone = trim((string) ($donnee['telephone'] ?? ''));
        $nom = trim((string) ($donnee['nom'] ?? ''));
        $prenom = trim((string) ($donnee['prenom'] ?? ''));

        if (empty($telephone) || empty($nom) || empty($prenom)) {
            $invalides++;
            continue;
        }

        if (isset($telephonesExistants[$telephone])) {
            $doublons++;
            continue;
        }

        $telephonesExistants[$telephone] = true;
        $lot[] = [
            'nom' => $nom, 'prenom' => $prenom, 'telephone' => $telephone,
            'actif' => true, 'created_at' => $maintenant, 'updated_at' => $maintenant,
        ];
        $importes++;

        // 2. Insertion groupee par lots de 500, au lieu d'une requete par ligne
        if (count($lot) >= 500) {
            $this->inserer($lot);
            $lot = [];
        }
    }

    if (!empty($lot)) {
        $this->inserer($lot);
    }

    ActionLog::ecrire(
        'import_participants',
        "{$importes} importé(s), {$doublons} doublon(s), {$invalides} invalide(s) — {$anciensRetires} ancien(s) participant(s) retiré(s)",
        $request->user()?->id
    );

    return response()->json([
        'message'   => "{$importes} participant(s) importe(s), {$doublons} doublon(s) ignore(s), {$invalides} ligne(s) invalide(s). {$anciensRetires} ancien(s) participant(s) retire(s).",
        'importes'  => $importes,
        'doublons'  => $doublons,
        'invalides' => $invalides,
        'retires'   => $anciensRetires,
    ]);
}

private function inserer(array $lot): void
{
    try {
        Participant::insert($lot);
    } catch (\Illuminate\Database\QueryException $e) {
        // Filet de securite rare : un doublon a echappe aux verifications precedentes.
        // On isole le lot ligne par ligne pour ne perdre que la ligne fautive, pas les 500.
        foreach ($lot as $ligneUnique) {
            try {
                Participant::create($ligneUnique);
            } catch (\Illuminate\Database\QueryException $e2) {
                // doublon isole, ignore silencieusement
            }
        }
    }
}
    
}