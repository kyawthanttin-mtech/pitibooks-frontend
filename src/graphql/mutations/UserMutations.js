import { gql } from "@apollo/client";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      name
      role
      modules {
        moduleName
        allowedActions
      }
      businessName
      baseCurrencyId
      baseCurrencyName
      fiscalYear
      timezone
    }
  }
`;

const CREATE_USER = gql`
  mutation Register($input: NewUser!) {
    register(input: $input) {
      username
      name
      role
    }
  }
`;

const UserMutations = {
  LOGIN,
  CREATE_USER,
};

export default UserMutations;
