import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PurchasePage } from './features/purchase/PurchasePage';
import { SalesOrdersPage } from './features/sales/sales-order/views/SalesOrderPage';
import { CreateSalesOrderPage } from './features/sales/sales-order/create/CreateSalesOrderPage';
import { DetailsSalesOrderPage } from './features/sales/sales-order/details/DetailsSalesOrderPage';
import { EditSalesOrderPage } from './features/sales/sales-order/edit/EditSalesOrderPage';
import { CreateSalesDeliveryPage } from './features/sales/sales-delivery/create/create';
import { SalesDeliveriesPage } from './features/sales/sales-delivery/views/SalesDeliveriesPage';
import { DetailsSalesDeliveryPage } from './features/sales/sales-delivery/details/DetailsSalesDeliveryPage';
import { EditSalesDeliveryPage } from './features/sales/sales-delivery/edit/EditSalesDeliveryPage';
import { BankingPage } from './features/banking/BankingPage';
import { MasterdataPage } from './features/masterdata/MasterdataPage';
import { UnitsPage } from './features/masterdata/units/views/UnitsPage';
import { ProductsPage } from './features/masterdata/items/views/ProductsPage';
import { VendorsPage } from './features/masterdata/vendors/views/VendorsPage';
import { CustomersPage } from './features/masterdata/customers/views/CustomersPage';
import { AccountsPage } from './features/masterdata/accounts/views/AccountsPage';
import { PricelistsPage } from './features/masterdata/pricelists/views/PricelistsPage';
import { CreatePricelistPage } from './features/masterdata/pricelists/create/create';
import { CreateItemsPage } from './features/masterdata/items/create/create';
import { CreatePurchaseOrderPage } from './features/purchase/purchase-orders/create/CreatePurchaseOrderPage';
import { DetailsPurchaseOrderPage } from './features/purchase/purchase-orders/details/DetailsPurchaseOrderPage';
import { EditPurchaseOrderPage } from './features/purchase/purchase-orders/edit/EditPurchaseOrderPage';
import { PurchaseOrdersPage } from './features/purchase/purchase-orders/views/PurchaseOrdersPage';
import { GoodReceiptsPage } from './features/purchase/good-receipts/views/GoodReceiptsPage';
import { CreateGoodReceiptPage } from './features/purchase/good-receipts/create/create';
import { DetailsGoodReceiptPage } from './features/purchase/good-receipts/details/details';
import { EditGoodReceiptPage } from './features/purchase/good-receipts/edit/edit';
import { SalesInvoicesPage } from './features/sales/invoice/views/SalesInvoicesPage';
import { CreateSalesInvoicePage } from './features/sales/invoice/create/create';
import { DetailsSalesInvoicePage } from './features/sales/invoice/details/details';
import { EditSalesInvoicePage } from './features/sales/invoice/edit/EditSalesInvoicePage';
import { AdminLayout } from './layouts/AdminLayout';
import VendorPaymentPage from './features/purchase/vendor-payments/views/VendorPaymentPage';
import { VendorPaymentCreatePage } from './features/purchase/vendor-payments/views/VendorPaymentCreatePage';
import { VendorPaymentDetailPage } from './features/purchase/vendor-payments/views/VendorPaymentDetailPage';
import { VendorPaymentEditPage } from './features/purchase/vendor-payments/views/VendorPaymentEditPage';
import { WarehousesPage } from './features/masterdata/warehouses/views/WarehousePage';
import { CreateWarehousesPage } from './features/masterdata/warehouses/create/create';
import { InventoryPage } from './features/inventory/InventoryPage';
import { StockMovementsPage } from './features/inventory/stock-movement/views/StockMovementsPage';
import { CreateStockMovementPage } from './features/inventory/stock-movement/create/CreateStockMovementPage';
import { DetailsStockMovementPage } from './features/inventory/stock-movement/details/DetailsStockMovementPage';
import { EditStockMovementPage } from './features/inventory/stock-movement/edit/EditStockMovementPage';
import { StockOpnamesPage } from './features/inventory/stock-opname/views/StockOpnamesPage';
import { CreateStockOpnamePage } from './features/inventory/stock-opname/create/CreateStockOpnamePage';
import { DetailsStockOpnamePage } from './features/inventory/stock-opname/details/DetailsStockOpnamePage';
import { EditStockOpnamePage } from './features/inventory/stock-opname/edit/EditStockOpnamePage';
import { ReportsPage } from './features/inventory/reports/ReportsPage';
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sales/sales-orders" element={<SalesOrdersPage />} />
            <Route path="sales/sales-orders/create" element={<CreateSalesOrderPage />} />
            <Route path="sales/sales-orders/:salesOrderId" element={<DetailsSalesOrderPage />} />
            <Route path="sales/sales-orders/:salesOrderId/edit" element={<EditSalesOrderPage />} />
            <Route path="sales/sales-deliveries/create" element={<CreateSalesDeliveryPage />} />
            <Route path="sales/sales-deliveries" element={<SalesDeliveriesPage />} />
            <Route path="sales/sales-deliveries/:id" element={<DetailsSalesDeliveryPage />} />
            <Route path="sales/sales-deliveries/:id/edit" element={<EditSalesDeliveryPage />} />
            <Route path="sales/sales-invoices" element={<SalesInvoicesPage />} />
            <Route path="sales/sales-invoices/create" element={<CreateSalesInvoicePage />} />
            <Route path="sales/sales-invoices/:invoiceId" element={<DetailsSalesInvoicePage />} />
            <Route path="sales/sales-invoices/:invoiceId/edit" element={<EditSalesInvoicePage />} />
            <Route path="purchase" element={<PurchasePage />} />
            <Route path="purchase/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="purchase/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
            <Route path="purchase/purchase-orders/:purchaseOrderId" element={<DetailsPurchaseOrderPage />} />
            <Route path="purchase/purchase-orders/:purchaseOrderId/edit" element={<EditPurchaseOrderPage />} />
            <Route path="purchase/good-receipts" element={<GoodReceiptsPage />} />
            <Route path="purchase/good-receipts/create" element={<CreateGoodReceiptPage />} />
            <Route path="purchase/good-receipts/:goodReceiptId" element={<DetailsGoodReceiptPage />} />
            <Route path="purchase/good-receipts/:goodReceiptId/edit" element={<EditGoodReceiptPage />} />
            <Route path="banking" element={<BankingPage />} />
            <Route path="categories" element={<Navigate to="/masterdata/categories" replace />} />
            <Route path="masterdata" element={<Navigate to="/masterdata/categories" replace />} />
            <Route path="masterdata/categories" element={<MasterdataPage />} />
            <Route path="masterdata/units" element={<UnitsPage />} />
            <Route path="masterdata/products" element={<ProductsPage />} />
            <Route path="masterdata/vendors" element={<VendorsPage />} />
            <Route path="masterdata/customers" element={<CustomersPage />} />
            <Route path="masterdata/accounts" element={<AccountsPage />} />
            <Route path="masterdata/pricelists" element={<PricelistsPage />} />
            <Route path="masterdata/pricelists/create" element={<CreatePricelistPage />} />
            <Route path="masterdata/warehouses" element={<WarehousesPage />} />
            <Route path="masterdata/warehouses/create" element={<CreateWarehousesPage />} />
            <Route path="items/create" element={<CreateItemsPage />} />
            <Route path="purchase/vendor-payments" element={<VendorPaymentPage />} />
            <Route path="purchase/vendor-payments/create" element={<VendorPaymentCreatePage />} />
            <Route path="purchase/vendor-payments/:vendorPaymentId" element={<VendorPaymentDetailPage />} />
            <Route path="purchase/vendor-payments/:vendorPaymentId/edit" element={<VendorPaymentEditPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/stock-movements" element={<StockMovementsPage />} />
            <Route path="inventory/stock-movements/create" element={<CreateStockMovementPage />} />
            <Route path="inventory/stock-movements/:id" element={<DetailsStockMovementPage />} />
            <Route path="inventory/stock-movements/:id/edit" element={<EditStockMovementPage />} />
            <Route path="inventory/stock-opname" element={<StockOpnamesPage />} />
            <Route path="inventory/stock-opname/create" element={<CreateStockOpnamePage />} />
            <Route path="inventory/stock-opname/:id" element={<DetailsStockOpnamePage />} />
            <Route path="inventory/stock-opname/:id/edit" element={<EditStockOpnamePage />} />
            <Route path="inventory/reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
