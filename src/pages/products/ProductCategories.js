import React, { useState, useMemo } from "react";
import {
  Button,
  Table,
  Dropdown,
  Form,
  Modal,
  Input,
  Checkbox,
  Select,
  Tag,
} from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";
import { ReactComponent as TreeIndicatorOutlined } from "../../assets/icons/TreeIndicatorOutlined.svg";
import { useMutation, useQuery } from "@apollo/client";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { CategoryQueries, CategoryMutations } from "../../graphql";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
const { GET_PRODUCT_CATEGORIES } = CategoryQueries;
const {
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  TOGGLE_ACTIVE_CATEGORY,
} = CategoryMutations;

const ProductCategories = () => {
  const [createFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const [hoveredRow, setHoveredRow] = useState(null);
  // const [searchFormRef] = Form.useForm();
  const { notiApi, msgApi } = useOutletContext();
  // const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, contextHolder] = Modal.useModal();
  const [editRecord, setEditRecord] = useState(null);
  const subCategoryCheckedNew = Form.useWatch("subCategory", createFormRef);
  const subCategoryCheckedEdit = Form.useWatch("subCategory", editFormRef);

  //Queries
  const { data: categoryNames, loading: categoryLoading } = useQuery(
    GET_PRODUCT_CATEGORIES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  //Mutations
  const [createCategory, { loading: createLoading }] = useMutation(
    CREATE_CATEGORY,
    {
      errorPolicy: "all",
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productCategory.created"
            defaultMessage="New Category Created"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_CATEGORIES],
    }
  );

  const [updateCategory, { loading: updateLoading }] = useMutation(
    UPDATE_CATEGORY,
    {
      errorPolicy: "all",
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productCategory.updated"
            defaultMessage="Category Updated"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_CATEGORIES],
    }
  );

  const [deleteCategory, { loading: deleteLoading }] = useMutation(
    DELETE_CATEGORY,
    {
      errorPolicy: "all",
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productCategory.deleted"
            defaultMessage="Category Deleted"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_CATEGORIES],
    }
  );

  const [toggleActiveCategory, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_CATEGORY,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productCategory.updated.status"
            defaultMessage="Category Status Updated"
          />
        );
      },
      refetchQueries: [GET_PRODUCT_CATEGORIES],
    }
  );

  const loading =
    categoryLoading ||
    createLoading ||
    updateLoading ||
    deleteLoading ||
    toggleActiveLoading;

  const queryData = useMemo(() => {
    let queryData = categoryNames?.listProductCategory
      ? categoryNames?.listProductCategory
      : [];
    if (queryData) {
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
  }, [categoryNames?.listProductCategory]);

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

  const handleCreateModalCancel = () => {
    setCreateModalOpen(false);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    // console.log(editRecord);
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

  const handleToggleActive = async (record) => {
    try {
      await toggleActiveCategory({
        variables: { id: record.id, isActive: !record.isActive },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleDelete = async (record) => {
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
            id: record.id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const categoryOptionsNew = useMemo(() => {
    if (categoryNames?.listProductCategory) {
      let categoriesToBeShown = categoryNames.listProductCategory;
      let names = categoryNames.listProductCategory.filter(
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
    if (categoryNames?.listProductCategory && editRecord) {
      let categoriesToBeShown = categoryNames.listProductCategory.filter(
        (x) => x.id !== editRecord.id && x.parentCategory.id !== editRecord.id
      );
      let names = categoryNames.listProductCategory.filter(
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

  const columns = [
    {
      title: (
        <FormattedMessage
          id="productCategory.name"
          defaultMessage="Category Name"
        />
      ),
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        if (record.level) {
          return (
            <span style={{ marginLeft: 8 * record.level }}>
              <TreeIndicatorOutlined className="tree-indicator-icon" />
              <span style={{ paddingLeft: 15 }}>
                {record.name}{" "}
                {!record.isActive ? (
                  <Tag className="active-status">inactive</Tag>
                ) : (
                  <></>
                )}
              </span>
            </span>
          );
        } else {
          return (
            <>
              {record.name}{" "}
              {!record.isActive ? (
                <Tag className="active-status">inactive</Tag>
              ) : (
                <></>
              )}
            </>
          );
        }
      },
    },
    {
      title: (
        <FormattedMessage
          id="productCategory.parentCategory"
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
          <FormattedMessage id="productCategory.name" defaultMessage="Name" />
        }
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productCategory.name.required"
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
            id="productCategory.subCategoryChecked"
            defaultMessage="Make this a sub-category"
          />
        </Checkbox>
      </Form.Item>
      {subCategoryCheckedNew && (
        <Form.Item
          name="parentCategory"
          label={
            <FormattedMessage
              id="productCategory.parentCategory"
              defaultMessage="Parent Category"
            />
          }
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="productCategory.parentCategory.required"
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
      <Form.Item
        label={
          <FormattedMessage id="productCategory.name" defaultMessage="Name" />
        }
        name="name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="productCategory.name.required"
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
            id="productCategory.subCategoryChecked"
            defaultMessage="Make this a sub-category"
          />
        </Checkbox>
      </Form.Item>
      {subCategoryCheckedEdit && (
        <Form.Item
          name="parentCategory"
          label={
            <FormattedMessage
              id="productCategory.parentCategory"
              defaultMessage="Parent Category"
            />
          }
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="productCategory.parentCategory.required"
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

  return (
    <>
      {contextHolder}
      <Modal
        loading={loading}
        width="40rem"
        title="Create Category"
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
        loading={loading}
        width="40rem"
        title="Edit Category"
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
            id="menu.productCategories"
            defaultMessage="Product Categories"
          />
        </p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={setCreateModalOpen}
        >
          <FormattedMessage
            id="product.newCategory"
            defaultMessage="New Category"
          />
        </Button>
      </div>
      <div className="page-content">
        <Table
          loading={loading}
          pagination={false}
          columns={columns}
          dataSource={queryData}
          rowKey={(record) => record.id}
          onRow={(record) => ({
            key: record.id,
            onMouseEnter: () => setHoveredRow(record.id),
            onMouseLeave: () => setHoveredRow(null),
          })}
        />
        {/* <PaginatedTable
          setHoveredRow={setHoveredRow}
          api={notiApi}
          columns={columns}
          gqlQuery={GET_PAGINATED_PRODUCT_CATEGORY}
          showSearch={false}
          // searchForm={searchForm}
          // searchFormRef={searchFormRef}
          searchQqlQuery={GET_PAGINATED_PRODUCT_CATEGORY}
          // parseSearchData={parseSearchData}
          parseData={parseData}
          parsePageInfo={parsePageInfo}
          showAddNew={true}
        /> */}
      </div>
    </>
  );
};

export default ProductCategories;
