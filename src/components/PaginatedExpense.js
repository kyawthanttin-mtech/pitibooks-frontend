/* eslint-disable react/style-prop-object */
import React, { useState, useEffect } from "react";
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  PlusOutlined,
  CloseOutlined,
  MoreOutlined,
  EditOutlined,
  PaperClipOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  CaretDownFilled,
} from "@ant-design/icons";
import {
  Button,
  Row,
  Space,
  Table,
  Modal,
  Tooltip,
  Dropdown,
  Flex,
} from "antd";
import { useQuery, useLazyQuery } from "@apollo/client";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useNavigate, useLocation } from "react-router-dom";
import { openErrorNotification } from "../utils/Notification";
import { paginateArray, useHistoryState } from "../utils/HelperFunctions";
import { QUERY_DATA_LIMIT, REPORT_DATE_FORMAT } from "../config/Constants";
import dayjs from "dayjs";
import AttachFiles from "./AttachFiles";
import ExpenseRefund from "../pages/purchases/ExpenseRefund";
const compactColumns = [
  {
    title: "",
    dataIndex: "column",
    render: (text, record) => {
      return (
        <div>
          <div className="column-list-item">
            <span>{record.expenseAccount.name}</span>
            <span>
              {record.currency.symbol}{" "}
              <FormattedNumber
                value={record.totalAmount}
                style="decimal"
                minimumFractionDigits={record.currency.decimalPlaces}
              />
            </span>
          </div>
          <div className="column-list-item">
            <span style={{ color: "var(--dark-green)" }}>
              {dayjs(record.expenseDate).format(REPORT_DATE_FORMAT)}
            </span>
            <span>{record.referenceNumber}</span>
          </div>
        </div>
      );
    },
  },
];

const actionItems = [
  {
    label: <FormattedMessage id="button.clone" defaultMessage="Clone" />,
    key: "0",
  },
  {
    label: (
      <FormattedMessage
        id="button.refundExpense"
        defaultMessage="Refund Expense"
      />
    ),
    key: "1",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "2",
  },
];

