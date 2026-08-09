<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant; // Pastikan Trait ini di-import

class Product extends Model
{
    use SoftDeletes, BelongsToTenant; // Aktifkan Trait Multi-Tenancy

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'sku',
        'name',
        'category',
        'stock',
        'min_stock_threshold',
        'cost_price',
        'sell_price'
    ];

    public function transactionItems()
    {
        return $this->morphMany(TransactionItem::class, 'itemable');
    }
}
