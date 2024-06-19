import React from "react";
import { ReportQueries } from "../../../graphql";
import { useOutletContext } from "react-router-dom";
import { PaginatedDetailedGeneralLedgerReport } from "../../../components";
const { GET_PAGINATED_DETAILED_GENERAL_LEDGER_REPORT } = ReportQueries;

const DetailedGeneralLedger = () => {
  const { notiApi, business } = useOutletContext();

  const parseData = (data) => {
    let reports = [];
    // console.log(data);
    data?.paginateDetailedGeneralLedgerReport?.edges.forEach(({ node }) => {
      if (node != null) {
        reports.push({
          key: node.accountId,
          ...node,
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
    if (data?.paginateDetailedGeneralLedgerReport) {
      pageInfo = {
        hasNextPage:
          data.paginateDetailedGeneralLedgerReport.pageInfo.hasNextPage,
        endCursor: data.paginateDetailedGeneralLedgerReport.pageInfo.endCursor,
      };
      // console.log("Page info", pageInfo);
    }
    return pageInfo;
  };

  return (
    <div className="report">
      <PaginatedDetailedGeneralLedgerReport
        business={business}
        api={notiApi}
        gqlQuery={GET_PAGINATED_DETAILED_GENERAL_LEDGER_REPORT}
        showSearch={false}
        parseData={parseData}
        parsePageInfo={parsePageInfo}
        showAddNew={false}
      />
    </div>
  );
};

export default DetailedGeneralLedger;
