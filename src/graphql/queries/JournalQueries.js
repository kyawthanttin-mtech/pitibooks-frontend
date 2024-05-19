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
  ) {
    paginateJournal(
      limit: $limit
      after: $after
      journalNumber: $journalNumber
      fromDate: $fromDate
      toDate: $toDate
      branchId: $branchId
      referenceNumber: $referenceNumber
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
          exchangeRate
          supplier {
            id
            name
          }
          customer {
            id
            name
          }
          journalTotalAmount
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
          documents {
            id
            documentUrl
            referenceType
            referenceID
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
