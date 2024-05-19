import { gql } from "@apollo/client";

const CREATE_SUPPLIER_CREDIT = gql`
  mutation CreateSupplierCredit($input: NewSupplierCredit!) {
    createSupplierCredit(input: $input) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      supplierCreditNumber
      referenceNumber
      supplierCreditDate
      supplierCreditSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      warehouse {
        id
        name
      }
      supplierCreditDiscount
      supplierCreditDiscountType
      supplierCreditDiscountAmount
      adjustmentAmount
      isTaxInclusive
      supplierCreditTax {
        id
        name
        rate
        type
      }
      supplierCreditTaxAmount
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
      supplierCreditSubtotal
      supplierCreditTotalDiscountAmount
      supplierCreditTotalTaxAmount
      supplierCreditTotalAmount
    }
  }
`;

const UPDATE_SUPPLIER_CREDIT = gql`
  mutation UpdateSupplierCredit($input: NewSupplierCredit!, $id: ID!) {
    updateSupplierCredit(input: $input, id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      supplierCreditNumber
      referenceNumber
      supplierCreditDate
      supplierCreditSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      warehouse {
        id
        name
      }
      supplierCreditDiscount
      supplierCreditDiscountType
      supplierCreditDiscountAmount
      adjustmentAmount
      isTaxInclusive
      supplierCreditTax {
        id
        name
        rate
        type
      }
      supplierCreditTaxAmount
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
      supplierCreditSubtotal
      supplierCreditTotalDiscountAmount
      supplierCreditTotalTaxAmount
      supplierCreditTotalAmount
    }
  }
`;
const DELETE_SUPPLIER_CREDIT = gql`
  mutation DeleteSupplierCredit($id: ID!) {
    deleteSupplierCredit(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      supplierCreditNumber
      referenceNumber
      supplierCreditDate
      supplierCreditSubject
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      warehouse {
        id
        name
      }
      supplierCreditDiscount
      supplierCreditDiscountType
      supplierCreditDiscountAmount
      adjustmentAmount
      isTaxInclusive
      supplierCreditTax {
        id
        name
        rate
        type
      }
      supplierCreditTaxAmount
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
      supplierCreditSubtotal
      supplierCreditTotalDiscountAmount
      supplierCreditTotalTaxAmount
      supplierCreditTotalAmount
    }
  }
`;

const SupplierCreditMutations = {
  CREATE_SUPPLIER_CREDIT,
  UPDATE_SUPPLIER_CREDIT,
  DELETE_SUPPLIER_CREDIT,
};

export default SupplierCreditMutations;
