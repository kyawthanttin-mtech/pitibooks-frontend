import React from "react";
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Row, Space, Table, Modal, Tooltip } from "antd";
import { useQuery, useLazyQuery } from "@apollo/client";
import { FormattedMessage } from "react-intl";
import { openErrorNotification } from "../utils/Notification";
import { paginateArray, useHistoryState } from "../utils/HelperFunctions";
import { QUERY_DATA_LIMIT } from "../config/Constants";

const PaginatedSelectionTable = ({
  api,
  columns = [],
  compactColumns = [],
  gqlQuery,
  parseData,
  parsePageInfo,
  searchForm,
  searchFormRef,
  searchQqlQuery,
  selectedRecord,
  selectedRowIndex,
  setSelectedRecord,
  setSelectedRowIndex,
  setCreateModalOpen,
  searchCriteria,
  setSearchCriteria,
  searchModalOpen,
  setSearchModalOpen,
}) => {

  const [currentPage, setCurrentPage] = useHistoryState("currentPage", 1);

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
  // let notYet = false;
  //   useEffect(() => {
  //     if (searchCriteria && notYet) {
  //       searchFormRef.setFieldsValue(searchCriteria);
  //       search({
  //         variables: searchCriteria,
  //       });
  //     }
  //   }, [searchCriteria, searchFormRef, search,  notYet]);

  const allData = parseData(data);
  const searchResults = parseData(searchData);
  const pageData = paginateArray(allData, QUERY_DATA_LIMIT, currentPage);
  const searchPageData = paginateArray(
    searchResults,
    QUERY_DATA_LIMIT,
    currentPage
  );
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
    <>
      <Modal
        width="65.5rem"
        title={
          <FormattedMessage
            id="modal.search"
            defaultMessage="Search"
          />
        }
        okText={<FormattedMessage id="button.search" defaultMessage="Search" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={searchModalOpen}
        onOk={handleModalSearch}
        onCancel={handleModalCancel}
        okButtonProps={loading}
      >
        {searchForm}
      </Modal>
      <Table
        className={selectedRecord ? "header-less-table" : "main-table"}
        rowKey={(record) => record.id}
        loading={loading}
        columns={selectedRecord ? compactColumns : columns}
        dataSource={searchCriteria ? searchPageData : pageData}
        pagination={false}
        rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
        onRow={(record) => {
          return {
            onClick: () => {
              setSelectedRecord(record);
              setSelectedRowIndex(record.id);
            },
          };
        }}
      />
      <Row style={{ justifyContent: "space-between", marginBottom: 5 }}>
        <div></div>
        <Space style={{ padding: "0.5rem 1.5rem 0 0" }}>
          <Tooltip
            title={
              <FormattedMessage id="button.refetch" defaultMessage="Refetch" />
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
            title={<FormattedMessage id="button.next" defaultMessage="Next" />}
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
    </>
  );
};

export default PaginatedSelectionTable;
