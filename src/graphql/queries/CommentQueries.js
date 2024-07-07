import { gql } from "@apollo/client";

const GET_COMMENTS = gql`
  query GetComments($referenceId: Int, $referenceType: String, $userId: Int) {
    listComment(
      referenceId: $referenceId
      referenceType: $referenceType
      userId: $userId
    ) {
      id
      businessId
      description
      referenceId
      referenceType
      userId
      userName
      createdAt
    }
  }
`;

const CommentQueries = {
  GET_COMMENTS,
};

export default CommentQueries;
