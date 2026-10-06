import fs from 'fs';
import path from 'path';

const root = process.cwd();
const src = path.join(root, 'src');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function moveDir(from, to) {
  const srcDir = path.join(root, from);
  const destDir = path.join(root, to);
  if (!fs.existsSync(srcDir)) {
    console.warn(`Skip move: ${from} not found`);
    return;
  }
  ensureDir(path.dirname(destDir));
  fs.cpSync(srcDir, destDir, { recursive: true, force: true });
  fs.rmSync(srcDir, { recursive: true, force: true });
  console.log(`Moved ${from} -> ${to}`);
}

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (typeof from === 'string') {
      if (!content.includes(from)) continue;
      content = content.split(from).join(to);
      changed = true;
    } else if (from instanceof RegExp) {
      if (!from.test(content)) continue;
      content = content.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.relative(root, filePath)}`);
  }
}

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) cb(full);
  }
}

// 1. Move modules ke lokasi baru
moveDir('src/features/purchase/purchase-orders', 'src/features/inventory/purchase-orders');
moveDir('src/features/purchase/good-receipts', 'src/features/inventory/good-receipts');
moveDir('src/features/purchase/vendor-payments', 'src/features/finance/vendor-payments');

const legacyPurchaseDir = path.join(src, 'features', 'purchase');
if (fs.existsSync(legacyPurchaseDir)) {
  fs.rmSync(legacyPurchaseDir, { recursive: true, force: true });
  console.log('Removed legacy src/features/purchase');
}

// 2. Endpoint prefix replacements (service files only)
const endpointReplacements = [
  ['/purchase/purchase-orders', '/api/inventory/purchase-orders'],
  ['/purchase/purchase-order-items', '/api/inventory/purchase-order-items'],
  ['/purchase/export', '/api/inventory/export'],
  ['/purchase/good-receipts', '/api/inventory/good-receipts'],
  ['/purchase/good-receipt-items', '/api/inventory/good-receipt-items'],
  ['/purchase/vendor-payments', '/api/finance/vendor-payments'],
];

const serviceDirs = [
  'src/features/inventory/purchase-orders/services',
  'src/features/inventory/good-receipts/services',
  'src/features/finance/vendor-payments/services',
  'src/features/inventory/stock-movement/services',
  'src/features/inventory/stock-opname/services',
  'src/features/inventory/prediction/services',
];

for (const dir of serviceDirs) {
  walk(path.join(root, dir), (file) => replaceInFile(file, endpointReplacements));
}

// Existing inventory endpoints yang belum punya /api/inventory prefix
const inventoryEndpointRegex = /(?<!\/api\/)inventory\/(stock-movements|stock-opnames|rop\/model-metrics|rop\/predict)/g;
for (const dir of serviceDirs) {
  walk(path.join(root, dir), (file) => {
    let content = fs.readFileSync(file, 'utf8');
    if (inventoryEndpointRegex.test(content)) {
      content = content.replace(inventoryEndpointRegex, '/api/inventory/$1');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated inventory endpoints in ${path.relative(root, file)}`);
    }
  });
}

