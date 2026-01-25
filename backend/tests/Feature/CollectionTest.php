<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CollectionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that collection points endpoint returns 200
     */
    public function test_collection_points_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/collection-points');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'address',
                    'latitude',
                    'longitude',
                ],
            ]);
    }

    /**
     * Test that waste types endpoint returns 200
     */
    public function test_waste_types_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/waste-types');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'name',
                    'icon',
                ],
            ]);
    }

    /**
     * Test that neighborhoods endpoint returns 200
     */
    public function test_neighborhoods_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/neighborhoods');

        $response->assertStatus(200);
    }

    /**
     * Test authenticated user can create a collection request
     */
    public function test_authenticated_user_can_create_collection(): void
    {
        $citizen = User::factory()->create([
            'role' => 'citizen',
            'name' => 'Test Citizen',
            'neighborhood' => 'Agoè-Nyivé',
        ]);

        $token = $citizen->createToken('test-token')->plainTextToken;

        $collectionData = [
            'waste_type' => 'Plastique',
            'quantity' => '50',
            'unit' => 'kg',
            'collection_date' => now()->addDays(2)->format('Y-m-d'),
            'location_lat' => '6.1319',
            'location_lng' => '1.2228',
            'location_address' => '123 Rue Test, Agoè-Nyivé',
            'notes' => 'Bouteilles en plastique',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/collections', $collectionData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'citizenId',
                    'wasteType',
                    'quantity',
                    'status',
                ],
            ]);

        $this->assertDatabaseHas('collections', [
            'citizen_id' => $citizen->id,
            'waste_type' => 'Plastique',
            'quantity' => 50,
            'status' => 'pending',
        ]);
    }

    /**
     * Test unauthenticated user cannot create collection
     */
    public function test_unauthenticated_user_cannot_create_collection(): void
    {
        $collectionData = [
            'waste_type' => 'Plastique',
            'quantity' => '50',
            'unit' => 'kg',
            'collection_date' => now()->addDays(2)->format('Y-m-d'),
            'location_lat' => '6.1319',
            'location_lng' => '1.2228',
            'location_address' => '123 Rue Test',
        ];

        $response = $this->postJson('/api/collections', $collectionData);

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can view their collections
     */
    public function test_authenticated_user_can_view_their_collections(): void
    {
        $citizen = User::factory()->create([
            'role' => 'citizen',
        ]);

        $token = $citizen->createToken('test-token')->plainTextToken;

        // Create a collection for this user
        Collection::create([
            'citizen_id' => $citizen->id,
            'citizen_name' => $citizen->name,
            'waste_type' => 'Plastique',
            'quantity' => '50',
            'unit' => 'kg',
            'collection_date' => now()->addDays(2),
            'location_lat' => 6.1319,
            'location_lng' => 1.2228,
            'location_address' => '123 Rue Test',
            'status' => 'pending',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/collections');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'citizenId',
                        'wasteType',
                        'quantity',
                        'status',
                    ],
                ],
            ]);
    }
}
