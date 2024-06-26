/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Empty } from "antd";
import { ReportQueries } from "../../../graphql";
import { useQuery } from "@apollo/client";
import { openErrorNotification } from "../../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import moment from "moment";
import ReportHeader from "../../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { ReportFilterBar } from "../../../components";
import ReportLayout from "../ReportLayout";

const { GET_GENERAL_LEDGER_REPORT } = ReportQueries;

const GeneralLedger = () => {
  const { notiApi, business } = useOutletContext();
  const [filteredDate, setFilteredDate] = useState({
    fromDate: moment().startOf("month").utc(true),
    toDate: moment().endOf("month").utc(true),
  });
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_GENERAL_LEDGER_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      fromDate: moment().startOf("month").utc(true),
      toDate: moment().endOf("month").utc(true),
      branchId: business?.primaryBranch?.id,
      reportType: reportBasis,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });
  const queryData = useMemo(() => data, [data]);

  // !queryLoading && console.log(queryData);

  return (
    <ReportLayout>
      <div className="report">
        <ReportFilterBar
          refetch={refetch}
          isPaginated={false}
          setFilteredDate={setFilteredDate}
          setReportBasis={setReportBasis}
        />
        <div className="rep-container">
          <div className="report-header">
            <h4>{business.name}</h4>
            <h3 style={{ marginTop: "-5px" }}>General Ledger</h3>
            <span>Basis: {reportBasis}</span>
            <h5>
              From {filteredDate?.fromDate.format(REPORT_DATE_FORMAT)} To{" "}
              {filteredDate?.toDate.format(REPORT_DATE_FORMAT)}
            </h5>
          </div>
          {queryLoading ? (
            <Flex justify="center" align="center" style={{ height: "40vh" }}>
              <Spin size="large" />
            </Flex>
          ) : (
            <div className="fill-container table-container">
              <table className="financial-comparison rep-table">
                <thead>
                  <tr>
                    <th className="text-align-left">
                      <span>
                        <FormattedMessage
                          id="report.account"
                          defaultMessage="Account"
                        />
                      </span>
                    </th>
                    <th className="text-align-left">
                      <FormattedMessage
                        id="report.accountCode"
                        defaultMessage="Account Code"
                      />
                    </th>
                    <th className="text-align-right">
                      <FormattedMessage
                        id="report.debit"
                        defaultMessage="Debit"
                      />
                    </th>
                    <th className="text-align-right">
                      <FormattedMessage
                        id="report.credit"
                        defaultMessage="Credit"
                      />
                    </th>
                    <th className="text-align-right">
                      <FormattedMessage
                        id="report.balance"
                        defaultMessage="Balance"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queryData?.getGeneralLedgerReport?.length > 0 ? (
                    queryData?.getGeneralLedgerReport?.map((data) => (
                      <tr key={data.accountId}>
                        <td>{data.accountName}</td>
                        <td>{data.accountCode}</td>
                        <td className="text-align-right">
                          <a href="/">
                            <FormattedNumber
                              value={data.debit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </a>
                        </td>
                        <td className="text-align-right">
                          <a href="/">
                            <FormattedNumber
                              value={data.credit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </a>
                        </td>
                        <td className="text-align-right">
                          <a href="/">
                            <FormattedNumber
                              value={data.balance}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-row">
                      <td colSpan="5" style={{ border: "none" }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ paddingLeft: "1.5rem" }}>
            <FormattedMessage
              values={{ currency: business.baseCurrency.symbol }}
              id="label.displayedBaseCurrency"
              defaultMessage="**Amount is displayed in {currency}"
            />
          </div>
        </div>
      </div>
    </ReportLayout>
  );
};

export default GeneralLedger;
