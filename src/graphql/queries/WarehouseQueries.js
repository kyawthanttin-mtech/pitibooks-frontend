import { gql } from "@apollo/client";

const GET_ALL_WAREHOUSES = gql`
  query GetAllWarehouse {
    listAllWarehouse {
      id
      name
      isActive
    }
  }
`

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
const WarehouseQueries = {
  GET_ALL_WAREHOUSES,
  GET_WAREHOUSES,
};

export default WarehouseQueries;
