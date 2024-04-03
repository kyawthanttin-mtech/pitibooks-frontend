import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, ApolloLink, ApolloProvider, concat, HttpLink, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Wrapper from "./localeWrapper";

const httpLink = new HttpLink({uri: 'http://139.59.236.210:3000/query'});

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      token: localStorage.getItem("token")
        ? `${localStorage.getItem("token")}`
        : "",
    }
  }));

  return forward(operation);
})

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          paginateJournal: relayStylePagination(),
          paginateJournalReport: relayStylePagination(),
        },
      },
    },
  }),
  link: concat(authMiddleware, httpLink),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
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
