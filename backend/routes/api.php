<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\RentalItemController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\StockLogController;

use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\CriterionController;
use App\Http\Controllers\Api\CriterionComparisonController;
use App\Http\Controllers\Api\SupplierEvaluationController;
use App\Http\Controllers\Api\AhpController;
use App\Http\Controllers\Api\ProphetController;
use App\Http\Controllers\Api\AnalyticsController;

// Public Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected Routes (Wajib Bawa Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::post('/transactions/{id}/return', [TransactionController::class, 'returnRental']); // Endpoint pengembalian sewa

    // Master Data
    Route::apiResource('products', ProductController::class);
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('rental-items', RentalItemController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('stock-logs', StockLogController::class)->only(['index', 'store']);

    // DSS AHP Master Data
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('criteria', CriterionController::class);

    // DSS AHP Routes
    Route::post('ahp/calculate', [AhpController::class, 'triggerCalculation']);
    Route::get('ahp/recommendations', [AhpController::class, 'recommendations']);

    // Prophet Routes
    Route::post('prophet/predict', [ProphetController::class, 'triggerPrediction']);
    Route::get('prophet/predictions', [ProphetController::class, 'predictions']);

    // DSS AHP Matrix & Evaluation Data (Bulk Operations)
    Route::get('criterion-comparisons', [CriterionComparisonController::class, 'index']);
    Route::post('criterion-comparisons/bulk', [CriterionComparisonController::class, 'storeBulk']);

    Route::get('supplier-evaluations', [SupplierEvaluationController::class, 'index']);
    Route::post('supplier-evaluations/bulk', [SupplierEvaluationController::class, 'storeBulk']);

    // DSS AHP Trigger
    Route::post('ahp/calculate', [AhpController::class, 'triggerCalculation']);

    // Analytics & Reports
    Route::prefix('analytics')->group(function () {
        Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/rfm', [AnalyticsController::class, 'rfm']);
        Route::get('/cohort', [AnalyticsController::class, 'cohort']);
    });
});
