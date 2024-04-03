import React, { useState } from "react";
import { Button, Row, Space, Table, Input, Select } from "antd";
import "./OpeningStock.css";
import {
  CloseOutlined,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";

const OpeningStock = () => {
  const location = useLocation();
  const { combinationPairs } = location.state || {};
  const [data, setData] = useState(combinationPairs);

  const handleAddWarehouse = (index) => {
    console.log("Added Index", index + 1);
    const newData = [...data];
    newData.splice(index + 1, 0, {
      productName: "",
      warehouseName: "",
      openingStock: "",
      openingStockValue: "",
    });
    setData(newData);
  };

  const handleRemoveRow = (index) => {
    console.log("Removed Index", index);
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const warehouseOptions = ["Piti Baby", "YGN Warehouse", "MDY Warehouse"];

  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      width: "15%",
    },
    {
      title: "Warehouse Name",
      dataIndex: "warehouseName",
      key: "warehouseName",
      width: "20%",
      render: (text, record, index) => (
        <>
          <Select
            showSearch
            className="custom-select"
            defaultValue={warehouseOptions[1]}
          >
            {warehouseOptions.map((option) => (
              <Select.Option value={option} key={option}></Select.Option>
            ))}
          </Select>
          <br />
          <Space style={{ marginTop: "0.7rem" }}>
            <PlusOutlined className="add-icon" />
            <a onClick={() => handleAddWarehouse(index)}>Add Warehouse</a>
          </Space>
        </>
      ),
    },
    {
      title: "Opening Stock",
      dataIndex: "openingStock",
      key: "openingStock",
      width: "20%",
      render: (text, record, index) => <Input />,
    },
    {
      title: "Opening Stock Value",
      dataIndex: "openingStockValue",
      key: "openingStockValue",
      width: "20%",
      render: (text, record, index) => <Input />,
    },
    {
      title: "",
      dataIndex: "removeRow",
      key: "removeRow",
      width: "10%",
      render: (text, record, index) =>
        data.length > 1 && record.key !== 0 ? (
          <CloseOutlined onClick={() => handleRemoveRow(record.key)} />
        ) : (
          <></>
        ),
    },
  ];

  return (
    <>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">Distribution Of Opening Stock</p>
        <Button icon={<CloseOutlined />} type="text" />
      </div>
      <div className="page-content page-content-with-form-buttons">
        <Row className="product-new-top-band">
          <Space size="large">
            <Space>
              <CheckCircleFilled style={{ color: "var(--primary-color)" }} />
              <span>General</span>
            </Space>
            <RightOutlined />
            <span>Opening Stock</span>
          </Space>
        </Row>
        <Table
          className="opening-stock-table"
          columns={columns}
          dataSource={data}
          pagination={false}
        />
        <div className="page-actions-bar">
          <Button
            className="back-button"
            icon={<LeftOutlined />}
            style={{ height: "2.5rem" }}
          />
          <Button type="primary" htmlType="submit" className="page-actions-btn">
            Save
          </Button>
          <Button className="page-actions-btn">Cancel</Button>
        </div>
      </div>
    </>
  );
};

export default OpeningStock;
