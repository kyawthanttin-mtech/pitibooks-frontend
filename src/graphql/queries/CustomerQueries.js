import { gql } from "@apollo/client";

const GET_PAGINATE_CUSTOMER = gql`
  query PaginateCustomer(
    $limit: Int = 10
    $after: String
    $name: String
    $email: String
    $phone: String
    $mobile: String
    $isActive: Boolean
  ) {
    paginateCustomer(
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
          customerTax {
            id
            name
            rate
            type
            isActive
          }
          openingBalanceBranchId
          availableCredits {
            id
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
            creditNoteNumber
            referenceNumber
            creditNoteDate
            creditNoteSubject
            notes
            termsAndConditions
            exchangeRate
            creditNoteDiscount
            creditNoteDiscountType
            creditNoteDiscountAmount
            shippingCharges
            adjustmentAmount
            isTaxInclusive
            creditNoteTaxAmount
            currentStatus
            creditNoteSubtotal
            creditNoteTotalDiscountAmount
            creditNoteTotalTaxAmount
            creditNoteTotalAmount
            creditNoteTotalUsedAmount
            creditNoteTotalRefundAmount
            remainingBalance
            createdAt
            updatedAt
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
              name
              symbol
              decimalPlaces
            }
            createdAt
            updatedAt
          }

          openingBalance
          exchangeRate
          customerPaymentTerms
          customerPaymentTermsCustomDays
          notes
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
          unpaidInvoices {
            id
            businessId
            orderNumber
            invoiceNumber
            referenceNumber
            invoiceDate
            invoiceDueDate
            invoicePaymentTerms
            invoicePaymentTermsCustomDays
            invoiceSubject
            notes
            exchangeRate
            remainingBalance
            invoiceDiscount
            remainingBalance
            invoiceDiscountType
            invoiceDiscountAmount
            adjustmentAmount
            isTaxInclusive
            invoiceTaxAmount
            currentStatus
            invoiceSubtotal
            invoiceTotalDiscountAmount
            invoiceTotalTaxAmount
            invoiceTotalAmount
            invoiceTotalPaidAmount

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

const GET_UNUSED_CUSTOMER_CREDITS = gql`
  query GetUnusedCustomerCredits($branchId: Int!, $customerId: Int!) {
    getUnusedCustomerCredits(branchId: $branchId, customerId: $customerId) {
      id
      businessId
      creditNoteNumber
      referenceNumber
      creditNoteDate
      creditNoteSubject
      notes
      termsAndConditions
      exchangeRate
      creditNoteDiscount
      creditNoteDiscountType
      creditNoteDiscountAmount
      shippingCharges
      adjustmentAmount
      isTaxInclusive
      creditNoteTaxAmount
      currentStatus
      creditNoteSubtotal
      creditNoteTotalDiscountAmount
      creditNoteTotalTaxAmount
      creditNoteTotalAmount
      creditNoteTotalUsedAmount
      creditNoteTotalRefundAmount
      remainingBalance
      currency {
        id
        decimalPlaces
        name
        symbol
        isActive
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_UNUSED_CUSTOMER_CREDIT_ADVANCES = gql`
  query GetUnusedCustomerCreditAdvances($branchId: Int!, $customerId: Int!) {
    getUnusedCustomerCreditAdvances(
      branchId: $branchId
      customerId: $customerId
    ) {
      id
      date
      amount
      usedAmount
      currentStatus
      refundAmount
      remainingBalance
      createdAt
      updatedAt
      currency {
        id
        decimalPlaces
        name
        symbol
        isActive
      }
    }
  }
`;

const CustomerQueries = {
  GET_PAGINATE_CUSTOMER,
  GET_UNUSED_CUSTOMER_CREDITS,
  GET_UNUSED_CUSTOMER_CREDIT_ADVANCES,
};

export default CustomerQueries;
