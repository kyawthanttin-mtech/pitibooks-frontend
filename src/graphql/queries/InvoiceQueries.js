import { gql } from "@apollo/client";

const GET_PAGINATE_INVOICE = gql`
  query PaginateSalesInvoice($limit: Int = 10, $after: String) {
    paginateSalesInvoice(limit: $limit, after: $after) {
      edges {
        cursor
        node {
          id
          businessId
          salesOrderId
          invoiceNumber
          referenceNumber
          invoiceDate
          invoiceDueDate
          invoicePaymentTerms
          invoiceSubject
          notes
          termsAndConditions
          exchangeRate
          invoiceDiscount
          invoiceDiscountType
          invoiceDiscountAmount
          shippingCharges
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
          invoiceTotalCreditUsedAmount
          invoiceTotalAdvanceUsedAmount
          invoiceTotalWriteOffAmount
          writeOffReason
          writeOffDate
          appliedCustomerCredits {
            id
            businessId
            referenceId
            referenceType
            customerCreditNumber
            branchId
            customerId
            invoiceId
            invoiceNumber
            creditDate
            amount
            exchangeRate
            createdAt
            updatedAt
            currency {
              id
              decimalPlaces
              name
              symbol
            }
          }
          salesPerson {
            id
            name
          }
          details {
            id
            productId
            productType
            batchNumber
            name
            description
            product {
              id
              inventoryAccount {
                id
              }
            }
            detailAccount {
              id
              name
            }
            detailQty
            detailUnitRate
            detailTax {
              id
              name
              rate
              type
            }
            detailDiscount
            detailDiscountType
            detailDiscountAmount
            detailTaxAmount
            detailTotalAmount
          }
          warehouse {
            id
            name
          }
          customer {
            id
            name
            openingBalance
            openingBalanceBranchId
          }
          branch {
            id
            name
          }
          currency {
            id
            symbol
            name
            decimalPlaces
          }
          salesOrder {
            id
            orderNumber
            orderDate
            currentStatus
          }
          invoicePayment {
            paymentDate
            paymentNumber
            referenceNumber
            amount
            paymentMode
          }
          createdAt
          updatedAt
        }
      }
      invoiceTotalSummary {
        totalOutstandingReceivable
        dueToday
        dueWithin30Days
        totalOverdue
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`;

const InvoiceQueries = {
  GET_PAGINATE_INVOICE,
};

export default InvoiceQueries;
