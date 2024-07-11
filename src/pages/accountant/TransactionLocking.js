import React, { useMemo } from "react";

import {
  Row,
  Col,
  Form,
  Button,
  DatePicker,
  Flex,
  Input,
} from "antd";
import { useMutation } from "@apollo/client";
import dayjs from "dayjs";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { BusinessMutations } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { UPDATE_TRANSACTION_LOCKING } = BusinessMutations;

const TransactionLocking = () => {
  const [formRef] = Form.useForm();
  const {
    notiApi,
    msgApi,
    business,
    refetchBusiness,
  } = useOutletContext();
  
  const [updateTransactionLocking, { loading: updateLoading }] = useMutation(
    UPDATE_TRANSACTION_LOCKING,
    {
      async onCompleted() {
        await refetchBusiness();
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transactionLocking.updated"
            defaultMessage="Transaction Locking Updated"
          />
        );
      },
    }
  );

  const loading = updateLoading;

  const handleSave = async () => {
    try {
      const values = await formRef.validateFields();
      const input = {
        ...values,
      };
      // console.log("Field values:", values);
      await updateTransactionLocking({
        variables: { input },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  useMemo(() => {
    // console.log(data);
    const profile = business;
    if (profile) {
      formRef.setFieldsValue({
        salesTransactionLockDate: dayjs(profile.salesTransactionLockDate),
        purchaseTransactionLockDate: dayjs(profile.purchaseTransactionLockDate),
        bankingTransactionLockDate: dayjs(profile.bankingTransactionLockDate),
        accountantTransactionLockDate: dayjs(profile.accountantTransactionLockDate),
      });
    }
  }, [formRef, business]);

  return (
    <>
      <div className="page-header">
        <Flex align="center" gap={"1rem"}>
          <p className="page-header-text">
            <FormattedMessage id="menu.transactionLocking" defaultMessage="Transaction Locking" />
          </p>
        </Flex>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <Form form={formRef} onFinish={handleSave}>
          <Row>
            <Col span={24}>
              <Form.Item
                label={<FormattedMessage id="label.bankingLockDate" defaultMessage="Banking Lock Date" />}
                name="bankingTransactionLockDate"
                labelAlign="left"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 6 }}
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
                <DatePicker
                  format={REPORT_DATE_FORMAT}
                ></DatePicker>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
            <Form.Item
              label={<FormattedMessage id="label.salesLockDate" defaultMessage="Sales Lock Date" />}
              name="salesTransactionLockDate"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 6 }}
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
              <DatePicker
                format={REPORT_DATE_FORMAT}
              ></DatePicker>
            </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
            <Form.Item
              label={<FormattedMessage id="label.purchaseLockDate" defaultMessage="Purchase Lock Date" />}
              name="purchaseTransactionLockDate"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 6 }}
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
              <DatePicker
                format={REPORT_DATE_FORMAT}
              ></DatePicker>
            </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
            <Form.Item
              label={<FormattedMessage id="label.accountantLockDate" defaultMessage="Accountant Lock Date" />}
              name="accountantTransactionLockDate"
              labelAlign="left"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 6 }}
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
              <DatePicker
                format={REPORT_DATE_FORMAT}
              ></DatePicker>
            </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.reason"
                    defaultMessage="Reason"
                  />
                }
                name="reason"
                labelAlign="left"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 6 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.reason.required"
                        defaultMessage="Enter the Reason"
                      />
                    ),
                  },
                ]}
              >
                <Input.TextArea maxLength={1000} rows="4"></Input.TextArea>
              </Form.Item>
            </Col>
          </Row>
          {/* <br/>
          <Row>
            <FormattedMessage id="message.accountingDiscrepanciesDetected" defaultMessage="Accounting Discrepancies Detected. Please press reconcile button." />
          </Row>
          <Row>
            <Button
              loading={loading}
              type="primary"
              className="page-actions-btn"
            >
              <FormattedMessage id="button.reconcile" defaultMessage="Reconcile" />
            </Button>
          </Row> */}
          <div className="page-actions-bar page-actions-bar-margin">
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
            >
              <FormattedMessage id="button.save" defaultMessage="Save" />
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default TransactionLocking;
