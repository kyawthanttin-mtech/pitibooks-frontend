/* eslint-disable react/style-prop-object */
import React, { useState } from "react";

import { Row, Modal, Form, Col, Input, DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMutation, useReadQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { PaginatedJournal } from "../../components";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

import "./ManualJournals.css";

import { JournalQueries, JournalMutations } from "../../graphql";
const { GET_PAGINATED_JOURNALS } = JournalQueries;
const { DELETE_JOURNAL } = JournalMutations;

const ManualJournals = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { notiApi, msgApi, allBranchesQueryRef } = useOutletContext();
  const [searchJournalFormRef] = Form.useForm();

  // Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);

  // Mutations
  const [deleteJournal, { loading: deleteLoading }] = useMutation(
    DELETE_JOURNAL,

    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="journal.deleted"
            defaultMessage="Journal Deleted"
          />
        );
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_JOURNALS],
      update(cache, { data }) {
        const existingJournals = cache.readQuery({
          query: GET_PAGINATED_JOURNALS,
        });
        const updatedJournals = existingJournals.paginateJournal.edges.filter(
          ({ node }) => node.id !== data.deleteJournal.id
        );
        cache.writeQuery({
          query: GET_PAGINATED_JOURNALS,
          data: {
            paginateJournal: {
              ...existingJournals.paginateJournal,
              edges: updatedJournals,
            },
          },
        });
      },
    }
  );

  const loading = deleteLoading;

  const parseData = (data) => {
    let journals = [];
    // const monthNames = [
    //   "Jan",
    //   "Feb",
    //   "Mar",
    //   "Apr",
    //   "May",
    //   "Jun",
    //   "Jul",
    //   "Aug",
    //   "Sep",
    //   "Oct",
    //   "Nov",
    //   "Dec",
    // ];

    data?.paginateJournal?.edges.forEach(({ node }) => {
      if (node != null) {
        // const date = new Date(node.journalDate);

        // const day = date.getDate();
        // const month = monthNames[date.getMonth()];
        // const year = date.getFullYear();

        // const formattedDate = `${day} ${month} ${year}`;

        journals.push({
          key: node.id,
          id: node.id,
          date: dayjs(node.journalDate).format(REPORT_DATE_FORMAT),
          originalDate: node.journalDate,
          branch: node.branch,
          currency: node.currency,
          notes: node.journalNotes,
          journalNumber: node.journalNumber,
          referenceNumber: node.referenceNumber,
          totalAmount: node.journalTotalAmount,
          transactions: node.transactions,
          supplier: node.supplier,
          customer: node.customer,
        });
      }
    });
    return journals ? journals : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateJournal) {
      pageInfo = {
        hasNextPage: data.paginateJournal.pageInfo.hasNextPage,
        endCursor: data.paginateJournal.pageInfo.endCursor,
      };
    }
    return pageInfo;
  };

  const handleEdit = (record, navigate, location) => {
    navigate("edit", {
      state: {
        ...location.state,
        from: { pathname: location.pathname },
        record,
      },
    });
  };

  const handleDelete = async (id) => {
    // console.log(id);
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
        await deleteJournal({
          variables: {
            id: id,
          },
        });
        return true;
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
    return false;
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "date",
      key: "date",
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branch",
      render: (_, record) => <>{record.branch.name}</>,
    },
    {
      title: (
        <FormattedMessage id="label.journalNumber" defaultMessage="Journal #" />
      ),
      dataIndex: "journalNumber",
      key: "journalNumber",
    },
    {
      title: (
        <FormattedMessage
          id="label.referenceNumber"
          defaultMessage="Reference #"
        />
      ),
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (text, record) => (
        <>
          {record.currency.symbol}{" "}
          <FormattedNumber
            value={text}
            style="decimal"
            minimumFractionDigits={record.currency.decimalPlaces}
          />
        </>
      ),
    },
    // {
    //   title: "Created By",
    //   dataIndex: "createdBy",
    //   key: "createdBy",
    // },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        />
      ),
      dataIndex: "search",
      key: "search",
    },
  ];

  const searchJournalForm = (
    <Form form={searchJournalFormRef}>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.journalNumber"
                defaultMessage="Journal #"
              />
            }
            name="journalNumber"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.referenceNumber"
                defaultMessage="Reference #"
              />
            }
            name="referenceNumber"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.dateRange"
                defaultMessage="Date Range"
              />
            }
            name="dateRange"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <DatePicker.RangePicker
              format="DD MM YYYY"
              // onChange={onChange}
              // onOk={onOk}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {branchData?.listAllBranch?.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.id}
                  label={branch.stateNameEn}
                >
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      {/* <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.account" defaultMessage="Account" />
            }
            name="accountId"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select an account"
            >
              {accountData?.listAllAccount?.map((account) => (
                <Select.Option
                  key={account.id}
                  value={account.id}
                  label={account.name}
                >
                  {account.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<FormattedMessage id="label.notes" defaultMessage="Notes" />}
            name="notes"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row> */}
      {/* <Row>
        <Col span={12}>
          <Space
            size={"small"}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              // justifyContent: "center",
            }}
          >
            <Form.Item
              style={{ margin: 0 }}
              label={
                <FormattedMessage
                  id="label.totalRange"
                  defaultMessage="Total Range"
                />
              }
              name="totalStart"
              labelAlign="left"
              labelCol={{ span: 11 }}
              wrapperCol={{ span: 14 }}
            >
              <Input className="text-align-right" />
            </Form.Item>
            <span>-</span>
            <Form.Item
              style={{ margin: 0 }}
              label=""
              name="totalEnd"
              labelAlign="left"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 19 }}
            >
              <Input className="text-align-right" />
            </Form.Item>
          </Space>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Select allowClear showSearch optionFilterProp="label">
              {branchData?.listAllBranch?.map((branch) => (
                <Select.Option
                  key={branch.id}
                  value={branch.id}
                  label={branch.stateNameEn}
                >
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row> */}
    </Form>
  );

  return (
    <>
      {contextHolder}

      <PaginatedJournal
        dataLoading={loading}
        api={notiApi}
        columns={columns}
        gqlQuery={GET_PAGINATED_JOURNALS}
        showSearch={true}
        searchForm={searchJournalForm}
        searchFormRef={searchJournalFormRef}
        searchQqlQuery={GET_PAGINATED_JOURNALS}
        parseData={parseData}
        parsePageInfo={parsePageInfo}
        showAddNew={false}
        // onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        setSearchModalOpen={setSearchModalOpen}
        modalOpen={searchModalOpen}
        branchData={branchData?.listAllBranch}
      />
    </>
  );
};

export default ManualJournals;
