import { gql } from "@apollo/client";

const GET_PAGINATED_JOURNAL_REPORTS = gql`
  query GetJournalReport(
    $limit: Int = 10
    $after: String
    $fromDate: Time!
    $toDate: Time!
    $reportType: String! = "asdf"
    $branchId: Int
  ) {
    paginateJournalReport(
      limit: $limit
      after: $after
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          businessId
          branch {
            id
            name
          }
          transactionDateTime
          transactionNumber
          customer {
            id
            name
          }
          supplier {
            id
            name
          }
          referenceId
          referenceType
          accountTransactions {
            id
          }
          accountTransactions {
            id
            baseDebit
            baseCredit
            account {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const GET_ACCOUNT_TYPE_SUMMARY_REPORT = gql`
  query GetAccountTypeSummaryReport(
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
  ) {
    getAccountTypeSummaryReport(
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
    ) {
      accountMainType
      accountSummaries {
        accountName
        accountMainType
        code
        debit
        credit
        balance
      }
    }
  }
`;

const GET_PAGINATED_ACCOUNT_TRANSACTION_REPORT = gql`
  query GetPaginatedAccountTransactionReport(
    $limit: Int = 10
    $after: String
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    paginateAccountTransactionReport(
      limit: $limit
      after: $after
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          transactionDateTime
          description
          account {
            id
            name
          }
          branch {
            id
            name
          }
          transactionDateTime
          baseDebit
          baseCredit
          baseClosingBalance
          accountJournal {
            customer {
              name
            }
            supplier {
              name
            }
            referenceType
            transactionNumber
            transactionDetails
            referenceNumber
          }
        }
      }
    }
  }
`;

// const GET_DETAILED_GENERAL_LEDGER_REPORT = gql`
//   query GetDetailedGeneralLedgerReport(
//     $fromDate: Time!
//     $toDate: Time!
//     $reportType: String!
//     $branchId: Int
//   ) {
//     getDetailedGeneralLedgerReport(
//       fromDate: $fromDate
//       toDate: $toDate
//       reportType: $reportType
//       branchId: $branchId
//     ) {
//       accountId
//       accountName
//       openingBalance
//       openingBalanceDate
//       closingBalance
//       closingBalanceDate
//       transactions {
//         accountName
//         transactionDateTime
//         description
//         transactionDateTime
//         transactionNumber
//         transactionDetails
//         referenceNumber
//         transactionType
//         customerName
//         supplierName
//         debit
//         credit
//       }
//     }
//   }
// `;

const GET_GENERAL_LEDGER_REPORT = gql`
  query GetGeneralLedgerReport(
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getGeneralLedgerReport(
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      accountId
      accountName
      accountCode
      accountMainType
      code
      debit
      credit
      balance
      closingBalance
      openingBalance
    }
  }
`;

const GET_TRIAL_BALANCE_REPORT = gql`
  query GetTrialBalanceReport(
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getTrialBalanceReport(
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      accountMainType
      accountName
      accountId
      accountCode
      debit
      credit
    }
  }
`;

const GET_BALANCE_SHEET_REPORT = gql`
  query GetBalanceSheetReport(
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getBalanceSheetReport(
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      mainType
      total
      accounts {
        groupType
        total
        accounts {
          subType
          total
          accounts {
            accountName
            accountId
            amount
          }
        }
      }
    }
  }
`;

const GET_PROFIT_AND_LOSS_REPORT = gql`
  query GetProfitAndLossReport(
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getProfitAndLossReport(
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      grossProfit
      operatingProfit
      netProfit
      plAccountGroups {
        groupType
        total
        accounts {
          mainType
          detailType
          accountName
          accountId
          amount
        }
      }
    }
  }
`;

const GET_PAGINATED_DETAILED_GENERAL_LEDGER_REPORT = gql`
  query PaginateDetailedGeneralLedgerReport(
    $limit: Int = 10
    $after: String
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    paginateDetailedGeneralLedgerReport(
      limit: $limit
      after: $after
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      edges {
        cursor
        node {
          accountId
          accountName
          currencyId
          currencyName
          currencySymbol
          openingBalance
          openingBalanceDate
          closingBalance
          closingBalanceDate
          transactions {
            accountId
            accountName
            branchId
            transactionDateTime
            description
            debit
            credit
            transactionType
            transactionNumber
            transactionDetails
            referenceNumber
            customerName
            supplierName
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`;

const GET_CASH_FLOW_REPORT = gql`
  query GetCashFlowReport(
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getCashFlowReport(
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      beginCashBalance
      netChange
      endCashBalance
      cashAccountGroups {
        groupName
        total
        accounts {
          accountName
          accountCode
          accountID
          amount
        }
      }
    }
  }
`;

const GET_MOVEMENT_OF_EQUITY_REPORT = gql`
  query GetMovementOfEquityReport(
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getMovementOfEquityReport(
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      openingBalance
      netChange
      closingBalance
      accountGroups {
        groupName
        total
        accounts {
          accountName
          accountCode
          accountID
          amount
        }
      }
    }
  }
`;

const GET_SALES_BY_CUSTOMER_REPORT = gql`
  query GetSalesByCustomerReport(
    $fromDate: Time!
    $toDate: Time!
    $branchId: Int
  ) {
    getSalesByCustomerReport(
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
    ) {
      CustomerId
      CustomerName
      InvoiceCount
      TotalSales
      TotalSalesWithTax
    }
  }
`;

