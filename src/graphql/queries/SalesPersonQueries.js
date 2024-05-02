import { gql } from "@apollo/client";

const GET_PAGINATE_SALES_PERSON = gql`
  query PaginateSalesPerson($after: String, $limit: Int, $name: String) {
    paginateSalesPerson(after: $after, limit: $limit, name: $name) {
      edges {
        cursor
        node {
          id
          businessId
          name
          email
          isActive
          createdAt
          updatedAt
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`;

const GET_SUPPLIER = gql`
  query GetSupplier($id: ID!) {
    getSupplier(id: $id) {
      id
      name
      email
      phone
      mobile
    }
  }
`;

const SalesPersonQueries = {
  GET_PAGINATE_SALES_PERSON,
  GET_SUPPLIER,
};

export default SalesPersonQueries;
