<?php

namespace App\Services;

use App\Contracts\FraudGuardInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SteadfastFraudGuardService implements FraudGuardInterface
{
    private const BASE_URL = 'https://portal.packzy.com/api/v1';
    private const TIMEOUT = 12; // fail-open

    private string $apiKey;
    private string $secretKey;

    public function __construct()
    {
        $this->apiKey = setting('steadfast_api_key') ?: config('services.steadfast.api_key', '');
        $this->secretKey = setting('steadfast_secret_key') ?: config('services.steadfast.secret_key', '');
    }

    public function check(string $phone): ?array
    {
        if (empty($this->apiKey) || empty($this->secretKey)) {
            return null;
        }

        $phone = preg_replace('/^(?:\+?88)/', '', trim($phone));

        try {
            $response = Http::withoutVerifying()->timeout(self::TIMEOUT)
                ->withHeaders([
                    'Api-Key' => $this->apiKey,
                    'Secret-Key' => $this->secretKey,
                    'Content-Type' => 'application/json',
                ])
                ->get(self::BASE_URL . '/fraud_check/score/' . $phone);

            if ($response->failed()) {
                Log::warning('Steadfast Fraud API error', [
                    'status' => $response->status(),
                    'phone' => $phone,
                ]);
                
                if ($response->status() === 429) {
                    return ['error' => 'Steadfast API Rate Limit Exceeded. Please try again later.'];
                }

                return null;
            }

            $json = $response->json();

            if (($json['status'] ?? 0) !== 200) {
                return null;
            }

            $json['_phone'] = $phone;

            return $json;

        } catch (\Exception $e) {
            Log::warning('Steadfast Fraud check exception: ' . $e->getMessage());
            return null;
        }
    }

    public function shouldBlock(?array $result): bool
    {
        if (!$result) return false;

        $minScore = (int) setting('fog_steadfast_min_score', 0);
        $blockLevelsStr = setting('fog_steadfast_block_risk_levels', '');
        $blockLevels = array_filter(array_map('trim', explode(',', $blockLevelsStr)));

        $score = $result['score'] ?? null;
        $level = $result['level'] ?? null;

        // Fail-open: if a score is returned and it's lower than the min score allowed
        if ($score !== null && $minScore > 0 && $score < $minScore) {
            return true;
        }

        // If the API level matches one of the blocked risk levels
        if ($level && in_array(strtolower($level), array_map('strtolower', $blockLevels))) {
            return true;
        }

        return false;
    }

    public function blockMessage(?array $result): string
    {
        return 'আপনার ফোন নম্বরটি যাচাই করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন। (Low Trust Score)';
    }

    public function isFlagged(?array $result): bool
    {
        if (!$result) return false;
        
        $level = $result['level'] ?? '';
        return in_array(strtolower($level), ['risky', 'danger']);
    }

    public function getFlagReason(?array $result): ?string
    {
        if (!$this->isFlagged($result)) {
            return null;
        }

        return 'Steadfast flagged this number as ' . ($result['level'] ?? 'high risk') . '.';
    }

    public function normalizeForFrontend(?array $result): ?array
    {
        if (!$result) return null;

        $score = $result['score'] ?? null;
        $level = $result['level'] ?? 'new';
        $doubtful = $result['doubtful_reports'] ?? false;
        
        // Map Steadfast level to our risk_level (safe, medium, high, danger)
        $riskLevel = match (strtolower($level)) {
            'trusted', 'good', 'new' => 'safe',
            'caution' => 'medium',
            'risky' => 'high',
            'danger' => 'danger',
            default => 'safe',
        };

        $riskLabel = match (strtolower($level)) {
            'trusted' => 'Trusted',
            'good' => 'Good',
            'caution' => 'Caution',
            'risky' => 'Risky',
            'danger' => 'Danger',
            'new' => 'Unknown',
            default => ucfirst($level),
        };

        // Format score string
        $scoreValue = $score !== null ? $score . '/100' : 'N/A';
        
        $scoreColor = 'text-gray-500';
        if ($score !== null) {
            if ($score >= 80) $scoreColor = 'text-green-600';
            elseif ($score >= 60) $scoreColor = 'text-blue-500';
            elseif ($score >= 40) $scoreColor = 'text-yellow-500';
            else $scoreColor = 'text-red-500';
        }

        $reasonMap = [
            'history_long'   => 'Long delivery history',
            'history_some'   => 'A fair delivery history',
            'history_little' => 'Little delivery history',
            'history_none'   => 'No delivery history',
            'ratio_high'     => 'Receives most parcels (80%+)',
            'ratio_good'     => 'Good delivery ratio',
            'ratio_fair'     => 'Fair delivery ratio',
            'ratio_poor'     => 'Poor delivery ratio',
            'reports_none'   => 'No fraud reports',
            'reports_few'    => 'Few fraud reports',
            'reports_some'   => 'Some fraud reports',
            'reports_many'   => 'Many fraud reports',
        ];

        $reasons = $result['reasons'] ?? [];
        $mappedReasons = [];
        foreach ($reasons as $reason) {
            $mappedReasons[] = [
                'key' => $reason,
                'label' => $reasonMap[$reason] ?? str_replace('_', ' ', ucfirst($reason)),
            ];
        }

        $reports = [];
        $totalReports = $result['total_reports'] ?? 0;
        if ($totalReports > 0) {
            $reports[] = [
                'details' => "Has {$totalReports} fraud report(s) on record",
                'courierName' => 'Steadfast API'
            ];
        }
        
        if ($doubtful) {
            $reports[] = [
                'details' => 'Has doubtful reports (possibly from competitors)',
                'courierName' => 'Steadfast API'
            ];
        }

        return [
            'provider' => 'steadfast',
            'risk_level' => $riskLevel,
            'risk_label' => $riskLabel,
            'metrics' => [
                [
                    'label' => 'Trust Score',
                    'value' => $scoreValue,
                    'color' => $scoreColor,
                ],
                [
                    'label' => 'Trust Level',
                    'value' => $riskLabel,
                    'color' => $scoreColor,
                ],
            ],
            'steadfast_reasons' => $mappedReasons,
            'reports' => $reports
        ];
    }
}
