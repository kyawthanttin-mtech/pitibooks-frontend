import React from "react";
import "./Reports.css";
import { Row, Col, Input, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ReactComponent as AccountantOutlined } from "../../assets/icons/AccountOutlinedVariant.svg";
import { ReactComponent as StarOutlined } from "../../assets/icons/StarOutlined.svg";
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
            <FormattedMessage id="menu.branches" defaultMessage="Branches" />
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
          <Col lg={6}>
            <ReportMenuItem
              icon={<AccountantOutlined />}
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
              to="accountTransactions"
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
              to="accountTransactions"
            />
          </Col>
          <Col lg={6} offset={2}>
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
          <Col lg={6} offset={2}></Col>
        </Row>
      </div>
    </>
  );
};

export default Reports;
