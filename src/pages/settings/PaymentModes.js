import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Dropdown, Form, Modal, Input, Space, Table, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { PaymentModeMutations } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useReadQuery } from "@apollo/client";
const {
  CREATE_PAYMENT_MODE,
  UPDATE_PAYMENT_MODE,
  DELETE_PAYMENT_MODE,
  TOGGLE_ACTIVE_PAYMENT_MODE,
} = PaymentModeMutations;

const PaymentModes = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFormRef] = Form.useForm();
  const { notiApi, msgApi, allPaymentModesQueryRef, refetchAllPaymentModes } =
    useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);

  //Queries
  const { data } = useReadQuery(allPaymentModesQueryRef);

  const [createPaymentMode, { loading: createLoading }] = useMutation(
    CREATE_PAYMENT_MODE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="paymentMode.created"
            defaultMessage="New Payment Mode Created"
          />
        );
        refetchAllPaymentModes();
      },
    }
  );

  const [updatePaymentMode, { loading: updateLoading }] = useMutation(
    UPDATE_PAYMENT_MODE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="paymentMode.updated"
            defaultMessage="Payment Mode Updated"
          />
        );
        refetchAllPaymentModes();
      },
    }
  );

  const [deletePaymentMode, { loading: deleteLoading }] = useMutation(
    DELETE_PAYMENT_MODE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="paymentMode.deleted"
            defaultMessage="Payment Mode Deleted"
          />
        );
        refetchAllPaymentModes();
      },
    }
  );

  const [toggleActivePaymentMode, { loading: toggleActiveLoading }] =
    useMutation(TOGGLE_ACTIVE_PAYMENT_MODE, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="paymentMode.updated.status"
            defaultMessage="Payment Mode Status Updated"
          />
        );
        refetchAllPaymentModes();
      },
    });

  const loading =
    createLoading || updateLoading || deleteLoading || toggleActiveLoading;

  const queryData = useMemo(() => data?.listAllPaymentMode, [data]);

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      console.log("Field values:", values);
      await createPaymentMode({
        variables: {
          input: {
            name: values.name,
          },
        },
      });
      setCreateModalOpen(false);
      createFormRef.resetFields();
      setCreateModalOpen(false);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleCreateModalCancel = () => {
    setCreateModalOpen(false);
    createFormRef.resetFields();
  };

  const handleDelete = async (record) => {
    // console.log("delete", record.id);
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.delete"
          defaultMessage="Are you sure to delete?"
        />
      ),
    });
    if (confirmed) {
      try {
        await deletePaymentMode({
          variables: {
            id: record.id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    editFormRef.resetFields();
    editFormRef.setFieldsValue({
      id: record.id,
      name: record.name,
    });
    // console.log(record.state);

    setEditModalOpen(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      // console.log("Field values:", values);
      await updatePaymentMode({
        variables: { id: editRecord.id, input: values },
      });

      setEditModalOpen(false);
      editFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleEditModalCancel = () => {
    setEditModalOpen(false);
  };

  const handleToggleActive = async (record) => {
    try {
      await toggleActivePaymentMode({
        variables: { id: record.id, isActive: !record.isActive },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const createForm = (
    <Form
      form={createFormRef}
      onFinish={handleCreateModalOk}
      autoComplete="off"
      labelCol={{
        lg: 7,
        xs: 7,
      }}
      wrapperCol={{
        lg: 11,
        xs: 11,
      }}
      style={{
        maxWidth: 600,
      }}
    >
      <Form.Item
        label={<FormattedMessage id="paymentMode.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="paymentMode.name.required"
                defaultMessage="Enter the Shipment Preference Name"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={20} />
      </Form.Item>
    </Form>
  );
  const editForm = (
    <Form
      form={editFormRef}
      onFinish={handleEditModalOk}
      autoComplete="off"
      labelCol={{
        lg: 7,
        xs: 7,
      }}
      wrapperCol={{
        lg: 11,
        xs: 11,
      }}
      style={{
        maxWidth: 600,
      }}
    >
      <Form.Item
        label={<FormattedMessage id="paymentMode.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="paymentMode.name.required"
                defaultMessage="Enter the Payment Mode Name"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={20} />
      </Form.Item>
    </Form>
  );

  const columns = [
    {
      title: <FormattedMessage id="paymentMode.name" defaultMessage="Name" />,
      key: "name",
      dataIndex: "name",
      render: (text, record) => (
        <>
          {text}
          {!record.isActive ? (
            <Tag className="active-status">inactive</Tag>
          ) : (
            <></>
          )}
        </>
      ),
    },

    {
      title: "",
      dataIndex: "action",
      render: (_, record) =>
        hoveredRow === record.id ? (
          <Dropdown
            trigger="click"
            key={record.key}
            menu={{
              onClick: ({ key }) => {
                if (key === "1") handleEdit(record);
                else if (key === "2") handleToggleActive(record);
                else if (key === "3") handleDelete(record);
              },
              items: [
                {
                  label: (
                    <FormattedMessage id="button.edit" defaultMessage="Edit" />
                  ),
                  key: "1",
                },
                {
                  label: !record.isActive ? (
                    <FormattedMessage
                      id="button.markActive"
                      defaultMessage="Mark As Active"
                    />
                  ) : (
                    <FormattedMessage
                      id="button.markInactive"
                      defaultMessage="Mark As Inactive"
                    />
                  ),
                  key: "2",
                },
                {
                  label: (
                    <FormattedMessage
                      id="button.delete"
                      defaultMessage="Delete"
                    />
                  ),
                  key: "3",
                },
              ],
            }}
          >
            <DownCircleFilled className="action-icon" />
          </Dropdown>
        ) : (
          <div className="action-placeholder"></div>
        ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Modal
        //   loading={loading}
        width="40rem"
        title={
          <FormattedMessage
            id="paymentMode.new"
            defaultMessage="New Payment Mode"
          />
        }
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={createModalOpen}
        onCancel={handleCreateModalCancel}
        onOk={createFormRef.submit}
      >
        {createForm}
      </Modal>
      <Modal
        width="40rem"
        title={
          <FormattedMessage
            id="paymentMode.edit"
            defaultMessage="Edit Payment Mode"
          />
        }
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={editModalOpen}
        onCancel={handleEditModalCancel}
        onOk={editFormRef.submit}
      >
        {editForm}
      </Modal>
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="label.paymentModes"
            defaultMessage="Payment Modes"
          />
        </p>
        <Button type="primary" onClick={setCreateModalOpen}>
          <Space>
            <PlusOutlined />
            <FormattedMessage
              id="paymentMode.new"
              defaultMessage="New Payment Mode"
            />
          </Space>
        </Button>
      </div>
      <div className="page-content">
        <Table
          loading={loading}
          pagination={false}
          columns={columns}
          dataSource={queryData?.map((item) => ({
            ...item,
            key: item.id,
          }))}
          rowKey={(record) => record.id}
          onRow={(record) => ({
            key: record.id,
            onMouseEnter: () => setHoveredRow(record.id),
            onMouseLeave: () => setHoveredRow(null),
          })}
        />
      </div>
    </>
  );
};

export default PaymentModes;
