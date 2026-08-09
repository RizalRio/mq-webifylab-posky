<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceSchedule extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'transaction_item_id',
        'technician_id',
        'scheduled_start',
        'scheduled_end',
        'status'
    ];
}
