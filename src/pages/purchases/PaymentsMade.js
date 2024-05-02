import React, { useState } from "react";
import "./PurchaseOrders.css";

import {
  Space,
  Button,
  Table,
  Row,
  Dropdown,
  Divider,
  Modal,
  Col,
  Form,
  Input,
  Select,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  PaperClipOutlined,
  CloseOutlined,
  EditOutlined,
  FilePdfOutlined,
  CaretDownFilled,
  PrinterOutlined,
  CaretRightFilled,
} from "@ant-design/icons";
import {
  PaginatedSelectionTable,
  PurchaseOrderTemplate,
} from "../../components";
import { FormattedMessage } from "react-intl";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { PurchaseOrderQueries } from "../../graphql";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
const { GET_PAGINATE_PURCHASE_ORDER } = PurchaseOrderQueries;

const compactColumns = [
  {
    title: "",
    dataIndex: "column",
    render: (text, record) => {
      return (
        <div>
          <div className="column-list-item">
            <span>{record.supplierName}</span>
            <span>
              {record.currency.symbol}
              {record.orderTotalAmount}
            </span>
          </div>
          <div className="column-list-item">
            <span>
              <span style={{ color: "var(--dark-green)" }}>
                {record.orderNumber}
              </span>
              <Divider type="vertical" />
              {dayjs(record.orderDate).format(REPORT_DATE_FORMAT)}
            </span>
            <span>{record.status}</span>
          </div>
        </div>
      );
    },
  },
];

const billTableColumns = [
  {
    title: "#Bill",
    dataIndex: "bill",
    key: "bill",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "dueDate",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Balance Due",
    dataIndex: "balanceDue",
    key: "balanceDue",
  },
];

