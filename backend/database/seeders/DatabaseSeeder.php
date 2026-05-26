<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test',
            'apellidos' => 'User',
            'fecha_nacimiento' => '1990-01-01', // <--- CAMBIO AQUÍ
            'email' => 'test@example.com',
        ]);
    }
}
