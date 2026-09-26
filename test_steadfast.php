<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = setting('steadfast_api_key') ?: config('services.steadfast.api_key', '');
$secretKey = setting('steadfast_secret_key') ?: config('services.steadfast.secret_key', '');
$phone = '01796465633';
$url = 'https://portal.packzy.com/api/v1/fraud_check/score/' . $phone;

$response = Http::withoutVerifying()->withHeaders([
    'Api-Key' => $apiKey,
    'Secret-Key' => $secretKey,
    'Content-Type' => 'application/json',
])->get($url);

echo "Status: " . $response->status() . "\n";
echo "Body: " . json_encode(json_decode($response->body()), JSON_PRETTY_PRINT) . "\n";
