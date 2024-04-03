import { gql } from "@apollo/client";

const GET_PAGINATED_JOURNAL_REPORTS = gql`
  query GetJournalReport(
    $limit: Int = 10
    $after: String
    $fromDate: Time!
    $toDate: Time!
    $reportType: String! = "asdf"
    $branchId: Int
  ) {
    paginateJournalReport(
      limit: $limit
      after: $after
      fromDate: $fromDate
      toDate: $toDate
      reportType: $reportType
      branchId: $branchId
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
          transactionDateTime
          description
          customer {
            id
            name
          }
          supplier {
            id
            name
          }
          referenceId
          referenceType
          accountTransactions {
            id
          }
          accountTransactions {
            id
            baseDebit
            baseCredit
            account {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const JournalReportQueries = {
  GET_PAGINATED_JOURNAL_REPORTS,
};

export default JournalReportQueries;
