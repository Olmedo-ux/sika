<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\MarketplaceProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that marketplace products endpoint returns 200 and valid JSON structure
     */
    public function test_marketplace_products_endpoint_returns_valid_response(): void
    {
        $response = $this->getJson('/api/marketplace-products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
            ]);
    }

    /**
     * Test marketplace products with data
     */
    public function test_marketplace_products_returns_products(): void
    {
        // Create a recycler user
        $recycler = User::factory()->create([
            'role' => 'recycler',
            'company_name' => 'TogoRecycle SA',
            'responsible_name' => 'Yao Agbeko',
        ]);

        // Create a marketplace product
        $product = MarketplaceProduct::create([
            'seller_id' => $recycler->id,
            'seller_name' => $recycler->company_name,
            'seller_type' => 'recycler',
            'product_type' => 'raw_material',
            'name' => 'Plastique PET',
            'description' => 'Bouteilles en plastique recyclées',
            'quantity' => 1000,
            'unit' => 'kg',
            'price_per_unit' => 500,
            'available' => true,
        ]);

        $response = $this->getJson('/api/marketplace-products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'sellerId',
                        'sellerName',
                        'productType',
                        'name',
                        'description',
                        'quantity',
                        'unit',
                        'pricePerUnit',
                        'available',
                    ],
                ],
            ])
            ->assertJsonFragment([
                'name' => 'Plastique PET',
                'quantity' => 1000,
            ]);
    }

    /**
     * Test creating a marketplace product (authenticated)
     */
    public function test_authenticated_user_can_create_product(): void
    {
        $recycler = User::factory()->create([
            'role' => 'recycler',
            'company_name' => 'TogoRecycle SA',
            'responsible_name' => 'Yao Agbeko',
        ]);

        $token = $recycler->createToken('test-token')->plainTextToken;

        $productData = [
            'product_type' => 'finished_product',
            'name' => 'Sacs réutilisables',
            'description' => 'Sacs fabriqués à partir de plastique recyclé',
            'quantity' => 500,
            'unit' => 'pièce',
            'price_per_unit' => 1000,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/marketplace/products', $productData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'productType',
                    'pricePerUnit',
                ],
            ]);

        $this->assertDatabaseHas('marketplace_products', [
            'seller_id' => $recycler->id,
            'name' => 'Sacs réutilisables',
            'product_type' => 'finished_product',
        ]);
    }

    /**
     * Test that unauthenticated users cannot create products
     */
    public function test_unauthenticated_user_cannot_create_product(): void
    {
        $productData = [
            'product_type' => 'finished_product',
            'name' => 'Test Product',
            'description' => 'Test Description',
            'quantity' => 100,
            'unit' => 'kg',
            'price_per_unit' => 500,
        ];

        $response = $this->postJson('/api/marketplace/products', $productData);

        $response->assertStatus(401);
    }
}
