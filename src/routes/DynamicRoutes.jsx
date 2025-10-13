import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NewSalesNew from "../sales/NewSalesNew";
import NewSales from "../sales/NewSales";
import PastSales from "../sales/PastSales";
import AddNewProductNew from "../product/AddNewProductNew";
import ProductList from "../product/ProductList";
import BulkImportProducts from "../product/BulkImport";
import AllInvoices from "../invoices/AllInvoices";
import ShareViaWhatsApp from "../invoices/ShareViaWhatsApp";
import PrintDownloadInvoice from "../invoices/PrintDownloadInvoice";
import AddPurchase from "../purchase/AddPurchase";
import PurchaseHistory from "../purchase/PurchaseHistory";
import AddExpenses from "../expenses/AddExpenses";
import ViewExpenses from "../expenses/ViewExpenses";
import DailyMonthly from "../reports/DailyMonthly";
import GST from "../reports/GST";
import StockReport from "../reports/StockReport";
import AddCustomer from "../customers/AddCustomer";
import CustomersList from "../customers/CustomersList";
import ShopDetails from "../settings/ShopDetails";
import TaxGST from "../settings/TaxGST";
import AddNewUser from "../users/AddNewUser";
import SetRoles from "../users/SetRoles";
import ProductCategories from "../settings/ProductCategories";
import AddInventory from "../inventory/AddInventory";
import InventoryList from "../inventory/InventoryList";
import InventoryAdjustment from "../inventory/InventoryAdjustment";
import InventoryMovements from "../inventory/InventoryMovements";
import InventoryReports from "../inventory/InventoryReports";
import LowInventoryAlerts from "../inventory/LowInventoryAlerts";
import AddSupplier from "../suppliers/AddSupplier";
import SuppliersList from "../suppliers/SuppliersList";
import BarcodeGenerator from "../settings/BarcodeGenerator";
import ProductTransactions from "../product/ProductTransactions";
import SalesDashboard from "../sales/SalesDashboard";
import NewSalesInvoicePreview from "../sales/NewSalesInvoicePreview";
import Parties from "../parties/Parties";
import Items from "../items/Items";
import PurchaseDashboard from "../purchase/PurchaseDashboard";
import ReportsDashboard from "../reports/ReportsDashboard";
import MyBusiness from "../settings/MyBusiness";
import Logout from "../login/LogoutPage";
import AddParty from "../parties/AddParty";
import AddItem from "../items/AddItem";
import BulkImportItems from "../items/BulkImportItems";
import NewSalesPOS from "../sales/NewSalesPOS";
import ExpensesDashboard from "../expenses/ExpensesDashboard";
import PaymentOutDashboard from "../purchase/PaymentOutDashboard";
import AddPaymentOut from "../purchase/AddPaymentOut";
import EstimateQuotationDashboard from "../sales/EstimateQuotationDashboard";
import ProformaInvoiceDashboard from "../sales/ProformaInvoiceDashboard";
import PaymentInDashboard from "../sales/PaymentInDashboard";
import AddPaymentIn from "../sales/AddPaymentIn";
import SalesOrderDashboard from "../sales/SalesOrderDashboard";
import DeliveryChallanDashboard from "../sales/DeliveryChallanDashboard";
import SalesReturnDashboard from "../sales/SalesReturnDashboard";
import ItemCategoriesDashboard from "../items/ItemCategoriesDashboard";
import AddItemCategory from "../items/AddItemCategories";
import TransactionsReport from "../reports/TransactionsReport";
import PartyReport from "../reports/PartyReport";
import GSTReport from "../reports/GSTReport";
import ItemsReport from "../reports/ItemsReport";
import ExpensesReport from "../reports/ExpensesReport";
import SalesPurchaseOrderReport from "../reports/SalesPurchaseOrderReport";
import AddDeliveryChallan from "../sales/AddDeliveryChallan";
import AddEstimateQuotation from "../sales/AddEstimateQuotation";
import AddProformaInvoice from "../sales/AddProformaInvoice";
import AddSalesReturn from "../sales/AddSalesReturn";
import AddSalesOrder from "../sales/AddSalesOrder";

