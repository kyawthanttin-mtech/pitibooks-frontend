import { gql } from "@apollo/client";

// const GET_PAGINATED_PRODUCT_UNIT = gql`
//   query PaginateProductUnit($after: String, $limit: Int, $name: String) {
//     paginateProductUnit(after: $after, limit: $limit, name: $name) {
//       edges {
//         cursor
//         node {
//           id
//           businessId
//           name
//           abbreviation
//           precision
//           isActive
//           createdAt
//           updatedAt
//         }
//       }
//       pageInfo {
//         startCursor
//         endCursor
//         hasNextPage
//       }
//     }
//   }
// `;

const GET_PRODUCT_UNITS = gql`
  query ListProductUnit {
    listProductUnit {
      id
      businessId
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const UnitQueries = {
  // GET_PAGINATED_PRODUCT_UNIT,
  GET_PRODUCT_UNITS,
};

export default UnitQueries;
