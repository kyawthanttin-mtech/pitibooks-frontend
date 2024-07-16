import React, { useState, useMemo } from "react";
import "./TransactionNumberSeries.css";

import { Button, Modal, Form, Input, Table, Dropdown } from "antd";
import {
  PlusOutlined,
  DownCircleFilled,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { TransactionNumberSeriesQueries } from "../../graphql";
import { TransactionNumberSeriesMutations } from "../../graphql";
const { GET_TRANSACTION_NUMBER_SERIES_ALL } = TransactionNumberSeriesQueries;
const {
  CREATE_TRANSACTION_NUMBER_SERIES,
  UPDATE_TRANSACTION_NUMBER_SERIES,
  DELETE_TRANSACTION_NUMBER_SERIES,
} = TransactionNumberSeriesMutations;

const modalTableColumns = [
  {
    title: (
      <FormattedMessage
        id="transactionNumberSeries.module"
        defaultMessage="Module"
      />
    ),
    dataIndex: "moduleName",
    key: "moduleName",
  },
  {
    title: (
      <FormattedMessage
        id="transactionNumberSeries.prefix"
        defaultMessage="Prefix"
      />
    ),
    dataIndex: "prefix",
    key: "prefix",
    render: (text, record) => {
      return (
        <Form.Item name={record.moduleName} style={{ margin: 0 }}>
          <Input maxLength={10} />
        </Form.Item>
      );
    },
  },
];

const modalTableDataSource = [
  {
    id: 0,
    key: "Credit Note",
    moduleName: "Credit Note",
  },
  {
    id: 1,
    key: "Customer Payment",
    moduleName: "Customer Payment",
  },
  {
    id: 2,
    key: "Vendor Payment",
    moduleName: "Vendor Payment",
  },
  {
    id: 3,
    key: "Purchase Order",
    moduleName: "Purchase Order",
  },
  {
    id: 4,
    key: "Sales Order",
    moduleName: "Sales Order",
  },
  {
    id: 5,
    key: "Retainer Invoice",
    moduleName: "Retainer Invoice",
  },
  {
    id: 6,
    key: "Invoice",
    moduleName: "Invoice",
  },
  {
    id: 7,
    key: "Sales Receipt",
    moduleName: "Sales Receipt",
  },
];

const TransactionNumberSeries = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const { notiApi, msgApi } = useOutletContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormRef] = Form.useForm();
  const [editRecord, setEditRecord] = useState(null);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editFormRef] = Form.useForm();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Queries
  const { data, loading: queryLoading } = useQuery(
    GET_TRANSACTION_NUMBER_SERIES_ALL,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const queryData = useMemo(() => data?.listTransactionNumberSeries, [data]);

  // Mutations
  const [createTransactionNumberSeries, { loading: createLoading }] =
    useMutation(CREATE_TRANSACTION_NUMBER_SERIES, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transactionNumberSeries.created"
            defaultMessage="New Transaction Number Series Created"
          />
        );
      },
      refetchQueries: [GET_TRANSACTION_NUMBER_SERIES_ALL],
    });

  const [updateTransactionNumberSeries, { loading: updateLoading }] =
    useMutation(UPDATE_TRANSACTION_NUMBER_SERIES, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transactionNumberSeries.updated"
            defaultMessage="Transaction Number Series Updated"
          />
        );
      },
      refetchQueries: [GET_TRANSACTION_NUMBER_SERIES_ALL],
    });

  const [deleteTransactionNumberSeries, { loading: deleteLoading }] =
    useMutation(DELETE_TRANSACTION_NUMBER_SERIES, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transactionNumberSeries.deleted"
            defaultMessage="Transaction Number Series Deleted"
          />
        );
      },
      refetchQueries: [GET_TRANSACTION_NUMBER_SERIES_ALL],
    });

  const loading =
    queryLoading || createLoading || updateLoading || deleteLoading;

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      // console.log("Field values:", values);

      const modules = modalTableDataSource.map((item) => ({
        moduleName: item.moduleName,
        prefix: values[item.moduleName],
      }));

      const input = {
        name: values.name,
        modules: modules,
      };

      await createTransactionNumberSeries({ variables: { input: input } });
      setCreateModalOpen(false);
      createFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleCreateModalCancel = () => {
    setCreateModalOpen(false);
    createFormRef.resetFields();
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    // console.log("Edit Record:", record);

    const modulePrefixes = {};
    record.modules.forEach((module) => {
      modulePrefixes[module.moduleName] = module.prefix;
    });

    editFormRef.setFieldsValue({
      name: record.name,
      ...modulePrefixes,
    });

    setEditModalOpen(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      // console.log("Field values:", values);

      const modules = modalTableDataSource.map((item) => ({
        moduleName: item.moduleName,
        prefix: values[item.moduleName],
      }));

      const input = {
        name: values.name,
        modules: modules,
      };

      await updateTransactionNumberSeries({
        variables: { id: editRecord.id, input: input },
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
        await deleteTransactionNumberSeries({
          variables: { id: record.id },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const mainTableColumns = [
    {
      title: (
        <FormattedMessage
          id="transactionNumberSeries.name"
          defaultMessage="Series Name"
        />
      ),
      dataIndex: "name",
      key: "name",
    },
    {
      title: "",
      dataIndex: "action",
      width: "12%",
      render: (_, record) =>
        hoveredRow === record.id ? (
          <Dropdown
            trigger="click"
            key={record.key}
            menu={{
              onClick: ({ key }) => {
                if (key === "1") handleEdit(record);
                else if (key === "2") handleDelete(record);
              },
              items: [
                {
                  icon: <EditOutlined />,
                  label: (
                    <FormattedMessage id="button.edit" defaultMessage="Edit" />
                  ),
                  key: "1",
                },
                {
                  icon: <DeleteOutlined />,
                  label: (
                    <FormattedMessage
                      id="button.delete"
                      defaultMessage="Delete"
                    />
                  ),
                  key: "2",
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
        label={<FormattedMessage id="label.name" defaultMessage="Name" />}
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="transactionNumberSeries.name.required"
                defaultMessage="Enter the Series Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Table
        columns={modalTableColumns}
        dataSource={modalTableDataSource}
        pagination={false}
        bordered
        rowClassName="custom-row"
        className="modal-table"
      ></Table>
    </Form>
  );

  const editForm = (
    <Form form={editFormRef} onFinish={handleEditModalOk}>
      <Form.Item
        label={<FormattedMessage id="label.name" defaultMessage="Name" />}
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="transactionNumberSeries.name.required"
                defaultMessage="Enter the Series Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Table
        columns={modalTableColumns}
        dataSource={modalTableDataSource}
        pagination={false}
        bordered
        rowClassName="custom-row"
        className="modal-table"
      ></Table>
    </Form>
  );

  return (
    <>
      {contextHolder}
      <Modal
        loading={loading}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        width="40rem"
        title="New Series"
        open={createModalOpen}
        onCancel={handleCreateModalCancel}
        onOk={createFormRef.submit}
      >
        {createForm}
      </Modal>
      <Modal
        loading={loading}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        width="40rem"
        title="Edit Series"
        open={editModalOpen}
        onCancel={handleEditModalCancel}
        onOk={editFormRef.submit}
      >
        {editForm}
      </Modal>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">
          <FormattedMessage
            id="menu.transactionNumberSeries"
            defaultMessage="Transaction Number Series"
          />
        </p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setCreateModalOpen(true)}
        >
          <FormattedMessage
            id="transactionNumberSeries.new"
            defaultMessage="New Series"
          />
        </Button>
      </div>
      <div className="page-content ">
        <Table
          loading={loading}
          pagination={false}
          columns={mainTableColumns}
          dataSource={queryData?.map((item) => ({
            ...item,
            key: item.id,
          }))}
          className="main-table"
          onRow={(record) => ({
            onMouseEnter: () => setHoveredRow(record.id),
            onMouseLeave: () => setHoveredRow(null),
          })}
        ></Table>
      </div>
    </>
  );
};

export default TransactionNumberSeries;
