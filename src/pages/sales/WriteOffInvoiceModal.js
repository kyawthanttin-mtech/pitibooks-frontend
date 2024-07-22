import { DatePicker, Form, Input, Modal } from "antd";
import dayjs from "dayjs";
import React from "react";
import { FormattedMessage } from "react-intl";
import { InvoiceMutations } from "../../graphql";
import { useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
const { WRITE_OFF_INVOICE } = InvoiceMutations;

const WriteOffInvoiceModal = ({
  modalOpen,
  setModalOpen,
  invoiceId,
  setSelectedRecord,
}) => {
  const [form] = Form.useForm();
  const { notiApi, msgApi } = useOutletContext();

  const [writeOffInvoice, { loading }] = useMutation(WRITE_OFF_INVOICE, {
    onCompleted() {
      openSuccessMessage(
        msgApi,
        <FormattedMessage
          id="invoice.writtenOff"
          defaultMessage="Invoice Successfully Written Off"
        />
      );
      setSelectedRecord(null);
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await writeOffInvoice({
        variables: { id: invoiceId, date: values.date, reason: values.reason },
      });
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  return (
    <Modal
      title={
        <FormattedMessage
          id="label.writeOffInvoice"
          defaultMessage="Write Off Invoice"
        />
      }
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      okText={
        <FormattedMessage id="button.writeOff" defaultMessage="Write Off" />
      }
      onOk={form.submit}
      confirmLoading={loading}
    >
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          label={
            <FormattedMessage id="label.writeOff" defaultMessage="Write Off" />
          }
          name="date"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 13 }}
          initialValue={dayjs()}
        >
          <DatePicker allowClear={false}></DatePicker>
        </Form.Item>
        <Form.Item
          label={<FormattedMessage id="label.reason" defaultMessage="Reason" />}
          name="reason"
          labelAlign="left"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 13 }}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="label.reason.required"
                  defaultMessage="Enter The Reason"
                />
              ),
            },
          ]}
        >
          <Input.TextArea rows={4}></Input.TextArea>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WriteOffInvoiceModal;
