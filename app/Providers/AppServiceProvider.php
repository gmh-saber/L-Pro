<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CartService::class);
    }

    public function boot(): void
    {
        // Flatten deploy: index.php sits next to vendor. Symlink deploy: leave default /public.
        if (file_exists(base_path('index.php')) && file_exists(base_path('vendor/autoload.php'))) {
            $this->app->usePublicPath(base_path());
        }
        Paginator::useTailwind();

        // Behind HTTPS terminators, generate https:// URLs so buttons/assets/CSRF stay on the same origin.
        if (! $this->app->runningInConsole()) {
            $req = request();
            if ($req->isSecure() || strtolower((string) $req->header('X-Forwarded-Proto')) === 'https') {
                URL::forceScheme('https');
            }
        }

        // Shared chrome data for every storefront view (header nav + cart drawer + brand).
        View::composer(['layouts.storefront', 'storefront.*'], function ($view) {
            $cart = app(CartService::class);

            $view->with([
                'siteName'      => site_name(),
                'navCategories' => Category::where('is_active', true)
                    ->withCount(['products' => fn ($q) => $q->published()])
                    ->orderBy('position')
                    ->get(),
                'hasFlashSale'  => Product::query()->published()->where('is_flash_sale', true)->exists(),
                'cartItems'     => $cart->items(),
                'cartCount'     => $cart->count(),
                'cartSubtotal'  => $cart->subtotal(),
            ]);
        });
    }
}