// 3. Refactor service files agar pakai centralized api client (skip auth)
function refactorService(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (file.includes('auth')) return;
  if (!/const\s+\w+ApiClient\s*=/.test(content) && !/axios\.create/.test(content)) return;
  if (content.includes('import api from')) return;

  const rel = path
    .relative(path.dirname(file), path.join(src, 'lib', 'api.ts'))
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');

  const needsAxios = /axios\.(isAxiosError|AxiosError)/.test(content);

  content = content.replace(/import\s+\{\s*env\s*\}\s+from\s+['"][^'"]*config\/env['"];\r?\n?/g, '');
  content = content.replace(/import\s+axios\s+from\s+['"]axios['"];\r?\n?/g, '');
  content = `import api from '${rel}';\n${content}`;

  if (needsAxios) {
    content = `import axios from 'axios';\n${content}`;
  }

  content = content.replace(/const\s+\w+ApiClient\s*=\s*axios\.create\s*\(\{[\s\S]*?\}\);\s*/g, '');
  content = content.replace(/\b\w+ApiClient\./g, 'api.');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Refactored ${path.relative(root, file)}`);
}

walk(path.join(src, 'features'), (file) => {
  if (file.includes('auth')) return;
  if (/[Ss]ervice\.(ts|js)$/.test(file)) refactorService(file);
});

// 4. Ganti routing/navigation lama
const routeReplacements = [
  ['/purchase/purchase-orders', '/inventory/purchase-orders'],
  ['/purchase/good-receipts', '/inventory/good-receipts'],
  ['/purchase/vendor-payments', '/finance/vendor-payments'],
  ['to="/purchase"', 'to="/inventory/purchase-orders"'],
  ["to='/purchase'", "to='/inventory/purchase-orders'"],
];
walk(src, (file) => replaceInFile(file, routeReplacements));

// 5. Fix import cross-module (stock-movement -> purchase-orders)
replaceInFile(path.join(src, 'features/inventory/stock-movement/components/ReferenceModal.tsx'), [
  ["'../../../purchase/purchase-orders/", "'../../purchase-orders/"],
  ['"../../../purchase/purchase-orders/', '"../../purchase-orders/'],
]);

// 6. Sesuaikan Purchase Order status flow
replaceInFile(path.join(src, 'features/inventory/purchase-orders/types/purchaseOrder.types.ts'), [
  ["'draft' | 'approved' | 'delivered' | 'cancelled' | 'pending' | 'partially_received' | 'completed'", "'draft' | 'pending' | 'partially_received' | 'completed'"],
]);

replaceInFile(path.join(src, 'features/inventory/purchase-orders/schemas/purchaseOrder.schema.ts'), [
  ["z.enum(['draft', 'approved', 'delivered', 'cancelled'])", "z.enum(['draft', 'pending', 'partially_received', 'completed'])"],
  [/export const purchaseOrderStatusResponseSchema = z\.any\(\)\.transform\([\s\S]*?\}\);/g, 'export const purchaseOrderStatusResponseSchema = purchaseOrderStatusSchema;'],
]);

replaceInFile(path.join(src, 'features/inventory/purchase-orders/components/PurchaseOrdersFilterBar.tsx'), [
  ['<option value="approved">Approved</option>\n              <option value="delivered">Delivered</option>', '<option value="pending">Pending</option>\n              <option value="partially_received">Partially Received</option>'],
]);

replaceInFile(path.join(src, 'features/inventory/purchase-orders/components/PurchaseOrdersTable.tsx'), [
  ["if (status === 'delivered') return <Badge variant=\"success\">Delivered</Badge>;", "if (status === 'completed') return <Badge variant=\"success\">Completed</Badge>;"],
  ["if (status === 'approved') return <Badge variant=\"warning\">Approved</Badge>;", "if (status === 'pending') return <Badge variant=\"warning\">Pending</Badge>;\n          if (status === 'partially_received') return <Badge variant=\"default\">Partially Received</Badge>;"],
]);

replaceInFile(path.join(src, 'features/inventory/purchase-orders/details/DetailsPurchaseOrderPage.tsx'), [
  ["{purchaseOrder.status === 'delivered' ? (", "{purchaseOrder.status === 'completed' ? ("],
  ['<Badge variant="success">Delivered</Badge>', '<Badge variant="success">Completed</Badge>'],
  [") : purchaseOrder.status === 'approved' ? (", ") : purchaseOrder.status === 'pending' ? ("],
  ['<Badge variant="warning">Approved</Badge>', '<Badge variant="warning">Pending</Badge>'],
  [") : purchaseOrder.status === 'cancelled' ? (", ") : purchaseOrder.status === 'partially_received' ? (\n                <Badge variant=\"default\">Partially Received</Badge>\n              ) : purchaseOrder.status === 'cancelled' ? ("],
]);

replaceInFile(path.join(src, 'features/inventory/purchase-orders/hooks/usePurchaseOrderFilters.ts'), [
  [
    /const status = \(\(\) => \{[\s\S]*?\}\)\(\);/g,
    `const status = (() => {
    const text = statusRaw.trim().toLowerCase();
    if (!text) return '';
    if (['draft', 'pending', 'partially_received', 'completed', 'cancelled'].includes(text)) return text;
    return '';
  })();`,
  ],
]);

console.log('Restructure complete.');
