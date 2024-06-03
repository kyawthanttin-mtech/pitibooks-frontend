import React, { useState, useMemo } from "react";
import { Button, Row, Space, Table, Input, Select, Form, Flex } from "antd";
import "./OpeningStock.css";
import {
  CloseOutlined,
  CheckCircleFilled,
  RightOutlined,
  // LeftOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useReadQuery, useMutation } from "@apollo/client";
import { OpeningStockMutations } from "../../graphql";
const { CREATE_OPENING_STOCK_GROUP } = OpeningStockMutations;

const OpeningStock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const record = location.state?.record;
  const intl = useIntl();
  const [data, setData] = useState(
    record.variants.map((variant) => ({
      ...variant,
      warehouseRows: [
        {
          warehouseName: "",
          openingStock: "",
          openingStockValue: "",
        },
      ],
    }))
  );
  // const from = location.state?.from?.pathname || "/";
  const { notiApi, msgApi, allWarehousesQueryRef, business } =
    useOutletContext();

  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  // Mutations
  const [createOpeningStock, { loading: createLoading }] = useMutation(
    CREATE_OPENING_STOCK_GROUP,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="openingStock.created"
            defaultMessage="New Opening Stock Created"
          />
        );
        navigate("/productGroups");
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const handleAddWarehouseRow = (productIndex) => {
    const newData = [...data];
    newData[productIndex].warehouseRows.push({
      warehouseName: "",
      openingStock: "",
      openingStockValue: "",
    });
    setData(newData);
  };

  const handleRemoveWarehouseRow = (productIndex, warehouseIndex) => {
    const newData = [...data];
    newData[productIndex].warehouseRows.splice(warehouseIndex, 1);
    // removes the warehouse row at the specified warehouseIndex.
    // then shifts the form values for all rows after the removed one up by one position, filling the gap left by the removed row.
    // resets the fields of the last row, which is now empty and should not have any data.
    for (
      let i = warehouseIndex;
      i < newData[productIndex].warehouseRows.length;
      i++
    ) {
      form.setFieldsValue({
        [`warehouse-${productIndex}-${i}`]: form.getFieldValue(
          `warehouse-${productIndex}-${i + 1}`
        ),
        [`openingStock-${productIndex}-${i}`]: form.getFieldValue(
          `openingStock-${productIndex}-${i + 1}`
        ),
        [`openingStockValue-${productIndex}-${i}`]: form.getFieldValue(
          `openingStockValue-${productIndex}-${i + 1}`
        ),
      });
    }

    form.resetFields([
      `warehouse-${productIndex}-${newData[productIndex].warehouseRows.length}`,
      `openingStock-${productIndex}-${newData[productIndex].warehouseRows.length}`,
      `openingStockValue-${productIndex}-${newData[productIndex].warehouseRows.length}`,
    ]);

    setData(newData);
  };

  const onFinish = async (values) => {
    try {
      const input = data.flatMap((product, productIndex) =>
        product.warehouseRows.map((warehouse, warehouseIndex) => ({
          productVariantId: product.ID,
          warehouseId: values[`warehouse-${productIndex}-${warehouseIndex}`],
          unitValue:
            values[`openingStockValue-${productIndex}-${warehouseIndex}`],
          qty: values[`openingStock-${productIndex}-${warehouseIndex}`],
        }))
      );

      console.log("id", record.id);
      console.log("Input:", input);
      console.log("values", values);

      await createOpeningStock({
        variables: { groupId: record.id, input: input },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  console.log("DATA", data);

  const columns = [
    {
      title: (
        <FormattedMessage
          id="label.productName"
          defaultMessage="Product Name"
        />
      ),
      dataIndex: "name",
      key: "name",
    },
    {
      title: (
        <FormattedMessage
          id="label.warehouseName"
          defaultMessage="Warehouse Name"
        />
      ),
      dataIndex: "warehouseRows",
      key: "warehouseName",
      width: "20%",
      render: (warehouseRows, record, productIndex) => (
        <>
          {warehouseRows.map((warehouse, warehouseIndex) => (
            <div key={`warehouse-${productIndex}-${warehouseIndex}`}>
              <Form.Item
                name={`warehouse-${productIndex}-${warehouseIndex}`}
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
                <Select showSearch className="custom-select">
                  {warehouses?.map((w) => (
                    <Select.Option key={w.id} value={w.id} label={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {warehouseIndex === warehouseRows.length - 1 && (
                <>
                  {warehouseRows.length < warehouses.length && (
                    <Button
                      style={{ padding: 0 }}
                      icon={<PlusOutlined className="add-icon" />}
                      type="link"
                      onClick={() => handleAddWarehouseRow(productIndex)}
                    >
                      Add Warehouse
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </>
      ),
    },
    {
      title: (
        <>
          <Row>
            <FormattedMessage
              id="label.openingStock"
              defaultMessage="Opening Stock"
            />
          </Row>
          <Row>
            <Button
              style={{ padding: 0 }}
              type="link"
              onClick={() => {
                const firstRowValues = form.getFieldValue(
                  `openingStock-0-${data[0].warehouseRows.length > 0 ? 0 : ""}`
                );
                data.forEach((product, productIndex) => {
                  product.warehouseRows.forEach((_, warehouseIndex) => {
                    form.setFieldsValue({
                      [`openingStock-${productIndex}-${warehouseIndex}`]:
                        firstRowValues,
                    });
                  });
                });
              }}
            >
              <FormattedMessage
                id="action.copyToAll"
                defaultMessage="Copy to All"
              />
            </Button>
          </Row>
        </>
      ),
      dataIndex: "warehouseRows",
      key: "openingStock",
      width: "20%",
      render: (warehouseRows, record, productIndex) => (
        <>
          {warehouseRows.map((warehouse, warehouseIndex) => (
            <Form.Item
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.openingStock.required"
                      defaultMessage="Enter the Opening Stock"
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
              key={`openingStock-${productIndex}-${warehouseIndex}`}
              name={`openingStock-${productIndex}-${warehouseIndex}`}
            >
              <Input />
            </Form.Item>
          ))}
        </>
      ),
    },
    {
      title: (
        <>
          <Row>
            <FormattedMessage
              id="label.openingStockValue"
              defaultMessage="Opening Stock Value"
            />
          </Row>
          <Row>
            <Button
              style={{ padding: 0 }}
              type="link"
              onClick={() => {
                const firstRowValues = form.getFieldValue(
                  `openingStockValue-0-${
                    data[0].warehouseRows.length > 0 ? 0 : ""
                  }`
                );
                data.forEach((product, productIndex) => {
                  product.warehouseRows.forEach((_, warehouseIndex) => {
                    form.setFieldsValue({
                      [`openingStockValue-${productIndex}-${warehouseIndex}`]:
                        firstRowValues,
                    });
                  });
                });
              }}
            >
              <FormattedMessage
                id="action.copyToAll"
                defaultMessage="Copy to All"
              />
            </Button>
          </Row>
        </>
      ),
      dataIndex: "warehouseRows",
      key: "openingStockValue",
      width: "20%",
      render: (warehouseRows, record, productIndex) => (
        <>
          {warehouseRows.map((warehouse, warehouseIndex) => (
            <Form.Item
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.openingStockValue.required"
                      defaultMessage="Enter the Opening Stock Value"
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
              key={`openingStockValue-${productIndex}-${warehouseIndex}`}
              name={`openingStockValue-${productIndex}-${warehouseIndex}`}
            >
              <Input addonBefore={business.baseCurrency.symbol} />
            </Form.Item>
          ))}
        </>
      ),
    },
    {
      title: "",
      dataIndex: "warehouseRows",
      key: "remove",
      width: "5%",
      render: (warehouseRows, record, productIndex) => (
        <>
          {warehouseRows.map((warehouse, warehouseIndex) => (
            <div key={`remove-${productIndex}-${warehouseIndex}`}>
              {warehouseRows.length > 1 && (
                <div style={{ height: "2.5rem", marginBottom: "24px" }}>
                  <CloseOutlined
                    onClick={() =>
                      handleRemoveWarehouseRow(productIndex, warehouseIndex)
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">Distribution Of Opening Stock</p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() => navigate("/productGroups")}
        />
      </div>
      <div className="page-content page-content-with-form-buttons">
        <Row className="product-new-top-band">
          <Space size="large">
            <Space>
              <CheckCircleFilled style={{ color: "var(--primary-color)" }} />
              <span>
                <FormattedMessage
                  id="title.productDetails"
                  defaultMessage="Product Details"
                />
              </span>
            </Space>
            <RightOutlined />
            <Flex
              style={{
                borderBottom: "2px solid var(--primary-color)",
                height: "4rem",
              }}
              align="center"
              justify="center"
            >
              <Space>
                <CheckCircleFilled style={{ opacity: "60%" }} />
                <span>
                  <FormattedMessage
                    id="title.openingStock"
                    defaultMessage="Opening Stock"
                  />
                </span>
              </Space>
            </Flex>
          </Space>
        </Row>
        <Form form={form} onFinish={onFinish}>
          <Table
            className="opening-stock-table"
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey={(record) => record.ID}
          />

          <div className="page-actions-bar">
            {/* <Button
              className="back-button"
              icon={<LeftOutlined />}
              style={{ height: "2.5rem" }}
              loading={createLoading}
              onClick={() =>
                navigate(from, { state: location.state, replace: true })
              }
            /> */}
            <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              loading={createLoading}
            >
              <FormattedMessage id="button.save" defaultMessage="Save" />
            </Button>
            <Button
              className="page-actions-btn"
              loading={createLoading}
              onClick={() => navigate("/productGroups")}
            >
              <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default OpeningStock;
