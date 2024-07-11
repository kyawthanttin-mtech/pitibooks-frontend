/* eslint-disable react/style-prop-object */
import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Space,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Modal,
  Form,
  Dropdown,
  Divider,
  Flex,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  FilePdfOutlined,
  CommentOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import RecordInvoicePayment from "./RecordInvoicePayment";
import { ReactComponent as ArrowEllipseFilled } from "../../assets/icons/ArrowEllipseFilled.svg";
import {
  InvoiceTemplate,
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
  CustomerSearchModal,
  AttachFiles,
  PDFPreviewModal,
  InvoicePDF,
  CommentColumn,
  AccordionTabs,
} from "../../components";
import { useNavigate, useLocation } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useReadQuery, useQuery, useMutation } from "@apollo/client";
import { useHistoryState } from "../../utils/HelperFunctions";
import {
  InvoiceMutations,
  InvoiceQueries,
  CustomerMutations,
} from "../../graphql";
import InvoiceApplyCreditModal from "./InvoiceApplyCreditModal";
const { GET_PAGINATE_INVOICE } = InvoiceQueries;
const { DELETE_INVOICE, CONFIRM_INVOICE, VOID_INVOICE } = InvoiceMutations;
const { DELETE_CUSTOMER_CREDIT_INVOICE } = CustomerMutations;

const draftActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.confirmInvoice"
        defaultMessage="Confirm Invoice"
      />
    ),
    key: "1",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "5",
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
        id="button.recordPayment"
        defaultMessage="Record Payment"
      />
    ),
    key: "2",
  },
  {
    label: (
      <FormattedMessage
        id="button.applyCredits"
        defaultMessage="Apply Credits"
      />
    ),
    key: "3",
  },
  {
    label: (
      <FormattedMessage id="button.voidInvoice" defaultMessage="Void Invoice" />
    ),
    key: "4",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "5",
  },
];

const voidActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "5",
  },
];

const partialPaidActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.recordPayment"
        defaultMessage="Record Payment"
      />
    ),
    key: "2",
  },
  {
    label: (
      <FormattedMessage
        id="button.applyCredits"
        defaultMessage="Apply Credits"
      />
    ),
    key: "3",
  },
];

const paidActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
];

