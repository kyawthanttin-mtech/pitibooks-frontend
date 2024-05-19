import { gql } from "@apollo/client";

const GET_PAGINATED_PRODUCT_GROUPS = gql`
  query PaginateProductGroup($after: String, $limit: Int, $name: String) {
    paginateProductGroup(after: $after, limit: $limit, name: $name) {
      edges {
        cursor
        node {
          id
          businessId
          name
          description
          isActive
          isBatchTracking
          createdAt
          updatedAt
          category {
            id
            name
            isActive
          }
          variants {
            ID
            businessId
            productGroupId
            name
            sku
            barcode
            salesPrice
            isSalesTaxInclusive
            purchasePrice
            isActive
            createdAt
            updatedAt
            inventoryAccount {
              id
              name
              code
              detailType
              mainType
              isActive
              systemDefaultCode
            }
            purchaseTax {
              id
              name
              rate
              type
              isActive
            }
            purchaseAccount {
              id
              name
              code
              detailType
              mainType
              isActive
              systemDefaultCode
            }
            salesAccount {
              id
              name
              code
              detailType
              mainType
              isActive
              systemDefaultCode
            }
            salesTax {
              id
              name
              rate
              type
              isActive
            }
          }
          options {
            productGroupId
            optionName
            optionUnits
          }
          supplier {
            id
            businessId
            name
            email
            phone
            mobile
            supplierPaymentTerms
            supplierPaymentTermsCustomDays
            notes
            exchangeRate
            openingBalanceBranchId
            openingBalance
            prepaidCreditAmount
            unusedCreditAmount
            isActive
            createdAt
            updatedAt
          }
          images {
            id
            imageUrl
            thumbnailUrl
            referenceType
            referenceID
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
        businessId
        name
        isActive
        createdAt
        updatedAt
        products {
          id
          businessId
          name
          description
          sku
          barcode
          salesPrice
          isSalesTaxInclusive
          purchasePrice
          isActive
          createdAt
          updatedAt
        }
      }
      supplier {
        id
        businessId
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

const ProductGroupQueries = {
  GET_PRODUCT,
  GET_PAGINATED_PRODUCT_GROUPS,
};

export default ProductGroupQueries;
