import React from "react";

import { Button, Space, Table } from "antd";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

const columns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Transfer Order",
    dataIndex: "transferOrder",
    key: "transferOrder",
  },
  {
    title: "Reason",
    dataIndex: "reason",
    key: "reason",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Quantity Transferred",
    dataIndex: "quantityTransferred",
    key: "quantityTransferred",
  },
  {
    title: "Source Warehouse",
    dataIndex: "sourceWarehouse",
    key: "sourceWarehouse",
  },
  {
    title: "Destination Warehouse",
    dataIndex: "destinationWarehouse",
    key: "destinationWarehouse",
  },
];

const TransferOrders = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">All Transfer Orders</p>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/transferOrders/new")}
          >
            New
          </Button>
          <Button icon={<MoreOutlined />}></Button>
        </Space>
      </div>
      <div className="page-content">
        <Table pagination={false} columns={columns} />
      </div>
    </>
  );
};

export default TransferOrders;
