<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to users table for frequently queried fields
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('email');
        });

        // Add indexes to collections table for performance
        Schema::table('collections', function (Blueprint $table) {
            $table->index('status');
            $table->index('citizen_id');
            $table->index('collector_id');
            $table->index(['status', 'citizen_id']);
            $table->index(['status', 'collector_id']);
            $table->index('completed_at');
        });

        // Add indexes to marketplace_products table
        Schema::table('marketplace_products', function (Blueprint $table) {
            $table->index('seller_id');
            $table->index('available');
            $table->index(['available', 'seller_id']);
        });

        // Add indexes to reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('reviewer_id');
            $table->index('reviewed_id');
        });

        // Add indexes to chat_messages table
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index('sender_id');
            $table->index('created_at');
        });

        // Add indexes to conversations table
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('user1_id');
            $table->index('user2_id');
            $table->index('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['email']);
        });

        Schema::table('collections', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['citizen_id']);
            $table->dropIndex(['collector_id']);
            $table->dropIndex(['status', 'citizen_id']);
            $table->dropIndex(['status', 'collector_id']);
            $table->dropIndex(['completed_at']);
        });

        Schema::table('marketplace_products', function (Blueprint $table) {
            $table->dropIndex(['seller_id']);
            $table->dropIndex(['available']);
            $table->dropIndex(['available', 'seller_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['reviewer_id']);
            $table->dropIndex(['reviewed_id']);
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropIndex(['conversation_id']);
            $table->dropIndex(['sender_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['user1_id']);
            $table->dropIndex(['user2_id']);
            $table->dropIndex(['updated_at']);
        });
    }
};
