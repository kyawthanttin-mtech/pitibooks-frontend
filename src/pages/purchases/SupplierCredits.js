import React, { useState } from "react";
import {
  Button,
  Space,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Modal,
  Form,
  Dropdown,
  Divider,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  CaretRightFilled,
  FilePdfOutlined,
  CaretDownFilled,
  PaperClipOutlined,
  CloseOutlined,
  EditOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ReactComponent as ArrowEllipseFilled } from "../../assets/icons/ArrowEllipseFilled.svg";
import { PaginatedSelectionTable } from "../../components";
import { useNavigate, useLocation } from "react-router-dom";
import { SupplierCreditQueries, SupplierMutations } from "../../graphql";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useHistoryState } from "../../utils/HelperFunctions";
const { GET_PAGINATE_SUPPLIER_CREDIT } = SupplierCreditQueries;

const SupplierCredits = () => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const { notiApi } = useOutletContext();
  const navigate = useNavigate();
  const [searchFormRef] = Form.useForm();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const location = useLocation();
  const [searchCriteria, setSearchCriteria] = useHistoryState(
    "searchCriteria",
    null
  );
  const [activeTab, setActiveTab] = useState("bill");
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);

  const parseData = (data) => {
    let bills = [];
    data?.paginateSupplierCredit?.edges.forEach(({ node }) => {
      bills.push({
        key: node.id,
        branchName: node.branch?.name,
        supplierName: node.supplier?.name,
        ...node,
      });
    });
    return bills ? bills : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateSupplierCredit) {
      pageInfo = {
        hasNextPage: data.paginateSupplierCredit.pageInfo.hasNextPage,
        endCursor: data.paginateSupplierCredit.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "supplierCreditDate",
      key: "supplierCreditDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Credit Note #",
      dataIndex: "supplierCreditNumber",
      key: "supplierCreditNumber",
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
      dataIndex: "currentStatus",
      key: "currentStatus",
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "supplierCreditTotalAmount",
      key: "supplierCreditTotalAmount",
      render: (text, record) => (
        <>
          {record.currency?.symbol} {text}
        </>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
    },
  ];

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
                {record.currency.symbol} {record.supplierCreditTotalAmount}
              </span>
            </div>
            <div className="column-list-item">
              <span>
                <span style={{ color: "var(--dark-green)" }}>
                  {record.supplierCreditNumber}
                </span>
                <Divider type="vertical" />
                {dayjs(record.supplierCreditDate).format(REPORT_DATE_FORMAT)}
              </span>
              <span
                style={{
                  color:
                    record.bill?.currentStatus === "Draft"
                      ? "gray"
                      : "var(--primary-color)",
                }}
              >
                {record.currentStatus}
              </span>
            </div>
          </div>
        );
      },
    },
  ];

  const billTableColumns = [
    {
      title: "#Bill",
      dataIndex: "billNumber",
      key: "billNumber",
    },
    {
      title: "Date",
      dataIndex: "billDate",
      key: "billDate",
      render: (text) => <> {dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Amount Credited",
      dataIndex: "billTotalAmount",
      key: "billTotalAmount",
    },
  ];

  const toggleContent = () => {
    setContentExpanded(!isContentExpanded);
    setCaretRotation(caretRotation === 0 ? 90 : 0);
  };

  return (
    <div className={`${selectedRecord && "page-with-column"}`}>
      <div>
        <div className="page-header">
          <p className="page-header-text">Supplier Credits</p>
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
            gqlQuery={GET_PAGINATE_SUPPLIER_CREDIT}
            // searchForm={searchForm}
            searchFormRef={searchFormRef}
            searchQqlQuery={GET_PAGINATE_SUPPLIER_CREDIT}
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
          />
        </div>
      </div>
      {selectedRecord && (
        <div className="content-column">
          <Row className="content-column-header-row">
            <div className="content-column-header-row-text content-column-header-row-text">
              <span>Branch: {selectedRecord.branch?.name}</span>
              <span>{selectedRecord.supplierCreditNumber}</span>
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
                    <span>Bills Credited</span>
                    <span className="bill">1</span>
                  </li>
                </ul>
                <CaretRightFilled
                  style={{
                    transform: `rotate(${caretRotation}deg)`,
                    transition: "0.4s",
                  }}
                />
              </div>

              <div className={`content-wrapper ${isContentExpanded && "show"}`}>
                {activeTab === "bill" && (
                  <div className="bill-tab">
                    <Table
                      className="bill-table"
                      columns={billTableColumns}
                      dataSource={[selectedRecord.bill]}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierCredits;
