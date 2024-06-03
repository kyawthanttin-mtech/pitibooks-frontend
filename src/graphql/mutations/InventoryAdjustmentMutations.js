import { gql } from "@apollo/client";

const CREATE_INVENTORY_ADJUSTMENT = gql`
  mutation createInventoryAdjustment($input: NewInventoryAdjustment!) {
    createInventoryAdjustment(input: $input) {
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
    }
  }
`;
const UPDATE_INVENTORY_ADJUSTMENT = gql`
  mutation updateInventoryAdjustment(
    $input: NewInventoryAdjustment!
    $id: ID!
  ) {
    updateInventoryAdjustment(input: $input, id: $id) {
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
    }
  }
`;
const DELETE_INVENTORY_ADJUSTMENT = gql`
  mutation deleteInventoryAdjustment($id: ID!) {
    deleteInventoryAdjustment(id: $id) {
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
    }
  }
`;

const InventoryAdjustmentMutations = {
  CREATE_INVENTORY_ADJUSTMENT,
  UPDATE_INVENTORY_ADJUSTMENT,
  DELETE_INVENTORY_ADJUSTMENT,
};

export default InventoryAdjustmentMutations;
