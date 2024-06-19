/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Empty } from "antd";
import { ReportQueries } from "../../../graphql";
import { useQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { openErrorNotification } from "../../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import moment from "moment";
import ReportHeader from "../../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";

const { GET_ACCOUNT_TYPE_SUMMARY_REPORT } = ReportQueries;

const AccountTypeSummary = () => {
  const { notiApi, business } = useOutletContext();
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_ACCOUNT_TYPE_SUMMARY_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      fromDate: fromDate,
      toDate: toDate,
      reportType: reportBasis,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });
  const queryData = useMemo(() => data, [data]);
  // console.log(
  //   "data",
  //   queryData?.getAccountTypeSummaryReport?.map((acc) => acc)
  // );

  return (
    <div className="report">
      <ReportHeader
        refetch={refetch}
        isPaginated={false}
        setFromDate={setFromDate}
        setToDate={setToDate}
        setReportBasis={setReportBasis}
      />
      <div className="report-header">
        <h4>{business.name}</h4>
        <h3 style={{ marginTop: "-5px" }}>Account Type Summary</h3>
        <span>Basis: {reportBasis}</span>
        <h5>
          From {fromDate.format(REPORT_DATE_FORMAT)} To{" "}
          {toDate.format(REPORT_DATE_FORMAT)}
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
                <th style={{ width: "400px", textAlign: "left" }}>
                  <span>
                    <FormattedMessage
                      id="report.accountType"
                      defaultMessage="Account Type"
                    />
                  </span>
                </th>
                <th className="text-align-right" style={{ width: "210px" }}>
                  <FormattedMessage id="report.debit" defaultMessage="Debit" />
                </th>
                <th className="text-align-right" style={{ width: "210px" }}>
                  <FormattedMessage
                    id="report.credit"
                    defaultMessage="Credit"
                  />
                </th>
              </tr>
            </thead>
            {queryData?.getAccountTypeSummaryReport?.length > 0 ? (
              queryData.getAccountTypeSummaryReport.map((accGroup) => (
                <tbody key={accGroup.accountMainType}>
                  <tr className="row-header">
                    <td colSpan="3">
                      <span>
                        <b>{accGroup.accountMainType}</b>
                      </span>
                    </td>
                  </tr>
                  {accGroup.accountSummaries.map((acc) => (
                    <tr key={acc.accountName}>
                      <td>{acc.accountName}</td>
                      <td className="text-align-right">
                        <a href="/">
                          <FormattedNumber
                            value={acc.debit}
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
                            value={acc.credit}
                            style="decimal"
                            minimumFractionDigits={
                              business.baseCurrency.decimalPlaces
                            }
                          />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))
            ) : (
              <tbody>
                <tr>
                  <td colSpan="3" style={{ border: "none" }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </td>
                </tr>
              </tbody>
            )}
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
  );
};

export default AccountTypeSummary;
