import { gql } from "@apollo/client";

const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: NewPurchaseOrder!) {
    createPurchaseOrder(input: $input) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      referenceNumber
      orderDate
      expectedDeliveryDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryWarehouseId
      deliveryCustomerId
      deliveryAddress
      shipmentPreference {
        id
        name
      }
      notes
      termsAndConditions
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      orderDiscount
      orderDiscountType
      orderDiscountAmount
      adjustmentAmount
      isTaxInclusive
      orderTax {
        id
        name
        rate
        type
      }
      orderTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
    }
  }
`;

const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($input: NewPurchaseOrder!, $id: ID!) {
    updatePurchaseOrder(input: $input, id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      referenceNumber
      orderDate
      expectedDeliveryDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryWarehouseId
      deliveryCustomerId
      deliveryAddress
      shipmentPreference {
        id
        name
      }
      notes
      termsAndConditions
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      orderDiscount
      orderDiscountType
      orderDiscountAmount
      adjustmentAmount
      isTaxInclusive
      orderTax {
        id
        name
        rate
        type
      }
      orderTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
    }
  }
`;
const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrder(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      referenceNumber
      orderDate
      expectedDeliveryDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryWarehouseId
      deliveryCustomerId
      deliveryAddress
      shipmentPreference {
        id
        name
      }
      notes
      termsAndConditions
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      orderDiscount
      orderDiscountType
      orderDiscountAmount
      adjustmentAmount
      isTaxInclusive
      orderTax {
        id
        name
        rate
        type
      }
      orderTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
    }
  }
`;
const CONFIRM_PURCHASE_ORDER = gql`
  mutation ConfirmPurchaseOrder($id: ID!) {
    confirmPurchaseOrder(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      referenceNumber
      orderDate
      expectedDeliveryDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryWarehouseId
      deliveryCustomerId
      deliveryAddress
      shipmentPreference {
        id
        name
      }
      notes
      termsAndConditions
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      orderDiscount
      orderDiscountType
      orderDiscountAmount
      adjustmentAmount
      isTaxInclusive
      orderTax {
        id
        name
        rate
        type
      }
      orderTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
    }
  }
`;
const CANCEL_PURCHASE_ORDER = gql`
  mutation CancelPurchaseOrder($id: ID!) {
    cancelPurchaseOrder(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      referenceNumber
      orderDate
      expectedDeliveryDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryWarehouseId
      deliveryCustomerId
      deliveryAddress
      shipmentPreference {
        id
        name
      }
      notes
      termsAndConditions
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      orderDiscount
      orderDiscountType
      orderDiscountAmount
      adjustmentAmount
      isTaxInclusive
      orderTax {
        id
        name
        rate
        type
      }
      orderTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      details {
        id
        productId
        productType
        batchNumber
        name
        description
        detailAccount {
          id
          name
        }
        detailQty
        detailUnitRate
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscount
        detailDiscountType
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
      warehouse {
        id
        name
      }
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
    }
  }
`;

const PurchaseOrderMutations = {
  CREATE_PURCHASE_ORDER,
  UPDATE_PURCHASE_ORDER,
  DELETE_PURCHASE_ORDER,
  CONFIRM_PURCHASE_ORDER,
  CANCEL_PURCHASE_ORDER,
};

export default PurchaseOrderMutations;
