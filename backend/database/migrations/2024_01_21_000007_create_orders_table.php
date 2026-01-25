<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('recycler_id');
            $table->string('waste_type');
            $table->integer('target_quantity');
            $table->integer('collected_quantity')->default(0);
            $table->enum('status', ['in_progress', 'completed'])->default('in_progress');
            $table->timestamps();
            
            $table->foreign('recycler_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
