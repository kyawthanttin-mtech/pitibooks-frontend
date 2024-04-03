import React from "react";
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

const PaginatedAccountTransactionReport = ({
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
      limit: 10,
      fromDate: moment().startOf("month"),
      toDate: moment().endOf("month"),
      reportType: "bais",
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

  !queryLoading && console.log(data);

  const allData = parseData(data);
  console.log("all data", allData);
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

  console.log("page data", pageData);
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
                  items: items?.map((item) => ({
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
            <h3 style={{ marginTop: "-5px" }}>Account Transactions</h3>
            <span>Basic Accrual</span>
            <h5>From 01 Mar 2024 To 31 Mar 2024</h5>
          </div>
          {loading ? (
            <Flex justify="center" align="center" style={{ height: "40vh" }}>
              <Spin size="large" />
            </Flex>
          ) : (
            <div className="fill-container" style={{ marginInline: "-20px" }}>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      Date
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      Account
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      Transaction Details
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      Transaction Type
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      Transaction#
                    </th>
                    <th className="text-align-left" style={{ width: "150px" }}>
                      Reference#
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      Debit
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      Credit
                    </th>
                    <th className="text-align-right" style={{ width: "150px" }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.length > 0 ? (
                    pageData.map((data) => {
                      return (
                        <tr key={data.key}>
                          <td style={{ verticalAlign: "top" }}>
                            {moment(data?.date).format("DD MMM YYYY")}
                          </td>
                          <td>{data.account}</td>
                          <td>
                            <span className="preserve-wrap">
                              Mg Mg (+9598383838)
                            </span>
                          </td>
                          <td>Invoice</td>
                          <td>INV-000004</td>
                          <td></td>
                          <td className="text-align-right">
                            <a href="/">
                              {data.baseDebit !== 0 && data.baseDebit}
                            </a>
                          </td>
                          <td className="text-align-right">
                            <a href="/">
                              {data.baseCredit !== 0 && data.baseCredit}
                            </a>
                          </td>
                          <td className="text-align-right">
                            <a href="/">
                              {data.baseDebit === 0
                                ? `${data.baseCredit} Cr`
                                : `${data.baseDebit} Dr`}
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

export default PaginatedAccountTransactionReport;
