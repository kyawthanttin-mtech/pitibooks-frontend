/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useMemo } from "react";
import { SupplierSearchModal, UploadImage } from "../../components";
import {
  Button,
  Row,
  Space,
  Table,
  Input,
  Form,
  Col,
  Checkbox,
  // Radio,
  Select,
} from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { CloseOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation, useReadQuery } from "@apollo/client";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { ProductMutations } from "../../graphql";
import {
  SYSTEM_ACCOUNT_CODE_COGS,
  SYSTEM_ACCOUNT_CODE_INVENTORY_ASSET,
  SYSTEM_ACCOUNT_CODE_SALES,
} from "../../config/Constants";
const { CREATE_PRODUCT } = ProductMutations;

const ProductsNew = () => {
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [currentTableKey, setCurrentTableKey] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const {
    notiApi,
    msgApi,
    business,
    refetchAllProducts,
    allTaxGroupsQueryRef,
    allTaxesQueryRef,
    allAccountsQueryRef,
    allProductUnitsQueryRef,
    allProductCategoriesQueryRef,
    allWarehousesQueryRef,
  } = useOutletContext();
  const [imageList, setImageList] = useState([]);
  const [isInventoryTracked, setIsInventoryTracked] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Queries
  const { data: unitData } = useReadQuery(allProductUnitsQueryRef);
  const { data: categoryData } = useReadQuery(allProductCategoriesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);
  const { data: warehouseData } = useReadQuery(allWarehousesQueryRef);

  // Mutations
  const [createProduct, { loading: createLoading }] = useMutation(
    CREATE_PRODUCT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="product.created"
            defaultMessage="New Product Created"
          />
        );
        refetchAllProducts();
        if (from === "/") {
          navigate("/products");
        } else {
          navigate(from, { state: location.state, replace: true });
        }
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = createLoading;

  const taxes = useMemo(() => {
    return taxData?.listAllTax?.filter((tax) => tax.isActive === true);
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup?.filter(
      (tax) => tax.isActive === true
    );
  }, [taxGroupData]);

  const units = useMemo(() => {
    return unitData?.listAllProductUnit?.filter(
      (unit) => unit.isActive === true
    );
  }, [unitData]);

  const categories = useMemo(() => {
    return categoryData?.listAllProductCategory?.filter(
      (c) => c.isActive === true
    );
  }, [categoryData]);

  const salesAccounts = useMemo(() => {
    return accountData?.listAllAccount?.filter(
      (acc) => acc.mainType === "Income" && acc.isActive === true
    );
  }, [accountData]);
  const defaultSalesAccountId = salesAccounts.find(
    (x) => x.systemDefaultCode === SYSTEM_ACCOUNT_CODE_SALES
  )?.id;

  const purchaseAccounts = useMemo(() => {
    return accountData?.listAllAccount?.filter(
      (acc) => acc.mainType === "Expense" && acc.isActive === true
    );
  }, [accountData]);
  const defaultPurchaseAccountId = purchaseAccounts.find(
    (x) => x.systemDefaultCode === SYSTEM_ACCOUNT_CODE_COGS
  )?.id;

  const inventoryAccounts = useMemo(() => {
    return accountData?.listAllAccount?.filter(
      (acc) => acc.detailType === "Stock" && acc.isActive === true
    );
  }, [accountData]);
  const defaultInventoryAccountId = inventoryAccounts.find(
    (x) => x.systemDefaultCode === SYSTEM_ACCOUNT_CODE_INVENTORY_ASSET
  )?.id;

  const allTax = [
    {
      title: "Tax",
      taxes: taxes
        ? [...taxes.map((tax) => ({ ...tax, id: "I" + tax.id }))]
        : [],
    },
    {
      title: "Tax Group",
      taxes: taxGroups
        ? [
            ...taxGroups.map((group) => ({
              ...group,
              id: "G" + group.id,
            })),
          ]
        : [],
    },
  ];

  const warehouses = useMemo(() => {
    return warehouseData?.listAllWarehouse?.filter((w) => w.isActive === true);
  }, [warehouseData]);

  const groupByDetailType = (accounts) => {
    return accounts?.reduce((groupedAccounts, account) => {
      if (!groupedAccounts[account.detailType]) {
        groupedAccounts[account.detailType] = [];
      }
      groupedAccounts[account.detailType].push(account);
      return groupedAccounts;
    }, {});
  };

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    form.setFieldsValue({ supplierName: record.name });
  };

  const onFinish = (values) => {
    // console.log("values", values);
    // const transactions = data.map((item) => ({
    //   accountId: values[`account${item.key}`],
    //   debit: parseFloat(values[`debit${item.key}`]) || 0,
    //   credit: parseFloat(values[`credit${item.key}`]) || 0,
    //   description: values[`description${item.key}`],
    // }));

    const selectedSalesTax = allTax.find((taxGroup) =>
      taxGroup.taxes.some((tax) => tax.id === values.salesTax)
    );
    const salesTaxType =
      selectedSalesTax && selectedSalesTax.title === "Tax Group" ? "G" : "I";

    const selectedPurchaseTax = allTax.find((taxGroup) =>
      taxGroup.taxes.some((tax) => tax.id === values.purchaseTax)
    );
    const purchaseTaxType =
      selectedPurchaseTax && selectedPurchaseTax.title === "Tax Group"
        ? "G"
        : "I";

    const salesTaxId = values?.salesTax
      ? parseInt(values?.salesTax?.replace(/[IG]/, ""), 10)
      : 0;
    const purchaseTaxId = values?.purchaseTax
      ? parseInt(values?.purchaseTax?.replace(/[IG]/, ""), 10)
      : 0;

    const imageUrls = imageList.map((img) => ({
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
    }));

    console.log("image urls", imageUrls);

    let openingStocks = [];
    let warehouseIds = [];
    if (isInventoryTracked) {
      for (var i = 0; i < data.length; i++) {
        if (warehouseIds.includes(values[`warehouse${data[i].key}`])) {
          openErrorNotification(
            notiApi,
            intl.formatMessage({
              id: "validation.duplicateWarehouse",
              defaultMessage: "Duplicate Warehouse",
            })
          );
          return;
        }
        warehouseIds.push(values[`warehouse${data[i].key}`]);
        openingStocks[i] = {
          warehouseId: values[`warehouse${data[i].key}`],
          // batchNumber: values[`batchNumber${data[i].key}`],
          qty: parseFloat(values[`openingStock${data[i].key}`]),
          unitValue: parseFloat(values[`openingStockValue${data[i].key}`]),
        };
      }
    }

    const input = {
      name: values.name,
      sku: values.sku,
      barcode: values.barcode,
      description: values.description,
      unitId: values.unit,
      salesTaxId,
      salesTaxType,
      purchaseTaxId,
      purchaseTaxType,
      // productNature: values.productNature,
      supplierId: selectedSupplier?.id || 0,
      categoryId: values.category,
      salesAccountId: values.salesAccount,
      purchaseAccountId: values.purchaseAccount,
      inventoryAccountId: isInventoryTracked ? values.inventoryAccount : 0,
      isSalesTaxInclusive: false,
      salesPrice: parseFloat(values.salesPrice),
      purchasePrice: parseFloat(values.purchasePrice),
      images: imageUrls,
      isBatchTracking: false,
      openingStocks,
    };
    // console.log("input", input);
    createProduct({
      variables: { input },
    });
  };

  const handleAddRow = () => {
    const newRowKey = currentTableKey + 1;
    setCurrentTableKey(newRowKey);
    setData([...data, { key: newRowKey }]);
  };

  const handleRemoveRow = (keyToRemove) => {
    const newData = data.filter((dataItem) => dataItem.key !== keyToRemove);
    setData(newData);
  };

  const handleCustomFileListChange = (newCustomFileList) => {
    setImageList(newCustomFileList);
  };
  console.log(imageList);

  const columns = [
    {
      title: (
        <FormattedMessage
          id="label.warehouseName"
          defaultMessage="Warehouse Name"
        />
      ),
      dataIndex: "warehouseName",
      key: "warehouseName",
      width: "20%",
      render: (_, record) => (
        <Form.Item
          name={`warehouse${record.key}`}
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
      ),
    },
    {
      title: (
        <Col>
          <Row>
            <FormattedMessage
              id="label.openingStock"
              defaultMessage="Opening Stock"
            />
          </Row>
          <Row>
            <Button
              type="link"
              onClick={() => {
                const values = form.getFieldsValue();
                for (var i = 1; i < data.length; i++) {
                  form.setFieldValue(
                    `openingStock${data[i].key}`,
                    values[`openingStock${data[0].key}`]
                  );
                }
              }}
            >
              <FormattedMessage
                id="action.copyToAll"
                defaultMessage="Copy to All"
              />
            </Button>
          </Row>
        </Col>
      ),
      dataIndex: "openingStock",
      key: "openingStock",
      width: "20%",
      render: (_, record) => (
        <Form.Item
          name={`openingStock${record.key}`}
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
                } else if (isNaN(value) || value.length > 20 || value < 0) {
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
          <Input />
        </Form.Item>
      ),
    },
    {
      title: (
        <Col>
          <Row>
            <FormattedMessage
              id="label.openingStockValue"
              defaultMessage="Opening Stock Value (Per Unit)"
            />
          </Row>
          <Row>
            <Button
              type="link"
              onClick={() => {
                const values = form.getFieldsValue();
                for (var i = 1; i < data.length; i++) {
                  form.setFieldValue(
                    `openingStockValue${data[i].key}`,
                    values[`openingStockValue${data[0].key}`]
                  );
                }
              }}
            >
              <FormattedMessage
                id="action.copyToAll"
                defaultMessage="Copy to All"
              />
            </Button>
          </Row>
        </Col>
      ),
      dataIndex: "openingStockValue",
      key: "openingStockValue",
      width: "20%",
      render: (_, record) => (
        <Form.Item
          name={`openingStockValue${record.key}`}
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
                } else if (isNaN(value) || value.length > 20 || value < 0) {
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
          <Input addonBefore={business.baseCurrency.symbol} />
        </Form.Item>
      ),
    },
    {
      title: "",
      dataIndex: "removeRow",
      key: "removeRow",
      width: "10%",
      render: (_, record) =>
        data.length > 0 ? (
          <CloseOutlined onClick={() => handleRemoveRow(record.key)} />
        ) : (
          <></>
        ),
    },
  ];

  const initialValues = {
    // productNature: 'G',
    salesAccount: defaultSalesAccountId,
    purchaseAccount: defaultPurchaseAccountId,
    inventoryAccount: defaultInventoryAccountId,
  };

  const productNewForm = (
    <Form
      className="product-new-form"
      onFinish={onFinish}
      form={form}
      initialValues={initialValues}
    >
      <Row>
        <Col span={12}>
          {/* <Row> */}
          {/* <Col lg={18}> */}
          {/* <Form.Item
            label={<FormattedMessage id="label.type" defaultMessage="Type" />}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="productNature"
          >
            <Radio.Group>
              <Radio value="G"> Goods </Radio>
              <Radio value="S"> Service </Radio>
            </Radio.Group>
          </Form.Item> */}
          <Form.Item
            name="name"
            label={
              <FormattedMessage
                id="label.productName"
                defaultMessage="Product Name"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.productName.required"
                    defaultMessage="Enter the Product Name"
                  />
                ),
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <FormattedMessage
                id="label.description"
                defaultMessage="Description"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
          >
            <Input.TextArea maxLength={1000} rows={4}></Input.TextArea>
          </Form.Item>
          <br />
        </Col>
        <Col span={12}>
          <UploadImage onCustomFileListChange={handleCustomFileListChange} />
        </Col>
      </Row>
      <p style={{ fontSize: "var(--title-text)", marginTop: 0 }}>
        <FormattedMessage
          id="title.productDetails"
          defaultMessage="Product Details"
        />
      </p>
      <Row>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage id="label.category" defaultMessage="category" />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="category"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.category.required"
                    defaultMessage="Select the Category"
                  />
                ),
              },
            ]}
          >
            <Select
              // placeholder="Select Category"
              showSearch
              allowClear
              loading={loading}
              optionFilterProp="label"
            >
              {categories?.map((cat) => (
                <Select.Option key={cat.id} value={cat.id} label={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="label.unit" defaultMessage="Unit" />}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="unit"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.unit.required"
                    defaultMessage="Select the Unit"
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
            >
              {units?.map((unit) => (
                <Select.Option key={unit.id} value={unit.id} label={unit.name}>
                  {unit.abbreviation}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
            }
            name="supplierName"
            shouldUpdate
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
          >
            <Input
              readOnly
              onClick={setSearchModalOpen}
              className="search-input"
              suffix={
                <>
                  {selectedSupplier && (
                    <CloseOutlined
                      style={{ height: 11, width: 11, cursor: "pointer" }}
                      onClick={() => {
                        setSelectedSupplier(null);
                        form.resetFields(["supplierName"]);
                      }}
                    />
                  )}

                  <Button
                    style={{ width: "2.5rem" }}
                    type="primary"
                    icon={<SearchOutlined />}
                    className="search-btn"
                    onClick={setSearchModalOpen}
                  />
                </>
              }
            />
          </Form.Item>
          <Form.Item
            name="sku"
            label={<FormattedMessage id="label.sku" defaultMessage="sku" />}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name="barcode"
            label={
              <FormattedMessage id="label.barcode" defaultMessage="Barcode" />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
          >
            <Input maxLength={100} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.salesAccount"
                defaultMessage="Sales Account"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="salesAccount"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.salesAccount.required"
                    defaultMessage="Select the Sales Account"
                  />
                ),
              },
            ]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              loading={loading}
              placeholder={
                <FormattedMessage
                  id="label.account.placeholder"
                  defaultMessage="Select an account"
                />
              }
            >
              {groupByDetailType(salesAccounts) &&
                Object.entries(groupByDetailType(salesAccounts)).map(
                  ([detailType, accounts]) => (
                    <Select.OptGroup label={detailType} key={detailType}>
                      {accounts.map((account) => (
                        <Select.Option
                          key={account.id}
                          value={account.id}
                          label={account.name}
                        >
                          {account.name}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  )
                )}
            </Select>
          </Form.Item>
          <Form.Item
            name="salesPrice"
            label={
              <FormattedMessage
                id="label.sellingPrice"
                defaultMessage="Selling Price"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.salesPrice.required"
                    defaultMessage="Enter the Sales Price"
                  />
                ),
              },
              () => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  } else if (isNaN(value) || value.length > 20 || value < 0) {
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
            <Input addonBefore={business.baseCurrency.symbol} />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.salesTax"
                defaultMessage="Sales Tax"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="salesTax"
          >
            <Select
              // placeholder="Select or type to add"
              showSearch
              allowClear
              loading={loading}
              optionFilterProp="label"
            >
              {allTax?.map((taxGroup) => (
                <Select.OptGroup key={taxGroup.title} label={taxGroup.title}>
                  {taxGroup.taxes.map((tax) => (
                    <Select.Option key={tax.id} value={tax.id} label={tax.name}>
                      {tax.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.purchaseAccount"
                defaultMessage="Purchase Account"
              />
            }
            labelAlign="left"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            name="purchaseAccount"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.purchaseAccount.required"
                    defaultMessage="Select the Purchase Account"
                  />
                ),
              },
            ]}
          >
            <Select
              loading={loading}
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={
                <FormattedMessage
                  id="label.account.placeholder"
                  defaultMessage="Select an account"
                />
              }
            >
              {groupByDetailType(purchaseAccounts) &&
                Object.entries(groupByDetailType(purchaseAccounts)).map(
                  ([detailType, accounts]) => (
                    <Select.OptGroup label={detailType} key={detailType}>
                      {accounts.map((account) => (
                        <Select.Option
                          key={account.id}
                          value={account.id}
                          label={account.name}
                        >
                          {account.name}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  )
                )}
            </Select>
          </Form.Item>
          <Form.Item
            name="purchasePrice"
            label={
              <FormattedMessage
                id="label.costPrice"
                defaultMessage="Cost Price"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.purchasePrice.required"
                    defaultMessage="Enter the Purchase Price"
                  />
                ),
              },
              () => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  } else if (isNaN(value) || value.length > 20 || value < 0) {
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
            <Input addonBefore={business.baseCurrency.symbol} />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage
                id="label.purchaseTax"
                defaultMessage="Purchase Tax"
              />
            }
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="purchaseTax"
          >
            <Select
              // placeholder="Select or type to add"
              showSearch
              allowClear
              loading={loading}
              optionFilterProp="label"
            >
              {allTax?.map((taxGroup) => (
                <Select.OptGroup key={taxGroup.title} label={taxGroup.title}>
                  {taxGroup.taxes.map((tax) => (
                    <Select.Option key={tax.id} value={tax.id} label={tax.name}>
                      {tax.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* <p style={{ fontSize: " var(--title-text)", marginTop: 0 }}>Inventory</p> */}
      <Row>
        <Checkbox onChange={(e) => setIsInventoryTracked(e.target.checked)}>
          <FormattedMessage
            id="label.trackInventory"
            defaultMessage="Track Inventory"
          />
        </Checkbox>
      </Row>
      {isInventoryTracked && (
        <>
          <br />
          <Row>
            <Col span={12}>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.inventoryAccount"
                    defaultMessage="Inventory Account"
                  />
                }
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
                labelAlign="left"
                name="inventoryAccount"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.inventoryAccount.required"
                        defaultMessage="Select the Inventory Account"
                      />
                    ),
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={loading}
                  placeholder={
                    <FormattedMessage
                      id="label.account.placeholder"
                      defaultMessage="Select an account"
                    />
                  }
                >
                  {groupByDetailType(inventoryAccounts) &&
                    Object.entries(groupByDetailType(inventoryAccounts)).map(
                      ([detailType, accounts]) => (
                        <Select.OptGroup label={detailType} key={detailType}>
                          {accounts.map((account) => (
                            <Select.Option
                              key={account.id}
                              value={account.id}
                              label={account.name}
                            >
                              {account.name}
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                      )
                    )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Table
            columns={columns}
            className="opening-stock-table"
            dataSource={data}
            pagination={false}
          />
          <Space style={{ marginBottom: "0.7rem", paddingLeft: "1.5rem" }}>
            <PlusOutlined className="add-icon" />
            <a onClick={handleAddRow}>
              <FormattedMessage
                id="action.addOpeningStock"
                defaultMessage="Add Opening Stock"
              />
            </a>
          </Space>
        </>
      )}
      <div className="page-actions-bar page-actions-bar-margin">
        <Button
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          loading={loading}
        >
          {<FormattedMessage id="button.save" defaultMessage="Save" />}
        </Button>
        <Button
          className="page-actions-btn"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        >
          {<FormattedMessage id="button.cancel" defaultMessage="Cancel" />}
        </Button>
      </div>
    </Form>
  );

  return (
    <>
      <SupplierSearchModal
        modalOpen={searchModalOpen}
        setModalOpen={setSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />
      <div className="page-header">
        <p className="page-header-text">
          {<FormattedMessage id="product.new" defaultMessage="New Product" />}
        </p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        />
      </div>
      <div className="page-content page-content-with-form-buttons">
        <div className="page-form-wrapper">{productNewForm}</div>
      </div>
    </>
  );
};

export default ProductsNew;
