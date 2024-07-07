/* eslint-disable react/style-prop-object */
import React, { useState } from "react";
import { LeftOutlined, RightOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Row, Space, Modal, Tooltip, Spin, Flex, Empty } from "antd";
import { useQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { openErrorNotification } from "../utils/Notification";
import {
  convertTransactionType,
  paginateArray,
  useHistoryState,
} from "../utils/HelperFunctions";
import { QUERY_DATA_LIMIT, REPORT_DATE_FORMAT } from "../config/Constants";
import moment from "moment";
import ReportHeader from "./ReportHeader";
import ReportFilterBar from "./ReportFilterBar";
import { ReportLayout } from "../pages/reports";

const PaginatedJournalReport = ({
  business,
  api,
  gqlQuery,
  parseData,
  parsePageInfo,
  showAddNew = false,
  showSearch = false,
  searchForm,
  searchFormRef,
  searchQqlQuery,
  onAddNew,
  onEdit,
  onDelete,
  setSearchModalOpen,
  modalOpen,
}) => {
  const [currentPage, setCurrentPage] = useHistoryState("currentPage", 1);
  const [filteredDate, setFilteredDate] = useState({
    fromDate: moment().startOf("month").utc(true),
    toDate: moment().endOf("month").utc(true),
  });
  const [filteredBranch, setFilteredBranch] = useState(
    business?.primaryBranch?.id
  );
  const [reportBasis, setReportBasis] = useState("Accrual");

  const {
    data,
    loading: queryLoading,
    fetchMore,
    refetch,
  } = useQuery(gqlQuery, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: QUERY_DATA_LIMIT,
      fromDate: moment().startOf("month").utc(true),
      toDate: moment().endOf("month").utc(true),
      branchId: business?.primaryBranch?.id,
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
            limit: QUERY_DATA_LIMIT,
            after: parsePageInfo(data).endCursor,
            fromDate: filteredDate.fromDate,
            toDate: filteredDate.toDate,
            reportType: reportBasis,
            branchId: filteredBranch,
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

  const allData = parseData(data);
  const totalPages = Math.ceil(allData.length / QUERY_DATA_LIMIT);
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

  const pageData = paginateArray(allData, QUERY_DATA_LIMIT, currentPage);

  return (
    <ReportLayout>
      <div className="report">
        <ReportFilterBar
          refetch={refetch}
          isPaginated={true}
          setCurrentPage={setCurrentPage}
          setFilteredDate={setFilteredDate}
          setReportBasis={setReportBasis}
          setFilteredBranch={setFilteredBranch}
        />

        <div className="rep-container">
          <div className="report-header">
            <h4>{business.name}</h4>
            <h3 style={{ marginTop: "-5px" }}>Journal Report</h3>
            <span>Basis: {reportBasis}</span>
            <h5>
              From {filteredDate?.fromDate.format(REPORT_DATE_FORMAT)} To{" "}
              {filteredDate?.toDate.format(REPORT_DATE_FORMAT)}
            </h5>
          </div>
          {loading ? (
            <Flex justify="center" align="center" style={{ height: "40vh" }}>
              <Spin size="large" />
            </Flex>
          ) : pageData.length > 0 ? (
            pageData.map((data) => {
              const totalDebit = data.baseDebit.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              );
              const totalCredit = data.baseCredit.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              );
              return (
                <div className="container" key={data.id}>
                  <table className="rep-table jr-table">
                    <thead>
                      <tr>
                        <th style={{ width: "400px", textAlign: "left" }}>
                          <span>
                            {moment(data.transactionDateTime).format(
                              REPORT_DATE_FORMAT
                            )}
                          </span>{" "}
                          -{" "}
                          <span>
                            {convertTransactionType(data.referenceType)}{" "}
                          </span>
                          <span>{data.transactionNumber} </span>
                          <a href="#/">{data.supplier && data.supplier}</a>
                        </th>
                        <th>&nbsp;&nbsp;&nbsp;&nbsp;</th>
                        <th
                          className="text-align-right"
                          style={{ width: "210px" }}
                        >
                          <FormattedMessage
                            id="report.debit"
                            defaultMessage="Debit"
                          />
                        </th>
                        <th
                          className="text-align-right"
                          style={{ width: "210px" }}
                        >
                          <FormattedMessage
                            id="report.credit"
                            defaultMessage="Credit"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.accountTransactions.map((transaction) => {
                        return (
                          <tr
                            style={{ border: "1px solid black" }}
                            key={transaction.id}
                          >
                            <td>{transaction.account.name}</td>
                            <td></td>
                            <td className="text-align-right">
                              <FormattedNumber
                                value={transaction.baseDebit}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </td>
                            <td className="text-align-right">
                              <FormattedNumber
                                value={transaction.baseCredit}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td></td>
                        <td></td>
                        <td className="text-align-right">
                          <a href="#/">
                            <FormattedNumber
                              value={totalDebit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </a>
                        </td>
                        <td className="text-align-right">
                          <a href="#/">
                            <FormattedNumber
                              value={totalCredit}
                              style="decimal"
                              minimumFractionDigits={
                                business.baseCurrency.decimalPlaces
                              }
                            />
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          ) : (
            <div className="container">
              <table className="rep-table jr-table">
                <thead>
                  <tr>
                    <th style={{ width: "400px", textAlign: "left" }}>
                      <span>
                        {moment(data?.transactionDateTime).format(
                          REPORT_DATE_FORMAT
                        )}
                      </span>{" "}
                      - <span>{data?.referenceType} </span>
                      <span>{data?.id} </span>
                      <a href="#/">{data?.supplier && data?.supplier}</a>
                    </th>
                    <th>&nbsp;&nbsp;&nbsp;&nbsp;</th>
                    <th className="text-align-right" style={{ width: "210px" }}>
                      <FormattedMessage
                        id="report.debit"
                        defaultMessage="Debit"
                      />
                    </th>
                    <th className="text-align-right" style={{ width: "210px" }}>
                      <FormattedMessage
                        id="report.credit"
                        defaultMessage="Credit"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="empty-row">
                    <td
                      colSpan="4"
                      style={{
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </td>
                  </tr>
                </tbody>
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
                <FormattedMessage
                  id="button.refetch"
                  defaultMessage="Refetch"
                />
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
              title={
                <FormattedMessage id="button.next" defaultMessage="Next" />
              }
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
    </ReportLayout>
  );
};

export default PaginatedJournalReport;
