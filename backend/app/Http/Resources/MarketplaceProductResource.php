<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MarketplaceProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Helper function to ensure full URL
        $makeFullUrl = function($url) {
            if (!$url) return null;
            // Si l'URL commence par http, elle est déjà complète
            if (str_starts_with($url, 'http')) return $url;
            // Sinon, ajouter le domaine
            return url($url);
        };

        return [
            'id' => $this->id,
            'sellerId' => $this->seller_id,
            'sellerName' => $this->seller?->company_name ?? $this->seller?->name,
            'sellerType' => 'recycler',
            'productType' => $this->product_type,
            'name' => $this->name,
            'description' => $this->description,
            'imageUrl' => $makeFullUrl($this->image_url),
            'imageUrls' => $this->image_urls ? array_map($makeFullUrl, $this->image_urls) : null,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'pricePerUnit' => (float) $this->price_per_unit,
            'available' => (bool) $this->available,
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
