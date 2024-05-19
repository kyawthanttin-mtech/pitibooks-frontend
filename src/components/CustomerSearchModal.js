import React, { useState } from "react";
import {
  Button,
  Input,
  Table,
  Divider,
  Flex,
  Dropdown,
  Modal,
  Space,
  Tooltip,
  Row,
  Form,
} from "antd";
import { CaretDownFilled } from "@ant-design/icons";
import { LeftOutlined, RightOutlined, SyncOutlined } from "@ant-design/icons";
import { useQuery, useLazyQuery } from "@apollo/client";
import { FormattedMessage } from "react-intl";
import { useHistoryState, paginateArray } from "../utils/HelperFunctions";
import { openErrorNotification } from "../utils/Notification";
import { MODAL_QUERY_DATA_LIMIT } from "../config/Constants";
import { useOutletContext } from "react-router-dom";
import { CustomerQueries } from "../graphql";

const { GET_PAGINATE_CUSTOMER } = CustomerQueries;

const items = [
  {
    key: "1",
    label: "Customer Name",
  },
  {
    key: "2",
    label: "Email",
  },
  {
    key: "3",
    label: "Phone",
  },
  {
    key: "4",
    label: "Mobile",
  },
];

const searchColumns = [
  {
    title: "Customer Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Mobile",
    dataIndex: "mobile",
    key: "mobile",
  },
];

const CustomerSearchModal = ({ modalOpen, setModalOpen, onRowSelect }) => {
  const { notiApi } = useOutletContext();
  const [form] = Form.useForm();
  const [searchType, setSearchType] = useState({
    key: "1",
    label: "Customer Name",
  });

  const [currentPage, setCurrentPage] = useHistoryState("currentPage", 1);
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "searchCriteria",
    null
  );

  const parseData = (data) => {
    let customers = [];
    data?.paginateCustomer?.edges.forEach(({ node }) => {
      if (node != null) {
        customers.push({
          key: node.id,
          ...node,
        });
      }
    });
    return customers ? customers : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateCustomer) {
      pageInfo = {
        hasNextPage: data.paginateCustomer.pageInfo.hasNextPage,
        endCursor: data.paginateCustomer.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const handleSearchTypeChange = (key) => {
    const selectedType = items.find((option) => option.key === key);
    setSearchType(selectedType);
  };

  const handleRefetch = async () => {
    try {
      await refetch();
      setCurrentPage(1);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
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
            limit: MODAL_QUERY_DATA_LIMIT,
            after: parsePageInfo(data).endCursor,
          },
        });
        setCurrentPage(currentPage + 1);
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = async (searchValue) => {
    try {
      let searchInput = {};
      switch (searchType.key) {
        case "1":
          searchInput = { name: searchValue };
          break;
        case "2":
          searchInput = { email: searchValue };
          break;
        case "3":
          searchInput = { phone: searchValue };
          break;
        case "4":
          searchInput = { mobile: searchValue };
          break;
        default:
          break;
      }
      await search({
        variables: {
          isActive: true,
          ...searchInput,
        },
      });
      setSearchCriteria(searchInput);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  // const handleSearchClear = () => {
  //   setSearchCriteria(null);
  // };

  const handleRowSelect = (record) => {
    onRowSelect(record);
    setModalOpen(false);
    setSearchCriteria(null);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setSearchCriteria(null);
    setModalOpen(false);
    form.resetFields();
  };

  const [search, { loading: searchLoading, data: searchData }] = useLazyQuery(
    GET_PAGINATE_CUSTOMER,
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
  } = useQuery(GET_PAGINATE_CUSTOMER, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: MODAL_QUERY_DATA_LIMIT,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  // useEffect(() => {
  //   if (searchCriteria) {
  //     searchFormRef.setFieldsValue(searchCriteria);
  //     search({
  //       variables: searchCriteria,
  //     });
  //   }
  // }, [searchCriteria, searchFormRef, search]);

  const allData = parseData(data);
  const searchResults = parseData(searchData);
  const pageData = paginateArray(allData, MODAL_QUERY_DATA_LIMIT, currentPage);
  const searchPageData = paginateArray(
    searchResults,
    MODAL_QUERY_DATA_LIMIT,
    currentPage
  );
  const totalPages = Math.ceil(allData.length / MODAL_QUERY_DATA_LIMIT);
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
    <Modal
      loading={loading}
      title={
        <FormattedMessage
          id="customer.advancedSearch"
          defaultMessage="Advanced Customer Search"
        />
      }
      width="50rem"
      open={modalOpen}
      onCancel={handleModalCancel}
      footer={null}
    >
      <Flex>
        <Dropdown
          menu={{
            items: items?.map((item) => ({
              ...item,
              onClick: ({ key }) => handleSearchTypeChange(key),
            })),
            selectable: true,
            selectedKeys: [searchType.key],
          }}
          trigger="click"
        >
          <Button className="search-type-btn" icon>
            <Space>
              {searchType.label}
              <CaretDownFilled style={{ width: 12, height: 12 }} />
            </Space>
          </Button>
        </Dropdown>
        <Form form={form} style={{ width: "100%" }}>
          <Form.Item name="searchInput" style={{ margin: 0 }}>
            <Input.Search
              allowClear
              enterButton="Search"
              style={{ borderRadius: 0 }}
              className="search-input-modal"
              onSearch={(value) => handleSearch(value)}
              // onClear={handleSearchClear}
            />
          </Form.Item>
        </Form>
      </Flex>
      <Divider style={{ marginBottom: 0 }}></Divider>
      <Table
        className="main-table"
        rowKey={(record) => record.id}
        loading={loading}
        columns={searchColumns}
        dataSource={searchCriteria ? searchPageData : pageData}
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleRowSelect(record),
        })}
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
    </Modal>
  );
};

export default CustomerSearchModal;
