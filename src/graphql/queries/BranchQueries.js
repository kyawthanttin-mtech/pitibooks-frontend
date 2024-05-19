import { gql } from "@apollo/client";

const GET_ALL_BRANCHES = gql`
  query GetAllBranches {
    listAllBranch {
      id
      name
      isActive
    }
  }
`

const GET_BRANCHES = gql`
  query GetBranches($name: String) {
    listBranch(name: $name) {
      id
      name
      phone
      mobile
      address
      state {
        id
        stateNameEn
        code
      }
      township {
        id
        stateCode
        townshipNameEn
        code
      }
      country
      city
      isActive
      transactionNumberSeries {
        id
        name
      }
    }
  }
`;
const GET_BRANCH = gql`
  query GetBranch($id: ID!) {
    getBranch(id: $id) {
      id
      name
      phone
      mobile
      address
      state {
        id
        stateNameEn
        code
      }
      township {
        id
        stateCode
        townshipNameEn
        code
      }
      country
      city
      isActive
      transactionNumberSeries {
        id
        name
      }
    }
  }
`;

const BranchQueries = {
  GET_ALL_BRANCHES,
  GET_BRANCHES,
  GET_BRANCH,
};

export default BranchQueries;
