<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gagnant extends Model
{
    protected $fillable = ['participant_id', 'cadeau_id', 'user_id'];

public function participant() { return $this->belongsTo(Participant::class); }
public function cadeau() { return $this->belongsTo(Cadeau::class); }
public function user() { return $this->belongsTo(User::class); }
}
