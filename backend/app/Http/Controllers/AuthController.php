<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|unique:users,phone',
            'password' => 'required|string|min:6',
            'name' => 'required|string|max:255',
            'role' => 'required|in:citizen,collector,recycler',
            'neighborhood' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'responsible_name' => 'nullable|string|max:255',
        ]);

        try {
            $user = User::create([
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'name' => $validated['name'],
                'role' => $validated['role'],
                'neighborhood' => $validated['neighborhood'],
                'company_name' => $validated['company_name'] ?? null,
                'responsible_name' => $validated['responsible_name'] ?? null,
                'wallet' => 0,
                'review_count' => 0,
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => new \App\Http\Resources\UserResource($user),
                'token' => $token,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Register failed', [
                'error' => $e->getMessage(),
                'phone' => $validated['phone'] ?? null,
                'role' => $validated['role'] ?? null,
            ]);

            return response()->json([
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['phone' => $validated['phone'], 'password' => $validated['password']])) {
            throw ValidationException::withMessages([
                'phone' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        try {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => new \App\Http\Resources\UserResource($user),
                'token' => $token,
            ]);
        } catch (\Throwable $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'phone' => $validated['phone'] ?? null,
            ]);

            return response()->json([
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json(new \App\Http\Resources\UserResource($request->user()));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // 1. Validation Intelligente
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // CRUCIAL : On autorise le téléphone actuel de l'utilisateur
            'phone' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('users')->ignore($user->id),
            ],
            'neighborhood' => 'nullable|string|max:255',
            // On accepte les deux formats (camelCase du front ou snake_case)
            'companyName' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'responsibleName' => 'nullable|string|max:255',
            'responsible_name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string',
        ]);

        // 2. Mapping Manuel (Front camelCase -> DB snake_case)
        $updateData = [];
        
        if ($request->has('name')) $updateData['name'] = $request->name;
        if ($request->has('phone')) $updateData['phone'] = $request->phone;
        if ($request->has('neighborhood')) $updateData['neighborhood'] = $request->neighborhood;
        
        // Gestion des champs entreprise
        if ($request->has('companyName')) $updateData['company_name'] = $request->companyName;
        elseif ($request->has('company_name')) $updateData['company_name'] = $request->company_name;

        if ($request->has('responsibleName')) $updateData['responsible_name'] = $request->responsibleName;
        elseif ($request->has('responsible_name')) $updateData['responsible_name'] = $request->responsible_name;

        // GESTION AVATAR (Base64 -> Fichier ou URL directe)
        if ($request->has('avatar') && $request->avatar) {
            // Si c'est une nouvelle image en base64 (commence par data:image)
            if (preg_match('/^data:image\/(\w+);base64,/', $request->avatar, $type)) {
                // 1. Décoder l'image
                $data = substr($request->avatar, strpos($request->avatar, ',') + 1);
                $data = base64_decode($data);
                
                // 2. Générer un nom unique
                $extension = strtolower($type[1]); // jpg, png, gif
                if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                    throw new \Exception('Format d\'image non supporté');
                }
                $filename = 'avatars/user_' . $user->id . '_' . time() . '.' . $extension;
                
                // 3. Sauvegarder sur le disque 'public'
                Storage::disk('public')->put($filename, $data);
                
                // 4. Mettre à jour le chemin dans la BDD (URL absolue avec API route pour CORS)
                $updateData['avatar'] = url('api/storage/' . $filename);
            } 
            // Si c'est une URL directe (déjà uploadée), on l'utilise directement
            elseif (filter_var($request->avatar, FILTER_VALIDATE_URL)) {
                $updateData['avatar'] = $request->avatar;
            }
        }

        // 3. Mise à jour
        $user->update($updateData);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }
}
