import { gql } from "@apollo/client";

const CREATE_SALES_PERSON = gql`
  mutation CreateSalesPerson($input: NewSalesPerson!) {
    createSalesPerson(input: $input) {
      id
      businessId
      name
      email
      createdAt
      updatedAt
      isActive
    }
  }
`;

const UPDATE_SALES_PERSON = gql`
  mutation UpdateSalesPerson($id: ID!, $input: NewSalesPerson!) {
    updateSalesPerson(id: $id, input: $input) {
      id
      businessId
      name
      email
      createdAt
      updatedAt
      # isActive
    }
  }
`;
const DELETE_SALES_PERSON = gql`
  mutation DeleteSalesPerson($id: ID!) {
    deleteSalesPerson(id: $id) {
      id
      businessId
      name
      email
      createdAt
      updatedAt
    }
  }
`;

const TOGGLE_ACTIVE_SALES_PERSON = gql`
  mutation ToggleActiveSalesPerson($id: ID!, $isActive: Boolean!) {
    toggleActiveSalesPerson(id: $id, isActive: $isActive) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;

const SalesPersonMutations = {
  CREATE_SALES_PERSON,
  UPDATE_SALES_PERSON,
  DELETE_SALES_PERSON,
  TOGGLE_ACTIVE_SALES_PERSON,
};

export default SalesPersonMutations;
