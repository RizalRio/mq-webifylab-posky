<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Tambahkan jika pakai soft deletes

class Tenant extends Model
{
    use SoftDeletes; // Aktifkan soft deletes sesuai migrasi

    // 1. Matikan auto-increment karena kita pakai UUID
    public $incrementing = false;

    // 2. Set tipe primary key menjadi string
    protected $keyType = 'string';

    // 3. Daftarkan kolom yang boleh diisi
    protected $fillable = [
        'id',
        'name',
        'subdomain',
        'business_type',
    ];
}
