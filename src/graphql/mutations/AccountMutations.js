import { gql } from "@apollo/client";

const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: NewAccount!) {
    createAccount(input: $input) {
      id
      name
      detailType
      mainType
    }
  }
`;

const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($id: ID!, $input: NewAccount!) {
    updateAccount(id: $id, input: $input) {
      id
      name
      detailType
      mainType
    }
  }
`;

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($id: ID!) {
    deleteAccount(id: $id) {
      id
      name
      detailType
      mainType
    }
  }
`;

const TOGGLE_ACTIVE_ACCOUNT = gql`
  mutation ToggleActiveAccount($id: ID!, $isActive: Boolean!) {
    toggleActiveAccount(id: $id, isActive: $isActive) {
      id
      detailType
      mainType
      name
      isActive
    }
  }
`;

const AccountMutations = {
  CREATE_ACCOUNT,
  UPDATE_ACCOUNT,
  DELETE_ACCOUNT,
  TOGGLE_ACTIVE_ACCOUNT,
};

export default AccountMutations;
