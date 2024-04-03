import React, { useMemo, useState } from "react";

import { Button, Table, Dropdown, Modal, Tag } from "antd";
import { PlusOutlined, DownCircleFilled } from "@ant-design/icons";

import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { BranchQueries } from "../../graphql";
import { BranchMutations } from "../../graphql";
const { GET_BRANCHES } = BranchQueries;
const { DELETE_BRANCH, TOGGLE_ACTIVE_BRANCH } = BranchMutations;

const Branches = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const navigate = useNavigate();
  const [deleteModal, contextHolder] = Modal.useModal();
  const [notiApi] = useOutletContext();

  // Queries
  const { data, loading: queryLoading } = useQuery(GET_BRANCHES, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const queryData = useMemo(() => data?.listBranch, [data]);

  // Mutations
  const [deleteBranch, { loading: deleteLoading }] = useMutation(
    DELETE_BRANCH,
    {
      onCompleted() {
        openSuccessNotification(notiApi, "Branch Deleted");
      },
      refetchQueries: [GET_BRANCHES],
    }
  );

  const [toggleActiveBranch, { loading: toggleActiveLoading }] = useMutation(
    TOGGLE_ACTIVE_BRANCH,
    {
      onCompleted() {
        openSuccessNotification(notiApi, "Branch Status Updated");
      },
      refetchQueries: [GET_BRANCHES],
    }
  );

  const loading = queryLoading || deleteLoading || toggleActiveLoading;

  const handleEdit = (record) => {
    navigate("edit", {
      state: {
        record,
      },
    });
  };

  const handleToggleActive = async (record) => {
    try {
      await toggleActiveBranch({
        variables: { id: record.id, isActive: !record.isActive },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleDelete = async (record) => {
    console.log("delete", record.id);
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
        await deleteBranch({
          variables: {
            id: record.id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const columns = [
    {
      title: "Branch Name",
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
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "",
      dataIndex: "action",
      render: (_, record) =>
        hoveredRow === record.id ? (
          <Dropdown
            loading={queryLoading}
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
                  label: (
                    <FormattedMessage
                      id="button.markAsActive"
                      defaultMessage={`Mark as ${
                        record.isActive ? "inactive" : "active"
                      }`}
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
      <div className="page-header page-header-with-button">
        <p className="page-header-text">Branches</p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/branch/new")}
        >
          Add Branch
        </Button>
      </div>
      <div className="page-content">
        <Table
          loading={loading}
          columns={columns}
          dataSource={queryData}
          pagination={false}
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

export default Branches;
