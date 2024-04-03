import { gql } from "@apollo/client";

const GET_PRODUCTS = gql`
  query GetProducts {
    listProduct {
      id
      businessId
      name
      description
      sku
      modifiers {
        id
        businessId
        name
        createdAt
        updatedAt
      }
      productNature
      purchasePrice
      isActive
      salesPrice
      barcode
      isSalesTaxInclusive
      updatedAt
      createdAt
      images {
        id
        imageUrl
        thumbnailUrl
        referenceType
        referenceID
      }
    }
  }
`;
const ProductQueries = {
  GET_PRODUCTS,
};

export default ProductQueries;
