import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import {
  HomePage,
  LoginPage,
  MainLayout,
  // BranchEditPage,
  // BranchNewPage,
  // BranchPage,
  // CategoryPage,
  // ProductPage,
} from "./pages";
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
  ShipmentPreferences,
  PaymentModes,
  DeliveryMethods,
  Reasons,
  SalesPersons,
} from "./pages/purchases";
import {
  Products,
  InventoryAdjustments,
  ProductGroups,
  TransferOrder,
  ProductGroupsNew,
  OpeningStock,
  InventoryAdjustmentsNew,
  TransferOrderNew,
  ProductsNew,
  ProductCategories,
  ProductUnits,
  ProductsEdit,
  ProductGroupsEdit,
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
  TrialBalance,
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
} from "./pages/settings";
import { Customers, CustomersEdit, CustomersNew } from "./pages/sales";

import InvoicesPage from "./pages/InvoicesPage";
import TaxRates from "./pages/settings/TaxRates";
// import TaxSettings from "./pages/settings/TaxSettings";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

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
      //   path: "branches",
      //   Component: BranchPage,
      // },
      // {
      //   path: "branches/edit",
      //   Component: BranchEditPage,
      // },
      // {
      //   path: "branches/new",
      //   Component: BranchNewPage,
      // },
      // {
      //   path: "categories",
      //   Component: CategoryPage,
      // },
      // {
      //   path: "products",
      //   Component: ProductPage,
      // },
      {
        path: "invoices",
        Component: InvoicesPage,
      },

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
        Component: TransferOrderNew,
      },
      {
        path: "transferOrders",
        Component: TransferOrder,
      },
      {
        path: "productCategories",
        Component: ProductCategories,
      },
      {
        path: "productUnits",
        Component: ProductUnits,
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
