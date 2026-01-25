<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test complete authentication flow:
     * 1. Register new user
     * 2. Verify user in database
     * 3. Login and get token
     * 4. Access profile with token
     * 5. Logout
     */
    public function test_complete_authentication_flow(): void
    {
        // Step 1: Register new user
        $userData = [
            'phone' => '+228 90123456',
            'password' => 'password123',
            'name' => 'Test User',
            'neighborhood' => 'Agoè-Nyivé',
            'role' => 'citizen',
        ];

        $registerResponse = $this->postJson('/api/register', $userData);

        $registerResponse->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'phone',
                    'name',
                    'role',
                    'neighborhood',
                ],
                'token',
            ]);

        // Step 2: Verify user exists in database
        $this->assertDatabaseHas('users', [
            'phone' => '+228 90123456',
            'name' => 'Test User',
            'role' => 'citizen',
        ]);

        $user = User::where('phone', '+228 90123456')->first();
        $this->assertNotNull($user);

        // Step 3: Login and get token
        $loginResponse = $this->postJson('/api/login', [
            'phone' => '+228 90123456',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'token',
            ]);

        $token = $loginResponse->json('token');
        $this->assertNotEmpty($token);

        // Step 4: Access profile with token
        $profileResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/user');

        $profileResponse->assertStatus(200)
            ->assertJson([
                'phone' => '+228 90123456',
                'name' => 'Test User',
                'role' => 'citizen',
            ]);
    }

    /**
     * Test registration with business account (collector)
     */
    public function test_business_registration(): void
    {
        $businessData = [
            'phone' => '+228 91234567',
            'password' => 'password123',
            'name' => 'EcoCollect',
            'neighborhood' => 'Zone Industrielle',
            'role' => 'collector',
            'company_name' => 'EcoCollect Togo',
            'responsible_name' => 'Ama Kodjo',
        ];

        $response = $this->postJson('/api/register', $businessData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'phone',
                    'name',
                    'role',
                    'companyName',
                    'responsibleName',
                ],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'phone' => '+228 91234567',
            'role' => 'collector',
            'company_name' => 'EcoCollect Togo',
            'responsible_name' => 'Ama Kodjo',
        ]);
    }

    /**
     * Test login with invalid credentials
     */
    public function test_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'phone' => '+228 99999999',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    /**
     * Test accessing protected route without token
     */
    public function test_accessing_protected_route_without_token(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }
}
