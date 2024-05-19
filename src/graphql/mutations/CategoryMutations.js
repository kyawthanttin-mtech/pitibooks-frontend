import { gql } from "@apollo/client";

const CREATE_CATEGORY = gql`
  mutation CreateProductCategory($input: NewProductCategory!) {
    createProductCategory(input: $input) {
      id
      name
      parentCategory {
        id
        name
      }
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateProductCategory($input: NewProductCategory!, $id: ID!) {
    updateProductCategory(id: $id, input: $input) {
      id
      name
      parentCategory {
        id
        name
      }
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteProductCategory($id: ID!) {
    deleteProductCategory(id: $id) {
      id
      name
      parentCategory {
        id
        name
      }
    }
  }
`;

const TOGGLE_ACTIVE_CATEGORY = gql`
  mutation ToggleActiveProductCategory($id: ID!, $isActive: Boolean!) {
    toggleActiveProductCategory(id: $id, isActive: $isActive) {
      id
      name
      parentCategory {
        id
        name
      }
    }
  }
`;

const CategoryMutations = {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_ACTIVE_CATEGORY,
};

export default CategoryMutations;
