import { gql } from "@apollo/client";

const CREATE_BRANCH = gql`
  mutation CreateBranch($input: NewBranch!) {
    createBranch(input: $input) {
      id
      name
      phone
      mobile
      address
      state {
        id
        code
        stateNameEn
      }
      township {
        id
        stateCode
        townshipNameEn
      }
      country
      city
      transactionNumberSeries {
        id
        name
      }
    }
  }
`;

const UPDATE_BRANCH = gql`
  mutation UpdateBranch($id: ID!, $input: NewBranch!) {
    updateBranch(id: $id, input: $input) {
      id
      name
      phone
      mobile
      address
      state {
        id
        code
        stateNameEn
      }
      township {
        id
        stateCode
        townshipNameEn
      }
      country
      city
      transactionNumberSeries {
        id
        name
      }
    }
  }
`;

const DELETE_BRANCH = gql`
  mutation DeleteBranch($id: ID!) {
    deleteBranch(id: $id) {
      id
      name
      phone
      mobile
      address
      state {
        id
        code
        stateNameEn
      }
      township {
        id
        stateCode
        townshipNameEn
      }
      country
      city
      transactionNumberSeries {
        id
        name
      }
    }
  }
`;

const TOGGLE_ACTIVE_BRANCH = gql`
  mutation ToggleActiveBranch($id: ID!, $isActive: Boolean!) {
    toggleActiveBranch(id: $id, isActive: $isActive) {
      id
      name
      phone
      mobile
      address
      state {
        id
        code
        stateNameEn
      }
      township {
        id
        stateCode
        townshipNameEn
      }
      country
      city
      transactionNumberSeries {
        id
        name
      }
      isActive
    }
  }
`;

const BranchMutations = {
  CREATE_BRANCH,
  UPDATE_BRANCH,
  DELETE_BRANCH,
  TOGGLE_ACTIVE_BRANCH,
};

export default BranchMutations;
