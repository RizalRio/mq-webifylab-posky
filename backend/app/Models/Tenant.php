<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'subdomain',
        'business_type',
        'phone',
        'address',
        'tax_percentage',
        'receipt_footer',
        'default_discount',
    ];
}
