import { gql } from "@apollo/client";

const GET_PAGINATE_BANKING_TRANSACTION = gql`
  query PaginateBankingTransaction(
    $limit: Int
    $after: String
    $accountId: Int
  ) {
    paginateBankingTransaction(
      limit: $limit
      after: $after
      accountId: $accountId
    ) {
      edges {
        cursor
        node {
          id
          transactionDate
          amount
          referenceNumber
          description
          transactionType
          exchangeRate
          taxAmount
          bankCharges
          details {
            id
            invoiceNo
          }
          fromAccount {
            id
            name
            code
          }
          toAccount {
            id
            name
            code
          }
          supplier {
            id
            name
          }
          customer {
            id
            name
          }
          branch {
            id
            name
          }
          isMoneyIn
          paymentMode {
            id
            name
          }
          currency {
            id
            decimalPlaces
            exchangeRate
            symbol
          }
          # documents {
          #   id
          #   documentUrl
          #   referenceType
          #   referenceID
          # }
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

const BankingTransactionQueries = {
  GET_PAGINATE_BANKING_TRANSACTION,
};

export default BankingTransactionQueries;
