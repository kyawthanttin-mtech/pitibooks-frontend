import { gql } from "@apollo/client";

const CREATE_PRODUCT_UNIT = gql`
  mutation CreateProductUnit($input: NewProductUnit!) {
    createProductUnit(input: $input) {
      id
      businessId
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const UPDATE_PRODUCT_UNIT = gql`
  mutation UpdateProductUnit($id: ID!, $input: NewProductUnit!) {
    updateProductUnit(id: $id, input: $input) {
      id
      businessId
      name
      abbreviation
      precision
      isActive
    }
  }
`;
const DELETE_PRODUCT_UNIT = gql`
  mutation DeleteProductUnit($id: ID!) {
    deleteProductUnit(id: $id) {
      id
      businessId
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const TOGGLE_ACTIVE_PRODUCT_UNIT = gql`
  mutation ToggleActiveProductUnit($id: ID!, $isActive: Boolean!) {
    toggleActiveProductUnit(id: $id, isActive: $isActive) {
      id
      businessId
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const UnitMutations = {
  CREATE_PRODUCT_UNIT,
  UPDATE_PRODUCT_UNIT,
  DELETE_PRODUCT_UNIT,
  TOGGLE_ACTIVE_PRODUCT_UNIT,
};

export default UnitMutations;
