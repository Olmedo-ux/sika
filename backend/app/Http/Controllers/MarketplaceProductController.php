<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceProduct;
use App\Http\Resources\MarketplaceProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MarketplaceProductController extends Controller
{
    /**
     * Get all available marketplace products
     */
    public function index()
    {
        $products = MarketplaceProduct::with('seller')
            ->where('available', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return MarketplaceProductResource::collection($products);
    }

    /**
     * Get products for the authenticated recycler
     */
    public function myProducts()
    {
        $user = Auth::user();
        
        $products = MarketplaceProduct::where('seller_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return MarketplaceProductResource::collection($products);
    }

    /**
     * Create a new marketplace product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_type' => 'required|in:raw_material,finished_product',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image_url' => 'nullable|string',
            'image_urls' => 'nullable|array',
            'quantity' => 'required|integer|min:1',
            'unit' => 'required|string',
            'price_per_unit' => 'required|numeric|min:0',
            'available' => 'boolean',
        ]);

        $user = Auth::user();

        $product = MarketplaceProduct::create([
            'seller_id' => $user->id,
            'seller_name' => $user->company_name ?? $user->name,
            'seller_type' => $user->role,
            'product_type' => $validated['product_type'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'image_url' => $validated['image_url'] ?? null,
            'image_urls' => $validated['image_urls'] ?? null,
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'price_per_unit' => $validated['price_per_unit'],
            'available' => $validated['available'] ?? true,
        ]);

        return new MarketplaceProductResource($product);
    }

    /**
     * Update a marketplace product
     */
    public function update(Request $request, $id)
    {
        $product = MarketplaceProduct::findOrFail($id);
        
        // Ensure user owns this product
        if ($product->seller_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'product_type' => 'sometimes|in:raw_material,finished_product',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'image_url' => 'nullable|string',
            'image_urls' => 'nullable|array',
            'quantity' => 'sometimes|integer|min:0',
            'unit' => 'sometimes|string',
            'price_per_unit' => 'sometimes|numeric|min:0',
            'available' => 'sometimes|boolean',
        ]);

        $product->update($validated);

        return new MarketplaceProductResource($product);
    }

    /**
     * Delete a marketplace product
     */
    public function destroy($id)
    {
        $product = MarketplaceProduct::findOrFail($id);
        
        // Ensure user owns this product
        if ($product->seller_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
