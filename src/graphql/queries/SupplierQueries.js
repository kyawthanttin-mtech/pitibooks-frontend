import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER = gql`
  query PaginateSupplier(
    $name: String
    $email: String
    $phone: String
    $mobile: String
    $isActive: Boolean
  ) {
    paginateSupplier(
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
          supplierTax {
            id
            name
            rate
            type
            isActive
          }
          openingBalanceBranchId
          openingBalance
          exchangeRate
          supplierPaymentTerms
          supplierPaymentTermsCustomDays
          notes
          prepaidCreditAmount
          unusedCreditAmount
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

const SupplierQueries = {
  GET_PAGINATE_SUPPLIER,
  GET_SUPPLIER,
};

export default SupplierQueries;
