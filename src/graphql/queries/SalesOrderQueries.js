import { gql } from "@apollo/client";

const GET_PAGINATE_SALES_ORDER = gql`
  query PaginateSalesOrder($after: String, $limit: Int) {
    paginateSalesOrder(after: $after, limit: $limit) {
      edges {
        cursor
        node {
          id
          customer {
            id
            name
          }
          branch {
            id
            name
          }
          warehouse {
            id
            name
          }
          orderNumber
          expectedShipmentDate
          orderPaymentTerms
          orderPaymentTermsCustomDays
          deliveryMethod {
            id
            name
          }
          salesPerson {
            id
            name
          }
          notes
          termsAndConditions
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          exchangeRate
          orderDiscount
          orderDiscountType
          orderDiscountAmount
          shippingCharges
          adjustmentAmount
          isTaxInclusive
          referenceNumber
          orderTax {
            id
            name
            rate
            type
          }
          orderTaxAmount
          currentStatus
          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
          orderSubtotal
          orderTotalDiscountAmount
          orderTotalTaxAmount
          orderTotalAmount
          salesInvoice {
            id
            invoiceNumber
            invoiceDate
            invoiceDueDate
            currentStatus
            invoiceTotalAmount
            invoiceTotalPaidAmount
            remainingBalance
            currency {
              id
              decimalPlaces
              name
              symbol
            }
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
            detailDiscount
            detailDiscountType
            detailTax {
              id
              name
              rate
              type
            }
            detailDiscountAmount
            detailTaxAmount
            detailTotalAmount
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

const SalesOrderQueries = {
  GET_PAGINATE_SALES_ORDER,
};

export default SalesOrderQueries;
