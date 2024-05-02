import { gql } from "@apollo/client";

const GET_PAGINATE_CUSTOMER = gql`
  query PaginateCustomer(
    $name: String
    $email: String
    $phone: String
    $mobile: String
  ) {
    paginateCustomer(
      name: $name
      email: $email
      phone: $phone
      mobile: $mobile
    ) {
      edges {
        cursor
        node {
          id
          businessId
          name
          email
          phone
          mobile
          customerTax {
            id
            name
            rate
            type
            isActive
          }
          customerPaymentTerms
          customerPaymentTermsCustomDays
          notes
          prepaidCreditAmount
          unusedCreditAmount
          isActive
          createdAt
          updatedAt
          currency {
            id
            symbol
            name
            decimalPlaces
            isActive
          }
          contactPersons {
            id
            name
            email
            phone
            mobile
            designation
            department
            referenceType
            referenceID
          }

          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
          exchangeRate
          openingBalanceBranchId
          openingBalance
          shippingAddress {
            id
            attention
            address
            country
            city
            stateId
            townshipId
            email
            phone
            mobile
            referenceType
            referenceID
          }
          billingAddress {
            id
            attention
            address
            country
            city
            email
            phone
            mobile
            referenceType
            referenceID
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

const CustomerQueries = {
  GET_PAGINATE_CUSTOMER,
};

export default CustomerQueries;
