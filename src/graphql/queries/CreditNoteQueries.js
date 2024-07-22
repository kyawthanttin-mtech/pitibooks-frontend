import { gql } from "@apollo/client";

const GET_PAGINATE_CREDIT_NOTE = gql`
  query GetPaginateCreditNote(
    $limit: Int = 10
    $after: String # $billNumber: String # $referenceNumber: String # $branchId: Int # $warehouseId: Int # $supplierId: Int # $currentStatus: BillStatus # $startBillDate: Time # $endBillDate: Time # $startBillDueDate: Time # $endBillDueDate: Time
  ) {
    paginateCreditNote(
      limit: $limit
      after: $after # billNumber: $billNumber # referenceNumber: $referenceNumber # branchId: $branchId # warehouseId: $warehouseId # supplierId: $supplierId # currentStatus: $currentStatus # startBillDate: $startBillDate # endBillDate: $endBillDate # startBillDueDate: $startBillDueDate # endBillDueDate: $endBillDueDate
    ) {
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
          creditNoteNumber
          referenceNumber

          creditNoteDate
          creditNoteSubject
          salesPerson {
            id
            name
          }
          termsAndConditions
          notes
          currency {
            id
            decimalPlaces
            symbol
          }
          warehouse {
            id
            name
          }
          creditNoteDiscount
          creditNoteDiscountType
          creditNoteDiscountAmount
          shippingCharges
          adjustmentAmount
          isTaxInclusive
          creditNoteTax {
            id
            name
            rate
            type
          }
          creditNoteTaxAmount
          currentStatus
          creditNoteSubtotal
          creditNoteTotalDiscountAmount
          creditNoteTotalTaxAmount
          creditNoteTotalAmount
          creditNoteTotalUsedAmount
          creditNoteTotalRefundAmount
          remainingBalance
          refunds {
            id
            paymentMode {
              id
              name
            }
            refundDate
            amount
            exchangeRate
            referenceNumber
            description
            account {
              id
              name
              currency {
                id
              }
            }
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
          creditedInvoices {
            invoiceNumber
            amount
            creditDate
          }
          details {
            id
            creditNoteId
            productId
            productType
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

const CreditNoteQueries = {
  GET_PAGINATE_CREDIT_NOTE,
};

export default CreditNoteQueries;
