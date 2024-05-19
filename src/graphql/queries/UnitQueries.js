import { gql } from "@apollo/client";

const GET_ALL_PRODUCT_UNITS = gql`
  query ListAllProductUnit {
    listAllProductUnit {
      id
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const GET_PRODUCT_UNITS = gql`
  query ListProductUnit {
    listProductUnit {
      id
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const UnitQueries = {
  GET_ALL_PRODUCT_UNITS,
  GET_PRODUCT_UNITS,
};

export default UnitQueries;
