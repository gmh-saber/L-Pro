<?php

namespace App\Contracts;

interface FraudGuardInterface
{
    /**
     * Check fraud status for a given phone number.
     *
     * @param string $phone
     * @return array|null
     */
    public function check(string $phone): ?array;

    /**
     * Determine if the order should be blocked based on the result.
     *
     * @param array|null $result
     * @return bool
     */
    public function shouldBlock(?array $result): bool;

    /**
     * Generate a localized block message to show to the user.
     *
     * @param array|null $result
     * @return string
     */
    public function blockMessage(?array $result): string;

    /**
     * Determine if the order should fail-open but be flagged in the admin panel.
     *
     * @param array|null $result
     * @return bool
     */
    public function isFlagged(?array $result): bool;

    /**
     * Get the reason why the order was flagged.
     *
     * @param array|null $result
     * @return string|null
     */
    public function getFlagReason(?array $result): ?string;

    /**
     * Normalize the provider-specific API response into a standard format for the React frontend.
     * Standard structure:
     * [
     *     'provider' => string,
     *     'risk_level' => string (e.g. 'danger', 'high', 'medium', 'low', 'trusted', 'new', 'unknown'),
     *     'risk_label' => string,
     *     'metrics' => [
     *         ['label' => 'Total', 'value' => int, 'color' => string], ...
     *     ],
     *     'reports' => [
     *         ['details' => string, 'courierName' => string], ...
     *     ]
     * ]
     *
     * @param array|null $result
     * @return array|null
     */
    public function normalizeForFrontend(?array $result): ?array;
}
