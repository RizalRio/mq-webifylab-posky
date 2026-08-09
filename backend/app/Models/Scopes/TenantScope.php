<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        // Nantinya kita akan ambil tenant_id dari session atau middleware Auth
        if (auth()->check()) {
            $builder->where('tenant_id', auth()->user()->tenant_id);
        }
    }
}