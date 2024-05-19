import { gql } from "@apollo/client";

const CREATE_PAYMENT_MODE = gql`
  mutation CreatePaymentMode($input: NewPaymentMode!) {
    createPaymentMode(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_PAYMENT_MODE = gql`
  mutation UpdatePaymentMode($id: ID!, $input: NewPaymentMode!) {
    updatePaymentMode(id: $id, input: $input) {
      id
      name
    }
  }
`;
const DELETE_PAYMENT_MODE = gql`
  mutation DeletePaymentMode($id: ID!) {
    deletePaymentMode(id: $id) {
      id
      name
    }
  }
`;

const TOGGLE_ACTIVE_PAYMENT_MODE = gql`
  mutation ToggleActivePaymentMode($id: ID!, $isActive: Boolean!) {
    toggleActivePaymentMode(id: $id, isActive: $isActive) {
      id
      name
      isActive
    }
  }
`;


const PaymentModeMutations = {
  CREATE_PAYMENT_MODE,
  UPDATE_PAYMENT_MODE,
  DELETE_PAYMENT_MODE,
  TOGGLE_ACTIVE_PAYMENT_MODE,
};

export default PaymentModeMutations;
