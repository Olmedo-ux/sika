<?php

namespace Database\Seeders;

use App\Models\WasteType;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Waste Types - Essential data for the application
        $wasteTypes = [
            ['id' => 'plastic', 'name' => 'Plastique', 'icon' => '♻️', 'price_per_kg' => 150, 'recyclable' => true],
            ['id' => 'glass', 'name' => 'Verre', 'icon' => '🫙', 'price_per_kg' => 100, 'recyclable' => true],
            ['id' => 'metal', 'name' => 'Métal', 'icon' => '🔩', 'price_per_kg' => 250, 'recyclable' => true],
            ['id' => 'organic', 'name' => 'Organique', 'icon' => '🌿', 'price_per_kg' => 50, 'recyclable' => false],
            ['id' => 'paper', 'name' => 'Papier/Carton', 'icon' => '📦', 'price_per_kg' => 80, 'recyclable' => true],
            ['id' => 'electronics', 'name' => 'Électronique', 'icon' => '📱', 'price_per_kg' => 500, 'recyclable' => true],
            ['id' => 'banana', 'name' => 'Troncs de bananier', 'icon' => '🍌', 'price_per_kg' => 120, 'recyclable' => true],
            ['id' => 'household', 'name' => 'Ordures ménagères', 'icon' => '🗑️', 'price_per_kg' => 30, 'recyclable' => false],
            ['id' => 'garden', 'name' => 'Déchets verts', 'icon' => '🌳', 'price_per_kg' => 40, 'recyclable' => false],
            ['id' => 'mixed', 'name' => 'Déchets mixtes', 'icon' => '🧹', 'price_per_kg' => 25, 'recyclable' => false],
        ];

        foreach ($wasteTypes as $type) {
            WasteType::create($type);
        }

        $this->command->info('✅ Types de déchets créés avec succès');
    }
}
