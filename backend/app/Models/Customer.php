<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\BelongsToTenant;

class Customer extends Model
{
    use SoftDeletes, BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'name',
        'phone',
        'email',
        'address'
    ];

    // Relasi ke Transaksi
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
