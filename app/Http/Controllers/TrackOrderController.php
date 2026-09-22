<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Order;
use Illuminate\Http\Request;

class TrackOrderController extends Controller
{
    public function show()
    {
        return Inertia::render('Storefront/Track', ['order' => null]);
    }

    public function find(Request $request)
    {
        $data = $request->validate([
            'order_number' => ['required', 'string', 'max:40'],
            'phone'        => ['required', 'string', 'max:40'],
        ]);

        $order = Order::with('items')
            ->where('order_number', trim($data['order_number']))
            ->where('customer_phone', trim($data['phone']))
            ->first();

        if (! $order) {
            return back()->withErrors(['order_number' => 'No order found with that number and phone.'])->withInput();
        }

        return Inertia::render('Storefront/Track', compact('order'));
    }
}
