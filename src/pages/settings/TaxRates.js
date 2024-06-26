import React, { useState, useMemo } from "react";

import {
  Button,
  Table,
  Tag,
  Dropdown,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  DownCircleFilled,
  PercentageOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { TaxQueries } from "../../graphql";
import { TaxMutations } from "../../graphql";
const { GET_TAXES, GET_TAX_GROUPS } = TaxQueries;
const {
  CREATE_TAX,
  UPDATE_TAX,
  DELETE_TAX,
  TOGGLE_ACTIVE_TAX,
  CREATE_TAX_GROUP,
  UPDATE_TAX_GROUP,
  DELETE_TAX_GROUP,
  TOGGLE_ACTIVE_TAX_GROUP,
} = TaxMutations;

const TaxRates = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const { notiApi, msgApi, refetchAllTaxes, refetchAllTaxGroups } =
    useOutletContext();
  const [createTaxModalOpen, setCreateTaxModalOpen] = useState(false);
  const [editTaxModalOpen, setEditTaxModalOpen] = useState(false);
  const [createTaxGroupModalOpen, setCreateTaxGroupModalOpen] = useState(false);
  const [createTaxFormRef] = Form.useForm();
  const [isCompoundTax, setIsCompoundTax] = useState(false);
  const [taxEditRecord, setTaxEditRecord] = useState(null);
  const [editTaxFormRef] = Form.useForm();
  const [deleteModal, contextHolder] = Modal.useModal();
  const [createTaxGroupFormRef] = Form.useForm();
  const [editTaxGroupFormRef] = Form.useForm();
  const [taxGroupEditRecord, setTaxGroupEditRecord] = useState();
  const [editTaxGroupModalOpen, setEditTaxGroupModalOpen] = useState();
  const [selectedRows, setSelectedRows] = useState([]);

  // Queries
  const { data: taxData, loading: taxLoading } = useQuery(GET_TAXES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(err.message);
    },
  });

  const { data: taxGroupData, loading: taxGroupLoading } = useQuery(
    GET_TAX_GROUPS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(err.message);
      },
    }
  );

  const parsedTaxes = useMemo(() => {
    return taxData?.listTax.map((tax) => ({
      id: tax.id,
      name: tax.name,
      isCompoundTax: tax.isCompoundTax,
      type: tax.isCompoundTax ? "Compound Tax" : "",
      rate: tax.rate,
      isActive: tax.isActive,
    }));
  }, [taxData]);

  const parsedData = useMemo(() => {
    if (taxLoading || taxGroupLoading) return [];

    const taxes = taxData?.listTax;
    const taxGroups = taxGroupData?.listTaxGroup;

    const parsedTaxes = taxes?.map((tax) => ({
      id: tax.id,
      compoundId: `tax_${tax.id}`, // Compound key for taxes
      name: tax.name,
      isCompoundTax: tax.isCompoundTax,
      type: tax.isCompoundTax ? "Compound Tax" : "",
      rate: tax.rate,
      isActive: tax.isActive,
    }));

    const parsedTaxGroups = taxGroups?.map((group) => ({
      id: group.id,
      compoundId: `group_${group.id}`, // Compound key for tax groups
      name: group.name,
      type: "Tax Group",
      rate: group.rate,
      isActive: group.isActive,
      taxes: group.taxes.map((tax) => ({
        id: tax.id,
        compoundId: `tax_${tax.id}`, // Compound key for taxes within groups
        name: tax.name,
        type: tax.isCompoundTax ? "Compound Tax" : "",
        rate: tax.rate,
        isActive: tax.isActive,
        createdAt: tax.createdAt,
        updatedAt: tax.updatedAt,
      })),
    }));

    return parsedTaxes || parsedTaxGroups
      ? [...parsedTaxes, ...parsedTaxGroups]
      : [];
  }, [taxData, taxGroupData, taxLoading, taxGroupLoading]);

  // Mutations
  const [createTax, { loading: createTaxLoading }] = useMutation(CREATE_TAX, {
    onCompleted() {
      // console.log("created");
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="tax.created" defaultMessage="New Tax Created" />
      );
      refetchAllTaxes();
      refetchAllTaxGroups();
    },
    refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
  });

  const [updateTax, { loading: updateTaxLoading }] = useMutation(UPDATE_TAX, {
    onCompleted() {
      // console.log("updated");
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="tax.updated" defaultMessage="Tax Updated" />
      );
      refetchAllTaxes();
      refetchAllTaxGroups();
    },
    refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
  });

  const [deleteTax, { loading: deleteTaxLoading }] = useMutation(DELETE_TAX, {
    onCompleted() {
      // console.log("deleted");
      openSuccessMessage(
        msgApi,
        <FormattedMessage id="tax.deleted" defaultMessage="Tax Deleted" />
      );
      refetchAllTaxes();
      refetchAllTaxGroups();
    },
    refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
  });

  const [toggleActiveTax, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_TAX,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="tax.updated.status"
            defaultMessage="Tax Status Updated"
          />
        );
        refetchAllTaxes();
        refetchAllTaxGroups();
      },
      refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
    }
  );

  const [createTaxGroup, { loading: createTaxGroupLoading }] = useMutation(
    CREATE_TAX_GROUP,
    {
      onCompleted() {
        // console.log("created");
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="taxGroup.created"
            defaultMessage="New Tax Group Created"
          />
        );
        refetchAllTaxes();
        refetchAllTaxGroups();
      },
      refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
    }
  );

  const [updateTaxGroup, { loading: updateTaxGroupLoading }] = useMutation(
    UPDATE_TAX_GROUP,
    {
      onCompleted() {
        // console.log("updated");
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="taxGroup.updated"
            defaultMessage="Tax Group Updated"
          />
        );
        refetchAllTaxes();
        refetchAllTaxGroups();
      },
      refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
    }
  );

  const [deleteTaxGroup, { loading: deleteTaxGroupLoading }] = useMutation(
    DELETE_TAX_GROUP,
    {
      onCompleted() {
        // console.log("updated");
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="taxGroup.status.updated"
            defaultMessage="Tax Group Status Updated"
          />
        );
        refetchAllTaxes();
        refetchAllTaxGroups();
      },
      refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
    }
  );

  const [toggleActiveTaxGroup, { loading: toggleActiveGroupLoading }] =
    useMutation(TOGGLE_ACTIVE_TAX_GROUP, {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="taxGroup.updated.status"
            defaultMessage="Tax Group Status Updated"
          />
        );
        refetchAllTaxes();
        refetchAllTaxGroups();
      },
      refetchQueries: [GET_TAXES, GET_TAX_GROUPS],
    });

  const loading =
    taxLoading ||
    taxGroupLoading ||
    createTaxLoading ||
    updateTaxLoading ||
    deleteTaxLoading ||
    toggleActiveLoading ||
    toggleActiveGroupLoading ||
    createTaxGroupLoading ||
    updateTaxGroupLoading ||
    deleteTaxGroupLoading;

  const handleCreateTaxModalOk = async () => {
    try {
      const values = await createTaxFormRef.validateFields();
      values["isCompoundTax"] = values["isCompoundTax"] || false;
      // console.log("Field values:", values);

      await createTax({ variables: { input: values } });

      setCreateTaxModalOpen(false);
      createTaxFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
      // console.log(err.message);
    }
  };

  const handleCreateTaxModalCancel = () => {
    setCreateTaxModalOpen(false);
  };

  const handleEdit = (record) => {
    if (record.type === "Compound Tax" || record.type === "") {
      setTaxEditRecord(record);
      // console.log("Edit Record:", record);

      editTaxFormRef.setFieldsValue({
        name: record.name,
        rate: record.rate,
        isCompoundTax: record.isCompoundTax,
      });
      // console.log(record);

      setEditTaxModalOpen(true);
    }
    if (record.type === "Tax Group") {
      setTaxGroupEditRecord(record);
      // console.log("Edit Record:", record);

      editTaxGroupFormRef.setFieldsValue({
        name: record.name,
      });
      setSelectedRows(record.taxes);

      setEditTaxGroupModalOpen(true);
    }
  };

  const handleEditTaxModalOk = async () => {
    try {
      const values = await editTaxFormRef.validateFields();
      // console.log("Field values:", values);

      const input = {
        name: values.name,
        rate: values.rate,
        isCompoundTax: values.isCompoundTax,
      };

      await updateTax({ variables: { id: taxEditRecord.id, input: input } });
      setEditTaxModalOpen(false);
      editTaxFormRef.resetFields();
    } catch (err) {
      openErrorNotification(notiApi, err.message);
      // console.log(err.message);
    }
  };

  const handleEditTaxModalCancel = () => {
    setEditTaxModalOpen(false);
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
      if (record.type === "" || record.type === "Compound Tax") {
        try {
          await deleteTax({
            variables: { id: record.id },
          });
        } catch (err) {
          // console.log(err.message);
          openErrorNotification(notiApi, err.message);
        }
      }
      if (record.type === "Tax Group") {
        try {
          await deleteTaxGroup({
            variables: { id: record.id },
          });
        } catch (err) {
          // console.log(err.message);
          openErrorNotification(notiApi, err.message);
        }
      }
    }
  };

  const handleRowSelect = (record) => {
    const isSelected = selectedRows.some((row) => row.id === record.id);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((row) => row.id !== record.id));
    } else {
      setSelectedRows([...selectedRows, record]);
    }
  };

  const handleCreateTaxGroupModalOk = async () => {
    // console.log("creating");
    try {
      const values = await createTaxGroupFormRef.validateFields();
      // console.log("Field values:", values);

      const taxIds = selectedRows.map((row) => ({ taxId: row.id }));

      const input = {
        name: values.name,
        taxes: taxIds,
      };
      // console.log("input", input);
      await createTaxGroup({ variables: { input } });

      setCreateTaxGroupModalOpen(false);
      createTaxGroupFormRef.resetFields();
    } catch (err) {
      // console.log(err.message);
    }
    setSelectedRows([]);
  };

  const handleCreateTaxGroupModalCancel = () => {
    setCreateTaxGroupModalOpen(false);
    createTaxGroupFormRef.resetFields();
    setSelectedRows([]);
  };

  const handleEditTaxGroupModalOk = async () => {
    try {
      const values = await editTaxGroupFormRef.validateFields();
      // console.log("Field values:", values);

      const input = {
        name: values.name,
        taxes: selectedRows.map((row) => ({ taxId: row.id })),
      };
      // console.log("input", input);

      await updateTaxGroup({ variables: { id: taxGroupEditRecord.id, input } });

      setEditTaxGroupModalOpen(false);
      editTaxGroupFormRef.resetFields();
    } catch (err) {
      // console.log(err.message);
    }
    setSelectedRows([]);
  };

  const handleEditTaxGroupModalCancel = () => {
    setEditTaxGroupModalOpen(false);
    editTaxGroupFormRef.resetFields();
    setSelectedRows([]);
  };

  const handleToggleActive = async (record) => {
    if (record.type === "Compound Tax" || record.type === "") {
      try {
        await toggleActiveTax({
          variables: { id: record.id, isActive: !record.isActive },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
    if (record.type === "Tax Group") {
      try {
        await toggleActiveTaxGroup({
          variables: { id: record.id, isActive: !record.isActive },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const createTaxForm = (
    <Form form={createTaxFormRef} onFinish={handleCreateTaxModalOk}>
      <Form.Item
        label={<FormattedMessage id="tax.name" defaultMessage="Tax Name" />}
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="tax.name.required"
                defaultMessage="Enter the Tax Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.rate" defaultMessage="Rate (%)" />}
        name="rate"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.rate.required"
                defaultMessage="Enter the Rate"
              />
            ),
          },
        ]}
      >
        <InputNumber min={0.001} suffix={<PercentageOutlined />} />
      </Form.Item>
      <Form.Item
        label=""
        name="isCompoundTax"
        valuePropName="checked"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13, offset: 8 }}
        onChange={(e) => setIsCompoundTax(e.target.checked)}
      >
        <Checkbox checked={isCompoundTax}>
          <FormattedMessage
            id="tax.compoundTax"
            defaultMessage="This tax is compound tax."
          />
        </Checkbox>
      </Form.Item>
    </Form>
  );

  const editTaxForm = (
    <Form form={editTaxFormRef} onFinish={handleEditTaxModalOk}>
      <Form.Item
        label={<FormattedMessage id="tax.name" defaultMessage="Tax Name" />}
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="tax.name.required"
                defaultMessage="Enter the Tax Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="label.rate" defaultMessage="Rate (%)" />}
        name="rate"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="label.rate.required"
                defaultMessage="Enter the Rate"
              />
            ),
          },
        ]}
      >
        <InputNumber min={0.001} suffix={<PercentageOutlined />} />
      </Form.Item>
      <Form.Item
        label=""
        name="isCompoundTax"
        valuePropName="checked"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13, offset: 8 }}
        onChange={(e) => setIsCompoundTax(e.target.checked)}
      >
        <Checkbox checked={isCompoundTax}>
          <FormattedMessage
            id="tax.compoundTax"
            defaultMessage="This tax is compound tax."
          />
        </Checkbox>
      </Form.Item>
    </Form>
  );

  const createTaxGroupForm = (
    <Form
      layout="vertical"
      form={createTaxGroupFormRef}
      onFinish={handleCreateTaxGroupModalOk}
    >
      <Form.Item
        label={
          <FormattedMessage
            id="taxGroup.name"
            defaultMessage="Tax Group Name"
          />
        }
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="taxGroup.name.required"
                defaultMessage="Enter the Tax Group Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>

      <Table
        className="header-less-table tax-table"
        dataSource={parsedTaxes}
        pagination={false}
        key="id"
        bordered
        columns={[
          {
            title: "Select",
            dataIndex: "select",
            width: "5%",
            key: "select",
            render: (_, record) => (
              <Form.Item name={record.name} style={{ margin: 0 }}>
                <Checkbox
                  onChange={() => handleRowSelect(record)}
                  checked={selectedRows.some((row) => row.id === record.id)}
                />
              </Form.Item>
            ),
          },
          {
            title: <FormattedMessage id="tax.name" defaultMessage="Tax Name" />,
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
              <>{record.isCompoundTax ? `${text} (Compound Tax)` : text}</>
            ),
          },
          {
            title: <FormattedMessage id="label.rate" defaultMessage="Rate" />,
            dataIndex: "rate",
            key: "rate",
            render: (text, record) => <>{text}%</>,
          },
        ]}
      />
      {/* <div className="note-container">
        <span className="note">Note :</span>
        <span className="note-info">
          Taxes that are applicable only during a specified period will not be
          listed above.
        </span>
      </div> */}
    </Form>
  );

  const editTaxGroupForm = (
    <Form
      layout="vertical"
      form={editTaxGroupFormRef}
      onFinish={handleEditTaxGroupModalOk}
    >
      <Form.Item
        label={
          <FormattedMessage
            id="taxGroup.name"
            defaultMessage="Tax Group Name"
          />
        }
        name="name"
        labelAlign="left"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 13 }}
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="taxGroup.name.required"
                defaultMessage="Enter the Tax Group Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100}></Input>
      </Form.Item>

      <Table
        className="header-less-table tax-table"
        dataSource={parsedTaxes}
        pagination={false}
        bordered
        columns={[
          {
            title: "Select",
            dataIndex: "select",
            width: "5%",
            key: "select",
            render: (_, record) => (
              <Form.Item name={record.name} style={{ margin: 0 }}>
                <Checkbox
                  onChange={() => handleRowSelect(record)}
                  checked={selectedRows.some((row) => row.id === record.id)}
                />
              </Form.Item>
            ),
          },
          {
            title: <FormattedMessage id="tax.name" defaultMessage="Tax Name" />,
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
              <>{record.isCompoundTax ? `${text} (Compound Tax)` : text}</>
            ),
          },
          {
            title: <FormattedMessage id="label.rate" defaultMessage="Rate" />,
            dataIndex: "rate",
            key: "rate",
            render: (text, record) => <>{text}%</>,
          },
        ]}
      />
      {/* <div className="note-container">
        <span className="note">Note :</span>
        <span className="note-info">
          Taxes that are applicable only during a specified period will not be
          listed above.
        </span>
      </div> */}
    </Form>
  );

  const mainTableColumns = [
    {
      title: <FormattedMessage id="label.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <>
          {text}
          {!record.isActive ? (
            <Tag className="active-status">
              <FormattedMessage id="label.inactive" defaultMessage="inactive" />
            </Tag>
          ) : (
            <></>
          )}
        </>
      ),
    },
    {
      title: <FormattedMessage id="label.type" defaultMessage="Type" />,
      dataIndex: "type",
      key: "type",
    },
    {
      title: <FormattedMessage id="label.rate" defaultMessage="Rate" />,
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "",
      dataIndex: "action",
      render: (_, record) =>
        hoveredRow === record.compoundId ? (
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
                  // icon: <CheckCircleOutlined />,
                  label: (
                    <FormattedMessage id="button.edit" defaultMessage="Edit" />
                  ),
                  key: "1",
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
                  // icon: <DeleteOutlined />,
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
        title={<FormattedMessage id="tax.new" defaultMessage="New Tax" />}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={createTaxModalOpen}
        onCancel={handleCreateTaxModalCancel}
        onOk={createTaxFormRef.submit}
      >
        {createTaxForm}
      </Modal>
      <Modal
        width="40rem"
        title={<FormattedMessage id="tax.edit" defaultMessage="Edit Tax" />}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={editTaxModalOpen}
        onCancel={handleEditTaxModalCancel}
        onOk={editTaxFormRef.submit}
      >
        {editTaxForm}
      </Modal>
      <Modal
        width="40rem"
        title={
          <FormattedMessage id="taxGroup.new" defaultMessage="New Tax Group" />
        }
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        open={createTaxGroupModalOpen}
        onCancel={handleCreateTaxGroupModalCancel}
        onOk={createTaxGroupFormRef.submit}
      >
        {createTaxGroupForm}
      </Modal>
      <Modal
        width="40rem"
        title={
          <FormattedMessage
            id="taxGroup.edit"
            defaultMessage="Edit Tax Group"
          />
        }
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        open={editTaxGroupModalOpen}
        onCancel={handleEditTaxGroupModalCancel}
        onOk={editTaxGroupFormRef.submit}
      >
        {editTaxGroupForm}
      </Modal>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">Tax Rates</p>
        <div className="header-buttons">
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setCreateTaxModalOpen(true)}
          >
            <FormattedMessage id="tax.new" defaultMessage="New Tax" />
          </Button>
          <Button onClick={() => setCreateTaxGroupModalOpen(true)}>
            <FormattedMessage
              id="taxGroup.new"
              defaultMessage="New Tax Group"
            />
          </Button>
        </div>
      </div>
      <div className="page-content">
        <Table
          loading={loading}
          className="main-table"
          pagination={false}
          columns={mainTableColumns}
          rowKey={(record) => record.compoundId}
          dataSource={parsedData}
          onRow={(record) => ({
            onMouseEnter: () => {
              setHoveredRow(record.compoundId);
              // console.log(record);
            },
            onMouseLeave: () => setHoveredRow(null),
          })}
        ></Table>
      </div>
    </>
  );
};

export default TaxRates;
