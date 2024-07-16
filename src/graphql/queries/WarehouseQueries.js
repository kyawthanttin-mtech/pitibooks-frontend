import { gql } from "@apollo/client";

const GET_ALL_WAREHOUSES = gql`
  query GetAllWarehouse {
    listAllWarehouse {
      id
      name
      branchId
      isActive
    }
  }
`;

const GET_WAREHOUSES = gql`
  query GetWarehoues($name: String) {
    listWarehouse(name: $name) {
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

const GET_WAREHOUSE = gql`
  query GetWarehouse($id: ID!) {
    getWarehouse(id: $id) {
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
const WarehouseQueries = {
  GET_ALL_WAREHOUSES,
  GET_WAREHOUSES,
  GET_WAREHOUSE,
};

export default WarehouseQueries;
