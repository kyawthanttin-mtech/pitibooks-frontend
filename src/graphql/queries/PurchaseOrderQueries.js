import { gql } from "@apollo/client";

const GET_PAGINATE_PURCHASE_ORDER = gql`
  query PaginatePurchaseOrder($after: String, $limit: Int, $name: String) {
    paginatePurchaseOrder(after: $after, limit: $limit, name: $name) {
      edges {
        cursor
        node {
          id
          businessId
          orderNumber
          createdAt
          updatedAt
          orderDiscount
          orderDiscountType
          orderDiscountAmount
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
            currency {
              id
              symbol
            }
            bills {
              currentStatus
            }
          }
          bill {
            id
            businessId
            purchaseOrderId
            billNumber
            referenceNumber
            billDate
            billDueDate
            billPaymentTerms
            billSubject
            notes
            exchangeRate
            billDiscount
            billDiscountType
            billDiscountAmount
            adjustmentAmount
            isTaxInclusive
            billTaxAmount
            currentStatus
            warehouseId
            billSubtotal
            billTotalDiscountAmount
            billTotalTaxAmount
            billTotalAmount
            billTotalPaidAmount
            createdAt
            updatedAt
          }
          details {
            id
            purchaseOrderId
            productId
            productType
            batchNumber
            name
            description
            detailAccountId
            detailQty
            detailUnitRate
            detailDiscount
            detailDiscountType
            detailDiscountAmount
            detailTaxAmount
            detailTotalAmount
            detailAccountId
            detailTax {
              id
              name
              rate
              type
              isActive
            }
            detailUnitRate
            detailQty
          }
          referenceNumber
          branch {
            id
            name
            phone
            mobile
            address
            country
            city
          }
          orderDate
          expectedDeliveryDate
          orderPaymentTerms
          orderPaymentTermsCustomDays
          deliveryWarehouseId
          deliveryCustomerId
          deliveryAddress
          shipmentPreferenceId
          notes
          currency {
            id
            symbol
            exchangeRate
          }
          orderTax {
            name
            rate
            type
          }
          isDetailTaxInclusive
          adjustmentAmount
          currentStatus
          orderTaxAmount
          warehouseId
          orderSubtotal
          orderTotalDiscountAmount
          orderTotalTaxAmount
          orderTotalAmount
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
      productNature
      description
      sku
      barcode
      salesPrice
      isSalesTaxInclusive
      isActive
      createdAt
      updatedAt
      bills {
        id
        businessId
        purchaseOrderId
        billNumber
        referenceNumber
        billDate
        billDueDate
        billPaymentTerms
        billSubject
        notes
        exchangeRate
        billDiscount
        billDiscountType
        billDiscountAmount
        adjustmentAmount
        isTaxInclusive
        billTaxAmount
        currentStatus
        warehouseId
        billSubtotal
        billTotalDiscountAmount
        billTotalTaxAmount
        billTotalAmount
        billTotalPaidAmount
        createdAt
        updatedAt
        currency {
          businessId
          symbol
        }
        billTax {
          name
          rate
          type
        }
        documents {
          id
          documentUrl
          referenceType
          referenceID
        }
        details {
          id
          billId
          productId
          productType
          batchNumber
          name
          description
          detailAccountId
          customerId
          detailQty
          detailUnitRate
          detailDiscount
          detailDiscountType
          detailDiscountAmount
          detailTaxAmount
          detailTotalAmount
          detailTax {
            name
            rate
            type
          }
        }
      }
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

const PurchaseOrderQueries = {
  GET_PRODUCT,
  GET_PAGINATE_PURCHASE_ORDER,
};

export default PurchaseOrderQueries;
