import { gql } from "@apollo/client";

const GET_PAGINATE_INVENTORY_ADJUSTMENT = gql`
  query PaginateInventoryAdjustment(
    $limit: Int = 10
    $after: String
    $referenceNumber: String
    $branchId: Int
    $warehouseId: Int
    $accountId: Int
    $currentStatus: InventoryAdjustmentStatus
    $startDate: Time
    $endDate: Time
  ) {
    paginateInventoryAdjustment(
      limit: $limit
      after: $after
      referenceNumber: $referenceNumber
      branchId: $branchId
      warehouseId: $warehouseId
      accountId: $accountId
      currentStatus: $currentStatus
      startDate: $startDate
      endDate: $endDate
    ) {
      edges {
        cursor
        node {
          id
          adjustmentType
          referenceNumber
          adjustmentDate
          account {
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
          currentStatus
          reason
          description
          documents {
            id
            documentUrl
            referenceID
            referenceType
          }
          details {
            id
            InventoryAdjustmentId
            productId
            productType
            batchNumber
            name
            description
            adjustedValue
            costPrice
            stocks {
              batchNumber
              qty
            }
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

const InventoryAdjustmentQueries = {
  GET_PAGINATE_INVENTORY_ADJUSTMENT,
};

export default InventoryAdjustmentQueries;
