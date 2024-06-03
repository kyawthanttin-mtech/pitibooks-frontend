import { gql } from "@apollo/client";

const CREATE_OPENING_STOCK_GROUP = gql`
mutation CreateOpeningStockGroup ($groupId: Int!, $input: [NewOpeningStockGroup]) {
    createOpeningStockGroup (groupId: $groupId, input: $input) {
        warehouseId
        description
        productId
        productType
        batchNumber
        receivedDate
        qty
        currentQty
    }
}
`
const OpeningStockMutations = {
    CREATE_OPENING_STOCK_GROUP
  };
  
  export default OpeningStockMutations;