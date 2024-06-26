import React, { useState } from "react";
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

import { BankingTransactionMutations } from "../../graphql";
import dayjs from "dayjs";
import { CustomerSearchModal, UploadAttachment } from "../../components";
const { CREATE_BANKING_TRANSACTION } = BankingTransactionMutations;

const initialValues = {
  transactionDate: dayjs(),
};
const CustomerAdvanceRefundNew = ({
  refetch,
  modalOpen,
  setModalOpen,
  branches,
  selectedAcc,
  paymentModes,
  allAccounts,
  accounts,
  bankingAccounts,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi, business } = useOutletContext();
  const [currencies, setCurrencies] = useState([
    selectedAcc?.currency?.id > 0
      ? selectedAcc.currency
      : business.baseCurrency,
  ]);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(false);
  const [fileList, setFileList] = useState(null);

  if (form && modalOpen) {
    form.setFieldsValue({
      fromAccountId: selectedAcc.id,
    });
  }

  const [createAccountTransfer, { loading: createLoading }] = useMutation(
    CREATE_BANKING_TRANSACTION,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transaction.recorded"
            defaultMessage="Transaction Recorded"
          />
        );
        refetch();
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
    form.setFieldValue("currencyId", null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileUrls = fileList?.map((file) => ({
        documentUrl: file.imageUrl || file.documentUrl,
      }));

      const input = {
        ...values,
        currencyId: selectedAcc?.currency.id,
        customerName: undefined,
        customerId: selectedCustomer?.id,
        transactionType: "CustomerAdvance",
        // isMoneyIn: true,
        documents: fileUrls,
      };

      await createAccountTransfer({ variables: { input } });
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const transferToForm = (
    <Form form={form} onFinish={handleSubmit} initialValues={initialValues}>
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
          <FormattedMessage id="label.depositTo" defaultMessage="Deposit To" />
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
        label={
          <FormattedMessage id="label.customer" defaultMessage="Customer" />
        }
        name="customerName"
        shouldUpdate
        labelAlign="left"
        labelCol={{ span: 8 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.customer.required"
                defaultMessage="Select the Customer"
              />
            ),
          },
        ]}
      >
        <Input
          readOnly
          onClick={setCustomerSearchModalOpen}
          className="search-input"
          allowClear
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
        label={
          <FormattedMessage
            id="label.bankCharges"
            defaultMessage="Bank Charges"
          />
        }
        name="bankCharges"
        labelAlign="left"
        labelCol={{ span: 8 }}
        rules={[
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
      <Form.Item
        label={
          <FormattedMessage id="label.paidVia" defaultMessage="Paid Via" />
        }
        name="paymentModeId"
        labelAlign="left"
        labelCol={{ span: 8 }}
      >
        <Select showSearch optionFilterProp="label">
          {paymentModes?.map((p) => (
            <Select.Option key={p.id} value={p.id} label={p.name}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
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
        labelCol={{ span: 8 }}
      >
        <Input maxLength={255}></Input>
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
      <UploadAttachment
        onCustomFileListChange={(customFileList) => setFileList(customFileList)}
      />
    </Form>
  );

  return (
    <>
      <Modal
        con
        width="40rem"
        title={
          <FormattedMessage
            id="label.customerAdvance"
            defaultMessage="Customer Advance"
          />
        }
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
        confirmLoading={createLoading}
      >
        {transferToForm}
      </Modal>
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

export default CustomerAdvanceRefundNew;