const routeComponentMap = {
  "/dashboard": <Dashboard />,
  "/sales": <SalesDashboard />,
  "/sales/new": <NewSalesNew />,
  "/sales/history": <PastSales />,
  "/products/add": <AddNewProductNew />,
  "/products": <ProductTransactions />,
  "/products/import": <BulkImportProducts />,
  "/invoices/all": <AllInvoices />,
  "/invoices/share": <ShareViaWhatsApp />,
  "/invoice/print": <PrintDownloadInvoice />,
  /* "/sales/preview": <NewSalesInvoicePreview />, */
  "/purchase/add": <AddPurchase />,
  "/purchase/history": <PurchaseHistory />,
  "/expenses/add": <AddExpenses />,
  "/expenses/view": <ViewExpenses />,
  "/reports/daily-monthly": <DailyMonthly />,
  "/reports/gst": <GST />,
  "/reports/stock": <StockReport />,
  "/customers/add": <AddCustomer />,
  "/customers/list": <CustomersList />,
  "/settings/shop": <ShopDetails />,
  "/settings/gst": <TaxGST />,
  "/users/add": <AddNewUser />,
  "/users/roles": <SetRoles />,
  "/settings/categories": <ProductCategories />,
  "/inventory/add": <AddInventory />,
  "/inventory/list": <InventoryList />,
  "/inventory/adjustment": <InventoryAdjustment />,
  "/inventory/movements": <InventoryMovements />,
  "/inventory/reports": <InventoryReports />,
  "/inventory/alerts": <LowInventoryAlerts />,
  "/suppliers/add": <AddSupplier />,
  "/suppliers/list": <SuppliersList />,
  "/settings/barcodegen": <BarcodeGenerator />,
};

const routeComponentMapNew = {
  "/home": <Dashboard />,
  "/parties": <Parties />,
  "/items": <Items />,
  "/sales": <SalesDashboard />,
  "/purchase": <PurchaseDashboard />,
  "/barcodegen": <BarcodeGenerator />,
  "/reports": <ReportsDashboard />,
  "/mybusiness": <MyBusiness />,
  "/logout": <Logout />,
  "/sales/new": <NewSalesNew />,
  "/sales/history": <PastSales />,
  "/parties/add": <AddParty />,
  "/items/add": <AddItem />,
  "/items/import": <BulkImportItems />,
  "/sales/new": <NewSalesNew />,
  "/sales/POS": <NewSalesPOS />,
  "/purchase/add": <AddPurchase />,
  "/purchase/expenses": <ExpensesDashboard />,
  "/purchase/expenses/add": <AddExpenses />,
  "/purchase/paymentout": <PaymentOutDashboard />,
  "/purchase/paymentout/add": <AddPaymentOut />,
  "/sales/estimate": <EstimateQuotationDashboard />,
  "/sales/proforma": <ProformaInvoiceDashboard />,
  "/sales/paymentin": <PaymentInDashboard />,
  "/sales/paymentin/add": <AddPaymentIn />,
  "/sales/order": <SalesOrderDashboard />,
  "/sales/deliverychallan": <DeliveryChallanDashboard />,
  "/sales/return": <SalesReturnDashboard />,
  "/items/categories": <ItemCategoriesDashboard />,
  "/items/categories/add": <AddItemCategory />,
  "/reports/transactions": <TransactionsReport />,
  "/reports/party": <PartyReport />,
  "/reports/gst": <GSTReport />,
  "/reports/items": <ItemsReport />,
  "/reports/expenses": <ExpensesReport />,
  "/reports/orders": <SalesPurchaseOrderReport />,
};

const renderRoutes = (menuItems = []) => {
  const routes = [];

  const traverse = (items) => {
    items.forEach((item) => {
      if (item.path && routeComponentMap[item.path]) {
        routes.push(
          <Route
            key={item.path}
            path={item.path}
            element={routeComponentMap[item.path]}
          />
        );
      }
      if (item.children?.length > 0) {
        traverse(item.children);
      }
    });
  };

  traverse(menuItems);
  return routes;
};

const renderRoutesNew = (menuItems = []) => {
  const routes = [];

  const traverse = (items) => {
    items.forEach((item) => {
      if (item.path && routeComponentMapNew[item.path]) {
        routes.push(
          <Route
            key={item.path}
            path={item.path}
            element={routeComponentMapNew[item.path]}
          />
        );
      }
      if (item.children?.length > 0) {
        traverse(item.children);
      }
    });
  };

  traverse(menuItems);
  return routes;
};

const DynamicRoutes = ({ menuData }) => {
  console.log("menuData", menuData);
  return (
    <Routes>
      {renderRoutesNew(menuData)}
      {/* Always-available routes independent of menu configuration */}
      <Route path="/sales/preview" element={<NewSalesInvoicePreview />} />
      <Route path="/purchase/expenses/add" element={<AddExpenses />} />
      <Route path="/sales/paymentin/add" element={<AddPaymentIn />} />
      <Route path="/sales/deliverychallan/add" element={<AddDeliveryChallan />} />
      <Route path="/items/categories/add" element={<AddItemCategory />} />
      <Route path="/purchase/paymentout/add" element={<AddPaymentOut />} />
      <Route path="/sales/estimate/add" element={<AddEstimateQuotation />} />
      <Route path="/sales/proforma/add" element={<AddProformaInvoice />} />
      <Route path="/sales/return/add" element={<AddSalesReturn />} />
      <Route path="/sales/order/add" element={<AddSalesOrder />} />

      <Route path="*" element={<h3>404 - Page Not Found</h3>} />
    </Routes>
  );
};

export default DynamicRoutes;
