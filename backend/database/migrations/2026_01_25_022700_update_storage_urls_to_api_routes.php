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
                'avatar' => DB::raw("REPLACE(avatar, '/storage/', '/api/storage/')")
            ]);

        // Update chat_messages table - convert media URLs
        DB::table('chat_messages')
            ->whereNotNull('media_url')
            ->where('media_url', 'like', '%/storage/%')
            ->where('media_url', 'not like', '%/api/storage/%')
            ->update([
                'media_url' => DB::raw("REPLACE(media_url, '/storage/', '/api/storage/')")
            ]);

        // Update marketplace_products table - convert image URLs (both image_url and image_urls)
        DB::table('marketplace_products')
            ->whereNotNull('image_url')
            ->where('image_url', 'like', '%/storage/%')
            ->where('image_url', 'not like', '%/api/storage/%')
            ->update([
                'image_url' => DB::raw("REPLACE(image_url, '/storage/', '/api/storage/')")
            ]);

        DB::table('marketplace_products')
            ->whereNotNull('image_urls')
            ->where('image_urls', 'like', '%/storage/%')
            ->where('image_urls', 'not like', '%/api/storage/%')
            ->update([
                'image_urls' => DB::raw("REPLACE(image_urls, '/storage/', '/api/storage/')")
            ]);
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
                'avatar' => DB::raw("REPLACE(avatar, '/api/storage/', '/storage/')")
            ]);

        // Revert chat_messages table
        DB::table('chat_messages')
            ->whereNotNull('media_url')
            ->where('media_url', 'like', '%/api/storage/%')
            ->update([
                'media_url' => DB::raw("REPLACE(media_url, '/api/storage/', '/storage/')")
            ]);

        // Revert marketplace_products table
        DB::table('marketplace_products')
            ->whereNotNull('image_url')
            ->where('image_url', 'like', '%/api/storage/%')
            ->update([
                'image_url' => DB::raw("REPLACE(image_url, '/api/storage/', '/storage/')")
            ]);

        DB::table('marketplace_products')
            ->whereNotNull('image_urls')
            ->where('image_urls', 'like', '%/api/storage/%')
            ->update([
                'image_urls' => DB::raw("REPLACE(image_urls, '/api/storage/', '/storage/')")
            ]);
    }
};
