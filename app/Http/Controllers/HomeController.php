<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Feature;
use App\Models\Product;

class HomeController extends Controller
{
    public function index()
    {
        $withImages = fn ($q) => $q->published()->with('images', 'category')->withExists('variants');

        $categories = Category::where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->published()])
            ->orderBy('position')
            ->get();

        $banners = fn (string $placement) => Banner::active()
            ->placement($placement)
            ->orderBy('position')
            ->orderBy('id');

        return Inertia::render('Storefront/Home', [
            'heroBanners'     => $banners('hero')->get(),
            'middleBanners'   => $banners('middle')->get(),
            'features'        => Feature::where('is_active', true)->orderBy('position')->get(),
            'featuredCategories' => $categories,
            'coupons'         => Coupon::query()
                ->where('is_active', true)
                ->orderByDesc('created_at')
                ->get()
                ->filter(fn (Coupon $c) => $c->isCurrentlyActive())
                ->values()
                ->take(4),
            'flashProducts'   => Product::query()->tap($withImages)->where('is_flash_sale', true)->orderBy('flash_sale_position')->orderBy('id')->get(),
            'trending'        => Product::query()->tap($withImages)->where('is_featured', true)->take(12)->get(),
            'bestSellers'     => Product::query()->tap($withImages)->where('is_best_seller', true)->take(12)->get(),
            'newArrivals'     => Product::query()->tap($withImages)->where('is_new_arrival', true)->take(12)->get(),
        ]);
    }
}
