import React, { useState, useMemo } from "react";
import { Button, Form, Input, Select, DatePicker, Divider, Modal } from "antd";
import {
  UploadOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import dayjs from "dayjs";
import { BankingTransactionMutations } from "../../graphql";
import { CustomerSearchModal, SupplierSearchModal } from "../../components";
const { UPDATE_BANKING_TRANSACTION } = BankingTransactionMutations;

const initialValues = {
  transactionDate: dayjs(),
};

const ExpenseEdit = ({
  refetch,
  modalOpen,
  setModalOpen,
  branches,
  bankingAccounts,
  accounts,
  allAccounts,
  selectedAcc,
  allTax,
  selectedRecord,
  setSelectedRecord,
  setSelectedRowIndex
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi, business } = useOutletContext();
  const [currencies, setCurrencies] = useState([
    selectedAcc?.currency?.id > 0
      ? selectedAcc.currency
      : business.baseCurrency,
  ]);

  useMemo(() => {
    const parsedRecord =
      form && modalOpen && selectedRecord
        ? {
            branchId: selectedRecord.branch?.id,
            fromAccountId: selectedRecord.fromAccount?.id,
            toAccountId: selectedRecord.toAccount?.id,
            currencyId: selectedRecord.currency?.id,
            amount: selectedRecord.amount,
            customerName: selectedRecord.customer?.name,
            supplierName: selectedRecord.supplier?.name,
            referenceNumber: selectedRecord.referenceNumber,
            description: selectedRecord.description,
            transactionDate: dayjs(selectedRecord.transactionDate),
          }
        : {};
    setSelectedCustomer(selectedRecord?.customer || null);
    setSelectedSupplier(selectedRecord?.supplier || null);
    form.setFieldsValue(parsedRecord);
  }, [form, selectedRecord, modalOpen]);

  const [createAccountTransfer, { loading: createLoading }] = useMutation(
    UPDATE_BANKING_TRANSACTION,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transaction.recorded"
            defaultMessage="Transaction Recorded"
          />
        );
        setSelectedRecord(null); setSelectedRowIndex(0);
        // refetch();
      },
    }
  );

  const handleToAccountChange = (id) => {
    const fromAccountCurrency =
      selectedAcc?.currency?.id > 0
        ? selectedAcc.currency
        : business.baseCurrency;
    let toAccountCurrency = allAccounts?.find((a) => a.id === id)?.currency;
    if (!toAccountCurrency?.id || toAccountCurrency?.id <= 0) {
      toAccountCurrency = business.baseCurrency;
    }
    let newCurrencies = [fromAccountCurrency];
    if (fromAccountCurrency.id !== toAccountCurrency.id) {
      newCurrencies.push(toAccountCurrency);
    }
    console.log(newCurrencies);
    setCurrencies(newCurrencies);
    form.setFieldValue("currency", null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const input = {
        ...values,
        supplierName: undefined,
        customerName: undefined,
        supplierId: selectedSupplier.id,
        customerId: selectedCustomer.id,
        transactionType: "Expense",
        isMoneyIn: false,
      };

      await createAccountTransfer({
        variables: { id: selectedRecord.id, input },
      });
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const createForm = (
    <Form form={form} onFinish={handleSubmit} initialValues={initialValues}>
      <Form.Item
        label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
        name="branchId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        // wrapperCol={{ span: 15 }}
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
        <Select showSearch optionFilterProp="label">
          {branches?.map((branch) => (
            <Select.Option
              key={branch.id}
              value={branch.id}
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
            id="label.fromAccount"
            defaultMessage="From Account"
          />
        }
        name="fromAccountId"
        labelAlign="left"
        labelCol={{ span: 8 }}
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
        <Select showSearch optionFilterProp="label" disabled>
          {bankingAccounts?.map((acc) => (
            <Select.Option key={acc.id} value={acc.id} label={acc.name}>
              {acc.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.expenseAccount"
            defaultMessage="Expense Account"
          />
        }
        name="toAccountId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        // wrapperCol={{ span: 15 }}
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
          showSearch
          optionFilterProp="label"
          onChange={handleToAccountChange}
        >
          {accounts.map((group) => (
            <Select.OptGroup key={group.detailType} label={group.detailType}>
              {group.accounts.map((acc) => (
                <Select.Option key={acc.id} value={acc.id} label={acc.name}>
                  {acc.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.date" defaultMessage="date" />}
        name="transactionDate"
        labelAlign="left"
        labelCol={{ span: 8 }}
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
        <DatePicker format={REPORT_DATE_FORMAT} />
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage id="label.currency" defaultMessage="Currency" />
        }
        name="currencyId"
        labelAlign="left"
        labelCol={{ span: 8 }}
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
        <Select
          //   onChange={(value) => setSelectedCurrency(value)}
          showSearch
          optionFilterProp="label"
        >
          {currencies?.map((currency) => (
            <Select.Option
              key={currency.id}
              value={currency.id}
              label={currency.name + currency.symbol}
            >
              {currency.name} ({currency.symbol})
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
              labelCol={{ span: 8 }}
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

                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    } else if (isNaN(value) || value.length > 20) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "validation.invalidInput",
                          defaultMessage: "Invalid Input",
                        })
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <Input />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.amount" defaultMessage="Amount" />}
        name="amount"
        labelAlign="left"
        labelCol={{ span: 8 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.amount.required"
                defaultMessage="Enter the Amount"
              />
            ),
          },
          () => ({
            validator(_, value) {
              if (!value) {
                return Promise.resolve();
              } else if (isNaN(value) || value.length > 20) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "validation.invalidInput",
                    defaultMessage: "Invalid Input",
                  })
                );
              } else {
                return Promise.resolve();
              }
            },
          }),
        ]}
      >
        <Input />
      </Form.Item>
      {/* <Form.Item
        label={<FormattedMessage id="label.tax" defaultMessage="Tax" />}
        labelCol={{ span: 8 }}
        labelAlign="left"
        name="tax"
      >
        <Select showSearch allowClear optionFilterProp="label">
          {allTax?.map((taxGroup) => (
            <Select.OptGroup key={taxGroup.title} label={taxGroup.title}>
              {taxGroup.taxes.map((tax) => (
                <Select.Option key={tax.id} value={tax.id} label={tax.name}>
                  {tax.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item> */}
      <Form.Item
        label={
          <FormattedMessage
            id="label.referenceNumber"
            defaultMessage="Reference #"
          />
        }
        name="referenceNumber"
        labelAlign="left"
        labelCol={{ span: 8 }}
      >
        <Input maxLength={255}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
        }
        name="supplierName"
        shouldUpdate
        labelAlign="left"
        labelCol={{ span: 8 }}
      >
        <Input
          readOnly
          onClick={setSupplierSearchModalOpen}
          className="search-input"
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
        labelCol={{ span: 8 }}
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
      <Form.Item
        label={
          <FormattedMessage
            id="label.description"
            defaultMessage="Description"
          />
        }
        name="description"
        labelAlign="left"
        labelCol={{ span: 8 }}
      >
        <Input.TextArea maxLength={1000}></Input.TextArea>
      </Form.Item>
      <Divider />
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
  );

  return (
    <>
      <Modal
        width="40rem"
        title={<FormattedMessage id="label.expense" defaultMessage="Expense" />}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
        confirmLoading={createLoading}
      >
        {createForm}
      </Modal>
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
    </>
  );
};

export default ExpenseEdit;
