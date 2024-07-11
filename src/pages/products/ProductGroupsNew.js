/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useMemo, useRef } from "react";

import "./ProductGroupsNew.css";
import { SupplierSearchModal, UploadImage } from "../../components";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import {
  Button,
  Checkbox,
  Row,
  Space,
  Table,
  Input,
  Form,
  Modal,
  Col,
  Select,
  Tag,
  Flex,
} from "antd";
import {
  CloseOutlined,
  RightOutlined,
  CheckCircleFilled,
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  PlusCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { ProductGroupMutations } from "../../graphql";
import { useMutation, useReadQuery } from "@apollo/client";
import {
  SYSTEM_ACCOUNT_CODE_COGS,
  SYSTEM_ACCOUNT_CODE_INVENTORY_ASSET,
  SYSTEM_ACCOUNT_CODE_SALES,
} from "../../config/Constants";

const { CREATE_PRODUCT_GROUP } = ProductGroupMutations;

const defaultPrice = "0.00";

const ProductGroupsNew = () => {
  const intl = useIntl();
  const [productGroupName, setProductGroupName] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productVariations, setProductVariations] = useState([]);
  const [combinationPairs, setCombinationPairs] = useState([]);
  const [combinationPairsUpdated, setCombinationPairsUpdated] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editIndex, setEditIndex] = useState();
  const [createFormRef] = Form.useForm();
  const [createProductFormRef] = Form.useForm();
  const [editFormRef] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const {
    notiApi,
    msgApi,
    allTaxGroupsQueryRef,
    allTaxesQueryRef,
    allAccountsQueryRef,
    allProductCategoriesQueryRef,
    allProductUnitsQueryRef,
    business,
  } = useOutletContext();
  const renderCount = useRef(0);
  const [isInventoryTracked, setIsInventoryTracked] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [imageList, setImageList] = useState([]);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`Render count: ${renderCount.current}`);
  });

  // Queries
  const { data: unitData } = useReadQuery(allProductUnitsQueryRef);
  const { data: categoryData } = useReadQuery(allProductCategoriesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

  //Mutations
  const [createProductGroup, { loading: createLoading }] = useMutation(
    CREATE_PRODUCT_GROUP,
    {
      onCompleted(data) {
        const createdProductGroup = data.createProductGroup;
        console.log("data", createdProductGroup);

        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productGroup.created"
            defaultMessage="New Product Group Created"
          />
        );
        if (isInventoryTracked) {
          navigate("/openingStock", {
            state: {
              ...location.state,
              from: { pathname: location.pathname },
              record: createdProductGroup,
            },
          });
        } else {
          if (from === "/") {
            navigate("/productGroups");
          } else {
            navigate(from, { state: location.state, replace: true });
          }
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
    return unitData?.listAllProductUnit?.filter((tax) => tax.isActive === true);
  }, [unitData]);

  const categories = useMemo(() => {
    return categoryData?.listAllProductCategory?.filter(
      (tax) => tax.isActive === true
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

  const groupByDetailType = (accounts) => {
    return accounts?.reduce((groupedAccounts, account) => {
      if (!groupedAccounts[account.detailType]) {
        groupedAccounts[account.detailType] = [];
      }
      groupedAccounts[account.detailType].push(account);
      return groupedAccounts;
    }, {});
  };

  const handleCreateVariation = () => {
    const { variation, options } = createFormRef.getFieldsValue();
    const newVariation = {
      name: variation,
      id: variation,
      values: options.map((value, index) => ({
        value,
        id: `${variation}${value}${index}`,
      })),
    };

    setProductVariations([...productVariations, newVariation]);
    setCreateModalOpen(false);
    setCombinationPairsUpdated(true);

    createFormRef.resetFields();
  };
  console.log("Variants", productVariations);

  //Perform when editoutlined is clicked
  const handleEditClick = (record, index) => {
    setEditIndex(index);
    setEditModalOpen(true);
    setEditRecord(record);
  };

  //Populate editFormRef
  if (editRecord && editFormRef && editRecord) {
    const initialOptions = Array.from(
      { length: editRecord.values.length },
      (_, index) => {
        return editRecord.values[index]?.value || "";
      }
    );

    editFormRef.setFieldsValue({
      variation: editRecord.name,
      options: initialOptions,
    });
  }

  const handleEditVariation = () => {
    const { variation, options } = editFormRef.getFieldsValue();
    const updatedVariation = {
      name: variation,
      id: variation,
      values: options.map((value, index) => ({
        value,
        id: `${variation}${value}${index}`,
      })),
    };

    const updatedVariations = [...productVariations];
    updatedVariations[editIndex] = updatedVariation;
    setProductVariations(updatedVariations);
    setCombinationPairsUpdated(true);

    setEditModalOpen(false);
    setEditRecord();
    editFormRef.resetFields();
  };

  const handleRemoveVariation = (index) => {
    const updatedVariations = [...productVariations];
    const removedVariation = updatedVariations.splice(index, 1)[0];

    // Remove the corresponding combinations in combinationPairs
    const updatedCombinationPairs = combinationPairs.filter(
      (combination) =>
        !removedVariation.values.some((value) =>
          combination.productName.includes(value.value)
        )
    );

    setProductVariations(updatedVariations);
    setCombinationPairs(updatedCombinationPairs);
    setCombinationPairsUpdated(true);
  };

  const generateCombinations = useMemo(() => {
    const combinations = [];

    const combine = (index, currentCombination) => {
      if (index === productVariations.length) {
        combinations.push(currentCombination);
        return;
      }

      const currentVariation = productVariations[index];

      currentVariation.values.forEach((value) => {
        combine(index + 1, [
          ...currentCombination,
          { value: value.value, id: value.id },
        ]);
      });
    };

    combine(0, []);

    return combinations.map((combination, index) => {
      const combinationObj = {
        key: index,
        name: combination.map((c) => c.value).join(" / "),
        productName: combination.map((c) => c.value).join(" / "),
        id: index,
      };

      if (productGroupName.trim() !== "" && productVariations.length > 0) {
        combinationObj.productName = `${productGroupName} - ${combinationObj.productName}`;
      }

      const matchingCombination = combinationPairs.find((cp) =>
        combination.every((c) => cp.productName.includes(c.value))
      );

      if (matchingCombination) {
        combinationObj.costPrice = matchingCombination.costPrice;
        combinationObj.sellingPrice = matchingCombination.sellingPrice;
        combinationObj.sku = matchingCombination.sku;
        combinationObj.barcode = matchingCombination.barcode;
      } else {
        combinationObj.costPrice = defaultPrice;
        combinationObj.sellingPrice = defaultPrice;
        combinationObj.sku = "";
        combinationObj.barcode = "";
      }

      return combinationObj;
    });
  }, [productVariations, productGroupName, combinationPairs]);

  // Set/Update combinationPairs
  useEffect(() => {
    if (combinationPairsUpdated) {
      setCombinationPairs(generateCombinations);
      setCombinationPairsUpdated(false);
    }
  }, [combinationPairsUpdated, generateCombinations]);

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    createProductFormRef.setFieldsValue({ supplierName: record.name });
  };

  const onFinish = (values) => {
    console.log("values", values);

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

    const variants = combinationPairs.map((item) => ({
      name: item.productName,
      sku: values[`sku${item.key}`],
      salesPrice: parseFloat(values[`salesPrice${item.key}`]) || 0,
      purchasePrice: parseFloat(values[`purchasePrice${item.key}`]) || 0,
      barcode: values[`barcode${item.key}`],
      salesAccountId: values.salesAccount,
      purchaseAccountId: values.purchaseAccount,
      inventoryAccountId: isInventoryTracked ? values.inventoryAccount : 0,
      isSalesTaxInclusive: false,
      // isBatchTracking: false,
      productGroupId: 0,
      salesTaxId,
      salesTaxType,
      purchaseTaxId,
      purchaseTaxType,
      unitId: values.unit,
    }));
    const options = productVariations.map((item) => ({
      optionName: item.name,
      optionUnits: item.values.map((item) => item.value).join("|"),
    }));

    if (variants.length <= 0) {
      openErrorNotification(
        notiApi,
        intl.formatMessage({
          id: "validation.enterAtLeastOneVariant",
          defaultMessage: "Enter At Least One Variant",
        })
      );
      return;
    }

    const imageUrls = imageList.map((img) => ({
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
    }));

    const input = {
      // productNature: values.productNature,
      name: values.productGroupName,
      description: values.description,
      categoryId: values.category,
      supplierId: selectedSupplier?.id || 0,
      images: imageUrls,
      variants,
      options,
    };
    console.log("input", input);
    createProductGroup({
      variables: { input },
    });
    // if (isInventoryTracked) {
    //   navigate("/openingStock", {
    //     state: { combinationPairs },
    //   });
    // }
  };

  const handleCustomFileListChange = (newCustomFileList) => {
    setImageList(newCustomFileList);
    console.log("Changed");
  };

  const columns = [
    {
      title: (
        <FormattedMessage
          id="label.productName"
          defaultMessage="Product Name"
        />
      ),
      dataIndex: "productName",
      key: "productName",
      width: "30%",
      render: (text) => (
        <div
          style={{ height: "2.5rem", display: "flex", alignItems: "center" }}
        >
          {text}
        </div>
      ),
    },
    {
      title: <FormattedMessage id="label.sku" defaultMessage="SKU" />,
      dataIndex: "sku",
      key: "sku",
      render: (_, record) => (
        <Form.Item name={`sku${record.key}`}>
          <Input maxLength={100} />
        </Form.Item>
      ),
    },
    {
      title: (
        <Col>
          <Row>
            <Space>
              <FormattedMessage
                id="label.sellingPrice"
                defaultMessage="Selling Price"
              />
              <span>({business.baseCurrency.symbol})</span>
            </Space>
          </Row>
          <Row>
            <Button
              style={{ padding: 0 }}
              type="link"
              onClick={() => {
                const values = createProductFormRef.getFieldsValue();
                for (var i = 1; i < combinationPairs.length; i++) {
                  createProductFormRef.setFieldValue(
                    `salesPrice${combinationPairs[i].key}`,
                    values[`salesPrice${combinationPairs[0].key}`]
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
      dataIndex: "salesPrice",
      key: "salesPrice",
      render: (_, record) => (
        <Form.Item
          name={`salesPrice${record.key}`}
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
          <Input />
        </Form.Item>
      ),
    },
    {
      title: (
        <Col>
          <Row>
            <Space>
              <FormattedMessage
                id="label.costPrice"
                defaultMessage="Cost Price"
              />
              <span>({business.baseCurrency.symbol})</span>
            </Space>
          </Row>
          <Row>
            <Button
              style={{ padding: 0 }}
              type="link"
              onClick={() => {
                const values = createProductFormRef.getFieldsValue();
                for (var i = 1; i < combinationPairs.length; i++) {
                  createProductFormRef.setFieldValue(
                    `purchasePrice${combinationPairs[i].key}`,
                    values[`purchasePrice${combinationPairs[0].key}`]
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
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (_, record) => (
        <Form.Item
          name={`purchasePrice${record.key}`}
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
          <Input />
        </Form.Item>
      ),
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      render: (_, record, index) => (
        <Form.Item name={`barcode${record.key}`}>
          <Input maxLength={100} />
        </Form.Item>
      ),
    },
  ];

  const createForm = (
    <Form form={createFormRef} onFinish={handleCreateVariation}>
      <Form.Item
        labelCol={{ span: 7 }}
        label="Option Name"
        labelAlign="left"
        shouldUpdate
        name="variation"
        id="variation.name"
        rules={[
          {
            required: true,
            message: "Enter the Variation Name",
          },
        ]}
      >
        <Input maxLength={50} placeholder="eg.Size" />
      </Form.Item>

      <Form.List name="options" initialValue={[""]} label="Option Values">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item key={field.key}>
                <Form.Item
                  style={{ margin: 0 }}
                  {...field}
                  label={field.key < 1 && "Option Values"}
                  shouldUpdate
                  name={[field.name]}
                  id={field.key}
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  wrapperCol={field.key > 0 && { offset: 7 }}
                  rules={[
                    {
                      required: true,
                      message: `Enter Option ${index + 1}`,
                    },
                  ]}
                >
                  <Input
                    maxLength={50}
                    placeholder={`Value ${index + 1}`}
                    suffix={
                      index > 0 && (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      )
                    }
                  />
                </Form.Item>
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{
                  width: "100%",
                }}
                icon={<PlusOutlined />}
              >
                <FormattedMessage
                  id="action.addOptionValue"
                  defaultMessage="Add Option Value"
                />
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
  const editForm = (
    <Form
      form={editFormRef}
      onFinish={(values) => {
        handleEditVariation(values);
      }}
    >
      <Form.Item
        label="Option Name"
        labelCol={{ span: 7 }}
        labelAlign="left"
        shouldUpdate
        name="variation"
        id="variation.name"
        rules={[
          {
            required: true,
            message: "Enter the Variation Name",
          },
        ]}
      >
        <Input maxLength={50} placeholder="eg.Size" />
      </Form.Item>

      <Form.List name="options" initialValue={[""]} label="Option Values">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item key={field.key}>
                <Form.Item
                  style={{ margin: 0 }}
                  {...field}
                  label={field.key < 1 && "Option Values"}
                  shouldUpdate
                  name={[field.name]}
                  id={field.key}
                  labelAlign="left"
                  labelCol={{ span: 7 }}
                  wrapperCol={field.key > 0 && { offset: 7 }}
                  rules={[
                    {
                      required: true,
                      message: `Enter Option ${index + 1}`,
                    },
                  ]}
                >
                  <Input
                    maxLength={50}
                    placeholder={`Value ${index + 1}`}
                    suffix={
                      index > 0 && (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      )
                    }
                  />
                </Form.Item>
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{
                  width: "100%",
                }}
                icon={<PlusOutlined />}
              >
                <FormattedMessage
                  id="action.addOptionValue"
                  defaultMessage="Add Option Value"
                />
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );

  const initialValues = {
    // productNature: 'G',
    salesAccount: defaultSalesAccountId,
    purchaseAccount: defaultPurchaseAccountId,
    inventoryAccount: defaultInventoryAccountId,
  };

  const productNewForm = (
    <Form
      initialValues={initialValues}
      className="product-new-form"
      form={createProductFormRef}
      onFinish={onFinish}
    >
      <Row>
        <Col span={12}>
          <Form.Item
            name="productGroupName"
            label={
              <FormattedMessage
                id="label.productGroupName"
                defaultMessage="Product Group Name"
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
                    id="label.productGroupName.required"
                    defaultMessage="Enter the Product Group Name"
                  />
                ),
              },
            ]}
          >
            <Input
              maxLength={100}
              onBlur={(e) => {
                const trimmedValue = e.target.value.trim();
                if (
                  trimmedValue !== "" &&
                  trimmedValue !== productGroupName &&
                  productVariations.length > 0
                ) {
                  setProductGroupName(trimmedValue);
                  setCombinationPairsUpdated(true);
                } else if (productVariations.length < 1) {
                  setProductGroupName(trimmedValue);
                }
              }}
            />
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
                        createProductFormRef.resetFields(["supplierName"]);
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
        </>
      )}
      <div className="page-actions-bar page-actions-bar-margin">
        <Button
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          loading={createLoading}
          // onClick={() =>
          //   navigate("/openingStock", {
          //     state: { combinationPairs },
          //   })
          // }
        >
          {isInventoryTracked ? (
            <FormattedMessage
              id="button.saveAndNext"
              defaultMessage="Save And Next"
            />
          ) : (
            <FormattedMessage id="button.save" defaultMessage="Save" />
          )}
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
      <Modal
        title={
          <FormattedMessage
            id="action.addVariants"
            defaultMessage="Add Variants"
          />
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={createFormRef.submit}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
      >
        {createForm}
      </Modal>
      <Modal
        title={
          <FormattedMessage
            id="action.editVariants"
            defaultMessage="Edit Variants"
          />
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={editFormRef.submit}
        okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        }
      >
        {editForm}
      </Modal>
      <div className="page-header page-header-with-button">
        <p className="page-header-text">
          <FormattedMessage
            id="productGroup.new"
            defaultMessage=" New Product Group"
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
      <div className="page-content page-content-with-form-buttons product-new-page-content">
        <Row className="product-new-top-band">
          <Space size="large">
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
                    id="title.productDetails"
                    defaultMessage="Product Details"
                  />
                </span>
              </Space>
            </Flex>
            <RightOutlined />
            <span>
              <FormattedMessage
                id="title.openingStocks"
                defaultMessage="Opening Stocks"
              />
            </span>
          </Space>
        </Row>
        <div className="page-form-wrapper">
          {productNewForm}
          <div className="product-variants-container">
            <p>
              <FormattedMessage id="title.variants" defaultMessage="Variants" />
            </p>
            <Flex gap="1rem">
              {productVariations.map((variant, index) => (
                <div
                  className="product-variants"
                  key={variant.id}
                  onClick={() => handleEditClick(variant, index)}
                >
                  <div className="product-variant-header">
                    <div className="product-variant-name">{variant.name}</div>
                    <DeleteOutlined
                      className="product-variant-delete-icon"
                      style={{
                        fontSize: "1rem",
                        color: "red",
                        cursor: "pointer",
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveVariation(index);
                      }}
                    />
                  </div>
                  <div className="product-variant-values-container">
                    {variant.values.map((values) => (
                      <Tag key={values.id}>{values.value}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </Flex>
            <Space>
              <PlusCircleFilled style={{ color: "var(--primary-color)" }} />
              <a
                onClick={(event) => {
                  setCreateModalOpen(true);
                }}
                className="add-variant"
              >
                <FormattedMessage
                  id="action.addVariants"
                  defaultMessage="Add Variants"
                />
              </a>
            </Space>
          </div>
          <Form form={createProductFormRef} onFinish={onFinish}>
            <Table
              dataSource={combinationPairs}
              columns={columns}
              pagination={false}
              rowKey={(record) => record.id}
              className="product-variant-table"
            />
          </Form>
        </div>
      </div>
    </>
  );
};

export default ProductGroupsNew;
