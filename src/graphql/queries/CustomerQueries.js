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
          # unpaidInvoices {
          #   id
          #   businessId
          #   purchaseOrderNumber
          #   invoiceNumber
          #   referenceNumber
          #   invoiceDate
          #   invoiceDueDate
          #   invoicePaymentTerms
          #   invoicePaymentTermsCustomDays
          #   invoiceSubject
          #   notes
          #   exchangeRate
          #   invoiceDiscount
          #   invoiceDiscountType
          #   invoiceDiscountAmount
          #   adjustmentAmount
          #   isTaxInclusive
          #   invoiceTaxAmount
          #   currentStatus
          #   invoiceSubtotal
          #   invoiceTotalDiscountAmount
          #   invoiceTotalTaxAmount
          #   invoiceTotalAmount
          #   invoiceTotalPaidAmount
          #   balanceDue
          #   createdAt
          #   updatedAt
          #   branch {
          #     id
          #     name
          #   }
          #   currency {
          #     id
          #     decimalPlaces
          #     name
          #     symbol
          #   }
          # }
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
