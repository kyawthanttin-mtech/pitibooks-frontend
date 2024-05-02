/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Divider } from "antd";
import { useQuery } from "@apollo/client";
import { openErrorNotification } from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import moment from "moment";
import { ReportQueries } from "../../graphql";
import ReportHeader from "../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { GET_BALANCE_SHEET_REPORT } = ReportQueries;

const BalanceSheet = () => {
  const {notiApi, business} = useOutletContext();
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");
  
  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_BALANCE_SHEET_REPORT, {
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

  const queryData = useMemo(() => data, [data]);

  // !queryLoading && console.log(queryData);

  return (
    <div className="report">
      <ReportHeader 
        refetch={refetch} isPaginated={false} hasFromDate={false} 
        setToDate={setToDate}
        setReportBasis={setReportBasis}
      />

      <div className="rep-container">
        <div className="report-header">
          <h4>{business.name}</h4>
          <h3 style={{ marginTop: "-5px" }}>Balance Sheet</h3>
          <span>Basis: {reportBasis}</span>
          <h5>As of {toDate.format(REPORT_DATE_FORMAT)}</h5>
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
                <th className="text-align-right" style={{ width: "176px" }}>
                  <FormattedMessage id="report.total" defaultMessage="Total" />
                </th>
              </tr>
            </thead>
            {queryData?.getBalanceSheetReport?.map((data) => (
              <tbody key={data.mainType}>
                <tr className="mute-hover">
                  <td colSpan="2">
                    <b>{data.mainType}</b>
                  </td>
                </tr>
                {data.accounts.map((groupAcc) => (
                  <React.Fragment key={groupAcc.groupType}>
                    <tr className="mute-hover">
                      <td colSpan="2" style={{ paddingLeft: "3.5rem" }}>
                        <b>{groupAcc.groupType}</b>
                      </td>
                    </tr>
                    {groupAcc.accounts.map((subAcc) => (
                      <React.Fragment key={subAcc.subType}>
                        <tr className="mute-hover">
                          <td colSpan="2" style={{ paddingLeft: "4.5rem" }}>
                            <b>{subAcc.subType}</b>
                          </td>
                        </tr>
                        {subAcc.accounts.map((acc) => (
                          <React.Fragment key={acc.accountName}>
                            <tr>
                              <td style={{ paddingLeft: "5.5rem" }}>
                                <a href="/">{acc.accountName}</a>
                              </td>
                              <td className="text-align-right">
                              <a href="/">
                                <FormattedNumber value={acc.amount} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                              </a>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                        <tr className="mute-hover">
                          <td style={{ paddingLeft: "4.5rem" }}>
                            <b>Total for {subAcc.subType}</b>
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber value={subAcc.total} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                          </td>
                        </tr>
                        <tr className="mute-hover">
                          <td colSpan="2" style={{ padding: 0 }}>
                            <Divider style={{ margin: 0 }} />
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                    <tr className="mute-hover">
                      <td style={{ paddingLeft: "3.5rem" }}>
                        <b>Total for {groupAcc.groupType}</b>
                      </td>
                      <td className="text-align-right">
                        <FormattedNumber value={groupAcc.total} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                      </td>
                    </tr>
                    <tr className="mute-hover">
                      <td colSpan="2" style={{ padding: 0 }}>
                        <Divider style={{ margin: 0 }} />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                <tr className="mute-hover">
                  <td>
                    <b>Total for {data.mainType}</b>
                  </td>
                  <td className="text-align-right">
                    <FormattedNumber value={data.total} style="decimal" minimumFractionDigits={business.baseCurrency.decimalPlaces} />
                  </td>
                </tr>
                <tr className="mute-hover">
                  <td colSpan="2" style={{ padding: 0 }}>
                    <Divider style={{ margin: 0 }} />
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      )}
      <div style={{ paddingLeft: "1.5rem" }}>
        <FormattedMessage values={{"currency": business.baseCurrency.symbol}} id="label.displayedBaseCurrency" defaultMessage="**Amount is displayed in {currency}" />
      </div>
    </div>
  );
};

export default BalanceSheet;
