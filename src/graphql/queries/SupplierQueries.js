import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER = gql`
  query PaginateSupplier(
    $limit: Int = 10
    $name: String
    $email: String
    $phone: String
    $mobile: String
    $isActive: Boolean
  ) {
    paginateSupplier(
      limit: $limit
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
          unpaidBills {
            id
            businessId
            purchaseOrderNumber
            billNumber
            referenceNumber
            billDate
            billDueDate
            billPaymentTerms
            billPaymentTermsCustomDays
            billSubject
            notes
            exchangeRate
            billDiscount
            billDiscountType
            billDiscountAmount
            adjustmentAmount
            isTaxInclusive
            billTaxAmount
            currentStatus
            billSubtotal
            billTotalDiscountAmount
            billTotalTaxAmount
            billTotalAmount
            billTotalPaidAmount
            balanceDue
            createdAt
            updatedAt
            branch {
              id
              name
            }
            currency {
              id
              decimalPlaces
              exchangeRate
              name
              symbol
            }
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

const GET_SUPPLIER_UNPAID_BILLS = gql`
  query GetSupplier($id: ID!) {
    getSupplier(id: $id) {
      id
      name
      bills {
        supplier {
          id
          unpaidBills {
            id
            businessId
            purchaseOrderNumber
            billNumber
            referenceNumber
            billDate
            billDueDate
            billPaymentTerms
            billPaymentTermsCustomDays
            billSubject
            notes
            exchangeRate
            billDiscount
            billDiscountType
            billDiscountAmount
            adjustmentAmount
            isTaxInclusive
            billTaxAmount
            currentStatus
            billSubtotal
            billTotalDiscountAmount
            billTotalTaxAmount
            billTotalAmount
            billTotalPaidAmount
            balanceDue
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

const SupplierQueries = {
  GET_PAGINATE_SUPPLIER,
  GET_SUPPLIER,
  GET_SUPPLIER_UNPAID_BILLS,
};

export default SupplierQueries;
