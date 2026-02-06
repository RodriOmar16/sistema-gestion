<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPermiso extends Model
{
    protected $primaryKey = 'user_permiso_id';
    protected $fillable = ['user_id', 'permiso_id'];

    public $timestamps = false;

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function permiso()
    {
        return $this->belongsTo(Permiso::class, 'permiso_id');
    }
}
