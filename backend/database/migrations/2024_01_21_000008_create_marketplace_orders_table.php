<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->uuid('buyer_id');
            $table->uuid('seller_id');
            $table->string('product_name');
            $table->enum('product_type', ['raw_material', 'finished_product']);
            $table->integer('quantity');
            $table->string('unit')->default('kg');
            $table->decimal('price_per_unit', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->text('buyer_message')->nullable();
            $table->string('buyer_phone')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('marketplace_products')->onDelete('cascade');
            $table->foreign('buyer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('seller_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_orders');
    }
};
