import { gql } from "@apollo/client";

const GET_PAGINATED_EXPENSES = gql`
  query PaginateExpense(
    $limit: Int = 10
    $after: String
    $expenseAccountId: Int
    $assetAccountId: Int
    $fromDate: Time
    $toDate: Time
    $branchId: Int
    $referenceNumber: String
  ) {
    paginateExpense(
      limit: $limit
      after: $after
      expenseAccountId: $expenseAccountId
      assetAccountId: $assetAccountId
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
      referenceNumber: $referenceNumber
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
          expenseAccount {
            id
            name
          }
          assetAccount {
            id
            name
          }
          branch {
            id
            name
          }
          bankCharges
          expenseDate
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          exchangeRate
          amount
          taxAmount
          totalAmount
          supplier {
            id
            name
          }
          customer {
            id
            name
          }
          referenceNumber
          notes
          expenseTax {
            id
            name
            rate
            type
          }
          isTaxInclusive
          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
        }
      }
    }
  }
`;

const ExpenseQueries = {
  GET_PAGINATED_EXPENSES,
};

export default ExpenseQueries;
