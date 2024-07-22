import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Divider,
  Flex,
  Radio,
  Space,
  AutoComplete,
  Row,
  Col,
} from "antd";
import {
  CloseCircleOutlined,
  PlusCircleFilled,
  UploadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useReadQuery, useMutation, useQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { AddPurchaseProductsModal, UploadAttachment } from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import { InventoryAdjustmentMutations, StockQueries } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { UPDATE_INVENTORY_ADJUSTMENT } = InventoryAdjustmentMutations;
const { GET_AVAILABLE_STOCKS } = StockQueries;

const InventoryAdjustmentsEdit = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.record;
  const {
    notiApi,
    msgApi,
    business,
    allBranchesQueryRef,
    allWarehousesQueryRef,
    allProductsQueryRef,
    allProductVariantsQueryRef,
    allAccountsQueryRef,
  } = useOutletContext();
  const [data, setData] = useState(() => {
    if (record && record.details) {
      return record.details?.map((detail, index) => {
        return {
          key: index + 1,
          detailId: detail.id,
          name: detail.name,
          id: detail.productType + detail.productId,
          quantity: detail.stocks?.[0]?.qty,
        };
      });
    } else {
      return [{ key: 1 }];
    }
  });
  const [addProductsModalOpen, setAddPurchaseProductsModalOpen] =
    useState(false);
  // const [tableKeyCounter, setTableKeyCounter] = useState(
  //   record?.details?.length || 1
  // );
  const [saveStatus, setSaveStatus] = useState("Draft");
  const [adjustmentType, setAdjustmentType] = useState(
    record?.adjustmentType === "Quantity" ? "q" : "v"
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [fileList, setFileList] = useState(null);

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);
  const { data: productData } = useReadQuery(allProductsQueryRef);
  const { data: productVariantData } = useReadQuery(allProductVariantsQueryRef);

  const { loading: stockLoading, data: stockData } = useQuery(
    GET_AVAILABLE_STOCKS,
    {
      skip: !selectedWarehouse,
      variables: { warehouseId: selectedWarehouse },
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  // Mutations
  const [updateInventoryAdjustment, { loading: updateLoading }] = useMutation(
    UPDATE_INVENTORY_ADJUSTMENT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="inventoryAdjustment.updated"
            defaultMessage="Inventory Adjustment Updated"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = updateLoading;

  const accounts = useMemo(() => {
    return accountData?.listAllAccount?.filter((acc) => acc.isActive === true);
  }, [accountData]);

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const products = useMemo(() => {
    return productData?.listAllProduct?.filter((p) => p.isActive === true);
  }, [productData]);

  const productVariants = useMemo(() => {
    return productVariantData?.listAllProductVariant?.filter(
      (p) => p.isActive === true
    );
  }, [productVariantData]);

  const allProducts = useMemo(() => {
    const productsWithS = products
      ? products.map((product) => ({ ...product, id: "S" + product.id }))
      : [];

    const productsWithV = productVariants
      ? productVariants.map((variant) => ({ ...variant, id: "V" + variant.id }))
      : [];

    return [...productsWithS, ...productsWithV];
  }, [products, productVariants]);

  const stocks = useMemo(() => {
    return stockData?.getAvailableStocks;
  }, [stockData]);

  const productStocks = useMemo(() => {
    return allProducts?.map((product) => {
      const stock = stocks?.find((stockItem) => {
        const stockId = stockItem.productType + stockItem.productId;
        return stockId === product.id;
      });
      return {
        ...product,
        currentQty: stock ? stock.currentQty : 0,
        unit: stock?.product?.productUnit || null,
      };
    });
  }, [allProducts, stocks]);

  useEffect(() => {
    if (selectedWarehouse) {
      setData((prevData) => {
        return prevData.map((item) => {
          const matchingProductStock = productStocks.find(
            (product) => product.id === item.id
          );
          return {
            ...item,
            currentQty: matchingProductStock
              ? matchingProductStock.currentQty
              : 0,
            unit: matchingProductStock ? matchingProductStock.unit : item.unit,
          };
        });
      });
    }
  }, [selectedWarehouse, productStocks]);

  console.log("record", record);

  useMemo(() => {
    // const taxId = record?.supplierTaxType + record?.supplierTaxId;
    const parsedRecord = record
      ? {
          adjustmentType: record?.adjustmentType === "Quantity" ? "q" : "v",
          branch: record?.branch?.id,
          referenceNumber: record?.referenceNumber,
          date: dayjs(record?.adjustmentDate),
          warehouse: record.warehouse?.id,
          account: record.account?.id,
          reason: record.reason,
          description: record.description,

          ...record?.details?.reduce((acc, d, index) => {
            acc[`quantityNew${index + 1}`] =
              d.stocks?.[0]?.qty + d.adjustedValue;
            acc[`quantityAdjusted${index + 1}`] = d.adjustedValue;
            // acc[`changedValue${index + 1}`] =
            return acc;
          }, {}),
        }
      : {
          currency: business.baseCurrency.id,
          date: dayjs(),
          branch: business.primaryBranch.id,
        };

    form.setFieldsValue(parsedRecord);
  }, [form, record, business]);

  console.log("data", data);

  const onFinish = async (values) => {
    console.log("values", values);
    let foundInvalid = false;
    console.log(data);
    const details = data.map((item) => {
      if (!(item.name || values[`product${item.key}`]) && !item.isDeletedItem) {
        foundInvalid = true;
      }
      const productId = item.id;
      const detailProductType = productId ? Array.from(productId)[0] : "S";
      let detailProductId = productId
        ? parseInt(productId?.replace(/[SGCV]/, ""), 10)
        : 0;
      if (isNaN(detailProductId)) detailProductId = 0;
      return {
        detailId: item.detailId || 0,
        productId: detailProductId,
        productType: detailProductType,
        name: item.name || values[`product${item.key}`],
        isDeletedItem: item.isDeletedItem || false,
        adjustedValue:
          adjustmentType === "q"
            ? values[`quantityAdjusted${item.key}`]
            : values[`adjustedValue${item.key}`],
      };
    });

    if (details.length === 0 || foundInvalid) {
      openErrorNotification(
        notiApi,
        intl.formatMessage({
          id: "validation.invalidProductDetails",
          defaultMessage: "Invalid Product Details",
        })
      );
      return;
    }

    const fileUrls = fileList?.map((file) => ({
      documentUrl: file.imageUrl || file.documentUrl,
      isDeletedItem: file.isDeletedItem,
      id: file.id,
    }));

    console.log("details", details);
    const input = {
      adjustmentType: adjustmentType === "q" ? "Quantity" : "Value",
      adjustmentDate: values.date,
      accountId: values.account,
      branchId: values.branch,
      warehouseId: values.warehouse,
      reason: values.reason,
      description: values.description,
      currentStatus: saveStatus,
      referenceNumber: values.referenceNumber,
      details,
      documents: fileUrls,
    };
    // console.log("Transactions", transactions);
    console.log("Input", input);
    await updateInventoryAdjustment({
      variables: { id: record.id, input: input },
    });
  };

  const handleAddRow = () => {
    // const newRowKey = tableKeyCounter + 1;
    // setTableKeyCounter(tableKeyCounter + 1);
    const maxKey = Math.max(...data.map((dataItem) => dataItem.key), 0);
    const newRowKey = maxKey + 1;
    setData([
      ...data,
      {
        key: newRowKey,
      },
    ]);
  };

  const handleRemoveRow = useCallback(
    (keyToRemove) => {
      const newData = data.filter((item) => item.key !== keyToRemove);
      // recalculateTotalAmount(newData, isTaxInclusive, isAtTransactionLevel);
      setData(newData);
      form.setFieldsValue({
        [`product${keyToRemove}`]: "",
        [`quantity${keyToRemove}`]: "",
      });
    },
    [data, form]
  );

  const handleAddProductsInBulk = (selectedItemsBulk) => {
    let newData = [...data];

    // Filter existing items from the selected bulk items
    const existingItems = data.filter((dataItem) =>
      selectedItemsBulk.some((selectedItem) => selectedItem.id === dataItem.id)
    );

    // Update quantity for existing items
    existingItems.forEach((existingItem) => {
      const matchingSelectedItem = selectedItemsBulk.find(
        (selectedItem) => selectedItem.id === existingItem.id
      );
      form.setFieldsValue({
        [`quantity${existingItem.key}`]:
          existingItem.quantity + matchingSelectedItem.quantity,
      });
    });

    // Update data with new quantities for existing items
    if (existingItems.length > 0) {
      newData = data.map((dataItem) => {
        const matchingSelectedItem = selectedItemsBulk.find(
          (selectedItem) => selectedItem.id === dataItem.id
        );

        if (matchingSelectedItem) {
          const newQuantity = dataItem.quantity + matchingSelectedItem.quantity;
          return {
            ...dataItem,
            quantity: newQuantity,
          };
        }

        return dataItem;
      });
    }

    // Filter non-existing items from the selected bulk items
    const nonExistingItems = selectedItemsBulk.filter(
      (selectedItem) =>
        !data.some((dataItem) => dataItem.id === selectedItem.id)
    );

    if (nonExistingItems.length > 0) {
      const maxKey = Math.max(...data.map((dataItem) => dataItem.key), 0);

      nonExistingItems.forEach((selectedItem, index) => {
        const newRowKey = maxKey + 1 + index;

        const newDataItem = {
          key: newRowKey,
          ...selectedItem,
        };

        // Add the new data item to the existing data array
        newData = [...newData, newDataItem];

        // Set the form fields for the new data item
        form.setFieldsValue({
          [`product${newRowKey}`]: selectedItem.id,
          [`quantity${newRowKey}`]: selectedItem.quantity,
        });
      });
    }

    // Update state and recalculate total amount if new data is added
    if (newData.length > 0) {
      setData(newData);
    }
  };

  const handleSelectItem = useCallback(
    (value, rowKey) => {
      const selectedItem = allProducts?.find((product) => product.id === value);
      const dataIndex = data.findIndex((dataItem) => dataItem.key === rowKey);
      if (dataIndex !== -1) {
        const oldData = data[dataIndex];
        let newData = {
          key: rowKey,
          name: value,
          ...oldData,
        };
        if (selectedItem && selectedItem.id) {
          // cancel if selected item is already in the list
          const foundIndex = data.findIndex(
            (dataItem) => dataItem.id === selectedItem.id
          );
          if (foundIndex !== -1) {
            form.setFieldsValue({ [`product${rowKey}`]: null });
            openErrorNotification(
              notiApi,
              intl.formatMessage({
                id: "error.productIsAlreadyAdded",
                defaultMessage: "Product is already added",
              })
            );
            return;
          }
          newData.id = selectedItem.id;
          newData.name = selectedItem.name;
          newData.sku = selectedItem.sku;
          newData.currentQty = selectedItem.currentQty;
          newData.purchasePrice = selectedItem.purchasePrice;
          newData.costPrice = selectedItem.costPrice;
          newData.unit = selectedItem.unit;
        }
        console.log(newData);
        const updatedData = [...data];
        updatedData[dataIndex] = newData;
        setData(updatedData);
      }
      console.log("account id", selectedItem.inventoryAccount?.id);
      form.setFieldsValue({
        [`quantity${rowKey}`]: 1,
      });
    },
    [allProducts, data, form, intl, notiApi]
  );

  const handleRemoveSelectedItem = useCallback(
    (idToRemove, rowKey) => {
      const updatedData = data.map((dataItem) => {
        if (dataItem.id === idToRemove) {
          return { key: dataItem.key };
        }
        return dataItem;
      });
      setData(updatedData);
      form.setFieldsValue({
        [`product${rowKey}`]: "",
        [`quantity${rowKey}`]: "",
      });
    },
    [data, form]
  );

  const handleAdjustmentTypeChange = (e) => {
    setAdjustmentType(e.target.value);
    const fields = form.getFieldsValue();
    const tableFieldNames = Object.keys(fields).filter(
      (key) =>
        key.startsWith("quantity") ||
        key.startsWith("currentValue") ||
        key.startsWith("changedValue") ||
        key.startsWith("adjustedValue")
    );

    const resetFields = tableFieldNames.reduce((obj, fieldName) => {
      obj[fieldName] = undefined;
      return obj;
    }, {});

    form.setFieldsValue(resetFields);
  };

  const handleBlur = useCallback(
    (field, record, e) => {
      const value = parseFloat(e.target.value) || 0;
      const updatedValues = {};
      const recordKey = record.key;
      const availableQty = record.quantity;
      const currentValue = record.currentQty * record.purchasePrice;

      if (e.target.value === "") {
        if (field.includes("quantityNew")) {
          updatedValues[`quantityAdjusted${recordKey}`] = "";
        } else if (field.includes("quantityAdjusted")) {
          updatedValues[`quantityNew${recordKey}`] = "";
        } else if (field.includes("changedValue")) {
          updatedValues[`adjustedValue${recordKey}`] = "";
        } else if (field.includes("adjustedValue")) {
          updatedValues[`changedValue${recordKey}`] = "";
        }
      } else {
        if (field.includes("quantityNew")) {
          updatedValues[`quantityAdjusted${recordKey}`] = value - availableQty;
        } else if (field.includes("quantityAdjusted")) {
          updatedValues[`quantityNew${recordKey}`] = availableQty + value;
        } else if (field.includes("changedValue")) {
          updatedValues[`adjustedValue${recordKey}`] = value - currentValue;
        } else if (field.includes("adjustedValue")) {
          updatedValues[`changedValue${recordKey}`] = currentValue + value;
        }
      }

      form.setFieldsValue(updatedValues);
    },
    [form]
  );

  const columns = useMemo(() => {
    if (adjustmentType === "q") {
      return [
        // {
        //   title: "Product Details",
        //   dataIndex: "itemImg",
        //   key: "itemImg",
        //   width: "5%",
        //   colSpan: 2,
        //   render: () => <ImageOutlined style={{ opacity: "50%" }} />,
        // },
        {
          title: "Product Details",
          dataIndex: "name",
          key: "name",
          width: "20%",
          render: (text, record) => (
            <>
              {text && (
                <Flex
                  vertical
                  style={{
                    marginBottom: "24px",
                    paddingRight: "0.5rem",
                    minWidth: "240px",
                  }}
                >
                  <Flex justify="space-between">
                    {text}
                    <CloseCircleOutlined
                      onClick={() =>
                        handleRemoveSelectedItem(record.id, record.key)
                      }
                    />
                  </Flex>
                  <div>
                    {record.sku ? (
                      <>
                        <span style={{ fontSize: "var(--small-text)" }}>
                          SKU: {record.sku}{" "}
                        </span>
                        <Divider type="vertical" />
                      </>
                    ) : (
                      <div></div>
                    )}
                    {/* {record.currentQty || record.currentQty === 0 ? (
                      <span
                        style={{
                          fontSize: "var(--small-text)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Stock on Hand :{" "}
                        <FormattedNumber
                          value={record.currentQty}
                          style="decimal"
                          minimumFractionDigits={record.unit?.precision}
                        />{" "}
                        {record.unit && record.unit.abbreviation}
                      </span>
                    ) : (
                      <div></div>
                    )} */}
                  </div>
                </Flex>
              )}
              <Form.Item
                hidden={text}
                name={`product${record.key}`}
                rules={[
                  {
                    required: text ? false : true,
                    message: (
                      <FormattedMessage
                        id="label.product.required"
                        defaultMessage="Select the Product"
                      />
                    ),
                  },
                ]}
              >
                <AutoComplete
                  loading={stockLoading}
                  className="custom-select"
                  style={{
                    minWidth: "250px",
                  }}
                  placeholder="Type or click to select a product."
                  optionFilterProp="label"
                  filterOption={(inputValue, option) =>
                    option.label
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onSelect={(value) => handleSelectItem(value, record.key)}
                >
                  {productStocks?.map((option) => (
                    <AutoComplete.Option
                      value={option.id}
                      key={option.id}
                      label={option.name}
                    >
                      <div className="item-details-select" key={option.id}>
                        <div className="item-details-select-list">
                          <span>{option.name}</span>
                          <span>Stock on Hand</span>
                        </div>
                        <div className="item-details-select-list">
                          <span>SKU: {option.sku}</span>
                          <span
                            className="stock-on-hand"
                            style={{
                              color:
                                option.currentQty === 0
                                  ? "red"
                                  : "var(--light-green)",
                            }}
                          >
                            <FormattedNumber
                              value={option.currentQty || 0}
                              style="decimal"
                              minimumFractionDigits={option.unit?.precision}
                            />{" "}
                            {option.unit && option.unit.abbreviation}
                          </span>
                        </div>
                      </div>
                    </AutoComplete.Option>
                  ))}
                </AutoComplete>
                {/* <AutoSuggest
                  items={items}
                  onSelect={handleSelectItem}
                  rowKey={record.key}
                /> */}
              </Form.Item>
            </>
          ),
        },
        {
          title: "Quantity Available",
          dataIndex: "currentQty",
          key: "currentQty",
          align: "right",
          verticalAlign: "top",
          width: "15%",
          render: (_, record) => (
            <Flex justify="end" align="start" style={{ height: "3.6rem" }}>
              {record.currentQty && (
                <>
                  <FormattedNumber
                    value={record.currentQty || 0}
                    style="decimal"
                    minimumFractionDigits={record.unit?.precision}
                  />
                  {record.unit && record.unit.abbreviation}
                </>
              )}
            </Flex>
          ),
        },
        {
          title: "New Quantity On Hand",
          dataIndex: "quantityNew",
          key: "quantityNew",
          align: "right",
          width: "15%",
          render: (text, record) => (
            <Form.Item
              name={`quantityNew${record.key}`}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.quantity.required"
                      defaultMessage="Enter the Quantity"
                    />
                  ),
                },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    } else if (isNaN(value) || value.length > 20) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "validation.invalidInput",
                          defaultMessage: "Invalid Input",
                        })
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <Input
                placeholder="0"
                maxLength={15}
                value={text ? text : "1.00"}
                className="text-align-right "
                onBlur={(e) =>
                  handleBlur(`quantityNew${record.key}`, record, e)
                }
              />
            </Form.Item>
          ),
        },
        {
          title: "Quantity Adjusted",
          dataIndex: "quantityAdjusted",
          key: "quantityAdjusted",
          align: "right",
          width: "15%",
          render: (text, record) => (
            <Form.Item
              name={`quantityAdjusted${record.key}`}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.quantity.required"
                      defaultMessage="Enter the Quantity"
                    />
                  ),
                },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    } else if (isNaN(value) || value.length > 20) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "validation.invalidInput",
                          defaultMessage: "Invalid Input",
                        })
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <Input
                placeholder="Eg. +10, -10"
                maxLength={15}
                value={text ? text : "1.00"}
                className="text-align-right "
                onBlur={(e) =>
                  handleBlur(`quantityAdjusted${record.key}`, record, e)
                }
              />
            </Form.Item>
          ),
        },
        {
          title: "",
          dataIndex: "actions",
          key: "actions",
          width: "5%",
          render: (_, record) => (
            <Flex
              justify="center"
              align="center"
              style={{ marginBottom: "24px" }}
            >
              <CloseCircleOutlined
                style={{ color: "red" }}
                onClick={() => handleRemoveRow(record.key)}
              />
            </Flex>
          ),
        },
      ];
    } else {
      return [
        // {
        //   title: "Product Details",
        //   dataIndex: "itemImg",
        //   key: "itemImg",
        //   width: "5%",
        //   colSpan: 2,
        //   render: () => <ImageOutlined style={{ opacity: "50%" }} />,
        // },
        {
          title: "Product Details",
          dataIndex: "name",
          key: "name",
          width: "20%",
          render: (text, record) => (
            <>
              {text && (
                <Flex
                  vertical
                  style={{
                    marginBottom: "24px",
                    paddingRight: "0.5rem",
                    minWidth: "240px",
                  }}
                >
                  <Flex justify="space-between">
                    {text}
                    <CloseCircleOutlined
                      onClick={() =>
                        handleRemoveSelectedItem(record.id, record.key)
                      }
                    />
                  </Flex>
                  <div>
                    {record.sku ? (
                      <>
                        <span style={{ fontSize: "var(--small-text)" }}>
                          SKU: {record.sku}{" "}
                        </span>
                        <Divider type="vertical" />
                      </>
                    ) : (
                      <div></div>
                    )}
                    {record.currentQty || record.currentQty === 0 ? (
                      <span
                        style={{
                          fontSize: "var(--small-text)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Stock on Hand :{" "}
                        <FormattedNumber
                          value={record.currentQty}
                          style="decimal"
                          minimumFractionDigits={record.unit?.precision}
                        />{" "}
                        {record.unit && record.unit.abbreviation}
                      </span>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </Flex>
              )}
              <Form.Item
                hidden={text}
                name={`product${record.key}`}
                rules={[
                  {
                    required: text ? false : true,
                    message: (
                      <FormattedMessage
                        id="label.product.required"
                        defaultMessage="Select the Product"
                      />
                    ),
                  },
                ]}
              >
                <AutoComplete
                  loading={stockLoading}
                  className="custom-select"
                  style={{
                    minWidth: "250px",
                  }}
                  placeholder="Type or click to select a product."
                  optionFilterProp="label"
                  filterOption={(inputValue, option) =>
                    option.label
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onSelect={(value) => handleSelectItem(value, record.key)}
                >
                  {productStocks?.map((option) => (
                    <AutoComplete.Option
                      value={option.id}
                      key={option.id}
                      label={option.name}
                    >
                      <div className="item-details-select" key={option.id}>
                        <div className="item-details-select-list">
                          <span>{option.name}</span>
                          <span>Stock on Hand</span>
                        </div>
                        <div className="item-details-select-list">
                          <span>SKU: {option.sku}</span>
                          <span
                            className="stock-on-hand"
                            style={{
                              color:
                                option.currentQty === 0
                                  ? "red"
                                  : "var(--light-green)",
                            }}
                          >
                            {" "}
                            <FormattedNumber
                              value={option.currentQty}
                              style="decimal"
                              minimumFractionDigits={option.unit?.precision}
                            />{" "}
                            {option.unit && option.unit.abbreviation}
                          </span>
                        </div>
                      </div>
                    </AutoComplete.Option>
                  ))}
                </AutoComplete>
                {/* <AutoSuggest
                  items={items}
                  onSelect={handleSelectItem}
                  rowKey={record.key}
                /> */}
              </Form.Item>
            </>
          ),
        },
        {
          title: "Current Value",
          dataIndex: "currentValue",
          key: "currentValue",
          width: "15%",
          align: "right",
          render: (_, record) => (
            <Flex justify="end" align="start" style={{ height: "3.6rem" }}>
              {(record.currentQty * record.purchasePrice ||
                record.currentQty * record.purchasePrice === 0) &&
                business.baseCurrency?.symbol}{" "}
              {record.currentQty * record.purchasePrice}
            </Flex>
          ),
        },
        {
          title: "Changed Value",
          dataIndex: "changedValue",
          key: "changedValue",
          align: "right",
          width: "15%",
          render: (text, record) => (
            <Form.Item
              name={`changedValue${record.key}`}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.value.required"
                      defaultMessage="Enter the Value"
                    />
                  ),
                },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    } else if (isNaN(value) || value.length > 20) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "validation.invalidInput",
                          defaultMessage: "Invalid Input",
                        })
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <Input
                placeholder="0"
                maxLength={15}
                value={text ? text : "1.00"}
                className="text-align-right "
                onBlur={(e) =>
                  handleBlur(`changedValue${record.key}`, record, e)
                }
              />
            </Form.Item>
          ),
        },
        {
          title: "Adjusted Value",
          dataIndex: "adjustedValue",
          key: "adjustedValue",
          align: "right",
          width: "15%",
          render: (text, record) => (
            <Form.Item
              name={`adjustedValue${record.key}`}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.value.required"
                      defaultMessage="Enter the Value"
                    />
                  ),
                },
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    } else if (isNaN(value) || value.length > 20) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "validation.invalidInput",
                          defaultMessage: "Invalid Input",
                        })
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <Input
                placeholder="Eg. +10, -10"
                maxLength={15}
                value={text ? text : "1.00"}
                className="text-align-right "
                onBlur={(e) =>
                  handleBlur(`adjustedValue${record.key}`, record, e)
                }
              />
            </Form.Item>
          ),
        },
        {
          title: "",
          dataIndex: "actions",
          key: "actions",
          width: "5%",
          render: (_, record) => (
            <Flex
              justify="center"
              align="center"
              style={{ marginBottom: "24px" }}
            >
              <CloseCircleOutlined
                style={{ color: "red" }}
                onClick={() => handleRemoveRow(record.key)}
              />
            </Flex>
          ),
        },
      ];
    }
  }, [
    adjustmentType,
    handleRemoveRow,
    business.baseCurrency.symbol,
    productStocks,
    stockLoading,
    handleRemoveSelectedItem,
    handleSelectItem,
    handleBlur,
    intl,
  ]);

  return (
    <>
      <AddPurchaseProductsModal
        products={allProducts}
        data={data}
        setData={handleAddProductsInBulk}
        isOpen={addProductsModalOpen}
        setIsOpen={setAddPurchaseProductsModalOpen}
        onCancel={() => setAddPurchaseProductsModalOpen(false)}
        form={form}
      />
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="inventoryAdjustment.edit"
            defaultMessage="Edit Adjustment"
          />
        </p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        />
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <div className="page-form-wrapper">
          <Form form={form} onFinish={onFinish}>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="Mode of adjustment"
                  name="adjustmentType"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  value={adjustmentType}
                >
                  <Radio.Group onChange={handleAdjustmentTypeChange}>
                    <Space direction="vertical">
                      <Radio value="q">Quantity Adjustment</Radio>
                      <Radio value="v" disabled>
                        Value Adjustment
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={
                    <FormattedMessage id="label.date" defaultMessage="Date" />
                  }
                  name="date"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.date.required"
                          defaultMessage="Select the Date"
                        />
                      ),
                    },
                  ]}
                >
                  <DatePicker
                    onChange={(date, dateString) =>
                      console.log(date, dateString)
                    }
                    format={REPORT_DATE_FORMAT}
                  ></DatePicker>
                </Form.Item>
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.referenceNumber"
                      defaultMessage="Reference #"
                    />
                  }
                  name="referenceNumber"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                >
                  <Input></Input>
                </Form.Item>
                <Form.Item
                  name="account"
                  label={
                    <FormattedMessage
                      id="label.account"
                      defaultMessage="Account"
                    />
                  }
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.account.required"
                          defaultMessage="Select the Account"
                        />
                      ),
                    },
                  ]}
                >
                  <Select allowClear showSearch optionFilterProp="label">
                    {accounts?.map((account) => (
                      <Select.Option
                        key={account.id}
                        value={account.id}
                        label={account.name}
                      >
                        {account.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.branch"
                      defaultMessage="Branch"
                    />
                  }
                  name="branch"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.branch.required"
                          defaultMessage="Select the Branch"
                        />
                      ),
                    },
                  ]}
                >
                  <Select showSearch optionFilterProp="label">
                    {branches?.map((branch) => (
                      <Select.Option
                        key={branch.id}
                        value={branch.id}
                        label={branch.name}
                      >
                        {branch.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.warehouseName"
                      defaultMessage="Warehouse Name"
                    />
                  }
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  labelAlign="left"
                  name="warehouse"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.warehouse.required"
                          defaultMessage="Select the Warehouse"
                        />
                      ),
                    },
                  ]}
                >
                  <Select
                    // placeholder="Select or type to add"
                    showSearch
                    allowClear
                    loading={loading}
                    optionFilterProp="label"
                    onChange={(value) => setSelectedWarehouse(value)}
                  >
                    {warehouses?.map((w) => (
                      <Select.Option key={w.id} value={w.id} label={w.name}>
                        {w.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Reason"
                  name="reason"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.reason.required"
                          defaultMessage="Enter the Reason"
                        />
                      ),
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.description"
                      defaultMessage="Description"
                    />
                  }
                  name="description"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                >
                  <Input.TextArea rows="4" />
                </Form.Item>
              </Col>
            </Row>
            <br />
            <>
              <Divider />
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.warehouseName"
                    defaultMessage="Warehouse Name"
                  />
                }
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                labelAlign="left"
                name="warehouse"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.warehouse.required"
                        defaultMessage="Select the Warehouse"
                      />
                    ),
                  },
                ]}
              >
                <Select
                  // placeholder="Select or type to add"
                  showSearch
                  loading={loading}
                  optionFilterProp="label"
                  onChange={(value) => setSelectedWarehouse(value)}
                >
                  {warehouses?.map((w) => (
                    <Select.Option key={w.id} value={w.id} label={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {selectedWarehouse && (
                <>
                  <Table
                    loading={stockLoading}
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered
                    // className="item-details-table"
                  />
                  <br />
                  <Button
                    icon={<PlusCircleFilled className="plus-circle-icon" />}
                    onClick={handleAddRow}
                    className="add-row-item-btn"
                  >
                    <span>
                      <FormattedMessage
                        id="button.addNewRow"
                        defaultMessage="Add New Row"
                      />
                    </span>
                  </Button>{" "}
                  {adjustmentType === "q" && (
                    <>
                      <Divider type="vertical" />
                      <Button
                        icon={<PlusCircleFilled className="plus-circle-icon" />}
                        className="add-row-item-btn"
                        onClick={() => setAddPurchaseProductsModalOpen(true)}
                      >
                        <span>
                          <FormattedMessage
                            id="button.addProductsInBulk"
                            defaultMessage="Add Products in Bulk"
                          />
                        </span>
                      </Button>
                    </>
                  )}
                </>
              )}
            </>
            <br />
            <UploadAttachment
              onCustomFileListChange={(customFileList) =>
                setFileList(customFileList)
              }
              files={record?.documents}
            />
            <div className="page-actions-bar page-actions-bar-margin">
              {!record.currentStatus === "Adjusted" && (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="page-actions-btn"
                  loading={loading}
                  onClick={() => setSaveStatus("Draft")}
                >
                  {
                    <FormattedMessage
                      id="button.saveAsDraft"
                      defaultMessage="Save As Draft"
                    />
                  }
                </Button>
              )}
              {record.currentStatus === "Draft" && (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="page-actions-btn"
                  loading={loading}
                  onClick={() => setSaveStatus("Draft")}
                >
                  <FormattedMessage id="button.save" defaultMessage="Save" />
                </Button>
              )}
              <Button
                type="primary"
                htmlType="submit"
                className="page-actions-btn"
                loading={loading}
                onClick={() => setSaveStatus("Adjusted")}
              >
                {record.currentStatus === "Adjusted" ? (
                  <FormattedMessage id="button.save" defaultMessage="Save" />
                ) : (
                  <FormattedMessage
                    id="button.convertToAdjusted"
                    defaultMessage="Convert To Adjusted"
                  />
                )}
              </Button>
              <Button
                className="page-actions-btn"
                loading={loading}
                onClick={() =>
                  navigate(from, { state: location.state, replace: true })
                }
              >
                {
                  <FormattedMessage
                    id="button.cancel"
                    defaultMessage="Cancel"
                  />
                }
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default InventoryAdjustmentsEdit;
