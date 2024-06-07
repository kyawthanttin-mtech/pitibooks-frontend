/* eslint-disable react/style-prop-object */
import React, { useState, useMemo } from "react";

import {
  Space,
  Button,
  Table,
  Row,
  Dropdown,
  Divider,
  Modal,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  PaperClipOutlined,
  CloseOutlined,
  EditOutlined,
  FilePdfOutlined,
  CaretDownFilled,
  PrinterOutlined,
  CaretRightFilled,
} from "@ant-design/icons";
import {
  PaginatedSelectionTable,
  PurchaseOrderTemplate,
  SearchCriteriaDisplay,
  SupplierSearchModal,
} from "../../components";
import { useReadQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { PurchaseOrderQueries, PurchaseOrderMutations } from "../../graphql";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useHistoryState } from "../../utils/HelperFunctions";
import { useMutation } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
const { GET_PAGINATE_PURCHASE_ORDER } = PurchaseOrderQueries;
const { CONFIRM_PURCHASE_ORDER, CANCEL_PURCHASE_ORDER, DELETE_PURCHASE_ORDER } =
  PurchaseOrderMutations;

const draftActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.covertToBill"
        defaultMessage="Convert to Bill"
      />
    ),
    key: "1",
  },
  {
    label: (
      <FormattedMessage
        id="button.confirmPurchaseOrder"
        defaultMessage="Confirm Purchase Order"
      />
    ),
    key: "2",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "4",
  },
];

const confirmedActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.covertToBill"
        defaultMessage="Convert to Bill"
      />
    ),
    key: "1",
  },
  {
    label: (
      <FormattedMessage
        id="button.cancelPurchaseOrder"
        defaultMessage="Cancel Purchase Order"
      />
    ),
    key: "3",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "4",
  },
];

const cancelledActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "4",
  },
];

const closedActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
];

const billTableColumns = [
  {
    title: "#Bill",
    dataIndex: "billNumber",
    key: "billNumber",
  },
  {
    title: "Date",
    dataIndex: "billDate",
    key: "billDate",
    render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
  },
  {
    title: "Status",
    dataIndex: "currentStatus",
    key: "currentStatus",
  },
  {
    title: "Due Date",
    dataIndex: "billDueDate",
    key: "billDueDate",
    render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
  },
  {
    title: "Amount",
    dataIndex: "billTotalAmount",
    key: "billTotalAmount",
  },
  {
    title: "Balance Due",
    dataIndex: "balanceDue",
    key: "balanceDue",
  },
];

