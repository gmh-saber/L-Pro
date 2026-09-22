import { useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Head, Link, router } from '@inertiajs/react';
import ProductCard from '@/Components/Storefront/ProductCard';

export default function ShopPage({ 
  products, 
  activeCategory, 
  categories, 
  allProductsCount, 
  brands, 
  sort, 
  minRating, 
  q, 
  priceCeiling,
  app
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const title = activeCategory 
    ? activeCategory.name 
    : q ? `Search: ${q}` : 'Shop All Products';

  const maxPrice = Math.max(1000, parseInt(priceCeiling || 100000));
  
  // Get query params from current URL
  const urlParams = new URLSearchParams(window.location.search);
  const minVal = urlParams.get('min') || '';
  const maxVal = urlParams.get('max') || '';
  const activeBrand = urlParams.get('brand') || '';
  const onSale = urlParams.get('on_sale') === '1' || urlParams.get('flash') === '1';
  const inStock = urlParams.get('in_stock') === '1';

  const formAction = activeCategory ? `/category/${activeCategory.slug}` : '/shop';

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Clean up empty params
    Object.keys(data).forEach(key => {
      if (!data[key]) delete data[key];
    });

    router.get(formAction, data, { preserveState: true });
    setIsFilterOpen(false);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('page');
    if (newSort) {
      currentParams.set('sort', newSort);
    } else {
      currentParams.delete('sort');
    }
    
    router.get(`${formAction}?${currentParams.toString()}`, {}, { preserveState: true });
  };

  const buildFilterUrl = (key, value) => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('page');
    if (value === null) {
      currentParams.delete(key);
    } else {
      currentParams.set(key, value);
    }
    return `${formAction}?${currentParams.toString()}`;
  };

  return (
    <StorefrontLayout>
      <Head title={title} />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-5 py-5 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          
          {/* Overlay for mobile filter */}
          {isFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-[70] lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          {/* ===== FILTER SIDEBAR ===== */}
          <aside className={`fixed inset-y-0 left-0 z-[80] w-[300px] max-w-[90%] bg-white p-4 shadow-2xl transition-transform duration-300 overflow-y-auto lg:static lg:z-auto lg:w-[270px] lg:shrink-0 lg:translate-x-0 lg:overflow-visible lg:p-0 lg:shadow-none lg:bg-transparent lg:transition-none ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <form onSubmit={handleFilterSubmit} className="bg-white rounded-xl border border-gray-100 p-5 space-y-6 lg:sticky lg:top-24">
              
              {minRating && <input type="hidden" name="min_rating" value={minRating} />}
              {q && <input type="hidden" name="q" value={q} />}
              
              <div className="flex items-center justify-between lg:hidden border-b border-gray-100 pb-3 -mt-1">
                <span className="font-extrabold text-gray-900 text-lg">Filters</span>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="grid h-8 w-8 place-items-center rounded-md bg-gray-50 text-gray-500 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18"/></svg>
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Categories</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/shop" className={`flex items-center justify-between group ${!activeCategory ? 'text-[#f15a24] font-bold' : 'text-gray-600 hover:text-[#f15a24]'}`}>
                      <span className="truncate">All Products</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${!activeCategory ? 'bg-[#f15a24]/10 text-[#f15a24]' : 'bg-gray-100 text-gray-500 group-hover:bg-[#f15a24]/10 group-hover:text-[#f15a24]'}`}>
                        {allProductsCount || categories.reduce((acc, cat) => acc + cat.products_count, 0)}
                      </span>
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link href={`/category/${cat.slug}`} className={`flex items-center justify-between group ${activeCategory?.id === cat.id ? 'text-[#f15a24] font-bold' : 'text-gray-600 hover:text-[#f15a24]'}`}>
                        <span className="truncate">{cat.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory?.id === cat.id ? 'bg-[#f15a24]/10 text-[#f15a24]' : 'bg-gray-100 text-gray-500 group-hover:bg-[#f15a24]/10 group-hover:text-[#f15a24]'}`}>
                          {cat.products_count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Price Range</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#f15a24] focus-within:ring-1 focus-within:ring-[#f15a24] transition-all">
                    <span className="pl-3 text-xs text-gray-400 font-medium">৳</span>
                    <input type="number" name="min" min="0" max={maxPrice} defaultValue={minVal} placeholder="Min" className="w-full min-w-0 px-2 py-2 text-sm focus:outline-none bg-transparent" />
                  </div>
                  <span className="text-gray-400 shrink-0">–</span>
                  <div className="flex items-center flex-1 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#f15a24] focus-within:ring-1 focus-within:ring-[#f15a24] transition-all">
                    <span className="pl-3 text-xs text-gray-400 font-medium">৳</span>
                    <input type="number" name="max" min="0" max={maxPrice} defaultValue={maxVal} placeholder="Max" className="w-full min-w-0 px-2 py-2 text-sm focus:outline-none bg-transparent" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100"></div>

              {/* Average Rating */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Average Rating</h3>
                <ul className="space-y-2.5 text-sm">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const isActive = minRating == stars;
                    return (
                      <li key={stars}>
                        <Link href={buildFilterUrl('min_rating', stars)} className={`flex items-center gap-2 text-gray-600 hover:text-[#f15a24] ${isActive ? 'font-bold text-[#f15a24]' : ''}`}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-[#f15a24] border-[#f15a24]' : 'border-gray-300'}`}>
                            {isActive && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <span className="text-amber-400 tracking-tight leading-none text-base">{'★'.repeat(stars)}</span>
                            <span className="text-gray-200 tracking-tight leading-none text-base">{'★'.repeat(5 - stars)}</span>
                          </div>
                          <span className="text-xs text-gray-500">& Up</span>
                        </Link>
                      </li>
                    );
                  })}
                  {minRating && (
                    <li className="pt-1">
                      <Link href={buildFilterUrl('min_rating', null)} className="text-xs font-semibold text-[#f15a24] hover:underline pl-6">Clear rating</Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Product Tags (brands) */}
              {brands?.length > 0 && (
                <>
                  <div className="h-px bg-gray-100"></div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Brands</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto text-sm pr-2 custom-scrollbar">
                      {brands.map((brand) => (
                        <li key={brand}>
                          <label className="flex items-center gap-2.5 cursor-pointer text-gray-600 hover:text-[#f15a24] group">
                            <input type="radio" name="brand" value={brand} defaultChecked={activeBrand === brand} className="w-4 h-4 text-[#f15a24] border-gray-300 focus:ring-[#f15a24]" />
                            <span className="truncate group-hover:font-medium">{brand}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className="h-px bg-gray-100"></div>

              {/* Product Status */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Availability</h3>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <label className="flex items-center gap-2.5 cursor-pointer text-gray-600 hover:text-[#f15a24] group">
                      <input type="checkbox" name="on_sale" value="1" defaultChecked={onSale} className="w-4 h-4 rounded text-[#f15a24] border-gray-300 focus:ring-[#f15a24]" />
                      <span className="group-hover:font-medium">On Sale</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center gap-2.5 cursor-pointer text-gray-600 hover:text-[#f15a24] group">
                      <input type="checkbox" name="in_stock" value="1" defaultChecked={inStock} className="w-4 h-4 rounded text-[#f15a24] border-gray-300 focus:ring-[#f15a24]" />
                      <span className="group-hover:font-medium">In Stock</span>
                    </label>
                  </li>
                </ul>
              </div>

              <div className="pt-2 space-y-3 sticky bottom-0 bg-white border-t border-gray-50 -mx-5 px-5 pt-4 mt-6">
                <button type="submit" className="w-full rounded-full bg-[#f15a24] text-white text-sm font-bold py-3 hover:bg-[#d94a1a] transition shadow-md shadow-[#f15a24]/20">
                  Apply Filters
                </button>
                <Link href={formAction} className="block w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition py-1">
                  Reset All
                </Link>
              </div>
            </form>
          </aside>

          {/* ===== RESULTS ===== */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <button type="button" onClick={() => setIsFilterOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                <svg className="h-4 w-4 text-[#f15a24]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                Filters
              </button>
              <p className="text-sm text-gray-500"><span className="font-bold text-gray-900">{products.total}</span> items</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 mt-1 hidden lg:block"><span className="font-bold text-gray-900">{products.total}</span> products found</p>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                <select 
                  value={sort || ''} 
                  onChange={handleSortChange} 
                  className="w-full sm:w-48 border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-[#f15a24] focus:border-[#f15a24] bg-gray-50 cursor-pointer font-medium text-gray-700"
                >
                  <option value="">Sort: Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {products.data.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 sm:p-20 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                <p className="text-sm mb-6">Try adjusting your filters or search term to find what you're looking for.</p>
                <Link href="/shop" className="inline-flex bg-[#f15a24]/10 text-[#f15a24] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#f15a24] hover:text-white transition-colors">
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                  {products.data.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {products.last_page > 1 && (
                  <nav className="mt-10 flex justify-center">
                    <ul className="flex items-center gap-1 sm:gap-2">
                      {products.links.map((link, idx) => {
                        const isPrevOrNext = link.label.includes('Previous') || link.label.includes('Next');
                        const label = link.label.replace('&laquo; Previous', 'Prev').replace('Next &raquo;', 'Next');
                        
                        if (!link.url) {
                          return (
                            <li key={idx}>
                              <span className={`px-3 sm:px-4 py-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium ${!isPrevOrNext ? 'hidden sm:inline-block' : ''}`}>
                                {label}
                              </span>
                            </li>
                          );
                        }

                        return (
                          <li key={idx}>
                            <Link 
                              href={link.url}
                              className={`px-3 sm:px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                link.active 
                                  ? 'bg-[#f15a24] border-[#f15a24] text-white shadow-sm shadow-[#f15a24]/20' 
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#f15a24] hover:text-[#f15a24]'
                              } ${!isPrevOrNext && !link.active ? 'hidden sm:inline-flex' : 'inline-flex'}`}
                            >
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </StorefrontLayout>
  );
}