import React, { useState } from "react";
import { Button, Form, Input, Select, DatePicker, Divider, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";

import { BankingMutations } from "../../graphql";
import dayjs from "dayjs";
const { CREATE_ACCOUNT_TRANSFER } = BankingMutations;

const initialValues = {
  transferDate: dayjs(),
};

const OtherIncome = ({
  refetch,
  modalOpen,
  setModalOpen,
  branches,
  parsedData,
  accounts,
  selectedRecord,
  allAccounts,
  allTax,
  paymentModes,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi, business } = useOutletContext();
  const [currencies, setCurrencies] = useState([
    selectedRecord?.currency?.id > 0
      ? selectedRecord.currency
      : business.baseCurrency,
  ]);

  if (form && modalOpen) {
    form.setFieldsValue({
      toAccountId: selectedRecord.id,
    });
  }

  const [createAccountTransfer, { loading: createLoading }] = useMutation(
    CREATE_ACCOUNT_TRANSFER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="account.created"
            defaultMessage="New Account Created"
          />
        );
        refetch();
      },
    }
  );

  const handleFromAccountChange = (id) => {
    const fromAccountCurrency =
      selectedRecord?.currency?.id > 0
        ? selectedRecord.currency
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

      await createAccountTransfer({ variables: { input: values } });
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const transferFromForm = (
    <Form form={form} initialValues={initialValues} onFinish={handleSubmit}>
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
          <FormattedMessage id="label.toAccount" defaultMessage="To Account" />
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
        <Select showSearch optionFilterProp="label" disabled>
          {parsedData?.map((acc) => (
            <Select.Option key={acc.id} value={acc.id} label={acc.name}>
              {acc.name}
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
          onChange={handleFromAccountChange}
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
        name="transferDate"
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
          {currencies.map((currency) => (
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
      <Form.Item
        label={
          <FormattedMessage
            id="label.receivedVia"
            defaultMessage="Received Via"
          />
        }
        name="receivedVia"
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
        <Input></Input>
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
        <Input.TextArea></Input.TextArea>
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
        title={
          <FormattedMessage
            id="label.otherIncome"
            defaultMessage="Other Income"
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
        {transferFromForm}
      </Modal>
    </>
  );
};

export default OtherIncome;
