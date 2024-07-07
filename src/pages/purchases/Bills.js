/* eslint-disable react/style-prop-object */
import React, { useState, useMemo } from "react";
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
  CloseOutlined,
  EditOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import RecordBillPayment from "./RecordBillPayment";
import { ReactComponent as ArrowEllipseFilled } from "../../assets/icons/ArrowEllipseFilled.svg";
import {
  AccordionTabs,
  AttachFiles,
  CommentColumn,
  PDFPreviewModal,
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
  SupplierSearchModal,
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
import { BillTemplate } from "../../components";
import { useMutation, useReadQuery, useQuery } from "@apollo/client";
import { useHistoryState } from "../../utils/HelperFunctions";
import { BillQueries, BillMutations } from "../../graphql";
import ApplyCreditModal from "./ApplyCreditModal";
import { BillPDF } from "../../components/pdfs-and-templates";

const { GET_PAGINATE_BILL } = BillQueries;
const { CONFIRM_BILL, DELETE_BILL, VOID_BILL } = BillMutations;

const draftActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage id="button.confirmBill" defaultMessage="Confirm Bill" />
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
    label: <FormattedMessage id="button.voidBill" defaultMessage="Void Bill" />,
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

const paidActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
];

const Bills = () => {
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
  const [activeTab, setActiveTab] = useState("bill");
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "billSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState("billCurrentPage", 1);
  const [showRecordBillPaymentForm, setShowRecordBillPaymentForm] =
    useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [pdfModalOpen, setPDFModalOpen] = useState(false);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_PAGINATE_BILL, {
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
  const [deleteBill, { loading: deleteLoading }] = useMutation(DELETE_BILL, {
    onCompleted() {
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="bill.deleted" defaultMessage="Bill Deleted" />
      );
      setSelectedRecord(null);
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    update(cache, { data }) {
      const existingBills = cache.readQuery({
        query: GET_PAGINATE_BILL,
      });
      const updatedBills = existingBills.paginateBill.edges.filter(
        ({ node }) => node.id !== data.deleteBill.id
      );
      cache.writeQuery({
        query: GET_PAGINATE_BILL,
        data: {
          paginateBill: {
            ...existingBills.paginateBill,
            edges: updatedBills,
          },
        },
      });
    },
  });

  const [confirmBill, { loading: confirmLoading }] = useMutation(CONFIRM_BILL, {
    onCompleted() {
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="bill.confirmed" defaultMessage="Bill Confirmed" />
      );
      setSelectedRecord(null);
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    update(cache, { data }) {
      const existingBills = cache.readQuery({
        query: GET_PAGINATE_BILL,
      });
      const updatedBills = existingBills.paginateBill.edges.filter(
        ({ node }) => node.id !== data.confirmBill.id
      );
      cache.writeQuery({
        query: GET_PAGINATE_BILL,
        data: {
          paginateBill: {
            ...existingBills.paginateBill,
            edges: updatedBills,
          },
        },
      });
    },
  });

  const [voidBill, { loading: voidLoading }] = useMutation(VOID_BILL, {
    onCompleted() {
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="bill.voided" defaultMessage="Bill Voided" />
      );
      setSelectedRecord(null);
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    update(cache, { data }) {
      const existingBills = cache.readQuery({
        query: GET_PAGINATE_BILL,
      });
      const updatedBills = existingBills.paginateBill.edges.filter(
        ({ node }) => node.id !== data.voidBill.id
      );
      cache.writeQuery({
        query: GET_PAGINATE_BILL,
        data: {
          paginateBill: {
            ...existingBills.paginateBill,
            edges: updatedBills,
          },
        },
      });
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

  const billTotalSummary = useMemo(() => {
    return data?.paginateBill?.billTotalSummary;
  }, [data]);

  const parseData = (data) => {
    let bills = [];
    data?.paginateBill?.edges.forEach(({ node }) => {
      if (node != null) {
        // let status = "";
        // const currentDate = dayjs();
        // const dueDate = dayjs(node.billDueDate);
        // const totalPaidAmount = node.billTotalPaidAmount;
        // const totalAmount = node.billTotalAmount;

        // if (totalPaidAmount < totalAmount) {
        //   const daysLeft = dueDate.diff(currentDate, "day");
        //   status =
        //     daysLeft > 0
        //       ? `Overdue By ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
        //       : "Overdue";
        // } else if (totalPaidAmount === totalAmount) {
        //   status = "Paid";
        // }

        bills.push({
          key: node.id,
          ...node,
          branchName: node.branch?.name,
          supplierName: node.supplier?.name,
          status: node.currentStatus,
        });
      }
    });
    return bills ? bills : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateBill) {
      pageInfo = {
        hasNextPage: data.paginateBill.pageInfo.hasNextPage,
        endCursor: data.paginateBill.pageInfo.endCursor,
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

  const handleConfirmBill = async (id) => {
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.confirmBill"
          defaultMessage="Are you sure to confirm bill?"
        />
      ),
    });
    console.log(id);
    if (confirmed) {
      try {
        await confirmBill({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleVoidBill = async (id) => {
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.voidBill"
          defaultMessage="Are you sure to void bill?"
        />
      ),
    });
    if (confirmed) {
      try {
        await voidBill({
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
        await deleteBill({
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
    setSelectedSupplier(null);

    // clear the state from location.state
    navigate(location.pathname, {
      state: {
        ...location.state,
        billSearchCriteria: undefined,
      },
      replace: true,
    });
  };

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    searchFormRef.setFieldsValue({
      supplierId: record.id,
      supplierName: record.name,
    });
  };

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
                  value={record.billTotalAmount}
                  style="decimal"
                  minimumFractionDigits={record.currency.decimalPlaces}
                />
              </span>
            </div>
            <div className="column-list-item">
              <span>
                <span style={{ color: "var(--dark-green)" }}>
                  {record.billNumber}
                </span>
                <Divider type="vertical" />
                {dayjs(record.billDate).format(REPORT_DATE_FORMAT)}
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
      dataIndex: "billDate",
      key: "billDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Bill#",
      dataIndex: "billNumber",
      key: "billNumber",
    },
    {
      title: "Reference Number",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: "Supplier",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        return <span style={{ color: getStatusColor(text) }}>{text}</span>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "billDueDate",
      key: "billDueDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Amount",
      dataIndex: "billTotalAmount",
      key: "billTotalAmount",
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
      title: "Balance Due",
      dataIndex: "balanceDue",
      key: "billTotalPaidAmount",
      render: (text, record) => (
        <>
          {record.currency.symbol}{" "}
          <FormattedNumber
            value={record.billTotalAmount - record.billTotalPaidAmount}
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

  const paymentMadeColumns = [
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

  const purchaseOrderColumns = [
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
      title: "Supplier Credit#",
      dataIndex: "supplierCreditNumber",
      key: "supplierCreditNumber",
    },
    {
      title: "Amount",
      dataIndex: "amountCredited",
      key: "amountCredited",
      render: (_, record) => (
        <>
          {selectedRecord?.currency?.symbol}{" "}
          <FormattedNumber
            value={record.amountCredited || 0}
            style="decimal"
            minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
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
            label="Bill #"
            name="billNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.billDateRange"
                defaultMessage="Bill Date Range"
              />
            }
            name="billDateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startBillDate: value && value[0],
                  endBillDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields(["startBillDate", "endBillDate"])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startBillDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endBillDate" shouldUpdate>
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
                  startBillDueDate: value && value[0],
                  endBillDueDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields([
                  "startBillDueDate",
                  "endBillDueDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startBillDueDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endBillDueDate" shouldUpdate>
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
      <ApplyCreditModal
        modalOpen={creditModalOpen}
        setModalOpen={setCreditModalOpen}
        selectedRecord={selectedRecord}
      />
      <PDFPreviewModal modalOpen={pdfModalOpen} setModalOpen={setPDFModalOpen}>
        <BillPDF selectedRecord={selectedRecord} business={business} />
      </PDFPreviewModal>
      {contextHolder}
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header">
            <p className="page-header-text">
              <FormattedMessage id="label.bills" defaultMessage="Bills" />
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
                      cloneBill: null,
                      convertPO: null,
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
                    <ArrowEllipseFilled />
                    <Statistic
                      title="Total Outstanding Payables"
                      value={billTotalSummary?.totalOutstandingPayable}
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
                      value={billTotalSummary?.dueToday}
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
                      value={billTotalSummary?.dueWithin30Days}
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
                      title="Overdue Bills"
                      value={billTotalSummary?.totalOverdue}
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
                {searchCriteria.billNumber && (
                  <li>
                    Bill Number contains <b>{searchCriteria.billNumber}</b>
                  </li>
                )}
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {searchCriteria.startBillDate && searchCriteria.endBillDate && (
                  <li>
                    Bill Date between{" "}
                    <b>
                      {dayjs(searchCriteria.startBillDate).format(
                        REPORT_DATE_FORMAT
                      )}{" "}
                      and{" "}
                      {dayjs(searchCriteria.endBillDate).format(
                        REPORT_DATE_FORMAT
                      )}
                    </b>
                  </li>
                )}{" "}
                {searchCriteria.startBillDueDate &&
                  searchCriteria.endBillDueDate && (
                    <li>
                      Due Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startBillDueDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endBillDueDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}
                {searchCriteria.currentStatus && (
                  <li>
                    Bill Status is <b>{searchCriteria.currentStatus}</b>
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
              gqlQuery={GET_PAGINATE_BILL}
              searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_BILL}
              searchTitle={
                <FormattedMessage
                  id="bill.search"
                  defaultMessage="Search Bills"
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
        {selectedRecord && !showRecordBillPaymentForm && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branchName}</span>
                <span>{selectedRecord.billNumber}</span>
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
                      navigate("/bills/new", {
                        state: {
                          ...location.state,
                          from: { pathname: location.pathname },
                          cloneBill: selectedRecord,
                          convertPO: null,
                        },
                      });
                    } else if (key === "1") {
                      // confirm bill
                      handleConfirmBill(selectedRecord.id);
                    } else if (key === "2") {
                      setShowRecordBillPaymentForm(true);
                    } else if (key === "3") {
                      setCreditModalOpen(true);
                    } else if (key === "4") {
                      // void bill
                      handleVoidBill(selectedRecord.id);
                    } else if (key === "5") {
                      // delete bill
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
              {(selectedRecord.status === "Confirmed" ||
                selectedRecord.status === "Partial Paid") && (
                <div
                  className="bill-receives-container"
                  style={{ minHeight: "8.875rem", padding: "1.2rem 1rem " }}
                >
                  <span>
                    <FormattedMessage
                      id="lable.availableCredits"
                      defaultMessage="Available Credits"
                    />{" "}
                    <b>
                      {selectedRecord.currency.symbol}{" "}
                      <FormattedNumber
                        value={selectedRecord.supplier?.unusedCreditAmount}
                        style="decimal"
                        minimumFractionDigits={
                          selectedRecord.currency.decimalPlaces
                        }
                      />
                    </b>
                  </span>
                  {/* <Button
                    type="link"
                    noStyle
                    onClick={() => setCreditModalOpen(true)}
                  >
                    <FormattedMessage
                      id="button.apply"
                      defaultMessage="Apply"
                    />
                  </Button> */}
                  <Divider style={{ marginBlock: "1rem" }} />
                  <Flex justify="space-between" align="center">
                    <Flex vertical gap="0.5rem">
                      <b>Record Payment</b>
                      <span style={{ fontSize: "var(--small-text)" }}>
                        Apply available credits or record the payment for bill
                        if paid already.
                      </span>
                    </Flex>
                    <Space>
                      <Button
                        type="primary"
                        onClick={setShowRecordBillPaymentForm}
                      >
                        Record Payment
                      </Button>
                      <Button onClick={setCreditModalOpen}>
                        Apply Credits
                      </Button>
                    </Space>
                  </Flex>
                </div>
              )}
              <br />
              {(selectedRecord.status === "Paid" ||
                selectedRecord.status === "Partial Paid") && (
                <AccordionTabs
                  tabs={[
                    {
                      key: "bill",
                      title: "Payments Made",
                      data: selectedRecord?.billPayment,
                      content: (
                        <Table
                          className="bill-table"
                          columns={paymentMadeColumns}
                          dataSource={selectedRecord?.billPayment}
                          pagination={false}
                        />
                      ),
                    },
                    {
                      key: "purchaseOrders",
                      title: "Purchase Orders",
                      data: selectedRecord?.purchaseOrder,
                      content: (
                        <Table
                          className="bill-table"
                          columns={purchaseOrderColumns}
                          dataSource={[selectedRecord?.purchaseOrder] || []}
                          pagination={false}
                        />
                      ),
                    },
                    {
                      key: "creditsApplied",
                      title: "Credits Applied",
                      data: selectedRecord?.appliedSupplierCredits,
                      content: (
                        <Table
                          className="bill-table"
                          columns={appliedCreditColumns}
                          dataSource={selectedRecord?.appliedSupplierCredits}
                          pagination={false}
                        />
                      ),
                    },
                  ]}
                />
              )}
              <BillTemplate selectedRecord={selectedRecord} />
            </div>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="bills"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}

        {showRecordBillPaymentForm && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <p className="page-header-text">
                Payment For
                {selectedRecord.billNumber && ` - ${selectedRecord.billNumber}`}
              </p>
            </Row>
            <RecordBillPayment
              refetch={() => {
                refetch();
                setCurrentPage(1);
                setSelectedRecord(null);
              }}
              branches={branches}
              selectedRecord={selectedRecord}
              onClose={() => setShowRecordBillPaymentForm(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Bills;
