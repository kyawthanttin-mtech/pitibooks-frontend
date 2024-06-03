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
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      description
      branches
      recentTransactions {
        id
        description
        transactionDateTime
        baseDebit
        baseCredit
        baseClosingBalance
        foreignDebit
        foreignCredit
        foreignClosingBalance
        exchangeRate
        accountJournal {
          id
          businessId
          transactionDateTime
          transactionNumber
          transactionDetails
          referenceNumber
          referenceId
          referenceType
        }
        account {
          id
          businessId
          accountNumber
          currencyId
          branches
          detailType
          mainType
          name
          code
          description
          isActive
          isSystemDefault
          systemDefaultCode
        }
        branch {
          name
          id
        }
      }
    }
  }
`;

const BankingQueries = {
  GET_BANKING_ACCOUNTS,
};

export default BankingQueries;
