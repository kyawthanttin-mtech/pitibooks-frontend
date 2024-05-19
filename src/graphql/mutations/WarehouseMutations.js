import { gql } from "@apollo/client";

const CREATE_WAREHOUSE = gql`
  mutation CreateWarehouse($input: NewWarehouse!) {
    createWarehouse(input: $input) {
      id
      branch {
        id
        name
      }
      name
      phone
      mobile
      address
      country
      city
      state {
        id
        stateNameEn
        code
      }
      township {
        id
        stateCode
        townshipNameEn
        code
      }
    }
  }
`;

const UPDATE_WAREHOUSE = gql`
  mutation UpdateWarehouse($id: ID!, $input: NewWarehouse!) {
    updateWarehouse(id: $id, input: $input) {
      id
      branch {
        id
        name
      }
      name
      phone
      mobile
      address
      country
      city
      state {
        id
        stateNameEn
        code
      }
      township {
        id
        stateCode
        townshipNameEn
        code
      }
    }
  }
`;

const DELETE_WAREHOUSE = gql`
  mutation DeleteWarehouse($id: ID!) {
    deleteWarehouse(id: $id) {
      id
      branch {
        id
        name
      }
      name
      phone
      mobile
      address
      country
      city
      state {
        id
        stateNameEn
        code
      }
      township {
        id
        stateCode
        townshipNameEn
        code
      }
    }
  }
`;

const TOGGLE_ACTIVE_WAREHOUSE = gql`
  mutation ToggleActiveWarehouse($id: ID!, $isActive: Boolean!) {
    toggleActiveWarehouse(id: $id, isActive: $isActive) {
      id
      branch {
        id
        name
      }
      name
      phone
      mobile
      address
      country
      city
      state {
        id
        stateNameEn
        code
      }
      township {
        id
        stateCode
        townshipNameEn
        code
      }
      isActive
    }
  }
`;

const WarehouseMutations = {
  CREATE_WAREHOUSE,
  UPDATE_WAREHOUSE,
  DELETE_WAREHOUSE,
  TOGGLE_ACTIVE_WAREHOUSE,
};

export default WarehouseMutations;
