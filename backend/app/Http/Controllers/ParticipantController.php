<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ParticipantController extends Controller
{
    public function index()
    {
        return Participant::orderBy('created_at', 'desc')->get();
    }

    public function import(Request $request)
    {
        $request->validate([
            'fichier' => 'required|file|mimes:xlsx,xls,csv|max:5120',
        ]);

        $spreadsheet = IOFactory::load($request->file('fichier')->getRealPath());
        $lignes = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);

        // Premiere ligne = en-tetes (nom, prenom, telephone)
        $entetes = array_map('strtolower', array_map('trim', array_shift($lignes)));

        $importes = 0;
        $doublons = 0;
        $invalides = 0;
        $telephonesExistants = Participant::pluck('telephone')->toArray();

        foreach ($lignes as $ligne) {
            $donnee = array_combine($entetes, $ligne);
            $telephone = trim((string) ($donnee['telephone'] ?? ''));
            $nom = trim((string) ($donnee['nom'] ?? ''));
            $prenom = trim((string) ($donnee['prenom'] ?? ''));

            if (empty($telephone) || empty($nom) || empty($prenom)) {
                $invalides++;
                continue;
            }

            if (in_array($telephone, $telephonesExistants)) {
                $doublons++;
                continue;
            }

            try {
                Participant::create(compact('nom', 'prenom', 'telephone'));
                $telephonesExistants[] = $telephone;
                $importes++;
            } catch (\Illuminate\Database\QueryException $e) {
                $doublons++;
            }
        }
        \App\Models\ActionLog::ecrire('import_participants', "{$importes} importé(s), {$doublons} doublon(s), {$invalides} invalide(s)", $request->user()?->id);

        return response()->json([
            'message'  => "{$importes} participant(s) importe(s), {$doublons} doublon(s) ignore(s), {$invalides} ligne(s) invalide(s).",
            'importes' => $importes,
            'doublons' => $doublons,
            'invalides' => $invalides,
        ]);
    }
}