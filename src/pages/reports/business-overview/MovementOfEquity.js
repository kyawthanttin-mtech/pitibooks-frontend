/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Divider } from "antd";
import { useQuery } from "@apollo/client";
import { openErrorNotification } from "../../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import moment from "moment";
import { ReportQueries } from "../../../graphql";
import ReportHeader from "../../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";

const { GET_MOVEMENT_OF_EQUITY_REPORT } = ReportQueries;

const MovementOfEquity = () => {
  const { notiApi, business } = useOutletContext();
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_MOVEMENT_OF_EQUITY_REPORT, {
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

  // !queryLoading && console.log(queryData);

  return (
    <div className="report">
      <ReportHeader
        refetch={refetch}
        isPaginated={false}
        setFromDate={setFromDate}
        setToDate={setToDate}
        setReportBasis={setReportBasis}
      />
      <div className="rep-container">
        <div className="report-header">
          <h4>{business.name}</h4>
          <h3 style={{ marginTop: "-5px" }}>Movement Of Equity</h3>
          <span>Basis: {reportBasis}</span>
          <h5>
            From {fromDate.format(REPORT_DATE_FORMAT)} To{" "}
            {toDate.format(REPORT_DATE_FORMAT)}
          </h5>
        </div>
      </div>
      {queryLoading ? (
        <Flex justify="center" align="center" style={{ height: "40vh" }}>
          <Spin size="large" />
        </Flex>
      ) : (
        <div className="fill-container table-container">
          <table className="financial-comparison rep-table tb-comparison-table table-no-border ">
            <thead>
              <tr>
                <th className="text-align-left" style={{ width: "420px" }}>
                  <span>
                    <FormattedMessage
                      id="report.account"
                      defaultMessage="Account"
                    />
                  </span>
                </th>
                <th></th>
                <th className="text-align-right" style={{ width: "176px" }}>
                  <FormattedMessage id="report.total" defaultMessage="Total" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="mute-hover">
                <td>
                  <b>
                    <FormattedMessage
                      id="report.openingBalance"
                      defaultMessage="Opening Balance"
                    />
                  </b>
                </td>
                <td></td>
                <td className="text-align-right">
                  <FormattedNumber
                    value={
                      queryData?.getMovementOfEquityReport?.[0]
                        ?.openingBalance || 0
                    }
                    style="decimal"
                    minimumFractionDigits={business.baseCurrency.decimalPlaces}
                  />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="2">
                  <b>Changes in Equity</b>
                </td>
              </tr>
              {queryData?.getMovementOfEquityReport?.[0]?.accountGroups?.[0].accounts?.map(
                (acc) => (
                  <tr key={acc.accountName}>
                    <td style={{ paddingLeft: "4.5rem" }}>
                      <a href="/">{acc.accountName}</a>
                    </td>
                    <td></td>
                    <td className="text-align-right">
                      <a href="/">
                        <FormattedNumber
                          value={acc.amount}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </a>
                    </td>
                  </tr>
                )
              )}
              <tr className="mute-hover">
                <td>
                  <b>Net Changes in Equity</b>
                </td>
                <td></td>
                <td className="text-align-right">
                  {queryData?.getMovementOfEquityReport?.[0]?.accountGroups?.[0]
                    .total ? (
                    <FormattedNumber
                      value={
                        queryData?.getMovementOfEquityReport?.[0]
                          ?.accountGroups?.[0].total
                      }
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  ) : (
                    "0"
                  )}
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td>
                  <b>
                    <FormattedMessage
                      id="report.closingBalance"
                      defaultMessage="Closing Balance"
                    />
                  </b>
                </td>
                <td></td>
                <td className="text-align-right">
                  <FormattedNumber
                    value={
                      queryData?.getMovementOfEquityReport?.[0]
                        ?.closingBalance || 0
                    }
                    style="decimal"
                    minimumFractionDigits={business.baseCurrency.decimalPlaces}
                  />
                </td>
              </tr>
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
  );
};

export default MovementOfEquity;
