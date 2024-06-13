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

const { GET_SALES_BY_CUSTOMER_REPORT } = ReportQueries;

const SalesByCustomer = () => {
  const { notiApi, business } = useOutletContext();
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_SALES_BY_CUSTOMER_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      fromDate: fromDate,
      toDate: toDate,
      reportType: reportBasis,
      branchId: 1,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });
  const queryData = useMemo(() => data?.getSalesByCustomerReport, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return queryData?.reduce(
      (acc, curr) => {
        acc.InvoiceCount += curr.InvoiceCount || 0;
        acc.TotalSales += curr.TotalSales || 0;
        acc.TotalSalesWithTax += curr.TotalSalesWithTax || 0;
        return acc;
      },
      { InvoiceCount: 0, TotalSales: 0, TotalSalesWithTax: 0 }
    );
  }, [queryData]);
  console.log(data);

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
        <h3 style={{ marginTop: "-5px" }}>Sales By Customer</h3>
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
                  <FormattedMessage id="label.name" defaultMessage="Name" />
                </th>
                <th className="text-align-right" style={{ width: "150px" }}>
                  <FormattedMessage
                    id="label.invoiceCount"
                    defaultMessage="Invoice Count"
                  />
                </th>
                <th className="text-align-right" style={{ width: "150px" }}>
                  <FormattedMessage id="label.sales" defaultMessage="Sales" />
                </th>
                <th className="text-align-right" style={{ width: "150px" }}>
                  <FormattedMessage
                    id="label.salesWithTax"
                    defaultMessage="Sales With Tax"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {queryData?.length > 0 ? (
                queryData?.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td>{data.CustomerName}</td>

                      <td className="text-align-right">{data.InvoiceCount}</td>
                      <td className="text-align-right">
                        <FormattedNumber
                          value={data.TotalSales}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </td>
                      <td className="text-align-right">
                        <FormattedNumber
                          value={data.TotalSalesWithTax}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
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
                <td colSpan="4" style={{ padding: 0 }}>
                  <Divider style={{ margin: 0 }} />
                </td>
              </tr>
              <tr>
                <td>
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
                      value={totals?.InvoiceCount || 0}
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
                      value={totals?.TotalSales || 0}
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
                      value={totals?.TotalSalesWithTax || 0}
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  </b>
                </td>
              </tr>
              <tr className="mute-hover">
                <td colSpan="4" style={{ padding: 0 }}>
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

export default SalesByCustomer;
