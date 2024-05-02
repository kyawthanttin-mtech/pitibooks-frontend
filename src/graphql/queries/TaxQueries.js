import { gql } from "@apollo/client";

const GET_TAXES = gql`
  query GetTaxes($name: String) {
    listTax(name: $name) {
      id
      businessId
      name
      rate
      isCompoundTax
      isActive
    }
  }
`;

const GET_ALL_TAXES = gql`
  query ListAllTax {
    listAllTax {
      id
      name
      rate
      isCompoundTax
      isActive
    }
  }
`;

const GET_TAX_GROUPS = gql`
  query GetTaxGroups($name: String) {
    listTaxGroup(name: $name) {
      id
      businessId
      name
      rate
      isActive
      taxes {
        id
        businessId
        name
        rate
        isCompoundTax
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_ALL_TAX_GROUPS = gql`
  query ListAllTaxGroup {
    listAllTaxGroup {
      id
      name
      rate
      isActive
    }
  }
`;

const TaxQueries = {
  GET_TAXES,
  GET_TAX_GROUPS,
  GET_ALL_TAXES,
  GET_ALL_TAX_GROUPS,
};

export default TaxQueries;
