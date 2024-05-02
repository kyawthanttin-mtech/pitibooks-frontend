import React, { useState, useMemo } from "react";
import { UploadImage } from "../../components";

import {
  Button,
  Row,
  Input,
  Form,
  Col,
  Checkbox,
  Select,
} from "antd";
import { FormattedMessage } from "react-intl";
import { CloseOutlined } from "@ant-design/icons";
import { useMutation, useQuery, gql } from "@apollo/client";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";

import { CategoryQueries, UnitQueries } from "../../graphql";
import { ProductMutations } from "../../graphql";
import { useReadQuery } from "@apollo/client";
const { GET_PRODUCT_UNITS } = UnitQueries;
const { GET_PRODUCT_CATEGORIES } = CategoryQueries;
const { UPDATE_PRODUCT } = ProductMutations;

const ProductsEdit = () => {
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
  } = useOutletContext();
  const [customFileList, setCustomFileList] = useState([]);
  const [isInventoryTracked, setIsInventoryTracked] = useState(false);
  const record = location.state?.record;

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
  // Mutations
  const [updateProduct, { loading: updateLoading }] = useMutation(
    UPDATE_PRODUCT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="product.updated"
            defaultMessage="Product Updated"
          />
        );
        refetchAllProducts();
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_JOURNALS],
    }
  );

  const loading = updateLoading || unitLoading || categoryLoading;

  useMemo(() => {
    // const salesTaxId = record?.salesTax?.type + record?.salesTax?.id;
    // const purchaseTaxId = record?.purchaseTax?.type + record?.purchaseTax?.id;
    const parsedRecord = record
      ? {
          name: record?.name,
          description: record?.description,
          category: record?.category?.id,
          unit: record?.productUnit?.id,
          supplier: record?.supplier?.id,
          sku: record?.sku,
          barcode: record?.barcode,
          salesAccount:
            record?.salesAccount?.id === 0 ? "" : record?.salesAccount?.id,
          salesPrice: record?.salesPrice,
          salesTax: record?.salesTax?.id === "I0" ? null : record?.salesTax?.id,
          purchaseAccount: record?.purchaseAccount?.id,
          purchasePrice: record?.purchasePrice,
          purchaseTax: record?.purchaseTax?.id === "I0" ? null : record?.purchaseTax?.id,
          inventoryAccount: record?.inventoryAccount?.id,      
        }
      : {};
        console.log(record);
    setIsInventoryTracked(record?.inventoryAccountId?.id !== 0 ? true : false);
    form.setFieldsValue(parsedRecord);
  }, [form, record]);

  const onFinish = (values) => {
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

    const imageUrls = customFileList.map((file) => ({
      imageUrl: file.url,
      thumbnailUrl: file.url,
    }));

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
      // supplier: values.supplier,
      categoryId: values.category,
      salesAccountId: values.salesAccount,
      purchaseAccountId: values.purchaseAccount,
      inventoryAccountId: values.inventoryAccount,
      isSalesTaxInclusive: false,
      salesPrice: parseFloat(values.salesPrice),
      purchasePrice: values.purchasePrice
        ? parseFloat(values.purchasePrice)
        : 0,
      supplierId: values.supplier || 0,
      isBatchTracking: false,
      // images: imageUrls,
    };
    console.log("Input", input);
    updateProduct({
      variables: { id: record.id, input },
      update(cache, { data: { updateProduct } }) {
        cache.modify({
          fields: {
            paginateProduct(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) => x.node.__ref === "Product:" + updateProduct.id
              );
              if (index >= 0) {
                const newProduct = cache.writeFragment({
                  data: updateProduct,
                  fragment: gql`
                    fragment NewProduct on Product {
                      id
                      name
                      sku
                      barcode
                      description
                      unit
                      salesTax
                      purchaseTax
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newProduct;
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

  const taxes = useMemo(() => {
    return taxData?.listAllTax;
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup;
  }, [taxGroupData]);

  const units = useMemo(() => {
    return unitData?.listProductUnit;
  }, [unitData]);

  const categories = useMemo(() => {
    return categoryData?.listProductCategory;
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

  function groupByDetailType(accounts) {
    return accounts?.reduce((groupedAccounts, account) => {
      if (!groupedAccounts[account.detailType]) {
        groupedAccounts[account.detailType] = [];
      }
      groupedAccounts[account.detailType].push(account);
      return groupedAccounts;
    }, {});
  }

  const handleCustomFileListChange = (newCustomFileList) => {
    setCustomFileList(newCustomFileList);
  };

  const productEditForm = (
    <Form
      className="product-new-form"
      onFinish={onFinish}
      form={form}
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
                    defaultMessage="Product name must be defined"
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
          {/* </Col> */}
          {/* </Row> */}
          <br />
          <br />
        </Col>
        <Col span={12}>
          <UploadImage onCustomFileListChange={handleCustomFileListChange} />
        </Col>
      </Row>
      <p style={{ fontSize: "var(--title-text)", marginTop: 0 }}>
        Product Details
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
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            labelAlign="left"
            name="supplier"
          >
            <Select
              // placeholder="Select a Supplier"
              showSearch
              allowClear
              loading={loading}
            ></Select>
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
                id="label.salesPrice"
                defaultMessage="Sales Price"
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
                id="label.purchasePrice"
                defaultMessage="Purchase Price"
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
        <Checkbox checked={isInventoryTracked} onChange={(e) => setIsInventoryTracked(e.target.checked)}>
          <FormattedMessage id="label.trackInventory" defaultMessage="Track Inventory" />
        </Checkbox>
      </Row>
      {isInventoryTracked &&
        <>
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
      }
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
      <div className="page-header">
        <p className="page-header-text">
          {<FormattedMessage id="product.edit" defaultMessage="Edit Product" />}
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
        {productEditForm}
        <br />
      </div>
    </>
  );
};

export default ProductsEdit;
