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

    public function transactionItem()
    {
        return $this->belongsTo(TransactionItem::class, 'transaction_item_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
