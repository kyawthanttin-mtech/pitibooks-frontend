import React, { useState, useMemo } from "react";
import { UploadImage } from "../../components";

import { Button, Table, Radio, Space, Row, Tabs, Flex, Col } from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  CaretDownOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import AdjustStock from "./AdjustStock";
import { useNavigate } from "react-router-dom";
import ProductQueries from "../../graphql/queries/ProductQueries";
import { openErrorNotification } from "../../utils/Notification";
import { useQuery } from "@apollo/client";
import { useOutletContext } from "react-router-dom";

const { GET_PRODUCTS } = ProductQueries;

const compactColumns = [
  { title: "Product Name", key: "productName", dataIndex: "productName" },
];

const columns = [
  {
    title: "Product Name",
    dataIndex: "productName",
    key: "productName",
  },

  {
    title: "SKU",
    dataIndex: "sku",
    key: "sku",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Purchase Description",
    dataIndex: "purchaseDescription",
    key: "purchaseDescription",
  },
  {
    title: "Rate",
    dataIndex: "rate",
    key: "rate",
  },
  {
    title: "Purchase Rate",
    dataIndex: "purchaseRate",
    key: "purchaseRate",
  },
  {
    title: "Stock On Hand",
    dataIndex: "stockOnHand",
    key: "stockOnHand",
  },
  {
    title: (
      <SearchOutlined
        className="table-header-search-icon"
        // onClick={() => setSearchInventoryModalOpen(true)}
      />
    ),
    dataIndex: "search",
    key: "search",
  },
];

const dataSource = [
  {
    key: 1,
    productName: "Perfume",
    sku: "123223",
    rate: "MMK 800,000.00",
    purchaseRate: "MMK 0.00",
    stockOnHand: "23.00",
  },
  {
    key: 2,
    productName: "Perfume",
    sku: "123223",
    rate: "MMK 800,000.00",
    purchaseRate: "MMK 0.00",
    stockOnHand: "23.00",
  },
  {
    key: 3,
    productName: "Perfume",
    sku: "123223",
    rate: "MMK 800,000.00",
    purchaseRate: "MMK 0.00",
    stockOnHand: "23.00",
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

const Products = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [notiApi] = useOutletContext();
  const navigate = useNavigate();
  const {
    data,
    loading: queryLoading,
    // refetch,
  } = useQuery(GET_PRODUCTS, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const queryData = useMemo(() => data, [data]);

  !queryLoading && console.log(queryData);

  return (
    <div className={`${selectedRecord && "page-with-column"}`}>
      <div>
        <div className="page-header page-header-with-button">
          <p className="page-header-text">All Products</p>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/products/new")}
            >
              {!selectedRecord && "New"}
            </Button>
            <Button icon={<MoreOutlined />}></Button>
          </Space>
        </div>
        <div className={`page-content ${selectedRecord && "column-width1"}`}>
          <Table
            columns={selectedRecord ? compactColumns : columns}
            pagination={false}
            dataSource={dataSource}
            rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
            onRow={(record) => {
              return {
                onClick: () => {
                  setSelectedRecord(record);
                  setSelectedRowIndex(record.id);
                },
              };
            }}
          />
        </div>
      </div>
      {selectedRecord && !showAdjustmentForm && (
        <div className="content-column">
          <Flex className="content-column-header-row product-details-header-row">
            <p className="page-header-text">{selectedRecord.productName}</p>
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
                  setSelectedRecord(null);
                  setSelectedRowIndex(0);
                }}
              />
            </Space>
          </Flex>
          <div className="content-column-full-row product-details-content-column-full-row">
            <Tabs>
              <Tabs.TabPane tab="Overview" key="overview">
                <Row>
                  <Col>
                    <table className="overview-table">
                      <thead>Product Details</thead>
                      <tbody>
                        <tr>
                          <td width="218" className="overview-data">
                            Item Type
                          </td>
                          <td className="overview-data">Inventory Items</td>
                        </tr>
                        <tr>
                          <td className="overview-data">SKU</td>
                          <td className="overview-data">
                            {selectedRecord.sku}
                          </td>
                        </tr>
                        <tr>
                          <td className="overview-data">Created Source</td>
                          <td className="overview-data">API</td>
                        </tr>
                        <tr>
                          <td className="overview-data">Inventory Account</td>
                          <td className="overview-data">Inventory Asset</td>
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
                            {selectedRecord.rate}
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
                            {selectedRecord.purchaseRate}
                          </td>
                        </tr>
                        <tr>
                          <td className="overview-data">Sales Account</td>
                          <td className="overview-data">Sales</td>
                        </tr>
                      </tbody>
                    </table>
                  </Col>
                  <Col offset={3} style={{ paddingTop: "2rem" }}>
                    <UploadImage />
                  </Col>
                </Row>
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
              Adjust Stock - {selectedRecord.productName}
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

export default Products;
