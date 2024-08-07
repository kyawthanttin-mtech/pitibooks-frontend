import { gql } from "@apollo/client";

const GET_PAGINATE_BILL = gql`
  query PaginateBill(
    $limit: Int = 10
    $after: String
    $billNumber: String
    $referenceNumber: String
    $branchId: Int
    $warehouseId: Int
    $supplierId: Int
    $currentStatus: BillStatus
    $startBillDate: Time
    $endBillDate: Time
    $startBillDueDate: Time
    $endBillDueDate: Time
  ) {
    paginateBill(
      limit: $limit
      after: $after
      billNumber: $billNumber
      referenceNumber: $referenceNumber
      branchId: $branchId
      warehouseId: $warehouseId
      supplierId: $supplierId
      currentStatus: $currentStatus
      startBillDate: $startBillDate
      endBillDate: $endBillDate
      startBillDueDate: $startBillDueDate
      endBillDueDate: $endBillDueDate
    ) {
      edges {
        cursor
        node {
          id
          supplier {
            id
            name
            openingBalance
            openingBalanceBranchId
          }
          branch {
            id
            name
          }
          purchaseOrderNumber
          billNumber
          referenceNumber
          billDate
          billDueDate
          billPaymentTerms
          billSubject
          notes
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          exchangeRate
          billDiscount
          billDiscountType
          billDiscountAmount
          adjustmentAmount
          isTaxInclusive
          billTotalAdvanceUsedAmount
          billTotalCreditUsedAmount
          remainingBalance
          appliedSupplierCredits {
            id
            businessId
            referenceId
            referenceType
            supplierCreditNumber
            billId
            billNumber
            creditDate
            amount
            currency {
              id
              decimalPlaces
              name
              symbol
            }
          }
          billTax {
            id
            name
            rate
            type
          }
          billTaxAmount
          currentStatus
          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
          warehouse {
            id
            name
          }
          billSubtotal
          billTotalDiscountAmount
          billTotalTaxAmount
          billTotalAmount
          billTotalPaidAmount
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
            customerId
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
          purchaseOrder {
            id
            orderNumber
            orderDate
            currentStatus
          }
          billPayment {
            paymentDate
            paymentNumber
            referenceNumber
            amount
            paymentMode
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      billTotalSummary {
        totalOutstandingPayable
        dueToday
        dueWithin30Days
        totalOverdue
      }
    }
  }
`;

const BillQueries = {
  GET_PAGINATE_BILL,
};

export default BillQueries;
