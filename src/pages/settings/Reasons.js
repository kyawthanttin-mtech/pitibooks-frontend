import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Dropdown, Form, Modal, Input, Space, Table, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { ReasonMutations } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useReadQuery } from "@apollo/client";
const { CREATE_REASON, UPDATE_REASON, DELETE_REASON, TOGGLE_ACTIVE_REASON } =
  ReasonMutations;

const Reasons = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFormRef] = Form.useForm();
  const { notiApi, msgApi, allReasonsQueryRef, refetchAllReasons } =
    useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);

  //Queries
  const { data } = useReadQuery(allReasonsQueryRef);

  const [createReason, { loading: createLoading }] = useMutation(
    CREATE_REASON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="reason.created"
            defaultMessage="New Reason Created"
          />
        );
        refetchAllReasons();
      },
    }
  );

  const [updateReason, { loading: updateLoading }] = useMutation(
    UPDATE_REASON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="reason.updated"
            defaultMessage="Reason Updated"
          />
        );
        refetchAllReasons();
      },
    }
  );

  const [deleteReason, { loading: deleteLoading }] = useMutation(
    DELETE_REASON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="reason.deleted"
            defaultMessage="Reason Deleted"
          />
        );
        refetchAllReasons();
      },
    }
  );

  const [toggleActiveUnit, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_REASON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="reason.updated.status"
            defaultMessage="Reason Status Updated"
          />
        );
        refetchAllReasons();
      },
    }
  );

  const loading =
    createLoading || updateLoading || deleteLoading || toggleActiveLoading;

  const queryData = useMemo(() => data?.listAllReason, [data]);

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      console.log("Field values:", values);
      await createReason({
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
        await deleteReason({
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
      await updateReason({
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
        label={<FormattedMessage id="reason.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="reason.name.required"
                defaultMessage="Enter the Reason Name"
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
        label={<FormattedMessage id="reason.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="reason.name.required"
                defaultMessage="Enter the Reason Name"
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
      title: <FormattedMessage id="reason.name" defaultMessage="Name" />,
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
        title={<FormattedMessage id="reason.new" defaultMessage="New Reason" />}
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
          <FormattedMessage id="reason.edit" defaultMessage="Edit Reason" />
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
          <FormattedMessage id="label.reasons" defaultMessage="Reasons" />
        </p>
        <Button type="primary" onClick={setCreateModalOpen}>
          <Space>
            <PlusOutlined />
            <FormattedMessage id="reason.new" defaultMessage="New Reason" />
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

export default Reasons;
