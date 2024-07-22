import { gql } from "@apollo/client";

const GET_BANKING_ACCOUNTS = gql`
  query ListBankingAccount {
    listBankingAccount {
      listBankingAccount {
        id
        name
        code
        detailType
        mainType
        isActive
        systemDefaultCode
        balance
        recentTransactions {
          id
          transactionDate
          amount
          referenceNumber
          description
          transactionType
          exchangeRate
          taxAmount
          bankCharges
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          fromAccount {
            id
            name
            code
            currency {
              id
              name
              symbol
              decimalPlaces
            }
          }
          toAccount {
            id
            name
            code
            currency {
              id
              name
              symbol
              decimalPlaces
            }
          }
          paymentMode {
            id
            name
            isActive
          }
          supplier {
            id
            name
            phone
            mobile
          }
          customer {
            id
            name
            email
            phone
          }
          details {
            id
            invoiceNo
            bankingTransactionId
            dueAmount
            paymentAmount
            dueDate
          }
        }
        currency {
          id
          decimalPlaces
          name
          symbol
          isActive
        }
        branches
      }
      totalSummary {
        detailType
        currencySymbol
        totalBalance
      }
    }
  }
`;

const BankingQueries = {
  GET_BANKING_ACCOUNTS,
};

export default BankingQueries;
