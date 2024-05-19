import { gql } from "@apollo/client";

const GET_ALL_ACCOUNTS = gql`
  query ListAllAccount {
    listAllAccount {
      id
      detailType
      mainType
      name
      code
      isActive
      systemDefaultCode
      currency {
        id
        name
        symbol
        decimalPlaces
      }
    }
  }
`;

const GET_ACCOUNT = gql`
  query GetAccount($id: ID!) {
    getAccount(id: $id) {
      id
      businessId
      detailType
      mainType
      name
      code
      description
      isActive
      isSystemDefault
      createdAt
      updatedAt
      recentTransactions {
        id
        businessId
        description
        transactionDateTime
        baseDebit
        baseCredit
        baseClosingBalance
        foreignDebit
        foreignCredit
        foreignClosingBalance
        exchangeRate
      }
      parentAccount {
        id
        businessId
        detailType
        mainType
        name
        code
        description
        isActive
        isSystemDefault
        createdAt
        updatedAt
      }
      branches
      currencyId
      accountNumber
      accountClosingBalance {
        businessId
        accountId
        transactionDate
        debit
        credit
        balance
        runningBalance
      }
    }
  }
`;

const GET_ACCOUNTS = gql`
  query ListAccount($name: String, $code: String) {
    listAccount(name: $name, code: $code) {
      id
      detailType
      mainType
      name
      code
      description
      isActive
      isSystemDefault
      systemDefaultCode
      accountNumber
      currencyId
      branches
      accountClosingBalance {
        runningBalance
      }
      recentTransactions {
        id
        transactionDateTime
        baseDebit
        baseCredit
        foreignCurrency {
          id
          name
          symbol
          decimalPlaces
        }
        foreignDebit
        foreignCredit
        accountJournal {
          id
          transactionDetails
          referenceType
        }
      }
      parentAccount {
        id
        name
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

const AccountQueries = {
  GET_ALL_ACCOUNTS,
  GET_ACCOUNTS,
  GET_ACCOUNT,
  GET_ACCOUNT_TYPE_SUMMARY_REPORT,
  GET_PAGINATED_ACCOUNT_TRANSACTION_REPORT,
};

export default AccountQueries;
