import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import { HomePage, LoginPage, MainLayout } from "./pages";
import {
  Bills,
  Expenses,
  ExpensesNew,
  ExpensesEdit,
  PaymentsMade,
  PurchaseOrders,
  PurchaseOrdersNew,
  SupplierCredits,
  Suppliers,
  SuppliersNew,
  SuppliersEdit,
  BillsNew,
  BillsEdit,
  SupplierCreditsNew,
  SupplierCreditsEdit,
  PurchaseOrdersEdit,
  PaymentsMadeNew,
} from "./pages/purchases";
import {
  Products,
  InventoryAdjustments,
  ProductGroups,
  TransferOrders,
  ProductGroupsNew,
  OpeningStock,
  InventoryAdjustmentsNew,
  TransferOrdersNew,
  ProductsNew,
  ProductCategories,
  ProductUnits,
  ProductsEdit,
  ProductGroupsEdit,
  TransferOrdersEdit,
  InventoryAdjustmentsEdit,
} from "./pages/products";
import {
  ManualJournals,
  ChartOfAccounts,
  ManualJournalsNew,
  ManualJournalsEdit,
} from "./pages/accountant";
import {
  AccountTransactions,
  AccountTypeSummary,
  BalanceSheet,
  DetailedGeneralLedger,
  GeneralLedger,
  JournalReport,
  ProfitAndLoss,
  Reports,
  SalesByCustomer,
  SalesByProduct,
  SalesBySalesPerson,
  TrialBalance,
  InventoryValuationSummary,
  ProductSalesReport,
  StockSummaryReport,
  CashFlowReport,
  MovementOfEquity,
  InventorySummary,
  APAgingSummary,
  PayableSummary,
  PayableDetails,
  PurchaseOrderDetails,
  SupplierBalanceSummary,
  InvoiceDetails,
  SalesOrderDetails,
  CustomerBalances,
  CustomerBalanceSummary,
} from "./pages/reports";
import {
  Profile,
  Warehouses,
  Branches,
  Currencies,
  OpeningBalances,
  TransactionNumberSeries,
  // Taxes,
  Users,
  Roles,
  ShipmentPreferences,
  PaymentModes,
  DeliveryMethods,
  Reasons,
  SalesPersons,
  OpeningBalancesEdit,
} from "./pages/settings";
import {
  CreditNotes,
  CreditNotesEdit,
  CreditNotesNew,
  Customers,
  CustomersEdit,
  CustomersNew,
  Invoices,
  InvoicesEdit,
  InvoicesNew,
  PaymentsReceived,
  SalesOrders,
  SalesOrdersEdit,
  SalesOrdersNew,
} from "./pages/sales";

import TaxRates from "./pages/settings/TaxRates";
// import TaxSettings from "./pages/settings/TaxSettings";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import Banking from "./pages/banking/Banking";
import PaymentsMadeEdit from "./pages/purchases/PaymentsMadeEdit";
import PaymentsReceivedNew from "./pages/sales/PaymentsReceivedNew";
import PaymentsReceivedEdit from "./pages/sales/PaymentsReceivedEdit";
import { AllTransactions } from "./pages/banking";

if (process.env.NODE_ENV !== "production") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

function IsLoggedIn() {
  return !!localStorage.getItem("token");
}

