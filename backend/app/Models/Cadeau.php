<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cadeau extends Model
{
    protected $table = 'cadeaux';

    protected $fillable = ['nom', 'description', 'quantite', 'couleur', 'actif'];

    public function gagnants()
    {
        return $this->hasMany(Gagnant::class);
    }
}
