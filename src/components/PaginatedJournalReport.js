import React, { useState, useEffect } from "react";
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  CalendarOutlined,
  DownOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Row,
  Space,
  Modal,
  Tooltip,
  Spin,
  Flex,
  Select,
  Empty,
  DatePicker,
  Dropdown,
  Divider,
  Form,
} from "antd";
import { useQuery, useLazyQuery } from "@apollo/client";
import { FormattedMessage } from "react-intl";
import { openErrorNotification } from "../utils/Notification";
import { paginateArray, useHistoryState } from "../utils/HelperFunctions";
import { QUERY_DATA_LIMIT } from "../config/Constants";
import moment from "moment";
import { usePeriodFilter } from "../hooks/usePeriodFilter";
import { useNavigate } from "react-router-dom";

const PaginatedJournalReport = ({
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
  const [form] = Form.useForm();
  const navigate = useNavigate();
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
      fromDate: moment().startOf("month").toISOString(),
      toDate: moment().endOf("month").toISOString(),
    },
    onError(err) {
      openErrorNotification(api, err.message);
    },
  });

  const {
    selectedPeriod,
    dropdownOpen,
    showDateRange,
    handlePeriodChange,
    handleDateRangeApply,
    setDropdownOpen,
    items,
  } = usePeriodFilter({ refetch, setCurrentPage, form, isPaginated: true });

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
            // fromDate: moment().startOf("month").toISOString(),
            // toDate: moment().endOf("month").toISOString(),
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

  const menuStyle = {
    boxShadow: "none",
  };

  return (
    <div>
      <div>
        <Row className="table-actions-header">
          <Space size="large">
            <div>
              <Dropdown
                trigger="click"
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
                menu={{
                  items: items.map((item) => ({
                    ...item,
                    onClick: ({ key }) => handlePeriodChange(key),
                  })),
                  selectable: true,
                  selectedKeys: [selectedPeriod.key],
                }}
                dropdownRender={(menu) => (
                  <div
                    style={{
                      minWidth: "11.686rem",
                      maxWidth: "21rem",
                      borderRadius: "8px",
                      boxShadow:
                        "0 6px 16px 0 rgba(0, 0, 0, 0.08),0 3px 6px -4px rgba(0, 0, 0, 0.12),0 9px 28px 8px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {React.cloneElement(menu, {
                      style: menuStyle,
                    })}

                    {showDateRange && (
                      <Form form={form}>
                        <Divider
                          style={{
                            margin: 0,
                          }}
                        />
                        <Space
                          style={{
                            padding: 8,
                          }}
                        >
                          <Form.Item name="dateRange" style={{ margin: 0 }}>
                            <DatePicker.RangePicker />
                          </Form.Item>
                          <Button type="primary" onClick={handleDateRangeApply}>
                            Apply
                          </Button>
                        </Space>
                      </Form>
                    )}
                  </div>
                )}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    height: "2.2rem",
                    alignItems: "center",
                    border: "1px solid var(--border-color)",
                    paddingInline: "1rem",
                    cursor: "pointer",
                    borderRadius: "0.3rem",
                  }}
                >
                  <CalendarOutlined />
                  {selectedPeriod.label}
                  <DownOutlined />
                </div>
              </Dropdown>
            </div>
          </Space>
          <div>
            <Button
              icon={<CloseOutlined />}
              type="text"
              onClick={() => {
                navigate("/reports");
              }}
            />
          </div>
        </Row>
        <div className="rep-container">
          <div className="report-header">
            <h4>Piti Baby</h4>
            <h3 style={{ marginTop: "-5px" }}>Journal Report</h3>
            <span>Basic Accrual</span>
            <h5>From 01 Mar 2024 To 31 Mar 2024</h5>
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
                              "DD MMM YYYY"
                            )}
                          </span>{" "}
                          - <span>{data.referenceType} </span>
                          <span>{data.id} </span>
                          <a href="#/">{data.supplier && data.supplier}</a>
                        </th>
                        <th>&nbsp;&nbsp;&nbsp;&nbsp;</th>
                        <th
                          className="text-align-right"
                          style={{ width: "210px" }}
                        >
                          DEBIT
                        </th>
                        <th
                          className="text-align-right"
                          style={{ width: "210px" }}
                        >
                          CREDIT
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
                              {transaction.baseDebit}
                            </td>
                            <td className="text-align-right">
                              {transaction.baseCredit}
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td></td>
                        <td></td>
                        <td className="text-align-right">
                          <a href="#/">{totalDebit}</a>
                        </td>
                        <td className="text-align-right">
                          <a href="#/">{totalCredit}</a>
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
                          "DD MMM YYYY"
                        )}
                      </span>{" "}
                      - <span>{data?.referenceType} </span>
                      <span>{data?.id} </span>
                      <a href="#/">{data?.supplier && data?.supplier}</a>
                    </th>
                    <th>&nbsp;&nbsp;&nbsp;&nbsp;</th>
                    <th className="text-align-right" style={{ width: "210px" }}>
                      DEBIT
                    </th>
                    <th className="text-align-right" style={{ width: "210px" }}>
                      CREDIT
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
      </div>
    </div>
  );
};

export default PaginatedJournalReport;
