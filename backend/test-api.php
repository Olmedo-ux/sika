<?php

// Test direct de l'API sans passer par le navigateur

echo "=== TEST API SIKAGREEN ===\n\n";

// Test 1: Register
echo "1. Test Register...\n";
$registerData = [
    'phone' => '+228 99 88 77 66',
    'password' => 'test123',
    'name' => 'Test User',
    'role' => 'citizen',
    'neighborhood' => 'Agoè-Nyivé'
];

$ch = curl_init('http://localhost:8000/api/register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($registerData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: $httpCode\n";
echo "Response: $response\n\n";

// Test 2: Login
echo "2. Test Login...\n";
$loginData = [
    'phone' => '+228 90 12 34 56',
    'password' => 'password'
];

$ch = curl_init('http://localhost:8000/api/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: $httpCode\n";
echo "Response: $response\n";
