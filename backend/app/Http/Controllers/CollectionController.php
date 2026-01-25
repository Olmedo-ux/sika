<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Http\Resources\CollectionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CollectionController extends Controller
{
    /**
     * Get all collections for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        
        $collections = Collection::where(function($query) use ($user) {
            $query->where('citizen_id', $user->id)
                  ->orWhere('collector_id', $user->id);
        })
        ->with(['citizen', 'collector'])
        ->orderBy('created_at', 'desc')
        ->get();

        return CollectionResource::collection($collections);
    }

    /**
     * Get collections for citizen
     */
    public function citizenCollections()
    {
        $user = Auth::user();
        
        $collections = Collection::where('citizen_id', $user->id)
            ->with(['citizen', 'collector'])
            ->orderBy('created_at', 'desc')
            ->get();

        return CollectionResource::collection($collections);
    }

    /**
     * Get collections for collector
     */
    public function collectorCollections()
    {
        $user = Auth::user();
        
        $collections = Collection::where(function($query) use ($user) {
                // Collections assigned to this collector (excluding completed/cancelled)
                $query->where('collector_id', $user->id)
                      ->whereIn('status', ['accepted', 'in_progress']);
            })
            ->orWhere(function($query) {
                // Pending collections available to all collectors
                $query->where('status', 'pending')
                      ->whereNull('collector_id');
            })
            ->with(['citizen', 'collector'])
            ->orderBy('created_at', 'desc')
            ->get();

        return CollectionResource::collection($collections);
    }

    /**
     * Get completed collections history for collector
     */
    public function collectorHistory()
    {
        $user = Auth::user();
        
        $collections = Collection::where('collector_id', $user->id)
            ->where('status', 'completed')
            ->with(['citizen', 'collector'])
            ->orderBy('completed_at', 'desc')
            ->get();

        return CollectionResource::collection($collections);
    }

    /**
     * Create a new collection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'waste_type' => 'required|string',
            'quantity' => 'required|string',
            'location_lat' => 'required|numeric',
            'location_lng' => 'required|numeric',
            'location_address' => 'required|string',
            'amount' => 'nullable|numeric',
        ]);

        $user = Auth::user();

        $collection = Collection::create([
            'citizen_id' => $user->id,
            'citizen_name' => $user->name,
            'waste_type' => $validated['waste_type'],
            'quantity' => $validated['quantity'],
            'status' => 'pending',
            'location_lat' => $validated['location_lat'],
            'location_lng' => $validated['location_lng'],
            'location_address' => $validated['location_address'],
            'amount' => $validated['amount'] ?? null,
        ]);

        return new CollectionResource($collection);
    }

    /**
     * Update collection status
     */
    public function update(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,accepted,in_progress,completed,cancelled',
            'collector_id' => 'sometimes|exists:users,id',
        ]);

        if (isset($validated['status'])) {
            $collection->status = $validated['status'];
            
            if ($validated['status'] === 'completed') {
                $collection->completed_at = now();
            }
        }

        if (isset($validated['collector_id'])) {
            $collection->collector_id = $validated['collector_id'];
            $collector = \App\Models\User::find($validated['collector_id']);
            $collection->collector_name = $collector->company_name ?? $collector->name;
        }

        $collection->save();

        return new CollectionResource($collection);
    }

    /**
     * Accept a collection request (collector only)
     */
    public function accept($id)
    {
        $user = Auth::user();
        
        if ($user->role !== 'collector') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $collection = Collection::findOrFail($id);
        
        if ($collection->status !== 'pending') {
            return response()->json(['message' => 'Collection is not pending'], 400);
        }

        $collection->status = 'accepted';
        $collection->collector_id = $user->id;
        $collection->collector_name = $user->company_name ?? $user->name;
        $collection->save();

        return new CollectionResource($collection);
    }

    /**
     * Reject a collection request (collector only)
     */
    public function reject($id)
    {
        $user = Auth::user();
        
        if ($user->role !== 'collector') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $collection = Collection::findOrFail($id);
        
        if ($collection->status !== 'pending') {
            return response()->json(['message' => 'Collection is not pending'], 400);
        }

        $collection->status = 'cancelled';
        $collection->save();

        return new CollectionResource($collection);
    }

    /**
     * Start collection (collector only - move to in_progress)
     */
    public function start($id)
    {
        $user = Auth::user();
        
        if ($user->role !== 'collector') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $collection = Collection::findOrFail($id);
        
        if ($collection->collector_id !== $user->id) {
            return response()->json(['message' => 'Not your collection'], 403);
        }

        if ($collection->status !== 'accepted') {
            return response()->json(['message' => 'Collection must be accepted first'], 400);
        }

        $collection->status = 'in_progress';
        $collection->save();

        return new CollectionResource($collection);
    }
}
