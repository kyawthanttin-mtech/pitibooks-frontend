import { gql } from "@apollo/client";

const CREATE_SALES_ORDER = gql`
  mutation CreateSalesOrder($input: NewSalesOrder!) {
    createSalesOrder(input: $input) {
      id
      customer {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      expectedShipmentDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryMethod {
        id
        name
      }
      salesPerson {
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
      shippingCharges
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
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
      details {
        productId
        productType
        batchNumber
        name
        description
        detailQty
        detailUnitRate
        detailDiscount
        detailDiscountType
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
    }
  }
`;

const UPDATE_SALES_ORDER = gql`
  mutation UpdateSalesOrder($input: NewSalesOrder!, $id: ID!) {
    updateSalesOrder(id: $id, input: $input) {
      id
      customer {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      expectedShipmentDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryMethod {
        id
        name
      }
      salesPerson {
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
      shippingCharges
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
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
      details {
        productId
        productType
        batchNumber
        name
        description
        detailQty
        detailUnitRate
        detailDiscount
        detailDiscountType
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
    }
  }
`;
const DELETE_SALES_ORDER = gql`
  mutation DeleteSalesOrder($id: ID!) {
    deleteSalesOrder(id: $id) {
      id
      customer {
        id
        name
      }
      branch {
        id
        name
      }
      orderNumber
      expectedShipmentDate
      orderPaymentTerms
      orderPaymentTermsCustomDays
      deliveryMethod {
        id
        name
      }
      salesPerson {
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
      shippingCharges
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
      orderSubtotal
      orderTotalDiscountAmount
      orderTotalTaxAmount
      orderTotalAmount
      details {
        productId
        productType
        batchNumber
        name
        description
        detailQty
        detailUnitRate
        detailDiscount
        detailDiscountType
        detailTax {
          id
          name
          rate
          type
        }
        detailDiscountAmount
        detailTaxAmount
        detailTotalAmount
      }
    }
  }
`;

const SalesOrderMutations = {
  CREATE_SALES_ORDER,
  UPDATE_SALES_ORDER,
  DELETE_SALES_ORDER,
};

export default SalesOrderMutations;
