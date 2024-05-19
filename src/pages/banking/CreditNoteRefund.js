import React from "react";
import { Button, Form, Input, Select, DatePicker, Divider, Modal } from "antd";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useOutletContext } from "react-router-dom";

const CreditNoteRefund = ({
  modalOpen,
  setModalOpen,
  branches,
  currencies,
  parsedData,
  accounts,
  selectedRecord,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const {
    notiApi,
    msgApi,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allAccountsQueryRef,
    business,
    refetchAllAccounts,
  } = useOutletContext();

  const creditNoteRefundForm = (
    <Form form={form}>
      <Form.Item
        label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
        name="branchId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        // wrapperCol={{ span: 15 }}
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
          <FormattedMessage id="label.currency" defaultMessage="Currency" />
        }
        name="currency"
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
    </Form>
  );

  return (
    <Modal
      width="40rem"
      title={
        <FormattedMessage
          id="label.paymentFund"
          defaultMessage="Credit Note Refund"
        />
      }
      okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
      cancelText={
        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
      }
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
    >
      {creditNoteRefundForm}
    </Modal>
  );
};

export default CreditNoteRefund;
