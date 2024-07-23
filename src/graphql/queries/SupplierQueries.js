import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER = gql`
  query PaginateSupplier(
    $limit: Int = 10
    $after: String
    $name: String
    $email: String
    $phone: String
    $mobile: String
    $isActive: Boolean
  ) {
    paginateSupplier(
      limit: $limit
      after: $after
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
          availableCredits {
            id
            branch {
              id
              name
            }
            supplierCreditNumber
            referenceNumber
            supplierCreditDate
            currentStatus
            supplierCreditTotalAmount
            supplierCreditTotalUsedAmount
            supplierCreditTotalRefundAmount
            remainingBalance
            currency {
              id
              decimalPlaces
              name
              symbol
              isActive
            }
          }
          availableAdvances {
            id
            branch {
              id
              name
            }
            date
            amount
            usedAmount
            currentStatus
            refundAmount
            remainingBalance
            currency {
              id
              decimalPlaces
              name
              symbol
              isActive
            }
          }
          openingBalanceBranchId
          openingBalance
          exchangeRate
          supplierPaymentTerms
          supplierPaymentTermsCustomDays
          notes
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
            remainingBalance
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
            remainingBalance
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

const GET_UNUSED_SUPPLIER_CREDITS = gql`
  query GetUnusedSupplierCredits($branchId: Int!, $supplierId: Int!) {
    getUnusedSupplierCredits(branchId: $branchId, supplierId: $supplierId) {
      id
      businessId
      supplierCreditNumber
      referenceNumber
      supplierCreditDate
      supplierCreditSubject
      notes
      exchangeRate
      supplierCreditDiscount
      supplierCreditDiscountType
      supplierCreditDiscountAmount
      adjustmentAmount
      isTaxInclusive
      supplierCreditTaxAmount
      currentStatus
      supplierCreditSubtotal
      supplierCreditTotalDiscountAmount
      supplierCreditTotalTaxAmount
      supplierCreditTotalAmount
      supplierCreditTotalUsedAmount
      remainingBalance
      supplier {
        id
        name
        isActive
      }
      currency {
        id
        decimalPlaces
        name
        symbol
      }
      branch {
        id
        name
        isActive
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_UNUSED_SUPPLIER_CREDIT_ADVANCES = gql`
  query GetUnusedSupplierCreditAdvances($branchId: Int!, $supplierId: Int!) {
    getUnusedSupplierCreditAdvances(
      branchId: $branchId
      supplierId: $supplierId
    ) {
      id
      date
      remainingBalance
      branch {
        id
        name
      }
      supplier {
        id
        name
      }
      amount
      usedAmount
      currency {
        id
        name
        symbol
        decimalPlaces
      }

      currentStatus
      createdAt
      updatedAt
    }
  }
`;

const SupplierQueries = {
  GET_PAGINATE_SUPPLIER,
  GET_SUPPLIER,
  GET_SUPPLIER_UNPAID_BILLS,
  GET_UNUSED_SUPPLIER_CREDITS,
  GET_UNUSED_SUPPLIER_CREDIT_ADVANCES,
};

export default SupplierQueries;
