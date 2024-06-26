import React, { useState, useMemo, useCallback } from "react";
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
import { SupplierSearchModal, UploadAttachment } from "../../components";
const { UPDATE_BANKING_TRANSACTION } = BankingTransactionMutations;

const initialValues = {
  transactionDate: dayjs(),
};
const SupplierAdvanceEdit = ({
  refetch,
  modalOpen,
  setModalOpen,
  branches,
  selectedAcc,
  paymentModes,
  allAccounts,
  accounts,
  bankingAccounts,
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
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(false);

  const handleToAccountChange = useCallback(
    (id) => {
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
            paymentModeId: selectedRecord.paymentMode?.id || null,
            supplierName: selectedRecord.supplier?.name,
          }
        : {};
    setSelectedSupplier(selectedRecord?.supplier || null);
    form.setFieldsValue(parsedRecord);
    handleToAccountChange(selectedRecord?.toAccount?.id);
  }, [form, selectedRecord, modalOpen, handleToAccountChange]);

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
        currencyId: selectedAcc?.currency.id,
        supplierName: undefined,
        supplierId: selectedSupplier?.id,
        transactionType: "SupplierAdvance",
        // isMoneyIn: false,
        documents: fileUrls,
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
          <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
        }
        name="supplierName"
        shouldUpdate
        labelAlign="left"
        labelCol={{ span: 8 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.supplier.required"
                defaultMessage="Select the Supplier"
              />
            ),
          },
        ]}
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
            id="label.supplierAdvance"
            defaultMessage="Supplier Advance"
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
      <SupplierSearchModal
        modalOpen={supplierSearchModalOpen}
        setModalOpen={setSupplierSearchModalOpen}
        onRowSelect={(record) => {
          setSelectedSupplier(record);
          form.setFieldsValue({ supplierName: record.name });
        }}
      />
    </>
  );
};

export default SupplierAdvanceEdit;
