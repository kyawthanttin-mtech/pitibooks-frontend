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

const { GET_SALES_BY_PRODUCT_REPORT } = ReportQueries;

const SalesByProduct = () => {
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
  } = useQuery(GET_SALES_BY_PRODUCT_REPORT, {
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
  const queryData = useMemo(() => data?.getSalesByProductReport, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return queryData?.reduce(
      (acc, curr) => {
        acc.soldQty += curr.soldQty || 0;
        acc.totalAmount += curr.totalAmount || 0;
        acc.totalAmountWithDiscount += curr.totalAmountWithDiscount || 0;
        acc.averagePrice += curr.averagePrice || 0;
        return acc;
      },
      {
        soldQty: 0,
        totalAmount: 0,
        totalAmountWithDiscount: 0,
        averagePrice: 0,
      }
    );
  }, [queryData]);
  console.log(data);

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
            <h3 style={{ marginTop: "-5px" }}>Sales By Product</h3>
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
              <table className="rep-table">
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
                        id="label.quantitySold"
                        defaultMessage="Quantity Sold"
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
                        id="label.amountWithDiscount"
                        defaultMessage="Amount with discount"
                      />
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
                  {queryData?.length > 0 ? (
                    queryData?.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td>{data.productName}</td>
                          <td>{data.productSku}</td>
                          <td className="text-align-right">{data.soldQty}</td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.totalAmount}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.totalAmountWithDiscount}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.averagePrice}
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
                      <td
                        colSpan={6}
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
                      <b>
                        <FormattedMessage
                          id="label.total"
                          defaultMessage="Total"
                        ></FormattedMessage>
                      </b>
                    </td>
                    <td></td>
                    <td className="text-align-right">
                      <b>
                        <FormattedNumber
                          value={totals?.soldQty || 0}
                          style="decimal"
                          // minimumFractionDigits={
                          //   business.baseCurrency.decimalPlaces
                          // }
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
                          value={totals?.totalAmountWithDiscount || 0}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </b>
                    </td>
                    <td className="text-align-right">
                      {/* <b>
                    <FormattedNumber
                      value={totals?.averagePrice || 0}
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  </b> */}
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

export default SalesByProduct;
