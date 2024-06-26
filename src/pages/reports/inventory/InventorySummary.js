/* eslint-disable react/style-prop-object */
import React, { useMemo, useState } from "react";
import { Spin, Flex, Empty, Divider } from "antd";
import { ReportQueries } from "../../../graphql";
import { useQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { openErrorNotification } from "../../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import moment from "moment";
import ReportHeader from "../../../components/ReportHeader";
import { REPORT_DATE_FORMAT } from "../../../config/Constants";
import { ReportFilterBar } from "../../../components";
import ReportLayout from "../ReportLayout";

const { GET_INVENTORY_SUMMARY_REPORT } = ReportQueries;

const InventorySummary = () => {
  const { notiApi, business } = useOutletContext();
  const [filteredDate, setFilteredDate] = useState({
    toDate: moment().endOf("month").utc(true),
  });

  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_INVENTORY_SUMMARY_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      toDate: moment().endOf("month").utc(true),
      branchId: business?.primaryBranch?.id,
      reportType: reportBasis,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });
  const queryData = useMemo(() => data?.getInventorySummaryReport, [data]);

  !queryLoading && console.log(queryData);

  // Calculate totals
  const totals = useMemo(() => {
    return queryData?.getSalesByCustomerReport?.reduce(
      (acc, curr) => {
        acc.InvoiceCount += curr.InvoiceCount || 0;
        acc.TotalSales += curr.TotalSales || 0;
        acc.TotalSalesWithTax += curr.TotalSalesWithTax || 0;
        return acc;
      },
      { InvoiceCount: 0, TotalSales: 0, TotalSalesWithTax: 0 }
    );
  }, [queryData?.getSalesByCustomerReport]);

  return (
    <ReportLayout>
      <div className="report">
        <ReportFilterBar
          refetch={refetch}
          isPaginated={false}
          hasFromDate={false}
          setFilteredDate={setFilteredDate}
          setReportBasis={setReportBasis}
        />
        <div className="rep-container">
          <div className="report-header">
            <h4>{business.name}</h4>
            <h3 style={{ marginTop: "-5px" }}>Inventory Summary</h3>
            <span>Basis: {reportBasis}</span>
            <h5>As of {filteredDate?.toDate.format(REPORT_DATE_FORMAT)}</h5>
          </div>
          {queryLoading ? (
            <Flex justify="center" align="center" style={{ height: "40vh" }}>
              <Spin size="large" />
            </Flex>
          ) : (
            <div className="fill-container table-container">
              <table className="rep-table inventory-sum-table">
                <thead>
                  <tr>
                    <th style={{ borderBottom: 0 }}></th>
                    <th style={{ borderBottom: 0 }}></th>
                    <th style={{ borderBottom: 0 }}></th>
                    <th style={{ borderBottom: 0 }}></th>
                    <th style={{ borderBottom: 0 }}></th>
                    <th colSpan={3}>Stock Details</th>
                  </tr>
                  <tr>
                    <th
                      className="text-align-left"
                      style={{
                        minWidth: "230px",
                        width: "230px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.productName"
                        defaultMessage="Product Name"
                      />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage id="label.sku" defaultMessage="SKU" />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.quantityOrdered"
                        defaultMessage="Quantity Ordered"
                      />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.quantityIn"
                        defaultMessage="Quantity In"
                      />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.quantityOut"
                        defaultMessage="Quantity Out"
                      />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.stockOnHand"
                        defaultMessage="Stock On Hand"
                      />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.committedStock"
                        defaultMessage="Committed Stock"
                      />
                    </th>
                    <th
                      className="text-align-right"
                      style={{
                        width: "150px",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <FormattedMessage
                        id="label.availableStock"
                        defaultMessage="Available Stock"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queryData?.length > 0 ? (
                    queryData?.map((data, index) => {
                      return (
                        <tr key={index}>
                          {/* <td style={{ verticalAlign: "top" }}>
                        {moment(data?.date).format(REPORT_DATE_FORMAT)}
                      </td> */}
                          <td>
                            <div>{data.productName}</div>
                            {data.productUnit && (
                              <span
                                style={{
                                  fontSize: "var(--small-text)",
                                  opacity: "70%",
                                }}
                              >
                                {data.productUnit.abbreviation}
                              </span>
                            )}
                          </td>
                          <td className="text-align-right">
                            {data.productSku}
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.orderQty}
                              style="decimal"
                              minimumFractionDigits={
                                data.productUnit?.precision
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.receivedQty}
                              style="decimal"
                              minimumFractionDigits={
                                data.productUnit?.precision
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.saleQty}
                              style="decimal"
                              minimumFractionDigits={
                                data.productUnit?.precision
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.currentQty}
                              style="decimal"
                              minimumFractionDigits={
                                data.productUnit?.precision
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.committedQty}
                              style="decimal"
                              minimumFractionDigits={
                                data.productUnit?.precision
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.availableStock}
                              style="decimal"
                              minimumFractionDigits={
                                data.productUnit?.precision
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
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ paddingLeft: "1.5rem" }}>
          {/* <FormattedMessage
          values={{ currency: business.baseCurrency.symbol }}
          id="label.displayedBaseCurrency"
          defaultMessage="**Amount is displayed in {currency}"
        /> */}
        </div>
      </div>
    </ReportLayout>
  );
};

export default InventorySummary;
