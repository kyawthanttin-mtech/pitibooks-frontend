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

const { GET_SALES_BY_SALES_PERSON_REPORT } = ReportQueries;

const SalesBySalesPerson = () => {
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
  } = useQuery(GET_SALES_BY_SALES_PERSON_REPORT, {
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
  const queryData = useMemo(() => data?.getSalesBySalesPersonReport, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return queryData?.reduce(
      (acc, sp) => {
        acc.InvoiceCount += sp.InvoiceCount || 0;
        acc.TotalInvoiceSales += sp.TotalInvoiceSales || 0;
        acc.TotalInvoiceSalesWithTax += sp.TotalInvoiceSalesWithTax || 0;
        acc.CreditNoteCount += sp.CreditNoteCount || 0;
        acc.TotalCreditNoteSales += sp.TotalCreditNoteSales || 0;
        acc.TotalCreditNoteSalesWithTax += sp.TotalCreditNoteSalesWithTax || 0;
        acc.TotalSales += sp.TotalSales || 0;
        acc.TotalSalesWithTax += sp.TotalSalesWithTax || 0;
        return acc;
      },
      {
        InvoiceCount: 0,
        TotalInvoiceSales: 0,
        TotalInvoiceSalesWithTax: 0,
        CreditNoteCount: 0,
        TotalCreditNoteSales: 0,
        TotalCreditNoteSalesWithTax: 0,
        TotalSales: 0,
        TotalSalesWithTax: 0,
      }
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
            <h3 style={{ marginTop: "-5px" }}>Sales By Sales Person</h3>
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
                      <FormattedMessage id="label.name" defaultMessage="Name" />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.invoiceCount"
                        defaultMessage="Invoice Count"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.invoiceSales"
                        defaultMessage="Invoice Sales"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.invoiceSalesWithTax"
                        defaultMessage="invoiceSalesWithTax"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.creditNoteCount"
                        defaultMessage="Credit Note Count"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.averagePrice"
                        defaultMessage="Credit Note Sales"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.creditNoteSalesWithTax"
                        defaultMessage="Credit Note Sales With Tax"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.totalSales"
                        defaultMessage="Total Sales"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.totalSalesWithTax"
                        defaultMessage="Total Sales With Tax"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queryData && queryData?.length > 0 ? (
                    queryData?.map((data, index) => {
                      return (
                        <tr key={index}>
                          {/* <td style={{ verticalAlign: "top" }}>
                        {moment(data?.date).format(REPORT_DATE_FORMAT)}
                      </td> */}
                          <td>{data.SalesPersonName}</td>

                          <td className="text-align-right">
                            {data.InvoiceCount}
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.TotalInvoiceSales}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.TotalInvoiceSalesWithTax}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.CreditNoteCount}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.TotalCreditNoteSales}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.TotalCreditNoteSalesWithTax}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
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
                          value={totals?.TotalInvoiceSales || 0}
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
                          value={totals?.TotalInvoiceSalesWithTax || 0}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </b>
                    </td>
                    <td className="text-align-right">
                      <b>
                        {" "}
                        <FormattedNumber
                          value={totals?.CreditNoteCount || 0}
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
                          value={totals?.TotalCreditNoteSales || 0}
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
                          value={totals?.TotalCreditNoteSalesWithTax || 0}
                          style="decimal"
                          minimumFractionDigits={
                            business.baseCurrency.decimalPlaces
                          }
                        />
                      </b>
                    </td>
                    <td className="text-align-right">
                      <b>
                        {" "}
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
                        {" "}
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

export default SalesBySalesPerson;
