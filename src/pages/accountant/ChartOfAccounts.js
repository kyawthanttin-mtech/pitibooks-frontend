import React, { useState, useMemo, useEffect } from "react";

import "./ChartOfAccounts.css";

import {
  Button,
  Col,
  Space,
  Table,
  Row,
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Tag,
  Flex,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  SettingOutlined,
  CloseOutlined,
  EditOutlined,
  PaperClipOutlined,
  DownOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useHistoryState } from "../../utils/HelperFunctions";
import { ReactComponent as TreeIndicatorOutlined } from "../../assets/icons/TreeIndicatorOutlined.svg";
import { ReactComponent as PivotColumnOutlined } from "../../assets/icons/PivotColumnOutlined.svg";
import { AccountQueries, AccountMutations } from "../../graphql";
const { GET_ACCOUNTS } = AccountQueries;
const {
  CREATE_ACCOUNT,
  UPDATE_ACCOUNT,
  DELETE_ACCOUNT,
  TOGGLE_ACTIVE_ACCOUNT,
} = AccountMutations;

const compactColumns = [
  {
    title: <PivotColumnOutlined />,
    width: 56,
    dataIndex: "actions1",
    key: "actions1",
    render: (_, record) =>
      record.isSystemDefault ? (
        <LockOutlined style={{ color: "gray" }} />
      ) : (
        <></>
      ),
  },
  {
    title: "Account Name",
    dataIndex: "accountName",
    key: "accountName",
    // ellipsis: true,
    render: (_, record) => {
      if (record.level) {
        return (
          <span style={{ marginLeft: 8 * record.level }}>
            <TreeIndicatorOutlined className="tree-indicator-icon" />
            <span style={{ paddingLeft: 15 }}>
              {record.accountName}{" "}
              {!record.isActive ? (
                <Tag className="active-status">inactive</Tag>
              ) : (
                <></>
              )}
            </span>
          </span>
        );
      } else {
        return (
          <>
            {record.accountName}{" "}
            {!record.isActive ? (
              <Tag className="active-status">inactive</Tag>
            ) : (
              <></>
            )}
          </>
        );
      }
    },
  },
];

const transactionTableColumns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Transaction Details",
    dataIndex: "transactionDetails",
    key: "transactionDetails",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Debit",
    dataIndex: "debit",
    key: "debit",
  },
  {
    title: "Credit",
    dataIndex: "credit",
    key: "credit",
  },
];

const transactionTableDataSource = [
  {
    key: 1,
    date: "27 Jan 2024",
    transactionDetails: "-",
    type: "Other Income",
    debit: "MMK300,000.00",
  },
  {
    key: 2,
    date: "27 Jan 2024",
    transactionDetails: "-",
    type: "Interest Income",
    debit: "MMK3,000.00",
  },
  {
    key: 3,
    date: "13 Jan 2024",
    transactionDetails: "Royal Taw Win Company",
    type: "Payments Made",
    credit: "MMK1,900.00",
  },
  {
    key: 4,
    date: "13 Jan 2024",
    transactionDetails: "Ma Nan",
    type: "Invoice Payment",
    debit: "MMK63,000.00",
  },
];

const accountTypes = [
  {
    mainType: "Asset",
    id: 1,
    detailTypes: [
      { name: "Other Asset", id: 11 },
      { name: "Other Current Asset", id: 12 },
      { name: "Cash", id: 13 },
      { name: "Bank", id: 14 },
      { name: "Fixed Asset", id: 15 },
      { name: "Stock", id: 16 },
      { name: "Payment Clearing", id: 17 },
      { name: "Input Tax", id: 18 },
      { name: "Accounts Receivable", id: 19 },
    ],
  },
  {
    mainType: "Liability",
    id: 2,
    detailTypes: [
      { name: "Other Current Liability", id: 21 },
      { name: "Long Term Liability", id: 22 },
      { name: "Other Liability", id: 23 },
      { name: "Oversea Tax Payload", id: 24 },
      { name: "Output Tax", id: 25 },
      { name: "Accounts Payable", id: 26 },
    ],
  },
  {
    mainType: "Equity",
    id: 3,
    detailTypes: [{ name: "Equity", id: 31 }],
  },
  {
    mainType: "Income",
    id: 4,
    detailTypes: [
      { name: "Income", id: 41 },
      { name: "Other Income", id: 42 },
    ],
  },
  {
    mainType: "Expense",
    id: 6,
    detailTypes: [
      { name: "Expense", id: 61 },
      { name: "Cost Of Goods Sold", id: 62 },
      { name: "Other Expense", id: 63 },
    ],
  },
];

