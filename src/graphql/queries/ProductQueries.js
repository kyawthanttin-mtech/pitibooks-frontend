import { gql } from "@apollo/client";

const GET_PAGINATE_PRODUCT = gql`
  query PaginateProduct(
    $after: String
    $limit: Int
    $name: String
    $sku: String
  ) {
    paginateProduct(after: $after, limit: $limit, name: $name, sku: $sku) {
      edges {
        cursor
        node {
          id
          name
          description
          sku
          barcode
          salesPrice
          isSalesTaxInclusive
          purchasePrice
          # isActive
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
            # isActive
          }
          purchaseAccount {
            id
            detailType
            mainType
            name
            code
            # isActive
          }
          salesAccount {
            id
            detailType
            mainType
            name
            code
            # isActive
          }
          salesTax {
            id
            name
            rate
            type
            # isActive
          }
          purchaseTax {
            id
            name
            rate
            type
            # isActive
          }
          supplier {
            id
            name
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

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      businessId
      name
      description
      sku
      barcode
      salesPrice
      isSalesTaxInclusive
      isActive
      createdAt
      updatedAt

      productUnit {
        id
        businessId
        name
        abbreviation
        precision
        isActive
        createdAt
        updatedAt
      }
      category {
        id
        name
        isActive
      }
      supplier {
        id
        name
        email
        phone
        mobile
        supplierTaxId
        supplierTaxType
        supplierPaymentTerms
        supplierPaymentTermsCustomDays
        notes
        prepaidCreditAmount
        unusedCreditAmount
        isActive
        createdAt
        updatedAt
      }
      inventoryAccount {
        id
        businessId
        detailType
        mainType
        name
        code
        description
        isActive
        isSystemDefault
        SystemDefaultCode
        createdAt
        updatedAt
      }
      purchaseAccount {
        id
        businessId
        detailType
        mainType
        name
        code
        description
        isActive
        isSystemDefault
        SystemDefaultCode
        createdAt
        updatedAt
      }
      salesAccount {
        id
        businessId
        detailType
        mainType
        name
        code
        description
        isActive
        isSystemDefault
        SystemDefaultCode
        createdAt
        updatedAt
        parentAccount {
          id
          businessId
          detailType
          mainType
          name
          code
          description
          isActive
          isSystemDefault
          SystemDefaultCode
          createdAt
          updatedAt
        }
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
    }
  }
`;

const GET_ALL_PRODUCTS = gql`
  query ListAllProduct {
    listAllProduct {
      id
      name
      sku
      barcode
      salesPrice
      purchasePrice
      isActive
      salesAccount {
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
      inventoryAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      purchaseTax {
        id
        name
        rate
        type
        isActive
      }
      salesTax {
        id
        name
        rate
        type
        isActive
      }
    }
  }
`;

const GET_ALL_PRODUCT_VARIANTS = gql`
  query ListAllProductVariant {
    listAllProductVariant {
      id
      name
      sku
      barcode
      salesPrice
      purchasePrice
      productGroupId
      isActive
      salesAccount {
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
      inventoryAccount {
        id
        detailType
        mainType
        name
        code
        isActive
      }
      purchaseTax {
        id
        name
        rate
        type
        isActive
      }
      salesTax {
        id
        name
        rate
        type
        isActive
      }
    }
  }
`;

const ProductQueries = {
  GET_PRODUCT,
  GET_PAGINATE_PRODUCT,
  GET_ALL_PRODUCTS,
  GET_ALL_PRODUCT_VARIANTS,
};

export default ProductQueries;
