import { gql } from "@apollo/client";

const GET_PAGINATE_PURCHASE_ORDER = gql`
  query PaginatePurchaseOrder(
    $after: String
    $limit: Int
    $orderNumber: String
    $referenceNumber: String
    $branchId: Int
    $warehouseId: Int
    $supplierId: Int
    $currentStatus: PurchaseOrderStatus
    $startOrderDate: Time
    $endOrderDate: Time
    $startExpectedDeliveryDate: Time
    $endExpectedDeliveryDate: Time
  ) {
    paginatePurchaseOrder(
      after: $after
      limit: $limit
      orderNumber: $orderNumber
      referenceNumber: $referenceNumber
      branchId: $branchId
      warehouseId: $warehouseId
      supplierId: $supplierId
      currentStatus: $currentStatus
      startOrderDate: $startOrderDate
      endOrderDate: $endOrderDate
      startExpectedDeliveryDate: $startExpectedDeliveryDate
      endExpectedDeliveryDate: $endExpectedDeliveryDate
    ) {
      edges {
        cursor
        node {
          id
          supplier {
            id
            name
          }
          branch {
            id
            name
          }
          orderNumber
          referenceNumber
          orderDate
          expectedDeliveryDate
          orderPaymentTerms
          orderPaymentTermsCustomDays
          deliveryWarehouseId
          deliveryCustomerId
          deliveryAddress
          shipmentPreference {
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
          adjustmentAmount
          isTaxInclusive
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
          bill {
            id
            billNumber
            billDate
            billDueDate
            currentStatus
            billTotalAmount
            billTotalPaidAmount
            remainingBalance
            currency {
              id
              decimalPlaces
              name
              symbol
            }
          }
          warehouse {
            id
            name
          }
          orderSubtotal
          orderTotalDiscountAmount
          orderTotalTaxAmount
          orderTotalAmount
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

const PurchaseOrderQueries = {
  GET_PAGINATE_PURCHASE_ORDER,
};

export default PurchaseOrderQueries;
