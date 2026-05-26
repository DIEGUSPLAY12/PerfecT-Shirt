<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notificacion;

class NotificacionController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        return response()->json(Notificacion::where('user_id', $user->id)->orderBy('created_at', 'desc')->get());
    }

    public function markAsRead(Request $request, $id) {
        $notificacion = Notificacion::where('user_id', $request->user()->id)->findOrFail($id);
        $notificacion->leida = true;
        $notificacion->save();
        return response()->json(['message' => 'Marcada como leída']);
    }

    public function destroyAll(Request $request) {
        Notificacion::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Todas borradas']);
    }
}