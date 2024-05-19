import { gql } from "@apollo/client";

const GET_PAGINATE_CUSTOMER_PAYMENT = gql`
  query GetPaginateCustomerPayment($limit: Int, $after: String, $name: String) {
    paginateCustomerPayment(limit: $limit, after: $after, name: $name) {
      edges {
        cursor
        node {
          id
          customer {
            name
            email
            phone
            mobile
            customerTax {
              id
              name
              rate
              type
            }
          }
          branch {
            id
            name
          }
          amount
          bankCharges
          paymentDate
          paymentNumber
          paymentMode {
            id
            name
          }
          depositAccount {
            id
            detailType
            mainType
            name
            code
            parentAccount {
              id
              name
            }
          }
          referenceNumber
          notes
          documents {
            id
            documentUrl
            referenceType
          }
          paidInvoices {
            id
            customerPaymentId
            invoiceId
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

const CustomerPaymentQueries = {
  GET_PAGINATE_CUSTOMER_PAYMENT,
};

export default CustomerPaymentQueries;
