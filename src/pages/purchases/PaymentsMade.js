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
  DatePicker,
  Select,
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
  // CaretRightFilled,
} from "@ant-design/icons";
import { useHistoryState } from "../../utils/HelperFunctions";
import {
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
  SupplierPaymentTemplate,
  SupplierSearchModal,
} from "../../components";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import {
  SupplierPaymentQueries,
  SupplierPaymentMutations,
} from "../../graphql";
import { useMutation, useReadQuery } from "@apollo/client";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
const { GET_PAGINATE_SUPPLIER_PAYMENT } = SupplierPaymentQueries;
const { DELETE_SUPPLIER_PAYMENT } = SupplierPaymentMutations;

const items = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "1",
  },
];

const compactColumns = [
  {
    title: "",
    dataIndex: "column",
    render: (_, record) => {
      return (
        <div>
          <div className="column-list-item">
            <span>{record.supplierName}</span>
            <span>
              {record.currency.symbol}{" "}
              <FormattedNumber
                value={record.amount}
                style="decimal"
                minimumFractionDigits={record.currency.decimalPlaces}
              />
            </span>
          </div>
          <div className="column-list-item">
            <span>
              <span style={{ color: "var(--dark-green)" }}>
                {record.paymentNumber}
              </span>
              <Divider type="vertical" />
              {dayjs(record.paymentDate).format(REPORT_DATE_FORMAT)}
            </span>
            <span>{record.paymentMode?.name}</span>
          </div>
        </div>
      );
    },
  },
];

