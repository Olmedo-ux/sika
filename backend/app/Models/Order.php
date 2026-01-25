<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'recycler_id',
        'waste_type',
        'target_quantity',
        'collected_quantity',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'target_quantity' => 'integer',
            'collected_quantity' => 'integer',
        ];
    }

    public function recycler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recycler_id');
    }
}
