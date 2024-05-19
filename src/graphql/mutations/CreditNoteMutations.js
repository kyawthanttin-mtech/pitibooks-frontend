import { gql } from "@apollo/client";

const CREATE_CREDIT_NOTE = gql`
  mutation CreateCreditNote($input: NewCreditNote!) {
    createCreditNote(input: $input) {
      id
      customer {
        id
        name
      }
      branch {
        id
        name
      }
      creditNoteNumber
      referenceNumber
      creditNoteDate
      creditNoteSubject
      notes
    }
  }
`;

const UPDATE_CREDIT_NOTE = gql`
  mutation UpdateCreditNote($input: NewCreditNote!, $id: ID!) {
    updateCreditNote(input: $input, id: $id) {
      id
      customer {
        id
        name
      }
      branch {
        id
        name
      }
      creditNoteNumber
      referenceNumber
      creditNoteDate
      creditNoteSubject
      notes
    }
  }
`;
const DELETE_CREDIT_NOTE = gql`
  mutation DeleteCreditNote($id: ID!) {
    deleteCreditNote(id: $id) {
      id
      customer {
        id
        name
      }
      branch {
        id
        name
      }
      creditNoteNumber
      referenceNumber
      creditNoteDate
      creditNoteSubject
      notes
    }
  }
`;

const CreditNoteMutations = {
  CREATE_CREDIT_NOTE,
  UPDATE_CREDIT_NOTE,
  DELETE_CREDIT_NOTE,
};

export default CreditNoteMutations;
