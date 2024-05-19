/* eslint-disable react/style-prop-object */
import React, { useState } from "react";
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Row, Space, Modal, Tooltip, Spin, Flex, Empty } from "antd";
import { useQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { openErrorNotification } from "../utils/Notification";
import {
  convertTransactionType,
  paginateArray,
} from "../utils/HelperFunctions";
import {
  DETAILED_GENERAL_LEDGER_LIMIT,
  REPORT_DATE_FORMAT,
} from "../config/Constants";
import moment from "moment";
import ReportHeader from "./ReportHeader";

const PaginatedDetailedGeneralLedgerReport = ({
  business,
  api,
  gqlQuery,
  parseData,
  parsePageInfo,
  showSearch = false,
  searchForm,
  setSearchModalOpen,
  modalOpen,
}) => {
  const [currentPage, setCurrentPage] = useState("detailedGLCurrentPage", 1);
  const [fromDate, setFromDate] = useState(moment().startOf("month").utc(true));
  const [toDate, setToDate] = useState(moment().endOf("month").utc(true));
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    fetchMore,
    refetch,
  } = useQuery(gqlQuery, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: DETAILED_GENERAL_LEDGER_LIMIT,
      fromDate: fromDate,
      toDate: toDate,
      reportType: reportBasis,
    },
    onError(err) {
      openErrorNotification(api, err.message);
    },
  });

  const handleRefetch = async () => {
    try {
      await refetch();
      setCurrentPage(1);
    } catch (err) {
      openErrorNotification(api, err.message);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = async () => {
    if (currentPage === totalPages) {
      try {
        await fetchMore({
          variables: {
            limit: DETAILED_GENERAL_LEDGER_LIMIT,
            after: parsePageInfo(data).endCursor,
            fromDate: fromDate,
            toDate: toDate,
            reportType: reportBasis,
          },
        });
        setCurrentPage(currentPage + 1);
      } catch (err) {
        openErrorNotification(api, err.message);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  // !queryLoading && console.log(data);

  const allData = parseData(data);
  // console.log("all data", allData);
  const totalPages = Math.ceil(allData.length / DETAILED_GENERAL_LEDGER_LIMIT);
  let hasPreviousPage = currentPage > 1 ? true : false;
  let hasNextPage = false;
  let refetchEnabled = true;
  if (currentPage === totalPages) {
    const pageInfo = parsePageInfo(data);
    hasNextPage = pageInfo.hasNextPage;
  } else if (currentPage < totalPages) {
    hasNextPage = true;
  }

  const loading = queryLoading;

  const pageData = paginateArray(
    allData,
    DETAILED_GENERAL_LEDGER_LIMIT,
    currentPage
  );

  // console.log("page data", pageData);
  return (
    <div className="report">
      <ReportHeader
        refetch={refetch}
        isPaginated={true}
        setCurrentPage={setCurrentPage}
        setFromDate={setFromDate}
        setToDate={setToDate}
        setReportBasis={setReportBasis}
      />
      <div className="rep-container">
        <div className="report-header">
          <h4>{business.name}</h4>
          <h3 style={{ marginTop: "-5px" }}>Detailed General Ledger</h3>
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
            <table className="rep-table">
              <thead>
                <tr>
                  <th className="text-align-left" style={{ width: "150px" }}>
                    <FormattedMessage id="report.date" defaultMessage="Date" />
                  </th>
                  <th className="text-align-left" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.account"
                      defaultMessage="Account"
                    />
                  </th>
                  <th className="text-align-left" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.transactionDetails"
                      defaultMessage="Transaction Details"
                    />
                  </th>
                  <th className="text-align-left" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.transactionType"
                      defaultMessage="Transaction Type"
                    />
                  </th>
                  <th className="text-align-left" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.transactionNumber"
                      defaultMessage="Transaction #"
                    />
                  </th>
                  <th className="text-align-left" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.referenceNumber"
                      defaultMessage="Reference #"
                    />
                  </th>
                  <th className="text-align-right" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.debit"
                      defaultMessage="Debit"
                    />
                  </th>
                  <th className="text-align-right" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.credit"
                      defaultMessage="Credit"
                    />
                  </th>
                  <th className="text-align-right" style={{ width: "150px" }}>
                    <FormattedMessage
                      id="report.amount"
                      defaultMessage="Amount"
                    />
                  </th>
                </tr>
              </thead>
              {pageData?.length > 0 ? (
                pageData?.map((data, index) => (
                  <tbody key={index}>
                    <tr className="row-header">
                      <td colSpan="9">
                        <span>
                          <b>{data.accountName}</b>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ verticalAlign: "top" }}>
                        As On{" "}
                        {moment(data?.openingBalanceDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </td>
                      <td>Opening Balance</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="text-align-right">
                        {data.openingBalance >= 0 &&
                          data.currencySymbol + " " + data.openingBalance}
                      </td>
                      <td className="text-align-right">
                        {data.openingBalance !== 0 &&
                          data.openingBalance < 0 &&
                          data.currencySymbol + " " + data.openingBalance}
                      </td>
                      <td className="text-align-right"></td>
                    </tr>
                    {data.transactions.map((transaction, index) => (
                      <tr key={index}>
                        <td style={{ verticalAlign: "top" }}>
                          {moment
                            .utc(transaction?.transactionDateTime)
                            .format(REPORT_DATE_FORMAT)}
                        </td>
                        <td>{transaction.accountName}</td>
                        {/* <td>
                          <span className="preserve-wrap">
                            {transaction.supplierName}
                          </span>
                        </td> */}
                        <td>
                          {transaction.transactionDetails && (
                            <Tooltip title={transaction.transactionDetails}>
                              <FileTextOutlined />
                            </Tooltip>
                          )}
                        </td>
                        <td>
                          {convertTransactionType(transaction.transactionType)}
                        </td>
                        <td>{transaction.transactionNumber}</td>
                        <td>{transaction.referenceNumber}</td>
                        <td className="text-align-right">
                          <a href="/">
                            {transaction.debit !== 0 && (
                              <FormattedNumber
                                value={transaction.debit}
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
                            {transaction.credit !== 0 && (
                              <FormattedNumber
                                value={transaction.credit}
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
                            {transaction.debit === 0 ? (
                              <FormattedNumber
                                value={transaction.credit}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            ) : (
                              <FormattedNumber
                                value={transaction.debit}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            )}
                            {transaction.debit === 0 ? ` Cr` : ` Dr`}
                          </a>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ verticalAlign: "top" }}>
                        As On{" "}
                        {moment
                          .utc(data?.closingBalanceDate)
                          .format(REPORT_DATE_FORMAT)}
                      </td>
                      <td>Closing Balance</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>

                      <td className="text-align-right">
                        {data.closingBalance >= 0 &&
                          data.currencySymbol + " " + data.closingBalance}
                      </td>
                      <td className="text-align-right">
                        {data.closingBalance !== 0 &&
                          data.closingBalance < 0 &&
                          data.currencySymbol +
                            " " +
                            Math.abs(data.closingBalance)}
                      </td>
                      <td className="text-align-right"></td>
                    </tr>
                  </tbody>
                ))
              ) : (
                <tbody>
                  <tr className="empty-row">
                    <td colSpan="9" style={{ border: "none" }}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        )}
      </div>

      {showSearch && (
        <Modal
          className="search-journal-modal"
          width="65.5rem"
          title={
            <FormattedMessage
              id="journal.search"
              defaultMessage="Search Journal"
            />
          }
          okText={
            <FormattedMessage id="button.search" defaultMessage="Search" />
          }
          cancelText={
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          }
          open={modalOpen}
          // onOk={handleModalSearch}
          onCancel={() => setSearchModalOpen(false)}
          okButtonProps={loading}
        >
          {searchForm}
        </Modal>
      )}
      <Row style={{ justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ paddingLeft: "1.5rem" }}></div>
        <Space style={{ padding: "0.5rem 1.5rem 0 0" }}>
          <Tooltip
            title={
              <FormattedMessage id="button.refetch" defaultMessage="Refetch" />
            }
          >
            <Button
              icon={<SyncOutlined />}
              loading={loading}
              disabled={!refetchEnabled}
              onClick={handleRefetch}
            />
          </Tooltip>
          <Tooltip
            title={
              <FormattedMessage
                id="button.previous"
                defaultMessage="Previous"
              />
            }
          >
            <Button
              icon={<LeftOutlined />}
              loading={loading}
              disabled={!hasPreviousPage}
              onClick={handlePrevious}
            />
          </Tooltip>
          <Tooltip
            title={<FormattedMessage id="button.next" defaultMessage="Next" />}
          >
            <Button
              icon={<RightOutlined />}
              loading={loading}
              disabled={!hasNextPage}
              onClick={handleNext}
            />
          </Tooltip>
        </Space>
      </Row>
      <Row>
        <div style={{ paddingLeft: "1.5rem" }}>
          <FormattedMessage
            values={{ currency: business.baseCurrency.symbol }}
            id="label.displayedBaseCurrency"
            defaultMessage="**Amount is displayed in {currency}"
          />
        </div>
      </Row>
    </div>
  );
};

export default PaginatedDetailedGeneralLedgerReport;
