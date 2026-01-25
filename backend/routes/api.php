<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\MarketplaceOrderController;
use App\Http\Controllers\MarketplaceProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public marketplace
Route::get('/marketplace/products', [MarketplaceProductController::class, 'index']);
Route::get('/marketplace-products', [MarketplaceProductController::class, 'index']); // Legacy route

// Public stats
Route::get('/stats/global', [StatsController::class, 'global']);

// Public configuration
Route::get('/waste-types', [ConfigController::class, 'wasteTypes']);
Route::get('/neighborhoods', [ConfigController::class, 'neighborhoods']);
Route::get('/collection-points', [ConfigController::class, 'collectionPoints']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Collections
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/collections/citizen', [CollectionController::class, 'citizenCollections']);
    Route::get('/collections/collector', [CollectionController::class, 'collectorCollections']);
    Route::get('/collections/collector/history', [CollectionController::class, 'collectorHistory']);
    Route::post('/collections', [CollectionController::class, 'store']);
    Route::patch('/collections/{id}', [CollectionController::class, 'update']);
    Route::post('/collections/{id}/accept', [CollectionController::class, 'accept']);
    Route::post('/collections/{id}/reject', [CollectionController::class, 'reject']);
    Route::post('/collections/{id}/start', [CollectionController::class, 'start']);

    // Reviews
    Route::get('/reviews/received', [ReviewController::class, 'received']);
    Route::get('/reviews/given', [ReviewController::class, 'given']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Marketplace Products
    Route::get('/marketplace/my-products', [MarketplaceProductController::class, 'myProducts']);
    Route::post('/marketplace/products', [MarketplaceProductController::class, 'store']);
    Route::patch('/marketplace/products/{id}', [MarketplaceProductController::class, 'update']);
    Route::delete('/marketplace/products/{id}', [MarketplaceProductController::class, 'destroy']);

    // Marketplace Orders
    Route::post('/marketplace/orders', [MarketplaceOrderController::class, 'store']);
    Route::get('/marketplace/orders/my-orders', [MarketplaceOrderController::class, 'myOrders']);
    Route::get('/marketplace/orders/received', [MarketplaceOrderController::class, 'receivedOrders']);
    Route::post('/marketplace/orders/{id}/accept', [MarketplaceOrderController::class, 'accept']);
    Route::post('/marketplace/orders/{id}/reject', [MarketplaceOrderController::class, 'reject']);
    Route::post('/marketplace/orders/{id}/complete', [MarketplaceOrderController::class, 'complete']);
    Route::post('/marketplace/orders/{id}/cancel', [MarketplaceOrderController::class, 'cancel']);

    // Stats
    Route::get('/stats/dashboard', [StatsController::class, 'dashboard']);

    // Chat
    Route::get('/conversations', [ChatController::class, 'getConversations']);
    Route::post('/conversations', [ChatController::class, 'createConversation']);
    Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);

    // Upload
    Route::post('/upload/image', [UploadController::class, 'uploadImage']);
});

// Public storage access with CORS
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        abort(404);
    }
    
    $mimeType = mime_content_type($filePath);
    
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => request()->header('Origin', '*'),
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
    ]);
})->where('path', '.*');
