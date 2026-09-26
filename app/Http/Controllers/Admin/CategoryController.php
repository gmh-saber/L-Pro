<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\PublicUploader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('parent')->withCount('products')->orderBy('position');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->input('parent_id'));
        }

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $query->paginate(50)->withQueryString(),
            'filters' => $request->only(['search', 'parent_id']),
            'parents' => Category::whereNull('parent_id')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => new Category(['is_active' => true]),
            'parents'  => Category::whereNull('parent_id')->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data = $this->sanitizeCategoryData($data);
        $data['slug'] = $this->uniqueSlug(($data['slug'] ?? '') ?: $data['name']);
        $data['is_active'] = $request->boolean('is_active');
        $this->handleImage($request, $data);

        Category::create($data);

        return redirect()->route('admin.categories.index')->with('status', 'Category created.');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => $category,
            'parents'  => Category::whereNull('parent_id')->where('id', '!=', $category->id)->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $data = $this->validateData($request, $category);
        $data = $this->sanitizeCategoryData($data);
        $data['slug'] = $this->uniqueSlug(($data['slug'] ?? '') ?: $data['name'], $category->id);
        $data['is_active'] = $request->boolean('is_active');
        $this->handleImage($request, $data, $category);

        $category->update($data);

        return redirect()->route('admin.categories.index')->with('status', 'Category updated.');
    }

    public function destroy(Category $category)
    {
        $this->deleteStoredImage($category->image);
        $category->delete();

        return redirect()->route('admin.categories.index')->with('status', 'Category deleted.');
    }

    public function bulk(Request $request)
    {
        $data = $request->validate([
            'ids'         => ['required', 'array', 'min:1'],
            'ids.*'       => ['integer', 'exists:categories,id'],
            'bulk_action' => ['required', 'in:activate,deactivate,delete'],
        ]);

        $ids = $data['ids'];
        $count = count($ids);

        if ($data['bulk_action'] === 'activate') {
            Category::whereIn('id', $ids)->update(['is_active' => true]);

            return back()->with('status', "{$count} categor" . ($count === 1 ? 'y' : 'ies') . ' set to Active.');
        }

        if ($data['bulk_action'] === 'deactivate') {
            Category::whereIn('id', $ids)->update(['is_active' => false]);

            return back()->with('status', "{$count} categor" . ($count === 1 ? 'y' : 'ies') . ' set to Hidden.');
        }

        $categories = Category::whereIn('id', $ids)->get();
        foreach ($categories as $category) {
            $this->deleteStoredImage($category->image);
            $category->delete();
        }

        return back()->with('status', "{$count} categor" . ($count === 1 ? 'y' : 'ies') . ' deleted.');
    }

    private function validateData(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'name'             => ['required', 'string', 'max:120'],
            'slug'             => ['nullable', 'string', 'max:120'],
            'parent_id'        => ['nullable', 'integer', 'exists:categories,id'],
            'icon'             => ['nullable', 'string', 'max:16'],
            'description'      => ['nullable', 'string', 'max:500'],
            'position'         => ['nullable', 'integer', 'min:0'],
            'meta_title'       => ['nullable', 'string', 'max:180'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords'    => ['nullable', 'string', 'max:500'],
            'image_file'       => ['nullable', 'file', 'extensions:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);
    }

    private function handleImage(Request $request, array &$data, ?Category $category = null): void
    {
        unset($data['image_file']);
        $path = PublicUploader::storeFromRequest($request, 'image_file', 'categories', 'jpg');
        if (! $path) {
            return;
        }

        if ($category?->image) {
            $this->deleteStoredImage($category->image);
        }
        $data['image'] = $path;
    }

    private function deleteStoredImage(?string $path): void
    {
        if (! $path || str_starts_with($path, 'http')) {
            return;
        }

        $relative = ltrim($path, '/');
        if (str_starts_with($relative, 'uploads/')) {
            PublicUploader::delete($relative);

            return;
        }

        Storage::disk('public')->delete($relative);
    }

    private function sanitizeCategoryData(array $data): array
    {
        $data['name'] = trim((string) ($data['name'] ?? ''));
        $data['parent_id'] = (! empty($data['parent_id']) && is_numeric($data['parent_id']))
            ? (int) $data['parent_id']
            : null;
        $data['position'] = (isset($data['position']) && trim((string) $data['position']) !== '')
            ? max(0, (int) $data['position'])
            : 0;

        foreach (['icon', 'description', 'meta_title', 'meta_description', 'meta_keywords'] as $field) {
            if (isset($data[$field])) {
                $trimmed = trim((string) $data[$field]);
                $data[$field] = $trimmed !== '' ? $trimmed : null;
            }
        }

        return $data;
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: Str::random(8);
        $base = Str::limit($base, 100, '');
        $slug = $base;
        $i = 2;
        while (Category::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    public function toggle(Category $category)
    {
        $category->update(['is_active' => ! $category->is_active]);

        return back()->with(
            'status',
            $category->is_active
                ? 'Category activated successfully.'
                : 'Category deactivated successfully.'
        );
    }
}
