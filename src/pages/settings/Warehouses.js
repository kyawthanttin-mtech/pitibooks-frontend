import React, { useState, useMemo } from "react";
import { Button, Table, Dropdown, Tag, Modal, Form, Input, Select } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useQuery, useMutation, useReadQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import {
  WarehouseMutations,
  WarehouseQueries,
} from "../../graphql";

const { GET_WAREHOUSES } = WarehouseQueries;
const {
  CREATE_WAREHOUSE,
  UPDATE_WAREHOUSE,
  DELETE_WAREHOUSE,
  TOGGLE_ACTIVE_WAREHOUSE,
} = WarehouseMutations;

const Warehouses = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const {notiApi, msgApi, allBranchesQueryRef, allStatesQueryRef, allTownshipsQueryRef, refetchAllWarehouses} = useOutletContext();
  const [selectedState, setSelectedState] = useState(null);
  const [selectedEditState, setSelectedEditState] = useState(null);
  
  // Queries and mutations
  const { data, loading: queryLoading } = useQuery(GET_WAREHOUSES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: stateData } = useReadQuery(allStatesQueryRef);
  const { data: townshipData } = useReadQuery(allTownshipsQueryRef);

  const [createWarehouse, { loading: createLoading }] = useMutation(
    CREATE_WAREHOUSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="warehouse.created"
            defaultMessage="New Warehouse Created"
          />
        );
        refetchAllWarehouses();
      },
      refetchQueries: [GET_WAREHOUSES],
    }
  );

  const [updateWarehouse, { loading: updateLoading }] = useMutation(
    UPDATE_WAREHOUSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="warehouse.updated"
            defaultMessage="Warehouse Updated"
          />
        );
        refetchAllWarehouses();
      },
      refetchQueries: [GET_WAREHOUSES],
    }
  );

  const [deleteWarehouse, { loading: deleteLoading }] = useMutation(
    DELETE_WAREHOUSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="warehouse.deleted"
            defaultMessage="Warehouse Deleted"
          />
        );
        refetchAllWarehouses();
      },
      refetchQueries: [GET_WAREHOUSES],
    }
  );

  const [toggleActiveWarehouse, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_WAREHOUSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="warehouse.updated.status"
            defaultMessage="Warehouse Status Updated"
          />
        );
        refetchAllWarehouses();
      },
      refetchQueries: [GET_WAREHOUSES],
    }
  );

  // Derived data
  const parsedData = useMemo(() => {
    return data?.listWarehouse.map((item) => ({
      id: item.id,
      name: item.name,
      // email: item.email,
      address: item.address,
      phoneNumber: item.phone,
      branch: item.branch.name,
      branchId: item.branch.id,
      city: item.city,
      country: item.country,
      state: item.state,
      stateName: item.state.stateNameEn,
      stateId: item.state.id || "",
      township: item.township,
      townshipName: item.township.townshipNameEn,
      townshipId: item.township.id || "",
      isActive: item.isActive,
      mobile: item.mobile,
    }));
  }, [data]);

  const loading =
    queryLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading ||
    toggleActiveLoading;

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      // console.log("Field values:", values);
      await createWarehouse({ variables: { input: values } });
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
        await deleteWarehouse({
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
    // console.log("edit record", editRecord);
    // console.log("record", record);
    editFormRef.resetFields();
    editFormRef.setFieldsValue({
      id: record.id,
      name: record.name,
      address: record.address,
      phone: record.phoneNumber,
      branchId: record.branchId,
      country: record.country,
      stateId: record.stateId || "",
      city: record.city,
      townshipId: record.townshipId || "",
      mobile: record.mobile,
    });

    setSelectedEditState(record.state);
    // console.log(record.state);

    setEditModalOpen(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      const input = {
        ...values,
        stateId: values.stateId ? values.stateId : 0,
        townshipId: values.townshipId ? values.townshipI : 0,
      }
      // console.log("Field values:", values);
      await updateWarehouse({
        variables: { id: editRecord.id, input },
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
      await toggleActiveWarehouse({
        variables: { id: record.id, isActive: !record.isActive },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const columns = [
    {
      title: <FormattedMessage id="warehouse.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
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
    // {
    //   title: <FormattedMessage id="warehouse.email" defaultMessage="Email" />,
    //   dataIndex: "email",
    //   key: "email",
    // },
    {
      title: (
        <FormattedMessage id="warehouse.phNo" defaultMessage="Phone Number" />
      ),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: <FormattedMessage id="warehouse.branch" defaultMessage="Branch" />,
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "",
      dataIndex: "action",
      render: (_, record) =>
        hoveredRow === record.id ? (
          <Dropdown
            loading={loading}
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

  const createForm = (
    <Form form={createFormRef} onFinish={handleCreateModalOk}>
      <Form.Item
        label={
          <FormattedMessage
            id="warehouse.name.label"
            defaultMessage="Warehouse Name"
          />
        }
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
        name="branchId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select loading={loading}>
          {branchData?.listAllBranch.map((branch) => (
            <Select.Option key={branch.id} value={branch.id}>
              {branch.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.country" defaultMessage="Country" />}
        name="country"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        initialValue="Myanmar"
      >
        <Select>
          <Select.Option value="Myanmar">Myanmar</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.state" defaultMessage="State" />}
        name="stateId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedState(
              stateData?.listAllState.find((state) => state.id === value)
            );
            createFormRef.setFieldsValue({
              townshipId: null,
            });
          }}
        >
          {stateData?.listAllState.map((state) => (
            <Select.Option
              key={state.id}
              value={state.id}
              label={state.stateNameEn}
            >
              {state.stateNameEn}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.city" defaultMessage="City" />}
        name="city"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage id="label.township" defaultMessage="Township" />
        }
        name="townshipId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select
          loading={loading}
          allowClear
          showSearch
          optionFilterProp="label"
          disabled={!selectedState}
        >
          {townshipData?.listAllTownship.map((township) => {
            if (township.stateCode === selectedState?.code) {
              return (
                <Select.Option
                  key={township.id}
                  value={township.id}
                  label={township.townshipNameEn}
                >
                  {township.townshipNameEn}
                </Select.Option>
              );
            }
            return null;
          })}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.address" defaultMessage="Address" />}
        name="address"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input.TextArea maxLength={1000} rows={4}></Input.TextArea>
      </Form.Item>
      {/* <Form.Item
        label="Email"
        name="email"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input></Input>
      </Form.Item> */}
      <Form.Item
        label={<FormattedMessage id="label.phone" defaultMessage="Phone" />}
        name="phone"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={20}></Input>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.mobile" defaultMessage="Mobile" />}
        name="mobile"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={20}></Input>
      </Form.Item>
    </Form>
  );

  const editForm = (
    <Form form={editFormRef} onFinish={handleEditModalOk}>
      <Form.Item
        label={
          <FormattedMessage
            id="warehouse.name.label"
            defaultMessage="Warehouse Name"
          />
        }
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.branch" defaultMessage="Branch" />}
        name="branchId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select loading={loading}>
          {branchData?.listAllBranch.map((branch) => (
            <Select.Option key={branch.id} value={branch.id}>
              {branch.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.country" defaultMessage="Country" />}
        name="country"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select>
          <Select.Option value="Myanmar">Myanmar</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.state" defaultMessage="State" />}
        name="stateId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          onChange={(value) => {
            setSelectedEditState(
              stateData?.listAllState.find((state) => state.id === value)
            );
            editFormRef.setFieldsValue({
              townshipId: null,
            });
          }}
        >
          {stateData?.listAllState.map((state) => (
            <Select.Option
              key={state.id}
              value={state.id}
              label={state.stateNameEn}
            >
              {state.stateNameEn}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.city" defaultMessage="City" />}
        name="city"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage id="label.township" defaultMessage="Township" />
        }
        name="townshipId"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Select
          loading={loading}
          allowClear
          showSearch
          optionFilterProp="label"
          disabled={!selectedEditState}
        >
          {townshipData?.listAllTownship.map((township) => {
            if (township.stateCode === selectedEditState?.code) {
              return (
                <Select.Option
                  key={township.id}
                  value={township.id}
                  label={township.townshipNameEn}
                >
                  {township.townshipNameEn}
                </Select.Option>
              );
            }
            return null;
          })}
        </Select>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.address" defaultMessage="Address" />}
        name="address"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input.TextArea rows={4}></Input.TextArea>
      </Form.Item>
      {/* <Form.Item
        label="Email"
        name="email"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input></Input>
      </Form.Item> */}
      <Form.Item
        label={<FormattedMessage id="label.phone" defaultMessage="Phone" />}
        name="phone"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={20}></Input>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.mobile" defaultMessage="Mobile" />}
        name="mobile"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
      >
        <Input maxLength={20}></Input>
      </Form.Item>
    </Form>
  );

  return (
    <>
      {contextHolder}
      <Modal
        width="40rem"
        title={
          <FormattedMessage id="warehouse.new" defaultMessage="New Warehouse" />
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
            id="warehouse.edit"
            defaultMessage="Edit Warehouse"
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
      <div className="page-header page-header-with-button">
        <p className="page-header-text">
          <FormattedMessage id="menu.warehouses" defaultMessage="Warehouses" />
        </p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setCreateModalOpen(true)}
        >
          <FormattedMessage id="warehouse.new" defaultMessage="New Warehouse" />
        </Button>
      </div>
      <div className="page-content">
        <Table
          className="main-table"
          loading={loading}
          columns={columns}
          dataSource={parsedData?.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          onRow={(record) => ({
            key: record.id,
            onMouseEnter: () => setHoveredRow(record.id),
            onMouseLeave: () => setHoveredRow(null),
          })}
        ></Table>
      </div>
    </>
  );
};

export default Warehouses;
