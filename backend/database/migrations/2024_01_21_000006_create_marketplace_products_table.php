<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seller_id');
            $table->string('seller_name');
            $table->enum('seller_type', ['recycler'])->default('recycler');
            $table->string('product_type');
            $table->string('name');
            $table->text('description');
            $table->string('image_url')->nullable();
            $table->json('image_urls')->nullable();
            $table->integer('quantity');
            $table->string('unit');
            $table->decimal('price_per_unit', 10, 2);
            $table->boolean('available')->default(true);
            $table->timestamps();
            
            $table->foreign('seller_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_products');
    }
};
