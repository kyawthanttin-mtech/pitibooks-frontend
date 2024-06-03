import { gql } from "@apollo/client";

const CREATE_SUPPLIER_PAYMENT = gql`
  mutation CreateSupplierPayment($input: NewSupplierPayment!) {
    createSupplierPayment(input: $input) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      amount
      bankCharges
      paymentDate
      paymentNumber
      paymentMode {
        id
        name
      }
      withdrawAccount {
        id
        name
      }
      referenceNumber
      notes
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      paidBills {
        id
        supplierPaymentId
        bill {
          billNumber
          billDate
          billTotalAmount
          billTotalPaidAmount
        }
        paidAmount
      }
    }
  }
`;

const UPDATE_SUPPLIER_PAYMENT = gql`
  mutation UpdateSupplierPayment($id: ID!, $input: NewSupplierPayment!) {
    updateSupplierPayment(id: $id, input: $input) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      amount
      bankCharges
      paymentDate
      paymentNumber
      paymentMode {
        id
        name
      }
      withdrawAccount {
        id
        name
      }
      referenceNumber
      notes
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      paidBills {
        id
        supplierPaymentId
        bill {
          billNumber
          billDate
          billTotalAmount
          billTotalPaidAmount
        }
        paidAmount
      }
    }
  }
`;
const DELETE_SUPPLIER_PAYMENT = gql`
  mutation DeleteSupplierPayment($id: ID!) {
    deleteSupplierPayment(id: $id) {
      id
      supplier {
        id
        name
      }
      branch {
        id
        name
      }
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      amount
      bankCharges
      paymentDate
      paymentNumber
      paymentMode {
        id
        name
      }
      withdrawAccount {
        id
        name
      }
      referenceNumber
      notes
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      paidBills {
        id
        supplierPaymentId
        bill {
          billNumber
          billDate
          billTotalAmount
          billTotalPaidAmount
        }
        paidAmount
      }
    }
  }
`;

const SupplierPaymentMutations = {
  CREATE_SUPPLIER_PAYMENT,
  UPDATE_SUPPLIER_PAYMENT,
  DELETE_SUPPLIER_PAYMENT,
};

export default SupplierPaymentMutations;