const PaymentsMade = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [searchFormRef] = Form.useForm();
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteModal, contextHolder] = Modal.useModal();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allWarehousesQueryRef,
    allAccountsQueryRef,
  } = useOutletContext();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "supplierPaymentSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "supplierPaymentCurrentPage",
    1
  );
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);

  const [deleteSupplierPayment, { loading: deleteLoading }] = useMutation(
    DELETE_SUPPLIER_PAYMENT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="supplierPayment.deleted"
            defaultMessage="Supplier Payment Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingSupplierPayments = cache.readQuery({
          query: GET_PAGINATE_SUPPLIER_PAYMENT,
        });
        const updatedSupplierPayments =
          existingSupplierPayments.paginateSupplierPayment.edges.filter(
            ({ node }) => node.id !== data.deleteSupplierPayment.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_SUPPLIER_PAYMENT,
          data: {
            paginateSupplierPayment: {
              ...existingSupplierPayments.paginateSupplierPayment,
              edges: updatedSupplierPayments,
            },
          },
        });
      },

      // refetchQueries: [GET_ACCOUNTS],
    }
  );

  const loading = deleteLoading;

  const parseData = (data) => {
    let supplierPayments = [];
    data?.paginateSupplierPayment?.edges.forEach(({ node }) => {
      if (node != null) {
        supplierPayments.push({
          key: node.id,
          ...node,
          branchName: node.branch?.name,
          supplierName: node.supplier?.name,
          status: node.bills?.currentStatus,
          unusedCreditAmount: node.supplier?.unusedCreditAmount,
        });
      }
    });
    return supplierPayments ? supplierPayments : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateSupplierPayment) {
      pageInfo = {
        hasNextPage: data.paginateSupplierPayment.pageInfo.hasNextPage,
        endCursor: data.paginateSupplierPayment.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };
  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const accounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter(
        (account) =>
          account.detailType === "Cash" ||
          account.detailType === "Bank" ||
          account.detailType === "OtherAsset" ||
          account.detailType === "OtherCurrentAsset" ||
          account.detailType === "Equity"
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

  console.log("accounts", accounts);

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    searchFormRef.setFieldsValue({
      supplierId: record.id,
      supplierName: record.name,
    });
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
        await deleteSupplierPayment({
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

    // clear the state from location.state
    navigate(location.pathname, {
      state: {
        ...location.state,
        supplierPaymentSearchCriteria: undefined,
      },
      replace: true,
    });
  };

  const findAccountName = (accounts, withdrawAccountId) => {
    for (const accountGroup of accounts) {
      for (const account of accountGroup.accounts) {
        if (account.id === withdrawAccountId) {
          return account.name;
        }
      }
    }
    return null;
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },

    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: (
        <FormattedMessage id="label.paymentNumber" defaultMessage="Payment #" />
      ),
      dataIndex: "paymentNumber",
      key: "paymentNumber",
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
      title: <FormattedMessage id="label.mode" defaultMessage="Mode" />,
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (_, record) => <>{record.paymentMode?.name}</>,
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "amount",
      key: "amount",
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
    // {
    //   title: (
    //     <FormattedMessage
    //       id="label.unusedAmount"
    //       defaultMessage="Unused Amount"
    //     />
    //   ),
    //   dataIndex: "unusedCreditAmount",
    //   key: "unusedCreditAmount",
    //   render: (text, record) => (
    //     <>
    //       {record.currency.symbol}{" "}
    //       <FormattedNumber
    //         value={text}
    //         style="decimal"
    //         minimumFractionDigits={record.currency.decimalPlaces}
    //       />
    //     </>
    //   ),
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

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Payment #"
            name="paymentNumber"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.paymentDateRange"
                defaultMessage="Payment Date Range"
              />
            }
            name="paymentDateRange"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              onChange={(value) => {
                searchFormRef.setFieldsValue({
                  startPaymentDate: value && value[0],
                  endPaymentDate: value && value[1],
                });
              }}
              onClear={() =>
                searchFormRef.resetFields([
                  "startPaymentDate",
                  "endPaymentDate",
                ])
              }
            />
          </Form.Item>
          <Form.Item noStyle hidden name="startPaymentDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="endPaymentDate" shouldUpdate>
            <Input />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
            labelAlign="left"
            label={
              <FormattedMessage
                id="label.paidThrough"
                defaultMessage="Paid Through"
              />
            }
            name="withdrawAccountId"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.paidThrough.required"
                    defaultMessage="Select the Paid Through"
                  />
                ),
              },
            ]}
          >
            <Select showSearch optionFilterProp="label">
              {accounts.map((group) => (
                <Select.OptGroup
                  key={group.detailType}
                  label={group.detailType}
                >
                  {group.accounts.map((acc) => (
                    <Select.Option key={acc.id} value={acc.id} label={acc.name}>
                      {acc.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
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
                id="label.paymentsMade"
                defaultMessage="Payments Made"
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
                {searchCriteria.paymentNumber && (
                  <li>
                    Payment Number contains{" "}
                    <b>{searchCriteria.paymentNumber}</b>
                  </li>
                )}
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {/* {searchCriteria.startPaymentDate &&
                  searchCriteria.endPaymentDate && (
                    <li>
                      Payment Date between{" "}
                      <b>
                        {dayjs(searchCriteria.startPaymentDate).format(
                          REPORT_DATE_FORMAT
                        )}{" "}
                        and{" "}
                        {dayjs(searchCriteria.endPaymentDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </b>
                    </li>
                  )}{" "} */}
                {searchCriteria.withdrawAccountId && (
                  <li>
                    Paid Through{" "}
                    <b>
                      {findAccountName(
                        accounts,
                        searchCriteria.withdrawAccountId
                      )}
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
              gqlQuery={GET_PAGINATE_SUPPLIER_PAYMENT}
              showSearch={false}
              searchForm={searchForm}
              searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_SUPPLIER_PAYMENT}
              searchTitle={
                <FormattedMessage
                  id="paymentMade.search"
                  defaultMessage="Search Payments"
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
                <span>{selectedRecord.paymentNumber}</span>
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
                Edit
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
                  PDF/Print <CaretDownFilled />
                </div>
              </Dropdown>
              <Dropdown
                menu={{
                  onClick: ({ key }) => {
                    if (key === "0") {
                      // navigate("/purchaseOrders/new", {
                      //   state: {
                      //     ...location.state,
                      //     from: { pathname: location.pathname },
                      //     clonePO: selectedRecord,
                      //   },
                      // });
                    } else if (key === "1") handleDelete(selectedRecord.id);
                  },
                  items: items,
                }}
                trigger={["click"]}
              >
                <div style={{ fontSize: "1.1rem" }}>
                  <MoreOutlined />
                </div>
              </Dropdown>
            </Row>
            <div className="content-column-full-row">
              <SupplierPaymentTemplate selectedRecord={selectedRecord} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentsMade;
