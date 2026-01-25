<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketplaceOrder extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'buyer_id',
        'seller_id',
        'product_name',
        'product_type',
        'quantity',
        'unit',
        'price_per_unit',
        'total_amount',
        'buyer_message',
        'buyer_phone',
        'status',
        'accepted_at',
        'completed_at',
    ];

    protected $casts = [
        'price_per_unit' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(MarketplaceProduct::class, 'product_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
