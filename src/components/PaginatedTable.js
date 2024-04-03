import React, { useState, useEffect } from "react";
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  PlusOutlined,
  SearchOutlined,
  ClearOutlined,
  CloseOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Row,
  Space,
  Table,
  Modal,
  Tooltip,
  Empty,
  Dropdown,
} from "antd";
import { useQuery, useLazyQuery } from "@apollo/client";
import { FormattedMessage } from "react-intl";
import { useNavigate, useLocation } from "react-router-dom";
import { openErrorNotification } from "../utils/Notification";
import { paginateArray, useHistoryState } from "../utils/HelperFunctions";
import { QUERY_DATA_LIMIT } from "../config/Constants";

const compactColumns = [
  {
    title: "",
    dataIndex: "name",
    render: (_, record) => {
      return (
        <div className="table-list-item">
          <div className="table-list-item-title">{record.name}</div>
        </div>
      );
    },
  },
];

const PaginatedTable = ({
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
  parseSearchData,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useHistoryState("currentPage", 1);
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "searchCriteria",
    null
  );
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

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
            first: QUERY_DATA_LIMIT,
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

  const handleModalSearch = async () => {
    try {
      await search({
        variables: searchFormRef.getFieldsValue(),
      });
      setSearchCriteria(searchFormRef.getFieldsValue());
      setSearchModalOpen(false);
    } catch (err) {
      openErrorNotification(api, err.message);
    }
  };

  const handleModalCancel = () => {
    setSearchModalOpen(false);
  };

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);
  };

  const [search, { loading: searchLoading, data: searchData }] = useLazyQuery(
    searchQqlQuery,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
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
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    variables: {
      first: QUERY_DATA_LIMIT,
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
  console.log(allData);
  const pageData = paginateArray(allData, QUERY_DATA_LIMIT, currentPage);
  const totalPages = Math.ceil(allData.length / QUERY_DATA_LIMIT);
  let hasPreviousPage = currentPage > 1 ? true : false;
  let hasNextPage = false;
  let refetchEnabled = true;
  if (currentPage === totalPages) {
    const pageInfo = parsePageInfo(data);
    hasNextPage = pageInfo.hasNextPage;
  } else if (currentPage < totalPages) {
    hasNextPage = true;
  }
  if (searchCriteria) {
    hasNextPage = false;
    hasPreviousPage = false;
    refetchEnabled = false;
  }

  const loading = queryLoading || searchLoading;

  return (
    <div className="wrapper">
      <div className="paginated-table">
        {showSearch && (
          <Modal
            title={
              <FormattedMessage
                id="modal.search"
                defaultMessage="Search Panel"
              />
            }
            closeIcon={true}
            style={{
              top: 65,
            }}
            open={searchModalOpen}
            onOk={handleModalSearch}
            onCancel={handleModalCancel}
            footer={[
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleModalSearch}
              >
                <FormattedMessage id="button.search" defaultMessage="Search" />
              </Button>,
              <Button key="clear" loading={loading} onClick={handleModalClear}>
                <FormattedMessage id="button.clear" defaultMessage="Clear" />
              </Button>,
            ]}
          >
            {searchForm}
          </Modal>
        )}
        <Row style={{ justifyContent: "space-between", marginBottom: 5 }}>
          <Space>
            {showSearch && (
              <Tooltip
                title={
                  <FormattedMessage
                    id="button.search"
                    defaultMessage="Search"
                  />
                }
              >
                <Button
                  icon={<SearchOutlined />}
                  loading={loading}
                  onClick={() => setSearchModalOpen(true)}
                />
              </Tooltip>
            )}
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
          <Space>
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
        <Table
          className={selectedRecord ? "column-width" : "full-width"}
          rowKey="id"
          loading={loading}
          columns={selectedRecord ? compactColumns : columns}
          dataSource={searchCriteria ? parseSearchData(searchData) : pageData}
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
      </div>

      {selectedRecord && (
        <div className="content-column">
          <Row
            className="content-column-header-row"
            style={{
              backgroundColor: "white",
              justifyContent: "space-between",
            }}
          >
            <div className="content-title-block">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="content-title-sub">
                  {selectedRecord.detailType}
                </div>
                {/* {!selectedRecord.isActive && (
              <Tag color="magenta">
                <FormattedMessage
                  id="status.inactive"
                  defaultMessage="Inactive"
                />
              </Tag>
            )} */}
              </div>
              <div className="content-title-main">{selectedRecord.name}</div>
            </div>
            <Button
              icon={<CloseOutlined />}
              type="text"
              loading={loading}
              onClick={() => {
                setSelectedRecord(null);
                setSelectedRowIndex(0);
              }}
            />
          </Row>
          <Row className="content-column-action-row">
            <Dropdown.Button
              trigger={["click"]}
              type="text"
              icon={<MoreOutlined />}
              loading={loading}
              onClick={() => {
                onEdit(selectedRecord, navigate, location);
              }}
              menu={{
                items: [
                  // {
                  //   label: selectedRecord?.isActive ? (
                  //     <FormattedMessage
                  //       id="button.markAsInactive"
                  //       defaultMessage="Mark as Inactive"
                  //     />
                  //   ) : (
                  //     <FormattedMessage
                  //       id="button.markAsActive"
                  //       defaultMessage="Mark as Active"
                  //     />
                  //   ),
                  //   key: "1",
                  //   icon: selectedRecord?.isActive ? (
                  //     <MinusCircleOutlined />
                  //   ) : (
                  //     <PlusCircleOutlined />
                  //   ),
                  // },
                  {
                    label: (
                      <FormattedMessage
                        id="button.delete"
                        defaultMessage="Delete"
                      />
                    ),
                    key: "2",
                    icon: <DeleteOutlined />,
                  },
                ],
                onClick: async ({ key }) => {
                  onDelete(selectedRecord);
                },
              }}
            >
              <EditOutlined />
              <FormattedMessage id="button.edit" defaultMessage="Edit" />
            </Dropdown.Button>
          </Row>
          <Row
            className="content-column-brief-row"
            style={{ backgroundColor: "white" }}
          >
            <div className="content-title-block">
              {/* <Statistic
              title={
                "Category"
              }
              value={100000}
              // valueStyle={{ color: Theme.colorPrimary }}
              prefix="MMK"
            /> */}
              <h4>{selectedRecord.name}</h4>
              <div className="content-description">
                <span style={{ fontStyle: "italic" }}>
                  <FormattedMessage
                    id="account.description"
                    defaultMessage="City"
                  />
                </span>
                :{selectedRecord.city ? selectedRecord.city : " - "}
              </div>
            </div>
          </Row>
          <Row className="content-column-full-row">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Row>
        </div>
      )}
    </div>
  );
};

export default PaginatedTable;
