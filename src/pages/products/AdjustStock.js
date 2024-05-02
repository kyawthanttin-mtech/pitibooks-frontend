import React from "react";

import "./AdjustStock.css";

import { Row, Col, Button, Form, Radio, Input, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const AdjustStock = ({ selectedProductRecord, onClose }) => {
  const adjustStockForm = (
    <Form className="adjust-stock-form">
      <Row>
        <Col lg={7}>
          <Form.Item
            // label="Date"
            wrapperCol={{ span: 17 }}
            labelAlign="left"
            name="date"
          >
            <label className="label">Date</label>
            <Input></Input>
          </Form.Item>
        </Col>
        <Col lg={7}>
          <Form.Item
            // label="Account"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 17 }}
            labelAlign="left"
            name="account"
          >
            <label className="label">Account</label>
            <Select></Select>
          </Form.Item>
        </Col>
        <Col lg={7}>
          <Form.Item
            // label="Reference Number"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 17 }}
            labelAlign="left"
            name="referenceNumber"
          >
            <label className="label">Reference Number</label>
            <Input></Input>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Branch"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 5 }}
        labelAlign="left"
        name="branch"
      >
        <Select></Select>
      </Form.Item>
      <Form.Item
        label="Warehouse Name"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 5 }}
        labelAlign="left"
        name="warehouseName"
      >
        <Select></Select>
      </Form.Item>
      <Form.Item
        label="Quantity Available"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 5 }}
        labelAlign="left"
        name="quantityAvailable"
      >
        <Select></Select>
      </Form.Item>
      <Form.Item
        label="Quantity Adjusted"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 5 }}
        labelAlign="left"
        name="quantityAdjusted"
      >
        <Select></Select>
      </Form.Item>
      <Form.Item
        label="Cost Price"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 5 }}
        labelAlign="left"
        name="costPrice"
      >
        <Select></Select>
      </Form.Item>
      <Form.Item
        // label="Reason"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 12 }}
        labelAlign="left"
        name="reason"
      >
        <label className="label">Reason</label>
        <Select placeholder="Select a reason"></Select>
      </Form.Item>
      <Form.Item
        // label="Description"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 12 }}
        labelAlign="left"
        name="description"
      >
        <label className="label">Description</label>
        <Input.TextArea
          rows="4"
          placeholder="Max 500 characters"
        ></Input.TextArea>
      </Form.Item>
      <div className="page-actions-bar page-actions-bar-margin">
        <Button type="primary" htmlType="submit" className="page-actions-btn">
          Save
        </Button>
        <Button className="page-actions-btn" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Form>
  );

  return (
    <div className="content-column-full-row page-content-with-form-buttons">
      <Radio.Group defaultValue={1} name="adjustment-type">
        <Radio value={1}>Quantity Adjustments</Radio>
        <Radio value={2}>Value Adjustments</Radio>
      </Radio.Group>
      {adjustStockForm}
    </div>
  );
};

export default AdjustStock;
