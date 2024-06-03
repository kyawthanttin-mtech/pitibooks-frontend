import { gql } from "@apollo/client";

const GET_PAGINATE_SALES_PERSON = gql`
  query PaginateSalesPerson($after: String, $limit: Int, $name: String) {
    paginateSalesPerson(after: $after, limit: $limit, name: $name) {
      edges {
        cursor
        node {
          id
          name
          email
          isActive
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

const GET_ALL_SALES_PERSONS = gql`
  query GetAllSalesPersons {
    listAllSalesPerson {
      id
      name
      isActive
    }
  }
`;

const SalesPersonQueries = {
  GET_PAGINATE_SALES_PERSON,
  GET_ALL_SALES_PERSONS,
};

export default SalesPersonQueries;
