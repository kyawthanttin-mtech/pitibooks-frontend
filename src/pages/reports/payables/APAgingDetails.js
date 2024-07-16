/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Empty, Divider } from "antd";
import { ReportQueries } from "../../../graphql";
import { useQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { openErrorNotification } from "../../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import moment from "moment";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { ReportFilterBar } from "../../../components";
import ReportLayout from "../ReportLayout";
import dayjs from "dayjs";

const { GET_AP_AGING_DETAIL_REPORT } = ReportQueries;

const APAgingDetails = () => {
  const { notiApi, business } = useOutletContext();
  const [filteredDate, setFilteredDate] = useState({
    toDate: moment().endOf("month").utc(true),
  });
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_AP_AGING_DETAIL_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      currentDate: moment().endOf("month").utc(true),
      branchId: business?.primaryBranch?.id,
      reportType: reportBasis,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });
  const queryData = useMemo(() => data?.getAPAgingDetailReport, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return queryData?.reduce(
      (acc, curr) => {
        acc.amount += curr.amount || 0;
        acc.balanceDue += curr.balanceDue || 0;
        return acc;
      },
      {
        amount: 0,
        balanceDue: 0,
      }
    );
  }, [queryData]);

  const getIntervalTitle = (interval) => {
    let title;
    switch (interval) {
      case "int46plus":
        title = "> 45 Days";
        break;
      case "int31to45":
        title = "31-45 Days";
        break;
      case "int16to30":
        title = "16-30 Days";
        break;
      case "int1to15":
        title = "1-15 Days";
        break;
      case "current":
        title = "Current";
        break;
      default:
        title = "";
    }
    return title;
  };

  const getStatusColor = (status) => {
    let color = "";

    if (status === "Paid") {
      color = "var(--dark-green)";
    } else if (status === "Confirmed") {
      color = "var(--blue)";
    } else if (status === "Overdue") {
      color = "var(--orange)";
    }

    return color;
  };

  return (
    <ReportLayout>
      <div className="report">
        <ReportFilterBar
          refetch={refetch}
          isPaginated={false}
          setFilteredDate={setFilteredDate}
          setReportBasis={setReportBasis}
          hasFromDate={false}
          loading={queryLoading}
        />
        <div className="rep-container">
          <div className="report-header">
            <h4>{business.name}</h4>
            <h3 style={{ marginTop: "-5px" }}>
              <FormattedMessage
                id="report.arAgingDetails"
                defaultMessage="AP Aging Details"
              />
            </h3>
            <span>Basis: {reportBasis}</span>
            <h5>As of {filteredDate?.toDate.format(REPORT_DATE_FORMAT)}</h5>
          </div>
          {queryLoading ? (
            <Flex justify="center" align="center" style={{ height: "40vh" }}>
              <Spin size="large" />
            </Flex>
          ) : (
            <div className="fill-container table-container">
              <table className="rep-table">
                <thead>
                  <tr>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      <FormattedMessage id="label.date" defaultMessage="Date" />
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.transactionNumber"
                        defaultMessage="Transaction #"
                      />
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      <FormattedMessage id="label.type" defaultMessage="Type" />
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.status"
                        defaultMessage="Status"
                      />
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.supplierName"
                        defaultMessage="Supplier Name"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage id="label.age" defaultMessage="Age" />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.amountFcy"
                        defaultMessage="Amount (FCY)"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.balanceDueFcy"
                        defaultMessage="Balance Due (FCY)"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.amount"
                        defaultMessage="Amount"
                      />
                    </th>

                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.balanceDue"
                        defaultMessage="Balance Due"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queryData?.length > 0 ? (
                    queryData?.map((data, index) => {
                      return (
                        <React.Fragment key={index}>
                          <tr className="row-header">
                            <td colSpan={8}>
                              <b>{getIntervalTitle(data.interval)}</b>
                            </td>
                            <td className="text-align-right">
                              <FormattedNumber
                                value={data.amount}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </td>
                            <td className="text-align-right">
                              <FormattedNumber
                                value={data.balanceDue}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </td>
                          </tr>
                          {data.details?.map((detail, index) => (
                            <tr key={index}>
                              <td>
                                {dayjs(detail.billDate).format(
                                  REPORT_DATE_FORMAT
                                )}
                              </td>
                              <td className="text-align-left">
                                {detail.billNumber}
                              </td>
                              <td className="text-align-left">Bill</td>
                              <td
                                className="text-align-left"
                                style={{
                                  color: getStatusColor(detail.billStatus),
                                }}
                              >
                                {detail.billStatus}
                              </td>
                              <td className="text-align-left">
                                {detail.supplierName}
                              </td>
                              <td className="text-align-right">
                                {detail.age} Day{detail.age > 1 && "s"}
                              </td>
                              <td className="text-align-right">
                                {detail.currencySymbol}{" "}
                                <FormattedNumber
                                  value={detail.totalAmountFcy}
                                  style="decimal"
                                  minimumFractionDigits={
                                    business.baseCurrency.decimalPlaces
                                  }
                                />
                              </td>
                              <td className="text-align-right">
                                {detail.currencySymbol}{" "}
                                <FormattedNumber
                                  value={detail.remainingBalanceFcy}
                                  style="decimal"
                                  minimumFractionDigits={
                                    business.baseCurrency.decimalPlaces
                                  }
                                />
                              </td>
                              <td className="text-align-right">
                                <FormattedNumber
                                  value={detail.totalAmount}
                                  style="decimal"
                                  minimumFractionDigits={
                                    business.baseCurrency.decimalPlaces
                                  }
                                />
                              </td>
                              <td className="text-align-right">
                                <FormattedNumber
                                  value={detail.remainingBalance}
                                  style="decimal"
                                  minimumFractionDigits={
                                    business.baseCurrency.decimalPlaces
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr className="empty-row">
                      <td
                        colSpan={10}
                        style={{
                          border: "none",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={8}>
                      <b>
                        <FormattedMessage
                          id="label.total"
                          defaultMessage="Total"
                        ></FormattedMessage>
                      </b>
                    </td>
                    <td className="text-align-right">
                      <b>
                        <FormattedNumber
                          value={totals?.amount || 0}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </b>
                    </td>
                    <td className="text-align-right">
                      <b>
                        <FormattedNumber
                          value={totals?.balanceDue || 0}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
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

export default APAgingDetails;
