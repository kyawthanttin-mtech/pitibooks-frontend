import React, { useState } from "react";
import "./ManualJournalsNew.css";

import { Button, Form, Input, DatePicker, Select, Table } from "antd";
import {
  CloseCircleOutlined,
  PlusCircleFilled,
  UploadOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import {
  // JournalQueries,
  JournalMutations,
  AccountQueries,
  CurrencyQueries,
  BranchQueries,
} from "../../graphql";
// const { GET_JOURNALS } = JournalQueries;
const { CREATE_JOURNAL } = JournalMutations;
const { GET_ALL_ACCOUNTS } = AccountQueries;
const { GET_ALL_CURRENCIES } = CurrencyQueries;
const { GET_ALL_BRANCHES } = BranchQueries;

const ManualJournalsNew = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([{ key: 1 }, { key: 2 }]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [notiApi] = useOutletContext();
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [difference, setDifference] = useState(0);

  // Queries
  const { data: branchData, loading: branchLoading } = useQuery(
    GET_ALL_BRANCHES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: accountData, loading: accountLoading } = useQuery(
    GET_ALL_ACCOUNTS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: currencyData, loading: currencyLoading } = useQuery(
    GET_ALL_CURRENCIES,
    {
      errorPolicy: "all",
      // fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  // Mutations
  const [createJournal, { loading: createLoading }] = useMutation(
    CREATE_JOURNAL,
    {
      onCompleted() {
        openSuccessNotification(notiApi, <FormattedMessage id="journal.created" defaultMessage="New Journal Created" />);
        // navigate("/manualJournals");
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_JOURNALS],
    }
  );

  const loading =
    branchLoading || accountLoading || currencyLoading || createLoading;

  const onFinish = (values) => {
    // console.log("values", values);
    const transactions = data.map((item) => ({
      accountId: values[`account${item.key}`],
      debit: parseFloat(values[`debit${item.key}`]) || 0,
      credit: parseFloat(values[`credit${item.key}`]) || 0,
      description: values[`description${item.key}`],
    }));

    const input = {
      referenceNumber: values.referenceNumber,
      journalDate: values.date,
      journalNotes: values.notes,
      branchId: values.branch,
      currencyId: values.currency,
      transactions,
    };

    if (difference !== 0) {
      openErrorNotification(
        notiApi,
        <FormattedMessage id="debitCreditEqual" defaultMessage="Please ensure that the Debits and Credits are equal" />
      );
      return;
    }
    // console.log("Transactions", transactions);
    // console.log("Input", input);
    createJournal({
      variables: { input },
    });
  };

  // console.log(data);

  const handleAddRow = () => {
    const newRowKey = data.length + 1;
    setData([...data, { key: newRowKey }]);
  };

  const handleRemoveRow = (keyToRemove) => {
    const newData = data.filter((item) => item.key !== keyToRemove);
    setData(newData);
  };

  const handleDebitBlur = (e, key) => {
    e.preventDefault();
    const creditFieldName = `credit${key}`;
    form.setFieldsValue({ [creditFieldName]: "" });
    updateTotalAndDifference();
  };

  const handleCreditBlur = (e, key) => {
    e.preventDefault();
    const debitFieldName = `debit${key}`;
    form.setFieldsValue({ [debitFieldName]: "" });
    updateTotalAndDifference();
  };

  const updateTotalAndDifference = () => {
    const totalDebits = data.reduce(
      (acc, curr) =>
        acc + parseFloat(form.getFieldValue(`debit${curr.key}`) || 0),
      0
    );
    const totalCredits = data.reduce(
      (acc, curr) =>
        acc + parseFloat(form.getFieldValue(`credit${curr.key}`) || 0),
      0
    );
    const difference = Math.abs(totalDebits - totalCredits);
    setTotalDebits(totalDebits);
    setTotalCredits(totalCredits);
    setDifference(difference);
  };

  const columns = [
    {
      title: <FormattedMessage id="label.account" defaultMessage="Account" />,
      dataIndex: "account",
      key: "account",
      width: "15%",
      render: (_, record) => (
        <Form.Item 
          name={`account${record.key}`}
          rules={[{ required: true, message: <FormattedMessage id="label.account.required" defaultMessage="Select the Account" /> }]}
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={<FormattedMessage id="label.account.placeholder" defaultMessage="Select an account" />}
          >
            {accountData?.listAllAccount.map((account) => (
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
      ),
    },
    {
      title: <FormattedMessage id="label.description" defaultMessage="Description" />,
      dataIndex: "description",
      key: "description",
      width: "15%",
      render: (_, record) => (
        <Form.Item name={`description${record.key}`}>
          <Input></Input>
        </Form.Item>
      ),
    },
    // {
    //   title: "Contact",
    //   dataIndex: "contact",
    //   key: "contact",
    //   width: "15%",
    //   render: (_, record) => (
    //     <Form.Item name={`contact${record.key}`}>
    //       <Input />
    //     </Form.Item>
    //   ),
    // },

    {
      title: <FormattedMessage id="label.debits" defaultMessage="Debits" />,
      dataIndex: "debits",
      key: "debits",
      width: "15%",
      render: (_, record) => (
        <Form.Item name={`debit${record.key}`}>
          <Input onBlur={(e) => handleDebitBlur(e, record.key)} />
        </Form.Item>
      ),
    },
    {
      title: <FormattedMessage id="label.credits" defaultMessage="Credits" />,
      dataIndex: "credits",
      key: "credits",
      width: "15%",
      render: (_, record) => (
        <Form.Item name={`credit${record.key}`}>
          <Input onBlur={(e) => handleCreditBlur(e, record.key)} />
        </Form.Item>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      render: (_, record, index) => (
        index > 1 ?
        <CloseCircleOutlined
          style={{ color: "red" }}
          onClick={() => data.length > 2 && handleRemoveRow(record.key)}
        />
        : <></>
      ),
    },
  ];

  // console.log(currencyData);

  return (
    <>
      <div className="page-header">
        <p className="page-header-text"><FormattedMessage id="journal.new" defaultMessage="New Journal" /></p>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
            name="branch"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            rules={[{ required: true, message: <FormattedMessage id="label.branch.required" defaultMessage="Select the Branch" /> }]}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {branchData?.listAllBranch.map((branch) => (
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
          <Form.Item
            label={<FormattedMessage id="label.date" defaultMessage="Date" />}
            name="date"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            rules={[{ required: true, message: <FormattedMessage id="label.date.required" defaultMessage="Select the Date" /> }]}
          >
            <DatePicker
              onChange={(date, dateString) => console.log(date, dateString)}
            ></DatePicker>
          </Form.Item>
          {/* <Form.Item
            label="Journal#"
            name=""
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
          >
            <Radio.Group value="auto" defaultValue="auto">
              <Radio value="auto">Auto</Radio>
              <Radio value="manual">Manual</Radio>
            </Radio.Group>
          </Form.Item> */}
          <Form.Item
            label={<FormattedMessage id="label.referenceNumber" defaultMessage="Reference #" />}
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="label.notes" defaultMessage="Notes" />}
            name="notes"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            rules={[{ required: true, message: <FormattedMessage id="label.notes.required" defaultMessage="Enter the Notes" /> }]}
          >
            <TextArea></TextArea>
          </Form.Item>

          <Form.Item
            label={<FormattedMessage id="label.currency" defaultMessage="Currency" />}
            name="currency"
            labelAlign="left"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 5 }}
            rules={[{ required: true, message: <FormattedMessage id="label.currency.required" defaultMessage="Select the Currency" /> }]}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {currencyData?.listAllCurrency.map((currency) => (
                <Select.Option
                  key={currency.id}
                  value={currency.id}
                  label={currency.name}
                >
                  {currency.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Table
            loading={loading}
            rowKey={(record) => record.key}
            columns={columns}
            dataSource={data}
            className="new-manual-journal-table"
            pagination={false}
            bordered
          ></Table>

          <div className="new-manual-journal-table-footer">
            <Button
              icon={<PlusCircleFilled className="add-row-icon" />}
              onClick={handleAddRow}
              className="add-row-button"
            >
              <FormattedMessage id="button.addNewRow" defaultMessage="Add New Row" />
            </Button>

            <table cellSpacing="0" border="0" width="100%" id="balance-table">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>
                    <b><FormattedMessage id="label.total" defaultMessage="Total" /></b>
                  </td>
                  <td className="text-align-right">{totalDebits.toFixed(2)}</td>
                  <td className="text-align-right">
                    {totalCredits.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: "middle", color: "red" }}>
                    <FormattedMessage id="label.difference" defaultMessage="Difference" />
                  </td>
                  <td className="text-align-right" colSpan="2">
                    {difference.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="attachment-upload">
            <p><FormattedMessage id="label.attachments" defaultMessage="Attachments" /></p>
            <Button
              type="dashed"
              icon={<UploadOutlined />}
              className="attachment-upload-button"
            >
              <FormattedMessage id="button.uploadFile" defaultMessage="Upload File" />
            </Button>
            <p><FormattedMessage id="label.uploadLimit" defaultMessage="You can upload a maximum of 5 files, 5MB each" /></p>
          </div>
        </Form>
      </div>
      <div className="page-actions-bar">
        <Button
          loading={createLoading}
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          onClick={form.submit}
        >
          <FormattedMessage id="button.save" defaultMessage="Save" />
        </Button>
        {/* <Button className="page-actions-btn">Save as Draft</Button> */}
        <Button
          className="page-actions-btn"
          onClick={() => navigate("/manualJournals")}
        >
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </div>
    </>
  );
};

export default ManualJournalsNew;
