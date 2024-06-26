import React from "react";
import ReactDOM from "react-dom/client";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  concat,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { getMainDefinition } from "@apollo/client/utilities";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Wrapper from "./localeWrapper";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const httpLink = new HttpLink({ uri: "http://139.59.236.210:3000/query" });
// const httpLink = new HttpLink({ uri: "http://192.168.88.122:8081/query" });
// const httpLink = new HttpLink({ uri: "http://192.168.88.46:8081/query" });
// const httpLink = new HttpLink({ uri: "http://localhost:8081/query" });

const uploadLink = createUploadLink({
  uri: "http://139.59.236.210:3000/query",
});

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      token: localStorage.getItem("token")
        ? `${localStorage.getItem("token")}`
        : "",
    },
  }));

  return forward(operation);
});

// check if the operation involves file upload
const isUploadOperation = ({ variables }) => {
  return Object.values(variables).some(
    (value) =>
      value instanceof File ||
      (Array.isArray(value) && value.some((file) => file instanceof File))
  );
};

const link = split(
  // split based on operation type
  ({ query, variables }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "mutation" &&
      isUploadOperation({ variables })
    );
  },
  uploadLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          paginateJournal: relayStylePagination(),
          paginateJournalReport: relayStylePagination(),
          paginateDetailedGeneralLedgerReport: relayStylePagination(),
          paginateAccountTransactionReport: relayStylePagination(),
          paginateProductCategory: relayStylePagination(),
          paginateProductUnit: relayStylePagination(),
          paginateProduct: relayStylePagination(),
          paginateProductGroup: relayStylePagination(),
          paginatePurchaseOrder: relayStylePagination(),
          paginateSupplier: relayStylePagination(),
          paginateBill: relayStylePagination(),
          paginateSupplierCredit: relayStylePagination(),
          paginateCustomer: relayStylePagination(),
          paginateSalesPerson: relayStylePagination(),
          paginateSalesOrder: relayStylePagination(),
          paginateCustomerPayment: relayStylePagination(),
          paginateExpense: relayStylePagination(),
          paginateInvoice: relayStylePagination(),
          paginateCreditNote: relayStylePagination(),
          paginateSupplierPayment: relayStylePagination(),
          paginateTransferOrder: relayStylePagination(),
          paginateInventoryAdjustment: relayStylePagination(),
          paginateSalesInvoice: relayStylePagination(),
          paginateBankingTransaction: relayStylePagination(),
        },
      },
    },
  }),
  link: concat(authMiddleware, link),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Wrapper>
        <App />
      </Wrapper>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
