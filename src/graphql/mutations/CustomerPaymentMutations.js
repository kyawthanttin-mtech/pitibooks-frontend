import { gql } from "@apollo/client";

const CREATE_CUSTOMER_PAYMENT = gql`
  mutation CreateCustomerPayment($input: NewCustomerPayment!) {
    createCustomerPayment(input: $input) {
      id
      customer {
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
      exchangeRate
      amount
      bankCharges
      paymentDate
      paymentNumber
      paymentMode {
        id
        name
      }
      depositAccount {
        id
        name
        currency {
          id
          name
          symbol
          decimalPlaces
        }
      }
      referenceNumber
      notes
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      paidInvoices {
        id
        customerPaymentId
        invoice {
          id
          remainingBalance
        }
        paidAmount
      }
    }
  }
`;

const UPDATE_CUSTOMER_PAYMENT = gql`
  mutation UpdateCustomerPayment($id: ID!, $input: NewCustomerPayment!) {
    updateCustomerPayment(id: $id, input: $input) {
      id
      customer {
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
      exchangeRate
      amount
      bankCharges
      paymentDate
      paymentNumber
      paymentMode {
        id
        name
      }
      depositAccount {
        id
        name
        currency {
          id
          name
          symbol
          decimalPlaces
        }
      }
      referenceNumber
      notes
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      paidInvoices {
        id
        customerPaymentId
        invoice {
          id
          remainingBalance
        }
        paidAmount
      }
    }
  }
`;
const DELETE_CUSTOMER_PAYMENT = gql`
  mutation DeleteCustomerPayment($id: ID!) {
    deleteCustomerPayment(id: $id) {
      id
      customer {
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
      exchangeRate
      amount
      bankCharges
      paymentDate
      paymentNumber
      paymentMode {
        id
        name
      }
      depositAccount {
        id
        name
        currency {
          id
          name
          symbol
          decimalPlaces
        }
      }
      referenceNumber
      notes
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
      paidInvoices {
        id
        customerPaymentId
        invoice {
          id
          remainingBalance
        }
        paidAmount
      }
    }
  }
`;

const CustomerPaymentMutations = {
  CREATE_CUSTOMER_PAYMENT,
  UPDATE_CUSTOMER_PAYMENT,
  DELETE_CUSTOMER_PAYMENT,
};

export default CustomerPaymentMutations;
