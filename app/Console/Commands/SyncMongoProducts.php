<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SyncMongoProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:mongo-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed products from the external MongoDB API and map categories';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting product sync...');

        $page = 1;
        $totalPages = 1; // Will be updated on first request

        // Load categories into a lookup array for faster processing
        $categories = Category::pluck('id', 'name')->toArray();

        do {
            $this->info("Fetching page {$page} of {$totalPages}...");

            $response = Http::withoutVerifying()->get("https://muktadirtech.vercel.app/api/v1/products", [
                'page' => $page,
                'limit' => 50,
            ]);

            if (!$response->successful()) {
                $this->error("Failed to fetch products on page {$page}.");
                break;
            }

            $data = $response->json();

            if (empty($data['success']) || empty($data['data']['products'])) {
                $this->warn("No products found on page {$page}.");
                break;
            }

            if ($page === 1 && !empty($data['data']['pagination']['pages'])) {
                $totalPages = $data['data']['pagination']['pages'];
            }

            $apiProducts = $data['data']['products'];

            foreach ($apiProducts as $apiProduct) {
                // Map category
                $categoryId = null;
                if (!empty($apiProduct['category'])) {
                    $parts = explode('>', $apiProduct['category']);
                    $leafName = trim(end($parts));
                    
                    if (isset($categories[$leafName])) {
                        $categoryId = $categories[$leafName];
                    } else {
                        // Case-insensitive fallback lookup
                        foreach ($categories as $name => $id) {
                            if (strtolower(trim($name)) === strtolower($leafName)) {
                                $categoryId = $id;
                                break;
                            }
                        }
                    }
                    
                    if (!$categoryId && !empty($leafName)) {
                        $newCat = \App\Models\Category::firstOrCreate(
                            ['name' => $leafName],
                            [
                                'slug' => \Illuminate\Support\Str::slug($leafName) ?: 'unknown-category',
                                'is_active' => true,
                            ]
                        );
                        $categoryId = $newCat->id;
                        $categories[$leafName] = $categoryId;
                    }
                }

                if (!$categoryId) {
                    $this->warn("Skipping product [" . ($apiProduct['name'] ?? 'unknown') . "] due to empty category string.");
                    continue;
                }

                // Prepare base fields
                $slug = !empty($apiProduct['slug']) ? $apiProduct['slug'] : Str::slug($apiProduct['name'] ?? '');
                if (!$slug) {
                    continue; // Skip products without valid names/slugs
                }

                $sku = !empty($apiProduct['darazItemId']) 
                    ? $apiProduct['darazItemId'] 
                    : (!empty($apiProduct['_id']) ? $apiProduct['_id'] : Str::random(10));

                // Upsert product
                $product = Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name' => $apiProduct['name'] ?? 'Unnamed Product',
                        'sku' => $sku,
                        'category_id' => $categoryId,
                        'brand' => $apiProduct['brand'] ?? 'No Brand',
                        'description' => $apiProduct['description'] ?? null,
                        'regular_price' => $apiProduct['price'] ?? 0,
                        'sale_price' => !empty($apiProduct['specialPrice']) ? $apiProduct['specialPrice'] : null,
                        'stock_quantity' => $apiProduct['stock'] ?? 0,
                        'is_published' => !empty($apiProduct['isActive']),
                        'rating' => $apiProduct['rating'] ?? 0,
                        'reviews_count' => $apiProduct['reviewCount'] ?? 0,
                    ]
                );

                // Handle images
                $images = [];
                if (!empty($apiProduct['image'])) {
                    $images[] = $apiProduct['image'];
                }
                if (!empty($apiProduct['images']) && is_array($apiProduct['images'])) {
                    $images = array_merge($images, $apiProduct['images']);
                }
                $images = array_unique($images);

                if (!empty($images)) {
                    // Clear existing to avoid infinite stacking on multiple syncs
                    $product->images()->delete();
                    
                    foreach ($images as $index => $imageUrl) {
                        if (!empty($imageUrl)) {
                            ProductImage::create([
                                'product_id' => $product->id,
                                'path' => $imageUrl,
                                'is_primary' => $index === 0,
                            ]);
                        }
                    }
                }
            }

            $page++;
            
            // Memory management
            unset($apiProducts, $data, $response);
            gc_collect_cycles();
            
        } while ($page <= $totalPages);

        $this->info('Product sync completed successfully!');
        return Command::SUCCESS;
    }
}