const Invoices = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allWarehousesQueryRef,
    business,
  } = useOutletContext();
  const navigate = useNavigate();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "invoiceSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "invoiceCurrentPage",
    1
  );
  const [showRecordInvoicePaymentForm, setShowRecordInvoicePaymentForm] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [pdfModalOpen, setPDFModalOpen] = useState(false);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_PAGINATE_INVOICE, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    // variables: {
    //   limit: 1,
    // },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  //Mutations
  const [deleteInvoice, { loading: deleteLoading }] = useMutation(
    DELETE_INVOICE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="invoice.deleted"
            defaultMessage="Invoice Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingInvoices = cache.readQuery({
          query: GET_PAGINATE_INVOICE,
        });
        const updatedInvoices =
          existingInvoices.paginateSalesInvoice.edges.filter(
            ({ node }) => node.id !== data.deleteSalesInvoice.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_INVOICE,
          data: {
            paginateSalesInvoice: {
              ...existingInvoices.paginateSalesInvoice,
              edges: updatedInvoices,
            },
          },
        });
      },
    }
  );

  const [confirmInvoice, { loading: confirmLoading }] = useMutation(
    CONFIRM_INVOICE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="invoice.confirmed"
            defaultMessage="Invoice Confirmed"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingInvoices = cache.readQuery({
          query: GET_PAGINATE_INVOICE,
        });
        const updatedInvoices =
          existingInvoices.paginateSalesInvoice.edges.filter(
            ({ node }) => node.id !== data.confirmSalesInvoice.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_INVOICE,
          data: {
            paginateSalesInvoice: {
              ...existingInvoices.paginateSalesInvoice,
              edges: updatedInvoices,
            },
          },
        });
      },
    }
  );

  const [voidInvoice, { loading: voidLoading }] = useMutation(VOID_INVOICE, {
    onCompleted() {
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="invoice.voided" defaultMessage="Invoice Voided" />
      );
      setSelectedRecord(null);
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    update(cache, { data }) {
      const existingInvoices = cache.readQuery({
        query: GET_PAGINATE_INVOICE,
      });
      const updatedInvoices =
        existingInvoices.paginateSalesInvoice.edges.filter(
          ({ node }) => node.id !== data.voidSalesInvoice.id
        );
      cache.writeQuery({
        query: GET_PAGINATE_INVOICE,
        data: {
          paginateSalesInvoice: {
            ...existingInvoices.paginateSalesInvoice,
            edges: updatedInvoices,
          },
        },
      });
    },
  });

  const [deleteAppliedCredit, { loading: deleteAppliedCreditLoading }] =
    useMutation(DELETE_CUSTOMER_CREDIT_INVOICE, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="appliedCredit.deleted"
            defaultMessage="Applied Credit Deleted"
          />
        );
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    });

  const loading =
    queryLoading || deleteLoading || confirmLoading || voidLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const invoiceTotalSummary = useMemo(() => {
    return data?.paginateSalesInvoice?.invoiceTotalSummary;
  }, [data]);

  useEffect(() => {
    if (selectedRecord && selectedRowIndex) {
      setShowRecordInvoicePaymentForm(false);
    }
  }, [selectedRecord, selectedRowIndex]);

  const parseData = (data) => {
    let invoices = [];
    data?.paginateSalesInvoice?.edges.forEach(({ node }) => {
      invoices.push({
        key: node.id,
        ...node,
        branchName: node.branch?.name,
        customerName: node.customer?.name,
        status: node.currentStatus,
      });
    });
    return invoices ? invoices : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateSalesInvoice) {
      pageInfo = {
        hasNextPage: data.paginateSalesInvoice.pageInfo.hasNextPage,
        endCursor: data.paginateSalesInvoice.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const getStatusColor = (status) => {
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

  const handleConfirmInvoice = async (id) => {
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.confirmInvoice"
          defaultMessage="Are you sure to confirm invoice?"
        />
      ),
    });
    console.log(id);
    if (confirmed) {
      try {
        await confirmInvoice({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleVoidInvoice = async (id) => {
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.voidInvoice"
          defaultMessage="Are you sure to void invoice?"
        />
      ),
    });
    if (confirmed) {
      try {
        await voidInvoice({
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
        await deleteInvoice({
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
    setCurrentPage(1);
    setSelectedCustomer(null);

    // clear the state from location.state
    navigate(location.pathname, {
      state: {
        ...location.state,
        invoiceSearchCriteria: undefined,
      },
      replace: true,
    });
  };

  const handleModalRowSelect = (record) => {
    setSelectedCustomer(record);
    searchFormRef.setFieldsValue({
      customerId: record.id,
      customerName: record.name,
    });
  };

  const handleDeleteAppliedCredit = async (id) => {
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
        await deleteAppliedCredit({
          variables: {
            id: id,
          },
          update: (cache) => {
            const existingData = cache.readQuery({
              query: GET_PAGINATE_INVOICE,
            });

            if (existingData) {
              const newEdges = existingData.paginateSalesInvoice.edges.map(
                (edge) => {
                  if (edge.node.appliedCustomerCredits) {
                    return {
                      ...edge,
                      node: {
                        ...edge.node,
                        appliedCustomerCredits:
                          edge.node.appliedCustomerCredits.filter(
                            (credit) => credit.id !== id
                          ),
                      },
                    };
                  }
                  return edge;
                }
              );

              cache.writeQuery({
                query: GET_PAGINATE_INVOICE,
                data: {
                  paginateSalesInvoice: {
                    ...existingData.paginateSalesInvoice,
                    edges: newEdges,
                  },
                },
              });

              // Update selectedRecord state
              if (selectedRecord && selectedRecord.appliedCustomerCredits) {
                const updatedSelectedRecord = {
                  ...selectedRecord,
                  appliedCustomerCredits:
                    selectedRecord.appliedCustomerCredits.filter(
                      (credit) => credit.id !== id
                    ),
                };

                setSelectedRecord(updatedSelectedRecord);
              }
            }
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

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
                  value={record.remainingAmount}
                  style="decimal"
                  minimumFractionDigits={record.currency.decimalPlaces}
                />
              </span>
            </div>
            <div className="column-list-item">
              <span>
                <span style={{ color: "var(--dark-green)" }}>
                  {record.invoiceNumber}
                </span>
                <Divider type="vertical" />
                {dayjs(record.invoiceDate).format(REPORT_DATE_FORMAT)}
              </span>

              <span style={{ color: getStatusColor(record.status) }}>
                {record.status}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const columns = [
    {
      title: "Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Reference Number",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (text) => {
        return <span style={{ color: getStatusColor(text) }}>{text}</span>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "invoiceDueDate",
      key: "invoiceDueDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Amount",
      dataIndex: "invoiceTotalAmount",
      key: "invoiceTotalAmount",
      render: (text, record) => (
        <>
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={text}
            style="decimal"
            minimumFractionDigits={record.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: "Balance Due",
      dataIndex: "balanceDue",
      key: "remainingBalance",
      render: (text, record) => (
        <>
          {record.currency.symbol}{" "}
          <FormattedNumber
            value={record.remainingBalance}
            style="decimal"
            minimumFractionDigits={record.currency.decimalPlaces}
          />
        </>
      ),
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

  const paymentReceivedColumns = [
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Payment #",
      dataIndex: "paymentNumber",
      key: "paymentNumber",
    },
    {
      title: "Reference #",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={record.amount || 0}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
          />
        </>
      ),
    },
  ];

  const salesOrderColumns = [
    {
      title: "Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Payment Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
    },
  ];

  const appliedCreditColumns = [
    {
      title: "Date",
      dataIndex: "creditDate",
      key: "creditDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Customer Credit#",
      dataIndex: "customerCreditNumber",
      key: "customerCreditNumber",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) => (
        <>
          {record?.currency?.symbol}{" "}
          <FormattedNumber
            value={record.amount || 0}
            style="decimal"
            minimumFractionDigits={record?.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <span>
          <DeleteOutlined
            className="delete-icon"
            onClick={() => handleDeleteAppliedCredit(record.id)}
          />
        </span>
      ),
    },
  ];

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Invoice #"
            name="invoiceNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.invoiceDateRange"
                defaultMessage="Invoice Date Range"
              />
            }
            name="invoiceDateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startInvoiceDate: value && value[0],
                  endInvoiceDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields([
                  "startInvoiceDate",
                  "endInvoiceDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startInvoiceDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endInvoiceDate" shouldUpdate>
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
                  value: "Sent",
                  label: "Sent",
                },
                {
                  value: "Partial Paid",
                  label: "Partial Paid",
                },
                {
                  value: "Paid",
                  label: "Paid",
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
                id="label.dueDateRange"
                defaultMessage="Due Date Range"
              />
            }
            name="dueDateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startInvoiceDueDate: value && value[0],
                  endInvoiceDueDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields([
                  "startInvoiceDueDate",
                  "endInvoiceDueDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startInvoiceDueDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endInvoiceDueDate" shouldUpdate>
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
            <Select showSearch allowClear optionFilterProp="label">
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
      <InvoiceApplyCreditModal
        modalOpen={creditModalOpen}
        setModalOpen={setCreditModalOpen}
        selectedRecord={selectedRecord}
        setSelectedRecord={setSelectedRecord}
        refetch={() => {
          refetch();
          setCurrentPage(1);
          setSelectedRecord(null);
          setSelectedRowIndex(null);
        }}
      />
      <PDFPreviewModal modalOpen={pdfModalOpen} setModalOpen={setPDFModalOpen}>
        <InvoicePDF selectedRecord={selectedRecord} business={business} />
      </PDFPreviewModal>
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header">
            <p className="page-header-text">
              <FormattedMessage id="label.invoices" defaultMessage="Invoices" />
            </p>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate("new", {
                    state: {
                      ...location.state,
                      from: { pathname: location.pathname },
                      cloneInvoice: null,
                      convertSO: null,
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
            {!selectedRecord && (
              <Row gutter={16} style={{ padding: "1.5rem 1rem", margin: 0 }}>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(89, 166, 53, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <ArrowEllipseFilled
                      style={{
                        transform: "rotate(180deg)",
                        minHeight: 35,
                        minWidth: 35,
                      }}
                    />
                    <Statistic
                      title="Total Outstanding Receivables"
                      value={invoiceTotalSummary?.totalOutstandingReceivable}
                      precision={business?.baseCurrency?.decimalPlaces}
                      prefix={business?.baseCurrency?.symbol}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(255, 176, 1, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic
                      title="Due Today"
                      value={invoiceTotalSummary?.dueToday}
                      precision={business?.baseCurrency?.decimalPlaces}
                      prefix={business?.baseCurrency?.symbol}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(64, 141, 251, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic
                      title="Due Within 30 Days"
                      value={invoiceTotalSummary?.dueWithin30Days}
                      precision={business?.baseCurrency?.decimalPlaces}
                      prefix={business?.baseCurrency?.symbol}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(247, 104, 49, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic
                      title="Total Overdue"
                      value={invoiceTotalSummary?.totalOverdue}
                      precision={business?.baseCurrency?.decimalPlaces}
                      prefix={business?.baseCurrency?.symbol}
                    />
                  </Card>
                </Col>
              </Row>
            )}
            {searchCriteria && (
              <SearchCriteriaDisplay
                searchCriteria={searchCriteria}
                handleModalClear={handleModalClear}
              >
                {searchCriteria.invoiceNumber && (
                  <li>
                    Invoice Number contains{" "}
                    <b>{searchCriteria.invoiceNumber}</b>
                  </li>
                )}
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {searchCriteria.startInvoiceDate &&
                  searchCriteria.endInvoiceDate && (
                    <li>
                      Invoice Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startInvoiceDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endInvoiceDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}{" "}
                {searchCriteria.startInvoiceDueDate &&
                  searchCriteria.endInvoiceDueDate && (
                    <li>
                      Due Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startInvoiceDueDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endInvoiceDueDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}
                {searchCriteria.currentStatus && (
                  <li>
                    Invoice Status is <b>{searchCriteria.currentStatus}</b>
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
              gqlQuery={GET_PAGINATE_INVOICE}
              searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_INVOICE}
              searchTitle={
                <FormattedMessage
                  id="invoice.search"
                  defaultMessage="Search Invoices"
                />
              }
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
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
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
        {selectedRecord && !showRecordInvoicePaymentForm && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branchName}</span>
                <span>{selectedRecord.invoiceNumber}</span>
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
                className={`actions ${
                  selectedRecord?.invoiceNumber ===
                    "Customer Opening Balance" && "disable"
                }`}
                onClick={() =>
                  selectedRecord?.invoiceNumber !==
                    "Customer Opening Balance" &&
                  handleEdit(selectedRecord, navigate, location)
                }
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
                      navigate("/invoices/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          cloneInvoice: selectedRecord,
                          convertSO: null,
                        },
                      });
                    } else if (key === "1") {
                      // confirm invoice
                      handleConfirmInvoice(selectedRecord.id);
                    } else if (key === "2") {
                      // record payment
                      setShowRecordInvoicePaymentForm(true);
                    } else if (key === "3") {
                      // apply credits
                      setCreditModalOpen(true);
                    } else if (key === "4") {
                      // void invoice
                      handleVoidInvoice(selectedRecord.id);
                    } else if (key === "5") {
                      // delete invoice
                      handleDelete(selectedRecord.id);
                    }
                  },
                  items:
                    selectedRecord.currentStatus === "Draft"
                      ? draftActionItems
                      : selectedRecord.currentStatus === "Confirmed"
                      ? confirmedActionItems
                      : selectedRecord.currentStatus === "Void"
                      ? voidActionItems
                      : selectedRecord.currentStatus === "Partial Paid"
                      ? partialPaidActionItems
                      : paidActionItems,
                }}
                trigger={["click"]}
              >
                <div style={{ fontSize: "1.1rem" }}>
                  <MoreOutlined />
                </div>
              </Dropdown>
            </Row>
            <div className="content-column-full-row">
              {/* <div
                className="bill-receives-container"
                style={{ padding: "1.2rem 1rem " }}
              >
                <span>
                  Credits Available:{" "}
                  <b>
                    {selectedRecord.currency.symbol}{" "}
                    <FormattedNumber
                      value={selectedRecord.customer?.unusedCreditAmount}
                      style="decimal"
                      minimumFractionDigits={
                        selectedRecord.currency.decimalPlaces
                      }
                    />
                  </b>
                </span>
                <Divider style={{ marginBlock: "1rem" }} />
                <Flex justify="space-between" align="center">
                  <Flex vertical gap="0.5rem">
                    <b>Record Payment</b>
                    <span style={{ fontSize: "var(--small-text)" }}>
                      Apply available credits or record the payment for invoice
                      if paid already.
                    </span>
                  </Flex>
                  <Space>
                    <Button
                      type="primary"
                      onClick={setShowRecordInvoicePaymentForm}
                    >
                      Record Payment
                    </Button>
                    <Button onClick={setCreditModalOpen}>Apply Credits</Button>
                  </Space>
                </Flex>
              </div>
              <br /> */}
              {(selectedRecord.status === "Paid" ||
                selectedRecord.status === "Partial Paid") && (
                <AccordionTabs
                  key="invoiceAccordion"
                  tabs={[
                    {
                      key: "invoice",
                      title: "Payments Received",
                      data: selectedRecord?.invoicePayment,
                      content: (
                        <Table
                          className="bill-table"
                          columns={paymentReceivedColumns}
                          dataSource={selectedRecord?.invoicePayment}
                          pagination={false}
                        />
                      ),
                    },
                    {
                      key: "salesOrders",
                      title: "Sales Orders",
                      data: selectedRecord?.salesOrder,
                      content: (
                        <Table
                          className="bill-table"
                          columns={salesOrderColumns}
                          dataSource={[selectedRecord?.salesOrder]}
                          pagination={false}
                        />
                      ),
                    },
                    {
                      key: "creditsApplied",
                      title: "Credits Applied",
                      data: selectedRecord?.appliedCustomerCredits,
                      content: (
                        <Table
                          loading={deleteAppliedCreditLoading}
                          className="bill-table"
                          columns={appliedCreditColumns}
                          dataSource={selectedRecord?.appliedCustomerCredits}
                          pagination={false}
                        />
                      ),
                    },
                  ]}
                />
              )}
              <InvoiceTemplate selectedRecord={selectedRecord} />
            </div>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="sales_invoices"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}
        {showRecordInvoicePaymentForm && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <p className="page-header-text">
                Payment For
                {selectedRecord.invoiceNumber &&
                  ` - ${selectedRecord.invoiceNumber}`}
              </p>
            </Row>
            <RecordInvoicePayment
              refetch={() => {
                refetch();
                setCurrentPage(1);
                setSelectedRecord(null);
              }}
              branches={branches}
              selectedRecord={selectedRecord}
              onClose={() => setShowRecordInvoicePaymentForm(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Invoices;
