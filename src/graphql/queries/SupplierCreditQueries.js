import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER_CREDIT = gql`
  query PaginateSupplierCredit {
    paginateSupplierCredit {
      edges {
        cursor
        node {
          id
          supplier {
            id
            name
          }
          branch {
            id
            name
          }
          notes
          warehouse {
            id
            name
          }
          supplierCreditDiscount
          isTaxInclusive
          adjustmentAmount
          details {
            id
            productId
          }

          supplierCreditTotalAmount
          supplierCreditNumber
          referenceNumber
          supplierCreditDate
          supplierCreditSubject
          notes
          currentStatus
          currency {
            id
            symbol
            name
            exchangeRate
            decimalPlaces
          }
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

const SupplierCreditQueries = {
  GET_PAGINATE_SUPPLIER_CREDIT,
};

export default SupplierCreditQueries;
