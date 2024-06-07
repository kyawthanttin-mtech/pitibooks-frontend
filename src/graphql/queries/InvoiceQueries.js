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
            unusedCreditAmount
            prepaidCreditAmount
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
