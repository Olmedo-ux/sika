<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectionResource extends JsonResource
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
            'citizenId' => $this->citizen_id,
            'citizenName' => $this->citizen_name ?? $this->citizen?->name,
            'collectorId' => $this->collector_id,
            'collectorName' => $this->collector_name ?? $this->collector?->company_name ?? $this->collector?->name,
            'wasteType' => $this->waste_type,
            'quantity' => $this->quantity,
            'status' => $this->status,
            'location' => [
                'lat' => (float) $this->location_lat,
                'lng' => (float) $this->location_lng,
                'address' => $this->location_address,
            ],
            'createdAt' => $this->created_at->toISOString(),
            'completedAt' => $this->completed_at?->toISOString(),
            'amount' => $this->amount ? (float) $this->amount : null,
            'hasRated' => $this->hasRatedCollector(),
        ];
    }

    /**
     * Check if the citizen has rated the collector for this collection
     */
    private function hasRatedCollector(): bool
    {
        if (!$this->collector_id || !$this->citizen_id) {
            return false;
        }

        return \App\Models\Review::where('from_user_id', $this->citizen_id)
            ->where('to_user_id', $this->collector_id)
            ->exists();
    }
}
