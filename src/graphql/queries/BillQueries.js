import { gql } from "@apollo/client";

const GET_PAGINATE_BILL = gql`
  query PaginateBill($after: String, $limit: Int, $name: String) {
    paginateBill(after: $after, limit: $limit, name: $name) {
      edges {
        cursor
        node {
          id
          businessId
          purchaseOrderId
          billNumber
          referenceNumber
          billDate
          billDueDate
          billPaymentTerms
          billSubject
          notes
          exchangeRate
          billDiscount
          billDiscountType
          billDiscountAmount
          adjustmentAmount
          isTaxInclusive
          currency {
            symbol
          }
          billTax {
            id
          }
          billTaxAmount
          currentStatus
          warehouseId
          billSubtotal
          billTotalDiscountAmount
          billTotalTaxAmount
          billTotalAmount
          billTotalPaidAmount
          createdAt
          updatedAt
          details {
            id
            billId
            productId
            productType
            batchNumber
            name
            description
            detailAccountId
            customerId
            detailQty
            detailUnitRate

            detailDiscount
            detailDiscountType
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

const BillQueries = {
  GET_PAGINATE_BILL,
};

export default BillQueries;
