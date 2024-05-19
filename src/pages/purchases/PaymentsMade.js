import React, { useState } from "react";
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
import { useHistoryState } from "../../utils/HelperFunctions";
import { PaginatedSelectionTable, PaymentMadeTemplate } from "../../components";
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

const PaymentsMade = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [POSearchModalOpen, setPOSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notiApi } = useOutletContext();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "supplierPaymentSearchCriteria",
    null
  );
  const [currentPage, setCurrentPage] = useHistoryState(
    "supplierPaymentCurrentPage",
    1
  );

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
        <FormattedMessage id="label.paymentNumber" defaultMessage="Payment #" />
      ),
      dataIndex: "paymentNumber",
      key: "paymentNumber",
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
      title: <FormattedMessage id="label.mode" defaultMessage="Mode" />,
      dataIndex: "mode",
      key: "mode",
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "orderTotalAmount",
      key: "orderTotalAmount",
    },
    {
      title: (
        <FormattedMessage
          id="label.unusedAmount"
          defaultMessage="Unused Amount"
        />
      ),
      dataIndex: "unusedAmount",
      key: "unusedAmount",
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
            <div className="page-header-text">
              <FormattedMessage
                id="label.paymentsMade"
                defaultMessage="Payments Made"
              />
            </div>
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
              searchCriteria={searchCriteria}
              setSearchCriteria={setSearchCriteria}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
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
              <PaymentMadeTemplate selectedRecord={selectedRecord} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentsMade;
