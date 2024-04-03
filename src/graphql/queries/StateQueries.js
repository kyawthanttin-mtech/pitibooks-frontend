import { gql } from "@apollo/client";

const GET_ALL_STATES = gql`
  query GetAllStates {
    listAllState {
      id
      code
      stateNameEn
      stateNameMm
      isActive
    }
  }
`;

const StateQueries = {
  GET_ALL_STATES,
};

export default StateQueries;
