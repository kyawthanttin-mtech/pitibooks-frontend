import { gql } from "@apollo/client";

const GET_PAGINATE_TRANSFER_ORDER = gql`
  query PaginateTransferOrder(
    $limit: Int = 10
    $after: String
    $orderNumber: String
    $currentStatus: TransferOrderStatus
  ) {
    paginateTransferOrder(
      limit: $limit
      after: $after
      orderNumber: $orderNumber
      currentStatus: $currentStatus
    ) {
      edges {
        cursor
        node {
          id
          businessId
          orderNumber
          transferDate
          totalTransferQty
          reason
          currentStatus
          createdAt
          updatedAt
          sourceWarehouse {
            id
            name
            isActive
          }
          destinationWarehouse {
            id
            name
            isActive
          }
          documents {
            id
            documentUrl
            referenceType
            referenceID
          }
          details {
            id
            transferOrderId
            productId
            productType
            batchNumber
            name
            description
            transferQty
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

const TransferOrderQueries = {
  GET_PAGINATE_TRANSFER_ORDER,
};

export default TransferOrderQueries;
