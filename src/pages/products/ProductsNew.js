import React, { useState } from "react";
import { UploadImage } from "../../components";

import {
  Button,
  Row,
  Space,
  Table,
  Input,
  Form,
  Col,
  Radio,
  Select,
} from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";

const unitOptions = [
  "box",
  "cm",
  "dz",
  "ft",
  "gm",
  "kg",
  "km",
  "lb",
  "mg",
  "ml",
  "m",
  "pcs",
];

const taxOptionGroups = [
  {
    title: "Tax",
    options: ["Commercial Tax [5%]", "Consumer Tax [5%]", "Tax 1 [2%]"],
  },
  {
    title: "Tax Group",
    options: ["Group Tax [17.7%]", "Group Tax 2 [12.35%]"],
  },
];

const accountOptionGroups = [
  {
    title: "Income",
    options: [
      "Discount",
      "General Income",
      "Interest Income",
      "Latefree Income",
      "Sales",
      "Shipping Charge",
    ],
  },
];

const purchaseOptionGroups = [
  {
    title: "Expense",
    options: [
      "Salaries and employee wages",
      "Telephone Accessories",
      "Telephone Expense",
      "Travel Expense",
      "Uncatagorized",
    ],
  },
  {
    title: "Cost of Goods Sold",
    options: ["Cost of Goods Sold"],
  },
];

const warehouseOptions = ["Piti Baby", "YGN Warehouse", "MDY Warehouse"];

const productNewForm = (
  <Form className="product-new-form">
    <Row>
      <Col lg={14}>
        <Row>
          <Col lg={18}>
            <Form.Item label="Type" labelCol={{ span: 5 }} labelAlign="left">
              <Radio.Group defaultValue="goods">
                <Radio value="goods"> Goods </Radio>
                <Radio value="service"> Service </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="productName"
              label="Product Name"
              labelCol={{ span: 5 }}
              labelAlign="left"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="sku"
              label="SKU"
              labelCol={{ span: 5 }}
              labelAlign="left"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="barcode"
              label="Barcode"
              labelCol={{ span: 5 }}
              labelAlign="left"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              labelCol={{ span: 5 }}
              labelAlign="left"
            >
              <Input.TextArea rows={4}></Input.TextArea>
            </Form.Item>
          </Col>
        </Row>
        <br />
        <br />
      </Col>
      <Col lg={5}>
        <UploadImage />
      </Col>
    </Row>
    <Row>
      <Col lg={7}>
        <Form.Item label="Unit" labelCol={{ span: 8 }} labelAlign="left">
          <Select placeholder="Select or type to add" showSearch allowClear>
            {unitOptions.map((option) => (
              <Select.Option value={option} key={option}></Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col lg={7}>
        <Form.Item label="Tax" labelCol={{ span: 8 }} labelAlign="left">
          <Select placeholder="Select or type to add" showSearch allowClear>
            {taxOptionGroups.map((group) => (
              <Select.OptGroup key={group.title} label={group.title}>
                {group.options.map((option) => (
                  <Select.Option key={option}>{option}</Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Supplier" labelCol={{ span: 8 }} labelAlign="left">
          <Select
            placeholder="Select a Supplier"
            showSearch
            allowClear
          ></Select>
        </Form.Item>
        <Form.Item label="Category" labelCol={{ span: 8 }} labelAlign="left">
          <Select placeholder="Select Category" showSearch allowClear></Select>
        </Form.Item>
      </Col>
      <Col lg={7} offset={1}>
        <Form.Item
          label="Sales Account"
          labelCol={{ span: 8 }}
          labelAlign="left"
        >
          <Select defaultValue={accountOptionGroups[0].options[4]}>
            {accountOptionGroups.map((group) => (
              <Select.OptGroup key={group.title} label={group.title}>
                {group.options.map((option) => (
                  <Select.Option key={option}>{option}</Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Purchase Account"
          labelAlign="left"
          labelCol={{ span: 8 }}
        >
          <Select defaultValue={purchaseOptionGroups[0].options[4]}>
            {purchaseOptionGroups.map((group) => (
              <Select.OptGroup key={group.title} label={group.title}>
                {group.options.map((option) => (
                  <Select.Option key={option}>{option}</Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Inventory Account"
          labelCol={{ span: 8 }}
          labelAlign="left"
        >
          <Select></Select>
        </Form.Item>
      </Col>
    </Row>
    <div className="page-actions-bar page-actions-bar-margin">
      <Button type="primary" htmlType="submit" className="page-actions-btn">
        Save and Next
      </Button>
      <Button
        className="page-actions-btn"
        //   onClick={() =>
        //     navigate(from, { state: location.state, replace: true })
        //   }
      >
        Cancel
      </Button>
    </div>
  </Form>
);

const ProductsNew = () => {
  const [data, setData] = useState([{ key: 1 }]);

  const handleAddRow = () => {
    const newRowKey = data.length + 1;
    setData([...data, { key: newRowKey }]);
  };

  const handleRemoveRow = (keyToRemove) => {
    console.log(keyToRemove);
    const newData = data.filter((dataItem) => dataItem.key !== keyToRemove);
    setData(newData);
  };

  const columns = [
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
        data.length > 1 && record.key !== 1 ? (
          <CloseOutlined onClick={() => handleRemoveRow(record.key)} />
        ) : (
          <></>
        ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">New Product</p>
        <Button icon={<CloseOutlined />} type="text" />
      </div>
      <div className="page-content page-content-with-form-buttons">
        {productNewForm}
        <Table
          columns={columns}
          className="opening-stock-table"
          dataSource={data}
          pagination={false}
        />
        <Space style={{ marginBottom: "0.7rem", paddingLeft: "1.5rem" }}>
          <PlusOutlined className="add-icon" />
          <a onClick={handleAddRow}>Add Warehouse</a>
        </Space>
        <br />
        <br />
      </div>
    </>
  );
};

export default ProductsNew;
