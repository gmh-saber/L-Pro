<?php

namespace App\Http\Controllers;

use App\Models\BlockedDevice;
use App\Models\BlockedIp;
use App\Models\BlockedPhone;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\CouponService;
use App\Support\BdPhoneValidator;
use App\Services\BdCourierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class QuickOrderController extends Controller
{
    public function __construct(private CouponService $coupons) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'     => ['required', 'integer', 'exists:products,id'],
            'qty'            => ['required', 'integer', 'min:1', 'max:100'],
            'variant'        => ['nullable', 'string', 'max:120'],
            'customer_name'  => ['required', 'string', 'max:120'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'shipping_zone'  => ['required', Rule::in(['inside_dhaka', 'outside_dhaka'])],
            'coupon_code'    => ['nullable', 'string', 'max:40'],
        ]);

        // ─── Basic phone format check ─────────────────────────────────────────
        $rawPhone = trim((string) ($validated['customer_phone'] ?? ''));
        if (! preg_match('/^[\+\d][\d\s\-]{7,19}$/', $rawPhone)) {
            return response()->json(['errors' => [
                'customer_phone' => 'একটি সঠিক ফোন নম্বর দিন। বাংলাদেশী নম্বর হতে হবে (যেমন: 01712345678)।',
            ]], 422);
        }

        $clientIp   = $request->ip();
        $userAgent  = $request->userAgent() ?? '';
        $deviceHash = hash('sha256', $userAgent);

        // ─── Fake Order Guard ─────────────────────────────────────────────────
        $fogEnabled = (string) setting('fog_enabled', '1') === '1';

        if ($fogEnabled) {
            // 1. IP Block
            if ((string) setting('fog_ip_block_enabled', '1') === '1') {
                if (BlockedIp::where('ip_address', $clientIp)->exists()) {
                    return response()->json(['errors' => [
                        'form' => 'আপনার ডিভাইস/আইপি সাময়িকভাবে ব্লক করা হয়েছে। অর্ডার দেওয়া যাচ্ছে না।',
                    ]], 422);
                }
            }

            // 2. Device Fingerprint Block
            if ((string) setting('fog_device_block_enabled', '1') === '1') {
                if (BlockedDevice::where('device_hash', $deviceHash)->exists()) {
                    return response()->json(['errors' => [
                        'form' => 'আপনার ডিভাইস ব্লক করা হয়েছে। অর্ডার দেওয়া সম্ভব নয়।',
                    ]], 422);
                }
            }

            // 3. Phone Block
            if ((string) setting('fog_phone_block_enabled', '1') === '1') {
                $phone     = $validated['customer_phone'] ?? '';
                $phoneNorm = BdPhoneValidator::normalize($phone);
                if ($phone && (
                    BlockedPhone::where('phone', $phone)->exists() ||
                    BlockedPhone::where('phone', $phoneNorm)->exists()
                )) {
                    return response()->json(['errors' => [
                        'customer_phone' => 'এই ফোন নম্বর থেকে অর্ডার দেওয়া ব্লক করা হয়েছে।',
                    ]], 422);
                }
            }

            // 4. Fake/Invalid BD Number Block
            if ((string) setting('fog_fake_number_block_enabled', '1') === '1') {
                $phone = $validated['customer_phone'] ?? '';
                if ($phone) {
                    if (! BdPhoneValidator::isValid($phone)) {
                        return response()->json(['errors' => [
                            'customer_phone' => 'অনুগ্রহ করে একটি সঠিক বাংলাদেশী ফোন নম্বর দিন (01X-XXXXXXXX)।',
                        ]], 422);
                    }
                    if (BdPhoneValidator::isFake($phone)) {
                        return response()->json(['errors' => [
                            'customer_phone' => 'এই ফোন নম্বরটি বৈধ মনে হচ্ছে না। সঠিক নম্বর দিয়ে আবার চেষ্টা করুন।',
                        ]], 422);
                    }
                }
            }

            // 5. Max orders per phone
            $maxOrdersPerPhone = (int) setting('fog_max_orders_per_phone', 0);
            if ($maxOrdersPerPhone > 0 && ! empty($validated['customer_phone'])) {
                $phoneNorm   = BdPhoneValidator::normalize($validated['customer_phone']);
                $totalByPhone = Order::where(function ($q) use ($validated, $phoneNorm) {
                    $q->where('customer_phone', $validated['customer_phone'])
                      ->orWhere('customer_phone', $phoneNorm);
                })->count();
                if ($totalByPhone >= $maxOrdersPerPhone) {
                    return response()->json(['errors' => [
                        'customer_phone' => "এই নম্বর থেকে সর্বোচ্চ {$maxOrdersPerPhone}টি অর্ডার করা যাবে।",
                    ]], 422);
                }
            }

            // 6. IP Cooldown
            $ipCooldown = (int) setting('fog_ip_cooldown_minutes', setting('fraud_order_time_limit_minutes', 0));
            if ($ipCooldown > 0) {
                if (Order::where('ip_address', $clientIp)->where('created_at', '>=', now()->subMinutes($ipCooldown))->exists()) {
                    return response()->json(['errors' => [
                        'form' => "আপনি ইতিমধ্যে একটি অর্ডার দিয়েছেন। পরবর্তী অর্ডারের জন্য {$ipCooldown} মিনিট অপেক্ষা করুন।",
                    ]], 422);
                }
            }

            // 7. Phone Cooldown
            $phoneCooldown = (int) setting('fog_phone_cooldown_minutes', 0);
            if ($phoneCooldown > 0 && ! empty($validated['customer_phone'])) {
                if (Order::where('customer_phone', $validated['customer_phone'])->where('created_at', '>=', now()->subMinutes($phoneCooldown))->exists()) {
                    return response()->json(['errors' => [
                        'customer_phone' => "এই নম্বর থেকে সম্প্রতি অর্ডার দেওয়া হয়েছে। {$phoneCooldown} মিনিট পর আবার চেষ্টা করুন।",
                    ]], 422);
                }
            }

            // 8. BD Courier check
            if ((string) setting('fog_bdcourier_enabled', '0') === '1' &&
                (string) setting('fog_bdcourier_auto_check_checkout', '0') === '1') {
                $phone = $validated['customer_phone'] ?? '';
                if ($phone) {
                    $courier = new BdCourierService();
                    $result  = $courier->check($phone);
                    if ($result && $courier->shouldBlock($result)) {
                        return response()->json(['errors' => [
                            'customer_phone' => $courier->blockMessage($result),
                        ]], 422);
                    }
                }
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        // ─── Coupon ───────────────────────────────────────────────────────────
        $discount = 0.0;
        $coupon   = null;
        if (! empty($validated['coupon_code'])) {
            $result = $this->coupons->apply($validated['coupon_code'], 0); // subtotal TBD below
            if (! $result['ok']) {
                return response()->json(['errors' => ['coupon_code' => $result['message']]], 422);
            }
            $coupon = $this->coupons->coupon();
        }

        // ─── Product & Pricing ────────────────────────────────────────────────
        $product = Product::findOrFail($validated['product_id']);
        $price   = (float) ($product->sale_price ?: $product->regular_price);
        $qty     = (int) $validated['qty'];
        $subtotal = $price * $qty;

        if ($coupon) {
            $couponError = $coupon->validateForSubtotal($subtotal);
            if ($couponError) {
                $this->coupons->remove();
                return response()->json(['errors' => ['coupon_code' => $couponError]], 422);
            }
            $discount = $coupon->calculateDiscount($subtotal);
        }

        $shippingZone = $validated['shipping_zone'];
        $isFreeShipping = (bool) ($product->is_free_shipping ?? false);
        $shipping = $isFreeShipping ? 0.0 : ($shippingZone === 'inside_dhaka'
            ? (float) setting('shipping_inside_dhaka', 60)
            : (float) setting('shipping_outside_dhaka', 120));
        $taxPercent = (float) setting('tax_percent', 0);
        $taxable    = max(0, $subtotal - $discount);
        $tax        = round($taxable * $taxPercent / 100, 2);
        $total      = $taxable + $shipping + $tax;

        // ─── Stock check ──────────────────────────────────────────────────────
        if ($product->stock_quantity < $qty) {
            return response()->json(['errors' => [
                'form' => "দুঃখিত, এই পণ্যের স্টকে মাত্র {$product->stock_quantity}টি আছে।",
            ]], 422);
        }

        // ─── Create Order ─────────────────────────────────────────────────────
        try {
            $order = DB::transaction(function () use (
                $validated, $product, $price, $qty, $subtotal, $discount,
                $shipping, $tax, $total, $coupon, $clientIp, $deviceHash, $request, $shippingZone
            ) {
                $product->refresh()->lockForUpdate();
                if ($product->stock_quantity < $qty) {
                    throw new \RuntimeException("দুঃখিত, এই পণ্যের স্টকে মাত্র {$product->stock_quantity}টি আছে।");
                }

                $order = Order::create([
                    'order_number'     => $this->generateOrderNumber(),
                    'user_id'          => Auth::id(),
                    'customer_name'    => $validated['customer_name'],
                    'customer_phone'   => $validated['customer_phone'],
                    'customer_email'   => Auth::user()?->email,
                    'shipping_address' => $validated['shipping_address'],
                    'city'             => $shippingZone === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে',
                    'shipping_zone'    => $shippingZone,
                    'coupon_id'        => $coupon?->id,
                    'coupon_code'      => $coupon?->code,
                    'ip_address'       => $clientIp,
                    'user_agent'       => $request->userAgent(),
                    'device_hash'      => $deviceHash,
                    'subtotal'         => $subtotal,
                    'discount_amount'  => $discount,
                    'shipping_charge'  => $shipping,
                    'tax'              => $tax,
                    'total'            => $total,
                    'payment_method'   => 'cod',
                    'payment_status'   => 'pending',
                    'status'           => 'pending',
                    'internal_note'    => $validated['variant'] ? 'Variant: ' . $validated['variant'] : null,
                ]);

                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'image'        => $product->primaryImage()?->path,
                    'variant'      => $validated['variant'] ?? null,
                    'unit_price'   => $price,
                    'quantity'     => $qty,
                    'line_total'   => $price * $qty,
                ]);

                $product->decrement('stock_quantity', $qty);

                if ($coupon) {
                    $coupon->incrementUsage();
                }

                return $order;
            });
        } catch (\RuntimeException $e) {
            return response()->json(['errors' => ['form' => $e->getMessage()]], 422);
        }

        // Emails
        $order->load('items');
        send_order_email($order, 'emails.order_placed', 'Order received — ' . $order->order_number . ' | ' . site_name());
        send_admin_order_alert($order);

        if ($coupon) {
            $this->coupons->remove();
        }

        return response()->json([
            'success'      => true,
            'order_number' => $order->order_number,
            'total'        => $total,
            'redirect'     => route('order.confirmation', [
                'order' => $order->order_number,
                'token' => $order->confirmation_token,
            ]),
        ]);
    }

    private function generateOrderNumber(): string
    {
        $attempts = 0;
        do {
            if (++$attempts > 15) {
                return 'ORD-' . now()->format('ymd') . '-' . strtoupper(Str::random(8));
            }
            $number = 'ORD-' . now()->format('ymd') . '-' . strtoupper(Str::random(4));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
