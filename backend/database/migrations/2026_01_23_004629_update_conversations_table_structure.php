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
        Schema::table('conversations', function (Blueprint $table) {
            // Ajouter les nouvelles colonnes
            $table->uuid('user1_id')->nullable()->after('id');
            $table->uuid('user2_id')->nullable()->after('user1_id');
            
            // Ajouter les clés étrangères
            $table->foreign('user1_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user2_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Supprimer les anciennes colonnes
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['participants', 'participant_names', 'last_message', 'last_message_time', 'unread_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Restaurer les anciennes colonnes
            $table->json('participants');
            $table->json('participant_names');
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_time')->nullable();
            $table->integer('unread_count')->default(0);
            
            // Supprimer les nouvelles colonnes
            $table->dropForeign(['user1_id']);
            $table->dropForeign(['user2_id']);
            $table->dropColumn(['user1_id', 'user2_id']);
        });
    }
};
