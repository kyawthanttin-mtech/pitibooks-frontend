import { gql } from "@apollo/client";

const GET_BANKING_ACCOUNTS = gql`
  query ListBankingAccount {
    listBankingAccount {
      id
      name
      code
      detailType
      mainType
      isActive
      systemDefaultCode
      balance
      accountNumber
      description
      currency {
        id
        decimalPlaces
        exchangeRate
        name
        symbol
        isActive
      }
      recentTransactions {
        id
        transactionDate
        amount
        referenceNumber
        description
        isMoneyIn
        transactionType
        exchangeRate
        taxAmount
        bankCharges
        branch {
          id
          name
          isActive
        }
        fromAccount {
          id
          name
          code
          detailType
          mainType
          isActive
          systemDefaultCode
          currency {
            id
            decimalPlaces
            exchangeRate
            name
            symbol
          }
        }
        toAccount {
          id
          name
          code
          detailType
          mainType
          isActive
          systemDefaultCode
          currency {
            id
            decimalPlaces
            exchangeRate
            name
            symbol
          }
        }
        paymentMode {
          id
          name
        }
        currency {
          id
          decimalPlaces
          exchangeRate
          name
          symbol
        }
        supplier {
          id
          name
          supplierPaymentTerms
          supplierPaymentTermsCustomDays
          notes
          exchangeRate
          openingBalanceBranchId
          openingBalance
          prepaidCreditAmount
          unusedCreditAmount
          isActive
          createdAt
          updatedAt
        }
        customer {
          id
          name
          openingBalanceBranchId
          openingBalance
          exchangeRate
          customerPaymentTerms
          customerPaymentTermsCustomDays
          notes
          prepaidCreditAmount
          unusedCreditAmount
          creditLimit
          isActive
          createdAt
          updatedAt
        }
        documents {
          id
          documentUrl
          referenceType
          referenceID
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
      branches
    }
  }
`;

const BankingQueries = {
  GET_BANKING_ACCOUNTS,
};

export default BankingQueries;
