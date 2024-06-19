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

const { GET_PROFIT_AND_LOSS_REPORT } = ReportQueries;

const ProfitAndLoss = () => {
  const {notiApi, business} = useOutletContext();
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_PROFIT_AND_LOSS_REPORT, {
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

  const operatingIncome =
    queryData?.getProfitAndLossReport[0]?.plAccountGroups.find(
      (group) => group.groupType === "Operating Income"
    );
  const costOfGoodsSold =
    queryData?.getProfitAndLossReport[0]?.plAccountGroups.find(
      (group) => group.groupType === "Cost Of Goods Sold"
    );
  const operatingExpense =
    queryData?.getProfitAndLossReport[0]?.plAccountGroups.find(
      (group) => group.groupType === "Operating Expense"
    );
  const noneOperatingIncome =
    queryData?.getProfitAndLossReport[0]?.plAccountGroups.find(
      (group) => group.groupType === "None Operating Income"
    );
  const noneOperatingExpense =
    queryData?.getProfitAndLossReport[0]?.plAccountGroups.find(
      (group) => group.groupType === "None Operating Expense"
    );

  return (
    <div className="report">
      <ReportHeader 
        refetch={refetch} isPaginated={false} 
        setFromDate={setFromDate}
        setToDate={setToDate}
        setReportBasis={setReportBasis}
      />
      <div className="rep-container">
        <div className="report-header">
          <h4>{business.name}</h4>
          <h3 style={{ marginTop: "-5px" }}>Profit and Loss</h3>
          <span>Basis: {reportBasis}</span>
          <h5>From {fromDate.format(REPORT_DATE_FORMAT)} To {toDate.format(REPORT_DATE_FORMAT)}</h5>
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
                  <span><FormattedMessage id="report.account" defaultMessage="Account" /></span>
                </th>
                <th></th>
                <th className="text-align-right" style={{ width: "176px" }}>
                  <FormattedMessage id="report.total" defaultMessage="Total" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="mute-hover">
                <td colSpan="2">
                  <b>Operating Income</b>
                </td>
              </tr>
              {operatingIncome?.accounts?.map((acc) => (
                <tr key={acc.accountName}>
                  <td style={{ paddingLeft: "4.5rem" }}>
                    <a href="/">{acc.accountName}</a>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    <a href="/">
                      <FormattedNumber value={acc.amount} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="mute-hover">
                <td>
                  <b>Total for Operating Income</b>
                </td>
                <td></td>
                <td className="text-align-right">
                  {operatingIncome?.total ? 
                    <FormattedNumber value={operatingIncome?.total} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                    : "0"}
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="2">
                  <b>Cost of Goods Sold</b>
                </td>
              </tr>
              {costOfGoodsSold?.accounts?.map((acc) => (
                <tr key={acc.accountName}>
                  <td style={{ paddingLeft: "4.5rem" }}>
                    <a href="/">{acc.accountName}</a>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    <a href="/">
                      <FormattedNumber value={acc.amount} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="mute-hover">
                <td>
                  <b>Total for Cost Of Goods Sold</b>
                </td>
                <td></td>
                <td className="text-align-right">0</td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td></td>
                <td>
                  <b><FormattedMessage id="report.grossProfit" defaultMessage="Gross Profit" /></b>
                </td>
                <td className="text-align-right">
                  <FormattedNumber value={queryData?.getProfitAndLossReport[0]?.grossProfit} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} /> 
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>

              <tr className="mute-hover">
                <td colSpan="2">
                  <b>Operating Expense</b>
                </td>
              </tr>
              {operatingExpense?.accounts?.map((acc) => (
                <tr key={acc.accountName}>
                  <td style={{ paddingLeft: "4.5rem" }}>
                    <a href="/">{acc.accountName}</a>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    <a href="/">
                      <FormattedNumber value={acc.amount} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="mute-hover">
                <td>
                  <b>Total for Operating Expense</b>
                </td>
                <td></td>
                <td className="text-align-right">
                  <FormattedNumber value={operatingExpense?.total || 0} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td></td>
                <td>
                  <b><FormattedMessage id="report.operatingProfit" defaultMessage="Operating Profit" /></b>
                </td>
                <td className="text-align-right">
                  <FormattedNumber value={queryData?.getProfitAndLossReport[0]?.operatingProfit} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>

              <tr className="mute-hover">
                <td colSpan="2">
                  <b>None Operating Income</b>
                </td>
              </tr>
              {noneOperatingIncome?.accounts?.map((acc) => (
                <tr key={acc.accountName}>
                  <td style={{ paddingLeft: "4.5rem" }}>
                    <a href="/">{acc.accountName}</a>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    <a href="/">
                      <FormattedNumber value={acc.amount} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="mute-hover">
                <td>
                  <b>Total for None Operating Income</b>
                </td>
                <td></td>
                <td className="text-align-right">
                  <FormattedNumber value={noneOperatingIncome || 0} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>

              <tr className="mute-hover">
                <td colSpan="2">
                  <b>None Operating Expense</b>
                </td>
              </tr>
              {noneOperatingExpense?.accounts?.map((acc) => (
                <tr key={acc.accountName}>
                  <td style={{ paddingLeft: "4.5rem" }}>
                    <a href="/">{acc.accountName}</a>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    <a href="/">
                    <FormattedNumber value={acc.amount} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="mute-hover">
                <td>
                  <b>Total for None Operating Expense</b>
                </td>
                <td></td>
                <td className="text-align-right">
                  <FormattedNumber value={noneOperatingExpense?.total || 0} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>

              <tr className="mute-hover">
                <td></td>
                <td>
                  <b><FormattedMessage id="report.netProfitLoss" defaultMessage="Net Profit/Loss" /></b>
                </td>
                <td className="text-align-right">
                  <FormattedNumber value={queryData?.getProfitAndLossReport[0]?.netProfit} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="3" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div style={{ paddingLeft: "1.5rem" }}>
        <FormattedMessage values={{"currency": business.baseCurrency.symbol}} id="label.displayedBaseCurrency" defaultMessage="**Amount is displayed in {currency}" />
      </div>
    </div>
  );
};

export default ProfitAndLoss;
