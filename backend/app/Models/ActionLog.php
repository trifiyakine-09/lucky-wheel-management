<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActionLog extends Model
{
    protected $fillable = ['user_id', 'action', 'details'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function ecrire(string $action, ?string $details = null, ?int $userId = null): void
    {
        self::create([
            'action'  => $action,
            'details' => $details,
            'user_id' => $userId,
        ]);
    }
}