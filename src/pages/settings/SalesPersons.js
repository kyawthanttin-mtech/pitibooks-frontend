import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Dropdown, Form, Modal, Input, Space, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { SalesPersonQueries, SalesPersonMutations } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { gql } from "@apollo/client";
import { PaginatedTable } from "../../components";
const { GET_PAGINATE_SALES_PERSON } = SalesPersonQueries;
const {
  CREATE_SALES_PERSON,
  UPDATE_SALES_PERSON,
  DELETE_SALES_PERSON,
  TOGGLE_ACTIVE_SALES_PERSON,
} = SalesPersonMutations;

const SalesPersons = () => {
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

  const [createSalesPerson, { loading: createLoading }] = useMutation(
    CREATE_SALES_PERSON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesPerson.created"
            defaultMessage="New Sale Person Created"
          />
        );
      },
    }
  );

  const [updateSalesPerson, { loading: updateLoading }] = useMutation(
    UPDATE_SALES_PERSON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesPerson.updated"
            defaultMessage="Sale Person Updated"
          />
        );
      },
      update(cache, { data }) {
        const existingSalesPersons = cache.readQuery({
          query: GET_PAGINATE_SALES_PERSON,
        });
        const updatedSuppliers =
          existingSalesPersons.paginateSalesPerson.edges.filter(
            ({ node }) => node.id !== data.toggleActiveSalesPerson.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_SALES_PERSON,
          data: {
            paginateSalesPerson: {
              ...existingSalesPersons.paginateSalesPerson,
              edges: updatedSuppliers,
            },
          },
        });
      },
    }
  );

  const [deleteSalesPerson, { loading: deleteLoading }] = useMutation(
    DELETE_SALES_PERSON,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesPerson.deleted"
            defaultMessage="Sale Person Deleted"
          />
        );
      },
      update(cache, { data }) {
        const existingSalesPersons = cache.readQuery({
          query: GET_PAGINATE_SALES_PERSON,
        });
        const updatedSuppliers =
          existingSalesPersons.paginateSalesPerson.edges.filter(
            ({ node }) => node.id !== data.toggleActiveSalesPerson.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_SALES_PERSON,
          data: {
            paginateSalesPerson: {
              ...existingSalesPersons.paginateSalesPerson,
              edges: updatedSuppliers,
            },
          },
        });
      },
    }
  );

  const [toggleActiveSalesPerson, { loading: toggleActiveLoading }] =
    useMutation(TOGGLE_ACTIVE_SALES_PERSON, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="salesPerson.updated.status"
            defaultMessage="Sales Person Status Updated"
          />
        );
      },
    });

  const loading =
    createLoading || updateLoading || deleteLoading || toggleActiveLoading;

  const parseData = (data) => {
    let salesPerson = [];
    data?.paginateSalesPerson?.edges.forEach(({ node }) => {
      if (node != null) {
        salesPerson.push({
          key: node.id,
          ...node,
        });
      }
    });
    // console.log("Products", products);
    return salesPerson ? salesPerson : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateSalesPerson) {
      pageInfo = {
        hasNextPage: data.paginateSalesPerson.pageInfo.hasNextPage,
        endCursor: data.paginateSalesPerson.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      console.log("Field values:", values);
      await createSalesPerson({
        variables: {
          input: {
            name: values.name,
            email: values.email,
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
        await deleteSalesPerson({
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
      email: record.email,
    });
    // console.log(record.state);

    setEditModalOpen(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      await updateSalesPerson({
        variables: { id: editRecord.id, input: values },
        update(cache, { data: { updateSalesPerson } }) {
          cache.modify({
            fields: {
              paginateSalesPerson(pagination = []) {
                const index = pagination.edges.findIndex(
                  (x) => x.node.__ref === "SalesPerson:" + updateSalesPerson.id
                );
                if (index >= 0) {
                  const newSalesPerson = cache.writeFragment({
                    data: updateSalesPerson,
                    fragment: gql`
                      fragment NewSalesPerson on SalesPerson {
                        id
                        name
                        email
                      }
                    `,
                  });
                  let paginationCopy = JSON.parse(JSON.stringify(pagination));
                  paginationCopy.edges[index].node = newSalesPerson;
                  return paginationCopy;
                } else {
                  return pagination;
                }
              },
            },
          });
        },
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
      await toggleActiveSalesPerson({
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
        label={<FormattedMessage id="salesPerson.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="salesPerson.name.required"
                defaultMessage="Enter the Sale Person Name"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage id="salesPerson.email" defaultMessage="Email" />
        }
        name="email"
        // rules={[
        //   {
        //     required: true,
        //     message: (
        //       <FormattedMessage
        //         id="salesPerson.email.required"
        //         defaultMessage="Enter the Sale Person Name"
        //       />
        //     ),
        //   },
        // ]}
        labelAlign="left"
      >
        <Input maxLength={40} type="email" />
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
        label={<FormattedMessage id="salesPerson.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="salesPerson.name.required"
                defaultMessage="Enter the Sale Person Name"
              />
            ),
          },
        ]}
        labelAlign="left"
      >
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage id="salesPerson.email" defaultMessage="Email" />
        }
        name="email"
        // rules={[
        //   {
        //     required: true,
        //     message: (
        //       <FormattedMessage
        //         id="salesPerson.email.required"
        //         defaultMessage="Enter the Sale Person Name"
        //       />
        //     ),
        //   },
        // ]}
        labelAlign="left"
      >
        <Input maxLength={40} type="email" />
      </Form.Item>
    </Form>
  );

  const columns = [
    {
      title: <FormattedMessage id="salesPerson.name" defaultMessage="Name" />,
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
      title: <FormattedMessage id="salesPerson.email" defaultMessage="Email" />,
      key: "email",
      dataIndex: "email",
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
        width="40rem"
        title={
          <FormattedMessage
            id="salesPerson.new"
            defaultMessage="New Sale Person"
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
            id="salesPerson.edit"
            defaultMessage="Edit Sale Person"
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
            id="label.salesPersons"
            defaultMessage="Sale Persons"
          />
        </p>
        <Button type="primary" onClick={setCreateModalOpen}>
          <Space>
            <PlusOutlined />
            <FormattedMessage
              id="salesPerson.new"
              defaultMessage="New Sales Person"
            />
          </Space>
        </Button>
      </div>
      <div className="page-content">
        <PaginatedTable
          loading={loading}
          api={notiApi}
          columns={columns}
          gqlQuery={GET_PAGINATE_SALES_PERSON}
          // searchForm={searchForm}
          searchFormRef={searchFormRef}
          searchQqlQuery={GET_PAGINATE_SALES_PERSON}
          parseData={parseData}
          parsePageInfo={parsePageInfo}
          searchModalOpen={searchModalOpen}
          // searchCriteria={searchCriteria}
          // setSearchCriteria={setSearchCriteria}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
        />
      </div>
    </>
  );
};

export default SalesPersons;
