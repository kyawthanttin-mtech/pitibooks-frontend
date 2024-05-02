import React, { useState } from "react";
import { Table, Row, Button, Dropdown } from "antd";
import {
  EditOutlined,
  CloseOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  CaretDownFilled,
} from "@ant-design/icons";
import { InvoiceTemplate, InvoicePDF } from "../components";

import { PDFViewer, PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import { FormattedMessage } from "react-intl";

import { saveAs } from "file-saver";

const getStatus = (invoiceDate, dueDate) => {
  const currentDate = new Date();
  // const invoiceDateObj = new Date(invoiceDate);
  const dueDateObj = new Date(dueDate);

  if (dueDateObj < currentDate) {
    return "Overdue";
    // } else if (invoiceDateObj <= currentDate && dueDateObj >= currentDate) {
    //   return "Due";
  } else {
    return "Paid";
  }
};

const overdueStatus = (text, record) => {
  const currentDate = new Date();
  const dueDateObj = new Date(record.dueDate);
  const overdueDays = Math.ceil(
    (currentDate - dueDateObj) / (1000 * 60 * 60 * 24)
  );
  return text === "Paid" ? (
    <>{text}</>
  ) : (
    <>
      {text} by {overdueDays} days
    </>
  );
};

const handleShare = async (blob) => {
  if (blob) {
    await saveAs(blob, `invoice.pdf`);
    const dataUri = URL.createObjectURL(blob);
    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      `Invoice`
    )}&body=${encodeURIComponent(`Kindly find attached invoice`)}`;

    window.location.href = `${mailtoLink}&attachment=${dataUri}`;
  }
};

const compactColumns = [
  {
    title: "",
    dataIndex: "column",
    render: (text, record) => {
      return (
        <div>
          <div className="list-primary">
            <div style={{ display: "inline-block" }}>{record.customerName}</div>
            <span style={{ float: "right" }}>MMK{record.amount}</span>
          </div>
          <div className="list-secondary">
            <span style={{ float: "right" }}>
              {overdueStatus(text, record.status)}
            </span>
            <div>
              <a style={{ paddingRight: "0.3rem" }}>{record.invoice}</a>{" "}
              <span
                style={{
                  paddingLeft: "0.3rem",
                  borderLeft: "1px solid #e0e0e0",
                }}
              >
                {record.invoiceDate}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
];

const columns = [
  {
    title: "Date",
    dataIndex: "invoiceDate",
    key: "invoiceDate",
  },
  {
    title: "Invoice#",
    dataIndex: "invoice",
    key: "invoice",
  },
  {
    title: "Order Number",
    dataIndex: "orderNumber",
    key: "orderNumber",
  },
  {
    title: "Customer Name",
    dataIndex: "customerName",
    key: "customerName",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text, record) => overdueStatus(text, record),
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
    render: (text) => <>MMK{text}</>,
  },
  {
    title: "Balance Due",
    dataIndex: "balanceDue",
    key: "balanceDue",
    render: (text) => <>MMK{text}</>,
  },
  {
    title: "Branch",
    dataIndex: "branch",
    key: "branch",
  },
];

const dataSource = [
  {
    key: 1,
    invoiceDate: "10 Jan 2024",
    invoice: "INV-00009",
    orderNumber: "SO-00001",
    customerName: "John",
    status: getStatus("10 Jan 2024", "10 Aug 2024"),
    dueDate: "10 Aug 2024",
    amount: "10,000.00",
    balanceDue: "0.00",
    branch: "Head Office",
  },
  {
    key: 2,
    invoiceDate: "01 Jan 2024",
    invoice: "INV-00010",
    orderNumber: "SO-00002",
    customerName: "Bob",
    status: getStatus("01 Jan 2024", "25 Jan 2024"),
    dueDate: "25 Jan 2024",
    amount: "20,000.00",
    balanceDue: "10,000.00",
    branch: "Head Office",
  },
];

const InvoicesPage = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  return (
    <div className="wrapper">
      <Table
        className={selectedRecord ? "column-width" : "full-width"}
        dataSource={dataSource}
        pagination={false}
        columns={selectedRecord ? compactColumns : columns}
        rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
        onRow={(record) => {
          return {
            onClick: () => {
              setSelectedRecord(record);
              setSelectedRowIndex(record.id);
            },
          };
        }}
      />
      {selectedRecord && (
        <div className="content-column">
          <Row
            className="content-column-header-row"
            style={{
              backgroundColor: "white",
              justifyContent: "space-between",
            }}
          >
            <div className="content-title-block">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="content-title-sub">
                  <span>Branch: {selectedRecord.branch}</span>
                </div>
              </div>
              <div>{selectedRecord.invoice}</div>
            </div>
            <Button
              icon={<CloseOutlined />}
              type="text"
              //   loading={loading}
              onClick={() => {
                setSelectedRecord(null);
                setSelectedRowIndex(0);
              }}
            />
          </Row>
          <Row className="content-column-action-row">
            <span style={{ padding: "0.5rem 0.7rem", cursor: "pointer" }}>
              <EditOutlined style={{ paddingRight: "0.3rem" }} />
              <FormattedMessage id="button.edit" defaultMessage="Edit" />
            </span>
            {/* <BlobProvider
              document={<Invoice selectedRecord={selectedRecord} />}
              style={{ padding: "0.5rem 0.7rem", cursor: "pointer" }}
            >
              {({ url, blob }) => (
                <div onClick={() => handleShare(url, blob)}>
                  <MailOutlined style={{ paddingRight: "0.3rem" }} />
                  Send Email
                </div>
              )}
            </BlobProvider> */}
            {/* <PDFDownloadLink
              style={{ padding: "0.5rem 0.7rem", cursor: "pointer" }}
              document={<Invoice selectedRecord={selectedRecord} />}
              fileName={selectedRecord.invoice}
            >
              <span>
                <FilePdfOutlined style={{ paddingRight: "0.3rem" }} />
                PDF/Print
              </span>
            </PDFDownloadLink> */}
            <Dropdown
              menu={{
                items: [
                  {
                    label: (
                      <PDFDownloadLink
                        document={
                          <InvoicePDF selectedRecord={selectedRecord} />
                        }
                        fileName={selectedRecord.invoice}
                      >
                        PDF
                      </PDFDownloadLink>
                    ),
                    icon: <FilePdfOutlined />,
                    key: "0",
                  },
                  {
                    label: (
                      <BlobProvider
                        document={
                          <InvoicePDF selectedRecord={selectedRecord} />
                        }
                      >
                        {({ url, blob }) => (
                          <a href={url} target="_blank" rel="noreferrer">
                            Print
                          </a>
                        )}
                      </BlobProvider>
                    ),
                    icon: <PrinterOutlined />,
                    key: "1",
                  },
                ],
              }}
              trigger={["click"]}
            >
              <div
                style={{
                  padding: "0.5rem 0.7rem",
                  cursor: "pointer",
                }}
              >
                <FilePdfOutlined style={{ paddingRight: "0.3rem" }} />
                PDF/Print <CaretDownFilled style={{ fontSize: "0.7rem" }} />
              </div>
            </Dropdown>
          </Row>
          <Row className="content-column-full-row">
            <InvoiceTemplate selectedRecord={selectedRecord} />
            <PDFViewer width="1000" height="650" className="app">
              <InvoicePDF selectedRecord={selectedRecord} />
            </PDFViewer>
          </Row>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
