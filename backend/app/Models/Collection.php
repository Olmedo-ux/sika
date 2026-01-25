<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Collection extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'citizen_id',
        'citizen_name',
        'collector_id',
        'collector_name',
        'waste_type',
        'quantity',
        'status',
        'location_lat',
        'location_lng',
        'location_address',
        'amount',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'location_lat' => 'decimal:8',
            'location_lng' => 'decimal:8',
            'amount' => 'decimal:2',
            'completed_at' => 'datetime',
        ];
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'citizen_id');
    }

    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collector_id');
    }
}
