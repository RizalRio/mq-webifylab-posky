<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RentalItemController extends Controller
{
    public function index(Request $request)
    {
        $query = RentalItem::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                    ->orWhere('serial_number', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status); // available, rented, maintenance
        }

        $rentalItems = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $rentalItems->items(),
            'meta' => [
                'page' => $rentalItems->currentPage(),
                'per_page' => $rentalItems->perPage(),
                'total' => $rentalItems->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'serial_number' => [
                'required',
                'string',
                Rule::unique('rental_items')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })
            ],
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'daily_rate' => 'required|numeric|min:0',
            'deposit_amount' => 'required|numeric|min:0',
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['status'] = 'available'; // Default status[cite: 1]

        $rentalItem = RentalItem::create($validated);

        return response()->json([
            'success' => true,
            'data' => $rentalItem
        ], 201);
    }

    public function show($id)
    {
        $rentalItem = RentalItem::findOrFail($id);
        return response()->json(['success' => true, 'data' => $rentalItem]);
    }

    public function update(Request $request, $id)
    {
        $rentalItem = RentalItem::findOrFail($id);
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'serial_number' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('rental_items')->where(function ($query) use ($tenantId) {
                    return $query->where('tenant_id', $tenantId);
                })->ignore($rentalItem->id)
            ],
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'daily_rate' => 'sometimes|required|numeric|min:0',
            'deposit_amount' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|in:available,rented,maintenance',
        ]);

        $rentalItem->update($validated);
        return response()->json(['success' => true, 'data' => $rentalItem]);
    }

    public function destroy($id)
    {
        $rentalItem = RentalItem::findOrFail($id);

        if ($rentalItem->transactionItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Rental item has transactions, cannot delete'
            ], 409);
        }

        $rentalItem->delete();
        return response()->json(['success' => true, 'message' => 'Rental item deleted successfully']);
    }
}
