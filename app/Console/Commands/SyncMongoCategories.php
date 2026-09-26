<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Category;

class SyncMongoCategories extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:mongo-categories';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch categories from the MongoDB API and seed them into the local database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fetching categories from API...');

        $response = Http::withoutVerifying()->get('https://muktadirtech.vercel.app/api/v1/categories');

        if (!$response->successful()) {
            $this->error('Failed to fetch categories from the API.');
            return Command::FAILURE;
        }

        $data = $response->json();
        
        if (!isset($data['success']) || !$data['success'] || !isset($data['data']['categories'])) {
            $this->error('Invalid API response format.');
            return Command::FAILURE;
        }

        $mongoCategories = $data['data']['categories'];
        
        $this->info('Found ' . count($mongoCategories) . ' categories. Starting sync...');

        // Pass 1: Upsert all categories and map MongoDB _id to Local ID.
        // Pass 2: Update the parent_id relationships based on the mapping.

        $idMapping = []; // Format: [ 'mongo_id' => local_id ]

        $bar = $this->output->createProgressBar(count($mongoCategories));
        $bar->start();

        foreach ($mongoCategories as $mongoCat) {
            // Check if it already exists by name first to avoid changing slugs
            $localCategory = Category::where('name', $mongoCat['name'])->first();

            if (! $localCategory) {
                // Generate a unique slug for new category
                $slug = Str::slug($mongoCat['name']) ?: Str::random(8);
                $originalSlug = $slug;
                $counter = 1;
                while (Category::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $counter++;
                }

                $localCategory = Category::create([
                    'name' => $mongoCat['name'],
                    'slug' => $slug,
                    'is_active' => true,
                ]);
            }

            // Save mapping for Pass 2
            $idMapping[$mongoCat['_id']] = $localCategory->id;

            $bar->advance();
        }
        $bar->finish();
        $this->newLine();

        $this->info('Pass 1 completed. Setting up parent relationships...');

        $bar = $this->output->createProgressBar(count($mongoCategories));
        $bar->start();

        // Pass 2: Assign parent_ids
        foreach ($mongoCategories as $mongoCat) {
            if (!empty($mongoCat['parentId']) && isset($idMapping[$mongoCat['parentId']]) && isset($idMapping[$mongoCat['_id']])) {
                $localId = $idMapping[$mongoCat['_id']];
                $localParentId = $idMapping[$mongoCat['parentId']];

                Category::where('id', $localId)->update([
                    'parent_id' => $localParentId
                ]);
            }
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();

        $this->info('Successfully synchronized all categories!');
        
        return Command::SUCCESS;
    }
}
