<?php

namespace App\Services;

use App\Contracts\FraudGuardInterface;

class FraudGuardFactory
{
    /**
     * Resolve and return the active fraud guard provider based on settings.
     *
     * @return FraudGuardInterface
     */
    public static function make(): FraudGuardInterface
    {
        $provider = setting('fog_provider', 'bdcourier');

        if ($provider === 'steadfast') {
            return new SteadfastFraudGuardService();
        }

        // Default to BdCourierService if 'bdcourier' or unknown
        return new BdCourierService();
    }
}