const ChartOfAccounts = () => {
  const {notiApi, msgApi, refetchAllAccounts} = useOutletContext();
  const [deleteModal, contextHolder] = Modal.useModal();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [searchFormRef] = Form.useForm();
  const [editRecord, setEditRecord] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [parentAccountOptions, setParentAccountOptions] = useState([]);
  const [filterAccount, setFilterAccount] = useState({
    key: "1",
    label: "All Accounts",
  });
  const subAccountCheckedNew = Form.useWatch("subAccount", createFormRef);
  const subAccountCheckedEdit = Form.useWatch("subAccount", editFormRef);
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "searchCriteria",
    null
  );

  // Queries
  const { data, loading: queryLoading } = useQuery(GET_ACCOUNTS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const [search, { loading: searchLoading, data: searchData }] = useLazyQuery(
    GET_ACCOUNTS,
    {
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );

  // console.log("search data", searchData);

  // Mutations
  const [createAccount, { loading: createLoading }] = useMutation(
    CREATE_ACCOUNT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="account.created"
            defaultMessage="New Account Created"
          />
        );
        refetchAllAccounts();
      },
      refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [updateAccount, { loading: updateLoading }] = useMutation(
    UPDATE_ACCOUNT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="account.updated"
            defaultMessage="Account Updated"
          />
        );
        refetchAllAccounts();
      },
      refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [deleteAccount, { loading: deleteLoading }] = useMutation(
    DELETE_ACCOUNT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="account.deleted"
            defaultMessage="Account Deleted"
          />
        );
        refetchAllAccounts();
      },
      refetchQueries: [GET_ACCOUNTS],
    }
  );

  const [markAccountActive, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_ACCOUNT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="account.updated.status"
            defaultMessage="Account Status Updated"
          />
        );
        refetchAllAccounts();
      },
      refetchQueries: [GET_ACCOUNTS],
    }
  );

  const parseData = (data) => {
    let accounts = [];
    data?.listAccount?.map((acc) => {
      accounts.push({
        id: acc?.id,
        accountName: acc?.name,
        accountCode: acc?.code,
        accountType: acc?.detailType.split(/(?=[A-Z])/).join(" "),
        mainType: acc?.mainType,
        parentAccountName: acc?.parentAccount.name,
        description: acc?.description,
        isSystemDefault: acc?.isSystemDefault,
        parentAccount: acc?.parentAccount,
        isActive: acc?.isActive,
      });
      return null;
    });
    return accounts ? accounts : [];
  };

  const queryData = useMemo(() => {
    const parsedData = parseData(data);
    let queryData = parsedData ? parsedData : [];
    let tempData = parsedData?.filter((x) => x.parentAccount?.id === 0);
    let queryLoopTimes = 0;
    while (parsedData?.length !== tempData?.length && queryLoopTimes < 10) {
      // eslint-disable-next-line no-loop-func
      parsedData.forEach((x) => {
        if (x.parentAccount?.id > 0) {
          const found =
            tempData.findIndex((y) => y.id === x.id) >= 0 ? true : false;
          const index = tempData.findIndex((y) => y.id === x.parentAccount.id);
          if (!found && index >= 0) {
            const parent = tempData.find((y) => y.id === x.parentAccount.id);
            tempData.splice(index + 1, 0, {
              ...x,
              level: parent.level ? parent.level + 1 : 1,
            });
          }
        }
      });
      queryLoopTimes++;
    }
    queryData = tempData;
    switch (filterAccount.key) {
      case "2":
        queryData = queryData.filter((data) => data.isActive);
        break;
      case "3":
        queryData = queryData.filter((data) => !data.isActive);
        break;
      case "4":
        queryData = queryData.filter((data) => data.mainType === "Asset");
        break;
      case "5":
        queryData = queryData.filter((data) => data.mainType === "Liability");
        break;
      case "6":
        queryData = queryData.filter((data) => data.mainType === "Equity");
        break;
      case "7":
        queryData = queryData.filter((data) => data.mainType === "Income");
        break;
      case "8":
        queryData = queryData.filter((data) => data.mainType === "Expense");
        break;
      default:
      // do nothing
    }
    // console.log("query data", queryData);
    return queryData;
  }, [data, filterAccount]);

  const loading =
    queryLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading ||
    toggleActiveLoading ||
    searchLoading;

  const handleAccountTypeChange = (value) => {
    setParentAccountOptions([]);
    createFormRef.setFieldValue("parentAccount");
    editFormRef.setFieldValue("parentAccount");

    const selectedType = accountTypes
      .flatMap((group) => group.detailTypes)
      .find((option) => option.id === value);

    const detailTypeName = selectedType?.name;
    setDetailType(detailTypeName);
  };

  useEffect(() => {
    if (detailType) {
      const filteredData = queryData?.filter(
        (item) => item.accountType === detailType
      );
      setParentAccountOptions(filteredData);
      // console.log("Parent account options", filteredData);
    }
  }, [detailType, queryData]);

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      const mainTypeId = Math.floor(values.type / 10);
      const selectedMainType = accountTypes.find(
        (group) => group.id === mainTypeId
      );
      const mainType = selectedMainType.mainType;

      const input = {
        detailType: detailType.split(" ").join(""),
        mainType: mainType,
        code: values.code,
        name: values.name,
        parentAccountId:
          values.parentAccount && subAccountCheckedNew
            ? values.parentAccount
            : 0,
      };

      // console.log("Field values:", input);
      await createAccount({ variables: { input: input } });
      setCreateModalOpen(false);
      setDetailType(null);
      setParentAccountOptions([]);
      createFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleCreateModalCancel = () => {
    setDetailType(null);
    setParentAccountOptions([]);
    setCreateModalOpen(false);
    createFormRef.resetFields();
  };

  const handleFilterChange = (key) => {
    const selectedFilter = filterOptions.find((option) => option.key === key);
    setFilterAccount(selectedFilter);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    editFormRef.resetFields();
    const detailTypeName = record?.accountType;
    const selectedType = accountTypes
      .flatMap((group) => group.detailTypes)
      .find((option) => option.name === detailTypeName);
    setDetailType(detailTypeName);

    handleAccountTypeChange(selectedType.id);

    editFormRef.setFieldsValue({
      id: record.id,
      name: record.accountName,
      type: selectedType?.id,
      code: record.accountCode,
      description: record.description,
    });
    if (record.parentAccount.id && record.parentAccount.id > 0) {
      editFormRef.setFieldsValue({
        subAccount: true,
        parentAccount: record.parentAccount.id,
      });
    }
    setEditModalOpen(true);
  };

  const handleToggleActive = async (record) => {
    try {
      await markAccountActive({
        variables: { id: record.id, isActive: !record.isActive },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleDelete = async (record) => {
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
        await deleteAccount({
          variables: {
            id: record.id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      const mainTypeId = Math.floor(values.type / 10);
      const selectedMainType = accountTypes.find(
        (group) => group.id === mainTypeId
      );
      const mainType = selectedMainType.mainType;

      const input = {
        detailType: detailType.split(" ").join(""),
        mainType: mainType,
        code: values.code,
        name: values.name,
        parentAccountId:
          values.parentAccount && subAccountCheckedEdit
            ? values.parentAccount
            : 0,
      };
      // console.log("field values", editRecord);
      await updateAccount({
        variables: { id: editRecord.id, input: input },
      });

      setEditModalOpen(false);
      editFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleEditModalCancel = () => {
    setDetailType(null);
    setParentAccountOptions([]);
    editFormRef.resetFields();
    setEditModalOpen(false);
  };

  const handleSearchModalCancel = () => {
    setSearchModalOpen(false);
  };

  const handleSearchModalClear = () => {
    searchFormRef.resetFields();
    setSearchModalOpen(false);
    setSearchCriteria(null);
  };

  const handleSearchModalOk = async () => {
    try {
      const values = await searchFormRef.validateFields();
      const input = {
        name: values.name,
        code: values.code,
      };
      await search({
        variables: {
          ...input,
        },
      });
      setSearchCriteria(input);
      setSearchModalOpen(false);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const createForm = (
    <Form form={createFormRef} onFinish={handleCreateModalOk}>
      <Form.Item
        label="Account Type"
        name="type"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select
          showSearch
          onChange={(value) => handleAccountTypeChange(value)}
          allowClear
        >
          {accountTypes.map((group) => (
            <Select.OptGroup key={group.id} label={group.mainType}>
              {group.detailTypes.map((options) => (
                <Select.Option key={options.id} value={options.id}>
                  {options.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Account Name"
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        shouldUpdate
        name="subAccount"
        valuePropName="checked"
        wrapperCol={{ span: 13, offset: 8 }}
      >
        <Checkbox>Make this a sub-account</Checkbox>
      </Form.Item>
      {subAccountCheckedNew && (
        <Form.Item
          label="Parent Account"
          name="parentAccount"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 13 }}
        >
          <Select allowClear placeholder="Select an account">
            {detailType && parentAccountOptions.length > 0 && (
              <Select.OptGroup
                label={detailType?.split(/(?=[A-Z])/).join(" ")}
                key={detailType}
              >
                {parentAccountOptions.map((option) => (
                  <Select.Option key={option.id} value={option.id}>
                    {option.accountName}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            )}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        label="Account Code"
        name="code"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label="Description"
        description="description"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input.TextArea maxLength={1000} rows="4"></Input.TextArea>
      </Form.Item>
    </Form>
  );

  const editForm = (
    <Form form={editFormRef} onFinish={handleEditModalOk}>
      <Form.Item
        label="Account Type"
        name="type"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select
          showSearch
          onChange={(value) => handleAccountTypeChange(value)}
          allowClear
        >
          {accountTypes.map((group) => (
            <Select.OptGroup key={group.id} label={group.mainType}>
              {group.detailTypes.map((options) => (
                <Select.Option key={options.id} value={options.id}>
                  {options.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Account Name"
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        shouldUpdate
        name="subAccount"
        valuePropName="checked"
        wrapperCol={{ span: 13, offset: 8 }}
      >
        <Checkbox>Make this a sub-account</Checkbox>
      </Form.Item>
      {subAccountCheckedEdit && (
        <Form.Item
          label="Parent Account"
          name="parentAccount"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 13 }}
        >
          <Select allowClear placeholder="Select an account">
            {detailType && parentAccountOptions.length > 0 && (
              <Select.OptGroup
                label={detailType?.split(/(?=[A-Z])/).join(" ")}
                key={detailType}
              >
                {parentAccountOptions.map((option) => (
                  <Select.Option key={option.id} value={option.id}>
                    {option.accountName}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            )}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        label="Account Code"
        name="code"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label="Description"
        description="description"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input.TextArea maxLength={1000} rows="4"></Input.TextArea>
      </Form.Item>
    </Form>
  );

  const searchForm = (
    <Form form={searchFormRef} onFinish={handleSearchModalOk}>
      <Row>
        <Col span={12}>
          <Form.Item
            label="Account Name"
            name="name"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Account Code"
            name="code"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const accountTableColumns = [
    {
      title: <PivotColumnOutlined />,
      width: 56,
      dataIndex: "actions1",
      key: "actions1",
      render: (_, record) =>
        record.isSystemDefault ? (
          <LockOutlined style={{ color: "gray" }} />
        ) : (
          <></>
        ),
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      render: (_, record) => {
        if (record.level) {
          return (
            <span style={{ marginLeft: 8 * record.level }}>
              <TreeIndicatorOutlined className="tree-indicator-icon" />
              <span style={{ paddingLeft: 15 }}>
                {record.accountName}{" "}
                {!record.isActive ? (
                  <Tag className="active-status">inactive</Tag>
                ) : (
                  <></>
                )}
              </span>
            </span>
          );
        } else {
          return (
            <>
              {record.accountName}{" "}
              {!record.isActive ? (
                <Tag className="active-status">inactive</Tag>
              ) : (
                <></>
              )}
            </>
          );
        }
      },
    },
    {
      title: "Account Code",
      dataIndex: "accountCode",
      key: "accountCode",
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType",
    },
    {
      title: "Parent Account Name",
      dataIndex: "parentAccountName",
      key: "parentAccountName",
    },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        />
      ),
      dataIndex: "actions2",
      key: "actions2",
      render: (_, record) =>
        !record.isSystemDefault ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              loading={loading}
              key={record.key}
              menu={{
                onClick: ({ key }) => {
                  if (key === "1") handleEdit(record);
                  else if (key === "2") handleToggleActive(record);
                  else if (key === "3") handleDelete(record);
                },
                items: [
                  {
                    label: (
                      <FormattedMessage
                        id="button.edit"
                        defaultMessage="Edit"
                      />
                    ),
                    key: "1",
                  },
                  {
                    label: !record.isActive ? (
                      <FormattedMessage
                        id="button.markActive"
                        defaultMessage="Mark As Active"
                      />
                    ) : (
                      <FormattedMessage
                        id="button.markInactive"
                        defaultMessage="Mark As Inactive"
                      />
                    ),
                    key: "2",
                  },
                  {
                    label: (
                      <FormattedMessage
                        id="button.delete"
                        defaultMessage="Delete"
                      />
                    ),
                    key: "3",
                  },
                ],
              }}
            >
              <SettingOutlined />
            </Dropdown>
          </div>
        ) : (
          <></>
        ),
    },
  ];

  const filterOptions = [
    {
      key: "1",
      label: "All Accounts",
    },
    {
      key: "2",
      label: "Active Accounts",
    },
    {
      key: "3",
      label: "Inactive Accounts",
    },
    {
      key: "4",
      label: "Asset Accounts",
    },
    {
      key: "5",
      label: "Liability Accounts",
    },
    {
      key: "6",
      label: "Equity Accounts",
    },
    {
      key: "7",
      label: "Income Accounts",
    },
    {
      key: "8",
      label: "Expense Accounts",
    },
  ];

  return (
    <>
      {contextHolder}
      <Modal
        loading={loading}
        width="40rem"
        title="Create Account"
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={createModalOpen}
        onCancel={handleCreateModalCancel}
        onOk={createFormRef.submit}
      >
        {createForm}
      </Modal>
      <Modal
        loading={loading}
        width="40rem"
        title="Edit Account"
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={editModalOpen}
        onCancel={handleEditModalCancel}
        onOk={editFormRef.submit}
      >
        {editForm}
      </Modal>
      <Modal
        loading={loading}
        width="40rem"
        title={
          <FormattedMessage
            id="account.search"
            defaultMessage="Search Account"
          />
        }
        okText={<FormattedMessage id="button.search" defaultMessage="Search" />}
        open={searchModalOpen}
        onCancel={handleSearchModalCancel}
        onOk={searchFormRef.submit}
      >
        {searchForm}
      </Modal>
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <Dropdown
              // onChange={(value) => console.log("value")}
              trigger="click"
              menu={{
                items: filterOptions.map((item) => ({
                  ...item,
                  onClick: ({ key }) => handleFilterChange(key),
                })),
                selectable: true,
                selectedKeys: [filterAccount.key],
              }}
            >
              <div className="page-header-text" style={{ cursor: "pointer" }}>
                <Space>
                  {filterAccount.label}
                  <DownOutlined
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--primary-color)",
                    }}
                  />
                </Space>
              </div>
            </Dropdown>

            <div>
              <Space>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setCreateModalOpen(true)}
                >
                  {!selectedRecord && "New Account"}
                </Button>
                <Button icon={<MoreOutlined />}></Button>
              </Space>
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
                    onClick={handleSearchModalClear}
                  />
                </Flex>
                <ul style={{ paddingLeft: "1.5rem" }}>
                  {searchCriteria.name && (
                    <li>
                      Account Name contains <b>{searchCriteria.name}</b>
                    </li>
                  )}
                  {searchCriteria.code && (
                    <li>
                      Account Code contains <b>{searchCriteria.code}</b>
                    </li>
                  )}
                </ul>
              </div>
            )}
            <Table
              className={selectedRecord ? "column-table" : "main-table"}
              rowKey={(record) => record.id}
              dataSource={searchCriteria ? parseData(searchData) : queryData}
              pagination={false}
              columns={selectedRecord ? compactColumns : accountTableColumns}
              loading={loading}
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
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Other Current Asset</span>
                <span>Sales to Customers (Cash)</span>
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
              <div className="actions">
                <EditOutlined style={{ marginRight: "0.5rem" }} />
                Edit
              </div>
              <div>
                <MoreOutlined />
              </div>
            </Row>
            <Row className="content-column-balance-detail">
              <span>CLOSING BALANCE</span>
              <span className="closing-balance-text">MMK364,100.00</span>
              <span className="closing-balance-description">
                Description: -
              </span>
            </Row>
            <div className="content-column-full-row">
              <div className="recent-transaction-container">
                <p>Recent Transaction</p>
                <div className="toggle-buttons">
                  <Radio.Group value="bcy" buttonStyle="solid">
                    <Radio.Button value="fcy" defaultChecked>
                      FCY
                    </Radio.Button>
                    <Radio.Button value="bcy">BCY</Radio.Button>
                  </Radio.Group>
                </div>
              </div>
              <Table
                className="transaction-table"
                columns={transactionTableColumns}
                dataSource={transactionTableDataSource}
                pagination={false}
              ></Table>
              <br />
              <br />
              <a href="/">Show more detail</a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChartOfAccounts;
