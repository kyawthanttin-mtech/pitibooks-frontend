import { gql } from "@apollo/client";

const GET_HISTORIES = gql`
  query GetHistories($referenceId: Int, $referenceType: String, $userId: Int) {
    listHistory(
      referenceId: $referenceId
      referenceType: $referenceType
      userId: $userId
    ) {
      id
      businessId
      actionType
      before
      after
      description
      referenceId
      referenceType
      userId
      userName
      createdAt
    }
  }
`;

const HistoryQueries = {
  GET_HISTORIES,
};

export default HistoryQueries;
