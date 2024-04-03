import { gql } from "@apollo/client";

const CREATE_WAREHOUSE = gql`
  mutation CreateWarehouse($input: NewWarehouse!) {
    createWarehouse(input: $input) {
      id
      name
      branch {
        id
        name
      }
      state {
        stateNameEn
      }
      township {
        townshipNameEn
      }
      city
      country
      businessId
      isActive
    }
  }
`;

const UPDATE_WAREHOUSE = gql`
  mutation UpdateWarehouse($id: ID!, $input: NewWarehouse!) {
    updateWarehouse(id: $id, input: $input) {
      id
      name
      branch {
        id
        name
      }
      state {
        stateNameEn
      }
      township {
        townshipNameEn
      }
      country
      city
      businessId
      # isActive
    }
  }
`;

const DELETE_WAREHOUSE = gql`
  mutation DeleteWarehouse($id: ID!) {
    deleteWarehouse(id: $id) {
      id
      name
      country
      city
    }
  }
`;

const TOGGLE_ACTIVE_WAREHOUSE = gql`
  mutation ToggleActiveWarehouse($id: ID!, $isActive: Boolean!) {
    toggleActiveWarehouse(id: $id, isActive: $isActive) {
      id
      businessId
      name
      phone
      mobile
      address
      country
      city
      isActive
      createdAt
      updatedAt
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
