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
  Switch,
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
import { PurchaseOrderTemplate } from "../../components";
import { FormattedMessage } from "react-intl";

const compactColumns = [
  {
    title: "",
    dataIndex: "column",
    render: (text, record) => {
      return (
        <div>
          <div className="column-list-item">
            <span>{record.date}</span>
            <span>{record.amount}</span>
          </div>
          <div className="column-list-item">
            <span>{record.journal}</span>
            <span>{record.status}</span>
          </div>
        </div>
      );
    },
  },
];

const dataSource = [
  {
    date: "23 Feb 2024",
    branch: "Head Office",
    purchaseOrder: "PO-0004",
    vendorName: "Royal Taw Win Company",
    status: "CLOSED",
    amount: "MMK1,00.00",
    deliveryDate: "10 Feb 2024",
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

const POTableColumns = [
  {
    title: "Items & Description",
    key: "items",
    dataIndex: "items",
  },
  {
    title: "Ordered",
    key: "order",
    dataIndex: "order",
  },
  {
    title: "Warehouse Name",
    key: "warehouseName",
    dataIndex: "warehouseName",
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
  },
  {
    title: "Rate",
    key: "rate",
    dataIndex: "rate",
  },
  {
    title: "Amount",
    key: "amount",
    dataIndex: "amount",
  },
];

const PurchaseOrders = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("bill");
  const [isContentExpanded, setContentExpanded] = useState(false);
  const [caretRotation, setCaretRotation] = useState(0);
  const [showPdfView, setShowPdfView] = useState(false);
  const [POSearchModalOpen, setPOSearchModalOpen] = useState(false);
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },

    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Purchase Order#",
      dataIndex: "purchaseOrder",
      key: "purchaseOrder",
    },
    {
      title: "Reference#",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      key: "vendorName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Expected Delivery Date",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
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

  const toggleContent = () => {
    setContentExpanded(!isContentExpanded);
    setCaretRotation(caretRotation === 0 ? 90 : 0);
  };

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
      </Modal>
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header">
            <p className="page-header-text">All Purchase Orders</p>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                // onClick={() => navigate("/products/new")}
              >
                {!selectedRecord && "New"}
              </Button>
              <Button icon={<MoreOutlined />} />
            </Space>
          </div>
          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            <Table
              className={selectedRecord && "header-less-table"}
              columns={selectedRecord ? compactColumns : columns}
              dataSource={dataSource}
              pagination={false}
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
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <div className="content-column-header-row-text content-column-header-row-text">
                <span>Branch: {selectedRecord.branch}</span>
                <span>{selectedRecord.purchaseOrder}</span>
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

                <Space style={{ marginLeft: 0 }} defaultChecked>
                  <span>Show PDF View</span>
                  <Switch onChange={(checked) => setShowPdfView(checked)} />
                </Space>
              </div>
              {showPdfView ? (
                <PurchaseOrderTemplate selectedRecord={selectedRecord} />
              ) : (
                <div className="po-table-view" style={{ lineHeight: "1.125" }}>
                  <table cellSpacing={0}>
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td style={{ width: "24.813rem" }}>
                          <tr>
                            <td>
                              <span style={{ fontSize: "var(--title-text)" }}>
                                PURCHASE ORDER
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{
                                paddingTop: "8px",
                              }}
                            >
                              <Space>
                                <span>Purchase Order</span>
                                <span style={{ fontWeight: 500 }}>
                                  # {selectedRecord.purchaseOrder}
                                </span>
                              </Space>
                            </td>
                          </tr>
                        </td>
                        <td>
                          <tr>
                            <td>
                              <span>Vendor Address</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ paddingTop: "8px" }}>
                              <span style={{ color: "var(--primary-color)" }}>
                                {selectedRecord.vendorName}
                              </span>
                            </td>
                          </tr>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1.5rem" }}>
                          <table>
                            <thead>STATUS</thead>
                            <tbody>
                              <div
                                style={{
                                  borderLeft: "2px solid var(--yellow)",
                                  marginTop: "8px",
                                }}
                              >
                                <tr>
                                  <td
                                    style={{
                                      width: "5.375rem",
                                      paddingLeft: "8px",
                                    }}
                                  >
                                    <span>Order</span>
                                  </td>
                                  <td>
                                    <span className="adjustment-status">
                                      {selectedRecord.status}
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      paddingLeft: "8px",
                                      paddingTop: "8px",
                                    }}
                                  >
                                    <span>Bill</span>
                                  </td>
                                  <td>
                                    <span
                                      style={{ color: "var(--primary-color)" }}
                                    >
                                      Billed
                                    </span>
                                  </td>
                                </tr>
                              </div>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ paddingTop: "1.5rem" }}>
                          <tr>
                            <span style={{ fontWeight: 500 }}>
                              DELIVERY ADDRESS
                            </span>
                          </tr>
                          <tr>
                            <span></span>
                          </tr>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingBlock: "1.5rem" }}>
                          <tr>
                            <td style={{ width: "8.5rem" }}>
                              <span>ORDER DATE</span>
                            </td>
                            <td>
                              <span>{selectedRecord.date}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ paddingTop: "8px" }}>
                              <span>PAYMENT TERMS</span>
                            </td>
                            <td>
                              <span>Due on Receipt</span>
                            </td>
                          </tr>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Table
                    columns={POTableColumns}
                    className="header-bg-color-table po-table"
                  />
                  <div style={{ width: "50%", float: "right" }}>
                    <table cellSpacing="0" width="100%" id="balance-table">
                      <tbody>
                        <tr className="text-align-right">
                          <td
                            style={{
                              padding: "20px 140px 5px 0",
                              verticalAlign: "middle",
                            }}
                          >
                            <span>
                              <b> Sub Total</b>
                            </span>

                            <br />
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              padding: "20px 10px 10px 5px",
                            }}
                          >
                            <span>
                              <b> MMK22,000.00</b>
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="text-align-right"
                            style={{
                              fontSize: "var(--small-text)",
                              padding: "0px 140px 5px 0",
                            }}
                          >
                            <span>Total Quantity: 2</span>
                          </td>
                        </tr>
                        <tr className="text-align-right">
                          <td
                            style={{
                              padding: "16px 140px 5px 0",
                              verticalAlign: "middle",
                            }}
                          >
                            <span>Discount</span>
                          </td>
                          <td
                            style={{
                              width: "120px",
                              verticalAlign: "middle",
                              padding: "10px 10px 10px 5px",
                            }}
                          >
                            <span>MMK2,200.00</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <Divider />
                    <table cellSpacing="0" width="100%" id="balance-table">
                      <tbody>
                        <tr className="text-align-right">
                          <td
                            style={{
                              padding: "5px 140px 10px 0",
                              verticalAlign: "middle",
                            }}
                          >
                            <span>
                              <b>Total</b>
                            </span>
                          </td>
                          <td
                            style={{
                              width: "120px",
                              verticalAlign: "middle",
                              padding: "10px 10px 10px 5px",
                            }}
                          >
                            <span>
                              <b>MMK19,800.00</b>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <Divider />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PurchaseOrders;
