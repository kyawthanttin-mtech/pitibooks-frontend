import React, { useState, useMemo } from "react";

import {
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Dropdown,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  DownCircleFilled,
  // EditOutlined,
  // DeleteOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { CurrencyQueries } from "../../graphql";
import { CurrencyMutations } from "../../graphql";

const { GET_CURRENCIES } = CurrencyQueries;
const {
  CREATE_CURRENCY,
  UPDATE_CURRENCY,
  DELETE_CURRENCY,
  TOGGLE_ACTIVE_CURRENCY,
} = CurrencyMutations;

const Currencies = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const {notiApi, msgApi, refetchAllCurrencies} = useOutletContext();
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [editRecord, setEditRecord] = useState(null);

  // Queries
  const { data, loading: queryLoading } = useQuery(GET_CURRENCIES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const queryData = useMemo(() => data?.listCurrency, [data]);

  //Mutations
  const [createCurrency, { loading: createLoading }] = useMutation(
    CREATE_CURRENCY,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="currency.created"
            defaultMessage="New Currency Created"
          />
        );
        refetchAllCurrencies();
      },
      refetchQueries: [GET_CURRENCIES],
    }
  );

  const [updateCurrency, { loading: updateLoading }] = useMutation(
    UPDATE_CURRENCY,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="currency.updated"
            defaultMessage="Currency Updated"
          />
        );
        refetchAllCurrencies();
      },
      refetchQueries: [GET_CURRENCIES],
    }
  );

  const [deleteCurrency, { loading: deleteLoading }] = useMutation(
    DELETE_CURRENCY,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="currency.deleted"
            defaultMessage="Currency Deleted"
          />
        );
        refetchAllCurrencies();
      },
      refetchQueries: [GET_CURRENCIES],
    }
  );

  const [toggleActiveCurrency, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_CURRENCY,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="currency.updated.status"
            defaultMessage="Currency Status Updated"
          />
        );
        refetchAllCurrencies();
      },
      refetchQueries: [GET_CURRENCIES],
    }
  );

  const loading =
    queryLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading ||
    toggleActiveLoading;

  const handleCreateModalOk = async () => {
    try {
      const values = await createFormRef.validateFields();
      await createCurrency({ variables: { input: values } });
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

  const handleEdit = (record) => {
    setEditRecord(record);
    // console.log("edit record", editRecord);
    // console.log("record", record);
    editFormRef.resetFields();
    editFormRef.setFieldsValue({
      name: record.name,
      symbol: record.symbol,
      decimalPlaces: record.decimalPlaces,
      exchangeRate: record.exchangeRate,
    });

    setEditModalOpen(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editFormRef.validateFields();
      // console.log("Field values:", values);
      // console.log(editRecord.id)
      await updateCurrency({
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
        await deleteCurrency({
          variables: {
            id: record.id,
          },
        });
        // setSelectedRecord(null);
        // setSelectedRowIndex(0);
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleToggleActive = async (record) => {
    try {
      await toggleActiveCurrency({
        variables: { id: record.id, isActive: !record.isActive },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const columns = [
    {
      title: <FormattedMessage id="label.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
      // render: (text, record) => (
      //   <span
      //     style={{ color: "var(--primary-color)", cursor: "pointer" }}
      //     onClick={() => handleEdit(record)}
      //   >
      //     {text}
      //   </span>
      // ),
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
      title: <FormattedMessage id="label.symbol" defaultMessage="Symbol" />,
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: (
        <FormattedMessage
          id="label.exchangeRate"
          defaultMessage="Exchange Rate"
        />
      ),
      dataIndex: "exchangeRate",
      key: "exchangeRate",
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
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
                  // icon: <EditOutlined />,
                },
                {
                  label: record.isActive ? (
                    <FormattedMessage
                      id="button.markInactive"
                      defaultMessage="Mark As Inactive"
                    />
                  ) : (
                    <FormattedMessage
                      id="button.markActive"
                      defaultMessage="Mark As Active"
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
                  // icon: <DeleteOutlined />,
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
          <FormattedMessage id="label.name" defaultMessage="Name" />
        }
        labelAlign="left"
        name="name"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.name.required"
                defaultMessage="Enter the Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.symbol"
            defaultMessage="Symbol"
          />
        }
        labelAlign="left"
        name="symbol"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.symbol.required"
                defaultMessage="Enter the Symbol"
              />
            ),
          },
        ]}
      >
        <Input maxLength={3}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.decimalPlaces"
            defaultMessage="Decimal Places"
          />
        }
        labelAlign="left"
        name="decimalPlaces"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.decimalPlaces.required"
                defaultMessage="Select the Decimal Places"
              />
            ),
          },
        ]}
      >
        <Select>
          <Select.Option key="1" value="0">
            0
          </Select.Option>
          <Select.Option key="2" value="2">
            2
          </Select.Option>
          <Select.Option key="3" value="3">
            3
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.exchangeRate"
            defaultMessage="Exchange Rate"
          />
        }
        labelAlign="left"
        name="exchangeRate"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.exchangeRate.required"
                defaultMessage="Enter the Exchange Rate"
              />
            ),
          },
        ]}
      >
        <InputNumber min={0.001} />
      </Form.Item>
    </Form>
  );

  const editForm = (
    <Form form={editFormRef} onFinish={handleEditModalOk}>
      <Form.Item
        label={
          <FormattedMessage id="label.name" defaultMessage="Name" />
        }
        labelAlign="left"
        name="name"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.name.required"
                defaultMessage="Enter the Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.symbol"
            defaultMessage="Symbol"
          />
        }
        labelAlign="left"
        name="symbol"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.symbol.required"
                defaultMessage="Enter the Symbol"
              />
            ),
          },
        ]}
      >
        <Input maxLength={3}></Input>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.decimalPlaces"
            defaultMessage="Decimal Places"
          />
        }
        labelAlign="left"
        name="decimalPlaces"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.decimalPlaces.required"
                defaultMessage="Select the Decimal Places"
              />
            ),
          },
        ]}
      >
        <Select>
          <Select.Option key="1" value="0">
            0
          </Select.Option>
          <Select.Option key="2" value="2">
            2
          </Select.Option>
          <Select.Option key="3" value="3">
            3
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <FormattedMessage
            id="label.exchangeRate"
            defaultMessage="Exchange Rate"
          />
        }
        labelAlign="left"
        name="exchangeRate"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.exchangeRate.required"
                defaultMessage="Enter the Exchange Rate"
              />
            ),
          },
        ]}
      >
        <InputNumber min={0.001} />
      </Form.Item>
    </Form>
  );

  return (
    <>
      {contextHolder}
      <Modal
        width="40rem"
        title={
          <FormattedMessage id="currency.new" defaultMessage="New Currency" />
        }
        open={createModalOpen}
        onCancel={handleCreateModalCancel}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        onOk={createFormRef.submit}
        loading={loading}
      >
        {createForm}
      </Modal>
      <Modal
        width="40rem"
        title={
          <FormattedMessage id="currency.edit" defaultMessage="Edit Currency" />
        }
        open={editModalOpen}
        onCancel={handleEditModalCancel}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        onOk={editFormRef.submit}
        loading={loading}
      >
        {editForm}
      </Modal>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">
          <FormattedMessage id="menu.currencies" defaultMessage="Currencies" />
        </p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setCreateModalOpen(true)}
        >
          New Currency
        </Button>
      </div>
      <div className="page-content">
        <Table
          className="main-table"
          loading={loading}
          dataSource={queryData?.map((item) => ({
            ...item,
            key: item.id,
          }))}
          pagination={false}
          columns={columns}
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

export default Currencies;
