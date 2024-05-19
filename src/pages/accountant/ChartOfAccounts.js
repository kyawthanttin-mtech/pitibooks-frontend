/* eslint-disable react/style-prop-object */
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
  Tooltip,
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
  FileTextOutlined,
} from "@ant-design/icons";
import {
  useQuery,
  useMutation,
  useLazyQuery,
  useReadQuery,
} from "@apollo/client";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import {
  useHistoryState,
  convertTransactionType,
} from "../../utils/HelperFunctions";
import { ReactComponent as TreeIndicatorOutlined } from "../../assets/icons/TreeIndicatorOutlined.svg";
import { ReactComponent as PivotColumnOutlined } from "../../assets/icons/PivotColumnOutlined.svg";
import { AccountQueries, AccountMutations } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

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
      record?.isSystemDefault ? (
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
  const {
    notiApi,
    msgApi,
    business,
    refetchAllAccounts,
    allCurrenciesQueryRef,
    allBranchesQueryRef,
  } = useOutletContext();
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
    "accountSearchCriteria",
    null
  );
  const [closingBalance, setClosingBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [displayedCurrency, setDisplayedCurrency] = useState("bcy");
  const intl = useIntl();

  //Queries
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter((b) => b.isActive === true);
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const transactionTableColumns = [
    {
      title: "Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
    },
    {
      title: "Transaction Details",
      dataIndex: "transactionDetails",
      key: "transactionDetails",
      render: (text) => {
        if (text) {
          return (
            <Tooltip title={text}>
              <FileTextOutlined />
            </Tooltip>
          );
        } else {
          return <></>;
        }
      },
    },
    {
      title: "Type",
      dataIndex: "transactionType",
      key: "transactionType",
    },
    {
      title: "Debit",
      dataIndex: "baseDebit",
      key: "baseDebit",
      render: (_, record) => {
        if (record.baseDebit > 0) {
          if (
            displayedCurrency === "fcy" &&
            record.foreignCurrency?.id &&
            business.baseCurrency.id !== record.foreignCurrency?.id
          ) {
            return (
              <>
                {record.foreignCurrency.symbol}{" "}
                <FormattedNumber
                  value={record.foreignDebit}
                  style="decimal"
                  minimumFractionDigits={record.foreignCurrency.decimalPlaces}
                />
              </>
            );
          } else {
            return (
              <>
                {business.baseCurrency.symbol}{" "}
                <FormattedNumber
                  value={record.baseDebit}
                  style="decimal"
                  minimumFractionDigits={business.baseCurrency.decimalPlaces}
                />
              </>
            );
          }
        } else {
          return <></>;
        }
      },
    },
    {
      title: "Credit",
      dataIndex: "baseCredit",
      key: "baseCredit",
      render: (_, record) => {
        if (record.baseCredit > 0) {
          if (
            displayedCurrency === "fcy" &&
            record.foreignCurrency?.id &&
            business.baseCurrency.id !== record.foreignCurrency?.id
          ) {
            return (
              <>
                {record.foreignCurrency.symbol}{" "}
                <FormattedNumber
                  value={record.foreignCredit}
                  style="decimal"
                  minimumFractionDigits={record.foreignCurrency.decimalPlaces}
                />
              </>
            );
          } else {
            return (
              <>
                {business.baseCurrency.symbol}{" "}
                <FormattedNumber
                  value={record.baseCredit}
                  style="decimal"
                  minimumFractionDigits={business.baseCurrency.decimalPlaces}
                />
              </>
            );
          }
        } else {
          return <></>;
        }
      },
    },
  ];

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

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setSelectedRowIndex(record.id);
    setClosingBalance(record.accountClosingBalance?.runningBalance || 0);
    if (record.recentTransactions) {
      let index = 0;
      const updatedData = record.recentTransactions.map((t) => {
        return {
          ...t,
          key: index++,
          transactionDate: dayjs(t.transactionDateTime).format(
            REPORT_DATE_FORMAT
          ),
          transactionDetails: t.accountJournal?.transactionDetails || "",
          transactionType: convertTransactionType(
            t.accountJournal.referenceType
          ),
        };
      });
      setRecentTransactions(updatedData);
    } else {
      setRecentTransactions([]);
    }
  };

  const parseData = (data) => {
    let accounts = [];
    data?.listAccount?.map((acc) => {
      accounts.push({
        ...acc,
        id: acc?.id,
        accountName: acc?.name,
        accountCode: acc?.code,
        accountType: acc?.detailType.split(/(?=[A-Z])/).join(" "),
        parentAccountName: acc?.parentAccount.name,
        foreignCurrency: acc?.recentTransactions?.foreignCurrency,
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
    console.log(value);

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
      let input = {}
      
      if (detailType === "Bank") {
        if (!values.branch || values.branch.length === 0) {
          openErrorNotification(notiApi, intl.formatMessage({id:"validation.requiredAtLeastOneBranch", defaultMessage:"At least one Branch is required"}));
          return;
        }
        input = {
          detailType: detailType.split(" ").join(""),
          mainType: mainType,
          code: values.code,
          name: values.name,
          parentAccountId: 0,
          accountNumber: values.accountNumber,
          branches: values.branch?.join(" | "),
          currencyId: values.currency,
        };
      } else {
        input = {
          detailType: detailType.split(" ").join(""),
          mainType: mainType,
          code: values.code,
          name: values.name,
          parentAccountId:
            values.parentAccount && subAccountCheckedNew
              ? values.parentAccount
              : 0,
        };
      }

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
    console.log("fdfj", record.branches.split(" | "));
    editFormRef.setFieldsValue({
      id: record.id,
      name: record.accountName,
      type: selectedType?.id,
      code: record.accountCode,
      description: record.description,
      accountNumber: record.accountNumber,
      branch: record.branches ? record.branches?.split(" | ") : null,
      currency: record.currencyId || business.baseCurrency.id,
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
        setSelectedRecord(null);
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

      let input = {}
      
      if (detailType === "Bank") {
        if (!values.branch || values.branch.length === 0) {
          openErrorNotification(notiApi, intl.formatMessage({id:"validation.requiredAtLeastOneBranch", defaultMessage:"At least one Branch is required"}));
          return;
        }
        input = {
          detailType: detailType.split(" ").join(""),
          mainType: mainType,
          code: values.code,
          name: values.name,
          parentAccountId: 0,
          accountNumber: values.accountNumber,
          branches: values.branch?.join(" | "),
          currencyId: values.currency,
        };
      } else {
        input = {
          detailType: detailType.split(" ").join(""),
          mainType: mainType,
          code: values.code,
          name: values.name,
          parentAccountId:
            values.parentAccount && subAccountCheckedNew
              ? values.parentAccount
              : 0,
        };
      }
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
        label={
          <FormattedMessage
            id="label.accountType"
            defaultMessage="Account Type"
          />
        }
        name="type"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.accountType.required"
                defaultMessage="Select the Account Type"
              />
            ),
          },
        ]}
      >
        <Select
          showSearch
          onChange={(value) => handleAccountTypeChange(value)}
          allowClear
          optionFilterProp="label"
        >
          {accountTypes.map((group) => (
            <Select.OptGroup key={group.id} label={group.mainType}>
              {group.detailTypes.map((options) => (
                <Select.Option key={options.id} value={options.id} label={options.name}>
                  {options.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.accountName"
            defaultMessage="Account Name"
          />
        }
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.accountName.required"
                defaultMessage="Enter the Account Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      {detailType === "Bank" && (
        <>
          <Form.Item
            name="accountNumber"
            label={
              <FormattedMessage
                id="label.accountNumber"
                defaultMessage="Account Number"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
            labelAlign="left"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.accountNumber.required"
                    defaultMessage="Enter the Account Number"
                  />
                ),
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.currency" defaultMessage="Currency" />
            }
            name="currency"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.currency.required"
                    defaultMessage="Select the Currency"
                  />
                ),
              },
            ]}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {currencies?.map((currency) => (
                <Select.Option
                  key={currency.id}
                  value={currency.id}
                  label={currency.name + "" + currency.symbol}
                >
                  {currency.name} ({currency.symbol})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              mode="multiple"
              maxTagCount="responsive"
            >
              {branches?.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.name}
                  label={branch.name}
                >
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}

      {detailType !== "Bank" && <Form.Item
        shouldUpdate
        name="subAccount"
        valuePropName="checked"
        wrapperCol={{ span: 13, offset: 8 }}
      >
        <Checkbox>
          <FormattedMessage
            id="action.markSubAccount"
            defaultMessage="Mark this a sub-account"
          />
        </Checkbox>
      </Form.Item>
      }
      {detailType !== "Bank" && subAccountCheckedNew && (
        <Form.Item
          label={
            <FormattedMessage
              id="label.parentAccount"
              defaultMessage="Parent Account"
            />
          }
          name="parentAccount"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 13 }}
        >
          <Select allowClear>
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
        label={
          <FormattedMessage
            id="label.accountCode"
            defaultMessage="Account Code"
          />
        }
        name="code"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.description"
            defaultMessage="Description"
          />
        }
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
        label={
          <FormattedMessage
            id="label.accountType"
            defaultMessage="Account Type"
          />
        }
        name="type"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.accountType.required"
                defaultMessage="Select the Account Type"
              />
            ),
          },
        ]}
      >
        <Select
          showSearch
          onChange={(value) => handleAccountTypeChange(value)}
          allowClear
          disabled={detailType === "Bank" || selectedRecord?.isSystemDefault ? true : false}
          optionFilterProp="label"
        >
          {accountTypes.map((group) => (
            <Select.OptGroup key={group.id} label={group.mainType}>
              {group.detailTypes.map((options) => (
                <Select.Option key={options.id} value={options.id} label={options.name}>
                  {options.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.accountName"
            defaultMessage="Account Name"
          />
        }
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.accountName.required"
                defaultMessage="Enter the Account Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      {detailType === "Bank" && (
        <>
          <Form.Item
            name="accountNumber"
            label={
              <FormattedMessage
                id="label.accountNumber"
                defaultMessage="Account Number"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
            labelAlign="left"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.accountNumber.required"
                    defaultMessage="Enter the Account Number"
                  />
                ),
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.currency" defaultMessage="Currency" />
            }
            name="currency"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.currency.required"
                    defaultMessage="Select the Currency"
                  />
                ),
              },
            ]}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {currencies?.map((currency) => (
                <Select.Option
                  key={currency.id}
                  value={currency.id}
                  label={currency.name + "" + currency.symbol}
                >
                  {currency.name} ({currency.symbol})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              mode="multiple"
              maxTagCount="responsive"
            >
              {branches?.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.name}
                  label={branch.name}
                >
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
      {detailType !== "Bank" && <Form.Item
        shouldUpdate
        name="subAccount"
        valuePropName="checked"
        wrapperCol={{ span: 13, offset: 8 }}
      >
        <Checkbox disabled={selectedRecord?.isSystemDefault ? true : false}>
          <FormattedMessage
            id="action.markSubAccount"
            defaultMessage="Mark this a sub-account"
          />
        </Checkbox>
      </Form.Item>
      }
      {detailType !== "Bank" && subAccountCheckedEdit && (
        <Form.Item
          label={
            <FormattedMessage
              id="label.parentAccount"
              defaultMessage="Parent Account"
            />
          }
          name="parentAccount"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 13 }}
        >
          <Select allowClear>
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
        label={
          <FormattedMessage
            id="label.accountCode"
            defaultMessage="Account Code"
          />
        }
        name="code"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.description"
            defaultMessage="Description"
          />
        }
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
            label={
              <FormattedMessage
                id="label.accountName"
                defaultMessage="Account Name"
              />
            }
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
            label={
              <FormattedMessage
                id="label.accountCode"
                defaultMessage="Account Code"
              />
            }
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
      title: (
        <FormattedMessage
          id="label.accountName"
          defaultMessage="Account Name"
        />
      ),
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
                  <Tag className="active-status">
                    <FormattedMessage
                      id="label.inactive"
                      defaultMessage="inactive"
                    />
                  </Tag>
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
                <Tag className="active-status">
                  <FormattedMessage
                    id="label.inactive"
                    defaultMessage="inactive"
                  />
                </Tag>
              ) : (
                <></>
              )}
            </>
          );
        }
      },
    },
    {
      title: (
        <FormattedMessage
          id="label.accountCode"
          defaultMessage="Account Code"
        />
      ),
      dataIndex: "accountCode",
      key: "accountCode",
    },
    {
      title: (
        <FormattedMessage
          id="label.accountType"
          defaultMessage="Account Type"
        />
      ),
      dataIndex: "accountType",
      key: "accountType",
    },
    {
      title: (
        <FormattedMessage
          id="label.parentAccount"
          defaultMessage="Parent Account"
        />
      ),
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
        title={
          <FormattedMessage
            id="account.create"
            defaultMessage="Create Account"
          />
        }
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
        title={
          <FormattedMessage id="account.edit" defaultMessage="Edit Account" />
        }
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
                  {!selectedRecord && (
                    <FormattedMessage
                      id="account.new"
                      defaultMessage="New Account"
                    />
                  )}
                </Button>
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
                  onClick: () => handleSelectRecord(record),
                };
              }}
            />
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>{selectedRecord.accountType}</span>
                <span>{selectedRecord.accountName}</span>
              </div>
              <div className="content-column-header-row-actions">
                <div>
                  <PaperClipOutlined />
                  <span>
                    <FormattedMessage
                      id="button.attachment"
                      defaultMessage="Attachment"
                    />
                  </span>
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
                onClick={() => handleEdit(selectedRecord)}
              >
                <EditOutlined style={{ marginRight: "0.5rem" }} />
                <FormattedMessage id="button.edit" defaultMessage="Edit" />
              </div>
              <div>
                <Dropdown
                  loading={loading}
                  trigger="click"
                  // key={record.key}
                  menu={{
                    onClick: ({ key }) => {
                      if (key === "1") {
                        handleToggleActive(selectedRecord);
                      } else if (key === "2") {
                        handleDelete(selectedRecord);
                      }
                    },
                    items: [
                      {
                        label: selectedRecord.isActive ? (
                          <FormattedMessage
                            id="button.markInactive"
                            defaultMessage="Mark As Inactive"
                          />
                        ) : (
                          <FormattedMessage
                            id="button.markActive"
                            defaultMessage="Mark As Active"
                          />
                        ),
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
            <Row className="content-column-balance-detail">
              <span>
                <FormattedMessage
                  id="title.closingBalance"
                  defaultMessage="CLOSING BALANCE"
                />
              </span>
              <span className="closing-balance-text">
                {business.baseCurrency.symbol}{" "}
                <FormattedNumber
                  value={closingBalance}
                  style="decimal"
                  minimumFractionDigits={business.baseCurrency.decimalPlaces}
                />
              </span>
              <span className="closing-balance-description">
                {selectedRecord?.description}
              </span>
            </Row>
            <div className="content-column-full-row">
              <div className="recent-transaction-container">
                <p>
                  <FormattedMessage
                    id="title.recentTransactions"
                    defaultMessage="Recent Transactions"
                  />
                </p>
                <div className="toggle-buttons">
                  <Radio.Group
                    value={displayedCurrency}
                    buttonStyle="solid"
                    onChange={(e) => setDisplayedCurrency(e.target.value)}
                  >
                    <Radio.Button value="fcy">
                      <FormattedMessage id="action.fcy" defaultMessage="FCY" />
                    </Radio.Button>
                    <Radio.Button value="bcy">
                      <FormattedMessage id="action.bcy" defaultMessage="BCY" />
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </div>
              <Table
                className="transaction-table"
                columns={transactionTableColumns}
                dataSource={recentTransactions}
                pagination={false}
              ></Table>
              <br />
              <br />
              <a href="/">
                <FormattedMessage
                  id="action.showMoreDetail"
                  defaultMessage="Show More Detail"
                />
              </a>
            </div>
          </div>
        )}
      </div>
      +
    </>
  );
};

export default ChartOfAccounts;
