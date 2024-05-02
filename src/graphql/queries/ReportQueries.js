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
};

export default ReportQueries;
