/* eslint-disable react/style-prop-object */
import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Space,
  Row,
  Table,
  Modal,
  Form,
  Dropdown,
  Divider,
  Col,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  CommentOutlined,
  CloseOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  CreditNoteTemplate,
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
  CustomerSearchModal,
  AttachFiles,
  PDFPreviewModal,
  CommentColumn,
  AccordionTabs,
} from "../../components";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditNoteMutations,
  CreditNoteQueries,
  RefundMutations,
} from "../../graphql";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import dayjs from "dayjs";
import { useMutation, useReadQuery, useQuery } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useHistoryState } from "../../utils/HelperFunctions";
import CreditNoteRefund from "./CreditNoteRefundNew";
import { CreditNotePDF } from "../../components/pdfs-and-templates";
import CreditNoteRefundEdit from "./CreditNoteRefundEdit";
const { GET_PAGINATE_CREDIT_NOTE } = CreditNoteQueries;
const { DELETE_CREDIT_NOTE } = CreditNoteMutations;
const { DELETE_REFUND } = RefundMutations;

const draftActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "2",
  },
];

const openActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.refundCreditNote"
        defaultMessage="Refund Credit Note"
      />
    ),
    key: "1",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "2",
  },
];

const closedActionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
];

const CreditNotes = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allWarehousesQueryRef,
    business,
    allAccountsQueryRef,
  } = useOutletContext();
  const navigate = useNavigate();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "creditNoteSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "creditNoteCurrentPage",
    1
  );
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [showRefundFormNew, setShowRefundFormNew] = useState(false);
  const [showRefundFormEdit, setShowRefundFormEdit] = useState(false);
  const [pdfModalOpen, setPDFModalOpen] = useState(false);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);
  const [selectedRefundRecord, setSelectedRefundRecord] = useState(null);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);

  const { refetch } = useQuery(GET_PAGINATE_CREDIT_NOTE, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  //Mutations
  const [deleteCreditNote, { loading: deleteLoading }] = useMutation(
    DELETE_CREDIT_NOTE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="creditNote.deleted"
            defaultMessage="Credit Note Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingCreditNotes = cache.readQuery({
          query: GET_PAGINATE_CREDIT_NOTE,
        });
        const updatedCreditNotes =
          existingCreditNotes.paginateCreditNote.edges.filter(
            ({ node }) => node.id !== data.deleteCreditNote.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_CREDIT_NOTE,
          data: {
            paginateCreditNote: {
              ...existingCreditNotes.paginateCreditNote,
              edges: updatedCreditNotes,
            },
          },
        });
      },
      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [deleteRefund, { loading: deleteRefundLoading }] = useMutation(
    DELETE_REFUND,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="refundInformation.deleted"
            defaultMessage="Refund Information Deleted"
          />
        );
      },
    }
  );

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const cashBankAccounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter(
        (account) =>
          account.detailType === "Cash" || account.detailType === "Bank"
      )
      .reduce((acc, account) => {
        const { detailType } = account;
        if (!acc[detailType]) {
          acc[detailType] = { detailType, accounts: [] };
        }
        acc[detailType].accounts.push(account);
        return acc;
      }, {});

    return Object.values(groupedAccounts);
  }, [accountData]);

  const accountsReceivable = useMemo(() => {
    if (!accountData?.listAllAccount) return null;
    const account = accountData.listAllAccount.filter(
      (acc) => acc.detailType === "AccountsReceivable"
    );
    return account;
  }, [accountData]);

  useEffect(() => {
    if (selectedRecord && selectedRowIndex) {
      setShowRefundFormNew(false);
      setShowRefundFormEdit(false);
    }
  }, [selectedRecord, selectedRowIndex]);

  const parseData = (data) => {
    let creditNotes = [];
    data?.paginateCreditNote?.edges.forEach(({ node }) => {
      creditNotes.push({
        key: node.id,
        branchName: node.branch?.name,
        customerName: node.customer?.name,
        ...node,
      });
    });
    return creditNotes ? creditNotes : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateCreditNote) {
      pageInfo = {
        hasNextPage: data.paginateCreditNote.pageInfo.hasNextPage,
        endCursor: data.paginateCreditNote.pageInfo.endCursor,
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
        await deleteCreditNote({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleDeleteRefund = async (id) => {
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
        await deleteRefund({
          variables: {
            id,
          },
          update: (cache) => {
            const existingData = cache.readQuery({
              query: GET_PAGINATE_CREDIT_NOTE,
            });

            if (existingData) {
              const newEdges = existingData.paginateCreditNote.edges.map(
                (edge) => {
                  if (edge.node.refunds) {
                    return {
                      ...edge,
                      node: {
                        ...edge.node,
                        refunds: edge.node.refunds.filter(
                          (refund) => refund.id !== id
                        ),
                      },
                    };
                  }
                  return edge;
                }
              );

              cache.writeQuery({
                query: GET_PAGINATE_CREDIT_NOTE,
                data: {
                  paginateCreditNote: {
                    ...existingData.paginateCreditNote,
                    edges: newEdges,
                  },
                },
              });

              // Update selectedRecord state
              if (selectedRecord && selectedRecord.refunds) {
                const updatedSelectedRecord = {
                  ...selectedRecord,
                  refunds: selectedRecord.refunds.filter(
                    (refund) => refund.id !== id
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

  const handleModalRowSelect = (record) => {
    setSelectedCustomer(record);
    searchFormRef.setFieldsValue({
      customerId: record.id,
      customerName: record.name,
    });
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
        creditNoteSearchCriteria: undefined,
      },
      replace: true,
    });
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

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "creditNoteDate",
      key: "creditNoteDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Credit Note #",
      dataIndex: "creditNoteNumber",
      key: "creditNoteNumber",
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
      dataIndex: "creditNoteTotalAmount",
      key: "creditNoteTotalAmount",
      render: (text, record) => (
        <>
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={record.creditNoteTotalAmount}
            style="decimal"
            minimumFractionDigits={record.currency.decimalPlaces}
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
                {record.currency.symbol} {record.remainingBalance}
              </span>
            </div>
            <div className="column-list-item">
              <span>
                <span style={{ color: "var(--dark-green)" }}>
                  {record.creditNoteNumber}
                </span>
                <Divider type="vertical" />
                {dayjs(record.creditNoteDate).format(REPORT_DATE_FORMAT)}
              </span>
              <span
                style={{
                  color: getStatusColor(record.currentStatus),
                }}
              >
                {record.currentStatus}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const invoiceTableColumns = [
    {
      title: "#Invoice",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Date",
      dataIndex: "creditDate",
      key: "creditDate",
      render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Amount Credited",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const refundColumns = [
    {
      title: "Date",
      dataIndex: "refundDate",
      key: "refundDate",
      render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (_, record) => <>{record.paymentMode?.name}</>,
    },
    {
      title: "Amount Refunded",
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
      width: "5%",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <span className="edit-icon" onClick={setShowRefundFormEdit}>
            <EditOutlined />
          </span>
          <span
            className="delete-icon"
            onClick={() => handleDeleteRefund(record.id)}
          >
            <DeleteOutlined />
          </span>
        </Space>
      ),
    },
  ];

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Credit Note #"
            name="creditNoteNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.dateRange"
                defaultMessage="Date Range"
              />
            }
            name="dateRange"
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
                  "startCreditNoteDate",
                  "endCreditNoteDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startCreditNoteDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endCreditNoteDate" shouldUpdate>
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
                  value: "Confirmed",
                  label: "Confirmed",
                },
                {
                  value: "Closed",
                  label: "Closed",
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
      <PDFPreviewModal modalOpen={pdfModalOpen} setModalOpen={setPDFModalOpen}>
        <CreditNotePDF selectedRecord={selectedRecord} business={business} />
      </PDFPreviewModal>
      {contextHolder}

      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header">
            <p className="page-header-text">
              <FormattedMessage
                id="label.creditNotes"
                defaultMessage="Credit Notes"
              />
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
                {searchCriteria.creditNoteNumber && (
                  <li>
                    Credit Note Number contains{" "}
                    <b>{searchCriteria.creditNoteNumber}</b>
                  </li>
                )}
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {searchCriteria.startCreditNoteDate &&
                  searchCriteria.endCreditNoteDate && (
                    <li>
                      Credit Note Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startCreditNoteDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endCreditNoteDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}
                {searchCriteria.currentStatus && (
                  <li>
                    Supplier Credit Status is{" "}
                    <b>{searchCriteria.currentStatus}</b>
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
              loading={deleteLoading}
              api={notiApi}
              columns={columns}
              gqlQuery={GET_PAGINATE_CREDIT_NOTE}
              searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_CREDIT_NOTE}
              searchTitle={
                <FormattedMessage
                  id="creditNote.search"
                  defaultMessage="Search Credit Notes"
                />
              }
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
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        </div>
        {selectedRecord && !showRefundFormNew && !showRefundFormEdit && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branch?.name}</span>
                <span>{selectedRecord.creditNoteNumber}</span>
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
                    if (key === "0") console.log("clone");
                    else if (key === "1") setShowRefundFormNew(true);
                    else if (key === "2") handleDelete(selectedRecord.id);
                  },
                  items:
                    selectedRecord.currentStatus === "Draft"
                      ? draftActionItems
                      : selectedRecord.currentStatus === "Confirmed"
                      ? openActionItems
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
              {(selectedRecord?.creditedInvoices?.length > 0 ||
                selectedRecord?.refunds?.length > 0) && (
                <AccordionTabs
                  key={selectedRecord.id}
                  tabs={[
                    {
                      key: "bill",
                      title: "Credited Invoices",
                      data: selectedRecord?.creditedInvoices,
                      content: (
                        <Table
                          className="bill-table"
                          columns={invoiceTableColumns}
                          dataSource={selectedRecord?.creditedInvoices}
                          pagination={false}
                        />
                      ),
                    },

                    {
                      key: "refundHistory",
                      title: "Refund History",
                      data: selectedRecord?.refunds,
                      content: (
                        <Table
                          loading={deleteRefundLoading}
                          className="bill-table"
                          columns={refundColumns}
                          dataSource={selectedRecord?.refunds}
                          pagination={false}
                          onRow={(record) => {
                            return {
                              onClick: () => {
                                setSelectedRefundRecord(record);
                              },
                            };
                          }}
                        />
                      ),
                    },
                  ]}
                />
              )}

              <CreditNoteTemplate selectedRecord={selectedRecord} />
            </div>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="credit_notes"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}
        {showRefundFormNew && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <p className="page-header-text">
                Credit Note Refund For
                {selectedRecord.creditNoteNumber &&
                  ` - ${selectedRecord.creditNoteNumber}`}
              </p>
            </Row>
            <CreditNoteRefund
              refetch={() => {
                refetch();
                setCurrentPage(1);
                setSelectedRecord(null);
              }}
              accountsReceivable={accountsReceivable}
              accounts={cashBankAccounts}
              branches={branches}
              selectedRecord={selectedRecord}
              onClose={() => setShowRefundFormNew(false)}
            />
          </div>
        )}
        {showRefundFormEdit && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <p className="page-header-text">Supplier Credit Refund</p>
            </Row>
            <CreditNoteRefundEdit
              accounts={cashBankAccounts}
              refetch={() => {
                refetch();
                setCurrentPage(1);
                setSelectedRecord(null);
                setSelectedRefundRecord(null);
              }}
              branches={branches}
              selectedRecord={selectedRecord}
              selectedRefundRecord={selectedRefundRecord}
              onClose={() => setShowRefundFormEdit(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CreditNotes;
