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
        branch {
          id
          name
        }
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
    }
  }
`;

const BankingQueries = {
    GET_BANKING_ACCOUNTS,
};
  
export default BankingQueries;
  