<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'transaction_id',
        'itemable_type',
        'itemable_id',
        'quantity',
        'unit_price',
        'subtotal'
    ];

    public function itemable()
    {
        return $this->morphTo();
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function rentalBooking()
    {
        return $this->hasOne(RentalBooking::class, 'transaction_item_id');
    }

    public function serviceSchedule()
    {
        return $this->hasOne(ServiceSchedule::class, 'transaction_item_id');
    }
}
