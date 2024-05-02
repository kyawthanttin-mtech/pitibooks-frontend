import { gql } from "@apollo/client";

const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: NewPurchaseOrder!) {
    createPurchaseOrder(input: $input) {
      id
      businessId
      orderNumber
      orderDiscount
      orderDiscountType
      orderDiscountAmount
      orderTotalDiscountAmount
      orderTaxAmount
      orderTotalTaxAmount
      orderSubtotal
      adjustmentAmount
      orderTotalAmount
      details {
        id
        productId
        productType
        batchNumber
        name
        detailAccountId
        detailQty
        detailUnitRate
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTotalAmount
        detailTaxAmount
      }
      referenceNumber
      orderDate
      # expectedDeliveryDate
      # orderPaymentTerms
      # orderPaymentTermsCustomDays
      # deliveryWarehouseId
      # deliveryCustomerId
      # deliveryAddress
      # shipmentPreferenceId
      # notes
      # termsAndConditions
      # warehouseId

      # currentStatus

      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($input: NewPurchaseOrder!) {
    updatePurchaseOrder(id: 3, input: $input) {
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
`;
const DELETE_PURCHASE_ORDER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id) {
      id
      businessId
      name
      email
      phone
      mobile
      supplierTax {
        id
        name
        rate
        type
        isActive
      }
      supplierPaymentTerms
      supplierPaymentTermsCustomDays
      notes
      prepaidCreditAmount
      unusedCreditAmount
      exchangeRate
      openingBalanceBranchId
      openingBalance
      isActive
      currency {
        id
        businessId
        symbol
        name
        decimalPlaces
        isActive
      }
      billingAddress {
        id
        attention
        address
        country
        city
        email
        phone
        mobile
        referenceType
        referenceID
      }
      shippingAddress {
        id
        attention
        address
        country
        city
        stateId
        townshipId
        email
        phone
        mobile
        referenceType
        referenceID
      }
      contactPersons {
        id
        name
        email
        phone
        mobile
        designation
        department
        referenceType
        referenceID
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

const TOGGLE_ACTIVE_PRODUCT_UNIT = gql`
  mutation ToggleActiveProductUnit($id: ID!, $isActive: Boolean!) {
    toggleActiveProductUnit(id: $id, isActive: $isActive) {
      id
      businessId
      name
      abbreviation
      precision
      isActive
    }
  }
`;

const PurchaseOrderMutations = {
  CREATE_PURCHASE_ORDER,
  UPDATE_PURCHASE_ORDER,
  DELETE_PURCHASE_ORDER,
  TOGGLE_ACTIVE_PRODUCT_UNIT,
};

export default PurchaseOrderMutations;
