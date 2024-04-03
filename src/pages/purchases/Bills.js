import React from "react";
import { Button, Space, Row, Col, Card, Statistic, Table } from "antd";
import { PlusOutlined, MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { ReactComponent as ArrowEllipseFilled } from "../../assets/icons/ArrowEllipseFilled.svg";

const columns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Branch",
    dataIndex: "branch",
    key: "branch",
  },
  {
    title: "Bill#",
    dataIndex: "bill",
    key: "bill",
  },
  {
    title: "Reference Number",
    dataIndex: "referenceNumber",
    key: "referenceNumber",
  },
  {
    title: "Vendor",
    dataIndex: "vendor",
    key: "vendor",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Balance Due",
    dataIndex: "balanceDue",
    key: "balanceDue",
  },
  {
    title: (
      <SearchOutlined
        className="table-header-search-icon"
        // onClick={() => setPOSearchModalOpen(true)}
      />
    ),
    dataIndex: "search",
    key: "search",
  },
];

const Bills = () => {
  return (
    <>
      <div className="page-header">
        <p className="page-header-text">All Bills</p>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            // onClick={() => navigate("/transferOrders/new")}
          >
            New
          </Button>
          <Button icon={<MoreOutlined />}></Button>
        </Space>
      </div>
      <div className="page-content ">
        <Row gutter={16} style={{ padding: "1.5rem 1rem", margin: 0 }}>
          <Col span={6}>
            <Card
              style={{
                background: "rgba(89, 166, 53, 0.10)",
                height: "6.5rem",
              }}
            >
              <ArrowEllipseFilled />
              <Statistic
                title="Total Outstanding Payables"
                value={7954655}
                precision={2}
                // valueStyle={{
                //   color: "#3f8600",
                // }}
                prefix="MMK"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                background: "rgba(255, 176, 1, 0.10)",
                height: "6.5rem",
              }}
            >
              <Statistic
                title="Due Today"
                value={0}
                precision={2}
                // valueStyle={{
                //   color: "#cf1322",
                // }}
                prefix="MMK"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                background: "rgba(64, 141, 251, 0.10)",
                height: "6.5rem",
              }}
            >
              <Statistic
                title="Due Within 30 Days"
                value={0}
                precision={2}
                // valueStyle={{
                //   color: "#cf1322",
                // }}
                prefix="MMK"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                background: "rgba(247, 104, 49, 0.10)",
                height: "6.5rem",
              }}
            >
              <Statistic
                title="OverDue Bills"
                value={7954655}
                precision={2}
                // valueStyle={{
                //   color: "#cf1322",
                // }}
                prefix="MMK"
              />
            </Card>
          </Col>
        </Row>
        <Table columns={columns} />
      </div>
    </>
  );
};

export default Bills;
