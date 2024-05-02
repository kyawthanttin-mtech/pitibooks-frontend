import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER = gql`
  query PaginateSupplier(
    $name: String
    $email: String
    $phone: String
    $mobile: String
  ) {
    paginateSupplier(
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
          supplierTax {
            id
            name
            rate
            type
            isActive
          }
          supplierPaymentTerms
          supplierPaymentTermsCustomDays
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