const PurchaseOrders = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("bill");
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notiApi, msgApi, allBranchesQueryRef, allWarehousesQueryRef } =
    useOutletContext();
  const [deleteModal, contextHolder] = Modal.useModal();
  const [searchFormRef] = Form.useForm();
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "POSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState("POCurrentPage", 1);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  //Mutations
  const [deletePO, { loading: deleteLoading }] = useMutation(
    DELETE_PURCHASE_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="purchaseOrder.deleted"
            defaultMessage="Purchase Order Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingPurchaseOrders = cache.readQuery({
          query: GET_PAGINATE_PURCHASE_ORDER,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.deletePurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_PURCHASE_ORDER,
          data: {
            paginatePurchaseOrder: {
              ...existingPurchaseOrders.paginatePurchaseOrder,
              edges: updatedPurchaseOrders,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [confirmPO, { loading: confirmLoading }] = useMutation(
    CONFIRM_PURCHASE_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="purchaseOrder.confirmed"
            defaultMessage="Purchase Order Confirmed"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingPurchaseOrders = cache.readQuery({
          query: GET_PAGINATE_PURCHASE_ORDER,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.confirmPurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_PURCHASE_ORDER,
          data: {
            paginatePurchaseOrder: {
              ...existingPurchaseOrders.paginatePurchaseOrder,
              edges: updatedPurchaseOrders,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [cancelPO, { loading: cancelLoading }] = useMutation(
    CANCEL_PURCHASE_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="purchaseOrder.cancelled"
            defaultMessage="Purchase Order Cancelled"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingPurchaseOrders = cache.readQuery({
          query: GET_PAGINATE_PURCHASE_ORDER,
        });
        const updatedPurchaseOrders =
          existingPurchaseOrders.paginatePurchaseOrder.edges.filter(
            ({ node }) => node.id !== data.cancelPurchaseOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_PURCHASE_ORDER,
          data: {
            paginatePurchaseOrder: {
              ...existingPurchaseOrders.paginatePurchaseOrder,
              edges: updatedPurchaseOrders,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const loading = deleteLoading || confirmLoading || cancelLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const parseData = (data) => {
    let purchaseOrders = [];
    data?.paginatePurchaseOrder?.edges.forEach(({ node }) => {
      if (node != null) {
        purchaseOrders.push({
          key: node.id,
          ...node,
          branchName: node.branch?.name,
          supplierName: node.supplier?.name,
          status: node.bills?.currentStatus,
        });
      }
    });
    return purchaseOrders ? purchaseOrders : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginatePurchaseOrder) {
      pageInfo = {
        hasNextPage: data.paginatePurchaseOrder.pageInfo.hasNextPage,
        endCursor: data.paginatePurchaseOrder.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const getStatusColor = (status) => {
    let color = "";

    if (status === "Draft") {
      color = "gray";
    } else if (status === "Closed") {
      color = "var(--primary-color)";
    } else {
      color = "var(--blue)";
    }

    return color;
  };

  const toggleContent = () => {
    setContentExpanded(!isContentExpanded);
    setCaretRotation(caretRotation === 0 ? 90 : 0);
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

  const handleConfirmPurchaseOrder = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.confirmPurchaseOrder"
          defaultMessage="Are you sure to confirm purchase order?"
        />
      ),
    });
    if (confirmed) {
      try {
        await confirmPO({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleCancelPurchaseOrder = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.cancelPurchaseOrder"
          defaultMessage="Are you sure to cancel purchase order?"
        />
      ),
    });
    if (confirmed) {
      try {
        await cancelPO({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    console.log(id);
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
        await deletePO({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    searchFormRef.setFieldsValue({
      supplierId: record.id,
      supplierName: record.name,
    });
  };

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);

    // clear the state from location.state
    navigate(location.pathname, {
      state: {
        ...location.state,
        POSearchCriteria: undefined,
      },
      replace: true,
    });
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },

    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: (
        <FormattedMessage
          id="label.purchaseOrderNumber"
          defaultMessage="Purchase Order #"
        />
      ),
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: (
        <FormattedMessage
          id="label.referenceNumber"
          defaultMessage="Reference #"
        />
      ),
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: (
        <FormattedMessage
          id="label.supplierName"
          defaultMessage="Supplier Name"
        />
      ),
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: <FormattedMessage id="label.status" defaultMessage="Status" />,
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (text) => (
        <span style={{ color: getStatusColor(text) }}>{text}</span>
      ),
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "orderTotalAmount",
      key: "orderTotalAmount",
      render: (text, record) => (
        <>
          {record.currency.symbol}{" "}
          <FormattedNumber
            value={text}
            style="decimal"
            minimumFractionDigits={record.currency.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="label.expectedDeliverDate"
          defaultMessage="Expected Delivery Date"
        />
      ),
      dataIndex: "expectedDeliveryDate",
      key: "expectedDeliveryDate",
      render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
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

  const compactColumns = [
    {
      title: "",
      dataIndex: "column",
      render: (text, record) => {
        return (
          <div>
            <div className="column-list-item">
              <span>{record.supplierName}</span>
              <span>
                {record.currency.symbol}{" "}
                <FormattedNumber
                  value={record.orderTotalAmount}
                  style="decimal"
                  minimumFractionDigits={record.currency.decimalPlaces}
                />
              </span>
            </div>
            <div className="column-list-item">
              <span>
                <span style={{ color: "var(--dark-green)" }}>
                  {record.orderNumber}
                </span>
                <Divider type="vertical" />
                {dayjs(record.orderDate).format(REPORT_DATE_FORMAT)}
              </span>
              <span
                style={{
                  color: getStatusColor(record.currentStatus),
                }}
              >
                {record.currentStatus}
              </span>
            </div>
            {/* {record.referenceNumber && (
              <div className="column-list-item">
                <span>
                  <span style={{ color: "gray" }}>
                    {record.referenceNumber}
                  </span>
                </span>
              </div>
            )} */}
          </div>
        );
      },
    },
  ];

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Purchase Order #"
            name="orderNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.orderDateRange"
                defaultMessage="Order Date Range"
              />
            }
            name="orderDateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startOrderDate: value && value[0],
                  endOrderDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields(["startOrderDate", "endOrderDate"])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startOrderDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endOrderDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item
            label="Status"
            name="currentStatus"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Select
              options={[
                {
                  value: "Draft",
                  label: "Draft",
                },
                {
                  value: "Confirmed",
                  label: "Confirmed",
                },
                {
                  value: "Closed",
                  label: "Closed",
                },
                {
                  value: "Cancelled",
                  label: "Cancelled",
                },
              ]}
            ></Select>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branchId"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Select showSearch optionFilterProp="label">
              {branches?.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.id}
                  label={branch.name}
                >
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col lg={12}>
          <Form.Item
            label="Reference #"
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.expectedDeliveryDateRange"
                defaultMessage="Expected Delivery Date Range"
              />
            }
            name="expectedDeliveryDateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startExpectedDeliveryDate: value && value[0],
                  endExpectedDeliveryDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields([
                  "startExpectedDeliveryDate",
                  "endExpectedDeliveryDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item
            noStyle
            hidden
            name="startExpectedDeliveryDate"
            shouldUpdate
          >
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endExpectedDeliveryDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.warehouse"
                defaultMessage="Warehouse"
              />
            }
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
            labelAlign="left"
            name="warehouseId"
          >
            <Select
              showSearch
              allowClear
              loading={loading}
              optionFilterProp="label"
            >
              {warehouses?.map((w) => (
                <Select.Option key={w.id} value={w.id} label={w.name}>
                  {w.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item noStyle hidden name="supplierId" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
            }
            name="supplierName"
            shouldUpdate
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input
              readOnly
              onClick={setSupplierSearchModalOpen}
              className="search-input"
              suffix={
                <>
                  {selectedSupplier && (
                    <CloseOutlined
                      style={{ height: 11, width: 11, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedSupplier(null);
                        searchFormRef.resetFields([
                          "supplierName",
                          "supplierId",
                        ]);
                      }}
                    />
                  )}

                  <Button
                    style={{ width: "2.5rem" }}
                    type="primary"
                    icon={<SearchOutlined />}
                    className="search-btn"
                    onClick={setSupplierSearchModalOpen}
                  />
                </>
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      <SupplierSearchModal
        modalOpen={supplierSearchModalOpen}
        setModalOpen={setSupplierSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <div className="page-header-text">
              <FormattedMessage
                id="label.purchaseOrders"
                defaultMessage="Purchase Orders"
              />
            </div>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate("new", {
                    state: {
                      ...location.state,
                      from: { pathname: location.pathname },
                      clonePO: null,
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
                {searchCriteria.orderNumber && (
                  <li>
                    Order Number contains <b>{searchCriteria.orderNumber}</b>
                  </li>
                )}
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {searchCriteria.startOrderDate &&
                  searchCriteria.endOrderDate && (
                    <li>
                      Order Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startOrderDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endOrderDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}{" "}
                {searchCriteria.startExpectedDeliveryDate &&
                  searchCriteria.endExpectedDeliveryDate && (
                    <li>
                      Expected Delivery Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startExpectedDeliveryDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endExpectedDeliveryDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}
                {searchCriteria.currentStatus && (
                  <li>
                    PO Status is <b>{searchCriteria.currentStatus}</b>
                  </li>
                )}
                {searchCriteria.warehouseId && (
                  <li>
                    Warehouse is{" "}
                    <b>
                      {
                        warehouses?.find(
                          (x) => x.id === searchCriteria.warehouseId
                        ).name
                      }
                    </b>
                  </li>
                )}
                {searchCriteria.branchId && (
                  <li>
                    Branch is{" "}
                    <b>
                      {
                        branches?.find((x) => x.id === searchCriteria.branchId)
                          .name
                      }
                    </b>
                  </li>
                )}
                {searchCriteria.supplierName && (
                  <li>
                    Supplier is <b>{searchCriteria.supplierName}</b>
                  </li>
                )}
              </SearchCriteriaDisplay>
            )}
            <PaginatedSelectionTable
              loading={loading}
              api={notiApi}
              columns={columns}
              compactColumns={compactColumns}
              gqlQuery={GET_PAGINATE_PURCHASE_ORDER}
              searchForm={searchForm}
              searchTitle={
                <FormattedMessage
                  id="purchaseOrder.search"
                  defaultMessage="Search Purchase Order"
                />
              }
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_PURCHASE_ORDER}
              parseData={parseData}
              parsePageInfo={parsePageInfo}
              showAddNew={true}
              searchModalOpen={searchModalOpen}
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
              setSearchModalOpen={setSearchModalOpen}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              setSelectedRowIndex={setSelectedRowIndex}
              selectedRowIndex={selectedRowIndex}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branchName}</span>
                <span>{selectedRecord.orderNumber}</span>
              </div>
              <div className="content-column-header-row-actions">
                <div>
                  <PaperClipOutlined />
                  <span>Attachment</span>
                </div>
                <div>
                  <Button
                    icon={<CloseOutlined />}
                    type="text"
                    onClick={() => {
                      setSelectedRecord(null);
                      setSelectedRowIndex(0);
                    }}
                  />
                </div>
              </div>
            </Row>
            <Row className="content-column-action-row">
              <div
                className="actions"
                onClick={() => handleEdit(selectedRecord, navigate, location)}
              >
                <EditOutlined />
                <FormattedMessage id="button.edit" defaultMessage="Edit" />
              </div>
              <Dropdown
                menu={{
                  items: [
                    {
                      icon: <FilePdfOutlined />,
                      key: "0",
                    },
                    {
                      icon: <PrinterOutlined />,
                      key: "1",
                    },
                  ],
                }}
                trigger={["click"]}
              >
                <div>
                  <FilePdfOutlined />
                  <FormattedMessage
                    id="button.pdf/print"
                    defaultMessage="PDF/Print"
                  />
                  <CaretDownFilled />
                </div>
              </Dropdown>

              <Dropdown
                menu={{
                  onClick: ({ key }) => {
                    if (key === "0") {
                      navigate("/purchaseOrders/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          clonePO: selectedRecord,
                        },
                      });
                    } else if (key === "1") {
                      navigate("/bills/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          convertPO: selectedRecord,
                        },
                      });
                    } else if (key === "2") {
                      //confirm PO
                      handleConfirmPurchaseOrder(selectedRecord.id);
                    } else if (key === "3") {
                      //cancel PO
                      handleCancelPurchaseOrder(selectedRecord.id);
                    } else if (key === "4") handleDelete(selectedRecord.id);
                  },
                  items:
                    selectedRecord.currentStatus === "Draft"
                      ? draftActionItems
                      : selectedRecord.currentStatus === "Confirmed"
                      ? confirmedActionItems
                      : selectedRecord.currentStatus === "Cancelled"
                      ? cancelledActionItems
                      : closedActionItems,
                }}
                trigger={["click"]}
              >
                <div style={{ fontSize: "1.1rem" }}>
                  <MoreOutlined />
                </div>
              </Dropdown>
            </Row>
            <div className="content-column-full-row">
              <div className="bill-receives-container">
                <div
                  className={`nav-bar ${!isContentExpanded && "collapsed"}`}
                  onClick={toggleContent}
                >
                  <ul className="nav-tabs">
                    <li
                      className={`nav-link ${
                        activeTab === "bill" && isContentExpanded && "active"
                      }`}
                      onClick={(event) => {
                        setActiveTab("bill");
                        isContentExpanded && event.stopPropagation();
                      }}
                    >
                      <span>Bill</span>
                      {selectedRecord?.bill?.id > 0 ? (
                        <span className="bill">1</span>
                      ) : null}
                    </li>
                    {/* <Divider type="vertical" className="tab-divider" />
                    <li
                      className={`nav-link ${
                        activeTab === "receives" &&
                        isContentExpanded &&
                        "active"
                      }`}
                      onClick={(event) => {
                        setActiveTab("receives");
                        isContentExpanded && event.stopPropagation();
                      }}
                    >
                      <span>Receives</span>
                    </li> */}
                  </ul>
                  <CaretRightFilled
                    style={{
                      transform: `rotate(${caretRotation}deg)`,
                      transition: "0.4s",
                    }}
                  />
                </div>

                <div
                  className={`content-wrapper ${isContentExpanded && "show"}`}
                >
                  {activeTab === "bill" && selectedRecord?.bill?.id > 0 ? (
                    <Table
                      className="bill-table"
                      columns={billTableColumns}
                      dataSource={[selectedRecord.bill]}
                      pagination={false}
                    />
                  ) : (
                    <div className="bill-tab">
                      <span>No bill yet!</span>
                    </div>
                  )}
                  {activeTab === "receives" && (
                    <div className="receive-tab">
                      <Space>
                        <span>No items have been received yet!</span>
                        <span>
                          <a>New Purchase Receive</a>
                        </span>
                      </Space>
                    </div>
                  )}
                </div>
              </div>
              <div className="toggle-pdf-view">
                <div>
                  <span>PO Status: </span>
                  <span
                    style={{
                      color: getStatusColor(selectedRecord.currentStatus),
                    }}
                  >
                    {selectedRecord.currentStatus}
                  </span>
                </div>
              </div>
              <PurchaseOrderTemplate selectedRecord={selectedRecord} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PurchaseOrders;
