<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

class RentalItem extends Model
{
    use SoftDeletes, BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'serial_number',
        'name',
        'category',
        'daily_rate',
        'deposit_amount',
        'status' // 'available', 'rented', 'maintenance'
    ];

    // Relasi Polimorfik ke Item Transaksi[cite: 4]
    public function transactionItems()
    {
        return $this->morphMany(TransactionItem::class, 'itemable');
    }
}
