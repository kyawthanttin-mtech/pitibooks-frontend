import React, { useState, useMemo } from "react";
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  EnterOutlined,
  SearchOutlined,
  DeleteOutlined,
  MoreOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Checkbox,
  Empty,
} from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { CategoryQueries, CategoryMutations } from "../graphql";
import { openErrorNotification } from "../utils/Notification";

const { GET_CATEGORIES, GET_CATEGORY_NAMES } = CategoryQueries;
const { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } = CategoryMutations;

const actionItems = [
  {
    label: <FormattedMessage id="button.edit" defaultMessage="Edit" />,
    icon: <EditOutlined />,
    key: "1",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    icon: <DeleteOutlined />,
    key: "2",
  },
];

const CategoryPage = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [searchFormRef] = Form.useForm();
  const [notiApi] = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);
  const [searchShown, setSearchShown] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const subCategoryCheckedNew = Form.useWatch("subCategory", createFormRef);
  const subCategoryCheckedEdit = Form.useWatch("subCategory", editFormRef);

  const compactColumns = [
    {
      title: "",
      dataIndex: "name",
      render: (_, record) => {
        return (
          <div className="table-list-item">
            <div className="table-list-item-title">{record.name}</div>
          </div>
        );
      },
    },
  ];

  const columns = [
    {
      title: <FormattedMessage id="category.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        if (record.level) {
          return (
            <span style={{ marginLeft: 8 * record.level }}>
              <EnterOutlined rotate={90} /> {record.name}
            </span>
          );
        } else {
          return record.name;
        }
      },
    },
    {
      title: (
        <FormattedMessage
          id="account.parentCategory"
          defaultMessage="Parent Category"
        />
      ),
      dataIndex: "parentCategory",
      key: "parentCategory",
      render: (_, record) => record.parentCategory.name,
    },
    {
      title: "",
      dataIndex: "action",
      render: (_, record) => (
        <Dropdown
          key={record.key}
          menu={{
            items: actionItems,
            onClick: async ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === "1") {
                handleEdit(record);
              } else if (key === "2") {
                const confirmed = deleteModal.confirm({
                  content: (
                    <FormattedMessage
                      id="confirm.delete"
                      defaultMessage="Are you sure to delete?"
                    />
                  ),
                });
                if (confirmed) {
                  try {
                    await deleteCategory({
                      variables: {
                        id: record.id,
                      },
                    });
                  } catch (err) {
                    openErrorNotification(notiApi, err.message);
                  }
                }
              }
            },
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SettingOutlined />
          </div>
        </Dropdown>
      ),
    },
  ];

  const handleSearchModalCancel = () => {
    setSearchModalOpen(false);
  };

  const handleSearchModalClear = () => {
    setSearchShown(false);
    refetch({ name: "" });
    searchFormRef.resetFields();
    setSearchModalOpen(false);
  };

  const handleSearchModalOk = () => {
    setSearchShown(true);
    refetch({ name: searchFormRef.getFieldValue("name") });
    setSearchModalOpen(false);
  };

  const handleCreateModalCancel = () => {
    setCreateModalOpen(false);
  };

  const handleCreateModalOk = async () => {
    try {
      await createCategory({
        variables: {
          input: {
            name: createFormRef.getFieldValue("name"),
            parentCategoryId:
              createFormRef.getFieldValue("parentCategory") &&
              subCategoryCheckedNew
                ? createFormRef.getFieldValue("parentCategory")
                : 0,
          },
        },
      });
      createFormRef.resetFields();
      setCreateModalOpen(false);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    console.log(editRecord);
    editFormRef.resetFields();
    editFormRef.setFieldsValue({
      id: record.id,
      name: record.name,
    });
    if (record.parentCategory.id && record.parentCategory.id > 0) {
      editFormRef.setFieldsValue({
        subCategory: true,
        parentCategory: record.parentCategory.id,
      });
    }
    setEditModalOpen(true);
  };

  const handleEditModalCancel = () => {
    setEditModalOpen(false);
  };

  const handleEditModalOk = async () => {
    try {
      await updateCategory({
        variables: {
          id: editFormRef.getFieldValue("id"),
          input: {
            name: editFormRef.getFieldValue("name"),
            parentCategoryId:
              editFormRef.getFieldValue("parentCategory") &&
              subCategoryCheckedEdit
                ? editFormRef.getFieldValue("parentCategory")
                : 0,
          },
        },
      });
      setEditModalOpen(false);
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const [createCategory, { loading: createLoading }] = useMutation(
    CREATE_CATEGORY,
    {
      errorPolicy: "all",
      refetchQueries: [GET_CATEGORIES, GET_CATEGORY_NAMES],
    }
  );

  const [updateCategory, { loading: updateLoading }] = useMutation(
    UPDATE_CATEGORY,
    {
      errorPolicy: "all",
      refetchQueries: [GET_CATEGORIES, GET_CATEGORY_NAMES],
    }
  );

  const [deleteCategory, { loading: deleteLoading }] = useMutation(
    DELETE_CATEGORY,
    {
      errorPolicy: "all",
      refetchQueries: [GET_CATEGORIES, GET_CATEGORY_NAMES],
    }
  );

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_CATEGORIES, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: categoryNames, loading: categoryQueryLoading } = useQuery(
    GET_CATEGORY_NAMES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const queryData = useMemo(() => {
    let queryData = data?.categories ? data?.categories : [];
    if (!searchShown) {
      let tempData = queryData.filter((x) => x.parentCategory.id === 0);
      let queryLoopTimes = 0;
      while (queryData.length !== tempData.length && queryLoopTimes < 10) {
        // eslint-disable-next-line no-loop-func
        queryData.forEach((x) => {
          if (x.parentCategory.id > 0) {
            const found =
              tempData.findIndex((y) => y.id === x.id) >= 0 ? true : false;
            const index = tempData.findIndex(
              (y) => y.id === x.parentCategory.id
            );
            if (!found && index >= 0) {
              const parent = tempData.find((y) => y.id === x.parentCategory.id);
              tempData.splice(index + 1, 0, {
                ...x,
                level: parent.level ? parent.level + 1 : 1,
              });
            }
          }
        });
        queryLoopTimes++;
      }
      queryData = tempData;
    }
    return queryData;
  }, [data?.categories, searchShown]);

  const categoryOptionsNew = useMemo(() => {
    if (categoryNames?.categories) {
      let categoriesToBeShown = categoryNames.categories;
      let names = categoryNames.categories.filter(
        (x) => x.parentCategory.id === 0
      );
      let loopTimes = 0;
      while (categoriesToBeShown.length !== names.length && loopTimes < 10) {
        // eslint-disable-next-line no-loop-func
        categoriesToBeShown.forEach((x) => {
          if (x.parentCategory.id > 0) {
            const found =
              names.findIndex((y) => y.id === x.id) >= 0 ? true : false;
            const index = names.findIndex((y) => y.id === x.parentCategory.id);
            if (!found && index >= 0) {
              const parent = names.find((y) => y.id === x.parentCategory.id);
              names.splice(index + 1, 0, {
                ...x,
                level: parent.level ? parent.level + 1 : 1,
                name:
                  "-".repeat(parent.level ? parent.level + 1 : 1) +
                  " " +
                  x.name,
              });
            }
          }
        });
        loopTimes++;
      }

      return names.map((x) => ({ label: x.name, value: x.id }));
    } else {
      return [];
    }
  }, [categoryNames]);

  const categoryOptionsEdit = useMemo(() => {
    if (categoryNames?.categories && editRecord) {
      let categoriesToBeShown = categoryNames.categories.filter(
        (x) => x.id !== editRecord.id && x.parentCategory.id !== editRecord.id
      );
      let names = categoryNames.categories.filter(
        (x) =>
          x.id !== editRecord.id &&
          x.parentCategory.id !== editRecord.id &&
          x.parentCategory.id === 0
      );
      let loopTimes = 0;
      while (categoriesToBeShown.length !== names.length && loopTimes < 10) {
        // eslint-disable-next-line no-loop-func
        categoriesToBeShown.forEach((x) => {
          if (x.parentCategory.id > 0) {
            const found =
              names.findIndex((y) => y.id === x.id) >= 0 ? true : false;
            const index = names.findIndex((y) => y.id === x.parentCategory.id);
            if (!found && index >= 0) {
              const parent = names.find((y) => y.id === x.parentCategory.id);
              names.splice(index + 1, 0, {
                ...x,
                level: parent.level ? parent.level + 1 : 1,
                name:
                  "-".repeat(parent.level ? parent.level + 1 : 1) +
                  " " +
                  x.name,
              });
            }
          }
        });
        loopTimes++;
      }

      return names.map((x) => ({ label: x.name, value: x.id }));
    } else {
      return [];
    }
  }, [categoryNames, editRecord]);

  const loading =
    queryLoading ||
    categoryQueryLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading;

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
        label={<FormattedMessage id="category.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="category.name.required"
                defaultMessage="Enter the Category Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item
        shouldUpdate
        name="subCategory"
        valuePropName="checked"
        wrapperCol={{ offset: 7, span: 11 }}
      >
        <Checkbox>
          <FormattedMessage
            id="category.subCategoryChecked"
            defaultMessage="Make this a sub-category"
          />
        </Checkbox>
      </Form.Item>
      {subCategoryCheckedNew && (
        <Form.Item
          name="parentCategory"
          label={
            <FormattedMessage
              id="category.parentCategory"
              defaultMessage="Parent Category"
            />
          }
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="category.parentCategory.required"
                  defaultMessage="Select the Parent Category"
                />
              ),
            },
          ]}
        >
          <Select options={categoryOptionsNew ? categoryOptionsNew : []} />
        </Form.Item>
      )}
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
      <Form.Item hidden={true} name="id">
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="category.name" defaultMessage="Name" />}
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="category.name.required"
                defaultMessage="Enter the Category Name"
              />
            ),
          },
        ]}
      >
        <Input maxLength={100} />
      </Form.Item>
      <Form.Item
        shouldUpdate
        name="subCategory"
        valuePropName="checked"
        wrapperCol={{ offset: 7, span: 11 }}
      >
        <Checkbox>
          <FormattedMessage
            id="category.subCategoryChecked"
            defaultMessage="Make this a sub-category"
          />
        </Checkbox>
      </Form.Item>
      {subCategoryCheckedEdit && (
        <Form.Item
          name="parentCategory"
          label={
            <FormattedMessage
              id="category.parentCategory"
              defaultMessage="Parent Category"
            />
          }
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="category.parentCategory.required"
                  defaultMessage="Select the Parent Category"
                />
              ),
            },
          ]}
        >
          <Select options={categoryOptionsEdit ? categoryOptionsEdit : []} />
        </Form.Item>
      )}
    </Form>
  );

  const searchForm = (
    <Form form={searchFormRef}>
      <Form.Item
        label={<FormattedMessage id="category.name" defaultMessage="Name" />}
        name="name"
      >
        <Input maxLength={100} allowClear={true} />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      {contextHolder}
      <Modal
        title={
          <FormattedMessage id="modal.search" defaultMessage="Search Panel" />
        }
        closeIcon={true}
        style={{
          top: 65,
        }}
        open={searchModalOpen}
        onOk={handleSearchModalOk}
        onCancel={handleSearchModalCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSearchModalOk}
          >
            <FormattedMessage id="button.search" defaultMessage="Search" />
          </Button>,
          <Button
            key="clear"
            loading={loading}
            onClick={handleSearchModalClear}
          >
            <FormattedMessage id="button.clear" defaultMessage="Clear" />
          </Button>,
        ]}
      >
        {searchForm}
      </Modal>
      <Modal
        title={
          <FormattedMessage
            id="category.create"
            defaultMessage="Create Category"
          />
        }
        closeIcon={true}
        style={{
          top: 65,
        }}
        open={createModalOpen}
        onOk={createFormRef.submit}
        onCancel={handleCreateModalCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={createFormRef.submit}
          >
            <FormattedMessage id="button.save" defaultMessage="Save" />
          </Button>,
          <Button
            key="cancel"
            loading={loading}
            onClick={handleCreateModalCancel}
          >
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>,
        ]}
      >
        {createForm}
      </Modal>
      <Modal
        title={
          <FormattedMessage id="category.edit" defaultMessage="Edit Category" />
        }
        closeIcon={true}
        style={{
          top: 65,
        }}
        open={editModalOpen}
        onOk={editFormRef.submit}
        onCancel={handleEditModalCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={editFormRef.submit}
          >
            <FormattedMessage id="button.save" defaultMessage="Save" />
          </Button>,
          <Button
            key="cancel"
            loading={loading}
            onClick={handleEditModalCancel}
          >
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>,
        ]}
      >
        {editForm}
      </Modal>

      <Row
        className={
          selectedRecord
            ? "list-column-header-row-column"
            : "list-column-header-row"
        }
      >
        <Space>
          <Tooltip
            title={
              <FormattedMessage id="button.search" defaultMessage="Search" />
            }
          >
            <Button
              icon={<SearchOutlined />}
              loading={loading}
              onClick={() => setSearchModalOpen(true)}
            />
          </Tooltip>
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={loading}
            onClick={() => setCreateModalOpen(true)}
          >
            <FormattedMessage id="button.new" defaultMessage="New" />
          </Button>
        </Space>
      </Row>
      <div className="wrapper">
        <div>
          <Row className="list-column-full-row">
            <Table
              className={selectedRecord ? "column-width" : "full-width"}
              columns={selectedRecord ? compactColumns : columns}
              pagination={false}
              loading={loading}
              dataSource={queryData}
              rowKey="id"
              rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setEditRecord(record);
                    setSelectedRecord(record);
                    setSelectedRowIndex(record.id);
                  },
                };
              }}
            />
          </Row>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row
              className="content-column-header-row"
              style={{
                backgroundColor: "white",
                justifyContent: "space-between",
              }}
            >
              <div className="content-title-block">
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div className="content-title-sub">
                    {selectedRecord.detailType}
                  </div>
                  {/* {!selectedRecord.isActive && (
                  <Tag color="magenta">
                    <FormattedMessage
                      id="status.inactive"
                      defaultMessage="Inactive"
                    />
                  </Tag>
                )} */}
                </div>
                <div className="content-title-main">{selectedRecord.name}</div>
              </div>
              <Button
                icon={<CloseOutlined />}
                type="text"
                loading={loading}
                onClick={() => {
                  setSelectedRecord(null);
                  setSelectedRowIndex(0);
                }}
              />
            </Row>
            <Row className="content-column-action-row">
              <Dropdown.Button
                trigger={["click"]}
                type="text"
                icon={<MoreOutlined />}
                loading={loading}
                onClick={() => handleEdit(selectedRecord)}
                menu={{
                  items: [
                    {
                      label: (
                        <FormattedMessage
                          id="button.delete"
                          defaultMessage="Delete"
                        />
                      ),
                      key: "2",
                      icon: <DeleteOutlined />,
                    },
                  ],
                  onClick: async ({ key }) => {
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
                        await deleteCategory({
                          variables: {
                            id: selectedRecord.id,
                          },
                        });
                        setSelectedRecord(null);
                        setSelectedRowIndex(0);
                      } catch (err) {
                        openErrorNotification(notiApi, err.message);
                      }
                    }
                  },
                }}
              >
                <EditOutlined />
                <FormattedMessage id="button.edit" defaultMessage="Edit" />
              </Dropdown.Button>
            </Row>
            <Row
              className="content-column-brief-row"
              style={{ backgroundColor: "white" }}
            >
              <div className="content-title-block">
                {/* <Statistic
                  title={
                    "Category"
                  }
                  value={100000}
                  // valueStyle={{ color: Theme.colorPrimary }}
                  prefix="MMK"
                /> */}
                <h4>{selectedRecord.name}</h4>
                <div className="content-description">
                  <span style={{ fontStyle: "italic" }}>
                    <FormattedMessage
                      id="account.description"
                      defaultMessage="Parent Category"
                    />
                  </span>
                  :
                  {selectedRecord.parentCategory
                    ? selectedRecord.parentCategory.name
                    : " - "}
                </div>
              </div>
            </Row>
            <Row className="content-column-full-row">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
