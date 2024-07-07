import { gql } from "@apollo/client";

const GET_ALL_CURRENCIES = gql`
  query GetAllCurrencies {
    listAllCurrency {
      id
      symbol
      name
      decimalPlaces
      isActive
    }
  }
`;

const GET_CURRENCIES = gql`
  query GetCurrencies {
    listCurrency {
      id
      symbol
      name
      decimalPlaces
      isActive
    }
  }
`;
const CurrencyQueries = {
  GET_ALL_CURRENCIES,
  GET_CURRENCIES,
};

export default CurrencyQueries;
