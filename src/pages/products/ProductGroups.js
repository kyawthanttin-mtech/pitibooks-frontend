import React, { useState } from "react";

import { UploadImage } from "../../components";
import "./ProductGroups.css";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Space,
  Table,
  Badge,
  Row,
  Dropdown,
  Col,
  Tag,
  Flex,
  Tabs,
  Radio,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  CloseOutlined,
  EditOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import AdjustStock from "./AdjustStock";

const columns = [
  { title: "Name", key: "name", dataIndex: "name" },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (text) => (
      <Badge
        status={`${text === "Active" ? "success" : "error"}`}
        text={text}
      />
    ),
  },
  {
    title: "Category",
    key: "category",
    dataIndex: "category",
  },
  {
    title: "Supplier",
    key: "supplier",
    dataIndex: "supplier",
  },
  {
    title: "Stock on hand",
    key: "stockOnHand",
    dataIndex: "stockOnHand",
  },
];

const dataSource = [
  {
    key: 1,
    id: 1,
    name: "Shirt (4 items)",
    status: "Active",
    category: "Cotton Shirt",
    supplier: "Supplier Name",
    stockOnHand: "10.00",
  },
  {
    key: 2,
    id: 2,
    name: "Shirt (4 items)",
    status: "Active",
    category: "Cotton Shirt",
    supplier: "Supplier Name",
    stockOnHand: "10.00",
  },
  {
    key: 3,
    id: 3,
    name: "Shirt (4 items)",
    status: "Inactive",
    category: "Cotton Shirt",
    supplier: "Supplier Name",
    stockOnHand: "10.00",
  },
];

const productTableColumns = [
  {
    title: "Product Details",
    key: "productDetails",
    dataIndex: "productDetails",
  },
  {
    title: "Cost Price",
    key: "costPrice",
    dataIndex: "costPrice",
  },
  {
    title: "Selling Price",
    key: "sellingPrice",
    dataIndex: "sellingPrice",
  },
  {
    title: "Stock On Hand",
    key: "stockOnHand",
    dataIndex: "stockOnHand",
  },
];

const productTableDataSource = [
  {
    key: 1,
    id: 1,
    productDetails: "Shirt-White/S",
    costPrice: "MMK 2,000.00",
    sellingPrice: "MMK 5,000.00",
    stockOnHand: "10.0",
  },
  {
    key: 2,
    id: 2,
    productDetails: "Shirt-White/L",
    costPrice: "MMK 2,000.00",
    sellingPrice: "MMK 5,000.00",
    stockOnHand: "10.0",
  },
  {
    key: 3,
    id: 3,
    productDetails: "Shirt-Black/S",
    costPrice: "MMK 2,000.00",
    sellingPrice: "MMK 5,000.00",
    stockOnHand: "10.0",
  },
  {
    key: 4,
    id: 4,
    productDetails: "Shirt-Black/L",
    costPrice: "MMK 2,000.00",
    sellingPrice: "MMK 5,000.00",
    stockOnHand: "10.0",
  },
];

const stockLocationsTableColumns = [
  {
    title: "Warehouse Name",
    dataIndex: "warehouseName",
    key: "warehouseName",
  },
  {
    title: "Accounting Stock",
    children: [
      {
        title: "Stock On Hand",
        dataIndex: "stockOnHand",
        key: "stockOnHand",
      },
      {
        title: "Committed Stock",
        dataIndex: "committedStock",
        key: "committedStock",
      },
      {
        title: "Available For Sale",
        dataIndex: "availableForSale",
        key: "availableForSale",
      },
    ],
  },
];

