<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Producto;
use App\Models\OfertasPujas;
use Illuminate\Http\Request;
use App\Models\Pujas;
use Carbon\Carbon;

class AdminController extends Controller
{
    // 1. OBTENER ESTADÍSTICAS GENERALES
    public function getStats()
    {
        $totalUsers = User::count();
        $adminUsers = User::where('role', 'admin')->count();
        
        // Hacemos "la trampa": devolvemos 4 fijo tal como hemos quedado
        $subastasActivas = 4; 

        return response()->json([
            'total_users' => $totalUsers,
            'admin_users' => $adminUsers,
            'subastas_activas' => $subastasActivas,
        ]);
    }

    // 2. LISTAR TODOS LOS USUARIOS
    public function getAllUsers()
    {
        // Traemos todos los usuarios ordenados por fecha de creación
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    // 3. CAMBIAR ROL DE UN USUARIO
    public function toggleUserRole($id)
    {
        $user = User::findOrFail($id);
        
        // Evitar que el admin se quite el rol a sí mismo por accidente
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'No puedes cambiarte el rol a ti mismo'], 400);
        }

        $user->role = $user->role === 'admin' ? 'user' : 'admin';
        $user->save();

        return response()->json(['message' => 'Rol actualizado', 'user' => $user]);
    }

    // 4. ELIMINAR UN USUARIO
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'No puedes borrar tu propia cuenta desde aquí'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    // ==========================================
    // 5. OBTENER TODO EL CATÁLOGO
    // ==========================================
    public function getAllProducts()
    {
        // Traemos todos los productos y cargamos la información de su equipo
        $productos = Producto::with('equipo')->orderBy('Id_Producto', 'desc')->get();

        // Formateamos los datos para que el Frontend los entienda fácilmente
        $formattedProducts = $productos->map(function($p) {
            return [
                'id' => $p->Id_Producto,
                'nombre' => $p->Nombre,
                'equipo' => $p->equipo->Nombre ?? 'Sin Equipo',
                'liga' => $p->equipo->Liga ?? 'Sin Liga',
                'precio' => $p->Precio,
                'imagen_url' => $p->Imagen_Url
            ];
        });

        return response()->json($formattedProducts);
    }

    // ==========================================
    // 6. OBTENER TODAS LAS PUJAS DE LOS USUARIOS
    // ==========================================
    public function getAllBids()
    {
        // Traemos todas las ofertas, cargando al usuario que la hizo y la información del producto subastado
        $ofertas = OfertasPujas::with(['usuario', 'puja.producto'])
            ->orderBy('Fecha', 'desc')
            ->get();

        $formattedBids = $ofertas->map(function($o) {
            return [
                'id' => $o->Id_Oferta,
                'user_name' => $o->usuario->name ?? 'Usuario Eliminado',
                'producto_nombre' => $o->puja->producto->Nombre ?? 'Producto Desconocido',
                'cantidad' => $o->Cantidad_Ofrecida,
                'created_at' => $o->Fecha
            ];
        });

        return response()->json($formattedBids);
    }
}