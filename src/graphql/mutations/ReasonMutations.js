import { gql } from "@apollo/client";

const CREATE_REASON = gql`
  mutation CreateReason($input: NewReason!) {
    createReason(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_REASON = gql`
  mutation UpdateReason($input: NewReason!, $id: ID!) {
    updateReason(input: $input, id: $id) {
      id
      name
    }
  }
`;
const DELETE_REASON = gql`
  mutation DeleteReason($id: ID!) {
    deleteReason(id: $id) {
      id
      name
    }
  }
`;

const TOGGLE_ACTIVE_REASON = gql`
  mutation ToggleActiveReason($id: ID!, $isActive: Boolean!) {
    toggleActiveReason(id: $id, isActive: $isActive) {
      id
      name
      isActive
    }
  }
`;

const ReasonMutations = {
  CREATE_REASON,
  UPDATE_REASON,
  DELETE_REASON,
  TOGGLE_ACTIVE_REASON,
};

export default ReasonMutations;
