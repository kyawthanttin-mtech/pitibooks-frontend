import { gql } from "@apollo/client";

const CREATE_BRANCH = gql`
  mutation CreateBranch($input: NewBranch!) {
    createBranch(input: $input) {
      id
      name
      phone
      address
      state {
        stateNameEn
      }
      township {
        townshipNameEn
      }
      country
      city
      transactionNumberSeries {
        id
        businessId
        name
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_BRANCH = gql`
  mutation UpdateBranch($id: ID!, $input: NewBranch!) {
    updateBranch(id: $id, input: $input) {
      id
      name
      transactionNumberSeries {
        id
        name
      }
      state {
        stateNameEn
      }
      township {
        townshipNameEn
      }
      country
      city
      address
    }
  }
`;

const DELETE_BRANCH = gql`
  mutation DeleteBranch($id: ID!) {
    deleteBranch(id: $id) {
      id
      name
      transactionNumberSeries {
        id
        name
      }
      country
      city
    }
  }
`;

const TOGGLE_ACTIVE_BRANCH = gql`
  mutation ToggleActiveBranch($id: ID!, $isActive: Boolean!) {
    toggleActiveBranch(id: $id, isActive: $isActive) {
      id
      businessId
      name
      phone
      mobile
      address
      country
      city
      isActive
      createdAt
      updatedAt
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
