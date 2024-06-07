import React, { useState, useMemo, useCallback } from "react";
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
import { AddPurchaseProductsModal } from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { InventoryAdjustmentMutations, StockQueries } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { CREATE_INVENTORY_ADJUSTMENT } = InventoryAdjustmentMutations;
const { GET_AVAILABLE_STOCKS } = StockQueries;

const InventoryAdjustmentsNew = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.clonePO;
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
  const [data, setData] = useState(
    record
      ? record.details?.map((detail, index) => ({
          key: index + 1,
          name: detail.name,
          id: detail.productType + detail.productId,
          quantity: detail.detailQty,
        }))
      : [
          {
            key: 1,
          },
        ]
  );
  const [addProductsModalOpen, setAddPurchaseProductsModalOpen] =
    useState(false);
  const [tableKeyCounter, setTableKeyCounter] = useState(
    record?.details?.length || 1
  );
  const [saveStatus, setSaveStatus] = useState("Draft");
  const [adjustmentType, setAdjustmentType] = useState("q");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

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
  const [createInventoryAdjustment, { loading: createLoading }] = useMutation(
    CREATE_INVENTORY_ADJUSTMENT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="inventoryAdjustment.created"
            defaultMessage="New Inventory Adjustment Created"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = createLoading;

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

  console.log("all product", allProducts);

  useMemo(() => {
    // const taxId = record?.supplierTaxType + record?.supplierTaxId;
    const parsedRecord = record
      ? {
          supplierName: record?.supplierName,
          branch: record?.branch?.id,
          referenceNumber: record?.referenceNumber,
          date: dayjs(record?.orderDate),
          deliveryDate: dayjs(record?.expectedDeliveryDate),
          deliveryWarehouse:
            record?.deliveryWarehouseId === 0
              ? null
              : record?.deliveryWarehouseId,
          deliveryAddress: record?.deliveryAddress,
          shipmentPreference:
            record?.shipmentPreference.id === 0
              ? null
              : record?.shipmentPreference.id,
          paymentTerms: record?.orderPaymentTerms,
          customDays: record?.orderPaymentTermsCustomDays,
          currency: record?.currency?.id,
          exchangeRate: record?.exchangeRate,
          warehouse: record?.warehouse.id,
          customerNotes: record?.notes,
          discount: record?.orderDiscount,
          adjustment: record?.adjustmentAmount || null,
          // Map transactions to form fields
          ...record?.details?.reduce((acc, d, index) => {
            acc[`account${index + 1}`] = d.detailAccount.id || null;
            acc[`quantity${index + 1}`] = d.detailQty;
            acc[`rate${index + 1}`] = d.detailUnitRate;
            acc[`detailDiscount${index + 1}`] = d.detailDiscount;
            acc[`detailTax${index + 1}`] =
              d.detailTax?.id !== "I0" ? d.detailTax?.id : null;
            acc[`detailDiscountType${index + 1}`] = d.detailDiscountType;
            return acc;
          }, {}),
        }
      : {
          currency: business.baseCurrency.id,
          paymentTerms: "DueOnReceipt",
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
      if (!(item.name || values[`product${item.key}`])) {
        foundInvalid = true;
      }
      const productId = item.id;
      const detailProductType = productId ? Array.from(productId)[0] : "S";
      let detailProductId = productId
        ? parseInt(productId?.replace(/[SGCV]/, ""), 10)
        : 0;
      if (isNaN(detailProductId)) detailProductId = 0;
      return {
        productId: detailProductId,
        productType: detailProductType,
        name: item.name || values[`product${item.key}`],
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
    };
    // console.log("Transactions", transactions);
    console.log("Input", input);
    await createInventoryAdjustment({
      variables: { input: input },
    });
  };

  const handleAddRow = () => {
    const newRowKey = tableKeyCounter + 1;
    setTableKeyCounter(tableKeyCounter + 1);
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
    let newData = [];
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

    if (existingItems.length > 0) {
      const updatedData = data.map((dataItem) => {
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
      newData = updatedData;
    }

    const nonExistingItems = selectedItemsBulk.filter(
      (selectedItem) =>
        !data.some((dataItem) => dataItem.id === selectedItem.id)
    );
    console.log("non existing items", nonExistingItems);
    if (nonExistingItems.length > 0) {
      // const maxKey = Math.max(...data.map((dataItem) => dataItem.key));
      let newRowKey = tableKeyCounter;

      selectedItemsBulk.forEach((selectedItem, index) => {
        newRowKey++;
        const newDataItem = {
          ...selectedItem,
          key: newRowKey,
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
  };

  const handleSelectItem = useCallback(
    (value, rowKey) => {
      const selectedItem = productStocks?.find(
        (product) => product.id === value
      );
      const dataIndex = data.findIndex((dataItem) => dataItem.key === rowKey);
      if (dataIndex !== -1) {
        const oldData = data[dataIndex];
        let newData = {
          key: rowKey,
          name: value,
          currentQty: selectedItem.currentQty,
          value: selectedItem.purchasePrice * selectedItem.currentQty,
          purchasePrice: selectedItem.purchasePrice,
          costPrice: selectedItem.costPrice,
          ...oldData,
        };
        console.log(selectedItem);
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
    [productStocks, data, form, intl, notiApi]
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
      const currentValue = record.value;

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
                <div style={{ marginBottom: "24px", paddingInline: "0.5rem" }}>
                  <Flex justify="space-between">
                    {text}
                    <CloseCircleOutlined
                      onClick={() =>
                        handleRemoveSelectedItem(record.id, record.key)
                      }
                    />
                  </Flex>
                  <div>SKU: {record.sku}</div>
                </div>
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
                  className="custom-select"
                  style={{
                    width: 200,
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
                          <span className="stock-on-hand">
                            {option.stocks?.qty}
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
              {record.currentQty}
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
                <div style={{ marginBottom: "24px", paddingInline: "0.5rem" }}>
                  <Flex justify="space-between">
                    {text}
                    <CloseCircleOutlined
                      onClick={() =>
                        handleRemoveSelectedItem(record.id, record.key)
                      }
                    />
                  </Flex>
                  <div>SKU: {record.sku}</div>
                </div>
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
                  className="custom-select"
                  style={{
                    width: 200,
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
                          <span className="stock-on-hand">
                            {option.stocks?.qty}
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
              {(record.value || record.value === 0) &&
                business.baseCurrency?.symbol}{" "}
              {record.value}
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

    handleRemoveSelectedItem,
    handleSelectItem,
    handleBlur,
    intl,
  ]);

  return (
    <>
      <AddPurchaseProductsModal
        products={productStocks}
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
            id="inventoryAdjustment.new"
            defaultMessage="New Adjustment"
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
        <Form form={form} onFinish={onFinish}>
          <Row>
            <Col span={12}>
              <Form.Item
                label="Mode of adjustment"
                name="adjustmentType"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
              >
                <Radio.Group
                  defaultValue="q"
                  onChange={handleAdjustmentTypeChange}
                >
                  <Space direction="vertical">
                    <Radio value="q">Quantity Adjustment</Radio>
                    <Radio value="v">Value Adjustment</Radio>
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
                  onChange={(date, dateString) => console.log(date, dateString)}
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
                  <FormattedMessage id="label.branch" defaultMessage="Branch" />
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
            <Divider style={{ margin: 0 }} />
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
              <FormattedMessage
                id="button.addNewRow"
                defaultMessage="Add New Row"
              />
            </Button>
            {adjustmentType === "q" && (
              <>
                <Divider type="vertical" />
                <Button
                  icon={<PlusCircleFilled className="plus-circle-icon" />}
                  className="add-row-item-btn"
                  onClick={() => setAddPurchaseProductsModalOpen(true)}
                >
                  <FormattedMessage
                    id="button.addProductsInBulk"
                    defaultMessage="Add Products in Bulk"
                  />
                </Button>
              </>
            )}
          </>
          <br />
          <div className="attachment-upload">
            <p>
              <FormattedMessage
                id="label.attachments"
                defaultMessage="Attachments"
              />
            </p>
            <Button
              type="dashed"
              icon={<UploadOutlined />}
              className="attachment-upload-button"
            >
              <FormattedMessage
                id="button.uploadFile"
                defaultMessage="Upload File"
              />
            </Button>
            <p>
              <FormattedMessage
                id="label.uploadLimit"
                defaultMessage="You can upload a maximum of 5 files, 5MB each"
              />
            </p>
          </div>
          <div className="page-actions-bar page-actions-bar-margin">
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
            <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              loading={loading}
              onClick={() => setSaveStatus("Adjusted")}
            >
              {
                <FormattedMessage
                  id="button.convertToAdjusted"
                  defaultMessage="Convert To Adjusted"
                />
              }
            </Button>
            <Button
              className="page-actions-btn"
              loading={loading}
              onClick={() =>
                navigate(from, { state: location.state, replace: true })
              }
            >
              {<FormattedMessage id="button.cancel" defaultMessage="Cancel" />}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default InventoryAdjustmentsNew;
