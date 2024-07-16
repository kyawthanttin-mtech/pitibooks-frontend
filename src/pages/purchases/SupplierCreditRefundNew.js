import React, { useMemo, useState } from "react";
import { Row, Col, Button, Form, Input, Select, DatePicker } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useOutletContext } from "react-router-dom";
import { useMutation, useReadQuery } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { RefundMutations } from "../../graphql";
import dayjs from "dayjs";
import { UploadAttachment } from "../../components";
const { CREATE_REFUND } = RefundMutations;

const SupplierCreditRefundNew = ({
  refetch,
  branches,
  selectedRecord,
  onClose,
  accounts,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi, allPaymentModesQueryRef } = useOutletContext();
  const [fileList, setFileList] = useState(null);
  const [accountCurrencyId, setAccountCurrencyId] = useState(null);

  const { data: paymentModeData } = useReadQuery(allPaymentModesQueryRef);

  const paymentModes = useMemo(() => {
    return paymentModeData?.listAllPaymentMode?.filter(
      (mode) => mode.isActive === true
    );
  }, [paymentModeData]);

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileUrls = fileList?.map((file) => ({
        documentUrl: file.imageUrl,
      }));

      const input = {
        branchId: values.branch,
        supplierId: selectedRecord.supplier.id,
        currencyId: selectedRecord.currency.id,
        exchangeRate: values.exchangeRate,
        amount: values.amount,
        refundDate: values.date,
        paymentModeId: values.paymentMode,
        referenceNumber: values.referenceNumber,
        description: values.description,
        accountId: values.toAccountId,
        referenceId: selectedRecord.id,
        referenceType: "SC",
        documents: fileUrls,
      };

      await createRefund({ variables: { input: input } });
      onClose();
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleAccountChange = (id) => {
    let selectedAccount;
    accounts.forEach((group) => {
      const account = group.accounts.find((acc) => acc.id === id);
      if (account) {
        selectedAccount = account;
      }
    });
    setAccountCurrencyId(selectedAccount?.currency?.id || null);
  };

  const handleAmountChange = () => {
    const amount = form.getFieldValue("amount");
    if (amount > selectedRecord.remainingBalance) {
      form.setFieldsValue({ amount: selectedRecord.remainingBalance });
    }
  };

  useMemo(() => {
    form.setFieldsValue({
      branch: selectedRecord?.branch?.id,
      amount: selectedRecord?.remainingBalance,
    });
  }, [form, selectedRecord]);

  return (
    <div className="content-column-full-row page-content-with-form-buttons">
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row>
          <Col span={7}>
            <Form.Item
              label={
                <FormattedMessage id="label.branch" defaultMessage="Branch" />
              }
              name="branch"
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
                  id="label.paidVia"
                  defaultMessage="Paid Via"
                />
              }
              name="paymentMode"
            >
              <Select showSearch optionFilterProp="label">
                {paymentModes?.map((mode) => (
                  <Select.Option
                    key={mode.id}
                    value={mode.id}
                    label={mode.name}
                  >
                    {mode.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <FormattedMessage id="label.amount" defaultMessage="Amount" />
              }
              name="amount"
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
                addonBefore={selectedRecord.currency.symbol}
                onBlur={handleAmountChange}
              ></Input>
            </Form.Item>
            {accountCurrencyId &&
              selectedRecord.currency.id !== accountCurrencyId && (
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.exchangeRate"
                      defaultMessage="Exchange Rate"
                    />
                  }
                  name="exchangeRate"
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
                        } else if (
                          isNaN(value) ||
                          value.length > 20 ||
                          value < 0
                        ) {
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
          </Col>
          <Col span={7} offset={1}>
            <Form.Item
              label={<FormattedMessage id="label.date" defaultMessage="date" />}
              name="date"
              initialValue={dayjs()}
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
                <FormattedMessage
                  id="label.referenceNumber"
                  defaultMessage="Reference #"
                />
              }
              name="referenceNumber"
            >
              <Input maxLength={255}></Input>
            </Form.Item>{" "}
            <Form.Item
              label={
                <FormattedMessage
                  id="label.depositTo"
                  defaultMessage="Deposit To"
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
                onChange={(value) => handleAccountChange(value)}
              >
                {accounts.map((group) => (
                  <Select.OptGroup
                    key={group.detailType}
                    label={group.detailType}
                  >
                    {group.accounts.map((acc) => (
                      <Select.Option
                        key={acc.id}
                        value={acc.id}
                        label={acc.name}
                      >
                        {acc.name}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={
            <FormattedMessage
              id="label.description"
              defaultMessage="Description"
            />
          }
          name="description"
          wrapperCol={{ span: 15 }}
        >
          <Input.TextArea rows={4} maxLength={1000}></Input.TextArea>
        </Form.Item>
        <UploadAttachment
          onCustomFileListChange={(customFileList) =>
            setFileList(customFileList)
          }
        />
        <div className="page-actions-bar page-actions-bar-margin">
          <Button
            loading={createLoading}
            type="primary"
            htmlType="submit"
            className="page-actions-btn"
          >
            <FormattedMessage id="button.save" defaultMessage="Save" />
          </Button>
          <Button
            loading={createLoading}
            className="page-actions-btn"
            onClick={onClose}
          >
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SupplierCreditRefundNew;
