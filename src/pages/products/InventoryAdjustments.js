import React, { useState } from "react";

import "./InventoryAdjustments.css";
import { InventoryAdjustmentsTemplate } from "../../components";

import {
  Button,
  Space,
  Table,
  Row,
  Modal,
  Form,
  Col,
  Input,
  Select,
  Dropdown,
  Switch,
  Divider,
} from "antd";
import {
  MoreOutlined,
  SearchOutlined,
  PlusOutlined,
  PaperClipOutlined,
  CloseOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  CaretDownFilled,
} from "@ant-design/icons";

import { ReactComponent as ImageOutlined } from "../../assets/icons/ImageOutlined.svg";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";

const dataSource = [
  {
    key: 1,
    id: 1,
    date: "07 Nov 2023",
    reason: "Inventory Revaluation",
    status: "Adjusted",
    referenceNumber: "12121",
    type: "Value",
    warehouseName: "YGN Warehouse",
  },
  {
    key: 2,
    id: 2,
    date: "12 Jan 2024",
    reason: "Damaged Goods",
    status: "Adjusted",
    referenceNumber: "0003",
    type: "Quantity",
    warehouseName: "MDY Warehouse",
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
            <span>{record.referenceNumber}</span>
          </div>
          <div className="column-list-item">
            <span>{record.reason}</span>
            <span
              style={{
                textTransform: "uppercase",
                color: "var(--primary-color)",
              }}
            >
              {record.status}
            </span>
          </div>
          <div className="column-list-item">
            <span>{record.date}</span>
          </div>
        </div>
      );
    },
  },
];

const searchJournalModalForm = (
  <Form>
    <Row>
      <Col lg={12}>
        <Form.Item
          label="Product Name"
          name="productName"
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
        >
          <Input></Input>
        </Form.Item>
      </Col>
      <Col lg={12}>
        <Form.Item
          label="Description"
          name="description"
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
        >
          <Input></Input>
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <Form.Item
          label="Reference#"
          name="reference"
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
        >
          <Input></Input>
        </Form.Item>
      </Col>
      <Col lg={12}>
        <Form.Item
          label="Adjustment Type"
          name="adjustmentType"
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
        >
          <Select></Select>
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <Form.Item
          label="Reason"
          name="reason"
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
        >
          <Input></Input>
        </Form.Item>
      </Col>
      <Col lg={12}>
        <Form.Item
          label="Warehouse Name"
          name="warehouseName"
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 15 }}
        >
          <Select></Select>
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col lg={12}>
        <Form.Item
          label="Sales Account"
          name="salesAccount"
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

const InventoryAdjustments = () => {
  const [searchInventoryModalOpen, setSearchInventoryModalOpen] =
    useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const [showPdfView, setShowPdfView] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Statue",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Reference Number",
      dataIndex: "referenceNumber",
      key: "referenceNumber",
    },

    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Warehouse Name",
      dataIndex: "warehouseName",
      key: "warehouseName",
    },
    {
      title: (
        <SearchOutlined
          className="table-header-search-icon"
          onClick={() => setSearchInventoryModalOpen(true)}
        />
      ),
      dataIndex: "search",
      key: "search",
    },
  ];

  const adjustmentDetailsTableColumns = [
    {
      title: "Item Details",
      dataIndex: "itemDetails",
      key: "itemDetails",
      render: (text) => (
        <Space>
          <ImageOutlined style={{ opacity: "50%" }} />
          {text}
        </Space>
      ),
    },
    {
      title: "Adjusted Value",
      dataIndex: "adjustedValue",
      key: "adjustedValue",
    },
  ];

  const adjustmentDetailsTableDataSource = [
    {
      key: 1,
      id: 1,
      itemDetails: "cake (Purple)",
      adjustedValue: "MMK 990.00",
    },
  ];
  // const tableView = (

  // );

  return (
    <>
      <Modal
        className="search-journal-modal"
        width="65.5rem"
        title="Search Journal"
        okText={<FormattedMessage id="button.search" defaultMessage="Search" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={searchInventoryModalOpen}
        onCancel={() => setSearchInventoryModalOpen(false)}
      >
        {searchJournalModalForm}
      </Modal>
      <div className={`${selectedRecord && "page-with-column"}`}>
        <div>
          <div className="page-header page-header-with-button">
            <p className="page-header-text">Inventory Adjustments</p>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/inventoryAdjustments/new")}
              >
                {!selectedRecord && "New"}
              </Button>
              <Button icon={<MoreOutlined />}></Button>
            </Space>
          </div>
          <div className={`page-content ${selectedRecord && "column-width2"}`}>
            <Row className="table-actions-header">
              <span>VIEW BY:</span>
              <span>Status: </span>
              <span>Period: </span>
            </Row>
            <Table
              className={selectedRecord && "header-less-table"}
              pagination={false}
              columns={selectedRecord ? compactColumns : columns}
              dataSource={dataSource}
              rowSelection={{ selectedRowKeys: [selectedRowIndex] }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    setSelectedRecord(record);
                    setSelectedRowIndex(record.id);
                  },
                };
              }}
            ></Table>
          </div>
        </div>
        {selectedRecord && (
          <div className="content-column">
            <Row className="content-column-header-row">
              <p className="page-header-text"></p>
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
              <div className="toggle-pdf-view">
                <Space style={{ marginLeft: 0 }} defaultChecked>
                  <span>Show PDF View</span>
                  <Switch onChange={(checked) => setShowPdfView(checked)} />
                </Space>
              </div>

              {showPdfView ? (
                <InventoryAdjustmentsTemplate selectedRecord={selectedRecord} />
              ) : (
                <div className="table-view">
                  <table>
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            width: 279,
                            paddingTop: "2.5rem",
                            paddingRight: "5.438rem",
                          }}
                        >
                          Date
                        </td>
                        <td style={{ paddingTop: "2.5rem" }}>
                          {selectedRecord.date}
                        </td>
                      </tr>
                      <tr style={{ marginTop: "30px" }}>
                        <td style={{ paddingTop: "1rem" }}>Reason</td>
                        <td style={{ paddingTop: "1rem" }}>
                          {selectedRecord.reason}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1rem" }}>Status</td>
                        <td style={{ paddingTop: "1rem" }}>
                          <div className="adjustment-status">
                            {selectedRecord.status}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1rem" }}>Account</td>
                        <td style={{ paddingTop: "1rem" }}>
                          Cost of Goods Sold
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1rem" }}>Adjustment Type</td>
                        <td style={{ paddingTop: "1rem" }}>
                          {selectedRecord.type}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1rem" }}>Reference Number</td>
                        <td style={{ paddingTop: "1rem" }}>
                          {selectedRecord.referenceNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1rem" }}>Adjusted By</td>
                        <td style={{ paddingTop: "1rem" }}>piti baby</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: "1rem" }}>Created Time</td>
                        <td style={{ paddingTop: "1rem" }}>
                          {selectedRecord.date} 03:10 PM
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Divider />
                  <p>Adjusted Items</p>
                  <Table
                    className="adjustment-details-table"
                    pagination={false}
                    columns={adjustmentDetailsTableColumns}
                    dataSource={adjustmentDetailsTableDataSource}
                  ></Table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InventoryAdjustments;
