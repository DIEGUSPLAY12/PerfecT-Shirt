<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// =========================================================
// HACK PARA DOCKER: Servir las imágenes manualmente
// =========================================================
Route::get('/storage/avatars/{filename}', function ($filename) {
    // Buscamos la ruta real de la foto dentro de la carpeta segura
    $path = storage_path('app/public/avatars/' . $filename);
    
    // Si la foto no existe, devolvemos error 404
    if (!file_exists($path)) {
        abort(404);
    }
    
    // Si existe, se la enviamos al navegador directamente
    return response()->file($path);
});