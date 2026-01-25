<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', \Illuminate\Http\Middleware\HandleCors::class])->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });
});
