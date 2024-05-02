/* eslint-disable react/style-prop-object */
import React, { useState } from "react";

import { Row, Modal, Form, Col, Input, DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMutation, useReadQuery } from "@apollo/client";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { PaginatedExpense } from "../../components";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import "./Expenses.css";
import {
  ExpenseQueries,
  ExpenseMutations,
} from "../../graphql";

const { GET_PAGINATED_EXPENSES } = ExpenseQueries;
const { DELETE_EXPENSE } = ExpenseMutations;

const Expenses = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const {notiApi, msgApi, business, allAccountsQueryRef, allBranchesQueryRef} = useOutletContext();
  const [searchExpenseFormRef] = Form.useForm();

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);

  // Mutations
  const [deleteExpense, { loading: deleteLoading }] = useMutation(
    DELETE_EXPENSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="expense.deleted"
            defaultMessage="Expense Deleted"
          />
        );
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_EXPENSES],
      update(cache, { data }) {
        const existingExpenses = cache.readQuery({
          query: GET_PAGINATED_EXPENSES,
        });
        const updatedExpenses = existingExpenses.paginateExpense.edges.filter(
          ({ node }) => node.id !== data.deleteExpense.id
        );
        cache.writeQuery({
          query: GET_PAGINATED_EXPENSES,
          data: {
            paginateExpense: {
              ...existingExpenses.paginateExpense,
              edges: updatedExpenses,
            },
          },
        });
      },
    }
  );

  const loading = deleteLoading;

  const parseData = (data) => {
    let expenses = [];


    data?.paginateExpense?.edges.forEach(({ node }) => {
      if (node != null) {
        expenses.push({
          key: node.id,
          ...node,
        });
      }
    });
    return expenses ? expenses : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateExpense) {
      pageInfo = {
        hasNextPage: data.paginateExpense.pageInfo.hasNextPage,
        endCursor: data.paginateExpense.pageInfo.endCursor,
      };
    }
    return pageInfo;
  };

  const handleEdit = (record, navigate, location) => {
    navigate("edit", {
      state: {
        ...location.state,
        from: { pathname: location.pathname },
        record,
      },
    });
  };

  const handleDelete = async (id) => {
    // console.log(id);
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
        await deleteExpense({
          variables: {
            id: id,
          },
        });
        return true;
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
    return false;
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "expenseDate",
      render: (_, record) => <>{dayjs(record.expenseDate).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branch",
      render: (_, record) => <>{record.branch.name}</>,
    },
    {
      title: (
        <FormattedMessage id="label.expenseAccount" defaultMessage="Expense Account" />
      ),
      dataIndex: "expenseAccount",
      render: (_, record) => <>{record.expenseAccount.name}</>,
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
        <FormattedMessage id="label.paidThrough" defaultMessage="Paid Through" />
      ),
      dataIndex: "assetAccount",
      render: (_, record) => <>{record.assetAccount.name}</>,
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text, record) => (
        <>
          {record.currency.symbol} <FormattedNumber value={text} style="decimal" minimumFractionDigits={record.currency.decimalPlaces} />
        </>
      ),
    },
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

  const searchExpenseForm = (
    <Form form={searchExpenseFormRef}>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {branchData?.listAllBranch?.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.id}
                  label={branch.stateNameEn}
                >
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.referenceNumber"
                defaultMessage="Reference #"
              />
            }
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.expenseAccount" defaultMessage="Expene Account" />
            }
            name="expenseAccountId"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select an account"
            >
              {accountData?.listAllAccount?.map((account) => (
                <Select.Option
                  key={account.id}
                  value={account.id}
                  label={account.name}
                >
                  {account.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
        <Form.Item
            label={
              <FormattedMessage id="label.paidThrough" defaultMessage="Paid Through" />
            }
            name="assetAccountId"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select an account"
            >
              {accountData?.listAllAccount?.map((account) => (
                <Select.Option
                  key={account.id}
                  value={account.id}
                  label={account.name}
                >
                  {account.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.dateRange"
                defaultMessage="Date Range"
              />
            }
            name="dateRange"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format={REPORT_DATE_FORMAT}
              // onChange={onChange}
              // onOk={onOk}
            />
          </Form.Item>
        </Col>
        {/* <Col span={12}>
          <Form.Item
            label="Status"
            name="status"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col> */}
      </Row>
    </Form>
  );

  return (
    <>
      {contextHolder}

      <PaginatedExpense
        dataLoading={loading}
        api={notiApi}
        columns={columns}
        gqlQuery={GET_PAGINATED_EXPENSES}
        showSearch={true}
        searchForm={searchExpenseForm}
        searchFormRef={searchExpenseFormRef}
        searchQqlQuery={GET_PAGINATED_EXPENSES}
        parseData={parseData}
        parsePageInfo={parsePageInfo}
        showAddNew={false}
        // onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        setSearchModalOpen={setSearchModalOpen}
        modalOpen={searchModalOpen}
        branchData={branchData?.listAllBranch}
        accountData={accountData?.listAllAccount}
      />
    </>
  );
};

export default Expenses;
