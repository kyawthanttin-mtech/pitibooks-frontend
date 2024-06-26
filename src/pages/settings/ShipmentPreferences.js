import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Dropdown, Form, Modal, Input, Table, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { ShipmentPreferenceMutations } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useReadQuery } from "@apollo/client";
const {
  CREATE_SHIPMENT_PREFERENCE,
  UPDATE_SHIPMENT_PREFERENCE,
  DELETE_SHIPMENT_PREFERENCE,
  TOGGLE_ACTIVE_SHIPMENT_PREFERENCE,
} = ShipmentPreferenceMutations;

const ShipmentPreferences = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFormRef] = Form.useForm();
  const {
    notiApi,
    msgApi,
    allShipmentPreferencesQueryRef,
    refetchAllShipmentPreferences,
  } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);

  //Queries
  const { data } = useReadQuery(allShipmentPreferencesQueryRef);

  const [createShipmentPreference, { loading: createLoading }] = useMutation(
    CREATE_SHIPMENT_PREFERENCE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="shipmentPreference.created"
            defaultMessage="New Shipment Preference Created"
          />
        );
        refetchAllShipmentPreferences();
      },
    }
  );

  const [updateShipmentPreference, { loading: updateLoading }] = useMutation(
    UPDATE_SHIPMENT_PREFERENCE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="shipmentPreference.updated"
            defaultMessage="Shipment Preference Updated"
          />
        );
        refetchAllShipmentPreferences();
      },
    }
  );

  const [deleteShipmentPreference, { loading: deleteLoading }] = useMutation(
    DELETE_SHIPMENT_PREFERENCE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="shipmentPreference.deleted"
            defaultMessage="Shipment Preference Deleted"
          />
        );
        refetchAllShipmentPreferences();
      },
    }
  );

  const [toggleActiveUnit, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_SHIPMENT_PREFERENCE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="shipmentPreference.updated.status"
            defaultMessage="Shipment Preference Status Updated"
          />
        );
        refetchAllShipmentPreferences();
      },
    }
  );

  const loading =
    createLoading || updateLoading || deleteLoading || toggleActiveLoading;

  const queryData = useMemo(() => data?.listAllShipmentPreference, [data]);

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      console.log("Field values:", values);
      await createShipmentPreference({
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
        await deleteShipmentPreference({
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
      await updateShipmentPreference({
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
      await toggleActiveUnit({
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
          <FormattedMessage
            id="shipmentPreference.name"
            defaultMessage="Name"
          />
        }
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="shipmentPreference.name.required"
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
          <FormattedMessage
            id="shipmentPreference.name"
            defaultMessage="Name"
          />
        }
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="shipmentPreference.name.required"
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

  const columns = [
    {
      title: (
        <FormattedMessage id="shipmentPreference.name" defaultMessage="Name" />
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
            id="shipmentPreference.new"
            defaultMessage="New Shipment Preference"
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
        //   loading={loading}
        width="40rem"
        title={
          <FormattedMessage
            id="shipmentPreference.edit"
            defaultMessage="Edit Shipment Preference"
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
            id="label.Shipment Preferences"
            defaultMessage="Shipment Preferences"
          />
        </p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={setCreateModalOpen}
        >
          <FormattedMessage
            id="shipmentPreference.new"
            defaultMessage="New Shipment Preference"
          />
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

export default ShipmentPreferences;
