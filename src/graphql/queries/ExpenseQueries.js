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
          businessId
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
          referenceNumber
          expenseDate
          notes
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          supplier {
            id
            name
          }
          customer {
            id
            name
          }
          amount
          taxAmount
          totalAmount
          isTaxInclusive
          exchangeRate
          expenseTax {
            id
            name
            rate
            type
          }
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const ExpenseQueries = {
  GET_PAGINATED_EXPENSES,
};

export default ExpenseQueries;
