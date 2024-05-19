import { gql } from "@apollo/client";

const GET_PAGINATE_INVOICE = gql`
  query PaginateSalesInvoice {
    paginateSalesInvoice {
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
          details {
            id
            productId
            productType
            batchNumber
            name
            description
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
          createdAt
          updatedAt
        }
      }
      invoiceTotalSummary {
        totalOutstandingPayable
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
