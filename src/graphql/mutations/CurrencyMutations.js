import { gql } from "@apollo/client";

const CREATE_CURRENCY = gql`
  mutation CreateCurrency($input: NewCurrency!) {
    createCurrency(input: $input) {
      id
      symbol
      name
      decimalPlaces
      exchangeRate
    }
  }
`;

const UPDATE_CURRENCY = gql`
  mutation UpdateCurrency($id: ID!, $input: NewCurrency!) {
    updateCurrency(id: $id, input: $input) {
      id
      symbol
      name
      decimalPlaces
      exchangeRate
    }
  }
`;

const DELETE_CURRENCY = gql`
  mutation DeleteCurrency($id: ID!) {
    deleteCurrency(id: $id) {
      id
      symbol
      name
      decimalPlaces
      exchangeRate
    }
  }
`;

const TOGGLE_ACTIVE_CURRENCY = gql`
  mutation ToggleActiveCurrency($id: ID!, $isActive: Boolean!) {
    toggleActiveCurrency(id: $id, isActive: $isActive) {
      id
      symbol
      name
      decimalPlaces
      exchangeRate
      isActive
    }
  }
`;

const CurrencyMutations = {
  CREATE_CURRENCY,
  UPDATE_CURRENCY,
  DELETE_CURRENCY,
  TOGGLE_ACTIVE_CURRENCY,
};

export default CurrencyMutations;
