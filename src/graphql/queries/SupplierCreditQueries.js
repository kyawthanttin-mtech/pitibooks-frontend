import { gql } from "@apollo/client";

const GET_PAGINATE_SUPPLIER_CREDIT = gql`
  query PaginateSupplierCredit(
    $limit: Int
    $after: String
    $supplierCreditNumber: String
    $referenceNumber: String
    $branchId: Int
    $warehouseId: Int
    $supplierId: Int
    $currentStatus: SupplierCreditStatus
    $startSupplierCreditDate: Time
    $endSupplierCreditDate: Time
  ) {
    paginateSupplierCredit(
      limit: $limit
      after: $after
      supplierCreditNumber: $supplierCreditNumber
      referenceNumber: $referenceNumber
      branchId: $branchId
      warehouseId: $warehouseId
      supplierId: $supplierId
      currentStatus: $currentStatus
      startSupplierCreditDate: $startSupplierCreditDate
      endSupplierCreditDate: $endSupplierCreditDate
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
          supplierCreditNumber
          referenceNumber
          supplierCreditDate
          supplierCreditSubject
          notes
          currency {
            id
            name
            symbol
            decimalPlaces
          }
          warehouse {
            id
            name
          }
          supplierCreditDiscount
          supplierCreditDiscountType
          supplierCreditDiscountAmount
          adjustmentAmount
          isTaxInclusive
          supplierCreditTax {
            id
            name
            rate
            type
          }
          supplierCreditTaxAmount
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
          supplierCreditSubtotal
          supplierCreditTotalDiscountAmount
          supplierCreditTotalTaxAmount
          supplierCreditTotalAmount
          supplierCreditTotalUsedAmount
          supplierCreditTotalRefundAmount
          remainingBalance
          creditedBills {
            billNumber
            amount
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

const SupplierCreditQueries = {
  GET_PAGINATE_SUPPLIER_CREDIT,
};

export default SupplierCreditQueries;
