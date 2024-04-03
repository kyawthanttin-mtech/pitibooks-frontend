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
} from "./pages";
import {
  Bills,
  PaymentsMade,
  PurchaseOrders,
  PurchaseReceives,
  VendorCredits,
  Vendors,
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
  DetailedGeneralLedger,
  GeneralLedger,
  JournalReport,
  Reports,
  TrialBalance,
} from "./pages/reports";
import {
  Profile,
  Warehouses,
  Branches,
  BranchesNew,
  BranchesEdit,
  Currencies,
  OpeningBalances,
  TransactionNumberSeries,
  Users,
  Roles,
} from "./pages/settings";

import TaxRates from "./pages/settings/TaxRates";
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
      //Purchases
      {
        path: "vendors",
        Component: Vendors,
      },
      {
        path: "purchaseOrders",
        Component: PurchaseOrders,
      },
      {
        path: "purchaseReceives",
        Component: PurchaseReceives,
      },
      {
        path: "bills",
        Component: Bills,
      },
      {
        path: "paymentsMade",
        Component: PaymentsMade,
      },
      {
        path: "vendorCredits",
        Component: VendorCredits,
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
        path: "journalReport",
        Component: JournalReport,
      },
      {
        path: "accountTransactions",
        Component: AccountTransactions,
      },
      {
        path: "accountTypeSummary",
        Component: AccountTypeSummary,
      },
      {
        path: "generalLedger",
        Component: GeneralLedger,
      },
      {
        path: "detailedGeneralLedger",
        Component: DetailedGeneralLedger,
      },
      {
        path: "trialBalance",
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
        path: "branch/new",
        Component: BranchesNew,
      },
      {
        path: "branch/edit",
        Component: BranchesEdit,
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
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
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
