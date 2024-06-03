/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Empty, Divider } from "antd";
import { ReportQueries } from "../../graphql";
import { useQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { openErrorNotification } from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import moment from "moment";
import ReportHeader from "../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { GET_ACCOUNT_TYPE_SUMMARY_REPORT } = ReportQueries;

const SalesByProduct = () => {
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

  const pageData = [];

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
        <h3 style={{ marginTop: "-5px" }}>Sales By Product</h3>
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
          <table className="rep-table ">
            <thead>
              <tr>
                <th className="text-align-left" style={{ width: "150px" }}>
                  <FormattedMessage
                    id="label.productName"
                    defaultMessage="productName"
                  />
                </th>
                <th style={{ width: "150px" }}>
                  <FormattedMessage id="label.sku" defaultMessage="SKU" />
                </th>
                <th className="text-align-right" style={{ width: "150px" }}>
                  <FormattedMessage
                    id="label.quantitySold"
                    defaultMessage="Quantity Sold"
                  />
                </th>
                <th className="text-align-right" style={{ width: "150px" }}>
                  <FormattedMessage id="label.amount" defaultMessage="Amount" />
                </th>
                <th className="text-align-right" style={{ width: "150px" }}>
                  <FormattedMessage
                    id="label.averagePrice"
                    defaultMessage="Average Price"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.length > 0 ? (
                pageData.map((data) => {
                  return (
                    <tr key={data.key}>
                      <td style={{ verticalAlign: "top" }}>
                        {moment(data?.date).format(REPORT_DATE_FORMAT)}
                      </td>
                      <td>{data.account}</td>
                      {/* <td>
                          <span className="preserve-wrap"></span>
                        </td> */}
                      <td>
                        {/* {data.transactionDetails && (
                            <Tooltip title={data.transactionDetails}>
                              <FileTextOutlined />
                            </Tooltip>
                          )} */}
                      </td>
                      <td>{data.referenceType}</td>
                      <td>{data.transactionNumber}</td>
                      <td>{data.referenceNumber}</td>
                      <td className="text-align-right">
                        <a href="/">
                          {data.baseDebit !== 0 && (
                            <FormattedNumber
                              value={data.baseDebit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          )}
                        </a>
                      </td>
                      <td className="text-align-right">
                        <a href="/">
                          {data.baseCredit !== 0 && (
                            <FormattedNumber
                              value={data.baseCredit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          )}
                        </a>
                      </td>
                      <td className="text-align-right">
                        <a href="/">
                          {data.baseDebit === 0 ? (
                            <FormattedNumber
                              value={data.baseCredit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          ) : (
                            <FormattedNumber
                              value={data.baseDebit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          )}
                          {data.baseDebit === 0 ? " Cr" : " Dr"}
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="empty-row">
                  <td colSpan={9} style={{ border: "none" }}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </td>
                </tr>
              )}
              <tr className="mute-hover">
                <td colSpan="5" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
              <tr>
                <td>
                  <FormattedMessage
                    id="label.total"
                    defaultMessage="Total"
                  ></FormattedMessage>
                </td>
                <td></td>
                <td className="text-align-right">0</td>
                <td className="text-align-right">0</td>
                <td className="text-align-right"></td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="5" style={{ padding: 0 }}>
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
  );
};

export default SalesByProduct;
