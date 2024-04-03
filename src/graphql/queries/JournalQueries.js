import { gql } from "@apollo/client";

const GET_PAGINATED_JOURNALS = gql`
  query PaginateJournal(
    $limit: Int = 10
    $after: String
    $journalNumber: String
    $fromDate: Time
    $toDate: Time
    $branchId: Int
    $referenceNumber: String
    $notes: String
  ) {
    paginateJournal(
      limit: $limit
      after: $after
      journalNumber: $journalNumber
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
      referenceNumber: $referenceNumber
      notes: $notes
    ) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          businessId
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
          contactId
          contactType
          journalTotalAmount
          createdAt
          updatedAt
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
    }
  }
`;

const JournalQueries = {
  GET_PAGINATED_JOURNALS,
};

export default JournalQueries;
