import { gql } from "@apollo/client";

const CREATE_TAX = gql`
  mutation CreateTax($input: NewTax!) {
    createTax(input: $input) {
      id
      name
      rate
      isCompoundTax
    }
  }
`;

const UPDATE_TAX = gql`
  mutation UpdateTax($id: ID!, $input: NewTax!) {
    updateTax(id: $id, input: $input) {
      id
      name
      rate
      isCompoundTax
    }
  }
`;

const CREATE_TAX_GROUP = gql`
  mutation CreateTaxGroup($input: NewTaxGroup!) {
    createTaxGroup(input: $input) {
      id
      name
      rate
      taxes {
        id
        name
        rate
        isCompoundTax
      }
    }
  }
`;

const DELETE_TAX = gql`
  mutation DeleteTax($id: ID!) {
    deleteTax(id: $id) {
      id
      name
      rate
      isCompoundTax
    }
  }
`;

const UPDATE_TAX_GROUP = gql`
  mutation UpdateTaxGroup($id: ID!, $input: NewTaxGroup!) {
    updateTaxGroup(id: $id, input: $input) {
      id
      name
      rate
      taxes {
        id
        name
        rate
        isCompoundTax
        isActive
      }
    }
  }
`;

const DELETE_TAX_GROUP = gql`
  mutation DeleteTaxGroup($id: ID!) {
    deleteTaxGroup(id: $id) {
      id
      name
      rate
    }
  }
`;

const UPDATE_TAX_SETTING = gql`
  mutation UpdateTaxSetting($input: NewTaxSetting!) {
    updateTaxSetting(input: $input) {
      id
      taxId
      isTaxInclusive
      isTaxExclusive
      isActive
      createdAt
      updatedAt
    }
  }
`;

const TOGGLE_ACTIVE_TAX = gql`
  mutation ToggleActiveTax($id: ID!, $isActive: Boolean!) {
    toggleActiveTax(id: $id, isActive: $isActive) {
      id
      name
      rate
      isCompoundTax
    }
  }
`;

const TOGGLE_ACTIVE_TAX_GROUP = gql`
  mutation ToggleActiveTaxGroup($id: ID!, $isActive: Boolean!) {
    toggleActiveTaxGroup(id: $id, isActive: $isActive) {
      id
      name
      rate
      taxes {
        id
        name
        rate
        isCompoundTax
      }
    }
  }
`;

const TaxMutations = {
  CREATE_TAX,
  CREATE_TAX_GROUP,
  UPDATE_TAX_GROUP,
  UPDATE_TAX,
  DELETE_TAX,
  DELETE_TAX_GROUP,
  UPDATE_TAX_SETTING,
  TOGGLE_ACTIVE_TAX,
  TOGGLE_ACTIVE_TAX_GROUP,
};

export default TaxMutations;
