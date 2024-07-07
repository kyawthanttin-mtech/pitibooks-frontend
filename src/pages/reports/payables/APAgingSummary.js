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

const { GET_AP_AGING_SUMMARY_REPORT } = ReportQueries;

const ARAgingSummary = () => {
  const { notiApi, business } = useOutletContext();
  const [filteredDate, setFilteredDate] = useState({
    toDate: moment().endOf("month").utc(true),
  });
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_AP_AGING_SUMMARY_REPORT, {
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
  const queryData = useMemo(() => data?.getAPAgingSummaryReport, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return queryData?.reduce(
      (acc, curr) => {
        acc.current += curr.current || 0;
        acc.int1to15 += curr.int1to15 || 0;
        acc.int16to30 += curr.int16to30 || 0;
        acc.int31to45 += curr.int31to45 || 0;
        acc.int46plus += curr.int46plus || 0;
        acc.total += curr.total || 0;
        return acc;
      },
      {
        current: 0,
        int1to15: 0,
        int16to30: 0,
        int31to45: 0,
        int46plus: 0,
        total: 0,
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
          hasFromDate={false}
          loading={queryLoading}
        />
        <div className="rep-container">
          <div className="report-header">
            <h4>{business.name}</h4>
            <h3 style={{ marginTop: "-5px" }}>
              <FormattedMessage
                id="report.apAgingSummary"
                defaultMessage="AP Aging Summary"
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
                      <FormattedMessage
                        id="label.supplierName"
                        defaultMessage="Supplier Name"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.totalFcy"
                        defaultMessage="Total (FCY)"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.current"
                        defaultMessage="Current"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      1-15 Days
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      16-30 Days
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      31-45 Days
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      &gt; 45 Days
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      <FormattedMessage
                        id="label.total"
                        defaultMessage="Total"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {queryData?.length > 0 ? (
                    queryData?.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td>{data.supplierName}</td>
                          <td className="text-align-right">
                            {data.currencySymbol}{" "}
                            <FormattedNumber
                              value={data.totalFcy}
                              style="decimal"
                              //   minimumFractionDigits={
                              //     business.baseCurrency.decimalPlaces
                              //   }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.current}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.int1to15}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.int16to30}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.int31to45}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.int46plus}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </td>
                          <td className="text-align-right">
                            <FormattedNumber
                              value={data.total}
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
                        colSpan={8}
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
                          value={totals?.current || 0}
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
                          value={totals?.int1to15 || 0}
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
                          value={totals?.int16to30 || 0}
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
                          value={totals?.int31to45 || 0}
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
                          value={totals?.int46plus || 0}
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
                          value={totals?.total || 0}
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

export default ARAgingSummary;
