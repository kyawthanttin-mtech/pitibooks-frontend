/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex } from "antd";
import { useQuery } from "@apollo/client";
import { openErrorNotification } from "../../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import moment from "moment";
import { ReportQueries } from "../../../graphql";
import ReportHeader from "../../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";

const { GET_TRIAL_BALANCE_REPORT } = ReportQueries;

const TrialBalance = () => {
  const { notiApi, business } = useOutletContext();
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_TRIAL_BALANCE_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      toDate: toDate,
      reportType: reportBasis,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const parsedData = useMemo(() => {
    if (!data || !data.getTrialBalanceReport) return [];

    const groupedData = data.getTrialBalanceReport.reduce((acc, item) => {
      const { accountMainType } = item;
      const existingGroup = acc.find(
        (group) => group.mainType === accountMainType
      );
      if (existingGroup) {
        existingGroup.accounts.push(item);
      } else {
        acc.push({ mainType: accountMainType, accounts: [item] });
      }
      return acc;
    }, []);

    return groupedData;
  }, [data]);

  // !queryLoading && console.log(parsedData);

  return (
    <div className="report">
      <ReportHeader
        refetch={refetch}
        isPaginated={false}
        hasFromDate={false}
        setToDate={setToDate}
        setReportBasis={setReportBasis}
      />

      <div className="rep-container">
        <div className="report-header">
          <h4>{business.name}</h4>
          <h3 style={{ marginTop: "-5px" }}>Trial Balance</h3>
          <span>Basis: {reportBasis}</span>
          <h5>As of {toDate.format(REPORT_DATE_FORMAT)}</h5>
        </div>
        {queryLoading ? (
          <Flex justify="center" align="center" style={{ height: "40vh" }}>
            <Spin size="large" />
          </Flex>
        ) : (
          <div className="fill-container table-container">
            <table className="financial-comparison rep-table tb-comparison-table">
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
                  <th
                    className="text-align-left new-section"
                    style={{ width: "176px" }}
                  >
                    <FormattedMessage
                      id="report.accountCode"
                      defaultMessage="Account Code"
                    />
                  </th>
                  <th
                    className="text-align-right new-section"
                    style={{ width: "176px" }}
                  >
                    <FormattedMessage
                      id="report.netDebit"
                      defaultMessage="Net Debit"
                    />
                  </th>
                  <th className="text-align-right" style={{ width: "176px" }}>
                    <FormattedMessage
                      id="report.netCredit"
                      defaultMessage="Net Credit"
                    />
                  </th>
                </tr>
              </thead>
              {parsedData.map((data) => (
                <tbody key={data.mainType}>
                  <tr className="row-header">
                    <td colSpan={4}>
                      <b>{data.mainType}</b>
                    </td>
                  </tr>
                  {data.accounts.map((acc) => (
                    <tr key={acc.accountName}>
                      <td>{acc.accountName}</td>
                      <td>{acc.accountCode}</td>
                      {/* <td className="new-section">7474</td> */}
                      <td className="text-align-right new-section">
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
              ))}
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
  );
};

export default TrialBalance;
