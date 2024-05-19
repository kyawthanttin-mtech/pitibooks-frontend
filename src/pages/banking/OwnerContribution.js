import React from "react";
import { Button, Form, Input, Select, DatePicker, Divider, Modal } from "antd";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useOutletContext } from "react-router-dom";

const OwnerContribution = ({
  ownerContributionModalOpen,
  setOwnerContributionModalOpen,
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

  if (form && ownerContributionModalOpen) {
    form.setFieldsValue({
      toAccountId: selectedRecord.id,
    });
  }

  const ownerContributionForm = (
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
          <FormattedMessage id="label.toAccount" defaultMessage="To Account" />
        }
        name="toAccountId"
        labelAlign="left"
        labelCol={{ span: 8 }}

        // wrapperCol={{ span: 15 }}
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
      >
        <Select showSearch optionFilterProp="label">
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
        name="date"
        labelAlign="left"
        labelCol={{ span: 8 }}
      >
        <DatePicker format={REPORT_DATE_FORMAT} />
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
        label={<FormattedMessage id="label.amount" defaultMessage="Amount" />}
        name="amount"
        labelAlign="left"
        labelCol={{ span: 8 }}
      >
        <Input
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
        />
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
    <Modal
      width="40rem"
      title={
        <FormattedMessage
          id="label.ownerDrawings"
          defaultMessage="Owner Drawings"
        />
      }
      okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
      cancelText={
        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
      }
      open={ownerContributionModalOpen}
      onCancel={() => setOwnerContributionModalOpen(false)}
    >
      {ownerContributionForm}
    </Modal>
  );
};

export default OwnerContribution;
