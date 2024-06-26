import { DollarOutlined } from "@ant-design/icons";
import { ReactComponent as AccountantOutlined } from "../../assets/icons/AccountOutlinedVariant.svg";
import { ReactComponent as BuildingOutlined } from "../../assets/icons/BuildingOutlined.svg";
import { ReactComponent as InventoryOutlined } from "../../assets/icons/InventoryOutlined.svg";

export const reportData = [
  {
    title: "Business Overview",
    reports: [
      {
        labelId: "report.profitAndLoss",
        label: "Profit and Loss",
        to: "profitAndLoss",
      },
      {
        labelId: "report.cashFlowStatement",
        label: "Cash Flow Statement",
        to: "cashFlowReport",
      },
      {
        labelId: "report.balanceSheet",
        label: "Balance Sheet",
        to: "balanceSheet",
      },
      {
        labelId: "report.businessPerformanceRatio",
        label: "Business Performance Ratio",
        to: "businessPerformanceRatio",
      },
      {
        labelId: "report.movementOfEquity",
        label: "Movement of Equity",
        to: "movementOfEquity",
      },
    ],
    icon: <BuildingOutlined />,
  },
  {
    title: "Accountant",
    reports: [
      {
        labelId: "report.accountTransactions",
        label: "Account Transactions",
        to: "accountTransactions",
      },
      {
        labelId: "report.accountTypeSummary",
        label: "Account Type Summary",
        to: "accountTypeSummary",
      },
      {
        labelId: "report.generalLedger",
        label: "General Ledger",
        to: "generalLedger",
      },
      {
        labelId: "report.detailedGeneralLedger",
        label: "Detailed General Ledger",
        to: "detailedGeneralLedger",
      },
      {
        labelId: "report.journalReport",
        label: "Journal Report",
        to: "journalReport",
      },
      {
        labelId: "report.trialBalance",
        label: "Trial Balance",
        to: "trialBalance",
      },
    ],
    icon: <AccountantOutlined />,
  },
  {
    title: "Sales",
    reports: [
      {
        labelId: "report.salesByCustomer",
        label: "Sales by Customer",
        to: "salesByCustomer",
      },
      {
        labelId: "report.salesByProduct",
        label: "Sales by Product",
        to: "salesByProduct",
      },
      {
        labelId: "report.salesBySalesPerson",
        label: "Sales by Sales Person",
        to: "salesBySalesPerson",
      },
    ],
    icon: <DollarOutlined />,
  },
  {
    title: "Inventory",
    reports: [
      {
        labelId: "report.inventorySummary",
        label: "Inventory Summary",
        to: "inventorySummary",
      },
      {
        labelId: "report.stockSummaryReport",
        label: "Stock Summary Report",
        to: "stockSummaryReport",
      },
      {
        labelId: "report.inventoryValuationSummary",
        label: "Inventory Valuation Summary",
        to: "inventoryValuationSummary",
      },
      {
        labelId: "report.productSalesReport",
        label: "Product Sales Report",
        to: "productSalesReport",
      },
    ],
    icon: <InventoryOutlined />,
  },
  {
    title: "Payables",
    reports: [
      {
        labelId: "report.apAgingSummary",
        label: "AP Aging Summary",
        to: "apAgingSummary",
      },
      {
        labelId: "report.apAgingDetails",
        label: "AP Aging Details",
        to: "apAgingDetails",
      },
      {
        labelId: "report.billsDetails",
        label: "Bills Details",
        to: "billsDetails",
      },
      {
        labelId: "report.supplierBalance",
        label: "Supplier Balance",
        to: "supplierBalance",
      },
      {
        labelId: "report.supplierBalanceSummary",
        label: "Supplier Balance Summary",
        to: "supplierBalanceSummary",
      },
      {
        labelId: "report.purchaseOrderDetails",
        label: "Purchase Order Details",
        to: "purchaseOrderDetails",
      },
      {
        labelId: "report.payableSummary",
        label: "Payable Summary",
        to: "payableSummary",
      },
      {
        labelId: "report.payableDetails",
        label: "Payable Details",
        to: "payableDetails",
      },
    ],
    icon: <InventoryOutlined />,
  },
  {
    title: "Receivables",
    reports: [
      {
        labelId: "report.arAgingSummary",
        label: "AR Aging Summary",
        to: "arAgingSummary",
      },
      {
        labelId: "report.arAgingDetails",
        label: "AR Aging Details",
        to: "arAgingDetails",
      },
      {
        labelId: "report.invoiceDetails",
        label: "Invoice Details",
        to: "invoiceDetails",
      },
      {
        labelId: "report.salesOrderDetails",
        label: "Sales Order Details",
        to: "salesOrderDetails",
      },
      {
        labelId: "report.customerBalances",
        label: "Customer Balances",
        to: "customerBalances",
      },
      {
        labelId: "report.customerBalanceSummary",
        label: "Customer Balance Summary",
        to: "customerBalanceSummary",
      },
      {
        labelId: "report.receivableSummary",
        label: "Receivable Summary",
        to: "receivableSummary",
      },
      {
        labelId: "report.receivableDetails",
        label: "Receivable Details",
        to: "receivableDetails",
      },
      {
        labelId: "report.supplierBalanceDetails",
        label: "Supplier Balance Details",
        to: "supplierBalanceDetails",
      },
    ],
    icon: <InventoryOutlined />,
  },
  {
    title: "Purchase",
    reports: [
      {
        labelId: "report.purchaseBySupplier",
        label: "Purchase By Supplier",
        to: "purchaseBySupplier",
      },
      {
        labelId: "report.purchaseByProduct",
        label: "Purchase By Product",
        to: "purchaseByProduct",
      },
    ],
    icon: <InventoryOutlined />,
  },
  {
    title: "Payments Received",
    reports: [
      {
        labelId: "report.paymentsReceived",
        label: "Payments Received",
        to: "paymentsReceived",
      },
      {
        labelId: "report.refundHistory",
        label: "Refund History",
        to: "refundHistory",
      },
      {
        labelId: "report.creditNoteDetails",
        label: "Credit Note Details",
        to: "creditNoteDetails",
      },
    ],
    icon: <InventoryOutlined />,
  },
  {
    title: "Payments Made",
    reports: [
      {
        labelId: "report.refundHistory",
        label: "Refund History",
        to: "refundHistory",
      },
    ],
    icon: <InventoryOutlined />,
  },
];
