import React from "react";
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
import { useNavigate } from "react-router-dom";

const TrialBalance = () => {
  const navigate = useNavigate();

  return (
    <div className="report">
      <Row className="table-actions-header">
        <Space size="large">
          <div>
            <Dropdown
              trigger="click"
              //   open={dropdownOpen}
              //   onOpenChange={setDropdownOpen}
              //   menu={{
              //     items: items?.map((item) => ({
              //       ...item,
              //       onClick: ({ key }) => handlePeriodChange(key),
              //     })),
              //     selectable: true,
              //     selectedKeys: [selectedPeriod.key],
              //   }}
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

                  {/* {showDateRange && (
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
                  )} */}
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
                {/* {selectedPeriod.label} */}
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
          <h3 style={{ marginTop: "-5px" }}>Trial Balance</h3>
          <span>Basic Accrual</span>
          <h5>From 01 Mar 2024 To 31 Mar 2024</h5>
        </div>
        <div className="fill-container table-container">
          <table className="financial-comparison rep-table tb-comparison-table">
            <thead>
              <tr>
                <th className="text-align-left" style={{ width: "420px" }}>
                  <span>Account</span>
                </th>
                <th
                  className="text-align-left new-section"
                  style={{ width: "176px" }}
                >
                  Account Code
                </th>
                <th
                  className="text-align-right new-section"
                  style={{ width: "176px" }}
                >
                  Net Debit
                </th>
                <th className="text-align-right" style={{ width: "176px" }}>
                  Net Credit
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-header">
                <td colSpan={4}>Test</td>
              </tr>
              <tr>
                <td>Accounts Payable</td>
                <td className="new-section">7474</td>

                <td className="text-align-right new-section">
                  <a href="/">0</a>
                </td>
                <td className="text-align-right">
                  <a href="/">0</a>
                </td>
              </tr>
              <tr>
                <td>Accounts Payable</td>
                <td>7474</td>

                <td className="text-align-right">
                  <a href="/">0</a>
                </td>
                <td className="text-align-right">
                  <a href="/">0</a>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr className="row-header">
                <td colSpan={4}>Test</td>
              </tr>
              <tr>
                <td>Accounts Payable</td>
                <td className="new-section">7474</td>

                <td className="text-align-right new-section">
                  <a href="/">0</a>
                </td>
                <td className="text-align-right">
                  <a href="/">0</a>
                </td>
              </tr>
              <tr>
                <td>Accounts Payable</td>
                <td>7474</td>

                <td className="text-align-right">
                  <a href="/">0</a>
                </td>
                <td className="text-align-right">
                  <a href="/">0</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
