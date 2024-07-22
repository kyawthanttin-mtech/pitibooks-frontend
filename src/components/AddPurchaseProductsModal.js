import React, { useMemo, useState } from "react";
import { Modal, Input, InputNumber, Space, Row } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { FormattedMessage, FormattedNumber } from "react-intl";

const AddPurchaseProductsModal = ({
  isOpen,
  onCancel,
  products,
  // onAddItems,
  data,
  setData,
  setIsOpen,
  // form,
  account = "inventory",
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItemsBulk, setSelectedItemsBulk] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useMemo(() => {
    const filtered = products?.filter((item) =>
      item.name?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  const handleSelectItemBulk = (id) => {
    const existingItemIndex = selectedItemsBulk.findIndex(
      (item) => item.id === id
    );

    if (existingItemIndex !== -1) {
      // If the item is already selected, remove it
      const updatedItems = selectedItemsBulk.filter((item) => item.id !== id);
      setSelectedItemsBulk(updatedItems);
    } else {
      // If the item is not selected, add it
      const addedItem = products.find((item) => item.id === id);

      if (addedItem) {
        let newItem = {
          id,
          name: addedItem.name,
          sku: addedItem.sku,
          quantity: 1,
          rate: addedItem.purchasePrice,
          detailTax: addedItem.purchaseTax?.id,
          taxRate: addedItem.purchaseTax?.rate,
          unit: addedItem.unit,
          currentQty: addedItem.currentQty,
          currentDestQty: addedItem.currentDestQty && addedItem.currentDestQty,
          destUnit: addedItem.destUnit && addedItem.destUnit,
          account: null,
          purchasePrice: addedItem.purchasePrice,
          inventoryAccountId: addedItem.inventoryAccount?.id
        };

        if (account === "purchase") {
          newItem = {
            ...newItem,
            account: addedItem.purchaseAccount?.id,
          };
        } else if (account === "inventory") {
          newItem = {
            ...newItem,
            account: addedItem.inventoryAccount?.id,
          };
        } else if (account === "sales") {
          newItem = {
            ...newItem,
            // detailTax: addedItem.salesTax?.id,
            // taxRate: addedItem.salesTax?.rate,
            account: addedItem.salesAccount?.id,
          };
        }

        const updatedItems = [...selectedItemsBulk, newItem];
        setSelectedItemsBulk(updatedItems);
      }
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
    // const existingItems = data.filter((dataItem) =>
    //   selectedItemsBulk.some((selectedItem) => selectedItem.id === dataItem.id)
    // );
    // // Update quantity for existing items
    // existingItems.forEach((existingItem) => {
    //   const matchingSelectedItem = selectedItemsBulk.find(
    //     (selectedItem) => selectedItem.id === existingItem.id
    //   );

    //   form.setFieldsValue({
    //     [`quantity${existingItem.key}`]:
    //       existingItem.quantity + matchingSelectedItem.quantity,
    //   });
    // });
    // if (existingItems.length > 0) {
    //   const updatedData = data.map((dataItem) => {
    //     const matchingSelectedItem = selectedItemsBulk.find(
    //       (selectedItem) => selectedItem.id === dataItem.id
    //     );

    //     if (matchingSelectedItem) {
    //       const newQuantity = dataItem.quantity + matchingSelectedItem.quantity;
    //       const newAmount = matchingSelectedItem.rate * newQuantity;

    //       return {
    //         ...dataItem,
    //         quantity: newQuantity,
    //         amount: newAmount,
    //       };
    //     }

    //     return dataItem;
    //   });

    //   setData(updatedData);
    // }

    // const nonExistingItems = selectedItemsBulk.filter(
    //   (selectedItem) =>
    //     !data.some((dataItem) => dataItem.id === selectedItem.id)
    // );

    // console.log("non existing items", nonExistingItems);

    // if (nonExistingItems.length > 0) {
    //   const maxKey = Math.max(...data.map((dataItem) => dataItem.key));

    //   selectedItemsBulk.forEach((selectedItem, index) => {
    //     const newRowKey = maxKey + index + 1;
    //     const amount = selectedItem.rate * selectedItem.quantity;
    //     const newDataItem = {
    //       key: newRowKey,
    //       id: selectedItem.id,
    //       name: selectedItem.name,
    //       sku: selectedItem.sku,
    //       rate: selectedItem.rate,
    //       tax: selectedItem.tax,
    //       account: selectedItem.account,
    //       stockOnHand: selectedItem.stockOnHand,
    //       quantity: selectedItem.quantity,
    //       amount: amount,
    //     };

    //     // Add the new data item to the existing data array
    //     setData((prevData) => [...prevData, newDataItem]);

    //     // Set the form fields for the new data item
    //     form.setFieldsValue({
    //       [`product${newRowKey}`]: selectedItem.id,
    //       [`account${newRowKey}`]: selectedItem.account,
    //       [`rate${newRowKey}`]: selectedItem.rate,
    //       [`tax${newRowKey}`]: selectedItem.tax,
    //       [`quantity${newRowKey}`]: selectedItem.quantity,
    //     });
    //   });
    // }

    setData(selectedItemsBulk);
    setIsOpen(false);
    setSelectedItemsBulk([]);
  };

  return (
    <Modal
      title="Add Products in Bulk"
      open={isOpen}
      onCancel={onCancel}
      width="66rem"
      okText={
        <FormattedMessage
          id="button.addProducts"
          defaultMessage="Add Products"
        />
      }
      cancelText={
        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
      }
      onOk={handleAddItems}
    >
      <div className="add-items-container">
        <div className="items-menu-section">
          <div>
            <Input.Search
              placeholder="Type to search or scan the barcode of the product"
              allowClear
              enterButton
              onSearch={(value) => setSearchQuery(value)}
              onBlur={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ul className="items-list">
            {(searchQuery ? filteredProducts : products)?.map((item) => (
              <li
                className={`${
                  data?.some((dataItem) => dataItem.id === item.id) &&
                  "added-item"
                }`}
                key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleSelectItemBulk(item.id)}
              >
                <Space size="large">
                  <div className="item-details-select" key={item.id}>
                    <div className="item-details-select-list">
                      <span>{item.name}</span>
                      <span>Stock on Hand</span>
                    </div>
                    <div className="item-details-select-list">
                      {item.sku ? <span>SKU: {item.sku}</span> : <div></div>}
                      <span
                        className="stock-on-hand"
                        style={{
                          color:
                            item.currentQty <= 0 ? "red" : "var(--light-green)",
                        }}
                      >
                        <FormattedNumber
                          value={item.currentQty}
                          style="decimal"
                          minimumFractionDigits={item.unit?.precision}
                        />{" "}
                        {item.unit && item.unit.abbreviation}
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
                  <div>{item.name}</div>
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
  );
};

export default AddPurchaseProductsModal;
