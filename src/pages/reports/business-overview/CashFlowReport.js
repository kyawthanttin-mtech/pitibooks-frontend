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
import { ReportFilterBar } from "../../../components";
import ReportLayout from "../ReportLayout";
const { GET_CASH_FLOW_REPORT } = ReportQueries;

const CashFlowReport = () => {
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
  } = useQuery(GET_CASH_FLOW_REPORT, {
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
            <h3 style={{ marginTop: "-5px" }}>Cash Flow Statement</h3>
            <span>Basis: {reportBasis}</span>
            <h5>
              From {filteredDate?.fromDate.format(REPORT_DATE_FORMAT)} To{" "}
              {filteredDate?.toDate.format(REPORT_DATE_FORMAT)}
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
                    <FormattedMessage
                      id="report.total"
                      defaultMessage="Total"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="mute-hover">
                  <td>
                    <b>
                      <FormattedMessage
                        id="report.beginningCashBalance"
                        defaultMessage="Beginning Cash Balance"
                      />
                    </b>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    {}
                    <FormattedNumber
                      value={
                        queryData?.getCashFlowReport?.[0]?.beginCashBalance || 0
                      }
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  </td>
                </tr>
                <tr className="mute-hover">
                  <td colSpan="3" style={{ padding: 0 }}>
                    <Divider style={{ margin: 0 }} />
                  </td>
                </tr>
                <tr className="mute-hover">
                  <td colSpan="2">
                    <b>Cash Flow from Operating Activities</b>
                  </td>
                </tr>
                {queryData?.getCashFlowReport?.[0]?.cashAccountGroups?.[0]?.accounts?.map(
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
                    <b>Net cash provided by Operating Activities</b>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    {queryData?.getCashFlowReport?.[0]?.cashAccountGroups[0]
                      ?.total ? (
                      <FormattedNumber
                        value={
                          queryData?.getCashFlowReport[0]?.cashAccountGroups[0]
                            ?.total
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
                  <td colSpan="2">
                    <b>Cash Flow from Investing Activities</b>
                  </td>
                </tr>
                {queryData?.getCashFlowReport?.[0]?.cashAccountGroups[1]?.accounts?.map(
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
                    <b>Net cash provided by Investing Activities</b>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    {queryData?.getCashFlowReport?.[0]?.cashAccountGroups?.[1]
                      ?.total ? (
                      <FormattedNumber
                        value={
                          queryData?.getCashFlowReport?.[0]
                            ?.cashAccountGroups?.[1]?.total
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
                  <td colSpan="2">
                    <b>Cash Flow from Financing Activities</b>
                  </td>
                </tr>
                {queryData?.getCashFlowReport?.[0]?.cashAccountGroups?.[2]?.accounts?.map(
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
                    <b>Net cash provided by Financing Activities</b>
                  </td>
                  <td></td>
                  <td className="text-align-right">
                    {queryData?.getCashFlowReport?.[0]?.cashAccountGroups?.[2]
                      ?.total ? (
                      <FormattedNumber
                        value={
                          queryData?.getCashFlowReport?.[0]
                            ?.cashAccountGroups?.[2]?.total
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
                  <td></td>
                  <td>
                    <b>
                      <FormattedMessage
                        id="report.netChangeInCash"
                        defaultMessage="Net Change in cash"
                      />
                    </b>
                  </td>
                  <td className="text-align-right">
                    <FormattedNumber
                      value={queryData?.getCashFlowReport?.[0]?.netChange || 0}
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
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
                    <b>
                      <FormattedMessage
                        id="report.endingCashBalance"
                        defaultMessage="Ending Cash Balance"
                      />
                    </b>
                  </td>
                  <td className="text-align-right">
                    <FormattedNumber
                      value={
                        queryData?.getCashFlowReport?.[0]?.endCashBalance || 0
                      }
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
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
          <FormattedMessage
            values={{ currency: business.baseCurrency.symbol }}
            id="label.displayedBaseCurrency"
            defaultMessage="**Amount is displayed in {currency}"
          />
        </div>
      </div>
    </ReportLayout>
  );
};

export default CashFlowReport;
