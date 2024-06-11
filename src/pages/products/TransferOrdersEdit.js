import React, { useState, useMemo, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Divider,
  Flex,
  Row,
  Col,
  AutoComplete,
} from "antd";
import {
  CloseCircleOutlined,
  PlusCircleFilled,
  UploadOutlined,
  CloseOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useReadQuery, useMutation, gql, useQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { AddPurchaseProductsModal, UploadAttachment } from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import { TransferOrderMutations, StockQueries } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";

const { UPDATE_TRANSFER_ORDER } = TransferOrderMutations;
const { GET_AVAILABLE_STOCKS } = StockQueries;

const TransferOrdersEdit = () => {
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
    allWarehousesQueryRef,
    allProductsQueryRef,
    allProductVariantsQueryRef,
  } = useOutletContext();
  const [data, setData] = useState(
    record
      ? record.details?.map((detail, index) => ({
          key: index + 1,
          detailId: detail.id,
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
  // const [tableKeyCounter, setTableKeyCounter] = useState(
  //   record?.details?.length || 1
  // );
  const [saveStatus, setSaveStatus] = useState("Draft");
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState(
    record?.sourceWarehouse?.id || null
  );
  const [selectedDestinationWarehouse, setSelectedDestinationWarehouse] =
    useState(record?.destinationWarehouse?.id || null);
  const [fileList, setFileList] = useState(null);

  console.log("record", record);

  // Queries
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);
  const { data: productData } = useReadQuery(allProductsQueryRef);
  const { data: productVariantData } = useReadQuery(allProductVariantsQueryRef);

  const { loading: stockLoading, data: stockData } = useQuery(
    GET_AVAILABLE_STOCKS,
    {
      skip: !selectedSourceWarehouse,
      variables: { warehouseId: selectedSourceWarehouse },
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const { loading: stockDestLoading, data: stockDestData } = useQuery(
    GET_AVAILABLE_STOCKS,
    {
      skip: !selectedDestinationWarehouse,
      variables: { warehouseId: selectedDestinationWarehouse },
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  // Mutations
  const [updateTransferOrder, { loading: createLoading }] = useMutation(
    UPDATE_TRANSFER_ORDER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="transferOrder.updated"
            defaultMessage="Transfer Order Updated"
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

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse;
  }, [warehouseData]);

  const products = useMemo(() => {
    return productData?.listAllProduct;
  }, [productData]);

  const productVariants = useMemo(() => {
    return productVariantData?.listAllProductVariant;
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

  const destStocks = useMemo(() => {
    return stockDestData?.getAvailableStocks;
  }, [stockDestData]);

  const productStocks = useMemo(() => {
    return allProducts?.map((product) => {
      const stock = stocks?.find((stockItem) => {
        const stockId = stockItem.productType + stockItem.productId;
        return stockId === product.id;
      });
      const destStock = destStocks?.find((stockItem) => {
        const stockId = stockItem.productType + stockItem.productId;
        return stockId === product.id;
      });
      return {
        ...product,
        currentQty: stock ? stock.currentQty : 0,
        unit: stock?.product?.productUnit || null,
        currentDestQty: destStock ? destStock.currentQty : 0,
        destUnit: destStock?.product?.productUnit || null,
      };
    });
  }, [allProducts, stocks, destStocks]);

  useEffect(() => {
    if (selectedSourceWarehouse && selectedDestinationWarehouse) {
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
            currentDestQty: matchingProductStock
              ? matchingProductStock.currentDestQty
              : 0,
            destUnit: matchingProductStock
              ? matchingProductStock.destUnit
              : item.destUnit,
          };
        });
      });
    }
  }, [selectedSourceWarehouse, productStocks, selectedDestinationWarehouse]);

  useMemo(() => {
    const parsedRecord = record
      ? {
          // orderNumber: record.orderNumber,
          date: dayjs(record?.transferDate),
          reason: record.reason,
          sourceWarehouse: record?.sourceWarehouse?.id || null,
          destinationWarehouse: record?.destinationWarehouse?.id || null,

          // Map transactions to form fields
          ...record?.details?.reduce((acc, d, index) => {
            acc[`quantity${index + 1}`] = d.transferQty;
            return acc;
          }, {}),
        }
      : {
          date: dayjs(),
        };

    form.setFieldsValue(parsedRecord);
  }, [form, record]);

  console.log("data", data);

  const onFinish = async (values) => {
    console.log("values", values);
    let foundInvalid = false;
    console.log(data);
    const details = data.map((item) => {
      if (
        (!(item.name || values[`product${item.key}`]) || item.quantity === 0) &&
        !item.isDeletedItem
      ) {
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
        transferQty: item.quantity || 0,
        isDeletedItem: item.isDeletedItem || false,
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

    if (selectedSourceWarehouse === selectedDestinationWarehouse) {
      openErrorNotification(
        notiApi,
        intl.formatMessage({
          id: "validation.sameWarehouse",
          defaultMessage: "Transfers cannot be made within the same warehouse.",
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
      // orderNumber: values.orderNumber,
      transferDate: values.date,
      sourceWarehouseId: values.sourceWarehouse || 0,
      destinationWarehouseId: values.destinationWarehouse || 0,
      reason: values.reason,
      currentStatus: saveStatus,
      details,
      documents: fileUrls,
    };
    console.log("Input", input);

    await updateTransferOrder({
      variables: { id: record.id, input },
      update(cache, { data: { updateTransferOrder } }) {
        cache.modify({
          fields: {
            paginateTransferOrder(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) =>
                  x.node.__ref === "TransferOrder:" + updateTransferOrder.id
              );
              if (index >= 0) {
                const newTransferOrder = cache.writeFragment({
                  data: updateTransferOrder,
                  fragment: gql`
                    fragment NewTransferOrder on TransferOrder {
                      id
                      orderNumber
                      transferDate
                      reason
                      sourceWarehouse
                      destinationWarehouse
                      details
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newTransferOrder;
                return paginationCopy;
              } else {
                return pagination;
              }
            },
          },
        });
      },
    });
  };

  const handleAddRow = () => {
    const maxKey = Math.max(...data.map((dataItem) => dataItem.key), 0);
    const newRowKey = maxKey + 1;
    setData([
      ...data,
      {
        key: newRowKey,
      },
    ]);
  };

  const handleRemoveRow = (keyToRemove) => {
    const newData = data
      .map((item) => {
        if (item.key === keyToRemove) {
          if (item.detailId) {
            return {
              ...item,
              isDeletedItem: true,
              quantity: 0,
              id: null,
            };
          } else {
            return null;
          }
        }
        return item;
      })
      .filter((item) => item !== null);

    console.log("items", newData);
    setData(newData);
    form.setFieldsValue({
      [`product${keyToRemove}`]: "",
      [`quantity${keyToRemove}`]: "",
    });
  };

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

  const handleSelectItem = (value, rowKey) => {
    const selectedItem = productStocks?.find((product) => product.id === value);
    const dataIndex = data.findIndex((dataItem) => dataItem.key === rowKey);
    if (dataIndex !== -1) {
      const oldData = data[dataIndex];
      let newData = {
        key: rowKey,
        name: value,
        quantity: oldData.quantity || 1,
        currentQty: selectedItem.currentQty,
        unit: selectedItem.unit,
        currentDestQty: selectedItem.currentDestQty,
        destUnit: selectedItem.destUnit,
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
        newData.unit = selectedItem.unit;
        newData.currentDestQty = selectedItem.currentDestQty;
        newData.destUnit = selectedItem.destUnit;
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
  };

  const handleRemoveSelectedItem = (idToRemove, rowKey) => {
    const updatedData = data.map((dataItem) => {
      if (dataItem.id === idToRemove) {
        return { key: dataItem.key, amount: 0 };
      }
      return dataItem;
    });
    setData(updatedData);
    form.setFieldsValue({
      [`product${rowKey}`]: "",
      [`quantity${rowKey}`]: "",
    });
  };

  const handleQuantityChange = (value, rowKey) => {
    const updatedData = data.map((item) => {
      if (item.key === rowKey) {
        const quantity = parseFloat(value) || 0;

        return { ...item, quantity };
      }
      return item;
    });
    setData(updatedData);
  };

  const handleWarehouseChange = (value, type) => {
    const sourceWarehouse = form.getFieldValue("sourceWarehouse");
    const destinationWarehouse = form.getFieldValue("destinationWarehouse");

    if (type === "source" && value === destinationWarehouse) {
      openErrorNotification(
        notiApi,
        intl.formatMessage({
          id: "validation.sameWarehouse",
          defaultMessage:
            "Transfers cannot be made within the same warehouse. Please select a different one",
        })
      );
      form.setFieldsValue({ sourceWarehouse: null });
    } else if (type === "destination" && value === sourceWarehouse) {
      openErrorNotification(
        notiApi,
        intl.formatMessage({
          id: "validation.sameWarehouse",
          defaultMessage:
            "Transfers cannot be made within the same warehouse. Please select a different one",
        })
      );
      form.setFieldsValue({ destinationWarehouse: null });
    }
  };

  const columns = [
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
                option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
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
      title: "Current Availability",
      dataIndex: "currentQty",
      key: "currentQty",
      width: "10%",
      colSpan: 2,
      render: (_, record) => (
        <Flex vertical>
          <span style={{ opacity: "70%" }}>Source Stock</span>
          <span>
            <FormattedNumber
              value={record.currentQty || 0}
              style="decimal"
              minimumFractionDigits={record.unit?.precision}
            />
            {record.unit && record.unit.abbreviation}
          </span>
        </Flex>
      ),
    },
    {
      title: "Current Availability",
      dataIndex: "currentDestQty",
      key: "currentDestQty",
      width: "10%",
      colSpan: 0,
      render: (_, record) => (
        <Flex vertical>
          <span style={{ opacity: "70%" }}>Destination Stock</span>
          <span>
            <FormattedNumber
              value={record.currentDestQty || 0}
              style="decimal"
              minimumFractionDigits={record.destUnit?.precision}
            />
            {record.destUnit && record.destUnit.abbreviation}
          </span>
        </Flex>
      ),
    },

    {
      title: "Transfer Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      width: "15%",
      render: (text, record) => (
        <Form.Item
          name={`quantity${record.key}`}
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
            maxLength={15}
            value={text ? text : "1.00"}
            className="text-align-right "
            onBlur={(e) => handleQuantityChange(e.target.value, record.key)}
          />
        </Form.Item>
      ),
    },

    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "3%",
      render: (_, record) => (
        <Flex justify="center" align="center" style={{ marginBottom: "24px" }}>
          <CloseCircleOutlined
            style={{ color: "red" }}
            onClick={() => handleRemoveRow(record.key)}
          />
        </Flex>
      ),
    },
  ];

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
            id="transferOrder.edit"
            defaultMessage="Edit Transfer Order"
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
            <Col span={10}>
              {/* <Form.Item
                label="Transfer Order"
                name="orderNumber"
                labelAlign="left"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 12 }}
              >
                <Input
                // suffix={
                //   <SettingOutlined onClick={() => setSettingModalOpen(true)} />
                // }
                />
              </Form.Item> */}
            </Col>
          </Row>

          <Row>
            <Col span={10}>
              <Form.Item
                label={
                  <FormattedMessage id="label.date" defaultMessage="Date" />
                }
                name="date"
                labelAlign="left"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 12 }}
              >
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Form.Item
                label={
                  <FormattedMessage id="label.reason" defaultMessage="Reason" />
                }
                name="reason"
                labelAlign="left"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 12 }}
              >
                <Input.TextArea rows="4" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Row>
            <Col span={10} className="warehouse-input-col">
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.sourceWarehouse"
                    defaultMessage="Source Warehouse"
                  />
                }
                name="sourceWarehouse"
                labelAlign="left"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 12 }}
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
                  showSearch
                  allowClear
                  loading={loading}
                  optionFilterProp="label"
                  onChange={(value) => setSelectedSourceWarehouse(value)}
                >
                  {warehouses?.map((w) => (
                    <Select.Option key={w.id} value={w.id} label={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              span={1}
              className="swap-icon-container"
              style={{
                textAlign: "center",
                paddingTop: "0.6rem",
                verticalAlign: "middle",
              }}
            >
              <SwapOutlined />
            </Col>
            <Col span={10} offset={1}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.destinationWarehouse"
                    defaultMessage="Destination Warehouse"
                  />
                }
                name="destinationWarehouse"
                labelAlign="left"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 12 }}
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
                  showSearch
                  allowClear
                  loading={loading}
                  optionFilterProp="label"
                  onChange={(value) => setSelectedDestinationWarehouse(value)}
                >
                  {warehouses?.map((w) => (
                    <Select.Option key={w.id} value={w.id} label={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <br />
          <>
            <Divider style={{ margin: 0 }} />
            <Table
              loading={stockLoading || stockDestLoading}
              bordered
              columns={columns}
              dataSource={data.filter((item) => !item.isDeletedItem)}
              pagination={false}
              className="item-details-table"
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
            </Button>
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
          <br />
          <UploadAttachment
            onCustomFileListChange={(customFileList) =>
              setFileList(customFileList)
            }
            files={record?.documents}
          />
          <div className="page-actions-bar page-actions-bar-margin">
            <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              loading={loading}
              onClick={() => setSaveStatus("Draft")}
              disabled={record?.currentStatus !== "Draft"}
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
              onClick={() => setSaveStatus("Confirmed")}
              disabled={record?.currentStatus === "Closed"}
            >
              {
                <FormattedMessage
                  id="button.saveAndConfirm"
                  defaultMessage="Save And Confirm"
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

export default TransferOrdersEdit;
