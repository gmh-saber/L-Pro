<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BdCourierService
{
    private const BASE_URL = 'https://api.bdcourier.com';
    private const TIMEOUT  = 12; // seconds — fail-open on timeout

    private string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? (string) setting('fog_bdcourier_api_key', '');
    }

    /**
     * Check a phone number against BD Courier fraud database.
     * Returns null on failure (API unreachable, key missing, etc.)
     */
    public function check(string $phone): ?array
    {
        if (empty($this->apiKey)) {
            return null;
        }

        // Normalize phone
        $phone = preg_replace('/^(?:\+?88)/', '', trim($phone));

        try {
            $response = Http::timeout(self::TIMEOUT)
                ->withToken($this->apiKey)
                ->post(self::BASE_URL . '/courier-check', [
                    'phone' => $phone,
                ]);

            if ($response->failed()) {
                Log::warning('BD Courier API error', [
                    'status' => $response->status(),
                    'phone'  => $phone,
                ]);
                return null;
            }

            $json = $response->json();

            if (($json['status'] ?? '') !== 'success') {
                return null;
            }

            // Attach convenience fields
            $json['_phone']      = $phone;
            $json['_risk_level'] = $json['risk_verdict']['level'] ?? 'unknown';
            $json['_risk_label'] = $json['risk_verdict']['label'] ?? 'Unknown';
            $json['_risk_color'] = $this->riskColor($json['_risk_level']);
            $json['_success_ratio'] = (float) ($json['data']['summary']['success_ratio'] ?? 0);

            return $json;

        } catch (\Exception $e) {
            Log::warning('BD Courier check exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Map risk level to a Tailwind color name for the UI.
     */
    public static function riskColor(string $level): string
    {
        return match ($level) {
            'safe'   => 'green',
            'low'    => 'blue',
            'medium' => 'amber',
            'high'   => 'red',
            'danger' => 'rose',
            default  => 'gray',
        };
    }

    /**
     * Determine if this risk level should be blocked based on admin settings.
     */
    public function shouldBlock(?array $result): bool
    {
        if (! $result) return false;

        $level = $result['_risk_level'] ?? 'unknown';

        // Check risk level blocklist
        $blockLevels = array_filter(
            array_map('trim', explode(',', (string) setting('fog_bdcourier_block_risk_levels', 'danger,high')))
        );

        if (in_array($level, $blockLevels, true)) {
            return true;
        }

        // Check minimum success rate
        $minRate = (int) setting('fog_bdcourier_min_success_rate', 0);
        if ($minRate > 0) {
            $ratio = $result['_success_ratio'] ?? 100;
            // If the customer has orders and ratio is below threshold
            $totalParcels = (int) ($result['data']['summary']['total_parcel'] ?? 0);
            if ($totalParcels > 0 && $ratio < $minRate) {
                return true;
            }
        }

        return false;
    }

    /**
     * Human-readable block reason for the customer.
     */
    public function blockMessage(?array $result): string
    {
        if (! $result) return 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।';

        $level = $result['_risk_level'] ?? '';
        $ratio = number_format($result['_success_ratio'] ?? 0, 1);

        return match ($level) {
            'danger' => "আপনার ফোন নম্বরে অস্বাভাবিক ডেলিভারি রেকর্ড পাওয়া গেছে ({$ratio}% সফলতার হার)। অর্ডার প্রক্রিয়া করা সম্ভব নয়।",
            'high'   => "আপনার ফোন নম্বরে উচ্চ ঝুঁকি চিহ্নিত হয়েছে ({$ratio}% সফলতার হার)। অর্ডার নিশ্চিত করা যাচ্ছে না।",
            default  => "আপনার ফোন নম্বরটি যাচাই করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        };
    }
}
