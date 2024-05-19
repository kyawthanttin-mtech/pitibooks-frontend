import { gql } from "@apollo/client";

const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: NewExpense!) {
    createExpense(input: $input) {
      id
      expenseAccount {
        id
        name
      }
      assetAccount {
        id
        name
      }
      branch {
        id
        name
      }
      expenseDate
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      amount
      taxAmount
      totalAmount
      supplier {
        id
        name
      }
      customer {
        id
        name
      }
      referenceNumber
      notes
      expenseTax {
        id
        name
        rate
        type
      }
      isTaxInclusive
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;

const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: ID!, $input: NewExpense!) {
    updateExpense(id: $id, input: $input) {
      id
      expenseAccount {
        id
        name
      }
      assetAccount {
        id
        name
      }
      branch {
        id
        name
      }
      expenseDate
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      amount
      taxAmount
      totalAmount
      supplier {
        id
        name
      }
      customer {
        id
        name
      }
      referenceNumber
      notes
      expenseTax {
        id
        name
        rate
        type
      }
      isTaxInclusive
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;

const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id) {
      id
      expenseAccount {
        id
        name
      }
      assetAccount {
        id
        name
      }
      branch {
        id
        name
      }
      expenseDate
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      exchangeRate
      amount
      taxAmount
      totalAmount
      supplier {
        id
        name
      }
      customer {
        id
        name
      }
      referenceNumber
      notes
      expenseTax {
        id
        name
        rate
        type
      }
      isTaxInclusive
      documents {
        id
        documentUrl
        referenceType
        referenceID
      }
    }
  }
`;

const ExpenseMutations = {
  CREATE_EXPENSE,
  UPDATE_EXPENSE,
  DELETE_EXPENSE,
};

export default ExpenseMutations;
