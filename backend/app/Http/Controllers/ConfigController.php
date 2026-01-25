<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WasteType;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    /**
     * Get all waste types
     */
    public function wasteTypes()
    {
        $wasteTypes = WasteType::all();
        
        // If no waste types in DB, return default configuration
        if ($wasteTypes->isEmpty()) {
            return response()->json([
                ['id' => 'plastic', 'name' => 'Plastique', 'icon' => '♻️', 'pricePerKg' => 150, 'recyclable' => true],
                ['id' => 'glass', 'name' => 'Verre', 'icon' => '🫙', 'pricePerKg' => 100, 'recyclable' => true],
                ['id' => 'metal', 'name' => 'Métal', 'icon' => '🔩', 'pricePerKg' => 250, 'recyclable' => true],
                ['id' => 'organic', 'name' => 'Organique', 'icon' => '🌿', 'pricePerKg' => 50, 'recyclable' => false],
                ['id' => 'paper', 'name' => 'Papier/Carton', 'icon' => '📦', 'pricePerKg' => 80, 'recyclable' => true],
                ['id' => 'electronics', 'name' => 'Électronique', 'icon' => '📱', 'pricePerKg' => 500, 'recyclable' => true],
                ['id' => 'banana', 'name' => 'Troncs de bananier', 'icon' => '🍌', 'pricePerKg' => 120, 'recyclable' => true],
                ['id' => 'household', 'name' => 'Ordures ménagères', 'icon' => '🗑️', 'pricePerKg' => 30, 'recyclable' => false],
                ['id' => 'garden', 'name' => 'Déchets verts', 'icon' => '🌳', 'pricePerKg' => 40, 'recyclable' => false],
                ['id' => 'mixed', 'name' => 'Déchets mixtes', 'icon' => '🧹', 'pricePerKg' => 25, 'recyclable' => false],
            ]);
        }

        return response()->json($wasteTypes);
    }

    /**
     * Get all neighborhoods
     */
    public function neighborhoods()
    {
        return response()->json([
            'Lomé Centre',
            'Bè',
            'Agoè-Nyivé',
            'Tokoin',
            'Kodjoviakopé',
            'Adidogomé',
            'Baguida',
            'Aflao',
        ]);
    }

    /**
     * Get collection points (collectors and recyclers with GPS coordinates)
     */
    public function collectionPoints()
    {
        $points = User::whereIn('role', ['collector', 'recycler'])
            ->whereNotNull('location_lat')
            ->whereNotNull('location_lng')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->company_name ?? $user->name,
                    'lat' => (float) $user->location_lat,
                    'lng' => (float) $user->location_lng,
                    'type' => $user->role === 'recycler' ? 'recycler' : 'collection',
                    'neighborhood' => $user->neighborhood,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'rating' => $user->rating,
                ];
            });

        return response()->json($points);
    }
}
