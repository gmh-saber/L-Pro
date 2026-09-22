<?php

namespace Tests\Feature;

use App\Models\BlockedIp;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FakeOrderGuardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $category = \App\Models\Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);
        
        $this->product = Product::create([
            'category_id'    => $category->id,
            'name'           => 'Test Product',
            'slug'           => 'test-product',
            'regular_price'  => 1000,
            'stock_quantity' => 10,
            'is_published'   => true,
        ]);
    }

    private function fillCart()
    {
        $this->post('/cart/add', [
            'product_id' => $this->product->id,
            'qty'        => 1,
        ]);
    }

    public function test_rejects_invalid_bangladesh_phone_number()
    {
        $this->fillCart();

        $response = $this->post('/checkout', [
            'customer_name'    => 'John Doe',
            'customer_phone'   => '01234567890', // Invalid prefix (012 instead of 013-019)
            'shipping_address' => '123 Test St',
            'city'             => 'Dhaka',
            'shipping_zone'    => 'inside_dhaka',
            'payment_method'   => 'cod',
        ]);

        $response->dump();

        $response->assertSessionHasErrors(['customer_phone']);
    }

    public function test_accepts_valid_bangladesh_phone_number()
    {
        $this->fillCart();

        $response = $this->post('/checkout', [
            'customer_name'    => 'John Doe',
            'customer_phone'   => '01711223344', // Valid GP number
            'shipping_address' => '123 Test St',
            'city'             => 'Dhaka',
            'shipping_zone'    => 'inside_dhaka',
            'payment_method'   => 'cod',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        $this->assertDatabaseHas('orders', [
            'customer_phone' => '01711223344',
            'ip_address'     => '127.0.0.1',
        ]);
    }

    public function test_blocks_checkout_if_ip_is_blocked()
    {
        BlockedIp::create([
            'ip_address' => '127.0.0.1',
            'reason'     => 'Spammer',
        ]);

        $this->fillCart();

        $response = $this->post('/checkout', [
            'customer_name'    => 'John Doe',
            'customer_phone'   => '01711223344',
            'shipping_address' => '123 Test St',
            'city'             => 'Dhaka',
            'shipping_zone'    => 'inside_dhaka',
            'payment_method'   => 'cod',
        ]);

        $response->assertSessionHasErrors('cart');
        $this->assertNotEmpty(session('errors')->first('cart'));
    }

    public function test_rate_limits_multiple_orders_from_same_ip()
    {
        // Set setting to 10 minutes limit
        \App\Models\Setting::put('fraud_order_time_limit_minutes', '10');

        // First order
        $this->fillCart();
        $this->post('/checkout', [
            'customer_name'    => 'John Doe 1',
            'customer_phone'   => '01711223344',
            'shipping_address' => '123 Test St',
            'city'             => 'Dhaka',
            'shipping_zone'    => 'inside_dhaka',
            'payment_method'   => 'cod',
        ]);

        $this->assertDatabaseCount('orders', 1);

        // Attempt second order immediately
        $this->fillCart();
        $response = $this->post('/checkout', [
            'customer_name'    => 'John Doe 2',
            'customer_phone'   => '01811223344',
            'shipping_address' => '456 Test St',
            'city'             => 'Dhaka',
            'shipping_zone'    => 'inside_dhaka',
            'payment_method'   => 'cod',
        ]);

        $response->assertSessionHasErrors('cart');
        $this->assertNotEmpty(session('errors')->first('cart'));
        $this->assertDatabaseCount('orders', 1); // Second order was not saved
    }
}
