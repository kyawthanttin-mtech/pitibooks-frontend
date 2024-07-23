import { gql } from "@apollo/client";

const GET_PAGINATE_CUSTOMER_PAYMENT = gql`
  query GetPaginateCustomerPayment($limit: Int, $after: String, $name: String) {
    paginateCustomerPayment(limit: $limit, after: $after, name: $name) {
      edges {
        cursor
        node {
          id
          customer {
            id
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
              invoiceDiscount
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
              remainingBalance

              createdAt
              updatedAt
              branch {
                id
                name
              }
              currency {
                id
                decimalPlaces
                # exchangeRate
                name
                symbol
              }
            }
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
          exchangeRate
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
            currency {
              id
              name
              symbol
              decimalPlaces
            }
            # parentAccount {
            #   id
            #   name
            # }
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
            invoice {
              id
              businessId
              # salesOrderNumber
              invoiceNumber
              referenceNumber
              invoiceDate
              invoiceDueDate
              invoicePaymentTerms
              # invoicePaymentTermsCustomDays
              invoiceSubject
              notes
              exchangeRate
              invoiceDiscount
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
              remainingBalance
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
