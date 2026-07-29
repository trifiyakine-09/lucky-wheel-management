<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    protected $fillable = ['nom', 'prenom', 'telephone', 'actif'];

public function gagnant()
{
    return $this->hasOne(Gagnant::class);
}
}
