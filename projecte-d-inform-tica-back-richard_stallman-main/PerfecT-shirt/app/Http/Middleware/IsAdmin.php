<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si el usuario no está logueado o su rol no es 'admin', le echamos
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Acceso denegado. Solo administradores.'], 403);
        }

        return $next($request);
    }
}
