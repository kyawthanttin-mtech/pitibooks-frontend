import { gql } from "@apollo/client";

const GET_TRANSACTION_NUMBER_SERIES_ALL = gql`
  query GetTransactionNumberSeriesAll($name: String) {
    listTransactionNumberSeries(name: $name) {
      id
      name
      modules {
        moduleName
        prefix
      }
    }
  }
`;
const TransactionNumberSeriesQueries = {
  GET_TRANSACTION_NUMBER_SERIES_ALL,
};

export default TransactionNumberSeriesQueries;
