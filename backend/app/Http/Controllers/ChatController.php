<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user
     */
    public function getConversations()
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('user1_id', $user->id)
            ->orWhere('user2_id', $user->id)
            ->with(['user1', 'user2', 'lastMessage'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($conversations->map(function ($conversation) use ($user) {
            $otherUser = $conversation->user1_id === $user->id 
                ? $conversation->user2 
                : $conversation->user1;

            return [
                'id' => $conversation->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'role' => $otherUser->role,
                    'company_name' => $otherUser->company_name,
                    'responsible_name' => $otherUser->responsible_name,
                    'avatar' => $otherUser->avatar,
                    'phone' => $otherUser->phone,
                ],
                'last_message' => $conversation->lastMessage ? [
                    'content' => $conversation->lastMessage->content,
                    'created_at' => $conversation->lastMessage->created_at,
                    'sender_id' => $conversation->lastMessage->sender_id,
                ] : null,
                'unread_count' => $conversation->messages()
                    ->where('sender_id', '!=', $user->id)
                    ->where('seen', false)
                    ->count(),
                'updated_at' => $conversation->updated_at,
            ];
        }));
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages($conversationId)
    {
        $user = Auth::user();
        
        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->firstOrFail();

        // Mark messages as seen
        ChatMessage::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('seen', false)
            ->update(['seen' => true]);

        $messages = ChatMessage::where('conversation_id', $conversationId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages->map(function ($message) {
            return [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'content' => $message->content,
                'media_type' => $message->media_type ?? 'text',
                'media_url' => $message->media_url,
                'seen' => $message->seen,
                'created_at' => $message->created_at,
            ];
        }));
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'content' => 'nullable|string|max:1000',
            'media_type' => 'nullable|in:text,image,audio',
            'media' => 'nullable|file|mimes:jpeg,jpg,png,gif,mp3,wav,ogg,webm|max:10240', // 10MB max
        ]);

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->firstOrFail();

        $mediaUrl = null;
        $mediaType = $validated['media_type'] ?? 'text';

        // Handle file upload
        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('chat_media', $fileName, 'public');
            $mediaUrl = url('api/storage/' . $path);
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'sender_name' => $user->name,
            'content' => $validated['content'] ?? '',
            'media_type' => $mediaType,
            'media_url' => $mediaUrl,
            'seen' => false,
        ]);

        // Update conversation timestamp
        $conversation->touch();

        return response()->json([
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $user->name,
            'content' => $message->content,
            'media_type' => $message->media_type,
            'media_url' => $message->media_url,
            'seen' => $message->seen,
            'created_at' => $message->created_at,
        ], 201);
    }

    /**
     * Create or get a conversation with another user
     */
    public function createConversation(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'other_user_id' => 'required|exists:users,id',
        ]);

        $otherUserId = $validated['other_user_id'];

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($user, $otherUserId) {
            $query->where('user1_id', $user->id)->where('user2_id', $otherUserId);
        })->orWhere(function ($query) use ($user, $otherUserId) {
            $query->where('user1_id', $otherUserId)->where('user2_id', $user->id);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user1_id' => $user->id,
                'user2_id' => $otherUserId,
            ]);
        }

        $otherUser = \App\Models\User::findOrFail($otherUserId);

        return response()->json([
            'id' => $conversation->id,
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'role' => $otherUser->role,
                'company_name' => $otherUser->company_name,
            ],
            'created_at' => $conversation->created_at,
        ], 201);
    }
}
