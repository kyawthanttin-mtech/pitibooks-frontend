import { gql } from "@apollo/client";

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: NewProduct!) {
    createProduct(input: $input) {
      id
      name
      description
      sku
      barcode
      salesPrice
      isSalesTaxInclusive
      purchasePrice
      isActive
      isBatchTracking
      productUnit {
        id
        name
      }
      category {
        id
        name
      }
      inventoryAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      purchaseAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      salesAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      salesTax {
        id
        name
        rate
        type
        isActive
      }
      purchaseTax {
        id
        name
        rate
        type
        isActive
      }
      supplier {
        id
        name
      }
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: NewProduct!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      sku
      barcode
      salesPrice
      isSalesTaxInclusive
      purchasePrice
      isBatchTracking
      productUnit {
        id
        name
      }
      category {
        id
        name
      }
      inventoryAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      purchaseAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      salesAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      salesTax {
        id
        name
        rate
        type
        isActive
      }
      purchaseTax {
        id
        name
        rate
        type
        isActive
      }
      supplier {
        id
        name
      }
    }
  }
`;

const CREATE_PRODUCT_CATEGORY = gql`
  mutation CreateProductCategory($input: NewProductCategory!) {
    createProductCategory(input: $input) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
      name
      description
      sku
      barcode
      salesPrice
      isSalesTaxInclusive
      purchasePrice
      isBatchTracking
      productUnit {
        id
      }
      category {
        id
        name
      }
      inventoryAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      purchaseAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      salesAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      salesTax {
        id
        name
        rate
        type
        isActive
      }
      purchaseTax {
        id
        name
        rate
        type
        isActive
      }
      supplier {
        id
        name
      }
    }
  }
`;

const ProductMutations = {
  CREATE_PRODUCT,
  CREATE_PRODUCT_CATEGORY,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
};

export default ProductMutations;
