import React, { useState, useEffect, useMemo } from "react";
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Row, Space, Table, Modal, Tooltip } from "antd";
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
  showSearch = false,
  searchForm,
  searchFormRef,
  searchQqlQuery,
  parseSearchData,
  setHoveredRow,
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
  !loading && console.log(data);

  return (
    <div>
      <div>
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

        <Table
          className="main-table"
          rowKey={(record) => record.id}
          loading={loading}
          columns={columns}
          dataSource={searchCriteria ? parseSearchData(searchData) : pageData}
          pagination={false}
          onRow={(record) => {
            if (setHoveredRow) {
              return {
                key: record.id,
                onMouseEnter: () => setHoveredRow(record.id),
                onMouseLeave: () => setHoveredRow(null),
              };
            } else {
              return {
                key: record.id,
              };
            }
          }}
        />

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
            {/* {showAddNew && (
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
            )} */}
          </Space>
          <Space style={{ padding: "0.5rem 1.5rem 0 0" }}>
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
  );
};

export default PaginatedTable;
