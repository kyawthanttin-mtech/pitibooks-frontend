import { gql } from "@apollo/client";

const CREATE_JOURNAL = gql`
  mutation CreateJournal($input: NewJournal!) {
    createJournal(input: $input) {
      id
      businessId
      journalNumber
      referenceNumber
      journalDate
      journalNotes
      contactId
      contactType
      journalTotalAmount
      createdAt
      updatedAt
      transactions {
        id
        journalId
        description
        debit
        credit
      }
    }
  }
`;

const UPDATE_JOURNAL = gql`
  mutation UpdateJournal($id: ID!, $input: NewJournal!) {
    updateJournal(id: $id, input: $input) {
      id
      businessId
      journalNumber
      referenceNumber
      journalDate
      journalNotes
      contactId
      contactType
      journalTotalAmount
      createdAt
      updatedAt
      transactions {
        id
        journalId
        description
        debit
        credit
      }
    }
  }
`;

const DELETE_JOURNAL = gql`
  mutation DeleteJournal($id: ID!) {
    deleteJournal(id: $id) {
      id
      businessId
      journalNumber
      referenceNumber
      journalDate
      journalNotes
      contactId
      contactType
      journalTotalAmount
      createdAt
      updatedAt
    }
  }
`;

const JournalMutations = {
  CREATE_JOURNAL,
  UPDATE_JOURNAL,
  DELETE_JOURNAL,
};

export default JournalMutations;