const router = createHashRouter([
  {
    id: "root",
    path: "/",
    loader: protectedLoader,
    Component: MainLayout,
    children: [
      {
        index: true,
        loader: protectedLoader,
        Component: HomePage,
      },
      // {
      //   path: "invoices",
      //   Component: InvoicesPage,
      // },

      //Products
      {
        path: "Products",
        Component: Products,
      },
      {
        path: "products/new",
        Component: ProductsNew,
      },
      {
        path: "products/edit",
        Component: ProductsEdit,
      },
      {
        path: "inventoryAdjustments",
        Component: InventoryAdjustments,
      },
      {
        path: "inventoryAdjustments/new",
        Component: InventoryAdjustmentsNew,
      },
      {
        path: "inventoryAdjustments/edit",
        Component: InventoryAdjustmentsEdit,
      },
      {
        path: "productGroups",
        Component: ProductGroups,
      },
      {
        path: "productGroups/new",
        Component: ProductGroupsNew,
      },
      {
        path: "productGroups/edit",
        Component: ProductGroupsEdit,
      },
      {
        path: "openingStock",
        Component: OpeningStock,
      },
      {
        path: "transferOrders/new",
        Component: TransferOrdersNew,
      },
      {
        path: "transferOrders/edit",
        Component: TransferOrdersEdit,
      },
      {
        path: "transferOrders",
        Component: TransferOrders,
      },
      {
        path: "productCategories",
        Component: ProductCategories,
      },
      {
        path: "productUnits",
        Component: ProductUnits,
      },
      {
        path: "banking",
        Component: Banking,
      },
      {
        path: "banking/allTransactions",
        Component: AllTransactions,
      },
      // Sales
      {
        path: "customers",
        Component: Customers,
      },
      {
        path: "customers/new",
        Component: CustomersNew,
      },
      {
        path: "customers/edit",
        Component: CustomersEdit,
      },
      {
        path: "salesOrders",
        Component: SalesOrders,
      },
      {
        path: "salesOrders/new",
        Component: SalesOrdersNew,
      },
      {
        path: "salesOrders/edit",
        Component: SalesOrdersEdit,
      },
      {
        path: "paymentsReceived",
        Component: PaymentsReceived,
      },
      {
        path: "paymentsReceived/new",
        Component: PaymentsReceivedNew,
      },
      {
        path: "paymentsReceived/edit",
        Component: PaymentsReceivedEdit,
      },
      {
        path: "invoices",
        Component: Invoices,
      },
      {
        path: "invoices/new",
        Component: InvoicesNew,
      },
      {
        path: "invoices/edit",
        Component: InvoicesEdit,
      },
      {
        path: "creditNotes",
        Component: CreditNotes,
      },
      {
        path: "creditNotes/new",
        Component: CreditNotesNew,
      },
      {
        path: "creditNotes/edit",
        Component: CreditNotesEdit,
      },
      //Purchases
      {
        path: "suppliers",
        Component: Suppliers,
      },
      {
        path: "suppliers/new",
        Component: SuppliersNew,
      },
      {
        path: "suppliers/edit",
        Component: SuppliersEdit,
      },
      {
        path: "expenses",
        Component: Expenses,
      },
      {
        path: "expenses/new",
        Component: ExpensesNew,
      },
      {
        path: "expenses/edit",
        Component: ExpensesEdit,
      },
      {
        path: "purchaseOrders",
        Component: PurchaseOrders,
      },
      {
        path: "purchaseOrders/new",
        Component: PurchaseOrdersNew,
      },
      {
        path: "purchaseOrders/edit",
        Component: PurchaseOrdersEdit,
      },
      {
        path: "bills",
        Component: Bills,
      },
      {
        path: "bills/new",
        Component: BillsNew,
      },
      {
        path: "bills/edit",
        Component: BillsEdit,
      },
      {
        path: "paymentsMade",
        Component: PaymentsMade,
      },
      {
        path: "paymentsMade/new",
        Component: PaymentsMadeNew,
      },
      {
        path: "paymentsMade/edit",
        Component: PaymentsMadeEdit,
      },
      {
        path: "supplierCredits",
        Component: SupplierCredits,
      },
      {
        path: "supplierCredits/new",
        Component: SupplierCreditsNew,
      },
      {
        path: "supplierCredits/edit",
        Component: SupplierCreditsEdit,
      },
      //Accountant
      {
        path: "manualJournals",
        Component: ManualJournals,
      },
      {
        path: "manualJournals/new",
        Component: ManualJournalsNew,
      },
      {
        path: "manualJournals/edit",
        Component: ManualJournalsEdit,
      },
      {
        path: "chartOfAccounts",
        Component: ChartOfAccounts,
      },
      //Reports
      {
        path: "reports",
        Component: Reports,
      },
      {
        path: "reports/balanceSheet",
        Component: BalanceSheet,
      },
      {
        path: "reports/profitAndLoss",
        Component: ProfitAndLoss,
      },
      {
        path: "reports/journalReport",
        Component: JournalReport,
      },
      {
        path: "reports/accountTransactions",
        Component: AccountTransactions,
      },
      {
        path: "reports/accountTypeSummary",
        Component: AccountTypeSummary,
      },
      {
        path: "reports/generalLedger",
        Component: GeneralLedger,
      },
      {
        path: "reports/detailedGeneralLedger",
        Component: DetailedGeneralLedger,
      },
      {
        path: "reports/trialBalance",
        Component: TrialBalance,
      },
      {
        path: "reports/salesByCustomer",
        Component: SalesByCustomer,
      },
      {
        path: "reports/salesBySalesPerson",
        Component: SalesBySalesPerson,
      },
      {
        path: "reports/salesByProduct",
        Component: SalesByProduct,
      },
      {
        path: "reports/productSalesReport",
        Component: ProductSalesReport,
      },
      {
        path: "reports/inventorySummary",
        Component: InventorySummary,
      },
      {
        path: "reports/inventoryValuationSummary",
        Component: InventoryValuationSummary,
      },
      {
        path: "reports/stockSummaryReport",
        Component: StockSummaryReport,
      },
      {
        path: "reports/cashFlowReport",
        Component: CashFlowReport,
      },
      {
        path: "reports/movementOfEquity",
        Component: MovementOfEquity,
      },
      {
        path: "reports/apAgingSummary",
        Component: APAgingSummary,
      },
      {
        path: "reports/payableSummary",
        Component: PayableSummary,
      },
      {
        path: "reports/payableDetails",
        Component: PayableDetails,
      },
      {
        path: "reports/purchaseOrderDetails",
        Component: PurchaseOrderDetails,
      },
      {
        path: "reports/supplierBalanceSummary",
        Component: SupplierBalanceSummary,
      },
      {
        path: "reports/invoiceDetails",
        Component: InvoiceDetails,
      },
      {
        path: "reports/salesOrderDetails",
        Component: SalesOrderDetails,
      },
      {
        path: "reports/customerBalances",
        Component: CustomerBalances,
      },
      {
        path: "reports/customerBalanceSummary",
        Component: CustomerBalanceSummary,
      },
      //Settings
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "warehouses",
        Component: Warehouses,
      },
      {
        path: "branch",
        Component: Branches,
      },
      {
        path: "currencies",
        Component: Currencies,
      },
      {
        path: "openingBalances",
        Component: OpeningBalances,
      },
      {
        path: "openingBalances/edit",
        Component: OpeningBalancesEdit,
      },
      {
        path: "transactionNumberSeries",
        Component: TransactionNumberSeries,
      },
      // {
      //   path: "taxes",
      //   index: "taxes/rates",
      //   Component: Taxes,
      //   children: [
      //     {
      //       path: "rates",
      //       Component: TaxRates,
      //     },
      //     {
      //       path: "settings",
      //       Component: TaxSettings,
      //     },
      //   ],
      // },
      {
        path: "taxes",
        Component: TaxRates,
      },
      {
        path: "users",
        Component: Users,
      },
      {
        path: "roles",
        Component: Roles,
      },
      {
        path: "shipmentPreferences",
        Component: ShipmentPreferences,
      },
      {
        path: "paymentModes",
        Component: PaymentModes,
      },
      {
        path: "deliveryMethods",
        Component: DeliveryMethods,
      },
      {
        path: "reasons",
        Component: Reasons,
      },
      {
        path: "salesPersons",
        Component: SalesPersons,
      },
    ],
  },

  {
    path: "login",
    loader: loginLoader,
    Component: LoginPage,
  },
  {
    path: "/logout",
    loader: logoutLoader,
  },
]);

function loginLoader() {
  if (IsLoggedIn()) {
    return redirect("/");
  }
  return null;
}

function logoutLoader() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  localStorage.removeItem("module");
  localStorage.removeItem("businessName");
  localStorage.removeItem("baseCurrencyId");
  localStorage.removeItem("baseCurrencyName");
  localStorage.removeItem("fiscalYear");
  localStorage.removeItem("timezone");
  return redirect("/");
}

function protectedLoader({ request }) {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication
  if (!IsLoggedIn()) {
    let params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/login?" + params.toString());
  }
  return null;
}

export default function App() {
  return <RouterProvider router={router} />;
}
