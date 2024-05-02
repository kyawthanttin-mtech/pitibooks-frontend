import { gql } from "@apollo/client";

const CREATE_PAYMENT_MODE = gql`
  mutation CreatePaymentMode($input: NewPaymentMode!) {
    createPaymentMode(input: $input) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PAYMENT_MODE = gql`
  mutation UpdatePaymentMode($id: ID!, $input: NewPaymentMode!) {
    updatePaymentMode(id: $id, input: $input) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;
const DELETE_PAYMENT_MODE = gql`
  mutation DeletePaymentMode($id: ID!) {
    deletePaymentMode(id: $id) {
      id
      businessId
      name
      createdAt
      updatedAt
    }
  }
`;

const PaymentModeMutations = {
  CREATE_PAYMENT_MODE,
  UPDATE_PAYMENT_MODE,
  DELETE_PAYMENT_MODE,
};

export default PaymentModeMutations;
