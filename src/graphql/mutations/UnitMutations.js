import { gql } from "@apollo/client";

const CREATE_PRODUCT_UNIT = gql`
  mutation CreateProductUnit($input: NewProductUnit!) {
    createProductUnit(input: $input) {
      id
      name
      abbreviation
      precision
    }
  }
`;

const UPDATE_PRODUCT_UNIT = gql`
  mutation UpdateProductUnit($id: ID!, $input: NewProductUnit!) {
    updateProductUnit(id: $id, input: $input) {
      id
      name
      abbreviation
      precision
    }
  }
`;
const DELETE_PRODUCT_UNIT = gql`
  mutation DeleteProductUnit($id: ID!) {
    deleteProductUnit(id: $id) {
      id
      name
      abbreviation
      precision
    }
  }
`;

const TOGGLE_ACTIVE_PRODUCT_UNIT = gql`
  mutation ToggleActiveProductUnit($id: ID!, $isActive: Boolean!) {
    toggleActiveProductUnit(id: $id, isActive: $isActive) {
      id
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
