import { gql } from "@apollo/client";

const GET_AVAILABLE_STOCKS = gql`
  query GetAvailableStocks($warehouseId: Int!) {
    getAvailableStocks(warehouseId: $warehouseId) {
      id
      warehouseId
      productId
      productType
      batchNumber
      currentQty
      product {
        productUnit {
          id
          name
          abbreviation
          precision
        }
      }
    }
  }
`;

const StockQueries = {
  GET_AVAILABLE_STOCKS,
};

export default StockQueries;
