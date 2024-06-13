/* eslint-disable react/style-prop-object */
import React, { useState } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  Radio,
  Tabs,
  Flex,
  Dropdown,
  Button,
  Space,
  Table,
} from "antd";
import {
  CloseOutlined,
  CaretDownOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
} from "../../components";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { ProductQueries, ProductMutations } from "../../graphql";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useMutation } from "@apollo/client";
import AdjustStock from "./AdjustStock";
import { UploadImage } from "../../components";
import { useHistoryState } from "../../utils/HelperFunctions";

const { GET_PAGINATE_PRODUCT } = ProductQueries;
const { DELETE_PRODUCT } = ProductMutations;

const Products = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const { notiApi, msgApi, business, refetchAllProducts } = useOutletContext();
  const navigate = useNavigate();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "productSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "productCurrentPage",
    1
  );

  // Mutations
  const [deleteProduct, { loading: deleteLoading }] = useMutation(
    DELETE_PRODUCT,

    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="product.deleted"
            defaultMessage="Product Deleted"
          />
        );
        refetchAllProducts();
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingProducts = cache.readQuery({
          query: GET_PAGINATE_PRODUCT,
        });
        const updatedProducts = existingProducts.paginateProduct.edges.filter(
          ({ node }) => node.id !== data.deleteProduct.id
        );
        cache.writeQuery({
          query: GET_PAGINATE_PRODUCT,
          data: {
            paginateProduct: {
              ...existingProducts.paginateProduct,
              edges: updatedProducts,
            },
          },
        });
      },
    }
  );

  const parseData = (data) => {
    let products = [];
    data?.paginateProduct?.edges.forEach(({ node }) => {
      if (node != null) {
        products.push({
          key: node.id,
          ...node,
        });
      }
    });
    // console.log("Products", products);
    return products ? products : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateProduct) {
      pageInfo = {
        hasNextPage: data.paginateProduct.pageInfo.hasNextPage,
        endCursor: data.paginateProduct.pageInfo.endCursor,
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
        await deleteProduct({
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

  const loading = deleteLoading;

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.productName"
                defaultMessage="Product Name"
              />
            }
            name="name"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<FormattedMessage id="label.sku" defaultMessage="SKU" />}
            name="sku"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
      {/* <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.description"
                defaultMessage="Description"
              />
            }
            name="description"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.productRate" defaultMessage="Rate" />
            }
            name="rate"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row> */}
      {/* <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.status" defaultMessage="Status" />
            }
            name="status"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select allowClear showSearch optionFilterProp="label"></Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<FormattedMessage id="label.tax" defaultMessage="Tax" />}
            name="tax"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row> */}
      {/* <Row>
        <Col span={12}>
          <Form.Item
            style={{ margin: 0 }}
            label={
              <FormattedMessage
                id="label.salesAccount"
                defaultMessage="Sales Account"
              />
            }
            name="salesAccount"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.purchaseAccount"
                defaultMessage="Purchase Account"
              />
            }
            name="purchaseAccount"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select allowClear showSearch optionFilterProp="label"></Select>
          </Form.Item>
        </Col>
      </Row> */}
    </Form>
  );

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Sales Price",
      dataIndex: "salesPrice",
      key: "salesPrice",
      render: (text, record) => (
        <>
          {business.baseCurrency.symbol}{" "}
          <FormattedNumber
            value={text}
            style="decimal"
            minimumFractionDigits={business.baseCurrency.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: "Product Category",
      key: "category",
      render: (_, record) => record.category.name,
    },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    // },
    // {
    //   title: "Purchase Description",
    //   dataIndex: "purchaseDescription",
    //   key: "purchaseDescription",
    // },
    // {
    //   title: "Rate",
    //   dataIndex: "rate",
    //   key: "rate",
    // },
    // {
    //   title: "Purchase Rate",
    //   dataIndex: "purchaseRate",
    //   key: "purchaseRate",
    // },
    // {
    //   title: "Stock On Hand",
    //   dataIndex: "stockOnHand",
    //   key: "stockOnHand",
    // },
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

  // const filterOptions = [
  //   {
  //     key: "1",
  //     label: "All Products",
  //   },
  //   {
  //     key: "2",
  //     label: "Active Products",
  //   },
  //   {
  //     key: "3",
  //     label: "Inactive Products",
  //   },
  //   {
  //     key: "4",
  //     label: "Sales",
  //   },
  //   {
  //     key: "5",
  //     label: "Purchases",
  //   },
  //   {
  //     key: "6",
  //     label: "Inventory",
  //   },
  //   {
  //     key: "7",
  //     label: "Non-Inventory",
  //   },
  // ];

  const compactColumns = [
    { title: "Product Name", key: "name", dataIndex: "name" },
  ];

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);
  };

  return (
    <>
      {contextHolder}

      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header">
            <div className="page-header-text">Products</div>
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
                {!selectedRecord && (
                  <span>
                    <FormattedMessage id="button.new" defaultMessage="New" />
                  </span>
                )}
              </Button>
              <Button icon={<MoreOutlined />}></Button>
            </Space>
          </div>

          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            {searchCriteria && (
              <SearchCriteriaDisplay
                searchCriteria={searchCriteria}
                handleModalClear={handleModalClear}
              >
                {searchCriteria.name && (
                  <li>
                    Product Name includes <b>{searchCriteria.name}</b>
                  </li>
                )}
                {searchCriteria.sku && (
                  <li>
                    Product SKU contains <b>{searchCriteria.sku}</b>
                  </li>
                )}
              </SearchCriteriaDisplay>
            )}
            <PaginatedSelectionTable
              compactTableHeader={true}
              loading={loading}
              api={notiApi}
              columns={columns}
              gqlQuery={GET_PAGINATE_PRODUCT}
              searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_PRODUCT}
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
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
        {selectedRecord && !showAdjustmentForm && (
          <div className="content-column">
            <Flex className="content-column-header-row product-details-header-row">
              <p className="page-header-text">{selectedRecord.name}</p>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(selectedRecord, navigate, location)}
                ></Button>
                <Button
                  type="primary"
                  onClick={() => setShowAdjustmentForm(true)}
                >
                  Adjust Stock
                </Button>
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
            <div></div>
            <div
              className="content-column-full-row product-details-content-column-full-row"
              style={{ paddingTop: 0 }}
            >
              <Tabs>
                <Tabs.TabPane tab="Overview" key="overview">
                  <Row>
                    <Col>
                      <table className="overview-table">
                        <thead>Product Details</thead>
                        <tbody>
                          {/* <tr>
                            <td width="218" className="overview-data">
                              Item Type
                            </td>
                            <td className="overview-data">Inventory Items</td>
                          </tr> */}
                          <tr>
                            <td className="overview-data">Category</td>
                            <td className="overview-data">
                              {selectedRecord?.category?.name
                                ? selectedRecord?.category?.name
                                : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">Unit</td>
                            <td className="overview-data">
                              {selectedRecord?.productUnit?.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">Supplier</td>
                            <td className="overview-data">
                              {selectedRecord?.supplier?.name
                                ? selectedRecord?.supplier?.name
                                : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">SKU</td>
                            <td className="overview-data">
                              {selectedRecord?.sku}
                            </td>
                          </tr>
                          {/* <tr>
                            <td className="overview-data">Created Source</td>
                            <td className="overview-data">API</td>
                          </tr> */}
                          <tr>
                            <td className="overview-data">Inventory Account</td>
                            <td className="overview-data">
                              {selectedRecord?.inventoryAccount?.name}
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
                              {business.baseCurrency.symbol}{" "}
                              <FormattedNumber
                                value={selectedRecord?.purchasePrice}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">Purchase Account</td>
                            <td className="overview-data">
                              {selectedRecord?.purchaseAccount?.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">Purchase Tax</td>
                            <td className="overview-data">
                              {selectedRecord?.purchaseTax.name
                                ? selectedRecord?.purchaseTax.name
                                : "-"}
                            </td>
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
                              {business.baseCurrency.symbol}{" "}
                              <FormattedNumber
                                value={selectedRecord?.salesPrice}
                                style="decimal"
                                minimumFractionDigits={
                                  business.baseCurrency.decimalPlaces
                                }
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">Sales Account</td>
                            <td className="overview-data">
                              {selectedRecord?.salesAccount.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="overview-data">Sales Tax</td>
                            <td className="overview-data">
                              {selectedRecord?.salesTax.name
                                ? selectedRecord?.salesTax.name
                                : "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                    <Col offset={3} style={{ paddingTop: "2rem" }}>
                      <UploadImage
                        images={selectedRecord.images}
                        key={selectedRecord.id}
                        editable={false}
                      />
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
                    //   columns={stockLocationsTableColumns}
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
                Adjust Stock - {selectedRecord.name}
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

export default Products;
