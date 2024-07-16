import { gql } from "@apollo/client";

const CREATE_REFUND = gql`
  mutation CreateRefund($input: NewRefund!) {
    createRefund(input: $input) {
      id
      businessId
      referenceId
      referenceType
      refundDate
      amount
      referenceNumber
      description
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_REFUND = gql`
  mutation UpdateRefund($id: ID!, $input: NewRefund!) {
    updateRefund(id: $id, input: $input) {
      id
      businessId
      referenceId
      referenceType
      refundDate
      amount
      exchangeRate
      referenceNumber
      description
      createdAt
      updatedAt
    }
  }
`;

const DELETE_REFUND = gql`
  mutation DeleteRefund($id: ID!) {
    deleteRefund(id: $id) {
      id
      businessId
      referenceId
      referenceType
      refundDate
      amount
      exchangeRate
      referenceNumber
      description
      createdAt
      updatedAt
    }
  }
`;

const RefundMutations = {
  CREATE_REFUND,
  UPDATE_REFUND,
  DELETE_REFUND,
};

export default RefundMutations;
