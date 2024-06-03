import React, { useState } from "react";
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

import { BankingMutations } from "../../graphql";
import dayjs from "dayjs";
import { SupplierSearchModal } from "../../components"; // Changed import
const { CREATE_ACCOUNT_TRANSFER } = BankingMutations;

const initialValues = {
  date: dayjs(),
};
const SupplierCreditRefund = ({
  refetch,
  modalOpen,
  setModalOpen,
  paymentModes,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { notiApi, msgApi, business } = useOutletContext();

  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(false);

  const handleSubmit = async () => {
    // try {
    //   const values = await form.validateFields();
    //   await createAccountTransfer({ variables: { input: values } });
    //   setModalOpen(false);
    //   form.resetFields();
    // } catch (err) {
    //   openErrorNotification(notiApi, err.message);
    // }
  };

  const refundForm = (
    <Form form={form} onFinish={handleSubmit} initialValues={initialValues}>
      <Form.Item
        label={
          <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
        }
        name="supplierName" // Changed name
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
        name="paidVia"
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
        con
        width="40rem"
        title={
          <FormattedMessage
            id="label.supplierCreditRefund"
            defaultMessage="Supplier Credit Refund"
          />
        }
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
        // confirmLoading={createLoading}
      >
        {refundForm}
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

export default SupplierCreditRefund;
