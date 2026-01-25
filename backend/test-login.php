<?php

// Test login avec Admin 0000

$loginData = [
    'phone' => '0000',
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

echo "HTTP Code: $httpCode\n";
echo "Response:\n";

$json = json_decode($response, true);
if ($json) {
    echo json_encode($json, JSON_PRETTY_PRINT) . "\n";
} else {
    echo substr($response, 0, 500) . "\n";
}
