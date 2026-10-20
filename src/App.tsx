import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth';
import { DashboardPage } from './features/dashboard/DashboardPage';
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
import { CreatePurchaseOrderPage } from './features/inventory/purchase-orders/create/CreatePurchaseOrderPage';
import { DetailsPurchaseOrderPage } from './features/inventory/purchase-orders/details/DetailsPurchaseOrderPage';
import { EditPurchaseOrderPage } from './features/inventory/purchase-orders/edit/EditPurchaseOrderPage';
import { PurchaseOrdersPage } from './features/inventory/purchase-orders/views/PurchaseOrdersPage';
import { GoodReceiptsPage } from './features/inventory/good-receipts/views/GoodReceiptsPage';
import { CreateGoodReceiptPage } from './features/inventory/good-receipts/create/create';
import { DetailsGoodReceiptPage } from './features/inventory/good-receipts/details/details';
import { EditGoodReceiptPage } from './features/inventory/good-receipts/edit/edit';
import { SalesInvoicesPage } from './features/sales/invoice/views/SalesInvoicesPage';
import { CreateSalesInvoicePage } from './features/sales/invoice/create/create';
import { DetailsSalesInvoicePage } from './features/sales/invoice/details/details';
import { EditSalesInvoicePage } from './features/sales/invoice/edit/EditSalesInvoicePage';
import { AdminLayout } from './layouts/AdminLayout';
import VendorPaymentPage from './features/finance/vendor-payments/views/VendorPaymentPage';
import { VendorPaymentCreatePage } from './features/finance/vendor-payments/views/VendorPaymentCreatePage';
import { VendorPaymentDetailPage } from './features/finance/vendor-payments/views/VendorPaymentDetailPage';
import { VendorPaymentEditPage } from './features/finance/vendor-payments/views/VendorPaymentEditPage';
import { WarehousesPage } from './features/masterdata/warehouses/views/WarehousePage';
import { CreateWarehousesPage } from './features/masterdata/warehouses/create/create';
import { InventoryPage } from './features/inventory/InventoryPage';
import { TechPacksPage } from './features/rd/tech-pack/TechPacksPage';
import { CreateTechPackPage } from './features/rd/tech-pack/CreateTechPackPage';
import { CostingPage } from './features/rd/costing/CostingPage';
import { SampleApprovalPage } from './features/rd/sample-approval/SampleApprovalPage';
import { WorkOrdersPage } from './features/production/work-orders/WorkOrdersPage';
import { TrackingPage } from './features/production/tracking/TrackingPage';
import { MaterialChecklistPage } from './features/production/material-checklist/MaterialChecklistPage';
import { ProductionGoodReceiptsPage } from './features/production/good-receipts/ProductionGoodReceiptsPage';
import { CreateProductionGoodReceiptPage } from './features/production/good-receipts/CreateProductionGoodReceiptPage';
import { CustomerPaymentsPage } from './features/finance/customer-payments/CustomerPaymentsPage';
import { CreateCustomerPaymentPage } from './features/finance/customer-payments/CreateCustomerPaymentPage';
import { AccountsPage as FinanceAccountsPage } from './features/finance/accounts/AccountsPage';
import { SizeChartsPage } from './features/masterdata/size-charts/SizeChartsPage';
import './App.css';

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

            {/* Sales */}
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

            {/* Redirect legacy Purchase URLs */}
            <Route path="purchase" element={<Navigate to="/inventory/purchase-orders" replace />} />
            <Route path="purchase/purchase-orders/*" element={<Navigate to="/inventory/purchase-orders" replace />} />
            <Route path="purchase/good-receipts/*" element={<Navigate to="/inventory/good-receipts" replace />} />
            <Route path="purchase/vendor-payments/*" element={<Navigate to="/finance/vendor-payments" replace />} />

            <Route path="banking" element={<BankingPage />} />

            {/* R&D */}
            <Route path="rd" element={<Navigate to="/rd/tech-packs" replace />} />
            <Route path="rd/tech-packs" element={<TechPacksPage />} />
            <Route path="rd/tech-packs/create" element={<CreateTechPackPage />} />
            <Route path="rd/costing" element={<CostingPage />} />
            <Route path="rd/sample-approval" element={<SampleApprovalPage />} />

            {/* Production & Material */}
            <Route path="production" element={<Navigate to="/production/work-orders" replace />} />
            <Route path="production/work-orders" element={<WorkOrdersPage />} />
            <Route path="production/tracking" element={<TrackingPage />} />
            <Route path="production/material-checklist" element={<MaterialChecklistPage />} />
            <Route path="production/good-receipts" element={<ProductionGoodReceiptsPage />} />
            <Route path="production/good-receipts/create" element={<CreateProductionGoodReceiptPage />} />

            {/* Finance */}
            <Route path="finance" element={<Navigate to="/finance/customer-payments" replace />} />
            <Route path="finance/customer-payments" element={<CustomerPaymentsPage />} />
            <Route path="finance/customer-payments/create" element={<CreateCustomerPaymentPage />} />
            <Route path="finance/vendor-payments" element={<VendorPaymentPage />} />
            <Route path="finance/vendor-payments/create" element={<VendorPaymentCreatePage />} />
            <Route path="finance/vendor-payments/:vendorPaymentId" element={<VendorPaymentDetailPage />} />
            <Route path="finance/vendor-payments/:vendorPaymentId/edit" element={<VendorPaymentEditPage />} />
            <Route path="finance/accounts" element={<FinanceAccountsPage />} />

            {/* Masterdata */}
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
            <Route path="masterdata/size-charts" element={<SizeChartsPage />} />
            <Route path="items/create" element={<CreateItemsPage />} />

            {/* Inventory & Procurement */}
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="inventory/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
            <Route path="inventory/purchase-orders/:purchaseOrderId" element={<DetailsPurchaseOrderPage />} />
            <Route path="inventory/purchase-orders/:purchaseOrderId/edit" element={<EditPurchaseOrderPage />} />
            <Route path="inventory/good-receipts" element={<GoodReceiptsPage />} />
            <Route path="inventory/good-receipts/create" element={<CreateGoodReceiptPage />} />
            <Route path="inventory/good-receipts/:goodReceiptId" element={<DetailsGoodReceiptPage />} />
            <Route path="inventory/good-receipts/:goodReceiptId/edit" element={<EditGoodReceiptPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
