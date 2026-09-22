const fs = require('fs');
const path = require('path');

const files = [
  'resources/js/Pages/Admin/Admins/Form.jsx',
  'resources/js/Pages/Admin/Admins/Index.jsx',
  'resources/js/Pages/Admin/Banners/Form.jsx',
  'resources/js/Pages/Admin/Banners/Index.jsx',
  'resources/js/Pages/Admin/Categories/Form.jsx',
  'resources/js/Pages/Admin/ContactFields/Form.jsx',
  'resources/js/Pages/Admin/ContactFields/Index.jsx',
  'resources/js/Pages/Admin/Coupons/Form.jsx',
  'resources/js/Pages/Admin/Coupons/Index.jsx',
  'resources/js/Pages/Admin/Features/Form.jsx',
  'resources/js/Pages/Admin/Features/Index.jsx',
  'resources/js/Pages/Admin/LandingPages/Form.jsx',
  'resources/js/Pages/Admin/LandingPages/Index.jsx',
  'resources/js/Pages/Admin/Messages/Index.jsx',
  'resources/js/Pages/Admin/Messages/Show.jsx',
  'resources/js/Pages/Admin/Orders/Index.jsx',
  'resources/js/Pages/Admin/Orders/Show.jsx',
  'resources/js/Pages/Admin/Products/Form.jsx',
  'resources/js/Pages/Admin/Products/Index.jsx',
  'resources/js/Pages/Admin/Reviews/Index.jsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace inline confirms: onClick={() => { if(window.confirm('MSG')) router.delete('URL'); }}
  content = content.replace(/if\s*\(\s*window\.confirm\((['"`].+?['"`])\)\s*\)\s*(router\.[a-z]+\([^;]+\));/g, 
    "window.showConfirm($1, () => $2);");

  // Replace bulk action confirms: if (bulkAction === 'delete' && !window.confirm(`...`)) return; router.post(...)
  content = content.replace(/if\s*\(\s*bulkAction\s*===\s*['"]delete['"]\s*&&\s*!window\.confirm\((['"`].+?['"`])\)\s*\)\s*return;/g,
    "if (bulkAction === 'delete') { window.showConfirm($1, () => { router.post('/admin/' + window.location.pathname.split('/')[2] + '/bulk', { ids: selected, bulk_action: bulkAction }, { onSuccess: () => { setSelected([]); setBulkAction(''); } }); }); return; }");

  // Replace multi-line if (!window.confirm) return; router.delete(...)
  content = content.replace(/if\s*\(\s*!window\.confirm\((['"`].+?['"`])\)\s*\)\s*return;\s*(router\.[a-z]+\([^;]+\);)/g,
    "window.showConfirm($1, () => { $2 });");

  fs.writeFileSync(filePath, content);
});

console.log('Fixed confirms');
