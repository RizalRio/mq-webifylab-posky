<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis; // Tambahkan ini

class ProcessAHPRecommendation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tenantId;

    public function __construct($tenantId)
    {
        $this->tenantId = $tenantId;
    }

    public function handle(): void
    {
        // Format pesan sederhana yang universal
        $payload = json_encode([
            'tenant_id' => $this->tenantId,
            'timestamp' => now()->toIso8601String()
        ]);

        // Mendorong pesan ke antrean Redis dengan nama kunci "posky:ahp_tasks"
        // lpush (Left Push) memasukkan data dari kiri
        Redis::lpush('posky:ahp_tasks', $payload);

        Log::info("Tugas AHP untuk Tenant {$this->tenantId} telah dikirim ke Worker Python melalui Redis.");
    }
}
