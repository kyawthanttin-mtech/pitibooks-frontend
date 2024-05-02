import { gql } from "@apollo/client";

const CREATE_REASON = gql`
  mutation CreateReason($input: NewReason!) {
    createReason(input: $input) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_REASON = gql`
  mutation UpdateReason($input: NewReason!, $id: ID!) {
    updateReason(input: $input, id: $id) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;
const DELETE_REASON = gql`
  mutation DeleteReason($id: ID!) {
    deleteReason(id: $id) {
      id
      businessId
      name
      isActive
      createdAt
      updatedAt
    }
  }
`;

const ReasonMutations = {
  CREATE_REASON,
  UPDATE_REASON,
  DELETE_REASON,
};

export default ReasonMutations;
