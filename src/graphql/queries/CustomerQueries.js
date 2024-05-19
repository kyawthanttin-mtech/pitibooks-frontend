import { gql } from "@apollo/client";

const GET_PAGINATE_CUSTOMER = gql`
  query PaginateCustomer(
    $name: String
    $email: String
    $phone: String
    $mobile: String
    $isActive: Boolean
  ) {
    paginateCustomer(
      name: $name
      email: $email
      phone: $phone
      mobile: $mobile
      isActive: $isActive
    ) {
      edges {
        cursor
        node {
          id
          name
          email
          phone
          mobile
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          customerTax {
            id
            name
            rate
            type
            isActive
          }
          openingBalanceBranchId
          openingBalance
          exchangeRate
          customerPaymentTerms
          customerPaymentTermsCustomDays
          notes
          prepaidCreditAmount
          unusedCreditAmount
          creditLimit
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

const CustomerQueries = {
  GET_PAGINATE_CUSTOMER,
};

export default CustomerQueries;
