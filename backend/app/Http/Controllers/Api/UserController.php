<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Menampilkan daftar staf di dalam satu tenant.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        
        $users = User::where('tenant_id', $tenantId)
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Menambahkan akun staf baru.
     */
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        // Hanya ADMIN yang bisa menambah staf (Bisa ditambahkan validasi di Middleware juga)
        if (strtoupper($request->user()->role) !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized. Only ADMIN can add staff.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users') // Email unik global di tabel users
            ],
            'password' => 'required|string|min:6',
            'role' => ['required', 'string', Rule::in(['admin', 'manajer', 'kasir'])],
        ]);

        $user = User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => strtolower($validated['role']),
        ]);

        return response()->json([
            'success' => true,
            'data' => $user
        ], 201);
    }

    /**
     * Memperbarui data staf.
     */
    public function update(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        if (strtoupper($request->user()->role) !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized. Only ADMIN can update staff.'], 403);
        }

        $user = User::where('id', $id)->where('tenant_id', $tenantId)->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => ['sometimes', 'required', 'string', Rule::in(['admin', 'manajer', 'kasir'])],
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }
        if (isset($validated['role'])) {
            $user->role = strtolower($validated['role']);
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Menghapus akun staf.
     */
    public function destroy(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;

        if (strtoupper($request->user()->role) !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized. Only ADMIN can delete staff.'], 403);
        }

        // Cegah admin menghapus dirinya sendiri
        if ($request->user()->id === $id) {
            return response()->json(['message' => 'Cannot delete your own account.'], 400);
        }

        $user = User::where('id', $id)->where('tenant_id', $tenantId)->firstOrFail();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff deleted successfully'
        ]);
    }
}
