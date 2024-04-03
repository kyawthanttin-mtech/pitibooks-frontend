import React, { useState } from "react";

import { Form, Input, Select, Button } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import {
  StateQueries,
  TownshipQueries,
  TransactionNumberSeriesQueries,
} from "../../graphql";
import { BranchMutations } from "../../graphql";
import { BranchQueries } from "../../graphql";
const { UPDATE_BRANCH } = BranchMutations;
const { GET_BRANCHES } = BranchQueries;
const { GET_TOWNSHIPS } = TownshipQueries;
const { GET_STATES } = StateQueries;
const { GET_TRANSACTION_NUMBER_SERIES_ALL } = TransactionNumberSeriesQueries;

const BranchesEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [notiApi] = useOutletContext();
  const record = location.state?.record;
  const [selectedState, setSelectedState] = useState(record.state);

  // Queries
  const { data: townshipData, loading: townshipLoading } = useQuery(
    GET_TOWNSHIPS,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { data: stateData, loading: stateLoading } = useQuery(GET_STATES, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: tnsData, loading: tnsLoading } = useQuery(
    GET_TRANSACTION_NUMBER_SERIES_ALL,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  //Mutations
  const [updateBranch, { loading: updateLoading }] = useMutation(
    UPDATE_BRANCH,
    {
      errorPolicy: "all",
      onCompleted(data) {
        openSuccessNotification(notiApi, "Branch Updated");
        navigate("/branch");
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      refetchQueries: [GET_BRANCHES],
    }
  );

  const loading =
    townshipLoading || stateLoading || tnsLoading || updateLoading;

  const parsedRecord = {
    ...record,
    state: record.state ? record.state.id : null,
    township: record.township ? record.township.id : null,
    transactionNumberSeries: record.township
      ? record.transactionNumberSeries.id
      : null,
  };

  const onFinish = (values) => {
    updateBranch({
      variables: {
        id: record.id,
        input: {
          name: values.name,
          country: values.country,
          city: values.city,
          townshipId: values.township,
          stateId: values.state,
          address: values.address,
          // email: values.email,
          phone: values.phone,

          mobile: values.mobile,
          transactionNumberSeriesId: values.transactionNumberSeries,
        },
      },
    });
  };
  const editBranchForm = (
    <Form form={form} onFinish={onFinish} initialValues={parsedRecord}>
      <Form.Item
        label="Branch Name"
        name="name"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        label="Country"
        name="country"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        label="State"
        name="state"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          onChange={(value) =>
            setSelectedState(
              stateData?.listState.find((state) => state.id === value)
            )
          }
        >
          {stateData?.listState.map((state) => (
            <Select.Option
              key={state.id}
              value={state.id}
              label={state.stateNameEn}
            >
              {state.stateNameEn}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="City"
        name="city"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input></Input>
      </Form.Item>
      <Form.Item
        label="Township"
        name="township"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Select
          loading={loading}
          allowClear
          showSearch
          optionFilterProp="label"
          disabled={!selectedState}
        >
          {townshipData?.listTownship.map((township) => {
            if (township.stateCode === selectedState?.code) {
              return (
                <Select.Option
                  key={township.id}
                  value={township.id}
                  label={township.townshipNameEn}
                >
                  {township.townshipNameEn}
                </Select.Option>
              );
            }
            return null;
          })}
        </Select>
      </Form.Item>
      <Form.Item
        label="Address"
        name="address"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input.TextArea rows={4}></Input.TextArea>
      </Form.Item>
      {/* <Form.Item
        label="Email"
        name="email"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input />
      </Form.Item> */}
      <Form.Item
        label="Phone"
        name="phone"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Mobile"
        name="mobile"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Transaction Number Series"
        name="transactionNumberSeries"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 6 }}
      >
        <Select allowClear showSearch optionFilterProp="label">
          {tnsData?.listTransactionNumberSeries.map((series) => (
            <Select.Option
              key={series.id}
              value={series.id}
              label={series.name}
            >
              {series.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <div className="page-actions-bar page-actions-bar-margin">
        <Button
          type="primary"
          className="page-actions-btn"
          onClick={form.submit}
        >
          Save
        </Button>
        <Button
          className="page-actions-btn"
          onClick={() => navigate("/branch")}
        >
          Cancel
        </Button>
      </div>
    </Form>
  );

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Edit Branch</p>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        {editBranchForm}
      </div>
    </>
  );
};

export default BranchesEdit;
