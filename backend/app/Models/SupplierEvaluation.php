<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class SupplierEvaluation extends Model
{
    use BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'supplier_id',
        'criterion_id',
        'raw_value'
    ];

    // Relasi ke tabel suppliers dan criteria
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function criterion()
    {
        return $this->belongsTo(Criterion::class);
    }
}
