import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  Tabs,
  Flex,
  Dropdown,
  Button,
  Space,
  Divider,
  Table,
  Skeleton,
  Timeline,
} from "antd";
import {
  CloseOutlined,
  CaretDownOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  PhoneOutlined,
  MobileOutlined,
  MailOutlined,
  MessageOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  PaginatedSelectionTable,
  SearchCriteriaDisplay,
} from "../../components";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CustomerQueries,
  CustomerMutations,
  CommentQueries,
  CommentMutations,
} from "../../graphql";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { ReactComponent as UserThumbnail } from "../../assets/icons/UserThumbnail.svg";
import { useMutation, useQuery } from "@apollo/client";
import { useHistoryState } from "../../utils/HelperFunctions";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import dayjs from "dayjs";
const { CREATE_COMMENT, DELETE_COMMENT } = CommentMutations;
const { GET_COMMENTS } = CommentQueries;

const { GET_PAGINATE_CUSTOMER } = CustomerQueries;
const { DELETE_CUSTOMER } = CustomerMutations;

const Customers = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const { notiApi, msgApi } = useOutletContext();
  const navigate = useNavigate();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "customerSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "customerCurrentPage",
    1
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [value, setValue] = useState("");

  // Queries
  const {
    data: cmtData,
    loading: cmtLoading,
    refetch: cmtRefetch,
  } = useQuery(GET_COMMENTS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      referenceId: selectedRecord?.id,
      referenceType: "customers",
    },
    onError: (err) => openErrorNotification(notiApi, err.message),
    skip: !selectedRecord && activeTab !== "comments",
  });

  useEffect(() => {
    if (selectedRecord && activeTab === "comments") {
      cmtRefetch();
    }
  }, [activeTab, cmtRefetch, selectedRecord]);

  // Mutations
  const [createComment, { loading: createCmtLoading }] = useMutation(
    CREATE_COMMENT,
    {
      refetchQueries: [GET_COMMENTS],
    }
  );

  const [deleteComment, { loading: deleteCmtLoading }] = useMutation(
    DELETE_COMMENT,
    {
      refetchQueries: [GET_COMMENTS],
    }
  );
  const [deleteCustomer, { loading: deleteLoading }] = useMutation(
    DELETE_CUSTOMER,

    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="customer.deleted"
            defaultMessage="Customer Deleted"
          />
        );
        setSelectedRecord(null);
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update(cache, { data }) {
        const existingCustomers = cache.readQuery({
          query: GET_PAGINATE_CUSTOMER,
        });
        const updatedCustomers =
          existingCustomers.paginateCustomer.edges.filter(
            ({ node }) => node.id !== data.deleteCustomer.id
          );
        cache.writeQuery({
          query: GET_PAGINATE_CUSTOMER,
          data: {
            paginateCustomer: {
              ...existingCustomers.paginateCustomer,
              edges: updatedCustomers,
            },
          },
        });
      },
    }
  );

  const loading = deleteLoading;

  const comments = useMemo(() => cmtData?.listComment || [], [cmtData]);

  const parseData = (data) => {
    let customers = [];
    data?.paginateCustomer?.edges.forEach(({ node }) => {
      if (node != null) {
        customers.push({
          key: node.id,
          ...node,
        });
      }
    });
    // console.log("Products", products);
    return customers ? customers : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateProduct) {
      pageInfo = {
        hasNextPage: data.paginateProduct.pageInfo.hasNextPage,
        endCursor: data.paginateProduct.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const handleEdit = (record, navigate, location) => {
    // console.log("edit record", record);
    navigate("edit", {
      state: {
        ...location.state,
        from: { pathname: location.pathname },
        record,
      },
    });
  };

  const handleDelete = async (id) => {
    console.log(id);
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
        await deleteCustomer({
          variables: {
            id: id,
          },
        });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
  };

  const handleToggleActive = () => {};

  const handleModalClear = () => {
    setSearchCriteria(null);
    searchFormRef.resetFields();
    setSearchModalOpen(false);

    // clear the state from location.state
    navigate(location.pathname, {
      state: {
        ...location.state,
        customerSearchCriteria: undefined,
      },
      replace: true,
    });
  };

  const stripHtml = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmitCmt = () => {
    try {
      createComment({
        variables: {
          input: {
            description: value,
            referenceId: selectedRecord?.id,
            referenceType: "customers",
          },
        },
      });
      setValue("");
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleDeleteCmt = async (id) => {
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
        await deleteComment({ variables: { id } });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
    try {
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const isInputEmpty = (input) => stripHtml(input).trim().length === 0;

  const searchForm = (
    <Form form={searchFormRef}>
      <Row>
        <Col span={12}>
          <Form.Item
            label={<FormattedMessage id="label.name" defaultMessage="Name" />}
            name="name"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<FormattedMessage id="label.email" defaultMessage="Email" />}
            name="email"
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
            label={<FormattedMessage id="label.phone" defaultMessage="Phone" />}
            name="phone"
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
              <FormattedMessage id="label.mobile" defaultMessage="Mobile" />
            }
            name="mobile"
            labelAlign="left"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const columns = [
    {
      title: <FormattedMessage id="label.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
    },
    {
      title: <FormattedMessage id="label.email" defaultMessage="Email" />,
      dataIndex: "email",
      key: "email",
    },
    {
      title: <FormattedMessage id="label.phone" defaultMessage="Phone" />,
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: <FormattedMessage id="label.mobile" defaultMessage="Mobile" />,
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: <FormattedMessage id="label.payable" defaultMessage="Payable" />,
      dataIndex: "payable",
      key: "payable",
    },
    {
      title: (
        <FormattedMessage
          id="label.customerCredits"
          defaultMessage="Customer Credits"
        />
      ),
      dataIndex: "usedCredits",
      key: "usedCredits",
    },
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
  const compactColumns = [
    {
      title: "",
      key: "column",
      render: (text, record) => {
        return (
          <div>
            <div className="column- -item">
              <span>{record.name}</span>
            </div>
            <div className="column-list-item">
              <span style={{ color: "var(--dark-green)" }}>
                {record.currency.symbol} {record.prepaidCreditAmount}
              </span>
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className={`${selectedRecord && "page-with-column"}`}>
      {contextHolder}
      <div>
        <div className="page-header">
          <p className="page-header-text">Customers</p>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate("new", {
                  state: {
                    ...location.state,
                    from: { pathname: location.pathname },
                  },
                })
              }
            >
              {!selectedRecord && (
                <span>
                  <FormattedMessage id="button.new" defaultMessage="New" />
                </span>
              )}
            </Button>
            <Button icon={<MoreOutlined />}></Button>
          </Space>
        </div>
        <div className={`page-content ${selectedRecord && "column-width2"}`}>
          {searchCriteria && (
            <SearchCriteriaDisplay
              searchCriteria={searchCriteria}
              handleModalClear={handleModalClear}
            >
              {searchCriteria.name && (
                <li>
                  Customer Name includes <b>{searchCriteria.name}</b>
                </li>
              )}
              {searchCriteria.email && (
                <li>
                  Email contains <b>{searchCriteria.email}</b>
                </li>
              )}
              {searchCriteria.phone && (
                <li>
                  Phone contains <b>{searchCriteria.phone}</b>
                </li>
              )}
              {searchCriteria.mobile && (
                <li>
                  Mobile contains <b>{searchCriteria.mobile}</b>
                </li>
              )}
            </SearchCriteriaDisplay>
          )}
          <PaginatedSelectionTable
            loading={loading}
            api={notiApi}
            columns={columns}
            gqlQuery={GET_PAGINATE_CUSTOMER}
            searchForm={searchForm}
            searchTitle={
              <FormattedMessage
                id="customer.search"
                defaultMessage="Search Customers"
              />
            }
            searchFormRef={searchFormRef}
            searchQqlQuery={GET_PAGINATE_CUSTOMER}
            parseData={parseData}
            parsePageInfo={parsePageInfo}
            showAddNew={true}
            searchModalOpen={searchModalOpen}
            setSearchModalOpen={setSearchModalOpen}
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            setSelectedRowIndex={setSelectedRowIndex}
            selectedRowIndex={selectedRowIndex}
            compactColumns={compactColumns}
            searchCriteria={searchCriteria}
            setSearchCriteria={setSearchCriteria}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
      {selectedRecord && (
        <div className="content-column">
          <Flex className="content-column-header-row product-details-header-row">
            <p className="page-header-text">{selectedRecord.name}</p>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => handleEdit(selectedRecord, navigate, location)}
              ></Button>
              <Button
                type="primary"
                // onClick={() => setShowAdjustmentForm(true)}
              >
                New Transaction
              </Button>
              <Button>
                <Dropdown
                  trigger="click"
                  key={selectedRecord.key}
                  menu={{
                    onClick: ({ key }) => {
                      if (key === "1") console.log("clone");
                      else if (key === "2") handleToggleActive(selectedRecord);
                      else if (key === "3") handleDelete(selectedRecord.id);
                    },
                    items: [
                      {
                        label: (
                          <FormattedMessage
                            id="button.cloneItem"
                            defaultMessage="Clone Item"
                          />
                        ),
                        key: "1",
                      },
                      {
                        label: !selectedRecord.isActive ? (
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
                  <div style={{ height: "2rem" }}>
                    More <CaretDownOutlined />
                  </div>
                </Dropdown>
              </Button>

              <Button
                icon={<CloseOutlined />}
                type="text"
                onClick={() => {
                  setSelectedRecord(null);
                  setSelectedRowIndex(0);
                }}
              />
            </Space>
          </Flex>
          <div></div>
          <div
            className="content-column-full-row product-details-content-column-full-row"
            style={{ paddingTop: 0 }}
          >
            <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
              <Tabs.TabPane tab="Overview" key="overview">
                <Flex align="center" style={{ padding: "1.5rem 0" }}>
                  <Space size="middle">
                    <UserThumbnail />
                    {/* <Avatar size={57} icon={<UserOutlined />} /> */}
                    <Flex vertical gap="0.5rem" justify="center">
                      <span>{selectedRecord.name}</span>
                      <div>
                        <Space>
                          <PhoneOutlined />
                          {selectedRecord.phone}
                        </Space>
                        <Divider type="vertical" />
                        {selectedRecord.mobile && (
                          <>
                            <Space>
                              <MobileOutlined />
                              {selectedRecord.phone}
                            </Space>
                            <Divider type="vertical" />
                          </>
                        )}
                        <Space>
                          <MailOutlined />
                          {selectedRecord.email}
                        </Space>
                      </div>
                    </Flex>
                  </Space>
                </Flex>

                <Table
                  className="table-variant"
                  pagination={false}
                  dataSource={[{ key: 1 }]}
                  columns={[
                    {
                      title: "Currency",
                      dataIndex: "currency",
                      key: "currency",
                      render: (_) => (
                        <>
                          {selectedRecord.currency.symbol}{" "}
                          {selectedRecord.currency.name}
                        </>
                      ),
                    },
                    {
                      title: "Outstanding Payables",
                      dataIndex: "payables",
                      key: "payables",
                      render: (text) => (
                        <>
                          {selectedRecord.currency.symbol}{" "}
                          {selectedRecord.prepaidCreditAmount}
                        </>
                      ),
                    },
                    {
                      title: "Unused Credits",
                      dataIndex: "unusedCredits",
                      key: "unusedCredits",
                      render: (text) => (
                        <>
                          {selectedRecord.currency.symbol}{" "}
                          {selectedRecord.unusedCreditAmount}
                        </>
                      ),
                    },
                  ]}
                />
                <Row style={{ marginTop: "2.5rem" }}>
                  <Col span={6}>
                    <span style={{ fontSize: "var(--big-text)" }}>ADDRESS</span>
                  </Col>
                  <Col>
                    <span style={{ fontSize: "var(--big-text)" }}>
                      Billing Address
                    </span>
                    <br />
                    <Flex
                      vertical
                      style={{
                        fontSize: "var(--small-text)",
                        color: "var(--text-color)",
                        opacity: "70%",
                      }}
                    >
                      <span>{selectedRecord.billingAddress?.address}</span>
                      <span>{selectedRecord.billingAddress?.city}</span>
                      <span>{selectedRecord.billingAddress?.country}</span>
                      <span>Phone :{selectedRecord.phone}</span>
                    </Flex>
                    <br />
                    <span
                      style={{
                        fontSize: "var(--big-text)",
                      }}
                    >
                      Shipping Address
                    </span>
                    <br />
                    <Flex
                      vertical
                      style={{
                        fontSize: "var(--small-text)",
                        color: "var(--text-color)",
                        opacity: "70%",
                      }}
                    >
                      <span>{selectedRecord.shippingAddress?.address}</span>
                      <span>{selectedRecord.shippingAddress?.city}</span>
                      <span>{selectedRecord.shippingAddress?.country}</span>
                      <span>Phone :{selectedRecord.phone}</span>
                    </Flex>
                  </Col>
                </Row>
                <Row style={{ marginTop: "2.5rem" }}>
                  <Col span={6}>
                    <span style={{ fontSize: "var(--big-text)" }}>
                      OTHER DETAILS
                    </span>
                  </Col>
                  <Col>
                    <table>
                      <tbody>
                        <tr
                          style={{
                            fontSize: "var(--small-text)",
                            color: "var(--text-color)",
                          }}
                        >
                          <td style={{ paddingRight: "2.5rem" }}>
                            <span style={{ opacity: "70%" }}>
                              Default Currency
                            </span>
                          </td>
                          <td>{selectedRecord.currency.symbol}</td>
                        </tr>
                        <tr
                          style={{
                            fontSize: "var(--small-text)",
                            color: "var(--text-color)",
                          }}
                        >
                          <td style={{ paddingRight: "2.5rem" }}>
                            <span style={{ opacity: "70%" }}>
                              Payment Terms
                            </span>
                          </td>
                          <td>
                            {selectedRecord.customerPaymentTerms
                              .split(/(?=[A-Z])/)
                              .join(" ") === "Custom"
                              ? `${selectedRecord.customerPaymentTerms} (Due in ${selectedRecord.customerPaymentTermsCustomDays}day(s))`
                              : selectedRecord.customerPaymentTerms
                                  .split(/(?=[A-Z])/)
                                  .join(" ")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Col>
                </Row>
                <Row style={{ marginTop: "2.5rem" }}>
                  <Col span={6}>
                    <span style={{ fontSize: "var(--big-text)" }}>
                      CONTACT PERSONS
                    </span>
                  </Col>
                  <Col>
                    {selectedRecord.contactPersons?.map((cp) => (
                      <>
                        <table key={cp.id}>
                          <tbody>
                            <tr
                              style={{
                                fontSize: "var(--small-text)",
                                color: "var(--text-color)",
                              }}
                            >
                              <td style={{ paddingRight: "6rem" }}>
                                <span style={{ opacity: "70%" }}>Name</span>
                              </td>
                              <td>{cp.name}</td>
                            </tr>
                            <tr
                              style={{
                                fontSize: "var(--small-text)",
                                color: "var(--text-color)",
                              }}
                            >
                              <td style={{ paddingRight: "2.5rem" }}>
                                <span style={{ opacity: "70%" }}>Email</span>
                              </td>
                              <td>{cp.email}</td>
                            </tr>
                            <tr
                              style={{
                                fontSize: "var(--small-text)",
                                color: "var(--text-color)",
                              }}
                            >
                              <td style={{ paddingRight: "2.5rem" }}>
                                <span style={{ opacity: "70%" }}>
                                  Phone/Mobile
                                </span>
                              </td>
                              <td>
                                {cp.phone} {cp.mobile && `/ ${cp.mobile}`}
                              </td>
                            </tr>

                            <tr
                              style={{
                                fontSize: "var(--small-text)",
                                color: "var(--text-color)",
                              }}
                            >
                              <td style={{ paddingRight: "2.5rem" }}>
                                <span style={{ opacity: "70%" }}>
                                  Designation
                                </span>
                              </td>
                              <td>{cp.designation}</td>
                            </tr>
                            <tr
                              style={{
                                fontSize: "var(--small-text)",
                                color: "var(--text-color)",
                              }}
                            >
                              <td style={{ paddingRight: "2.5rem" }}>
                                <span style={{ opacity: "70%" }}>
                                  Department
                                </span>
                              </td>
                              <td>{cp.department}</td>
                            </tr>
                          </tbody>
                        </table>
                        <br />
                      </>
                    ))}
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Comments" key="comments">
                {" "}
                <div style={{ width: "60%" }}>
                  <div style={{ paddingTop: "1rem" }}>
                    <ReactQuill
                      value={value}
                      onChange={setValue}
                      modules={{
                        toolbar: [["bold", "italic", "underline"]],
                      }}
                      theme="snow"
                      placeholder="Write your comment here..."
                    />
                    <div style={{ marginTop: "0.5rem" }}>
                      <Button
                        type="primary"
                        onClick={handleSubmitCmt}
                        disabled={isInputEmpty(value)}
                        loading={createCmtLoading}
                      >
                        <FormattedMessage
                          id="button.addComment"
                          defaultMessage="Add Comment"
                        />
                      </Button>
                    </div>
                  </div>
                  {cmtLoading ? (
                    <Skeleton active />
                  ) : comments?.length > 0 ? (
                    <div style={{ marginLeft: "0.5rem", marginTop: "1.5rem" }}>
                      <Timeline>
                        {comments?.map((item) => (
                          <Timeline.Item
                            key={item.id}
                            dot={
                              <div className="circle-box">
                                <span>
                                  <MessageOutlined />
                                </span>
                              </div>
                            }
                          >
                            <Flex
                              gap="0.25rem"
                              align="center"
                              className="cmt-username"
                            >
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(item.userName),
                                }}
                              ></div>
                              <span style={{ opacity: "70%" }}>
                                <b>•</b>
                              </span>
                              <span
                                style={{
                                  fontSize: "0.688rem",
                                  opacity: "70%",
                                  letterSpacing: ".2px",
                                  fontWeight: 500,
                                }}
                              >
                                {dayjs(item.createdAt).format(
                                  REPORT_DATE_FORMAT + " h:mm A"
                                )}
                              </span>
                            </Flex>
                            <Flex
                              justify="space-between"
                              className="cmt-box"
                              gap="1rem"
                            >
                              <div
                                className="cmt-description"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(item.description),
                                }}
                              ></div>

                              <span onClick={() => handleDeleteCmt(item.id)}>
                                {deleteCmtLoading ? (
                                  <LoadingOutlined />
                                ) : (
                                  <DeleteOutlined />
                                )}
                              </span>
                            </Flex>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  ) : (
                    <Flex
                      justify="center"
                      align="center"
                      style={{ padding: "1rem" }}
                    >
                      No comment yet!
                    </Flex>
                  )}
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane
                tab="Transactions"
                key="transactions"
              ></Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