const GET_SALES_BY_SALES_PERSON_REPORT = gql`
  query GetSalesBySalesPersonReport(
    $fromDate: Time!
    $toDate: Time!
    $branchId: Int
  ) {
    getSalesBySalesPersonReport(
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
    ) {
      SalesPersonId
      SalesPersonName
      InvoiceCount
      TotalInvoiceSales
      TotalInvoiceSalesWithTax
      CreditNoteCount
      TotalCreditNoteSales
      TotalCreditNoteSalesWithTax
      TotalSales
      TotalSalesWithTax
    }
  }
`;

const GET_SALES_BY_PRODUCT_REPORT = gql`
  query GetSalesByProductReport(
    $fromDate: Time!
    $toDate: Time!
    $branchId: Int
  ) {
    getSalesByProductReport(
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
    ) {
      productName
      productSku
      soldQty
      totalAmount
      totalAmountWithDiscount
      averagePrice
    }
  }
`;

const GET_INVENTORY_SUMMARY_REPORT = gql`
  query GetInventorySummaryReport($toDate: Time!) {
    getInventorySummaryReport(toDate: $toDate) {
      productName
      productUnit {
        name
        abbreviation
        precision
        id
      }
      productSku
      orderQty
      receivedQty
      saleQty
      committedQty
      currentQty
      availableStock
    }
  }
`;

const GET_PRODUCT_SALES_REPORT = gql`
  query GetProductSalesReport(
    $fromDate: Time!
    $toDate: Time!
    $branchId: Int
  ) {
    getProductSalesReport(
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
    ) {
      productName
      productSku
      soldQty
      totalAmount
      totalAmountWithTax
      margin
    }
  }
`;

const GET_AR_AGING_SUMMARY_REPORT = gql`
  query GetARAgingSummaryReport($currentDate: Time!, $branchId: Int) {
    getARAgingSummaryReport(currentDate: $currentDate, branchId: $branchId) {
      customerName
      customerId
      current
      int1to15
      int16to30
      int31to45
      int46plus
      invoiceCount
      currencySymbol
      total
      totalFcy
    }
  }
`;

const GET_STOCK_SUMMARY_REPORT = gql`
  query GetStockSummaryReport(
    $fromDate: Time!
    $toDate: Time!
    $warehouseId: Int
  ) {
    getStockSummaryReport(
      fromDate: $fromDate
      toDate: $toDate
      warehouseId: $warehouseId
    ) {
      productName
      productSku
      openingStock
      qtyIn
      qtyOut
      closingStock
    }
  }
`;

const GET_AP_AGING_SUMMARY_REPORT = gql`
  query GetAPAgingSummaryReport($currentDate: Time!, $branchId: Int) {
    getAPAgingSummaryReport(currentDate: $currentDate, branchId: $branchId) {
      supplierId
      supplierName
      current
      int31to45
      int1to15
      int16to30
      int46plus
      currencySymbol
      total
      totalFcy
      billCount
    }
  }
`;

const GET_AP_AGING_DETAIL_REPORT = gql`
  query GetAPAgingDetailReport($currentDate: Time!) {
    getAPAgingDetailReport(currentDate: $currentDate) {
      interval
      amount
      balanceDue
      details {
        billId
        billDate
        billNumber
        billStatus
        supplierId
        supplierName
        age
        currencySymbol
        totalAmount
        remainingBalance
        totalAmountFcy
        remainingBalanceFcy
      }
    }
  }
`;

const GET_AR_AGING_DETAIL_REPORT = gql`
  query GetARAgingDetailReport($currentDate: Time!) {
    getARAgingDetailReport(currentDate: $currentDate, warehouseId: 1) {
      interval
      amount
      balanceDue
      details {
        invoiceId
        invoiceDate
        invoiceNumber
        invoiceStatus
        customerId
        customerName
        age
        currencySymbol
        totalAmount
        remainingBalance
        totalAmountFcy
        remainingBalanceFcy
      }
    }
  }
`;

const ReportQueries = {
  GET_PAGINATED_JOURNAL_REPORTS,
  GET_ACCOUNT_TYPE_SUMMARY_REPORT,
  GET_PAGINATED_ACCOUNT_TRANSACTION_REPORT,
  // GET_DETAILED_GENERAL_LEDGER_REPORT,
  GET_PAGINATED_DETAILED_GENERAL_LEDGER_REPORT,
  GET_GENERAL_LEDGER_REPORT,
  GET_TRIAL_BALANCE_REPORT,
  GET_BALANCE_SHEET_REPORT,
  GET_PROFIT_AND_LOSS_REPORT,
  GET_CASH_FLOW_REPORT,
  GET_MOVEMENT_OF_EQUITY_REPORT,
  GET_SALES_BY_CUSTOMER_REPORT,
  GET_SALES_BY_SALES_PERSON_REPORT,
  GET_SALES_BY_PRODUCT_REPORT,
  GET_INVENTORY_SUMMARY_REPORT,
  GET_PRODUCT_SALES_REPORT,
  GET_AR_AGING_SUMMARY_REPORT,
  GET_STOCK_SUMMARY_REPORT,
  GET_AP_AGING_SUMMARY_REPORT,
  GET_AP_AGING_DETAIL_REPORT,
  GET_AR_AGING_DETAIL_REPORT,
};

export default ReportQueries;
