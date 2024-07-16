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
  CommentOutlined,
  CaretRightFilled,
} from "@ant-design/icons";
import {
  AttachFiles,
  CommentColumn,
  CustomerSearchModal,
  PDFPreviewModal,
  PaginatedSelectionTable,
  SalesOrderTemplate,
  SearchCriteriaDisplay,
} from "../../components";
import { useHistoryState } from "../../utils/HelperFunctions";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { SalesOrderQueries, SalesOrderMutations } from "../../graphql";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useMutation, useReadQuery } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { SalesOrderPDF } from "../../components/pdfs-and-templates";
const { GET_PAGINATE_SALES_ORDER } = SalesOrderQueries;
const { CONFIRM_SALES_ORDER, CANCEL_SALES_ORDER, DELETE_SALES_ORDER } =
  SalesOrderMutations;

const draftActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.covertToInvoice"
        defaultMessage="Convert to Invoice"
      />
    ),
    key: "1",
  },
  {
    label: (
      <FormattedMessage
        id="button.confirmSalesOrder"
        defaultMessage="Confirm Sales Order"
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
        id="button.covertToInvoice"
        defaultMessage="Convert to Invoice"
      />
    ),
    key: "1",
  },
  {
    label: (
      <FormattedMessage
        id="button.cancelSalesOrder"
        defaultMessage="Cancel Sales Order"
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

const SalesOrders = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("bill");
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allWarehousesQueryRef,
    business,
  } = useOutletContext();
  const [deleteModal, contextHolder] = Modal.useModal();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "salesOrderSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "salesOrderCurrentPage",
    1
  );
  const [pdfModalOpen, setPDFModalOpen] = useState(false);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  //Mutations
  const [deleteSalesOrder, { loading: deleteLoading }] = useMutation(
    DELETE_SALES_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesOrder.deleted"
            defaultMessage="Sales Order Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingSalesOrders = cache.readQuery({
          query: GET_PAGINATE_SALES_ORDER,
        });
        const updatedSalesOrders =
          existingSalesOrders.paginateSalesOrder.edges.filter(
            ({ node }) => node.id !== data.deleteSalesOrder.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_SALES_ORDER,
          data: {
            paginateSalesOrder: {
              ...existingSalesOrders.paginateSalesOrder,
              edges: updatedSalesOrders,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [confirmSalesOrder, { loading: confirmLoading }] = useMutation(
    CONFIRM_SALES_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesOrder.confirmed"
            defaultMessage="Sales Order Confirmed"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // update(cache, { data }) {
      //   const existingSalesOrders = cache.readQuery({
      //     query: GET_PAGINATE_SALES_ORDER,
      //   });
      //   const updatedSalesOrders =
      //     existingSalesOrders.paginateSalesOrder?.edges?.filter(
      //       ({ node }) => node.id !== data.confirmSalesOrder.id
      //     );
      //   cache.writeQuery({
      //     query: GET_PAGINATE_SALES_ORDER,
      //     data: {
      //       paginateSalesOrder: {
      //         ...existingSalesOrders.paginateSalesOrder,
      //         edges: updatedSalesOrders,
      //       },
      //     },
      //   });
      // },
    }
  );

  const [cancelSalesOrder, { loading: cancelLoading }] = useMutation(
    CANCEL_SALES_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesOrder.cancelled"
            defaultMessage="Sales Order Cancelled"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // update(cache, { data }) {
      //   const existingSalesOrders = cache.readQuery({
      //     query: GET_PAGINATE_SALES_ORDER,
      //   });
      //   const updatedSalesOrders =
      //     existingSalesOrders.paginateSalesOrder.edges.filter(
      //       ({ node }) => node.id !== data.cancelSalesOrder.id
      //     );
      //   cache.writeQuery({
      //     query: GET_PAGINATE_SALES_ORDER,
      //     data: {
      //       paginateSalesOrder: {
      //         ...existingSalesOrders.paginateSalesOrder,
      //         edges: updatedSalesOrders,
      //       },
      //     },
      //   });
      // },
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
    let salesOrders = [];
    data?.paginateSalesOrder?.edges.forEach(({ node }) => {
      if (node != null) {
        salesOrders.push({
          key: node.id,
          ...node,
          branchName: node.branch?.name,
          customerName: node.customer?.name,
        });
      }
    });
    return salesOrders ? salesOrders : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateSalesOrder) {
      pageInfo = {
        hasNextPage: data.paginateSalesOrder.pageInfo.hasNextPage,
        endCursor: data.paginateSalesOrder.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const getStatusColor = (status) => {
    let color = "";

    if (status === "Draft" || status === "Cancelled") {
      color = "gray";
    } else if (status === "Closed") {
      color = "var(--dark-green)";
    } else {
      color = "var(--blue)";
    }

    return color;
  };

  const getInvoiceStatusColor = (status) => {
    let color = "";

    if (status === "Paid") {
      color = "var(--dark-green)";
    } else if (status === "Confirmed") {
      color = "var(--blue)";
    } else {
      color = "gray";
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

  const handleConfirmSalesOrder = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.confirmSalesOrder"
          defaultMessage="Are you sure to confirm sales order?"
        />
      ),
    });
    if (confirmed) {
      try {
        await confirmSalesOrder({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleCancelSalesOrder = async (id) => {
    console.log(id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.cancelSalesOrder"
          defaultMessage="Are you sure to cancel sales order?"
        />
      ),
    });
    if (confirmed) {
      try {
        await cancelSalesOrder({
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
        await deleteSalesOrder({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);
    setSelectedCustomer(null);
    // clear the state from location.state
    navigate(location.pathname, {
      state: {
        ...location.state,
        salesOrderSearchCriteria: undefined,
      },
      replace: true,
    });
  };

  const handleModalRowSelect = (record) => {
    setSelectedCustomer(record);
    searchFormRef.setFieldsValue({
      customerName: record.name,
      customerId: record.id,
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
          id="label.salesOrderNumber"
          defaultMessage="Sales Order #"
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
          id="label.customerName"
          defaultMessage="Customer Name"
        />
      ),
      dataIndex: "customerName",
      key: "customerName",
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
          id="label.expectedShipmentDate"
          defaultMessage="Expected Shipment Date"
        />
      ),
      dataIndex: "expectedShipmenDate",
      key: "expectedShipmenDate",
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
              <span>{record.customerName}</span>
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

  const billTableColumns = [
    {
      title: "Invoice#",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (text, record) => (
        <span style={{ color: getInvoiceStatusColor(text) }}>
          {record.currentStatus}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "invoiceDueDate",
      key: "invoiceDueDate",
      render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Amount",
      dataIndex: "invoiceTotalAmount",
      key: "invoiceTotalAmount",
      align: "right",
      render: (_, record) => (
        <>
          {record?.currency?.symbol}{" "}
          <FormattedNumber
            value={record?.invoiceTotalAmount || 0}
            style="decimal"
            minimumFractionDigits={record?.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: "Remaining Balance",
      dataIndex: "balanceDue",
      key: "balanceDue",
      align: "right",
      render: (_, record) => (
        <>
          {record?.currency?.symbol}{" "}
          <FormattedNumber
            value={record.remainingBalance}
            style="decimal"
            minimumFractionDigits={record?.currency?.decimalPlaces}
          />
        </>
      ),
    },
  ];

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Sales Order #"
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
                id="label.expectedShipmentDateRange"
                defaultMessage="Expected Shipment Date Range"
              />
            }
            name="expectedShipmentDateRange"
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
                  "startExpectedShipmentDate",
                  "endExpectedShipmentDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item
            noStyle
            hidden
            name="startExpectedShipmentDate"
            shouldUpdate
          >
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endExpectedShipmentDate" shouldUpdate>
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
          <Form.Item noStyle hidden name="customerId" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.customer" defaultMessage="Customer" />
            }
            name="customerName"
            shouldUpdate
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input
              readOnly
              onClick={setCustomerSearchModalOpen}
              className="search-input"
              suffix={
                <>
                  {selectedCustomer && (
                    <CloseOutlined
                      style={{ height: 11, width: 11, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedCustomer(null);
                        searchFormRef.resetFields([
                          "customerName",
                          "customerId",
                        ]);
                      }}
                    />
                  )}

                  <Button
                    style={{ width: "2.5rem" }}
                    type="primary"
                    icon={<SearchOutlined />}
                    className="search-btn"
                    onClick={setCustomerSearchModalOpen}
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
      <CustomerSearchModal
        modalOpen={customerSearchModalOpen}
        setModalOpen={setCustomerSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />
      <PDFPreviewModal modalOpen={pdfModalOpen} setModalOpen={setPDFModalOpen}>
        <SalesOrderPDF selectedRecord={selectedRecord} business={business} />
      </PDFPreviewModal>
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <div className="page-header-text">
              <FormattedMessage
                id="label.salesOrders"
                defaultMessage="Sales Orders"
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
                      cloneSO: null,
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
                      Expected Shipment Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startExpectedShipmentDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endExpectedShipmentDate).format(
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
                {searchCriteria.customerName && (
                  <li>
                    Customer is <b>{searchCriteria.customerName}</b>
                  </li>
                )}
              </SearchCriteriaDisplay>
            )}
            <PaginatedSelectionTable
              loading={loading}
              api={notiApi}
              columns={columns}
              compactColumns={compactColumns}
              gqlQuery={GET_PAGINATE_SALES_ORDER}
              showSearch={false}
              searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_SALES_ORDER}
              parseData={parseData}
              parsePageInfo={parsePageInfo}
              showAddNew={true}
              searchModalOpen={searchModalOpen}
              setSearchModalOpen={setSearchModalOpen}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              setSelectedRowIndex={setSelectedRowIndex}
              selectedRowIndex={selectedRowIndex}
              setCreateModalOpen={setSearchModalOpen}
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
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
                <AttachFiles
                  files={selectedRecord?.documents}
                  key={selectedRecord?.key}
                />
                <div style={{ borderRight: "1px solid var(--border-color)" }}>
                  <Button
                    type="text"
                    icon={<CommentOutlined />}
                    onClick={setCmtColumnOpen}
                  >
                    <span>
                      <FormattedMessage
                        id="button.commentsAndHistory"
                        defaultMessage="Comments & History"
                      />
                    </span>
                  </Button>
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
              <div onClick={() => setPDFModalOpen(true)}>
                <FilePdfOutlined />
                <FormattedMessage
                  id="button.pdf/print"
                  defaultMessage="PDF/Print"
                />
              </div>

              <Dropdown
                menu={{
                  onClick: ({ key }) => {
                    if (key === "0") {
                      navigate("/salesOrders/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          cloneSO: selectedRecord,
                        },
                      });
                    } else if (key === "1") {
                      navigate("/invoices/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          convertSO: selectedRecord,
                        },
                      });
                    } else if (key === "2") {
                      //confirm SO
                      handleConfirmSalesOrder(selectedRecord.id);
                    } else if (key === "3") {
                      //cancel PO
                      handleCancelSalesOrder(selectedRecord.id);
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
                      <span>Invoice</span>
                      {selectedRecord?.salesInvoice?.id > 0 ? (
                        <span className="bill">1</span>
                      ) : null}
                    </li>
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
                  {activeTab === "bill" &&
                  selectedRecord?.salesInvoice?.id > 0 ? (
                    <div className="bill-tab">
                      <Table
                        className="bill-table"
                        columns={billTableColumns}
                        dataSource={[selectedRecord.salesInvoice]}
                        pagination={false}
                      />
                    </div>
                  ) : (
                    <div className="bill-tab">
                      <span>No invoice yet!</span>
                    </div>
                  )}
                  {activeTab === "receives" && (
                    <div className="receive-tab">
                      <Space>
                        <span>No items invoice yet!</span>
                        <span>
                          <a>New Sales Receive</a>
                        </span>
                      </Space>
                    </div>
                  )}
                </div>
              </div>
              <div className="toggle-pdf-view">
                <div>
                  <span>SO Status: </span>
                  <span
                    style={{
                      color: getStatusColor(selectedRecord.currentStatus),
                    }}
                  >
                    {selectedRecord.currentStatus}
                  </span>
                </div>
              </div>
              <SalesOrderTemplate selectedRecord={selectedRecord} />
            </div>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="sales_orders"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SalesOrders;
