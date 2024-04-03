import React from "react";
import { useOutletContext } from "react-router-dom";
import { PaginatedAccountTransactionReport } from "../../components";
import { ReportQueries } from "../../graphql";

const { GET_PAGINATED_ACCOUNT_TRANSACTION_REPORT } = ReportQueries;

const AccountTransactions = () => {
  const [notiApi] = useOutletContext();

  const parseData = (data) => {
    let reports = [];
    data?.paginateAccountTransactionReport?.edges.forEach(({ node }) => {
      if (node != null) {
        reports.push({
          key: node.id,
          date: node.transactionDateTime,
          account: node.account.name,
          baseDebit: node.baseDebit,
          baseCredit: node.baseCredit,
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
    if (data?.paginateAccountTransactionReport) {
      pageInfo = {
        hasNextPage: data.paginateAccountTransactionReport.pageInfo.hasNextPage,
        endCursor: data.paginateAccountTransactionReport.pageInfo.endCursor,
      };
      console.log("Page info", pageInfo);
    }
    return pageInfo;
  };

  const handleEdit = () => {};
  const handleDelete = () => {};

  return (
    <div className="report">
      <PaginatedAccountTransactionReport
        // dataLoading={loading}
        api={notiApi}
        gqlQuery={GET_PAGINATED_ACCOUNT_TRANSACTION_REPORT}
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
  );
};

export default AccountTransactions;
