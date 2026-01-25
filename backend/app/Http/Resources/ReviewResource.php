<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'fromUserId' => $this->from_user_id,
            'fromUserName' => $this->fromUser?->name,
            'toUserId' => $this->to_user_id,
            'rating' => $this->rating,
            'badges' => $this->badges ?? [],
            'comment' => $this->comment,
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
