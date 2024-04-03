import { gql } from "@apollo/client";

const GET_ALL_CURRENCIES = gql`
  query GetAllCurrencies {
    listAllCurrency {
      id
      name
      symbol
      decimalPlaces
      exchangeRate
      isActive
    }
  }
`;

const GET_CURRENCIES = gql`
  query GetCurrencies {
    listCurrency {
      id
      businessId
      symbol
      name
      decimalPlaces
      exchangeRate
      isActive
      createdAt
      updatedAt
    }
  }
`;
const CurrencyQueries = {
  GET_ALL_CURRENCIES,
  GET_CURRENCIES,
};

export default CurrencyQueries;
