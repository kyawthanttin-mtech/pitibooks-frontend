import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER_PAYMENT = gql`
  query PaginateSupplierPayment(
    $limit: Int
    $after: String
    $name: String
  ) {
    paginateSupplierPayment(
      limit: $limit
      after: $after
      name: $name
    ) {
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
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          amount
          bankCharges
          paymentDate
          paymentNumber
          paymentMode {
            id
            name
          }
          withdrawAccount {
            id
            name
          }
          referenceNumber
          notes
          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
          paidBills {
            id
            supplierPaymentId
            billId
            paidAmount
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

const SupplierPaymentQueries = {
  GET_PAGINATE_SUPPLIER_PAYMENT,
};

export default SupplierPaymentQueries;
