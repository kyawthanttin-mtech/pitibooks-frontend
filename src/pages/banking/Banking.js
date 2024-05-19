/* eslint-disable react/style-prop-object */
import React, { useState, useMemo } from "react";
import {
  Button,
  Space,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Modal,
  Form,
  Dropdown,
  Divider,
  Flex,
  Input,
  Select,
  Tag,
} from "antd";
import {
  PlusOutlined,
  // SearchOutlined,
  CloseOutlined,
  CaretDownOutlined,
  DownCircleFilled,
  BankOutlined,
  DownOutlined,
} from "@ant-design/icons";

import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import {
  useMutation,
  useReadQuery,
  useQuery,
} from "@apollo/client";
// import { useHistoryState } from "../../utils/HelperFunctions";
import { BankingQueries, AccountMutations } from "../../graphql";
import { ReactComponent as CashOutlined } from "../../assets/icons/CashOutlined.svg";
import {
  OwnerDrawings,
  TransferFromAnotherAcc,
  TransferToAnotherAcc,
  OwnerContribution,
  PaymentRefund,
  CreditNoteRefund,
} from "./";
const { GET_BANKING_ACCOUNTS } = BankingQueries;
const {
  CREATE_ACCOUNT,
  UPDATE_ACCOUNT,
  DELETE_ACCOUNT,
  TOGGLE_ACTIVE_ACCOUNT,
} = AccountMutations;

