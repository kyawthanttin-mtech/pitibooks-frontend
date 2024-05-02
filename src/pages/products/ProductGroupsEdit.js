/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useMemo, useRef } from "react";

import "./ProductGroupsNew.css";
import UploadImage from "../../components/UploadImage";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import {
  Button,
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
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { ProductGroupMutations } from "../../graphql";
import { useMutation, useQuery, gql } from "@apollo/client";
import { CategoryQueries, UnitQueries } from "../../graphql";
import { useReadQuery } from "@apollo/client";
const { UPDATE_PRODUCT_GROUP } = ProductGroupMutations;
const { GET_PRODUCT_UNITS } = UnitQueries;
const { GET_PRODUCT_CATEGORIES } = CategoryQueries;

const defaultPrice = "0.00";

const ProductGroupsEdit = () => {
  const [productGroupName, setProductGroupName] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productVariations, setProductVariations] = useState([]);
  const [combinationPairs, setCombinationPairs] = useState([]);
  const [combinationPairsUpdated, setCombinationPairsUpdated] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editIndex, setEditIndex] = useState();
  const [createFormRef] = Form.useForm();
  const [editProductFormRef] = Form.useForm();
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
  } = useOutletContext();
  // const [imageList, setImageList] = useState([]);
  const record = location.state?.record;
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`Render count: ${renderCount.current}`);
  });

  console.log("record", record);

  const initialValues = {
    // productNature: "G",
  };

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

  const { data: unitData, loading: unitLoading } = useQuery(GET_PRODUCT_UNITS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
  });

  const { data: categoryData, loading: categoryLoading } = useQuery(
    GET_PRODUCT_CATEGORIES,
    {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );
  //Mutations
  const [updateProductGroup, { loading: editLoading }] = useMutation(
    UPDATE_PRODUCT_GROUP,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="productGroup.updated"
            defaultMessage="Product Group Updated"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = editLoading || unitLoading || categoryLoading;

  useMemo(() => {
    const salesTaxId =
      record.variants[0]?.salesTax?.type + record.variants[0]?.salesTax?.id;
    const purchaseTaxId =
      record.variants[0]?.purchaseTax?.type +
      record.variants[0]?.purchaseTax?.id;
    const parsedRecord =
      record && record.variants
        ? {
            productGroupName: record?.name,
            description: record?.description,
            inventoryAccount: record?.variants[0]?.inventoryAccount?.id,
            purchaseAccount: record?.variants[0]?.purchaseAccount?.id,
            salesAccount: record?.variants[0]?.salesAccount?.id,
            unit: record?.productUnit?.id,
            salesTax: salesTaxId,
            purchaseTax: purchaseTaxId,
            category: record?.category?.id,
            // Map variants to form fields
            ...record.variants.reduce((item, variant, index) => {
              item[`sku${index}`] = variant.sku;
              item[`salesPrice${index}`] = variant.salesPrice;
              item[`purchasePrice${index}`] = variant.purchasePrice;
              item[`barcode${index}`] = variant.barcode;
              return item;
            }, {}),
          }
        : {};

    // console.log("Parsed Record", parsedRecord);
    editProductFormRef.setFieldsValue(parsedRecord);

    if (record && record.variants && record.options) {
      const mappedVariants = record.variants.map((variant, index) => ({
        id: index,
        key: index,
        productName: variant.name,
      }));
      setCombinationPairs(mappedVariants);
      const mappedOptions = record.options.map((option, index) => ({
        name: option.optionName,
        id: index,
        values: option.optionUnits.split("|").map((value, index) => ({
          value,
          id: `${value}${index}`,
        })),
      }));
      setProductVariations(mappedOptions);
    }
  }, [editProductFormRef, record]);

  const taxes = useMemo(() => {
    return taxData?.listTax;
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listTaxGroup;
  }, [taxGroupData]);

  const units = useMemo(() => {
    return unitData?.listProductUnit;
  }, [unitData]);

  const categories = useMemo(() => {
    return categoryData?.listProductCategory?.filter(
      (tax) => tax.isActive === true
    );
  }, [categoryData]);

  const salesAccounts = useMemo(() => {
    return accountData?.listAllAccount?.filter(
      (acc) => acc.mainType === "Income"
    );
  }, [accountData]);

  const purchaseAccounts = useMemo(() => {
    return accountData?.listAllAccount?.filter(
      (acc) => acc.mainType === "Expense"
    );
  }, [accountData]);

  const inventoryAccounts = useMemo(() => {
    return accountData?.listAllAccount?.filter(
      (acc) => acc.detailType === "Stock"
    );
  }, [accountData]);

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
        id: `${value}${index}`,
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
        id: `${value}${index}`,
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
      salesPrice: values[`salesPrice${item.key}`],
      purchasePrice: values[`purchasePrice${item.key}`],
      barcode: values[`barcode${item.key}`],
      salesAccountId: values.salesAccount,
      purchaseAccountId: values.purchaseAccount,
      inventoryAccountId: values.inventoryAccount,
      isSalesTaxInclusive: false,
      productGroupId: 0,
      salesTaxId,
      salesTaxType,
      purchaseTaxId,
      purchaseTaxType,
    }));
    const options = productVariations.map((item) => ({
      optionName: item.name,
      optionUnits: item.values.map((item) => item.value).join("|"),
    }));
    const input = {
      // productNature: values.productNature,
      name: values.productGroupName,
      description: values.description,
      unitId: values.unit,
      categoryId: values.category,
      supplierId: 2,
      variants,
      options,
    };
    console.log("input", input);
    updateProductGroup({
      variables: { id: record.id, input },
      update(cache, { data: { updateProductGroup } }) {
        cache.modify({
          fields: {
            paginateProductGroup(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) => x.node.__ref === "ProductGroup:" + updateProductGroup.id
              );
              if (index >= 0) {
                const newProductGroup = cache.writeFragment({
                  data: updateProductGroup,
                  fragment: gql`
                    fragment NewProductGroup on ProductGroup {
                      id
                      name
                      description
                      unitId
                      categoryId
                      supplierId
                      variants
                      options
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newProductGroup;
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

  const columns = [
    {
      title: "Product Name",
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
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (_, record) => (
        <Form.Item name={`sku${record.key}`}>
          <Input maxLength={100} />
        </Form.Item>
      ),
    },
    {
      title: "Cost Price (MMK)",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (_, record) => (
        <Form.Item name={`purchasePrice${record.key}`}>
          <Input />
        </Form.Item>
      ),
    },
    {
      title: "Selling Price (MMK)",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (_, record) => (
        <Form.Item name={`salesPrice${record.key}`}>
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
                Add Option Value
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
                Add Option Value
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );

  const editProductForm = (
    <Form
      initialValues={initialValues}
      className="product-new-form"
      form={editProductFormRef}
      onFinish={onFinish}
    >
      <Row>
        <Col lg={14}>
          <Row>
            <Col lg={19}>
              {/* <Form.Item
                label={
                  <FormattedMessage id="label.type" defaultMessage="Type" />
                }
                labelCol={{ span: 5 }}
                labelAlign="left"
                name="productNature"
              >
                <Radio.Group>
                  <Radio value="G"> Goods </Radio>
                  <Radio value="S"> Service </Radio>
                </Radio.Group>
              </Form.Item> */}
              <Form.Item
                name="productGroupName"
                label="Product Group Name"
                labelCol={{ span: 5 }}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.productName.required"
                        defaultMessage="Product name must be defined"
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
                label="Description"
                labelCol={{ span: 5 }}
                labelAlign="left"
              >
                <Input.TextArea maxLength={1000} rows={4}></Input.TextArea>
              </Form.Item>
            </Col>
          </Row>
          <br />
          <br />
        </Col>
        <Col lg={5}>
          <UploadImage />
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <Form.Item
            label={<FormattedMessage id="label.unit" defaultMessage="Unit" />}
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="unit"
          >
            <Select
              placeholder="Select or type to add"
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
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.salesTax"
                defaultMessage="Sales Tax"
              />
            }
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="salesTax"
          >
            <Select
              placeholder="Select or type to add"
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
                id="label.purchaseTax"
                defaultMessage="Purchase Tax"
              />
            }
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="purchaseTax"
          >
            <Select
              placeholder="Select or type to add"
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
              <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
            }
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="supplier"
          >
            <Select
              placeholder="Select a Supplier"
              showSearch
              allowClear
              loading={loading}
            ></Select>
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.category" defaultMessage="category" />
            }
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="category"
          >
            <Select
              placeholder="Select Category"
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
        </Col>
        <Col lg={7} offset={1}>
          <Form.Item
            label={
              <FormattedMessage
                id="label.salesAccount"
                defaultMessage="Sales Account"
              />
            }
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="salesAccount"
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
                id="label.purchaseAccount"
                defaultMessage="Purchase Account"
              />
            }
            labelAlign="left"
            labelCol={{ span: 8 }}
            name="purchaseAccount"
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
                id="label.inventoryAccount"
                defaultMessage="Inventory Account"
              />
            }
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="inventoryAccount"
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
      <div className="page-actions-bar page-actions-bar-margin">
        <Button
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          // onClick={() =>
          //   navigate("/openingStock", {
          //     state: { combinationPairs },
          //   })
          // }
        >
          Save and Next
        </Button>
        <Button
          className="page-actions-btn"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        >
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </div>
    </Form>
  );

  return (
    <>
      <Modal
        title="Add Variants"
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
        title="Edit Variants"
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
        <p className="page-header-text">Edit Product Group</p>
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
            <Space>
              <CheckCircleFilled />
              <span>General</span>
            </Space>
            <RightOutlined />
            <span>Opening Stock</span>
          </Space>
        </Row>
        {editProductForm}
        <br />
        <div className="product-variants-container">
          <p>Variants</p>
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
              Add Variants
            </a>
          </Space>
        </div>
        <Form form={editProductFormRef} onFinish={onFinish}>
          <Table
            dataSource={combinationPairs}
            columns={columns}
            pagination={false}
            rowKey={(record) => record.id}
            className="product-variant-table"
          />
        </Form>
      </div>
    </>
  );
};

export default ProductGroupsEdit;
