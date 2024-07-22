import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Divider,
  Modal,
  Table,
  Radio,
} from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import { useMutation } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";

import { RefundMutations } from "../../graphql";
import dayjs from "dayjs";
import { CustomerSearchModal, UploadAttachment } from "../../components";
const { CREATE_REFUND } = RefundMutations;

const initialValues = {
  date: dayjs(),
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
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi } = useOutletContext();
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [fileList, setFileList] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [fromAccountCurrencyId, setFromAccountCurrencyId] = useState(
    selectedAcc?.currency?.id || null
  );
  const [selectedBranch, setSelectedBranch] = useState(null);

  console.log(fromAccountCurrencyId && selectedBranch && selectedCustomer);

  if (form && modalOpen) {
    form.setFieldsValue({
      fromAccountId: selectedAcc?.id,
    });
  }
  //Mutations
  const [createRefund, { loading: createLoading }] = useMutation(
    CREATE_REFUND,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="refund.informationSaved"
            defaultMessage="Refund Information Saved"
          />
        );
        refetch();
      },
    }
  );

  const handleFromAccountChange = (id) => {
    const selectedAccount = allAccounts.find((account) => account.id === id);
    setFromAccountCurrencyId(selectedAccount?.currency?.id || null);
  };

  const handleRefundAmountChange = (record) => {
    const recordId = record?.id;
    const refundAmount = form.getFieldValue(`refundAmount${recordId}`);
    const remainingBalance = selectedCustomer?.availableAdvances.find(
      (advance) => advance.id === recordId
    )?.remainingBalance;

    if (refundAmount > remainingBalance) {
      form.setFieldsValue({
        [`refundAmount${recordId}`]: remainingBalance,
      });
    }

    if (selectedAdvance?.id !== recordId) {
      form.resetFields([`refundAmount${selectedAdvance?.id}`]);
      setSelectedAdvance(record);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileUrls = fileList?.map((file) => ({
        documentUrl: file.imageUrl || file.documentUrl,
      }));

      const input = {
        accountId: values.fromAccountId,
        branchId: values.branchId,
        referenceNumber: values.referenceNumber,
        refundDate: values.date,
        paymentModeId: values.paymentModeId,
        exchangeRate: values.exchangeRate,
        amount: values[`refundAmount${selectedAdvance?.id}`],
        currencyId: selectedAdvance?.currency?.id,
        customerName: undefined,
        customerId: selectedCustomer?.id,
        referenceType: "CA",
        referenceId: selectedAdvance?.id,
        // documents: fileUrls,
      };

      if (!selectedAdvance) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "validation.pleaseSelectAnAdvance",
            defaultMessage: "Please select an advance",
          })
        );
        return;
      }
      if (
        !values[`refundAmount${selectedAdvance?.id}`] ||
        values[`refundAmount${selectedAdvance?.id}`] < 0
      ) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "validation.pleaseSelectAnAdvance",
            defaultMessage: "Please select an advance",
          })
        );
        return;
      }

      await createRefund({ variables: { input } });
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const advanceColumns = [
    {
      dataIndex: "radio",
      key: "radio",
      render: (_, record) => (
        <Radio
          value={record.id}
          style={{ margin: 0 }}
          onChange={() => handleRefundAmountChange(record)}
        ></Radio>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (_, record) => dayjs(record.date).format(REPORT_DATE_FORMAT),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (_, record) => (
        <>
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={record.amount}
            style="decimal"
            minimumFractionDigits={record.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: "Balance",
      dataIndex: "remainingBalance",
      align: "right",
      key: "remainingBalance",
      render: (_, record) => (
        <>
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={record.remainingBalance}
            style="decimal"
            minimumFractionDigits={record.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: "Refund Amount",
      dataIndex: "refundAmount",
      key: "refundAmount",
      align: "right",
      render: (_, record) => (
        <Form.Item
          name={`refundAmount${record.id}`}
          rules={[
            {
              required: selectedAdvance?.id === record.id,
              message: (
                <FormattedMessage
                  id="label.refundAmount.required"
                  defaultMessage="Enter The Refund Amount"
                />
              ),
            },
            () => ({
              validator(_, value) {
                if (!value) {
                  return Promise.resolve();
                } else if (isNaN(value) || value.length > 20 || value < 0) {
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
          <Input
            style={{ textAlign: "right" }}
            onBlur={() => handleRefundAmountChange(record)}
          ></Input>
        </Form.Item>
      ),
    },
  ];

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
          disabled
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
                    form.setFieldsValue({
                      [`refundAmount${selectedAdvance?.id}`]: null,
                    });
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
        <Select
          showSearch
          optionFilterProp="label"
          onSelect={(value) => setSelectedBranch(value)}
        >
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
      <Divider />
      <div
        className={
          selectedCustomer && fromAccountCurrencyId && selectedBranch
            ? ""
            : "form-mask"
        }
      >
        <Form.Item
          label={<FormattedMessage id="label.date" defaultMessage="date" />}
          name="date"
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
        <label className="ant-form-item-required" htmlFor="refundAmount">
          <span
            style={{
              fontSize: "14px",
              lineHeight: 1,
              display: "inline-block",
              marginInlineEnd: "4px",
              fontFamily: "SimSun, sans-serif",
              color: "#ff4d4f",
            }}
          >
            *
          </span>
          Select an advance
        </label>
        <Radio.Group value={selectedAdvance?.id} style={{ width: "100%" }}>
          <Table
            style={{ marginBottom: "24px" }}
            className="payment-table"
            rowKey={(record) => record.id}
            columns={advanceColumns}
            dataSource={selectedCustomer?.availableAdvances}
            pagination={false}
          ></Table>
        </Radio.Group>
        {selectedAdvance &&
          selectedCustomer &&
          fromAccountCurrencyId !== selectedAdvance?.currency?.id && (
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
                    } else if (isNaN(value) || value.length > 20 || value < 0) {
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
          )}
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
          onCustomFileListChange={(customFileList) =>
            setFileList(customFileList)
          }
        />
      </div>
    </Form>
  );

  return (
    <>
      <Modal
        width="40rem"
        title={
          <FormattedMessage
            id="label.customerAdvanceRefund"
            defaultMessage="Customer Advance Refund"
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
          setSelectedAdvance(null);
          form.setFieldsValue({ customerName: record.name });
        }}
      />
    </>
  );
};

export default CustomerAdvanceRefundNew;
