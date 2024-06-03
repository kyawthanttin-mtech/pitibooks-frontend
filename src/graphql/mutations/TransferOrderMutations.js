import { gql } from "@apollo/client";

const CREATE_TRANSFER_ORDER = gql`
  mutation CreateTransferOrder($input: NewTransferOrder!) {
    createTransferOrder(input: $input) {
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
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;
const UPDATE_TRANSFER_ORDER = gql`
  mutation UpdateTransferOrder($input: NewTransferOrder!, $id: ID!) {
    updateTransferOrder(id: $id, input: $input) {
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
`;
const DELETE_TRANSFER_ORDER = gql`
  mutation DeleteTransferOrder($id: ID!) {
    deleteTransferOrder(id: $id) {
      id
      businessId
      orderNumber
      transferDate
      totalTransferQty
      reason
      currentStatus
      createdAt
      updatedAt
    }
  }
`;

const TransferOrderMutations = {
  CREATE_TRANSFER_ORDER,
  UPDATE_TRANSFER_ORDER,
  DELETE_TRANSFER_ORDER,
};

export default TransferOrderMutations;