const PaginatedExpense = ({
  api,
  columns = [],
  gqlQuery,
  parseData,
  parsePageInfo,
  showAddNew = false,
  showSearch = false,
  searchForm,
  searchFormRef,
  searchQqlQuery,
  onAddNew,
  onEdit,
  onDelete,
  setSearchModalOpen,
  modalOpen,
  branchData,
  accountData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useHistoryState(
    "expenseCurrentPage",
    1
  );
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "expenseSearchCriteria",
    null
  );
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [showRefundForm, setShowRefundForm] = useState(false);

  const handleRefetch = async () => {
    try {
      await refetch();
      setCurrentPage(1);
    } catch (err) {
      openErrorNotification(api, err.message);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = async () => {
    if (currentPage === totalPages) {
      try {
        await fetchMore({
          variables: {
            limit: QUERY_DATA_LIMIT,
            after: parsePageInfo(data).endCursor,
          },
        });
        setCurrentPage(currentPage + 1);
      } catch (err) {
        openErrorNotification(api, err.message);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  // const handleModalCancel = () => {
  //   setSearchModalOpen(false);
  // };

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);
  };

  const [search, { loading: searchLoading, data: searchData }] = useLazyQuery(
    searchQqlQuery,
    {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );

  const {
    data,
    loading: queryLoading,
    fetchMore,
    refetch,
  } = useQuery(gqlQuery, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: QUERY_DATA_LIMIT,
    },
    onError(err) {
      openErrorNotification(api, err.message);
    },
  });

  useEffect(() => {
    if (searchCriteria) {
      searchFormRef.setFieldsValue(searchCriteria);
      search({
        variables: searchCriteria,
      });
    }
  }, [searchCriteria, searchFormRef, search]);

  const allData = parseData(data);
  const searchResults = parseData(searchData);
  const totalPages = searchCriteria
    ? Math.ceil(searchResults.length / QUERY_DATA_LIMIT)
    : Math.ceil(allData.length / QUERY_DATA_LIMIT);
  let hasPreviousPage = currentPage > 1 ? true : false;
  let hasNextPage = false;
  let refetchEnabled = true;
  if (currentPage === totalPages) {
    const pageInfo = parsePageInfo(data);
    const searchPageInfo = parsePageInfo(searchData);
    hasNextPage = searchCriteria
      ? searchPageInfo.hasNextPage
      : pageInfo.hasNextPage;
  } else if (currentPage < totalPages) {
    hasNextPage = true;
  }

  const loading = queryLoading || searchLoading;

  const handleModalSearch = async () => {
    try {
      const values = await searchFormRef.validateFields();
      const input = {
        expenseAccountId: values.expenseAccountId,
        assetAccountId: values.assetAccountId,
        fromDate: values.dateRange && values.dateRange[0],
        toDate: values.dateRange && values.dateRange[1],
        branchId: values.branch,
        referenceNumber: values.referenceNumber,
      };
      // console.log("values ", values);
      console.log("input", input);
      await search({
        variables: {
          ...input,
        },
      });
      setCurrentPage(1);
      setSearchCriteria(input);
      setSearchModalOpen(false);
    } catch (err) {
      openErrorNotification(api, err.message);
    }
  };
  // console.log("Search criteria", searchCriteria);

  const pageData = paginateArray(allData, QUERY_DATA_LIMIT, currentPage);

  const searchPageData = paginateArray(
    searchResults,
    QUERY_DATA_LIMIT,
    currentPage
  );

  // console.log("All data", allData);

  return (
    <div className={`${selectedRecord && "page-with-column"}`}>
      <div>
        <div className="page-header page-header-with-button">
          <p className="page-header-text">
            {selectedRecord ? "Expenses" : "Expenses"}
          </p>
          <div className="header-buttons">
            <div className="new-expense-buttons-container">
              <Button
                icon={<PlusOutlined />}
                type="primary"
                // onClick={() => navigate("new")}
                onClick={() =>
                  navigate("new", {
                    state: {
                      ...location.state,
                      from: { pathname: location.pathname },
                    },
                  })
                }
              >
                {!selectedRecord && "New Expense"}
              </Button>
            </div>
          </div>
        </div>

        <div className={`page-content ${selectedRecord && "column-width2"}`}>
          {searchCriteria && (
            <div
              style={{
                padding: "1rem 1.5rem ",
                background: "#eef8f1",
                fontSize: 13,
              }}
            >
              <Flex justify="space-between">
                <span>
                  <i>Search Criteria</i>
                </span>
                <CloseOutlined
                  style={{ cursor: "pointer" }}
                  onClick={handleModalClear}
                />
              </Flex>
              <ul style={{ paddingLeft: "1.5rem" }}>
                {searchCriteria.expenseAccountId && (
                  <li>
                    Expense Account is{" "}
                    <b>
                      {
                        accountData?.find(
                          (x) => x.id === searchCriteria.expenseAccountId
                        ).name
                      }
                    </b>
                  </li>
                )}
                {searchCriteria.assetAccountId && (
                  <li>
                    Paid Through Account is{" "}
                    <b>
                      {
                        accountData?.find(
                          (x) => x.id === searchCriteria.assetAccountId
                        ).name
                      }
                    </b>
                  </li>
                )}
                {searchCriteria.referenceNumber && (
                  <li>
                    Reference Number contains{" "}
                    <b>{searchCriteria.referenceNumber}</b>
                  </li>
                )}
                {searchCriteria.fromDate && searchCriteria.toDate && (
                  <li>
                    Expense Date between{" "}
                    <b>
                      {dayjs(searchCriteria.fromDate).format(
                        REPORT_DATE_FORMAT
                      )}{" "}
                      and{" "}
                      {dayjs(searchCriteria.toDate).format(REPORT_DATE_FORMAT)}
                    </b>
                  </li>
                )}
                {searchCriteria.branchId && (
                  <li>
                    Branch is{" "}
                    <b>
                      {
                        branchData?.find(
                          (x) => x.id === searchCriteria.branchId
                        ).name
                      }
                    </b>
                  </li>
                )}
              </ul>
            </div>
          )}
          <Table
            className={`main-type ${selectedRecord && "header-less-table"}`}
            rowKey="id"
            loading={loading}
            columns={selectedRecord ? compactColumns : columns}
            dataSource={searchCriteria ? searchPageData : pageData}
            pagination={false}
            rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
            selectedRecord={selectedRecord}
            onRow={(record) => {
              return {
                onClick: () => {
                  setSelectedRecord(record);
                  setSelectedRowIndex(record.id);
                },
              };
            }}
          />
          {showSearch && (
            <Modal
              className="search-expense-modal"
              width="65.5rem"
              title={
                <FormattedMessage
                  id="expense.search"
                  defaultMessage="Search Expense"
                />
              }
              okText={
                <FormattedMessage id="button.search" defaultMessage="Search" />
              }
              cancelText={
                <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
              }
              open={modalOpen}
              onOk={handleModalSearch}
              onCancel={() => setSearchModalOpen(false)}
              okButtonProps={loading}
            >
              {searchForm}
            </Modal>
          )}
          <Row style={{ justifyContent: "space-between", marginBottom: 5 }}>
            <Space>
              {/* {searchCriteria && 
                          <Tooltip title={<FormattedMessage id="button.clearSearch" defaultMessage="Clear Search Results" />}>
                              <Button
                                  icon={<ClearOutlined />}
                                  loading={loading}
                                  onClick={handleModalClear}
                              />
                          </Tooltip>
                      } */}
              {showAddNew && (
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
                  <FormattedMessage id="button.new" defaultMessage="New" />
                </Button>
              )}
            </Space>
            <Space style={{ padding: "0.5rem 1rem 0 0" }}>
              <Tooltip
                title={
                  <FormattedMessage
                    id="button.refetch"
                    defaultMessage="Refetch"
                  />
                }
              >
                <Button
                  icon={<SyncOutlined />}
                  loading={loading}
                  disabled={!refetchEnabled}
                  onClick={handleRefetch}
                />
              </Tooltip>
              <Tooltip
                title={
                  <FormattedMessage
                    id="button.previous"
                    defaultMessage="Previous"
                  />
                }
              >
                <Button
                  icon={<LeftOutlined />}
                  loading={loading}
                  disabled={!hasPreviousPage}
                  onClick={handlePrevious}
                />
              </Tooltip>
              <Tooltip
                title={
                  <FormattedMessage id="button.next" defaultMessage="Next" />
                }
              >
                <Button
                  icon={<RightOutlined />}
                  loading={loading}
                  disabled={!hasNextPage}
                  onClick={handleNext}
                />
              </Tooltip>
            </Space>
          </Row>
        </div>
      </div>

      {selectedRecord && !showRefundForm && (
        <div className="content-column">
          <Row className="content-column-header-row">
            <div className="content-column-header-row-text content-column-header-row-text">
              <p>Expense Details</p>
            </div>
            <div className="content-column-header-row-actions">
              <AttachFiles
                files={selectedRecord?.documents}
                key={selectedRecord?.key}
              />
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
              onClick={() => onEdit(selectedRecord, navigate, location)}
            >
              <EditOutlined />
              <FormattedMessage id="button.edit" defaultMessage="Edit" />
            </div>
            <Dropdown
              menu={{
                items: [
                  {
                    // label: (
                    //   <PDFDownloadLink
                    //     document={
                    //       <InvoicePDF selectedRecord={selectedRecord} />
                    //     }
                    //     fileName={selectedRecord.invoice}
                    //   >
                    //     PDF
                    //   </PDFDownloadLink>
                    // ),
                    icon: <FilePdfOutlined />,
                    key: "0",
                  },
                  {
                    // label: (
                    //   <BlobProvider
                    //     document={
                    //       <InvoicePDF selectedRecord={selectedRecord} />
                    //     }
                    //   >
                    //     {({ url, blob }) => (
                    //       <a href={url} target="_blank" rel="noreferrer">
                    //         Print
                    //       </a>
                    //     )}
                    //   </BlobProvider>
                    // ),
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
            <div>
              <Dropdown
                loading={loading}
                trigger="click"
                // key={record.key}
                menu={{
                  onClick: ({ key }) => {
                    if (key === "0") console.log("Clone");
                    else if (key === "1") setShowRefundForm(true);
                    else if (key === "2") {
                      if (onDelete(selectedRecord.id)) setSelectedRecord(null);
                    }
                  },
                  items: actionItems,
                }}
              >
                <MoreOutlined />
              </Dropdown>
            </div>
          </Row>
          <div
            className="content-column-full-row"
            style={{ paddingLeft: "2rem" }}
          >
            <table>
              <thead></thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "var(--text-color)",
                      opacity: "75%",
                    }}
                  >
                    <span>Branch</span>
                  </td>
                </tr>
                <tr>
                  <td>{selectedRecord.branch.name}</td>
                </tr>
                <tr>
                  <td style={{ opacity: "75%", paddingTop: "2rem" }}>
                    <span>Expense Amount</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span>
                      <span
                        style={{
                          fontSize: "var(--title-text)",
                          color: "var(--dark-green)",
                        }}
                      >
                        {selectedRecord.currency.symbol}{" "}
                        <FormattedNumber
                          value={selectedRecord.totalAmount}
                          style="decimal"
                          minimumFractionDigits={
                            selectedRecord.currency.decimalPlaces
                          }
                        />
                      </span>
                      <span style={{ fontSize: "var(--small-text)" }}>
                        {" "}
                        on{" "}
                        {dayjs(selectedRecord.expenseDate).format(
                          REPORT_DATE_FORMAT
                        )}
                      </span>
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2rem",
                          color: "var(--text-color)",
                          opacity: "75%",
                        }}
                      >
                        <span>Paid Through</span>
                      </td>
                    </tr>
                    <tr>
                      <td>{selectedRecord.assetAccount.name}</td>
                    </tr>
                  </td>
                  <td>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2rem",
                          color: "var(--text-color)",
                          opacity: "75%",
                        }}
                      >
                        <span>Expense Account</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Flex
                          style={{
                            height: "1.5rem",
                            padding: "0.6rem 1rem",
                            width: "fit-content",
                            borderRadius: "0.2rem",
                            background: "#c5e3ec",
                          }}
                          align="center"
                        >
                          {selectedRecord.expenseAccount.name}
                        </Flex>
                      </td>
                    </tr>
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      paddingTop: "2rem",
                      color: "var(--text-color)",
                      opacity: "75%",
                    }}
                  >
                    <span>Reference Number</span>
                  </td>
                </tr>
                <tr>
                  <td>{selectedRecord.referenceNumber}</td>
                </tr>
                {selectedRecord.expenseTax && (
                  <>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2rem",
                          color: "var(--text-color)",
                          opacity: "75%",
                        }}
                      >
                        <span>Tax</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        {selectedRecord.expenseTax.name} (
                        {selectedRecord.expenseTax.rate}%)
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2rem",
                          color: "var(--text-color)",
                          opacity: "75%",
                        }}
                      >
                        <span>Tax Amount</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        {selectedRecord.currency.symbol}{" "}
                        <FormattedNumber
                          value={selectedRecord.taxAmount}
                          style="decimal"
                          minimumFractionDigits={
                            selectedRecord.currency.decimalPlaces
                          }
                        />{" "}
                        (
                        {selectedRecord.isTaxInclusive
                          ? "Inclusive"
                          : "Exclusive"}
                        )
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2rem",
                          color: "var(--text-color)",
                          opacity: "75%",
                        }}
                      >
                        <span>Supplier</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        {selectedRecord.supplier?.name
                          ? selectedRecord.supplier?.name
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          paddingTop: "2rem",
                          color: "var(--text-color)",
                          opacity: "75%",
                        }}
                      >
                        <span>Customer</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        {selectedRecord.customer?.name
                          ? selectedRecord.customer?.name
                          : "-"}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showRefundForm && (
        <div className="content-column">
          <Row className="content-column-header-row">
            <p className="page-header-text">Expense Refund</p>
          </Row>
          <ExpenseRefund
            refetch={() => {
              refetch();
              setCurrentPage(1);
              setSelectedRecord(null);
            }}
            // branches={branches}
            selectedRecord={selectedRecord}
            onClose={() => setShowRefundForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default PaginatedExpense;
