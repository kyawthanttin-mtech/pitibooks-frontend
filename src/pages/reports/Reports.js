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

const ReportMenuItem = ({ icon, labelId, label, to, isTitle }) => {
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
          <FormattedMessage id={labelId} defaultMessage={label} />
        </NavLink>
      ) : (
        <span style={{ fontSize: "1rem" }}>
          <FormattedMessage id={labelId} defaultMessage={label} />
        </span>
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
        <Row className="menu-row">
          <Col span={6}>
            <ReportMenuItem
              icon={<BuildingOutlined />}
              labelId="report.businessOverview"
              label="Business Overview"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.profitAndLoss"
              label="Profit and Loss"
              to="profitAndLoss"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.cashFlowStatement"
              label="Cash Flow Statement"
              to="cashFlowReport"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.balanceSheet"
              label="Balance Sheet"
              to="balanceSheet"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.businessPerformanceRatio"
              label="Business Performance Ratio"
              to="businessPerformanceRatio"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.movementOfEquity"
              label="Movement of Equity"
              to="movementOfEquity"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={<AccountantOutlined />}
              labelId="report.accountant"
              label="Accountant"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.accountTransactions"
              label="Account Transactions"
              to="accountTransactions"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.accountTypeSummary"
              label="Account Type Summary"
              to="accountTypeSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.generalLedger"
              label="General Ledger"
              to="generalLedger"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.detailedGeneralLedger"
              label="Detailed General Ledger"
              to="detailedGeneralLedger"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.journalReport"
              label="Journal Report"
              to="journalReport"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.trialBalance"
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
              labelId="report.sales"
              label="Sales"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.salesByCustomer"
              label="Sales by Customer"
              to="salesByCustomer"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.salesByProduct"
              label="Sales by Product"
              to="salesByProduct"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.salesBySalesPerson"
              label="Sales by Sales Person"
              to="salesBySalesPerson"
            />
          </Col>
        </Row>
        <Row className="menu-row">
          <Col span={6}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              labelId="report.inventory"
              label="Inventory"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.inventorySummary"
              label="Inventory Summary"
              to="inventorySummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.stockSummaryReport"
              label="Stock Summary Report"
              to="stockSummaryReport"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.inventoryValuationSummary"
              label="Inventory Valuation Summary"
              to="inventoryValuationSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.productSalesReport"
              label="Product Sales Report"
              to="productSalesReport"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              labelId="report.payables"
              label="Payables"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.apAgingSummary"
              label="AP Aging Summary"
              to="apAgingSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.apAgingDetails"
              label="AP Aging Details"
              to="apAgingDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.billsDetails"
              label="Bills Details"
              to="billsDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.supplierBalance"
              label="Supplier Balance"
              to="supplierBalance"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.supplierBalanceSummary"
              label="Supplier Balance Summary"
              to="supplierBalanceSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.purchaseOrderDetails"
              label="Purchase Order Details"
              to="purchaseOrderDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.payableSummary"
              label="Payable Summary"
              to="payableSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.payableDetails"
              label="Payable Details"
              to="payableDetails"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              labelId="report.receivables"
              label="Receivables"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.arAgingSummary"
              label="AR Aging Summary"
              to="arAgingSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.arAgingDetails"
              label="AR Aging Details"
              to="arAgingDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.invoiceDetails"
              label="Invoice Details"
              to="invoiceDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.salesOrderDetails"
              label="Sales Order Details"
              to="salesOrderDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.customerBalances"
              label="Customer Balances"
              to="customerBalances"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.customerBalanceSummary"
              label="Customer Balance Summary"
              to="customerBalanceSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.receivableSummary"
              label="Receivable Summary"
              to="receivableSummary"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.receivableDetails"
              label="Receivable Details"
              to="receivableDetails"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.supplierBalanceDetails"
              label="Supplier Balance Details"
              to="supplierBalanceDetails"
            />
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              labelId="report.purchase"
              label="Purchase"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.purchaseBySupplier"
              label="Purchase By Supplier"
              to="purchaseBySupplier"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.purchaseByProduct"
              label="Purchase By Product"
              to="purchaseByProduct"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              labelId="report.paymentsReceived"
              label="Payments Received"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.paymentsReceived"
              label="Payments Received"
              to="paymentsReceived"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.refundHistory"
              label="Refund History"
              to="refundHistory"
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.creditNoteDetails"
              label="Credit Note Details"
              to="creditNoteDetails"
            />
          </Col>
          <Col span={6} offset={2}>
            <ReportMenuItem
              icon={<InventoryOutlined />}
              labelId="report.paymentsMade"
              label="Payments Made"
              isTitle={true}
            />
            <ReportMenuItem
              icon={<StarOutlined />}
              labelId="report.refundHistory"
              label="Refund History"
              to="refundHistory"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Reports;
