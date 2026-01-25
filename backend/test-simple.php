<?php

// Test simple pour voir le message d'erreur exact

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

echo "HTTP Code: $httpCode\n";
echo "Response:\n";

// Decode JSON to see error message
$json = json_decode($response, true);
if ($json) {
    echo "Message: " . ($json['message'] ?? 'N/A') . "\n";
    if (isset($json['errors'])) {
        echo "Errors:\n";
        print_r($json['errors']);
    }
} else {
    echo substr($response, 0, 500) . "\n";
}
