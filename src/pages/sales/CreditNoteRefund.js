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
import { BankingTransactionMutations } from "../../graphql";
import dayjs from "dayjs";
import { UploadAttachment } from "../../components";
const { CREATE_BANKING_TRANSACTION } = BankingTransactionMutations;

const CreditNoteRefund = ({ refetch, branches, selectedRecord, onClose }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState(null);
  const { notiApi, msgApi, business, allPaymentModesQueryRef } =
    useOutletContext();

  const { data: paymentModeData } = useReadQuery(allPaymentModesQueryRef);

  const paymentModes = useMemo(() => {
    return paymentModeData?.listAllPaymentMode?.filter(
      (mode) => mode.isActive === true
    );
  }, [paymentModeData]);

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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileUrls = fileList?.map((file) => ({
        documentUrl: file.imageUrl,
      }));

      const input = {
        branchId: values.branch,
        customerId: selectedRecord.customer.id,
        currencyId: selectedRecord.currency.id,
        exchangeRate: values.exchangeRate,
        amount: values.amount,
        transactionDate: values.date,
        paymentModeId: values.paymentMode,
        referenceNumber: values.referenceNumber,
        description: values.description,
        transactionType: "CreditNoteRefund",
        // isMoneyIn: false,
        documents: fileUrls,
        // paidBills: [
        //   {
        //     paidBillId: 0,
        //     billId: selectedRecord.id,
        //     paidAmount: values.amount,
        //   },
        // ],
      };

      await createAccountTransfer({ variables: { input: input } });
      onClose();
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  useMemo(() => {
    console.log(selectedRecord);
    form.setFieldsValue({
      branch: selectedRecord?.branch.id,
      amount: selectedRecord?.creditNoteTotalAmount,
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
              <Input addonBefore={selectedRecord.currency.symbol}></Input>
            </Form.Item>
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
            </Form.Item>

            {selectedRecord.currency.id !== business.baseCurrency.id && (
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
            )}
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

export default CreditNoteRefund;
