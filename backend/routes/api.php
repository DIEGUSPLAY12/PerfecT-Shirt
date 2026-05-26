<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExternalApiController;
use App\Http\Controllers\SubastaController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NotificacionController;

// Ruta para probar la importación
Route::get('/importar-camisetas', [ExternalApiController::class, 'index']);
Route::get('/noticias-futbol', [ExternalApiController::class, 'getNoticias']);

// Rutas Públicas (Cualquiera puede entrar)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Rutas Públicas (debajo de /login)
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::get('/health', function () {
    return response()->json(['status' => 'OK'], 200);
});

// Rutas Públicas de Subastas
Route::get('/subastas/diarias', [SubastaController::class, 'obtenerSubastasDiarias']);

// Rutas Protegidas (Necesitan Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Ruta para realizar la oferta (solo logueados)
    Route::post('/subastas/{id}/pujar', [SubastaController::class, 'realizarOferta']);
    
    // NUEVO: Ruta para actualizar el perfil
    Route::put('/perfil', [AuthController::class, 'updateProfile']);
});

// ==========================================
// RUTAS DE ADMINISTRACIÓN
// ==========================================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    
    // Estadísticas y Usuarios
    Route::get('/stats', [AdminController::class, 'getStats']);
    Route::get('/users', [AdminController::class, 'getAllUsers']);
    Route::put('/users/{id}/role', [AdminController::class, 'toggleUserRole']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    
    // Catálogo y Pujas (¡LAS NUEVAS!)
    Route::get('/products', [AdminController::class, 'getAllProducts']);
    Route::get('/bids', [AdminController::class, 'getAllBids']);
    
});

Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// NUEVO: Sistema de Notificaciones
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::put('/notificaciones/{id}/leer', [NotificacionController::class, 'markAsRead']);
    Route::delete('/notificaciones', [NotificacionController::class, 'destroyAll']);
