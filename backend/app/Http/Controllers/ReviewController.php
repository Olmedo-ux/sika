<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Get reviews received by the authenticated user
     */
    public function received()
    {
        $user = Auth::user();
        
        $reviews = Review::where('to_user_id', $user->id)
            ->with(['fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReviewResource::collection($reviews);
    }

    /**
     * Get reviews given by the authenticated user
     */
    public function given()
    {
        $user = Auth::user();
        
        $reviews = Review::where('from_user_id', $user->id)
            ->with(['fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->get();

        return ReviewResource::collection($reviews);
    }

    /**
     * Create a new review
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'badges' => 'nullable|array',
            'comment' => 'nullable|string',
        ]);

        $user = Auth::user();

        $review = Review::create([
            'from_user_id' => $user->id,
            'from_user_name' => $user->name,
            'to_user_id' => $validated['to_user_id'],
            'rating' => $validated['rating'],
            'badges' => $validated['badges'] ?? [],
            'comment' => $validated['comment'] ?? null,
        ]);

        // Update the recipient's average rating
        $this->updateUserRating($validated['to_user_id']);

        return new ReviewResource($review);
    }

    /**
     * Update user's average rating and review count
     */
    private function updateUserRating($userId)
    {
        $user = \App\Models\User::find($userId);
        
        $reviews = Review::where('to_user_id', $userId)->get();
        $averageRating = $reviews->avg('rating');
        $reviewCount = $reviews->count();

        $user->rating = round($averageRating, 1);
        $user->review_count = $reviewCount;
        $user->save();
    }
}
