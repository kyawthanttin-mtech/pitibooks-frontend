import { gql } from "@apollo/client";

const CREATE_TRANSACTION_NUMBER_SERIES = gql`
  mutation CreateTransactionNumberSeries($input: NewTransactionNumberSeries!) {
    createTransactionNumberSeries(input: $input) {
      id
      name
      modules {
        moduleName
        prefix
      }
    }
  }
`;

const UPDATE_TRANSACTION_NUMBER_SERIES = gql`
  mutation UpdateTransactionNumberSeries(
    $id: ID!
    $input: NewTransactionNumberSeries!
  ) {
    updateTransactionNumberSeries(id: $id, input: $input) {
      id
      name
      modules {
        moduleName
        prefix
      }
    }
  }
`;

const DELETE_TRANSACTION_NUMBER_SERIES = gql`
  mutation DeleteTransactionNumberSeries($id: ID!) {
    deleteTransactionNumberSeries(id: $id) {
      id
      name
      modules {
        moduleName
        prefix
      }
    }
  }
`;

const TransactionNumberSeriesMutations = {
  CREATE_TRANSACTION_NUMBER_SERIES,
  UPDATE_TRANSACTION_NUMBER_SERIES,
  DELETE_TRANSACTION_NUMBER_SERIES,
};

export default TransactionNumberSeriesMutations;
