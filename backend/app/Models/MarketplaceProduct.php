<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketplaceProduct extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'seller_id',
        'seller_name',
        'seller_type',
        'product_type',
        'name',
        'description',
        'image_url',
        'image_urls',
        'quantity',
        'unit',
        'price_per_unit',
        'available',
    ];

    protected function casts(): array
    {
        return [
            'image_urls' => 'array',
            'quantity' => 'integer',
            'price_per_unit' => 'decimal:2',
            'available' => 'boolean',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