const addTransactionItems = [
  {
    label: <FormattedMessage id="button.moneyOut" defaultMessage="Money Out" />,
    type: "group",
    key: "1",
    children: [
      {
        key: "1-1",
        label: "Transfer To Another Account",
      },
      {
        key: "1-2",
        label: "Owner Drawings",
      },
      {
        key: "1-3",
        label: "Payment Refund",
      },
      {
        key: "1-4",
        label: "Credit Note Refund",
      },
    ],
  },
  {
    label: <FormattedMessage id="button.moneyIn" defaultMessage="Money In" />,
    type: "group",
    key: "2",
    children: [
      {
        key: "2-1",
        label: "Transfer From Another Account",
      },
      {
        key: "2-2",
        label: "Owner's Contribution",
      },
      {
        key: "2-3",
        label: "Supplier Credit Refund",
      },
      {
        key: "2-4",
        label: "Supplier Payment Refund",
      },
    ],
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
];

const Banking = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allAccountsQueryRef,
    business,
    refetchAllAccounts,
  } = useOutletContext();
  // const [searchFormRef] = Form.useForm();
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const intl = useIntl();
  const [editRecord, setEditRecord] = useState(null);
  // const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filterAccount, setFilterAccount] = useState({
    key: "1",
    label: "All Accounts",
  });
  const [transferToModalOpen, setTransferToModalOpen] = useState(false);
  const [transferFromModalOpen, setTransferFromModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [ownerDrawingsModalOpen, setOwnerDrawingsModalOpen] = useState(false);
  const [ownerContributionModalOpen, setOwnerContributionModalOpen] =
    useState(false);
  const [paymentRefundModalOpen, setPaymentRefundModalOpen] = useState(false);
  const [creditNoteRefundModalOpen, setCreditNoteRefundModalOpen] =
    useState(false);

  //Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);

  const { data, loading: queryLoading, refetch } = useQuery(GET_BANKING_ACCOUNTS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

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
      refetchQueries: [GET_BANKING_ACCOUNTS],
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
      refetchQueries: [GET_BANKING_ACCOUNTS],
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
      refetchQueries: [GET_BANKING_ACCOUNTS],
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
      refetchQueries: [GET_BANKING_ACCOUNTS],
    }
  );

  const loading =
    createLoading ||
    updateLoading ||
    deleteLoading ||
    queryLoading ||
    toggleActiveLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const parsedData = useMemo(() => {
    return data?.listBankingAccount.map((item) => ({
      ...item,
    }));
  }, [data]);

  const queryData = useMemo(() => {
    let queryData = parsedData ? parsedData : [];
    switch (filterAccount.key) {
      case "2":
        queryData = queryData.filter((data) => data.isActive);
        break;
      case "3":
        queryData = queryData.filter((data) => !data.isActive);
        break;

      default:
      // do nothing
    }
    return queryData;
  }, [filterAccount, parsedData]);

  const accounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter((account) => 
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

  const equityAccounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter((account) => 
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

  const handleCreateModalCancel = () => {
    setCreateModalOpen(false);
    createFormRef.resetFields();
  };

  const handleEditModalCancel = () => {
    editFormRef.resetFields();
    setEditModalOpen(false);
  };

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();

      let input = {};

      if (!values.branch || values.branch.length === 0) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "validation.requiredAtLeastOneBranch",
            defaultMessage: "At least one Branch is required",
          })
        );
        return;
      }
      input = {
        detailType: "Bank",
        mainType: "Asset",
        code: values.code,
        name: values.name,
        parentAccountId: 0,
        accountNumber: values.accountNumber,
        branches: values.branch?.join(" | "),
        currencyId: values.currency,
      };

      await createAccount({ variables: { input: input } });
      setCreateModalOpen(false);
      createFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleEdit = async (record) => {
    setEditRecord(record);
    editFormRef.resetFields();
    editFormRef.setFieldsValue({
      id: record.id,
      name: record.name,
      code: record.code,
      description: record.description,
      accountNumber: record.accountNumber,
      branch: record.branches
        ? record.branches.split(" | ")
        : null,
      currency:
        record.currency?.id || business.baseCurrency.id,
    });
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

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      let input = {};
      if (editRecord.detailType === "Bank" && (!values.branch || values.branch.length === 0)) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "validation.requiredAtLeastOneBranch",
            defaultMessage: "At least one Branch is required",
          })
        );
        return;
      }
      input = {
        detailType: editRecord.detailType,
        mainType: editRecord.mainType,
        code: values.code,
        name: values.name,
        parentAccountId: editRecord.parentAccountId || 0,
        accountNumber: values.accountNumber,
        branches: values.branch ? values.branch?.join(" | ") : null,
        currencyId: values.currency || 0,
        description: values.description,
      };

      await updateAccount({
        variables: { id: editRecord.id, input: input },
      });
      setEditModalOpen(false);
      editFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleFilterChange = (key) => {
    const selectedFilter = filterOptions.find((option) => option.key === key);
    setFilterAccount(selectedFilter);
  };

  const compactColumns = [
    {
      title: "",
      dataIndex: "column",
      render: (text, record) => {
        return (
          <div>
            <div className="column-list-item">
              <Flex align="center">
                {record?.detailType === "Bank" ? (
                  <BankOutlined style={{ height: 22, width: 21 }} />
                ) : (
                  <CashOutlined style={{ height: 21, width: 21 }} />
                )}
                <Divider type="vertical" />
                <Flex vertical>
                  <span>{record.name}</span>
                  <span style={{ fontSize: "var(--small-text)" }}>
                    {record?.detailType === "Bank" ? record.accountNumber : ""}
                  </span>
                </Flex>
              </Flex>
              <span>
                {record.currency?.symbol}{" "}
                <FormattedNumber
                  value={record.balance}
                  style="decimal"
                  minimumFractionDigits={record.currency?.decimalPlaces}
                />
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const columns = [
    {
      title: "Account Details",
      dataIndex: "accountDetails",
      key: "accountDetails",
      render: (_, record) => (
        <Flex align="center">
          {record?.detailType === "Bank" ? (
            <BankOutlined style={{ height: 22, width: 21 }} />
          ) : (
            <CashOutlined style={{ height: 21, width: 21 }} />
          )}
          <Divider type="vertical" />
          <Space>
            <Flex vertical>
              <span>{record.name}</span>
              <span style={{ fontSize: "var(--small-text)" }}>
                {record?.detailType === "Bank" ? record.accountNumber : ""}
              </span>
            </Flex>
            {!record.isActive ? (
              <Tag className="active-status">inactive</Tag>
            ) : (
              <></>
            )}
          </Space>
        </Flex>
      ),
    },
    {
      title: "Uncatagorized",
      dataIndex: "uncatagorized",
      key: "uncatagorized",
    },
    {
      title: "Amount In Bank",
      dataIndex: "balance",
      key: "balance",
      render: (text, record) => (
        <>
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={text}
            style="decimal"
            minimumFractionDigits={record.currency?.decimalPlaces}
          />
        </>
      ),
    },

    {
      title: "",
      dataIndex: "action",
      render: (_, record) =>
        hoveredRow === record.id ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              loading={loading}
              trigger="click"
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
                        id="button.editAccount"
                        defaultMessage="Edit Account"
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
              <DownCircleFilled className="action-icon" />
            </Dropdown>
          </div>
        ) : (
          <div className="action-placeholder"></div>
        ),
    },

    // {
    //   title: (
    //     <SearchOutlined
    //       className="table-header-search-icon"
    //       onClick={() => setSearchModalOpen(true)}
    //     />
    //   ),
    //   dataIndex: "search",
    //   key: "search",
    // },
  ];

  const createForm = (
    <Form form={createFormRef} onFinish={handleCreateModalOk}>
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
        label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
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

      {editRecord?.detailType === "Bank" && <Form.Item
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
        <Input />
      </Form.Item>}
      {editRecord?.detailType === "Bank" && <Form.Item
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
      </Form.Item>}

      {editRecord?.detailType === "Bank" && <Form.Item
        label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
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
      </Form.Item>}

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

  // const searchForm = (
  //   <Form form={searchFormRef}>
  //     <Row>
  //       <Col lg={12}>
  //         <Form.Item
  //           label="Bill #"
  //           name="billNumber"
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           <Input></Input>
  //         </Form.Item>
  //         <Form.Item
  //           label={
  //             <FormattedMessage
  //               id="label.billDateRange"
  //               defaultMessage="Bill Date Range"
  //             />
  //           }
  //           name="billDateRange"
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           <DatePicker.RangePicker
  //             format={REPORT_DATE_FORMAT}
  //             onChange={(value) => {
  //               searchFormRef.setFieldsValue({
  //                 startBillDate: value && value[0],
  //                 endBillDate: value && value[1],
  //               });
  //             }}
  //             onClear={() =>
  //               searchFormRef.resetFields(["startBillDate", "endBillDate"])
  //             }
  //           />
  //         </Form.Item>
  //         <Form.Item noStyle hidden name="startBillDate" shouldUpdate>
  //           <Input />
  //         </Form.Item>
  //         <Form.Item noStyle hidden name="endBillDate" shouldUpdate>
  //           <Input />
  //         </Form.Item>
  //         <Form.Item
  //           label="Status"
  //           name="currentStatus"
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           <Select
  //             options={[
  //               {
  //                 value: "Draft",
  //                 label: "Draft",
  //               },
  //               {
  //                 value: "Sent",
  //                 label: "Sent",
  //               },
  //               {
  //                 value: "Partial Paid",
  //                 label: "Partial Paid",
  //               },
  //               {
  //                 value: "Paid",
  //                 label: "Paid",
  //               },
  //             ]}
  //           ></Select>
  //         </Form.Item>
  //         <Form.Item
  //           label={
  //             <FormattedMessage id="label.branch" defaultMessage="Branch" />
  //           }
  //           name="branchId"
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           {/* <Select showSearch optionFilterProp="label">
  //             {branches?.map((branch) => (
  //               <Select.Option
  //                 key={branch.id}
  //                 value={branch.id}
  //                 label={branch.name}
  //               >
  //                 {branch.name}
  //               </Select.Option>
  //             ))}
  //           </Select> */}
  //         </Form.Item>
  //       </Col>
  //       <Col lg={12}>
  //         <Form.Item
  //           label="Reference #"
  //           name="referenceNumber"
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           <Input></Input>
  //         </Form.Item>
  //         <Form.Item
  //           label={
  //             <FormattedMessage
  //               id="label.dueDateRange"
  //               defaultMessage="Due Date Range"
  //             />
  //           }
  //           name="dueDateRange"
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           <DatePicker.RangePicker
  //             format={REPORT_DATE_FORMAT}
  //             onChange={(value) => {
  //               searchFormRef.setFieldsValue({
  //                 startBillDueDate: value && value[0],
  //                 endBillDueDate: value && value[1],
  //               });
  //             }}
  //             onClear={() =>
  //               searchFormRef.resetFields([
  //                 "startBillDueDate",
  //                 "endBillDueDate",
  //               ])
  //             }
  //           />
  //         </Form.Item>
  //         <Form.Item noStyle hidden name="startBillDueDate" shouldUpdate>
  //           <Input />
  //         </Form.Item>
  //         <Form.Item noStyle hidden name="endBillDueDate" shouldUpdate>
  //           <Input />
  //         </Form.Item>
  //         <Form.Item
  //           label={
  //             <FormattedMessage
  //               id="label.warehouse"
  //               defaultMessage="Warehouse"
  //             />
  //           }
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //           labelAlign="left"
  //           name="warehouseId"
  //         >
  //           {/* <Select showSearch allowClear optionFilterProp="label">
  //             {warehouses?.map((w) => (
  //               <Select.Option key={w.id} value={w.id} label={w.name}>
  //                 {w.name}
  //               </Select.Option>
  //             ))}
  //           </Select> */}
  //         </Form.Item>
  //         <Form.Item noStyle hidden name="supplierId" shouldUpdate>
  //           <Input />
  //         </Form.Item>
  //         <Form.Item
  //           label={
  //             <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
  //           }
  //           name="supplierName"
  //           shouldUpdate
  //           labelAlign="left"
  //           labelCol={{ span: 7 }}
  //           wrapperCol={{ span: 15 }}
  //         >
  //           <Input
  //             readOnly
  //             // onClick={setSupplierSearchModalOpen}
  //             className="search-input"
  //             suffix={
  //               <>
  //                 {selectedSupplier && (
  //                   <CloseOutlined
  //                     style={{ height: 11, width: 11, cursor: "pointer" }}
  //                     onClick={() => {
  //                       setSelectedSupplier(null);
  //                       searchFormRef.resetFields([
  //                         "supplierName",
  //                         "supplierId",
  //                       ]);
  //                     }}
  //                   />
  //                 )}

  //                 <Button
  //                   style={{ width: "2.5rem" }}
  //                   type="primary"
  //                   icon={<SearchOutlined />}
  //                   className="search-btn"
  //                   // onClick={setSupplierSearchModalOpen}
  //                 />
  //               </>
  //             }
  //           />
  //         </Form.Item>
  //       </Col>
  //     </Row>
  //   </Form>
  // );

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
      <TransferToAnotherAcc
        refetch={refetch}
        transferToModalOpen={transferToModalOpen}
        setTransferToModalOpen={setTransferToModalOpen}
        branches={branches}
        currencies={currencies}
        parsedData={parsedData}
        accounts={accounts}
        allAccounts={accountData?.listAllAccount}
        selectedRecord={selectedRecord}
      />
      <TransferFromAnotherAcc
        transferFromModalOpen={transferFromModalOpen}
        setTransferFromModalOpen={setTransferFromModalOpen}
        branches={branches}
        currencies={currencies}
        parsedData={parsedData}
        accounts={accounts}
        selectedRecord={selectedRecord}
      />
      <OwnerDrawings
        ownerDrawingsModalOpen={ownerDrawingsModalOpen}
        setOwnerDrawingsModalOpen={setOwnerDrawingsModalOpen}
        branches={branches}
        currencies={currencies}
        parsedData={parsedData}
        accounts={equityAccounts}
        selectedRecord={selectedRecord}
      />
      <OwnerContribution
        ownerContributionModalOpen={ownerContributionModalOpen}
        setOwnerContributionModalOpen={setOwnerContributionModalOpen}
        branches={branches}
        currencies={currencies}
        parsedData={parsedData}
        accounts={equityAccounts}
        selectedRecord={selectedRecord}
      />
      <PaymentRefund
        modalOpen={paymentRefundModalOpen}
        setModalOpen={setPaymentRefundModalOpen}
        branches={branches}
        currencies={currencies}
        selectedRecord={selectedRecord}
      />
      <CreditNoteRefund
        modalOpen={creditNoteRefundModalOpen}
        setModalOpen={setCreditNoteRefundModalOpen}
        branches={branches}
        currencies={currencies}
        selectedRecord={selectedRecord}
      />

      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header">
            <p className="page-header-text">
              <FormattedMessage
                id="label.bankingOverview"
                defaultMessage="Banking Overview"
              />
            </p>
            {!selectedRecord && (
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
            )}
          </div>

          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            {!selectedRecord && (
              <Row gutter={16} style={{ padding: "1.5rem 1rem", margin: 0 }}>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(89, 166, 53, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic title="Cash In Hand" value={0} prefix="MMK" />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(255, 176, 1, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic
                      title="Bank Balance"
                      value={0}
                      precision={1}
                      prefix="MMK"
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(64, 141, 251, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic title="Card Balance" value={0} prefix="MMK" />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card
                    style={{
                      background: "rgba(247, 104, 49, 0.10)",
                      height: "6.5rem",
                    }}
                  >
                    <Statistic title="Overdue Bills" value={0} prefix="MMK" />
                  </Card>
                </Col>
              </Row>
            )}

            {!selectedRecord && (
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
                <div
                  className="page-header-text"
                  style={{
                    cursor: "pointer",
                    paddingLeft: "1.5rem",
                    fontSize: "20px",
                    fontWeight: "500",
                    marginBlock: "1.5rem",
                    maxWidth: "14rem",
                  }}
                >
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
            )}
            <Divider style={{ margin: 0 }} />

            <Table
              style={{ paddingBottom: !selectedRecord ? "5rem" : undefined }}
              className={selectedRecord ? "header-less-table" : "main-table"}
              loading={loading}
              columns={selectedRecord ? compactColumns : columns}
              dataSource={queryData}
              rowKey={(record) => record.id}
              pagination={false}
              rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
              onRow={(record) => ({
                key: record.id,
                onClick: () => {
                  setSelectedRecord(record);
                  setSelectedRowIndex(record.id);
                },
                onMouseEnter: () => setHoveredRow(record.id),
                onMouseLeave: () => setHoveredRow(null),
              })}
            />
          </div>
        </div>

        {selectedRecord && (
          <>
            <div className="content-column">
              <Flex className="content-column-header-row product-details-header-row">
                <p className="page-header-text">{selectedRecord.name}</p>
                <div>
                  <Button type="primary">
                    <Dropdown
                      trigger="click"
                      key={selectedRecord.key}
                      menu={{
                        onClick: ({ key }) => {
                          if (key === "1-1") {
                            setTransferToModalOpen(true);
                          } else if (key === "1-2")
                            setOwnerDrawingsModalOpen(true);
                          else if (key === "1-3")
                            setPaymentRefundModalOpen(true);
                          else if (key === "1-4") {
                            setCreditNoteRefundModalOpen(true);
                          } else if (key === "2-1") {
                            setTransferFromModalOpen(true);
                          } else if (key === "2-2") {
                            setOwnerContributionModalOpen(true);
                          }
                        },
                        items: addTransactionItems,
                      }}
                    >
                      <div style={{ height: "2rem" }}>
                        Add Transaction <CaretDownOutlined />
                      </div>
                    </Dropdown>
                  </Button>
                  <Divider type="vertical" />
                  <Button
                    icon={<CloseOutlined />}
                    type="text"
                    onClick={() => {
                      setSelectedRecord(null);
                      setSelectedRowIndex(0);
                    }}
                  />
                </div>
              </Flex>
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
                    value={selectedRecord.balance || 0}
                    style="decimal"
                    minimumFractionDigits={business.baseCurrency.decimalPlaces}
                  />
                </span>
              </Row>
              <div className="content-column-full-row page-with-padding">
                <Table
                  className="transaction-table"
                  columns={[
                    {
                      title: (
                        <FormattedMessage
                          id="label.date"
                          defaultMessage="Date"
                        />
                      ),
                      key: "date",
                      dataIndex: "transactionDateTime",
                    },
                    {
                      title: (
                        <FormattedMessage
                          id="label.branch"
                          defaultMessage="Branch"
                        />
                      ),
                      key: "branch",
                      dataIndex: "branch",
                    },
                    {
                      title: (
                        <FormattedMessage
                          id="label.transactionDetails"
                          defaultMessage="Transaction Details"
                        />
                      ),
                      key: "transactionDetails",
                      dataIndex: "description",
                    },
                    {
                      title: (
                        <FormattedMessage
                          id="label.type"
                          defaultMessage="Type"
                        />
                      ),
                      key: "type",
                      dataIndex: "type",
                    },
                    {
                      title: (
                        <FormattedMessage
                          id="label.deposits"
                          defaultMessage="Deposits"
                        />
                      ),
                      key: "deposits",
                      dataIndex: "baseDebit",
                    },
                    {
                      title: (
                        <FormattedMessage
                          id="label.withdrawals"
                          defaultMessage="Withdrawals"
                        />
                      ),
                      key: "withdrawals",
                      dataIndex: "baseCredit",
                    },
                    {
                      title: (
                        <FormattedMessage
                          id="label.runningBalance"
                          defaultMessage="Running Balance"
                        />
                      ),
                      key: "runningBalance",
                      dataIndex: "baseClosingBalance",
                    },
                  ]}
                  dataSource={selectedRecord?.recentTransactions || []}
                  key="id"
                  pagination={false}
                ></Table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Banking;
