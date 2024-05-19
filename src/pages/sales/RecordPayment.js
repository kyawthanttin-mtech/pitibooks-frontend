import React, {useMemo} from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useOutletContext } from "react-router-dom";
import { useMutation, useReadQuery } from "@apollo/client";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { SupplierPaymentMutations } from "../../graphql";
const {
  CREATE_SUPPLIER_PAYMENT,
} = SupplierPaymentMutations;

const RecordPayment = ({ 
  refetch,
  branches, 
  selectedRecord, 
  onClose,  
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { 
    notiApi,
    msgApi,
    allPaymentModesQueryRef, 
    allAccountsQueryRef,
  } = useOutletContext();

  const { data: paymentModeData } = useReadQuery(allPaymentModesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);

  const paymentModes = useMemo(() => {
    return paymentModeData?.listAllPaymentMode?.filter(
      (mode) => mode.isActive === true
    );
  }, [paymentModeData]);

  const accounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter((account) => 
        account.detailType === "Cash" ||
        account.detailType === "Bank" ||
        account.detailType === "OtherAsset" ||
        account.detailType === "OtherCurrentAsset" ||
        account.detailType === "Equity"
      )
      .reduce((acc, account) => {
        const { detailType } = account;
        if (!acc[detailType]) {
          acc[detailType] = { detailType, accounts: [] };
        }
        acc[detailType].accounts.push(account);
        return acc;
      }, {});

    return Object.values(groupedAccounts);
  }, [accountData]);


  const [createSupplierPayment, { loading: createLoading }] = useMutation(
    CREATE_SUPPLIER_PAYMENT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="supplierPayment.created"
            defaultMessage="New Supplier Payment Created"
          />
        );
        refetch();
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let input = {};

      // if (!values.branch || values.branch.length === 0) {
      //   openErrorNotification(
      //     notiApi,
      //     intl.formatMessage({
      //       id: "validation.requiredAtLeastOneBranch",
      //       defaultMessage: "At least one Branch is required",
      //     })
      //   );
      //   return;
      // }
      // input = {
      //   detailType: "Bank",
      //   mainType: "Asset",
      //   code: values.code,
      //   name: values.name,
      //   parentAccountId: 0,
      //   accountNumber: values.accountNumber,
      //   branches: values.branch?.join(" | "),
      //   currencyId: values.currency,
      // };

      await createSupplierPayment({ variables: { input: input } });
      onClose();
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  return (
    <div className="content-column-full-row page-content-with-form-buttons">
      <Form layout="vertical" form={form} onFinish={handleSubmit} >
        <Row>
          <Col span={7}>
            <Form.Item
              label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
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
              label={<FormattedMessage id="label.paidThrough" defaultMessage="Paid Through" />}
              name="paidThrough"
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.paidThrough.required"
                      defaultMessage="Select the Paid Through"
                    />
                  ),
                },
              ]}
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
              label={<FormattedMessage id="label.amount" defaultMessage="Amount" />}
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
              <Input></Input>
            </Form.Item>
            <Form.Item 
              label={<FormattedMessage id="label.paymentMode" defaultMessage="Payment Mode" />}
              name="paymentMode"
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.paymentMode.required"
                      defaultMessage="Select the Payment Mode"
                    />
                  ),
                },
              ]}
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
          </Col>
          <Col span={7} offset={1}>
            <Form.Item 
              label={<FormattedMessage id="label.date" defaultMessage="date" />}
              name="date"
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
            <Form.Item label="Reference #" name="referenceNumber">
              <Input maxLength={255}></Input>
            </Form.Item>
            <Form.Item 
              label={<FormattedMessage id="label.bankCharges" defaultMessage="Bank Charges" />}
              name="bankCharges"
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
              <Input></Input>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Notes" name="notes" wrapperCol={{ span: 15 }}>
          <Input.TextArea rows={4}></Input.TextArea>
        </Form.Item>
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
        <div className="page-actions-bar page-actions-bar-margin">
          <Button loading={createLoading} type="primary" htmlType="submit" className="page-actions-btn">
            <FormattedMessage id="button.save" defaultMessage="Save" />
          </Button>
          <Button loading={createLoading} className="page-actions-btn" onClick={onClose}>
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RecordPayment;
