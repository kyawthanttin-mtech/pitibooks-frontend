import { gql } from "@apollo/client";

const CREATE_BANKING_TRANSACTION = gql`
  mutation CreateBankingTransaction($input: NewBankingTransaction!) {
    createBankingTransaction(input: $input) {
      id
      transactionDate
      amount
      referenceNumber
      description
      isMoneyIn
      transactionType
      exchangeRate
      taxAmount
      bankCharges
      fromAccount {
        id
        name
        code
      }
      toAccount {
        id
        name
        code
      }
      paymentMode {
        id
        name
        isActive
      }
      supplier {
        id
        name
        phone
        mobile
      }
      customer {
        id
        name
        email
        phone
      }
      details {
        id
        invoiceNo
        bankingTransactionId
        dueAmount
        paymentAmount
        dueDate
      }
    }
  }
`;

const UPDATE_BANKING_TRANSACTION = gql`
  mutation UpdateBankingTransaction($input: NewBankingTransaction!, $id: ID!) {
    updateBankingTransaction(id: $id, input: $input) {
      id
      transactionDate
      amount
      referenceNumber
      description
      isMoneyIn
      transactionType
      exchangeRate
      taxAmount
      bankCharges
      fromAccount {
        id
        name
        code
      }
      toAccount {
        id
        name
        code
      }
      paymentMode {
        id
        name
        isActive
      }
      supplier {
        id
        name
        phone
        mobile
      }
      customer {
        id
        name
        email
        phone
      }
      details {
        id
        invoiceNo
        bankingTransactionId
        dueAmount
        paymentAmount
        dueDate
      }
    }
  }
`;

const DELETE_BANKING_TRANSACTION = gql`
  mutation DeleteBankingTransaction($id: ID!) {
    deleteBankingTransaction(id: $id) {
      id
    }
  }
`;

const BankingTransactionMutations = {
  CREATE_BANKING_TRANSACTION,
  UPDATE_BANKING_TRANSACTION,
  DELETE_BANKING_TRANSACTION,
};

export default BankingTransactionMutations;