const PaymentsMade = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("bill");
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const [POSearchModalOpen, setPOSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notiApi } = useOutletContext();

  const parseData = (data) => {
    let purchaseOrders = [];
    data?.paginatePurchaseOrder?.edges.forEach(({ node }) => {
      if (node != null) {
        purchaseOrders.push({
          key: node.id,
          ...node,
          branchName: node.branch?.name,
          supplierName: node.supplier?.name,
          status: node.bills?.currentStatus,
        });
      }
    });
    return purchaseOrders ? purchaseOrders : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginatePurchaseOrder) {
      pageInfo = {
        hasNextPage: data.paginatePurchaseOrder.pageInfo.hasNextPage,
        endCursor: data.paginatePurchaseOrder.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const toggleContent = () => {
    setContentExpanded(!isContentExpanded);
    setCaretRotation(caretRotation === 0 ? 90 : 0);
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },

    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: (
        <FormattedMessage
          id="label.purchaseOrderNumber"
          defaultMessage="Purchase Order #"
        />
      ),
      dataIndex: "orderNumber",
      key: "orderNumber",
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
      title: (
        <FormattedMessage
          id="label.supplierName"
          defaultMessage="Supplier Name"
        />
      ),
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: <FormattedMessage id="label.status" defaultMessage="Status" />,
      dataIndex: "status",
      key: "status",
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "orderTotalAmount",
      key: "orderTotalAmount",
    },
    {
      title: (
        <FormattedMessage
          id="label.expectedDeliverDate"
          defaultMessage="Expected Delivery Date"
        />
      ),
      dataIndex: "expectedDeliveryDate",
      key: "expectedDeliveryDate",
    },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          onClick={() => setPOSearchModalOpen(true)}
        />
      ),
      dataIndex: "search",
      key: "search",
    },
  ];

  const searchForm = (
    <Form>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Purchase Receive#"
            name="purchaseOrder"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col lg={12}>
          <Form.Item
            label="Purchase Order#"
            name="purchaseOrder"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Receive Date"
            name="receiveDate"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Input></Input>
          </Form.Item>
        </Col>
        <Col lg={12}>
          <Form.Item
            label="Status"
            name="status"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Select></Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <Form.Item
            label="Vendor"
            name="vendor"
            labelAlign="left"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
          >
            <Select></Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      <Modal
        width="60.625rem"
        open={POSearchModalOpen}
        onCancel={() => setPOSearchModalOpen(false)}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        title="Search"
      >
        {searchForm}
      </Modal>
      <Modal
        width="60.625rem"
        open={POSearchModalOpen}
        onCancel={() => setPOSearchModalOpen(false)}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        title="Create Purchase Order"
      >
        {searchForm}
      </Modal>

      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <div className="page-header-text">Purchase Orders</div>
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
                  <FormattedMessage id="button.new" defaultMessage="new" />
                )}
              </Button>
              <Button icon={<MoreOutlined />}></Button>
            </Space>
          </div>
          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            <PaginatedSelectionTable
              // loading={loading}
              api={notiApi}
              columns={columns}
              compactColumns={compactColumns}
              gqlQuery={GET_PAGINATE_PURCHASE_ORDER}
              showSearch={false}
              // searchForm={searchForm}
              // searchFormRef={searchFormRef}
              searchQqlQuery={GET_PAGINATE_PURCHASE_ORDER}
              parseData={parseData}
              parsePageInfo={parsePageInfo}
              showAddNew={true}
              // searchModalOpen={searchModalOpen}
              // setSearchModalOpen={setSearchModalOpen}
              selectedRecord={selectedRecord}
              setSelectedRecord={setSelectedRecord}
              setSelectedRowIndex={setSelectedRowIndex}
              selectedRowIndex={selectedRowIndex}
              setCreateModalOpen={setPOSearchModalOpen}
            />
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branchName}</span>
                <span>{selectedRecord.orderNumber}</span>
              </div>
              <div className="content-column-header-row-actions">
                <div>
                  <PaperClipOutlined />
                  <span>Attachment</span>
                </div>
                <div>
                  <Button
                    icon={<CloseOutlined />}
                    type="text"
                    onClick={() => {
                      setSelectedRecord(null);
                      setSelectedRowIndex(0);
                    }}
                  />
                </div>
              </div>
            </Row>
            <Row className="content-column-action-row">
              <div className="actions">
                <EditOutlined />
                Edit
              </div>
              <Dropdown
                menu={{
                  items: [
                    {
                      icon: <FilePdfOutlined />,
                      key: "0",
                    },
                    {
                      icon: <PrinterOutlined />,
                      key: "1",
                    },
                  ],
                }}
                trigger={["click"]}
              >
                <div>
                  <FilePdfOutlined />
                  PDF/Print <CaretDownFilled />
                </div>
              </Dropdown>
              <div>
                <MoreOutlined />
              </div>
            </Row>
            <div className="content-column-full-row">
              <div className="bill-receives-container">
                <div
                  className={`nav-bar ${!isContentExpanded && "collapsed"}`}
                  onClick={toggleContent}
                >
                  <ul className="nav-tabs">
                    <li
                      className={`nav-link ${
                        activeTab === "bill" && isContentExpanded && "active"
                      }`}
                      onClick={(event) => {
                        setActiveTab("bill");
                        isContentExpanded && event.stopPropagation();
                      }}
                    >
                      <span>Bill</span>
                      <span className="bill">1</span>
                    </li>
                    <Divider type="vertical" className="tab-divider" />
                    <li
                      className={`nav-link ${
                        activeTab === "receives" &&
                        isContentExpanded &&
                        "active"
                      }`}
                      onClick={(event) => {
                        setActiveTab("receives");
                        isContentExpanded && event.stopPropagation();
                      }}
                    >
                      <span>Receives</span>
                    </li>
                  </ul>
                  <CaretRightFilled
                    style={{
                      transform: `rotate(${caretRotation}deg)`,
                      transition: "0.4s",
                    }}
                  />
                </div>

                <div
                  className={`content-wrapper ${isContentExpanded && "show"}`}
                >
                  {activeTab === "bill" && (
                    <div className="bill-tab">
                      <Table
                        className="bill-table"
                        columns={billTableColumns}
                        dataSource={[selectedRecord]}
                        pagination={false}
                      />
                    </div>
                  )}
                  {activeTab === "receives" && (
                    <div className="receive-tab">
                      <Space>
                        <span>No items have been received yet!</span>
                        <span>
                          <a>New Purchase Receive</a>
                        </span>
                      </Space>
                    </div>
                  )}
                </div>
              </div>
              <div className="toggle-pdf-view">
                <div>
                  <span>Bill Status: </span>
                  <span style={{ color: "var(--primary-color)" }}>BILLED</span>
                </div>
              </div>
              <PurchaseOrderTemplate selectedRecord={selectedRecord} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentsMade;
