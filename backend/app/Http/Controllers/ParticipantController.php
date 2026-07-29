<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\ActionLog;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ParticipantController extends Controller
{
    public function index()
    {
        return Participant::where('actif', true)
            ->withExists('gagnant as a_gagne')
            ->orderBy('created_at', 'desc')
            ->get();
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
}