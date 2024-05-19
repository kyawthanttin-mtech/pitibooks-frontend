import { gql } from "@apollo/client";

const CREATE_BILL = gql`
  mutation CreateBill($input: NewBill!) {
    createBill(input: $input) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      purchaseOrderNumber
      billNumber
      referenceNumber
      billDate
      billDueDate
      billPaymentTerms
      billSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      billDiscount
      billDiscountType
      billDiscountAmount
      adjustmentAmount
      isTaxInclusive
      billTax {
        id
        name
        rate
        type
      }
      billTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      warehouse {
        id
        name
      }
      billSubtotal
      billTotalDiscountAmount
      billTotalTaxAmount
      billTotalAmount
      billTotalPaidAmount
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
        customerId
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
    }
  }
`;

const UPDATE_BILL = gql`
  mutation UpdateBill($input: NewBill!, $id: ID!) {
    updateBill(id: $id, input: $input) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      purchaseOrderNumber
      billNumber
      referenceNumber
      billDate
      billDueDate
      billPaymentTerms
      billSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      billDiscount
      billDiscountType
      billDiscountAmount
      adjustmentAmount
      isTaxInclusive
      billTax {
        id
        name
        rate
        type
      }
      billTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      warehouse {
        id
        name
      }
      billSubtotal
      billTotalDiscountAmount
      billTotalTaxAmount
      billTotalAmount
      billTotalPaidAmount
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
        customerId
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
    }
  }
`;
const DELETE_BILL = gql`
  mutation DeleteBill($id: ID!) {
    deleteBill(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      purchaseOrderNumber
      billNumber
      referenceNumber
      billDate
      billDueDate
      billPaymentTerms
      billSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      billDiscount
      billDiscountType
      billDiscountAmount
      adjustmentAmount
      isTaxInclusive
      billTax {
        id
        name
        rate
        type
      }
      billTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      warehouse {
        id
        name
      }
      billSubtotal
      billTotalDiscountAmount
      billTotalTaxAmount
      billTotalAmount
      billTotalPaidAmount
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
        customerId
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
    }
  }
`;

const CONFIRM_BILL = gql`
  mutation ConfirmBill($id: ID!) {
    confirmBill(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      purchaseOrderNumber
      billNumber
      referenceNumber
      billDate
      billDueDate
      billPaymentTerms
      billSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      billDiscount
      billDiscountType
      billDiscountAmount
      adjustmentAmount
      isTaxInclusive
      billTax {
        id
        name
        rate
        type
      }
      billTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      warehouse {
        id
        name
      }
      billSubtotal
      billTotalDiscountAmount
      billTotalTaxAmount
      billTotalAmount
      billTotalPaidAmount
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
        customerId
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
    }
  }
`;

const VOID_BILL = gql`
  mutation VoidBill($id: ID!) {
    voidBill(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      purchaseOrderNumber
      billNumber
      referenceNumber
      billDate
      billDueDate
      billPaymentTerms
      billSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      billDiscount
      billDiscountType
      billDiscountAmount
      adjustmentAmount
      isTaxInclusive
      billTax {
        id
        name
        rate
        type
      }
      billTaxAmount
      currentStatus
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      warehouse {
        id
        name
      }
      billSubtotal
      billTotalDiscountAmount
      billTotalTaxAmount
      billTotalAmount
      billTotalPaidAmount
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
        customerId
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
    }
  }
`;

const BillMutations = {
  CREATE_BILL,
  UPDATE_BILL,
  DELETE_BILL,
  CONFIRM_BILL,
  VOID_BILL,
};

export default BillMutations;
