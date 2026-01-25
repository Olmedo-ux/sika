<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceOrder;
use App\Models\MarketplaceProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MarketplaceOrderController extends Controller
{
    /**
     * Create a new order (buy/sell request)
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:marketplace_products,id',
            'quantity' => 'required|integer|min:1',
            'message' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
        ]);

        $product = MarketplaceProduct::findOrFail($validated['product_id']);

        // Prevent recycler from ordering their own products
        if ($product->user_id === $user->id) {
            return response()->json([
                'message' => 'You cannot order your own product'
            ], 400);
        }

        // Calculate total amount
        $totalAmount = $validated['quantity'] * $product->price_per_unit;

        $order = MarketplaceOrder::create([
            'product_id' => $product->id,
            'buyer_id' => $user->id,
            'seller_id' => $product->user_id,
            'product_name' => $product->name,
            'product_type' => $product->product_type,
            'quantity' => $validated['quantity'],
            'unit' => $product->unit,
            'price_per_unit' => $product->price_per_unit,
            'total_amount' => $totalAmount,
            'buyer_message' => $validated['message'] ?? null,
            'buyer_phone' => $validated['phone'] ?? $user->phone,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load(['buyer', 'seller', 'product']),
        ], 201);
    }

    /**
     * Get orders for the authenticated user (as buyer)
     */
    public function myOrders()
    {
        $user = Auth::user();
        
        $orders = MarketplaceOrder::where('buyer_id', $user->id)
            ->with(['seller', 'product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get orders received by recycler (as seller)
     */
    public function receivedOrders()
    {
        $user = Auth::user();
        
        if ($user->role !== 'recycler') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $orders = MarketplaceOrder::where('seller_id', $user->id)
            ->with(['buyer', 'product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Accept an order
     */
    public function accept($id)
    {
        $user = Auth::user();
        $order = MarketplaceOrder::findOrFail($id);

        if ($order->seller_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order is not pending'], 400);
        }

        $order->status = 'accepted';
        $order->accepted_at = now();
        $order->save();

        return response()->json([
            'message' => 'Order accepted',
            'order' => $order->load(['buyer', 'seller', 'product']),
        ]);
    }

    /**
     * Reject an order
     */
    public function reject($id)
    {
        $user = Auth::user();
        $order = MarketplaceOrder::findOrFail($id);

        if ($order->seller_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order is not pending'], 400);
        }

        $order->status = 'rejected';
        $order->save();

        return response()->json([
            'message' => 'Order rejected',
            'order' => $order,
        ]);
    }

    /**
     * Complete an order
     */
    public function complete($id)
    {
        $user = Auth::user();
        $order = MarketplaceOrder::findOrFail($id);

        if ($order->seller_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'accepted') {
            return response()->json(['message' => 'Order must be accepted first'], 400);
        }

        $order->status = 'completed';
        $order->completed_at = now();
        $order->save();

        return response()->json([
            'message' => 'Order completed',
            'order' => $order->load(['buyer', 'seller', 'product']),
        ]);
    }

    /**
     * Cancel an order (by buyer)
     */
    public function cancel($id)
    {
        $user = Auth::user();
        $order = MarketplaceOrder::findOrFail($id);

        if ($order->buyer_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($order->status, ['pending', 'accepted'])) {
            return response()->json(['message' => 'Cannot cancel this order'], 400);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json([
            'message' => 'Order cancelled',
            'order' => $order,
        ]);
    }
}
