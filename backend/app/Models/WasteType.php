<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WasteType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'icon',
        'price_per_kg',
        'recyclable',
    ];

    protected function casts(): array
    {
        return [
            'price_per_kg' => 'decimal:2',
            'recyclable' => 'boolean',
        ];
    }
}
