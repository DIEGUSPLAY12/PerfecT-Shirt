<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use App\Mail\VerifyEmail;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordEmail;

class AuthController extends Controller
{
    // REGISTRO (Guarda el código y envía el email)
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'apellidos' => 'required|string',
            'fecha_nacimiento' => 'required|date|before:today',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed'
        ]);

        // Generamos un código aleatorio de 6 dígitos
        $codigo = rand(100000, 999999);

        $user = User::create([
            'name' => $request->name,
            'apellidos' => $request->apellidos,
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'verification_code' => $codigo,
            'is_verified' => false
        ]);

        // Enviamos el correo usando el sistema configurado en el .env
        Mail::to($user->email)->send(new VerifyEmail($codigo));

        return response()->json([
            'message' => 'Te hemos enviado un código al correo.',
            'email' => $user->email // Devolvemos el email para que el frontend lo sepa
        ], 201);
    }

    // NUEVA FUNCIÓN: VALIDAR EL CÓDIGO
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        // Comprobamos si el usuario existe y si el código es el correcto
        if (!$user || $user->verification_code !== $request->code) {
            return response()->json(['message' => 'Código incorrecto o usuario no encontrado'], 400);
        }

        // Si acierta, verificamos la cuenta y borramos el código
        $user->is_verified = true;
        $user->verification_code = null;
        $user->save();

        // Le generamos su token para que ya entre directamente a la tienda
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Cuenta verificada con éxito',
            'user' => $user,
            'token' => $token
        ]);
    }

    // LOGIN
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // BLOQUE DE SEGURIDAD: Evitar que entren si no han puesto el código
        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user,
            'token' => $token
        ]);
    }
    
    // LOGOUT
    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

// ACTUALIZAR PERFIL
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string',
            'apellidos' => 'required|string',
            'fecha_nacimiento' => 'required|date|before:today',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6|confirmed',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        $user->name = $request->name;
        $user->apellidos = $request->apellidos;
        $user->fecha_nacimiento = $request->fecha_nacimiento;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            // EL MÉTODO INFALIBLE: Guardar directamente en /public/avatars
            $file = $request->file('avatar');
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // Lo mueve a la carpeta publica real que Docker lee sin problemas
            $file->move(public_path('avatars'), $filename);
            
            $user->avatar = 'avatars/' . $filename;
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }

   // LOGIN CON GOOGLE
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account']) // <--- ESTA ES LA MAGIA
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => null,
                    'is_verified' => true, // Auto-verificamos porque viene de Google
                    'verification_code' => null
                ]);
            } else {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $user->avatar ?? $googleUser->getAvatar(),
                    'is_verified' => true // Si ya existía, lo damos por verificado
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // REDIRECCIÓN (Usando tu puerto y carpeta exactos)
            $frontendUrl = "http://127.0.0.1:5501/perfecT-shirt/index.html?token=" . $token;
            
            return redirect()->away($frontendUrl);

        } catch (\Exception $e) {
            return redirect()->away("http://127.0.0.1:5501/perfecT-shirt/index.html?error=google_failed");
        }
    }

    // ==========================================
    // RECUPERAR CONTRASEÑA
    // ==========================================
    
    // 1. Enviar código de recuperación
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Si el correo existe, se enviará un código.'], 200); 
            // Mensaje genérico por seguridad (para que no adivinen correos)
        }

        // Generamos un código y lo guardamos reciclando la columna
        $codigo = rand(100000, 999999);
        $user->verification_code = $codigo;
        $user->save();

        Mail::to($user->email)->send(new ResetPasswordEmail($codigo));

        return response()->json(['message' => 'Código enviado correctamente.']);
    }

    // 2. Comprobar código y cambiar contraseña
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|min:6|confirmed'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->verification_code !== $request->code) {
            return response()->json(['message' => 'Código incorrecto o caducado.'], 400);
        }

        // Cambiamos la contraseña y borramos el código
        $user->password = Hash::make($request->password);
        $user->verification_code = null;
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.']);
    }
}