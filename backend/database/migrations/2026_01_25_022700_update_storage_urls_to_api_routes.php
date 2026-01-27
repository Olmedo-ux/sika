<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update users table - convert old /storage/ URLs to /api/storage/
        DB::table('users')
            ->whereNotNull('avatar')
            ->where('avatar', 'like', '%/storage/%')
            ->where('avatar', 'not like', '%/api/storage/%')
            ->update([
                'avatar' => DB::raw("REPLACE(avatar::text, '/storage/', '/api/storage/')")
            ]);

        // Update chat_messages table - convert media URLs
        DB::table('chat_messages')
            ->whereNotNull('media_url')
            ->where('media_url', 'like', '%/storage/%')
            ->where('media_url', 'not like', '%/api/storage/%')
            ->update([
                'media_url' => DB::raw("REPLACE(media_url::text, '/storage/', '/api/storage/')")
            ]);

        // Update marketplace_products table - convert image URLs (both image_url and image_urls)
        DB::table('marketplace_products')
            ->whereNotNull('image_url')
            ->where('image_url', 'like', '%/storage/%')
            ->where('image_url', 'not like', '%/api/storage/%')
            ->update([
                'image_url' => DB::raw("REPLACE(image_url::text, '/storage/', '/api/storage/')")
            ]);

        // Skip image_urls JSON field update - handle at application level if needed
        // PostgreSQL JSON manipulation requires different approach
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert users table
        DB::table('users')
            ->whereNotNull('avatar')
            ->where('avatar', 'like', '%/api/storage/%')
            ->update([
                'avatar' => DB::raw("REPLACE(avatar::text, '/api/storage/', '/storage/')")
            ]);

        // Revert chat_messages table
        DB::table('chat_messages')
            ->whereNotNull('media_url')
            ->where('media_url', 'like', '%/api/storage/%')
            ->update([
                'media_url' => DB::raw("REPLACE(media_url::text, '/api/storage/', '/storage/')")
            ]);

        // Revert marketplace_products table
        DB::table('marketplace_products')
            ->whereNotNull('image_url')
            ->where('image_url', 'like', '%/api/storage/%')
            ->update([
                'image_url' => DB::raw("REPLACE(image_url::text, '/api/storage/', '/storage/')")
            ]);

        // Skip image_urls JSON field revert
    }
};
