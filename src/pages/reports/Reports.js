import React from "react";
import "./Reports.css";
import { Row, Col, Input, Flex } from "antd";
import { SearchOutlined, DollarOutlined } from "@ant-design/icons";
import { ReactComponent as AccountantOutlined } from "../../assets/icons/AccountOutlinedVariant.svg";
import { ReactComponent as StarOutlined } from "../../assets/icons/StarOutlined.svg";
import { ReactComponent as BuildingOutlined } from "../../assets/icons/BuildingOutlined.svg";
import { ReactComponent as InventoryOutlined } from "../../assets/icons/InventoryOutlined.svg";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { FormattedMessage } from "react-intl";

const ReportMenuItem = ({ icon, label, to, isTitle }) => {
  const location = useLocation();

  return (
    <div className={`rep-menu-list ${isTitle ? "no-border" : ""}`}>
      {icon}
      {to ? (
        <NavLink
          to={to}
          state={{
            ...location.state,
            from: { pathname: location.pathname },
          }}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "active" : ""
          }
        >
          {label}
        </NavLink>
      ) : (
        <span style={{ fontSize: "1rem" }}>{label}</span>
      )}
    </div>
  );
};

const Reports = () => {
  return (
    <>
      <div className="page-header">
        <Flex dir="row" gap={"2rem"} align="center">
          <span className="page-header-text">
            <FormattedMessage id="menu.reports" defaultMessage="Reports" />
          </span>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search Report"
            style={{ width: "20rem" }}
          />
        </Flex>
      </div>
      <div className="page-content page-content-with-padding">
        <Row>
          <Col span={6}>
            <ReportMenuItem
              icon={<BuildingOutlined />}
              label="Business Overview"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Profit and Loss"
              to="profitAndLoss"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Cash Flow Statement"
              to="cashFlowReport"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Balance Sheet"
              to="balanceSheet"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Business Performance Ratio"
              to="accountTransactions"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Movement of Equity"
              to="movementOfEquity"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={<AccountantOutlined />}
              label="Accountant"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Account Transactions"
              to="accountTransactions"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Account Type Summary"
              to="accountTypeSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="General Ledger"
              to="generalLedger"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Detailed General Ledger"
              to="detailedGeneralLedger"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Journal Report"
              to="journalReport"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Trial Balance"
              to="trialBalance"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={
                <DollarOutlined
                  style={{ width: 20, height: 20, fontSize: "1.2rem" }}
                />
              }
              label="Sales"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Sales by Customer"
              to="salesByCustomer"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Sales by Product"
              to="salesByProduct"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Sales by Sales Person"
              to="salesBySalesPerson"
            />
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              label="Inventory"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Inventory Summary"
              to="inventorySummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Stock Summary Report"
              to="stockSummaryReport"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Inventory Valuation Summary"
              to="inventoryValuationSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              label="Product Sales Report"
              to="productSalesReport"
            />
          </Col>
          <Col span={6} offset={1}></Col>
          <Col span={6} offset={1}></Col>
        </Row>
      </div>
    </>
  );
};

export default Reports;
