import { gql } from "@apollo/client";

const CREATE_JOURNAL = gql`
  mutation CreateJournal($input: NewJournal!) {
    createJournal(input: $input) {
      id
      branch {
        id
        name
      }
      journalNumber
      referenceNumber
      journalDate
      journalNotes
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
      journalTotalAmount
      # documents{

      # }
      transactions {
        id
        journalId
        account {
          id
          name
        }
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
      branch {
        id
        name
      }
      journalNumber
      referenceNumber
      journalDate
      journalNotes
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
      journalTotalAmount
      documents
      transactions {
        id
        journalId
        account {
          id
          name
        }
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
      branch {
        id
        name
      }
      journalNumber
      referenceNumber
      journalDate
      journalNotes
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
      journalTotalAmount
      documents
      transactions {
        id
        journalId
        account {
          id
          name
        }
        description
        debit
        credit
      }
    }
  }
`;

const JournalMutations = {
  CREATE_JOURNAL,
  UPDATE_JOURNAL,
  DELETE_JOURNAL,
};

export default JournalMutations;
