<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class Transaction extends Model
{
    use BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'customer_id',
        'cashier_id',
        'type', // 'sale', 'service', 'rental', 'mixed'
        'subtotal',
        'discount',
        'tax',
        'total_amount',
        'payment_method',
        'status' // 'completed', 'pending', dll
    ];

    // Relasi One-to-Many ke Detail Item[cite: 4]
    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // Relasi ke Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    // Relasi ke User (Kasir)
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
