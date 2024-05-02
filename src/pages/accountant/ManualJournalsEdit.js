/* eslint-disable react/style-prop-object */
import React, { useState, useMemo } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  InputNumber,
} from "antd";
import {
  CloseCircleOutlined,
  PlusCircleFilled,
  UploadOutlined,
  CloseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useReadQuery, useMutation, gql } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { JournalMutations } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { CustomerSearchModal, SupplierSearchModal } from "../../components";

const { UPDATE_JOURNAL } = JournalMutations;

const ManualJournalsEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.record;
  const [data, setData] = useState(
    record?.transactions?.map((_, index) => ({ key: index + 1 })) || [
      { key: 1 },
      { key: 2 },
    ]
  );

  const {
    notiApi,
    msgApi,
    business,
    allAccountsQueryRef,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
  } = useOutletContext();
  const [difference, setDifference] = useState(0);
  // Calculate initial values for totalDebits and totalCredits
  let initialTotalDebits = 0;
  let initialTotalCredits = 0;

  if (record && record.transactions) {
    record.transactions.forEach((transaction) => {
      initialTotalDebits += transaction.debit;
      initialTotalCredits += transaction.credit;
    });
  }
  const [totalDebits, setTotalDebits] = useState(initialTotalDebits);
  const [totalCredits, setTotalCredits] = useState(initialTotalCredits);
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  console.log("Record", record);

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);

  // Mutations
  const [updateJournal, { loading: updateLoading }] = useMutation(
    UPDATE_JOURNAL,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="journal.updated"
            defaultMessage="Journal Updated"
          />
        );
        // navigate("/manualJournals");
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_JOURNALS],
    }
  );

  const loading = updateLoading;

  const branches = useMemo(() => {
    return branchData?.listAllBranch;
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency;
  }, [currencyData]);

  const accounts = useMemo(() => {
    return accountData?.listAllAccount;
  }, [accountData]);

  // Parse record

  useMemo(() => {
    const parsedRecord =
      record && record.transactions
        ? {
            branch: record.branch.id,
            currency: record.currency.id,
            referenceNumber: record.referenceNumber,
            notes: record.notes,
            supplierName: record.supplier?.name,
            customerName: record.customer?.name,
            date: dayjs(record.originalDate),
            // Map transactions to form fields
            ...record.transactions.reduce((acc, transaction, index) => {
              acc[`account${index + 1}`] = transaction.account.id;
              acc[`description${index + 1}`] = transaction.description;
              acc[`debit${index + 1}`] =
                transaction.debit !== 0 ? transaction.debit : "";
              acc[`credit${index + 1}`] =
                transaction.credit !== 0 ? transaction.credit : "";
              return acc;
            }, {}),
          }
        : {};

    // console.log("Parsed Record", parsedRecord);
    setSelectedSupplier(record.supplier?.id ? record.supplier : "");
    setSelectedCustomer(record.customer?.id ? record.customer : "");
    form.setFieldsValue(parsedRecord);
  }, [form, record]);

  const onFinish = (values) => {
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
      supplierId: selectedSupplier.id || 0,
      customerId: selectedCustomer.id || 0,
      exchangeRate: values.exchangeRate ? parseFloat(values.exchangeRate) : 0,
      transactions,
    };
    if (difference !== 0) {
      openErrorNotification(
        notiApi,
        <FormattedMessage
          id="journal.debitCreditEqual"
          defaultMessage="Please ensure that the Debits and Credits are equal"
        />
      );
      return;
    }
    // console.log("Input", input);
    updateJournal({
      variables: { id: record.id, input },
      update(cache, { data: { updateJournal } }) {
        cache.modify({
          fields: {
            paginateJournal(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) => x.node.__ref === "Journal:" + updateJournal.id
              );
              if (index >= 0) {
                const newJournal = cache.writeFragment({
                  data: updateJournal,
                  fragment: gql`
                    fragment NewJournal on Journal {
                      id
                      branch 
                      journalNumber
                      referenceNumber
                      journalDate
                      journalNotes
                      currency
                      supplier 
                      customer 
                      journalTotalAmount
                      transactions
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newJournal;
                return paginationCopy;
              } else {
                return pagination;
              }
            },
          },
        });
      },
    });
  };

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
    const debit = form.getFieldValue(`debit${key}`);
    if (!debit || debit.trim().length === 0) return;
    form.setFieldsValue({ [`credit${key}`]: "" });
    updateTotalAndDifference();
  };

  const handleCreditBlur = (e, key) => {
    e.preventDefault();
    const credit = form.getFieldValue(`credit${key}`);
    if (!credit || credit.trim().length === 0) return;
    form.setFieldsValue({ [`debit${key}`]: "" });
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
    const difference = totalDebits - totalCredits;
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
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="label.account.required"
                  defaultMessage="Select the Account"
                />
              ),
            },
          ]}
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select an account"
          >
            {accounts?.map((account) => (
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
      title: (
        <FormattedMessage id="label.description" defaultMessage="Description" />
      ),
      dataIndex: "description",
      key: "description",
      width: "15%",
      render: (_, record) => (
        <Form.Item name={`description${record.key}`}>
          <Input maxLength={255}></Input>
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
      render: (_, record, index) =>
        index > 1 ? (
          <CloseCircleOutlined
            style={{ color: "red" }}
            onClick={() => data.length > 2 && handleRemoveRow(record.key)}
          />
        ) : (
          <></>
        ),
    },
  ];
  return (
    <>
      <SupplierSearchModal
        modalOpen={supplierSearchModalOpen}
        setModalOpen={setSupplierSearchModalOpen}
        onRowSelect={(record) => {
          setSelectedSupplier(record);
          form.setFieldsValue({ supplierName: record.name });
        }}
      />
      <CustomerSearchModal
        modalOpen={customerSearchModalOpen}
        setModalOpen={setCustomerSearchModalOpen}
        onRowSelect={(record) => {
          setSelectedCustomer(record);
          form.setFieldsValue({ customerName: record.name });
        }}
      />
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage id="journal.edit" defaultMessage="Edit Journal" />
        </p>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.branch.required"
                    defaultMessage="Select the Branch"
                  />
                ),
              },
            ]}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {branches?.map((branch) => (
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
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.date.required"
                    defaultMessage="Select the Date"
                  />
                ),
              },
            ]}
          >
            <DatePicker
              format={REPORT_DATE_FORMAT}
              onChange={(date, dateString) => console.log(date, dateString)}
            ></DatePicker>
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage
                id="label.referenceNumber"
                defaultMessage="Reference #"
              />
            }
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
          >
            <Input maxLength={255}></Input>
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="label.notes" defaultMessage="Notes" />}
            name="notes"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.notes.required"
                    defaultMessage="Enter the Notes"
                  />
                ),
              },
            ]}
          >
            <TextArea maxLength={1000}></TextArea>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.currency" defaultMessage="Currency" />
            }
            name="currency"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
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
                  label={currency.name}
                >
                  {currency.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.currency !== currentValues.currency
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("currency") &&
              getFieldValue("currency") !== business.baseCurrency.id ? (
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.exchangeRate"
                      defaultMessage="Exchange Rate"
                    />
                  }
                  name="exchangeRate"
                  labelAlign="left"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 8 }}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.exchangeRate.required"
                          defaultMessage="Enter the Exchange Rate"
                        />
                      ),
                    },
                  ]}
                >
                  <InputNumber />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
            }
            name="supplierName"
            shouldUpdate
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
          >
            <Input
              readOnly
              onClick={setSupplierSearchModalOpen}
              className="search-input"
              allowClear
              suffix={
                <>
                  {selectedSupplier && (
                    <CloseOutlined
                      style={{ height: 11, width: 11, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedSupplier(null);
                        form.resetFields(["supplierName"]);
                      }}
                    />
                  )}

                  <Button
                    style={{ width: "2.5rem" }}
                    type="primary"
                    icon={<SearchOutlined />}
                    className="search-btn"
                    onClick={setSupplierSearchModalOpen}
                  />
                </>
              }
            />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.customer" defaultMessage="Customer" />
            }
            name="customerName"
            shouldUpdate
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
          >
            <Input
              readOnly
              onClick={setCustomerSearchModalOpen}
              className="search-input"
              suffix={
                <>
                  {selectedCustomer && (
                    <CloseOutlined
                      style={{ height: 11, width: 11, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedCustomer(null);
                        form.resetFields(["customerName"]);
                      }}
                    />
                  )}
                  <Button
                    style={{ width: "2.5rem" }}
                    type="primary"
                    icon={<SearchOutlined />}
                    className="search-btn"
                    onClick={setCustomerSearchModalOpen}
                  />
                </>
              }
            />
          </Form.Item>
          <Table
            loading={loading}
            rowKey={(record) => record.key}
            columns={columns}
            dataSource={data}
            className="new-manual-journal-table"
            pagination={false}
            bordered={false}
          ></Table>

          <div className="new-manual-journal-table-footer">
            <Button
              icon={<PlusCircleFilled className="add-row-icon" />}
              onClick={handleAddRow}
              className="add-row-button"
            >
              <FormattedMessage
                id="button.addNewRow"
                defaultMessage="Add New Row"
              />
            </Button>

            <table cellSpacing="0" border="0" width="100%" id="balance-table">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>
                    <b>
                      <FormattedMessage
                        id="label.total"
                        defaultMessage="Total"
                      />
                    </b>
                  </td>
                  <td className="text-align-right">
                    <FormattedNumber
                      value={totalDebits}
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  </td>
                  <td className="text-align-right">
                    <FormattedNumber
                      value={totalCredits}
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: "middle", color: "red" }}>
                    <FormattedMessage
                      id="label.difference"
                      defaultMessage="Difference"
                    />
                  </td>
                  <td className="text-align-right" colSpan="2">
                    <FormattedNumber
                      value={difference}
                      style="decimal"
                      minimumFractionDigits={
                        business.baseCurrency.decimalPlaces
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="attachment-upload">
            <p>
              <FormattedMessage
                id="label.attachments"
                defaultMessage="Attachments"
              />
            </p>
            <Button
              type="dashed"
              icon={<UploadOutlined />}
              className="attachment-upload-button"
            >
              <FormattedMessage
                id="button.uploadFile"
                defaultMessage="Upload File"
              />
            </Button>
            <p>
              <FormattedMessage
                id="label.uploadLimit"
                defaultMessage="You can upload a maximum of 5 files, 5MB each"
              />
            </p>
          </div>
        </Form>
      </div>
      <div className="page-actions-bar">
        <Button
          loading={loading}
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          onClick={form.submit}
        >
          <FormattedMessage id="button.save" defaultMessage="Save" />
        </Button>
        {/* <Button className="page-actions-btn">Save as Draft</Button> */}
        <Button
          loading={loading}
          className="page-actions-btn"
          // onClick={() => navigate("/manualJournals")}
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        >
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </div>
    </>
  );
};

export default ManualJournalsEdit;
