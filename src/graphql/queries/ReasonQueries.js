import { gql } from "@apollo/client";

const GET_ALL_REASONS = gql`
  query ListAllReason {
    listAllReason {
      id
      name
      isActive
    }
  }
`;

const ReasonQueries = {
  GET_ALL_REASONS,
};

export default ReasonQueries;
