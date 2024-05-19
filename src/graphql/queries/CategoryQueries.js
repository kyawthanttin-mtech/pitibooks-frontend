import { gql } from "@apollo/client";

const GET_ALL_PRODUCT_CATEGORIES = gql`
  query ListAllProductCategory {
    listAllProductCategory {
      id
      name
      isActive
    }
  }
`;

const GET_PRODUCT_CATEGORIES = gql`
  query ListProductCategory {
    listProductCategory {
      id
      name
      isActive
      parentCategory {
        id
        name
        isActive
      }
    }
  }
`;

const CategoryQueries = {
  GET_ALL_PRODUCT_CATEGORIES,
  GET_PRODUCT_CATEGORIES,
};

export default CategoryQueries;
