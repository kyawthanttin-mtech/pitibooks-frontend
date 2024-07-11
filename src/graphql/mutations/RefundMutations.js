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

const RefundMutations = {
  CREATE_REFUND,
};

export default RefundMutations;
