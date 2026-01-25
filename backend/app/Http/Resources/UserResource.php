<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'phone' => $this->phone,
            'name' => $this->name,
            'role' => $this->role,
            'neighborhood' => $this->neighborhood,
            'avatar' => $this->avatar,
            'rating' => $this->rating ? (float) $this->rating : null,
            'reviewCount' => $this->review_count,
            'badges' => $this->badges ?? [],
            'wallet' => $this->wallet ? (float) $this->wallet : 0,
            'companyName' => $this->company_name,
            'responsibleName' => $this->responsible_name,
        ];
    }
}
