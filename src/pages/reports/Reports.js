import React from "react";
import "./Reports.css";
import { Row, Col, Input, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ReactComponent as AccountantOutlined } from "../../assets/icons/AccountOutlinedVariant.svg";
import { ReactComponent as StarOutlined } from "../../assets/icons/StarOutlined.svg";
import { NavLink } from "react-router-dom";

const Reports = () => {
  return (
    <>
      <div className="page-header">
        <Flex dir="row" gap={"2rem"} align="center">
          <span className="page-header-text">Reports</span>
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
            <div className="rep-menu-list" style={{ border: "none" }}>
              <AccountantOutlined />
              <span style={{ fontSize: "1rem" }}>Accountant</span>
            </div>
            <div className="rep-menu-list">
              <StarOutlined />

              <NavLink
                to="/accountTransactions"
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                Account Transactions
              </NavLink>
            </div>
            <div className="rep-menu-list">
              <StarOutlined />
              <NavLink
                to="/accountTypeSummary"
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                Account Type Summary
              </NavLink>
            </div>
            <div className="rep-menu-list">
              <StarOutlined />
              <NavLink
                to="/generalLedger"
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                General Ledger
              </NavLink>
            </div>
            <div className="rep-menu-list">
              <StarOutlined />
              <NavLink
                to="/detailedGeneralLedger"
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                Detailed General Ledger
              </NavLink>
            </div>
            <div className="rep-menu-list">
              <StarOutlined />
              <NavLink
                to="/journalReport"
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                Journal Report
              </NavLink>
            </div>
            <div className="rep-menu-list">
              <StarOutlined />
              <NavLink
                to="/trialBalance"
                className={({ isActive, isPending }) =>
                  isPending ? "pending" : isActive ? "active" : ""
                }
              >
                Trial Balance
              </NavLink>
            </div>
          </Col>
          <Col lg={6} offset={2}></Col>
          <Col lg={6} offset={2}></Col>
        </Row>
        <Row>
          <Col lg={6}></Col>
          <Col lg={6} offset={2}></Col>
          <Col lg={6} offset={2}></Col>
        </Row>
        <Row>
          <Col lg={6}></Col>
          <Col lg={6} offset={2}></Col>
          <Col lg={6} offset={2}></Col>
        </Row>
      </div>
    </>
  );
};

export default Reports;
