import React from "react";
import { Form, Input, Button, Layout, Space } from "antd";
import { useMutation, gql } from "@apollo/client";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { BranchMutations } from "../graphql";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../utils/Notification";

const { UPDATE_BRANCH } = BranchMutations;

const BranchEditPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.record;
  const [notiApi] = useOutletContext();

  const [updateTax, { loading }] = useMutation(UPDATE_BRANCH, {
    errorPolicy: "all",
    onCompleted(data) {
      openSuccessNotification(notiApi, "Branch Updated");
      navigate(from, { state: location.state, replace: true });
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const onFinish = (values) => {
    updateTax({
      variables: {
        id: record.id,
        input: {
          name: values["name"],
          city: values["city"],
        },
      },
      update(cache, { data: { updateBranch } }) {
        cache.modify({
          fields: {
            branchPagination(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) => x.node.__ref === "Branch:" + updateBranch.id
              );
              if (index >= 0) {
                const newBranch = cache.writeFragment({
                  data: updateBranch,
                  fragment: gql`
                    fragment NewBranch on Branch {
                      id
                      name
                      city
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newBranch;
                return paginationCopy;
              } else {
                return pagination;
              }
            },
          },
        });
      },
    });
  };

  return (
    <Layout style={{ height: "100%" }}>
      <Layout.Content>
        <Form
          form={form}
          className="form"
          labelCol={{
            lg: 5,
            xs: 5,
          }}
          wrapperCol={{
            lg: 13,
            xs: 13,
          }}
          style={{
            maxWidth: 600,
          }}
          onFinish={onFinish}
          autoComplete="off"
          initialValues={record}
        >
          <Form.Item
            label={<FormattedMessage id="branch.name" defaultMessage="Name" />}
            name="name"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="branch.name.required"
                    defaultMessage="Enter the Branch Name"
                  />
                ),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="branch.city" defaultMessage="City" />}
            name="city"
          >
            <Input />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 5,
              lg: 13,
              xs: 13,
            }}
          ></Form.Item>
        </Form>
      </Layout.Content>
      <Layout.Footer>
        <Space>
          <Button
            type="primary"
            loading={loading}
            onClick={form.submit}
            disabled={!record.id}
          >
            <FormattedMessage id="button.update" defaultMessage="Update" />
          </Button>
          <Button
            loading={loading}
            onClick={() =>
              navigate(from, { state: location.state, replace: true })
            }
          >
            <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
          </Button>
        </Space>
      </Layout.Footer>
    </Layout>
  );
};

export default BranchEditPage;
