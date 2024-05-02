import { gql } from "@apollo/client";

const GET_ALL_WAREHOUSES = gql`
  query GetAllWarehouse {
    listAllWarehouse {
      id
      name
      isActive
    }
  }
`;

const GET_WAREHOUSES = gql`
  query GetWarehoues($name: String) {
    listWarehouse(name: $name) {
      id
      name
      city
      country
      branch {
        id
        name
      }
      state {
        id
        stateNameEn
        code
      }
      businessId
      isActive
      township {
        id
        townshipNameEn
        code
      }
      phone
      mobile
      address
    }
  }
`;

const GET_WAREHOUSE = gql`
  query GetWarehouse($id: ID!) {
    getWarehouse(id: $id) {
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
      isActive
      address
    }
  }
`;
const WarehouseQueries = {
  GET_ALL_WAREHOUSES,
  GET_WAREHOUSES,
  GET_WAREHOUSE,
};

export default WarehouseQueries;
