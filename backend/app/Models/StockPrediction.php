<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class StockPrediction extends Model
{
    use BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'product_id',
        'estimated_stockout_date',
        'safety_stock_level',
        'confidence_score',
        'last_calculated_at'
    ];

    // Relasi ke tabel products
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
