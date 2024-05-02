import { gql } from "@apollo/client";

const GET_PRODUCT_CATEGORIES = gql`
  query ListActiveProductCategory {
    listProductCategory {
      id
      businessId
      name
      isActive
      parentCategory {
        id
        businessId
        name
        isActive
      }
    }
  }
`;

const CategoryQueries = {
  GET_PRODUCT_CATEGORIES,
};

export default CategoryQueries;
