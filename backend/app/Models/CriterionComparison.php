<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToTenant;

class CriterionComparison extends Model
{
    use BelongsToTenant;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'tenant_id',
        'criterion_id_1',
        'criterion_id_2',
        'value'
    ];

    // Relasi ke tabel criteria
    public function criterion1()
    {
        return $this->belongsTo(Criterion::class, 'criterion_id_1');
    }

    public function criterion2()
    {
        return $this->belongsTo(Criterion::class, 'criterion_id_2');
    }
}
