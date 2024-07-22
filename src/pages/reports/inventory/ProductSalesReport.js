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

const { GET_PRODUCT_SALES_REPORT } = ReportQueries;

const ProductSalesReport = () => {
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
  } = useQuery(GET_PRODUCT_SALES_REPORT, {
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
  const queryData = useMemo(() => data?.getProductSalesReport, [data]);

  const totals = useMemo(() => {
    return queryData?.reduce(
      (acc, curr) => {
        acc.soldQty += curr.soldQty || 0;
        acc.totalAmount += curr.totalAmount || 0;
        acc.totalAmountWithTax += curr.totalAmountWithTax || 0;
        acc.totalCogs += curr.totalCogs || 0;
        return acc;
      },
      { soldQty: 0, totalAmount: 0, totalAmountWithTax: 0, totalCogs: 0 }
    );
  }, [queryData]);

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
            <h3 style={{ marginTop: "-5px" }}>Product Sales Report</h3>
            <span>Basis: {reportBasis}</span>
            <h5>
              From {filteredDate?.fromDate.format(REPORT_DATE_FORMAT)} To{" "}
              {filteredDate?.toDate.format(REPORT_DATE_FORMAT)}
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
                    <th className="text-align-left" style={{ width: "150px" }}>
                      <FormattedMessage id="label.sku" defaultMessage="SKU" />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.margin"
                        defaultMessage="Margin"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.quantitySold"
                        defaultMessage="Quantity Sold"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.salesPrice"
                        defaultMessage="Sales Price"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.salesWithTax"
                        defaultMessage="Sales With Tax"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.cost"
                        defaultMessage="Cost"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queryData?.length > 0 ? (
                    queryData?.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td>{data.productName}</td>
                          <td>{data.productSku}</td>
                          <td className="text-align-right">{data.margin}</td>
                          <td className="text-align-right">{data.soldQty}</td>
                          <td className="text-align-right">
                            <a href="/">
                              <FormattedNumber
                                value={data.totalAmount || 0}
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
                                value={data.totalAmountWithTax || 0}
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
                                value={data.totalCogs || 0}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="empty-row">
                      <td
                        colSpan={9}
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
                    <td>
                      <FormattedMessage
                        id="label.total"
                        defaultMessage="Total"
                      ></FormattedMessage>
                    </td>
                    <td></td>
                    <td></td>
                    <td className="text-align-right">
                      <b>
                        <FormattedNumber
                          value={totals?.soldQty || 0}
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
                          value={totals?.totalAmount || 0}
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
                          value={totals?.totalAmountWithTax || 0}
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
                          value={totals?.totalCogs || 0}
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
          <div style={{ paddingLeft: "1.5rem" }}>
            <FormattedMessage
              values={{ currency: business.baseCurrency.symbol }}
              id="label.displayedBaseCurrency"
              defaultMessage="**Amount is displayed in {currency}"
            />
          </div>
        </div>
      </div>
    </ReportLayout>
  );
};

export default ProductSalesReport;
