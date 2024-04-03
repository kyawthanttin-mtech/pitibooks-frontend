import React, { useState } from "react";
import "./TransferOrderNew.css";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Table,
  Select,
  Divider,
  Modal,
  Radio,
  Flex,
  Space,
  InputNumber,
  AutoComplete,
} from "antd";
import {
  CloseOutlined,
  SettingOutlined,
  PlusCircleFilled,
  CloseCircleOutlined,
  UploadOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

import { ReactComponent as SwapOutlined } from "../../assets/icons/SwapOutlined.svg";
import { ReactComponent as ImageOutlined } from "../../assets/icons/ImageOutlined.svg";
import { AutoSuggest } from "../../components";
import { FormattedMessage } from "react-intl";

const TransferOrderNew = () => {
  const [data, setData] = useState([{ key: 1 }]);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [radioValue, setRadioValue] = useState("auto");
  const [addItemsModalOpen, setAddItemsModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItemsBulk, setSelectedItemsBulk] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const newTransferOrderForm = (
    <Form>
      <Form.Item
        label="TransferOrder"
        name="transferOrder"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 5 }}
      >
        <Input
          suffix={<SettingOutlined onClick={() => setSettingModalOpen(true)} />}
        />
      </Form.Item>
      <Form.Item
        label="Date"
        name="date"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 5 }}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Reason"
        name="reason"
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 5 }}
      >
        <Input.TextArea rows="4" />
      </Form.Item>
      <br />
      <Row>
        <Col lg={9} className="warehouse-input-col">
          <Form.Item
            label="Source Warehouse"
            name="sourceWarehouse"
            labelAlign="left"
            labelCol={{ span: 11 }}
          >
            <Select showSearch />
          </Form.Item>
        </Col>
        <Col
          lg={2}
          className="swap-icon-container"
          style={{
            textAlign: "center",
            paddingTop: "0.6rem",
            verticalAlign: "middle",
          }}
        >
          <SwapOutlined />
        </Col>
        <Col lg={9}>
          <Form.Item
            label="Destination Warehouse"
            name="destinationWarehouse"
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 13 }}
          >
            <Select showSearch />
          </Form.Item>
        </Col>
      </Row>
      <div className="page-actions-bar page-actions-bar-margin">
        <Button type="primary" htmlType="submit" className="page-actions-btn">
          Save as Draft
        </Button>
        <Button className="page-actions-btn">Convert to Adjusted</Button>
        <Button
          className="page-actions-btn"
          //   onClick={() =>
          //     navigate(from, { state: location.state, replace: true })
          //   }
        >
          Cancel
        </Button>
      </div>
    </Form>
  );

  const columns = [
    {
      title: "Item Details",
      dataIndex: "itemImg",
      key: "itemImg",
      width: "5%",
      colSpan: 2,
      render: () => <ImageOutlined style={{ opacity: "50%" }} />,
    },
    {
      title: "Item Details",
      dataIndex: "productName",
      key: "productName",
      width: "30%",
      colSpan: 0,
      render: (text, record) => {
        return text ? (
          <div>
            <Flex justify="space-between">
              {text}
              <CloseCircleOutlined
                onClick={() => handleRemoveSelectedItem(record.id)}
              />
            </Flex>
            <div>SKU: {record.sku}</div>
          </div>
        ) : (
          <>
            <AutoSuggest
              items={items}
              onSelect={handleSelectItem}
              rowKey={record.key}
            />
          </>
        );
      },
    },
    {
      title: "Current Availability",
      dataIndex: "sourceStock",
      key: "sourceStock",
      colSpan: 2,
    },
    {
      title: "Current Availability",
      dataIndex: "destStock",
      key: "destStock",
      colSpan: 0,
    },
    {
      title: "Transfer Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => (
        <Input
          value={text ? text.toFixed(2) : "1.00"}
          className="text-align-right border-less-input"
        />
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      render: (_, record) => (
        <CloseCircleOutlined
          style={{ color: "red" }}
          onClick={() => handleRemoveRow(record.key)}
        />
      ),
    },
  ];

  const items = [
    {
      id: "S1",
      productName: "Cake (Purple)",
      sku: "123456",
      stockOnHand: "44.0",
    },
    { id: "G2", productName: "Shirt", sku: "823456", stockOnHand: "45.0" },
    { id: "G3", productName: "Pants", sku: "123756", stockOnHand: "56.0" },
    { id: "G4", productName: "Shirt", sku: "000000", stockOnHand: "3.0" },
    {
      id: "S2",
      productName: "Cake (Pink)",
      sku: "173456",
      stockOnHand: "0.0",
    },
    {
      id: "C1",
      productName: "Hat",
      sku: "143456",
      stockOnHand: "0.0",
    },
    {
      id: "C2",
      productName: "Cup",
      sku: "143656",
      stockOnHand: "122",
    },
    {
      id: "C3",
      productName: "Hat",
      sku: "343434",
      stockOnHand: "0.0",
    },
  ];

  const handleRadioChange = (e) => {
    setRadioValue(e.target.value);
  };

  const handleSelectItem = (value, rowKey) => {
    const selectedItem = items.find((item) => item.id === value);
    const dataIndex = data.findIndex((dataItem) => dataItem.key === rowKey);

    if (dataIndex !== -1) {
      const updatedData = [...data];
      updatedData[dataIndex] = {
        key: rowKey,
        id: selectedItem.id,
        productName: selectedItem.productName,
        sku: selectedItem.sku,
        stockOnHand: selectedItem.stockOnHand,
        quantity: 1,
      };

      setData(updatedData);
    }
  };

  console.log("Data", data);
  const handleRemoveSelectedItem = (idToRemove) => {
    const updatedData = data.map((dataItem) => {
      if (dataItem.id === idToRemove) {
        return { key: dataItem.key };
      }

      return dataItem;
    });

    setData(updatedData);
  };

  const handleAddRow = () => {
    const newRowKey = data.length + 1;
    setData([...data, { key: newRowKey }]);
  };

  const handleRemoveRow = (keyToRemove) => {
    const newData = data.filter((dataItem) => dataItem.key !== keyToRemove);
    setData(newData);
  };

  const handleSelectItemBulk = (id) => {
    const existingItemIndex = selectedItemsBulk.findIndex(
      (item) => item.id === id
    );

    // If the item is already selected, remove it
    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItemsBulk];
      updatedItems.splice(existingItemIndex, 1);
      setSelectedItemsBulk(updatedItems);
    } else {
      // If the item is not selected, add it
      const addedItem = items.find((item) => item.id === id);
      const updatedItems = [
        ...selectedItemsBulk,
        {
          id,
          productName: addedItem.productName,
          sku: addedItem.sku,
          stockOnHand: addedItem.stockOnHand,
          quantity: 1,
        },
      ];
      setSelectedItemsBulk(updatedItems);
      console.log("Items bulk", selectedItemsBulk);
    }
  };

  const handleRemoveSelectItemBulk = (id) => {
    const existingItemIndex = selectedItemsBulk.findIndex(
      (item) => item.id === id
    );
    const updatedItems = [...selectedItemsBulk];
    updatedItems.splice(existingItemIndex, 1);
    setSelectedItemsBulk(updatedItems);
  };

  const handleIncreaseItemQuantity = (id, quantity) => {
    const updatedItemsBulk = selectedItemsBulk.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setSelectedItemsBulk(updatedItemsBulk);
  };

  const totalQuantity = selectedItemsBulk.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleAddItems = () => {
    const existingItems = data.filter((dataItem) =>
      selectedItemsBulk.some((selectedItem) => selectedItem.id === dataItem.id)
    );

    if (existingItems.length > 0) {
      const updatedData = data.map((dataItem) => {
        const matchingSelectedItem = selectedItemsBulk.find(
          (selectedItem) => selectedItem.id === dataItem.id
        );
        return matchingSelectedItem
          ? {
              ...dataItem,
              quantity: dataItem.quantity + matchingSelectedItem.quantity,
            }
          : dataItem;
      });
      setData(updatedData);
    }

    const nonExistingItems = selectedItemsBulk.filter(
      (selectedItem) =>
        !data.some((dataItem) => dataItem.id === selectedItem.id)
    );

    if (nonExistingItems.length > 0) {
      const maxKey = Math.max(...data.map((dataItem) => dataItem.key));
      const newRows = nonExistingItems.map((item, index) => ({
        key: maxKey + index + 1,
        ...item,
      }));
      setData((prevData) => [...prevData, ...newRows]);
    }

    setAddItemsModalOpen(false);
    setSelectedItemsBulk([]);
  };

  // Function to filter items based on search query
  const filteredItems = items.filter((item) =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const settingForm = (
    <Form layout="vertical">
      <p style={{ fontSize: "0.813rem" }}>
        Your transfer orders numbers are set on auto-generate mode to save your
        time. Are you sure about changing this setting?
      </p>

      <Radio.Group
        value={radioValue}
        onChange={handleRadioChange}
        style={{ width: "100%" }}
      >
        <Radio value="auto" style={{ marginBottom: "1.063rem" }}>
          Continue auto-generating transfer orders numbers
        </Radio>

        {radioValue === "auto" && (
          <Row>
            <Col lg={5}>
              <Form.Item label="Prefix">
                <Input prefix="TO-" />
              </Form.Item>
            </Col>
            <Col lg={12} offset={1}>
              <Form.Item label="Next Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Radio value="manual">Enter transfer order numbers manually</Radio>
      </Radio.Group>
    </Form>
  );

  return (
    <>
      <Modal
        title="Configure Transfer Order# Preferences"
        okText={<FormattedMessage id="button.search" defaultMessage="Search" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={settingModalOpen}
        onCancel={() => setSettingModalOpen(false)}
        width="40rem"
      >
        {settingForm}
      </Modal>
      <Modal
        className="add-items-modal"
        title="Add Items in Bulk"
        okText={
          <FormattedMessage id="button.addItems" defaultMessage="Add Items" />
        }
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
        open={addItemsModalOpen}
        onOk={handleAddItems}
        onCancel={() => {
          setAddItemsModalOpen(false);
          setSelectedItemsBulk([]);
        }}
        width="64.5rem"
      >
        <div className="add-items-container">
          <div className="items-menu-section">
            <div className="items-search-container">
              <Input.Search
                placeholder="Type to search or scan the barcode of the item"
                allowClear
                onSearch={(value) => setSearchQuery(value)}
              />
            </div>
            <ul className="items-list">
              {filteredItems.map((item) => (
                <li
                  className={`${
                    data.some((dataItem) => dataItem.id === item.id) &&
                    "added-item"
                  }`}
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleSelectItemBulk(item.id)}
                >
                  <Space size="large">
                    <div className="item-details-select" key={item.key}>
                      <div className="item-details-select-list">
                        <span>{item.productName}</span>
                        <span>Stock on Hand</span>
                      </div>
                      <div className="item-details-select-list">
                        <span>SKU: {item.sku}</span>
                        <span className="stock-on-hand">
                          {item.stockOnHand}
                        </span>
                      </div>
                    </div>
                    {selectedItemsBulk.some(
                      (selectedItem) => selectedItem.id === item.id
                    ) ? (
                      <CheckCircleFilled className="item-selected-icon selected" />
                    ) : hoveredItem === item.id ? (
                      <CheckCircleFilled className="item-selected-icon default" />
                    ) : (
                      ""
                    )}
                  </Space>
                </li>
              ))}
            </ul>
          </div>
          <div className="selected-items-section">
            <Row className="selected-items-header" justify="space-between">
              <Space>
                <span>Selected Items</span>
                <div className="selected-items-count">
                  {selectedItemsBulk.length}
                </div>
              </Space>
              <div>
                <span>Total Quantity: </span>
                {totalQuantity}
              </div>
            </Row>
            {selectedItemsBulk.length > 0 ? (
              <ul className="selected-items-list">
                {selectedItemsBulk.map((item) => (
                  <li key={item.id} className="selected-items-list-item">
                    <div>{item.productName}</div>
                    <Space size="large">
                      <InputNumber
                        defaultValue={1}
                        min={1}
                        onChange={(value) =>
                          handleIncreaseItemQuantity(item.id, value)
                        }
                      />
                      <CloseCircleOutlined
                        style={{ color: "red" }}
                        onClick={() => handleRemoveSelectItemBulk(item.id)}
                      />
                    </Space>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="hv-centered text-center">
                Click the item names from the left pane to select them
              </div>
            )}
            <div className="add-items-actions-bar"></div>
          </div>
        </div>
      </Modal>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">New Transfer Order</p>
        <Button icon={<CloseOutlined />} type="text" />
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        {newTransferOrderForm}
        <br />
        <br />
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          className="item-details-table"
        />
        <br />
        <Button
          icon={<PlusCircleFilled className="plus-circle-icon" />}
          onClick={handleAddRow}
          className="add-row-item-btn"
        >
          Add New Row
        </Button>
        <Divider type="vertical" />
        <Button
          icon={<PlusCircleFilled className="plus-circle-icon" />}
          className="add-row-item-btn"
          onClick={() => setAddItemsModalOpen(true)}
        >
          Add Item in Bulk
        </Button>
        <div className="attachment-upload-container">
          <p>Attach file(s) to transfer order</p>
          <Button
            type="dashed"
            icon={<UploadOutlined />}
            className="attachment-upload-btn"
          >
            Upload File
          </Button>
          <p>You can upload a maximum of 5 files, 5MB each</p>
        </div>
      </div>
    </>
  );
};

export default TransferOrderNew;
