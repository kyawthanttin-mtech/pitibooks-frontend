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
          description
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
      fromDate: $toDate
      toDate: $fromDate
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
            accountTransactions {
              account {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const GET_DETAILED_GENERAL_LEDGER_REPORT = gql`
  query GetDetailedGeneralLedgerReport(
    $fromDate: Time!
    $toDate: Time!
    $reportType: String!
    $branchId: Int
  ) {
    getDetailedGeneralLedgerReport(
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
    ) {
      accountId
      accountName
      openingBalance
      openingBalanceDate
      closingBalance
      closingBalanceDate
      transactions {
        accountName
        transactionDateTime
        description
        transactionDateTime
        transactionNo
        transactionType
        customerName
        supplierName
        debit
        credit
      }
    }
  }
`;

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

const ReportQueries = {
  GET_PAGINATED_JOURNAL_REPORTS,
  GET_ACCOUNT_TYPE_SUMMARY_REPORT,
  GET_PAGINATED_ACCOUNT_TRANSACTION_REPORT,
  GET_DETAILED_GENERAL_LEDGER_REPORT,
  GET_GENERAL_LEDGER_REPORT,
};

export default ReportQueries;
