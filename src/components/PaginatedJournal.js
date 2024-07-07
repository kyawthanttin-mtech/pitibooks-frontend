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
  CommentOutlined,
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
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { openErrorNotification } from "../utils/Notification";
import { paginateArray, useHistoryState } from "../utils/HelperFunctions";
import { QUERY_DATA_LIMIT } from "../config/Constants";
import JournalTemplate from "./pdfs-and-templates/accountant/JournalTemplate";
import moment from "moment";
import AttachFiles from "./AttachFiles";
import CommentColumn from "./CommentColumn";
import PDFPreviewModal from "./PDFPreviewModal";
import { JournalPDF } from "./pdfs-and-templates";
const compactColumns = [
  {
    title: "",
    dataIndex: "column",
    render: (text, record) => {
      return (
        <div>
          <div className="column-list-item">
            <span>{record.date}</span>
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
              {record.journalNumber}
            </span>
            <span>{record.status}</span>
          </div>
        </div>
      );
    },
  },
];

const PaginatedJournal = ({
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
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { business } = useOutletContext();
  const [currentPage, setCurrentPage] = useHistoryState(
    "journalCurrentPage",
    1
  );
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "journalSearchCriteria",
    null
  );
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [cmtColumnOpen, setCmtColumnOpen] = useState(false);
  const [pdfModalOpen, setPDFModalOpen] = useState(false);

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
        journalNumber: values.journalNumber,
        // notes: values.notes,
        fromDate: values.dateRange && values.dateRange[0],
        toDate: values.dateRange && values.dateRange[1],
        branchId: values.branch,
        referenceNumber: values.referenceNumber,
      };
      // console.log("values ", values);
      // console.log("input", input);
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
    <>
      {" "}
      <PDFPreviewModal modalOpen={pdfModalOpen} setModalOpen={setPDFModalOpen}>
        <JournalPDF selectedRecord={selectedRecord} business={business} />
      </PDFPreviewModal>
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <p className="page-header-text">
              {selectedRecord ? "Journals" : "Manual Journals"}
            </p>
            <div className="header-buttons">
              <div className="new-journal-buttons-container">
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
                  {!selectedRecord && "New Journal"}
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
                  {searchCriteria.journalNumber && (
                    <li>
                      Journal Number contains{" "}
                      <b>{searchCriteria.journalNumber}</b>
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
                      Journal Date between{" "}
                      <b>
                        {moment(searchCriteria.fromDate).format("DD MMM YYYY")}{" "}
                        and{" "}
                        {moment(searchCriteria.toDate).format("DD MMM YYYY")}
                      </b>
                    </li>
                  )}
                  {/* {searchCriteria.notes && (
                  <li>
                    Notes contains <b>{searchCriteria.notes}</b>
                  </li>
                )} */}
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
                className="search-journal-modal"
                width="65.5rem"
                title={
                  <FormattedMessage
                    id="journal.search"
                    defaultMessage="Search Journal"
                  />
                }
                okText={
                  <FormattedMessage
                    id="button.search"
                    defaultMessage="Search"
                  />
                }
                cancelText={
                  <FormattedMessage
                    id="button.cancel"
                    defaultMessage="Cancel"
                  />
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

        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <p className="page-header-text">{selectedRecord.journalNumber}</p>
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
                onClick={() => onEdit(selectedRecord, navigate, location)}
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
              <div>
                <Dropdown
                  loading={loading}
                  trigger="click"
                  // key={record.key}
                  menu={{
                    onClick: ({ key }) => {
                      if (key === "1") console.log("Clone");
                      else if (key === "2") {
                        if (onDelete(selectedRecord.id))
                          setSelectedRecord(null);
                      }
                    },
                    items: [
                      {
                        label: "Clone",
                        key: "1",
                      },
                      {
                        label: (
                          <FormattedMessage
                            id="button.delete"
                            defaultMessage="Delete"
                          />
                        ),
                        key: "2",
                      },
                    ],
                  }}
                >
                  <MoreOutlined />
                </Dropdown>
              </div>
            </Row>
            <Row className="content-column-full-row">
              <JournalTemplate selectedRecord={selectedRecord} />
            </Row>
            <CommentColumn
              open={cmtColumnOpen}
              setOpen={setCmtColumnOpen}
              referenceType="journals"
              referenceId={selectedRecord?.id}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PaginatedJournal;
