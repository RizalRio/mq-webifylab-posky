<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

class Service extends Model
{
    use SoftDeletes, BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'name',
        'description',
        'duration_minutes',
        'price'
    ];

    // Relasi Polimorfik ke Item Transaksi[cite: 4]
    public function transactionItems()
    {
        return $this->morphMany(TransactionItem::class, 'itemable');
    }
}
