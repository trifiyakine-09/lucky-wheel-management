<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;

class ActionLogController extends Controller
{
    public function index()
    {
        return ActionLog::with('user:id,name')->latest()->limit(200)->get();
    }
}