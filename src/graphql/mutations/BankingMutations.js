import { gql } from "@apollo/client";

const CREATE_ACCOUNT_TRANSFER = gql`
  mutation CreateAccountTransferTransaction(
    $input: NewAccountTransferTransaction!
  ) {
    createAccountTransferTransaction(input: $input) {
      id
      branch {
        id
        name
      }
      fromAccount {
        id
        name
      }
      toAccount {
        id
        name
      }
      currency {
        id
        name
        decimalPlaces
      }
      exchangeRate
      amount
      bankCharges
      referenceNumber
      description
      transferDate
      # documents {
      #   id
      #   documentUrl
      # }
    }
  }
`;

const UPDATE_ACCOUNT_TRANSFER = gql`
  mutation UpdateAccountTransferTransaction(
    $id: ID!
    $input: NewAccountTransferTransaction!
  ) {
    updateAccountTransferTransaction(id: $id, input: $input) {
      id
      branch {
        id
        name
      }
      fromAccount {
        id
        name
      }
      toAccount {
        id
        name
      }
      currency {
        id
        name
        decimalPlaces
      }
      exchangeRate
      amount
      bankCharges
      referenceNumber
      description
      transferDate
      documents {
        id
        documentUrl
      }
    }
  }
`;

const DELETE_ACCOUNT_TRANSFER = gql`
  mutation DeleteAccountTransferTransaction($id: ID!) {
    deleteAccountTransferTransaction(id: $id) {
      id
      branch {
        id
        name
      }
      fromAccount {
        id
        name
      }
      toAccount {
        id
        name
      }
      currency {
        id
        name
        decimalPlaces
      }
      exchangeRate
      amount
      bankCharges
      referenceNumber
      description
      transferDate
      documents {
        id
        documentUrl
      }
    }
  }
`;

const BankingMutations = {
  CREATE_ACCOUNT_TRANSFER,
  UPDATE_ACCOUNT_TRANSFER,
  DELETE_ACCOUNT_TRANSFER,
};

export default BankingMutations;
