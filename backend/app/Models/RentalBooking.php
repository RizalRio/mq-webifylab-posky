<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RentalBooking extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'transaction_item_id',
        'rental_item_id',
        'start_date',
        'end_date',
        'actual_return_date',
        'late_fee'
    ];
}
