import React, { useState, useMemo } from "react";
import { SupplierSearchModal, UploadImage } from "../../components";

import { Button, Row, Input, Form, Col, Checkbox, Select } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation, useReadQuery, gql } from "@apollo/client";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { ProductMutations } from "../../graphql";
import { SYSTEM_ACCOUNT_CODE_INVENTORY_ASSET } from "../../config/Constants";

const { UPDATE_PRODUCT } = ProductMutations;

const ProductsEdit = () => {
  const intl = useIntl();
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
  } = useOutletContext();

  const record = location.state?.record;

  const [imageList, setImageList] = useState([]);
  const [isInventoryTracked, setIsInventoryTracked] = useState(
    record.inventoryAccount?.id && record.inventoryAccount?.id !== 0
      ? true
      : false
  );
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(
    record.supplier?.id ? record.supplier : ""
  );

  // Queries
  const { data: unitData } = useReadQuery(allProductUnitsQueryRef);
  const { data: categoryData } = useReadQuery(allProductCategoriesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

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

  const taxes = useMemo(() => {
    return taxData?.listAllTax;
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup;
  }, [taxGroupData]);

  const units = useMemo(() => {
    return unitData?.listAllProductUnit;
  }, [unitData]);

  const categories = useMemo(() => {
    return categoryData?.listAllProductCategory;
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

  const loading = updateLoading;

  useMemo(() => {
    // const salesTaxId = record?.salesTax?.type + record?.salesTax?.id;
    // const purchaseTaxId = record?.purchaseTax?.type + record?.purchaseTax?.id;
    const parsedRecord = record
      ? {
          name: record?.name,
          description: record?.description,
          category: record?.category?.id,
          unit: record?.productUnit?.id,
          supplierName: record?.supplier?.name,
          sku: record?.sku,
          barcode: record?.barcode,
          salesAccount:
            record?.salesAccount?.id === 0 ? "" : record?.salesAccount?.id,
          salesPrice: record?.salesPrice,
          salesTax: record?.salesTax?.id === "I0" ? null : record?.salesTax?.id,
          purchaseAccount: record?.purchaseAccount?.id,
          purchasePrice: record?.purchasePrice,
          purchaseTax:
            record?.purchaseTax?.id === "I0" ? null : record?.purchaseTax?.id,
          inventoryAccount:
            record?.inventoryAccount?.id !== 0
              ? record?.inventoryAccount?.id
              : defaultInventoryAccountId,
        }
      : {};
    console.log(record);
    setIsInventoryTracked(record?.inventoryAccount?.id !== 0 ? true : false);
    form.setFieldsValue(parsedRecord);
  }, [form, record, defaultInventoryAccountId]);

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    form.setFieldsValue({ supplierName: record.name });
  };

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

    const imageUrls = imageList.map((img) => ({
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl,
      isDeletedItem: img.isDeletedItem,
      id: img.id,
    }));

    console.log(imageUrls);

    const input = {
      // modifiers: record.modifiers,
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
      isBatchTracking: false,
      images: imageUrls,
    };
    // console.log("Input", input);
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
                      description
                      sku
                      category
                      modifiers
                      images
                      productUnit
                      supplier
                      barcode
                      salesPrice
                      salesAccount
                      salesTax
                      purchasePrice
                      purchaseAccount
                      purchaseTax
                      inventoryAccount
                      isBatchTracking
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
    setImageList(newCustomFileList);
    console.log(newCustomFileList);
  };

  const productEditForm = (
    <Form className="product-new-form" onFinish={onFinish} form={form}>
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
          <br />
        </Col>
        <Col span={12}>
          <UploadImage
            onCustomFileListChange={handleCustomFileListChange}
            images={record?.images}
          />
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
        <Checkbox
          checked={isInventoryTracked}
          onChange={(e) => setIsInventoryTracked(e.target.checked)}
        >
          <FormattedMessage
            id="label.trackInventory"
            defaultMessage="Track Inventory"
          />
        </Checkbox>
      </Row>
      {isInventoryTracked && (
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
        <div className="page-form-wrapper">{productEditForm}</div>
      </div>
    </>
  );
};

export default ProductsEdit;
