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
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
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
import { SupplierQueries, SupplierMutations } from "../../graphql";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  openErrorNotification,
  openSuccessNotification,
} from "../../utils/Notification";
import moment from "moment";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { useMutation } from "@apollo/client";
import { useHistoryState } from "../../utils/HelperFunctions";
import { BillQueries } from "../../graphql";
import { render } from "@testing-library/react";
const { GET_PAGINATE_BILL } = BillQueries;

const Bills = () => {
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

  const parseData = (data) => {
    let bills = [];
    data?.paginateBill?.edges.forEach(({ node }) => {
      if (node != null) {
        let status = "";
        const currentDate = moment();
        const dueDate = moment(node.billDueDate);
        const totalPaidAmount = node.billTotalPaidAmount;
        const totalAmount = node.billTotalAmount;

        if (totalPaidAmount < totalAmount) {
          const daysLeft = dueDate.diff(currentDate, "days");
          status =
            daysLeft > 0
              ? `Overdue By ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
              : "Overdue";
        } else if (totalPaidAmount === totalAmount) {
          status = "Paid";
        }

        bills.push({
          key: node.id,
          ...node,
          status: status,
        });
      }
    });
    return bills ? bills : [];
  };

  const parsePageInfo = (data) => {
    let pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      endCursor: null,
    };
    if (data?.paginateBill) {
      pageInfo = {
        hasNextPage: data.paginateBill.pageInfo.hasNextPage,
        endCursor: data.paginateBill.pageInfo.endCursor,
      };
    }

    return pageInfo;
  };

  const compactColumns = [
    {
      title: "",
      dataIndex: "column",
      render: (text, record) => {
        return (
          <div>
            <div className="column-list-item">
              <span>Placeholder</span>
              <span>
                {record.currency.symbol} {record.billTotalAmount}
              </span>
            </div>
            <div className="column-list-item">
              <span style={{ color: "var(--dark-green)" }}>
                {dayjs(record.billDate).format(REPORT_DATE_FORMAT)}
              </span>
              <span>{record.referenceNumber}</span>
            </div>
          </div>
        );
      },
    },
  ];

  const columns = [
    {
      title: "Date",
      dataIndex: "billDate",
      key: "billDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Bill#",
      dataIndex: "billNumber",
      key: "billNumber",
    },
    {
      title: "Reference Number",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color = "";

        if (text === "Paid") {
          color = "var(--dark-green)";
        } else if (text === "Overdue") {
          color = "var(--red)";
        } else {
          color = "var(--orange)";
        }

        return <span style={{ color: color }}>{text}</span>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "billDueDate",
      key: "billDueDate",
      render: (text) => <>{dayjs(text).format(REPORT_DATE_FORMAT)}</>,
    },
    {
      title: "Amount",
      dataIndex: "billTotalAmount",
      key: "billTotalAmount",
      render: (text, record) => (
        <>
          {record.currency.symbol} {text}
        </>
      ),
    },
    {
      title: "Balance Due",
      dataIndex: "balanceDue",
      key: "balanceDue",
    },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          // onClick={() => setPOSearchModalOpen(true)}
        />
      ),
      dataIndex: "search",
      key: "search",
    },
  ];

  return (
    <div className={`${selectedRecord && "page-with-column"}`}>
      {contextHolder}
      <div>
        <div className="page-header">
          <p className="page-header-text">Bills</p>
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
          {!selectedRecord && (
            <Row gutter={16} style={{ padding: "1.5rem 1rem", margin: 0 }}>
              <Col span={6}>
                <Card
                  style={{
                    background: "rgba(89, 166, 53, 0.10)",
                    height: "6.5rem",
                  }}
                >
                  <ArrowEllipseFilled />
                  <Statistic
                    title="Total Outstanding Payables"
                    value={7954655}
                    prefix="MMK"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  style={{
                    background: "rgba(255, 176, 1, 0.10)",
                    height: "6.5rem",
                  }}
                >
                  <Statistic
                    title="Due Today"
                    value={0}
                    precision={2}
                    prefix="MMK"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  style={{
                    background: "rgba(64, 141, 251, 0.10)",
                    height: "6.5rem",
                  }}
                >
                  <Statistic
                    title="Due Within 30 Days"
                    value={0}
                    precision={2}
                    prefix="MMK"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  style={{
                    background: "rgba(247, 104, 49, 0.10)",
                    height: "6.5rem",
                  }}
                >
                  <Statistic
                    title="OverDue Bills"
                    value={7954655}
                    precision={2}
                    prefix="MMK"
                  />
                </Card>
              </Col>
            </Row>
          )}
          <PaginatedSelectionTable
            // loading={loading}
            api={notiApi}
            columns={columns}
            gqlQuery={GET_PAGINATE_BILL}
            // searchForm={searchForm}
            searchFormRef={searchFormRef}
            searchQqlQuery={GET_PAGINATE_BILL}
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
            <p className="page-header-text">{selectedRecord.journalNumber}</p>
            <div className="content-column-header-row-actions">
              <div>
                <PaperClipOutlined />
                <span>
                  <FormattedMessage
                    id="button.attachment"
                    defaultMessage="Attachment"
                  />
                </span>
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
            <div
              className="actions"
              // onClick={() => onEdit(selectedRecord, navigate, location)}
            >
              <EditOutlined />
              <FormattedMessage id="button.edit" defaultMessage="Edit" />
            </div>
            <Dropdown
              menu={{
                items: [
                  {
                    // label: (
                    //   <PDFDownloadLink
                    //     document={
                    //       <InvoicePDF selectedRecord={selectedRecord} />
                    //     }
                    //     fileName={selectedRecord.invoice}
                    //   >
                    //     PDF
                    //   </PDFDownloadLink>
                    // ),
                    icon: <FilePdfOutlined />,
                    key: "0",
                  },
                  {
                    // label: (
                    //   <BlobProvider
                    //     document={
                    //       <InvoicePDF selectedRecord={selectedRecord} />
                    //     }
                    //   >
                    //     {({ url, blob }) => (
                    //       <a href={url} target="_blank" rel="noreferrer">
                    //         Print
                    //       </a>
                    //     )}
                    //   </BlobProvider>
                    // ),
                    icon: <PrinterOutlined />,
                    key: "1",
                  },
                ],
              }}
              trigger={["click"]}
            >
              <div>
                <FilePdfOutlined />
                <FormattedMessage
                  id="button.pdf/print"
                  defaultMessage="PDF/Print"
                />
                <CaretDownFilled />
              </div>
            </Dropdown>
            <div>
              <Dropdown
                // loading={loading}
                trigger="click"
                // key={record.key}
                menu={{
                  onClick: ({ key }) => {
                    if (key === "1") console.log("Clone");
                    else if (key === "2") {
                      // if (handleDelete(selectedRecord.id)) setSelectedRecord(null);
                    }
                  },
                  items: [
                    {
                      label: "Clone",
                      key: "1",
                    },
                    {
                      label: (
                        <FormattedMessage
                          id="button.delete"
                          defaultMessage="Delete"
                        />
                      ),
                      key: "2",
                    },
                  ],
                }}
              >
                <MoreOutlined />
              </Dropdown>
            </div>
          </Row>
          <Row className="content-column-full-row">
            {/* <JournalTemplate selectedRecord={selectedRecord} /> */}
          </Row>
        </div>
      )}
    </div>
  );
};

export default Bills;
