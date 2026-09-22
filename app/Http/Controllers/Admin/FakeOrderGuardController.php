<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedDevice;
use App\Models\BlockedIp;
use App\Models\BlockedPhone;
use App\Models\Order;
use App\Models\Setting;
use App\Services\BdCourierService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FakeOrderGuardController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key');

        $stats = [
            'blocked_ips'     => BlockedIp::count(),
            'blocked_devices' => BlockedDevice::count(),
            'blocked_phones'  => BlockedPhone::count(),
            'total_orders'    => Order::count(),
            'pending_orders'  => Order::where('status', 'pending')->count(),
        ];

        $recentBlockedOrders = Order::whereIn('ip_address', BlockedIp::pluck('ip_address'))
            ->orWhereIn('device_hash', BlockedDevice::pluck('device_hash'))
            ->orWhereIn('customer_phone', BlockedPhone::pluck('phone'))
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'customer_name', 'customer_phone', 'ip_address', 'status', 'created_at']);

        return Inertia::render('Admin/FakeOrderGuard/Index', compact('settings', 'stats', 'recentBlockedOrders'));
    }

    /**
     * Manual BD Courier phone check — called from the admin UI.
     */
    public function checkPhone(Request $request)
    {
        $request->validate([
            'phone' => ['required', 'string', 'max:20'],
        ]);

        $apiKey = (string) setting('fog_bdcourier_api_key', '');
        if (empty($apiKey)) {
            return response()->json(['error' => 'BD Courier API key is not configured.'], 422);
        }

        $service = new BdCourierService($apiKey);
        $result  = $service->check($request->input('phone'));

        if (! $result) {
            return response()->json(['error' => 'Could not reach BD Courier API. Check your API key or try again.'], 422);
        }

        return response()->json($result);
    }
}
