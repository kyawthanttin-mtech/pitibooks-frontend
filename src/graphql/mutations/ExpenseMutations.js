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
      referenceNumber
      expenseDate
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplier {
        id
        name
      }
      customer {
        id
        name
      }
      amount
      taxAmount
      totalAmount
      isTaxInclusive
      exchangeRate
      expenseTax {
        id
        name
        rate
        type
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
      referenceNumber
      expenseDate
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplier {
        id
        name
      }
      customer {
        id
        name
      }
      amount
      taxAmount
      totalAmount
      isTaxInclusive
      exchangeRate
      expenseTax {
        id
        name
        rate
        type
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
      referenceNumber
      expenseDate
      notes
      currency {
        id
        name
        symbol
        decimalPlaces
      }
      supplier {
        id
        name
      }
      customer {
        id
        name
      }
      amount
      taxAmount
      totalAmount
      isTaxInclusive
      exchangeRate
      expenseTax {
        id
        name
        rate
        type
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
