import React from "react";
import { useOutletContext } from "react-router-dom";
import { PaginatedJournalReport } from "../../../components";
import { ReportQueries } from "../../../graphql";

const { GET_PAGINATED_JOURNAL_REPORTS } = ReportQueries;

const JournalReport = () => {
  const { notiApi, business } = useOutletContext();

  const parseData = (data) => {
    let reports = [];
    data?.paginateJournalReport?.edges.forEach(({ node }) => {
      if (node != null) {
        reports.push({
          key: node?.id,
          id: node?.id,
          transactionDateTime: node?.transactionDateTime,
          transactionNumber: node?.transactionNumber,
          branch: node?.branch.name,
          customer: node?.customer.name,
          supplier: node?.supplier.name,
          referenceType: node?.referenceType,
          accountTransactions: node?.accountTransactions,
          baseDebit: node?.accountTransactions.map(
            (transaction) => transaction.baseDebit
          ),
          baseCredit: node?.accountTransactions.map(
            (transaction) => transaction.baseCredit
          ),
        });
      }
    });
    return reports ? reports : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateJournalReport) {
      pageInfo = {
        hasNextPage: data.paginateJournalReport.pageInfo.hasNextPage,
        endCursor: data.paginateJournalReport.pageInfo.endCursor,
      };
      // console.log("Page info", pageInfo);
    }
    return pageInfo;
  };

  const handleEdit = () => {};
  const handleDelete = () => {};

  return (
    <>
      <div className="report">
        {/* <div className="reconciliation-summary-table text-align-right">
          <Button type="link" icon={<PlusOutlined />}>
            Add Temporary Note
          </Button>
        </div> */}
        <PaginatedJournalReport
          // dataLoading={loading}
          business={business}
          api={notiApi}
          gqlQuery={GET_PAGINATED_JOURNAL_REPORTS}
          showSearch={false}
          // searchForm={searchJournalForm}
          // searchFormRef={searchJournalFormRef}
          // searchQqlQuery={GET_PAGINATED_JOURNAL_REPORTS}
          parseData={parseData}
          parsePageInfo={parsePageInfo}
          showAddNew={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // setSearchModalOpen={setSearchModalOpen}
          // modalOpen={searchModalOpen}
        />
      </div>
    </>
  );
};

export default JournalReport;
