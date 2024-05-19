import React, { useState } from "react";
import { Button, Row, Space, Table, Input, Select, Form, Flex } from "antd";
import "./OpeningStock.css";
import {
  CloseOutlined,
  CheckCircleFilled,
  RightOutlined,
  LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";

const OpeningStock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state?.record;
  const [data, setData] = useState(record.variants);
  const from = location.state?.from?.pathname || "/";

  console.log("Product Group", record);

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
  console.log("data", data);

  const handleRemoveRow = (index) => {
    console.log("Removed Index", index);
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const warehouseOptions = ["Piti Baby", "YGN Warehouse", "MDY Warehouse"];

  const columns = [
    {
      title: (
        <FormattedMessage
          id="label.productName"
          defaultMessage="Product Name"
        />
      ),
      dataIndex: "name",
      key: "name",
      width: "15%",
    },
    {
      title: (
        <FormattedMessage
          id="label.warehouseName"
          defaultMessage="Warehouse Name"
        />
      ),
      dataIndex: "warehouseName",
      key: "warehouseName",
      width: "20%",
      render: (text, record, index) => (
        <>
          <Form.Item name={`warehouse${index}`}>
            <Select
              showSearch
              className="custom-select"
              defaultValue={warehouseOptions[1]}
            >
              {warehouseOptions.map((option) => (
                <Select.Option value={option} key={option}></Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Space>
            <PlusOutlined className="add-icon" />
            <Button
              style={{ margin: 0, padding: 0 }}
              type="link"
              onClick={() => handleAddWarehouse(index, record.ID)}
            >
              Add Warehouse
            </Button>
          </Space>
        </>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="label.openingStock"
          defaultMessage="Opening Stock"
        />
      ),
      dataIndex: "openingStock",
      key: "openingStock",
      width: "20%",
      render: (text, record, index) => (
        <Form.Item name={`openingStock${index}`}>
          <Input />
        </Form.Item>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="label.openingStockValue"
          defaultMessage="Opening Stock Value"
        />
      ),
      dataIndex: "openingStockValue",
      key: "openingStockValue",
      width: "20%",
      render: (text, record, index) => (
        <Form.Item name={`openingStockValue${index}`}>
          <Input />
        </Form.Item>
      ),
    },
    {
      title: "",
      dataIndex: "removeRow",
      key: "removeRow",
      width: "10%",
      render: (text, record, index) =>
        index + 1 > data.length ? (
          <CloseOutlined onClick={() => handleRemoveRow(record.key)} />
        ) : (
          <></>
        ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Distribution Of Opening Stock</p>
        <Button icon={<CloseOutlined />} type="text" />
      </div>
      <div className="page-content">
        <Row className="product-new-top-band">
          <Space size="large">
            <Space>
              <CheckCircleFilled style={{ color: "var(--primary-color)" }} />
              <span>
                <FormattedMessage
                  id="title.productDetails"
                  defaultMessage="Product Details"
                />
              </span>
            </Space>

            <RightOutlined />
            <Flex
              style={{
                borderBottom: "2px solid var(--primary-color)",
                height: "4rem",
              }}
              align="center"
              justify="center"
            >
              <span>
                {
                  <FormattedMessage
                    id="title.openingStock"
                    defaultMessage="Opening Stock"
                  />
                }
              </span>
            </Flex>
          </Space>
        </Row>
        <Form>
          <Table
            className="opening-stock-table"
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey={(record) => record.ID}
          />
        </Form>
        <div className="page-actions-bar">
          <Button
            className="back-button"
            icon={<LeftOutlined />}
            style={{ height: "2.5rem" }}
            onClick={() =>
              navigate(from, { state: location.state, replace: true })
            }
          />
          <Button type="primary" htmlType="submit" className="page-actions-btn">
            {<FormattedMessage id="button.save" defaultMessage="Save" />}
          </Button>
          <Button
            className="page-actions-btn"
            onClick={() => navigate("/productGroups")}
          >
            {<FormattedMessage id="button.cancel" defaultMessage="Cancel" />}
          </Button>
        </div>
      </div>
    </>
  );
};

export default OpeningStock;
