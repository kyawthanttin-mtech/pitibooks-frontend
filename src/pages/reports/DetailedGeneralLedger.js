import React, { useMemo } from "react";
import {
  Spin,
  Flex,
  Empty,
  Row,
  Space,
  Dropdown,
  Form,
  Divider,
  DatePicker,
  Button,
} from "antd";
import {
  CalendarOutlined,
  DownOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { ReportQueries } from "../../graphql";
import { useQuery } from "@apollo/client";
import { openErrorNotification } from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import { usePeriodFilter } from "../../hooks/usePeriodFilter";
import { useNavigate } from "react-router-dom";
const { GET_DETAILED_GENERAL_LEDGER_REPORT } = ReportQueries;

const DetailedGeneralLedger = () => {
  const [notiApi] = useOutletContext();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_DETAILED_GENERAL_LEDGER_REPORT, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      fromDate: moment().startOf("month").toISOString(),
      toDate: moment().endOf("month").toISOString(),
      reportType: "bais",
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });
  const queryData = useMemo(() => data, [data]);

  !queryLoading && console.log(queryData);

  const {
    selectedPeriod,
    dropdownOpen,
    showDateRange,
    handlePeriodChange,
    handleDateRangeApply,
    setDropdownOpen,
    items,
  } = usePeriodFilter({ refetch, form, isPaginated: false });

  return (
    <div className="report">
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
                    style: { boxShadow: "none" },
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
          <h3 style={{ marginTop: "-5px" }}>Detailed General Ledger</h3>
          <span>Basic Accrual</span>
          <h5>From 01 Mar 2024 To 31 Mar 2024</h5>
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
              {queryData?.getDetailedGeneralLedgerReport?.length > 0 ? (
                queryData?.getDetailedGeneralLedgerReport?.map(
                  (data, index) => (
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
                            "DD MMM YYYY"
                          )}
                        </td>
                        <td>Opening Balance</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="text-align-right">
                          {data.openingBalance >= 0 && data.openingBalance}
                        </td>
                        <td className="text-align-right">
                          {data.openingBalance !== 0 &&
                            data.openingBalance < 0 &&
                            data.openingBalance}
                        </td>
                        <td className="text-align-right"></td>
                      </tr>
                      {data.transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td style={{ verticalAlign: "top" }}>
                            {moment(transaction?.transactionDateTime).format(
                              "DD MMM YYYY"
                            )}
                          </td>
                          <td>{transaction.accountName}</td>
                          <td>
                            <span className="preserve-wrap">
                              {transaction.supplierName}
                            </span>
                          </td>
                          <td>{transaction.transactionType}</td>
                          <td>{transaction.transactionNo}</td>
                          <td></td>
                          <td className="text-align-right">
                            <a href="/">
                              {transaction.debit !== 0 && transaction.debit}
                            </a>
                          </td>
                          <td className="text-align-right">
                            <a href="/">
                              {transaction.credit !== 0 && transaction.credit}
                            </a>
                          </td>
                          <td className="text-align-right">
                            <a href="/">
                              {transaction.debit === 0
                                ? `${transaction.credit} Cr`
                                : `${transaction.debit} Dr`}
                            </a>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ verticalAlign: "top" }}>
                          As On{" "}
                          {moment(data?.closingBalanceDate).format(
                            "DD MMM YYYY"
                          )}
                        </td>
                        <td>Closing Balance</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>

                        <td className="text-align-right">
                          {data.closingBalance >= 0 && data.closingBalance}
                        </td>
                        <td className="text-align-right">
                          {data.closingBalance !== 0 &&
                            data.closingBalance < 0 &&
                            data.closingBalance}
                        </td>
                        <td className="text-align-right"></td>
                      </tr>
                    </tbody>
                  )
                )
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
    </div>
  );
};

export default DetailedGeneralLedger;
