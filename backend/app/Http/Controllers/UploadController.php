<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload an image file
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        try {
            $image = $request->file('image');
            
            // Generate unique filename
            $filename = time() . '-' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // Store in public/storage/images
            $path = $image->storeAs('images', $filename, 'public');
            
            // Return the full public URL with API route for CORS
            $url = url('api/storage/' . $path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de l\'image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
