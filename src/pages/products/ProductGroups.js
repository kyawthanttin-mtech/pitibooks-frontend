import React, { useState } from "react";

import { UploadImage } from "../../components";
import "./ProductGroups.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Badge,
  Row,
  Col,
  Tag,
  Flex,
  Tabs,
  Radio,
  Modal,
  Form,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  CloseOutlined,
  EditOutlined,
  CaretDownOutlined,
  PlusOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import AdjustStock from "./AdjustStock";
import { PaginatedSelectionTable } from "../../components";
import { ProductGroupQueries, ProductGroupMutations } from "../../graphql";
import { useMutation } from "@apollo/client";
const { GET_PAGINATED_PRODUCT_GROUPS } = ProductGroupQueries;
const { DELETE_PRODUCT_GROUP } = ProductGroupMutations;

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
  const [deleteModal, contextHolder] = Modal.useModal();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notiApi, msgApi } = useOutletContext();

  //Mutations
  const [deleteProductGroup, { loading: deleteLoading }] = useMutation(
    DELETE_PRODUCT_GROUP,

    {
      onCompleted() {
        openSuccessNotification(
          msgApi,
          <FormattedMessage
            id="productGroup.deleted"
            defaultMessage="Product Group Deleted"
          />
        );
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingProductGroups = cache.readQuery({
          query: GET_PAGINATED_PRODUCT_GROUPS,
        });
        const updatedProductGroups =
          existingProductGroups.paginateProductGroup.edges.filter(
            ({ node }) => node.id !== data.deleteProductGroup.id
          );
        cache.writeQuery({
          query: GET_PAGINATED_PRODUCT_GROUPS,
          data: {
            paginateProduct: {
              ...existingProductGroups.paginateProductGroup,
              edges: updatedProductGroups,
            },
          },
        });
      },
    }
  );

  const loading = deleteLoading;

  const parseData = (data) => {
    let products = [];
    data?.paginateProductGroup?.edges.forEach(({ node }) => {
      if (node != null) {
        products.push({
          key: node.id,
          ...node,
          categoryName: node.category?.name,
          supplierName: node.supplier?.name,
        });
      }
    });
    console.log("Products", products);
    return products ? products : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateProductGroup) {
      pageInfo = {
        hasNextPage: data.paginateProductGroup.pageInfo.hasNextPage,
        endCursor: data.paginateProductGroup.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const handleEdit = (record, navigate, location) => {
    // console.log("edit record", record);
    navigate("edit", {
      state: {
        ...location.state,
        from: { pathname: location.pathname },
        record,
      },
    });
  };

  const handleDelete = async (id) => {
    // console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.delete"
          defaultMessage="Are you sure to delete?"
        />
      ),
    });
    if (confirmed) {
      try {
        await deleteProductGroup({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleToggleActive = () => {};

  const columns = [
    { title: "Name", key: "name", dataIndex: "name" },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (_, record) => (
        <Badge
          status={`${record.isActive ? "success" : "error"}`}
          text={`${record.isActive ? "Active" : "Inactive"}`}
        />
      ),
    },
    {
      title: "Category",
      key: "categoryName",
      dataIndex: "categoryName",
    },
    {
      title: "Supplier",
      key: "supplierName",
      dataIndex: "supplierName",
    },
    {
      title: "Stock on hand",
      key: "stockOnHand",
      dataIndex: "stockOnHand",
    },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        />
      ),
      dataIndex: "search",
      key: "search",
    },
  ];

  const filterOptions = [
    {
      key: "1",
      label: "All Products",
    },
    {
      key: "2",
      label: "Active Products",
    },
    {
      key: "3",
      label: "Inactive Products",
    },
    {
      key: "4",
      label: "Sales",
    },
    {
      key: "5",
      label: "Purchases",
    },
    {
      key: "6",
      label: "Inventory",
    },
    {
      key: "7",
      label: "Non-Inventory",
    },
  ];

  const compactColumns = [
    { title: "Product Name", key: "name", dataIndex: "name" },
  ];

  return (
    <>
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <div className="page-header-text">Product Groups</div>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate("new", {
                    state: {
                      ...location.state,
                      from: { pathname: location.pathname },
                    },
                  })
                }
              >
                {!selectedRecord && "New"}
              </Button>
              <Button icon={<MoreOutlined />}></Button>
            </Space>
          </div>

          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            <PaginatedSelectionTable
              loading={loading}
              api={notiApi}
              columns={columns}
              gqlQuery={GET_PAGINATED_PRODUCT_GROUPS}
              showSearch={false}
              // searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATED_PRODUCT_GROUPS}
              parseData={parseData}
              parsePageInfo={parsePageInfo}
              showAddNew={true}
              searchModalOpen={searchModalOpen}
              setSearchModalOpen={setSearchModalOpen}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              setSelectedRowIndex={setSelectedRowIndex}
              selectedRowIndex={selectedRowIndex}
              compactColumns={compactColumns}
            />
          </div>
        </div>
        {selectedRecord && !selectedProductRecord && (
          <div className="content-column">
            <Flex className="content-column-header-row">
              <p className="page-header-text">{selectedRecord.name}</p>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(selectedRecord, navigate, location)}
                ></Button>
                <Button type="primary">Add Item</Button>
                <Button>
                  <Dropdown
                    loading={loading}
                    trigger="click"
                    key={selectedRecord.key}
                    menu={{
                      onClick: ({ key }) => {
                        if (key === "1") console.log("clone");
                        else if (key === "2")
                          handleToggleActive(selectedRecord);
                        else if (key === "3") handleDelete(selectedRecord.id);
                      },
                      items: [
                        {
                          label: (
                            <FormattedMessage
                              id="button.cloneItem"
                              defaultMessage="Clone Item"
                            />
                          ),
                          key: "1",
                        },
                        {
                          label: !selectedRecord.isActive ? (
                            <FormattedMessage
                              id="button.markActive"
                              defaultMessage="Mark As Active"
                            />
                          ) : (
                            <FormattedMessage
                              id="button.markInactive"
                              defaultMessage="Mark As Inactive"
                            />
                          ),
                          key: "2",
                        },
                        {
                          label: (
                            <FormattedMessage
                              id="button.delete"
                              defaultMessage="Delete"
                            />
                          ),
                          key: "3",
                        },
                      ],
                    }}
                  >
                    <div style={{ height: "2rem" }}>
                      More <CaretDownOutlined />
                    </div>
                  </Dropdown>
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
                        <td style={{ paddingTop: "2.5rem" }}>
                          {selectedRecord.productUnit.abbreviation}
                        </td>
                      </tr>
                      {selectedRecord.options?.map((option) => (
                        <tr style={{ marginTop: "30px" }}>
                          <td style={{ paddingTop: "1.875rem" }}>
                            {option.optionName}
                          </td>
                          <td style={{ paddingTop: "1.875rem" }}>
                            {option.optionUnits?.split("|").map((value) => (
                              <Tag>{value}</Tag>
                            ))}
                          </td>
                        </tr>
                      ))}
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
    </>
  );
};

export default ProductGroups;