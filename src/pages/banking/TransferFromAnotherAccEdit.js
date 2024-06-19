import React, { useState, useMemo, useCallback } from "react";
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
import dayjs from "dayjs";
import { BankingTransactionMutations } from "../../graphql";
import { UploadAttachment } from "../../components";
const { UPDATE_BANKING_TRANSACTION } = BankingTransactionMutations;

const initialValues = {
  transactionDate: dayjs(),
};

const TransferFromAnotherAccEdit = ({
  refetch,
  modalOpen,
  setModalOpen,
  branches,
  bankingAccounts,
  accounts,
  allAccounts,
  selectedAcc,
  selectedRecord,
  setSelectedRecord,
  setSelectedRowIndex,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi, business } = useOutletContext();
  const [fileList, setFileList] = useState(null);
  const [currencies, setCurrencies] = useState([
    selectedAcc?.currency?.id > 0
      ? selectedAcc.currency
      : business.baseCurrency,
  ]);

  const handleFromAccountChange = useCallback(
    (id) => {
      const toAccountCurrency =
        selectedAcc?.currency?.id > 0
          ? selectedAcc.currency
          : business.baseCurrency;
      let fromAccountCurrency = allAccounts?.find((a) => a.id === id)?.currency;
      if (!fromAccountCurrency?.id || fromAccountCurrency?.id <= 0) {
        fromAccountCurrency = business.baseCurrency;
      }
      let newCurrencies = [toAccountCurrency];
      if (toAccountCurrency.id !== fromAccountCurrency.id) {
        newCurrencies.push(fromAccountCurrency);
      }
      console.log(newCurrencies);
      setCurrencies(newCurrencies);
      form.setFieldValue("currency", null);
    },
    [allAccounts, business.baseCurrency, form, selectedAcc.currency]
  );

  useMemo(() => {
    const parsedRecord =
      form && modalOpen && selectedRecord
        ? {
            branchId: selectedRecord.branch?.id || null,
            fromAccountId: selectedRecord.fromAccount?.id || null,
            toAccountId: selectedRecord.toAccount?.id || null,
            currencyId: selectedRecord.currency?.id || null,
            amount: selectedRecord.amount,
            bankCharges: selectedRecord.bankCharges,
            referenceNumber: selectedRecord.referenceNumber,
            description: selectedRecord.description,
            transactionDate: dayjs(selectedRecord.transactionDate),
          }
        : {};

    form.setFieldsValue(parsedRecord);
    handleFromAccountChange(selectedRecord?.toAccount?.id);
  }, [form, selectedRecord, modalOpen, handleFromAccountChange]);

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
        setSelectedRecord(null);
        setSelectedRowIndex(0);
        refetch();
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileUrls = fileList?.map((file) => ({
        documentUrl: file.imageUrl || file.documentUrl,
        isDeletedItem: file.isDeletedItem,
        id: file.id,
      }));

      const input = {
        ...values,
        transactionType: "TransferFromAnotherAccounts",
        // isMoneyIn: true,
        documents: fileUrls,
      };

      await createAccountTransfer({
        variables: { id: selectedRecord.id, input: input },
      });
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
      {currencies.length > 1 &&
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
      }
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
            id="label.bankChargesIfAny"
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
      <UploadAttachment
        onCustomFileListChange={(customFileList) => setFileList(customFileList)}
      />
    </Form>
  );
  return (
    <Modal
      width="40rem"
      title={
        <FormattedMessage
          id="label.transferFromAnotherAccount"
          defaultMessage="Transfer From Another Account"
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
  );
};

export default TransferFromAnotherAccEdit;
