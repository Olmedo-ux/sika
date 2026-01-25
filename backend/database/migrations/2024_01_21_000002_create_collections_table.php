<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('citizen_id');
            $table->string('citizen_name');
            $table->uuid('collector_id')->nullable();
            $table->string('collector_name')->nullable();
            $table->string('waste_type');
            $table->string('quantity');
            $table->enum('status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->decimal('location_lat', 10, 8);
            $table->decimal('location_lng', 11, 8);
            $table->string('location_address');
            $table->decimal('amount', 10, 2)->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->foreign('citizen_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('collector_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
