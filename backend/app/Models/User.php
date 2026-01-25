<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasUuids, HasApiTokens;

    protected $fillable = [
        'phone',
        'password',
        'name',
        'role',
        'neighborhood',
        'location_lat',
        'location_lng',
        'avatar',
        'rating',
        'review_count',
        'badges',
        'wallet',
        'company_name',
        'responsible_name',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'badges' => 'array',
            'rating' => 'decimal:2',
            'wallet' => 'decimal:2',
            'review_count' => 'integer',
        ];
    }

    public function collectionsAsCitizen(): HasMany
    {
        return $this->hasMany(Collection::class, 'citizen_id');
    }

    public function collectionsAsCollector(): HasMany
    {
        return $this->hasMany(Collection::class, 'collector_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'from_user_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'to_user_id');
    }

    public function marketplaceProducts(): HasMany
    {
        return $this->hasMany(MarketplaceProduct::class, 'seller_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'recycler_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    public function username(): string
    {
        return 'phone';
    }
}