const ProductGroups = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [selectedProductRecord, setSelectedProductRecord] = useState(null);
  const [selectedProductRowIndex, setSelectedProductRowIndex] = useState(0);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const navigate = useNavigate();

  const compactColumns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
    },
  ];

  return (
    <div className={`${selectedRecord && "page-with-column"}`}>
      <div>
        <div className="page-header">
          <p className="page-header-text">Product Groups</p>
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => navigate("/productGroups/new")}
            >
              {!selectedRecord && "New"}
            </Button>
            <Button icon={<MoreOutlined />} />
          </Space>
        </div>
        <div className={`page-content ${selectedRecord && "column-width1"}`}>
          <Table
            dataSource={dataSource}
            pagination={false}
            columns={selectedRecord ? compactColumns : columns}
            rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
            onRow={(record) => {
              return {
                onClick: () => {
                  setSelectedRecord(record);
                  setSelectedRowIndex(record.id);
                },
              };
            }}
          ></Table>
        </div>
      </div>
      {selectedRecord && !selectedProductRecord && (
        <div className="content-column">
          <Row className="content-column-header-row">
            <Space>
              <Button icon={<EditOutlined />}></Button>
              <Button type="primary">Add Item</Button>
              <Button>
                <Space>
                  More <CaretDownOutlined />
                </Space>
              </Button>
            </Space>
            <Button
              icon={<CloseOutlined />}
              type="text"
              onClick={() => {
                setSelectedRecord(null);
                setSelectedRowIndex(0);
              }}
            />
          </Row>
          <div className="content-column-full-row">
            <Row className="product-details-section">
              <Col lg={12}>
                <span>{selectedRecord.name}</span>
                <table>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2.5rem",
                          paddingRight: "5.438rem",
                        }}
                      >
                        Unit
                      </td>
                      <td style={{ paddingTop: "2.5rem" }}>pcs</td>
                    </tr>
                    <tr style={{ marginTop: "30px" }}>
                      <td style={{ paddingTop: "1.875rem" }}>Color</td>
                      <td style={{ paddingTop: "1.875rem" }}>
                        <Tag>White</Tag>
                        <Tag>Black</Tag>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingTop: "1.875rem" }}>Size</td>
                      <td style={{ paddingTop: "1.875rem" }}>
                        <Tag>S</Tag>
                        <Tag>L</Tag>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Col>
              <Col lg={12}>
                <UploadImage />
              </Col>
            </Row>
            <Table
              columns={productTableColumns}
              dataSource={productTableDataSource}
              pagination={false}
              rowSelection={{ selectedRowKeys: [selectedProductRowIndex] }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setSelectedProductRecord(record);
                    setSelectedProductRowIndex(record.id);
                  },
                };
              }}
            />
          </div>
        </div>
      )}
      {selectedProductRecord && !showAdjustmentForm && (
        <div className="content-column">
          <Row className="content-column-header-row product-details-header-row">
            <p className="page-header-text">
              {selectedProductRecord.productDetails}
            </p>
            <Flex>
              <Space>
                <Button icon={<EditOutlined />}></Button>
                <Button
                  type="primary"
                  onClick={() => setShowAdjustmentForm(true)}
                >
                  Adjust Stock
                </Button>
                <Button>
                  <Space>
                    More <CaretDownOutlined />
                  </Space>
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  type="text"
                  onClick={() => {
                    setSelectedProductRecord(null);
                    setSelectedProductRowIndex(0);
                  }}
                />
              </Space>
            </Flex>
          </Row>
          <div className="content-column-full-row product-details-content-column-full-row">
            <Tabs>
              <Tabs.TabPane tab="Overview" key="overview">
                <table className="overview-table">
                  <thead>Primary Details</thead>
                  <tbody>
                    <tr>
                      <td width="218" className="overview-data">
                        Item Group Name
                      </td>
                      <td className="overview-data">Shirt</td>
                    </tr>
                    <tr>
                      <td className="overview-data">Item Type</td>
                      <td className="overview-data">Inventory Items</td>
                    </tr>
                    <tr>
                      <td className="overview-data">Color</td>
                      <td className="overview-data">White</td>
                    </tr>
                    <tr>
                      <td className="overview-data">Size</td>
                      <td className="overview-data">S</td>
                    </tr>
                    <tr>
                      <td className="overview-data">SKU</td>
                      <td className="overview-data">123456</td>
                    </tr>
                    <tr>
                      <td className="overview-data">Unit</td>
                      <td className="overview-data">pcs</td>
                    </tr>
                    <tr>
                      <td className="overview-data">Created Source</td>
                      <td className="overview-data">User</td>
                    </tr>
                    <tr>
                      <td className="overview-data">Inventory Account</td>
                      <td className="overview-data" s>
                        Inventory Asset
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="overview-table">
                  <thead>Purchase Information</thead>
                  <tbody>
                    <tr>
                      <td width="218" className="overview-data">
                        Cost Price
                      </td>
                      <td className="overview-data">
                        {selectedProductRecord.costPrice}
                      </td>
                    </tr>
                    <tr>
                      <td className="overview-data">Purchase Account</td>
                      <td className="overview-data">Cost Of Good Sold</td>
                    </tr>
                  </tbody>
                </table>

                <table className="overview-table">
                  <thead>Sales Information</thead>
                  <tbody>
                    <tr>
                      <td width="218" className="overview-data">
                        Selling Price
                      </td>
                      <td className="overview-data">
                        {selectedProductRecord.sellingPrice}
                      </td>
                    </tr>
                    <tr>
                      <td className="overview-data">Sales Account</td>
                      <td className="overview-data">Sales</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                <Flex justify="space-between" align="center">
                  <p>Recent Transaction</p>
                  <Radio.Group
                    defaultValue="accountingStock"
                    buttonStyle="solid"
                  >
                    <Radio.Button value="accountingStock" defaultChecked>
                      Accounting Stock
                    </Radio.Button>
                    <Radio.Button value="physicalStock">
                      Physical Stock
                    </Radio.Button>
                  </Radio.Group>
                </Flex>
                <Table
                  className="stock-locations-table"
                  columns={stockLocationsTableColumns}
                  bordered
                  pagination={false}
                ></Table>
              </Tabs.TabPane>
              <Tabs.TabPane
                tab="Transactions"
                key="transactions"
              ></Tabs.TabPane>
              <Tabs.TabPane tab="History" key="history"></Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      )}
      {showAdjustmentForm && (
        <div className="content-column">
          <Row className="content-column-header-row">
            <p className="page-header-text">
              Adjust Stock -{selectedProductRecord.productDetails}
            </p>
            <Button
              icon={<CloseOutlined />}
              type="text"
              onClick={() => setShowAdjustmentForm(false)}
            />
          </Row>
          <AdjustStock
            selectedProductRecord={selectedRecord}
            onClose={() => setShowAdjustmentForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGroups;
