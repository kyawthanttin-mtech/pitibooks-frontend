/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { DownCircleFilled } from "@ant-design/icons";
import { Dropdown, Form, Input, Modal } from "antd";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useMutation, gql } from "@apollo/client";
import { BranchMutations, BranchQueries } from "../graphql";
import PaginatedTable from "../components/PaginatedTable";

import {
  openErrorNotification,
  openSuccessNotification,
} from "../utils/Notification";

const { DELETE_BRANCH } = BranchMutations;
const { GET_PAGINATED_BRANCHES, GET_BRANCHES } = BranchQueries;

const actionItems = [
  {
    label: <FormattedMessage id="button.edit" defaultMessage="Edit" />,
    key: "1",
  },
  {
    label: <FormattedMessage id="button.delete" defaultMessage="Delete" />,
    key: "2",
  },
];

const handleEdit = (record, navigate, location) => {
  navigate("edit", {
    state: { ...location.state, from: { pathname: location.pathname }, record },
  });
};

const parseData = (data) => {
  let branches = [];
  data?.branchPagination?.edges.forEach(({ node }) => {
    branches.push({
      key: node.id,
      id: node.id,
      name: node.name,
      city: node.city,
    });
  });
  return branches;
};

const parseSearchData = (data) => {
  return data?.branches ? data?.branches : [];
};

const parsePageInfo = (data) => {
  let pageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
    endCursor: null,
  };
  if (data?.branchPagination) {
    pageInfo = {
      hasNextPage: data.branchPagination.pageInfo.hasNextPage,
      endCursor: data.branchPagination.pageInfo.endCursor,
    };
  }
  return pageInfo;
};

const BranchPage = () => {
  const [searchFormRef] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [notiApi] = useOutletContext();
  const [deleteModal, contextHolder] = Modal.useModal();
  const handleDelete = async (record) => {
    try {
      const confirmed = await deleteModal.confirm({
        content: (
          <FormattedMessage
            id="confirm.delete"
            defaultMessage="Are you sure to delete?"
          />
        ),
      });

      if (confirmed) {
        await deleteBranch({
          variables: {
            id: record.id,
          },
        });
      }
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const [deleteBranch] = useMutation(DELETE_BRANCH, {
    onCompleted(data) {
      openSuccessNotification(notiApi, "Branch Deleted");
    },
    update(cache, { data }) {
      const existingBranches = cache.readQuery({
        query: GET_PAGINATED_BRANCHES,
      });
      const updatedBranches = existingBranches.branchPagination.edges.filter(
        ({ node }) => node.id !== data.deleteBranch.id
      );
      cache.writeQuery({
        query: GET_PAGINATED_BRANCHES,
        data: {
          branchPagination: {
            ...existingBranches.branchPagination,
            edges: updatedBranches,
          },
        },
      });
    },
  });

  const columns = (navigate, location) => [
    {
      title: <FormattedMessage id="branch.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
    },
    {
      title: <FormattedMessage id="branch.city" defaultMessage="City" />,
      dataIndex: "city",
      key: "city",
    },
    {
      title: "",
      dataIndex: "action",
      render: (_, record) => (
        <Dropdown
          key={record.key}
          menu={{
            items: actionItems,
            onClick: async ({ key }) => {
              if (key === "1") handleEdit(record, navigate, location);
              // else if (key === '2')handleCloseTask
              else if (key === "2") {
                handleDelete(record);
              }
            },
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <DownCircleFilled />
          </a>
        </Dropdown>
      ),
    },
  ];

  const searchForm = (
    <Form
      form={searchFormRef}
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
        label={<FormattedMessage id="branch.name" defaultMessage="Name" />}
        name="name"
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={<FormattedMessage id="branch.city" defaultMessage="City" />}
        name="city"
      >
        <Input />
      </Form.Item>
    </Form>
  );

  return (
    <>
      {contextHolder}
      <PaginatedTable
        api={notiApi}
        columns={columns(navigate, location)}
        gqlQuery={GET_PAGINATED_BRANCHES}
        showSearch={true}
        searchForm={searchForm}
        searchFormRef={searchFormRef}
        searchQqlQuery={GET_BRANCHES}
        parseSearchData={parseSearchData}
        parseData={parseData}
        parsePageInfo={parsePageInfo}
        showAddNew={true}
        // onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
};

export default BranchPage;
