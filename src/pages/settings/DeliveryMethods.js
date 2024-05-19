import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Dropdown, Form, Modal, Input, Space, Table, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { DeliveryMethodMutations, DeliveryMethodQueries } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useQuery } from "@apollo/client";
const {
  CREATE_DELIVERY_METHOD,
  UPDATE_DELIVERY_METHOD,
  DELETE_DELIVERY_METHOD,
  TOGGLE_ACTIVE_DELIVERY_METHOD,
} = DeliveryMethodMutations;
const { GET_DELIVERY_METHODS } = DeliveryMethodQueries;

const DeliveryMethods = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFormRef] = Form.useForm();
  const { notiApi, msgApi, refetchAllPaymentModes } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);

  //Queries
  const { data, loading: queryLoading } = useQuery(GET_DELIVERY_METHODS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const [createDeliveryMethod, { loading: createLoading }] = useMutation(
    CREATE_DELIVERY_METHOD,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="deliveryMethod.created"
            defaultMessage="New Delivery Method Created"
          />
        );
        refetchAllPaymentModes();
      },
      refetchQueries: [GET_DELIVERY_METHODS],
    }
  );

  const [updateDeliveryMethod, { loading: updateLoading }] = useMutation(
    UPDATE_DELIVERY_METHOD,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="deliveryMethod.updated"
            defaultMessage="Delivery Method Updated"
          />
        );
        refetchAllPaymentModes();
      },
      refetchQueries: [GET_DELIVERY_METHODS],
    }
  );

  const [deleteDeliveryMethod, { loading: deleteLoading }] = useMutation(
    DELETE_DELIVERY_METHOD,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="deliveryMethod.deleted"
            defaultMessage="Delivery Method Deleted"
          />
        );
        refetchAllPaymentModes();
      },
      refetchQueries: [GET_DELIVERY_METHODS],
    }
  );

  const [toggleActiveDeliveryMethod, { loading: toggleActiveLoading }] =
    useMutation(TOGGLE_ACTIVE_DELIVERY_METHOD, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="deliveryMethod.updated.status"
            defaultMessage="Delivery Method Status Updated"
          />
        );
        refetchAllPaymentModes();
      },
    });

  const loading =
    createLoading ||
    updateLoading ||
    deleteLoading ||
    toggleActiveLoading ||
    queryLoading;

  const queryData = useMemo(() => data?.listDeliveryMethod, [data]);

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      console.log("Field values:", values);
      await createDeliveryMethod({
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
        await deleteDeliveryMethod({
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
      await updateDeliveryMethod({
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
      await toggleActiveDeliveryMethod({
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
        label={
          <FormattedMessage id="deliveryMethod.name" defaultMessage="Name" />
        }
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="deliveryMethod.name.required"
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
        label={
          <FormattedMessage id="deliveryMethod.name" defaultMessage="Name" />
        }
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="deliveryMethod.name.required"
                defaultMessage="Enter the Delivery Method Name"
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
      title: (
        <FormattedMessage id="deliveryMethod.name" defaultMessage="Name" />
      ),
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
            id="deliveryMethod.new"
            defaultMessage="New Delivery Method"
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
            id="deliveryMethod.edit"
            defaultMessage="Edit Delivery Method"
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
            id="label.deliveryMethods"
            defaultMessage="Delivery Methods"
          />
        </p>
        <Button type="primary" onClick={setCreateModalOpen}>
          <Space>
            <PlusOutlined />
            <FormattedMessage
              id="deliveryMethod.new"
              defaultMessage="New Delivery Method"
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

export default DeliveryMethods;
