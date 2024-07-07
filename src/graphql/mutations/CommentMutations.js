import { gql } from "@apollo/client";

const CREATE_COMMENT = gql`
  mutation CreateComment($input: NewComment!) {
    createComment(input: $input) {
      id
      businessId
      description
      referenceId
      referenceType
      userId
      userName
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
      businessId
      description
      referenceId
      referenceType
      userId
      userName
    }
  }
`;

const CommentMutations = {
  CREATE_COMMENT,
  DELETE_COMMENT,
};

export default CommentMutations;
