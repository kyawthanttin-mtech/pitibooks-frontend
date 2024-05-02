import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
// import { PaginatedTable } from "../../components";
import { Button, Dropdown, Form, Modal, Input, Select, Table, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { UnitQueries, UnitMutations } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
  openSuccessNotification,
} from "../../utils/Notification";
const { GET_PRODUCT_UNITS } = UnitQueries;
const {
  CREATE_PRODUCT_UNIT,
  UPDATE_PRODUCT_UNIT,
  DELETE_PRODUCT_UNIT,
  TOGGLE_ACTIVE_PRODUCT_UNIT,
} = UnitMutations;

const ProductUnits = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFormRef] = Form.useForm();
  const { notiApi, msgApi } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);

  //Queries
  const { data, loading: queryLoading } = useQuery(GET_PRODUCT_UNITS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const [createUnit, { loading: createLoading }] = useMutation(
    CREATE_PRODUCT_UNIT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productUnit.created"
            defaultMessage="New Product Unit Created"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_UNITS],
    }
  );

  const [updateUnit, { loading: updateLoading }] = useMutation(
    UPDATE_PRODUCT_UNIT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productUnit.updated"
            defaultMessage="Product Unit Updated"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_UNITS],
    }
  );

  const [deleteUnit, { loading: deleteLoading }] = useMutation(
    DELETE_PRODUCT_UNIT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productUnit.deleted"
            defaultMessage="Product Unit Deleted"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_UNITS],
    }
  );

  const [toggleActiveUnit, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_PRODUCT_UNIT,
    {
      onCompleted() {
        openSuccessNotification(
          msgApi,
          <FormattedMessage
            id="productUnit.updated.status"
            defaultMessage="Product Unit Status Updated"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_UNITS],
    }
  );

  const loading =
    queryLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading ||
    toggleActiveLoading;

  const queryData = useMemo(() => data?.listProductUnit, [data]);

  // const parseData = (data) => {
  //   let units = [];
  //   data?.paginateProductUnit?.edges.forEach(({ node }) => {
  //     if (node != null) {
  //       units.push({
  //         key: node.id,
  //         ...node,
  //       });
  //     }
  //   });

  //   return units ? units : [];
  // };

  // const parsePageInfo = (data) => {
  //   let pageInfo = {
  //     hasPreviousPage: false,
  //     hasNextPage: false,
  //     endCursor: null,
  //   };
  //   if (data?.paginateProductUnit) {
  //     pageInfo = {
  //       hasNextPage: data.paginateProductUnit.pageInfo.hasNextPage,
  //       endCursor: data.paginateProductUnit.pageInfo.endCursor,
  //     };
  //   }
  //   console.log("pageInfo", pageInfo);
  //   return pageInfo;
  // };

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      console.log("Field values:", values);
      console.log("Type of precision:", typeof values.precision.toString()); // Log the type
      await createUnit({
        variables: {
          input: {
            name: values.name,
            abbreviation: values.abbreviation,
            precision: values.precision.toString(),
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
        await deleteUnit({
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
      abbreviation: record.abbreviation,
      precision: record.precision,
    });
    // console.log(record.state);

    setEditModalOpen(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      // console.log("Field values:", values);
      await updateUnit({
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
        label={<FormattedMessage id="productUnit.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productUnit.name.required"
                defaultMessage="Enter the Unit Name"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item
        name="abbreviation"
        label={
          <FormattedMessage
            id="productUnit.abbreviation"
            defaultMessage="Abbreviation"
          />
        }
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productUnit.abbreviation.required"
                defaultMessage="Enter the Unit Abbreviation"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={7} />
      </Form.Item>
      <Form.Item
        shouldUpdate
        name="precision"
        label={
          <FormattedMessage
            id="productUnit.precision"
            defaultMessage="Precision"
          />
        }
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productUnit.precision.required"
                defaultMessage="Select the Unit Precision"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Select
          options={[
            { value: "1", label: 1 },
            { value: "0.0", label: "0.0" },
            { value: "0.00", label: "0.00" },
            { value: "0.000", label: "0.000" },
            { value: "0.0000", label: "0.0000" },
            { value: "0.00000", label: "0.00000" },
          ]}
        />
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
        label={<FormattedMessage id="productUnit.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productUnit.name.required"
                defaultMessage="Enter the Unit Name"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item
        name="abbreviation"
        label={
          <FormattedMessage
            id="productUnit.abbreviation"
            defaultMessage="Abbreviation"
          />
        }
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productUnit.abbreviation.required"
                defaultMessage="Enter the Unit Abbreviation"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={7} />
      </Form.Item>
      <Form.Item
        shouldUpdate
        name="precision"
        label={
          <FormattedMessage
            id="productUnit.precision"
            defaultMessage="Precision"
          />
        }
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productUnit.precision.required"
                defaultMessage="Select the Unit Precision"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Select
          options={[
            { value: "1", label: 1 },
            { value: "0.0", label: "0.0" },
            { value: "0.00", label: "0.00" },
            { value: "0.000", label: "0.000" },
            { value: "0.0000", label: "0.0000" },
            { value: "0.00000", label: "0.00000" },
          ]}
        />
      </Form.Item>
    </Form>
  );

  const columns = [
    {
      title: <FormattedMessage id="productUnit.name" defaultMessage="Name" />,
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
      title: (
        <FormattedMessage
          id="productUnit.abbreviation"
          defaultMessage="Abbreviation"
        />
      ),
      key: "abbreviation",
      dataIndex: "abbreviation",
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
          <FormattedMessage id="productUnit.new" defaultMessage="New Unit" />
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
          <FormattedMessage id="productUnit.edit" defaultMessage="Edit Unit" />
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
            id="menu.productUnits"
            defaultMessage="Product Units"
          />
        </p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={setCreateModalOpen}
        >
          <FormattedMessage id="productUnit.new" defaultMessage="New Unit" />
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
        {/* <PaginatedTable
          loading={loading}
          setHoveredRow={setHoveredRow}
          api={notiApi}
          columns={columns}
          gqlQuery={GET_PAGINATED_PRODUCT_UNIT}
          showSearch={false}
          // searchForm={searchForm}
          // searchFormRef={searchFormRef}
          searchQqlQuery={GET_PAGINATED_PRODUCT_UNIT}
          // parseSearchData={parseSearchData}
          parseData={parseData}
          parsePageInfo={parsePageInfo}
        /> */}
      </div>
    </>
  );
};

export default ProductUnits;
