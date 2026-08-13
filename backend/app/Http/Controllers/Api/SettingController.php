<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;

class SettingController extends Controller
{
    /**
     * GET /settings
     * Mengambil konfigurasi toko tenant yang sedang login
     */
    public function show(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $tenant = Tenant::findOrFail($tenantId);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'business_type' => $tenant->business_type,
                'phone' => $tenant->phone,
                'address' => $tenant->address,
                'tax_percentage' => (float) ($tenant->tax_percentage ?? 11.00),
                'receipt_footer' => $tenant->receipt_footer ?? "Terima kasih telah berbelanja!",
                'default_discount' => (float) ($tenant->default_discount ?? 0.00),
            ]
        ]);
    }

    /**
     * PUT /settings
     * Memperbarui data konfigurasi toko tenant
     */
    public function update(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $tenant = Tenant::findOrFail($tenantId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tax_percentage' => 'sometimes|required|numeric|min:0|max:100',
            'receipt_footer' => 'nullable|string|max:500',
            'default_discount' => 'sometimes|required|numeric|min:0',
        ]);

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan toko berhasil diperbarui.',
            'data' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'business_type' => $tenant->business_type,
                'phone' => $tenant->phone,
                'address' => $tenant->address,
                'tax_percentage' => (float) $tenant->tax_percentage,
                'receipt_footer' => $tenant->receipt_footer,
                'default_discount' => (float) $tenant->default_discount,
            ]
        ]);
    }
}
