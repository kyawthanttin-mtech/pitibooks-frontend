import React, { useMemo, useState } from "react";
import "./ExpensesNew.css";

import { Button, Form, Input, DatePicker, Select, Radio } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useMutation, useReadQuery } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { ExpenseMutations } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import {
  CustomerSearchModal,
  SupplierSearchModal,
  UploadAttachment,
} from "../../components";

const { CREATE_EXPENSE } = ExpenseMutations;

const ExpensesNew = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const {
    notiApi,
    msgApi,
    business,
    allAccountsQueryRef,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allTaxesQueryRef,
    allTaxGroupsQueryRef,
  } = useOutletContext();
  const [supplierSearchModalOpen, setSupplierSearchModalOpen] = useState(false);
  const [customerSearchModalOpen, setCustomerSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [fileList, setFileList] = useState(null);

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

  // Mutations
  const [createExpense, { loading: createLoading }] = useMutation(
    CREATE_EXPENSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="expense.created"
            defaultMessage="New Expense Created"
          />
        );

        if (from === "/") {
          navigate("/expenses");
        } else {
          navigate(from, { state: location.state, replace: true });
        }
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_EXPENSES],
    }
  );

  const loading = createLoading;

  const onFinish = (values) => {
    // console.log("values", values);

    const selectedTax = allTax.find((t) =>
      t.taxes.some((tax) => tax.id === values.tax)
    );
    const taxType =
      selectedTax && selectedTax.title === "Tax Group" ? "G" : "I";
    const taxId = values?.tax
      ? parseInt(values?.tax?.replace(/[IG]/, ""), 10)
      : 0;
    const isTaxInclusive =
      values.taxOption && values.taxOption === "I" ? true : false;

    const fileUrls = fileList?.map((file) => ({
      documentUrl: file.imageUrl,
    }));

    const input = {
      expenseAccountId: values.expenseAccount,
      assetAccountId: values.paidThrough,
      branchId: values.branch,
      expenseDate: values.date,
      currencyId: values.currency,
      exchangeRate: values.exchangeRate ? parseFloat(values.exchangeRate) : 0,
      amount: values.amount ? parseFloat(values.amount) : 0,
      supplierId: selectedSupplier.id || 0,
      customerId: selectedCustomer.id || 0,
      referenceNumber: values.referenceNumber,
      bankCharges: values.bankCharges,
      notes: values.notes,
      expenseTaxId: taxId,
      expenseTaxType: taxType,
      isTaxInclusive,
      documents: fileUrls,
    };
    // console.log("input", input);

    createExpense({
      variables: { input },
    });
  };

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter((b) => b.isActive === true);
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const expenseAccounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter(
        (a) =>
          a.isActive === true &&
          (a.detailType === "CostOfGoodsSold" ||
            a.detailType === "Expense" ||
            a.detailType === "OtherCurrentLiability" ||
            a.detailType === "FixedAsset" ||
            a.detailType === "OtherCurrentAsset")
      )
      .reduce((acc, account) => {
        const { detailType } = account;
        if (!acc[detailType]) {
          acc[detailType] = { detailType, accounts: [] };
        }
        acc[detailType].accounts.push(account);
        return acc;
      }, {});

    return Object.values(groupedAccounts);
  }, [accountData]);

  const assetAccounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter(
        (a) =>
          a.isActive === true &&
          (a.detailType === "OtherCurrentAsset" ||
            a.detailType === "Cash" ||
            a.detailType === "OtherCurrentLiability" ||
            a.detailType === "FixedAsset" ||
            a.detailType === "Bank" ||
            a.detailType === "Equity")
      )
      .reduce((acc, account) => {
        const { detailType } = account;
        if (!acc[detailType]) {
          acc[detailType] = { detailType, accounts: [] };
        }
        acc[detailType].accounts.push(account);
        return acc;
      }, {});

    return Object.values(groupedAccounts);
  }, [accountData]);

  const taxes = useMemo(() => {
    return taxData?.listAllTax?.filter((tax) => tax.isActive === true);
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup?.filter(
      (tax) => tax.isActive === true
    );
  }, [taxGroupData]);

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

  return (
    <>
      <SupplierSearchModal
        modalOpen={supplierSearchModalOpen}
        setModalOpen={setSupplierSearchModalOpen}
        onRowSelect={(record) => {
          setSelectedSupplier(record);
          form.setFieldsValue({ supplierName: record.name });
        }}
      />
      <CustomerSearchModal
        modalOpen={customerSearchModalOpen}
        setModalOpen={setCustomerSearchModalOpen}
        onRowSelect={(record) => {
          setSelectedCustomer(record);
          form.setFieldsValue({ customerName: record.name });
        }}
      />
      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage id="expense.new" defaultMessage="New Expense" />
        </p>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <div className="page-form-wrapper">
          <Form form={form} onFinish={onFinish}>
            <Form.Item
              label={
                <FormattedMessage id="label.branch" defaultMessage="Branch" />
              }
              name="branch"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
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
              <Select allowClear showSearch optionFilterProp="label">
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
            <Form.Item
              label={<FormattedMessage id="label.date" defaultMessage="Date" />}
              name="date"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
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
                format={REPORT_DATE_FORMAT}
                onChange={(date, dateString) => console.log(date, dateString)}
              ></DatePicker>
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage
                  id="label.expenseAccount"
                  defaultMessage="Expense Account"
                />
              }
              name="expenseAccount"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.expenseAccount.required"
                      defaultMessage="Select the Expense Account"
                    />
                  ),
                },
              ]}
            >
              <Select showSearch optionFilterProp="label">
                {expenseAccounts.map((group) => (
                  <Select.OptGroup
                    key={group.detailType}
                    label={group.detailType}
                  >
                    {group.accounts.map((acc) => (
                      <Select.Option
                        key={acc.id}
                        value={acc.id}
                        label={acc.name}
                      >
                        {acc.name}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage
                  id="label.paidThrough"
                  defaultMessage="Paid Through"
                />
              }
              name="paidThrough"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.paidThrough.required"
                      defaultMessage="Select the Paid Through"
                    />
                  ),
                },
              ]}
            >
              <Select showSearch optionFilterProp="label">
                {assetAccounts.map((group) => (
                  <Select.OptGroup
                    key={group.detailType}
                    label={group.detailType}
                  >
                    {group.accounts.map((acc) => (
                      <Select.Option
                        key={acc.id}
                        value={acc.id}
                        label={acc.name}
                      >
                        {acc.name}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
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
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
            >
              <Input maxLength={255}></Input>
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage id="label.notes" defaultMessage="Notes" />
              }
              name="notes"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
            >
              <TextArea maxLength={1000}></TextArea>
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage id="label.amount" defaultMessage="Amount" />
              }
              name="amount"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.amount.required"
                      defaultMessage="Enter the Amount"
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
            <Form.Item
              label={
                <FormattedMessage
                  id="label.currency"
                  defaultMessage="Currency"
                />
              }
              name="currency"
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="label.currency.required"
                      defaultMessage="Select the Currency"
                    />
                  ),
                },
              ]}
            >
              <Select allowClear showSearch optionFilterProp="label">
                {currencies?.map((currency) => (
                  <Select.Option
                    key={currency.id}
                    value={currency.id}
                    label={currency.name + "" + currency.symbol}
                  >
                    {currency.name} ({currency.symbol})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.currency !== currentValues.currency
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("currency") &&
                getFieldValue("currency") !== business.baseCurrency.id ? (
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.exchangeRate"
                        defaultMessage="Exchange Rate"
                      />
                    }
                    name="exchangeRate"
                    labelAlign="left"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 8 }}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="label.exchangeRate.required"
                            defaultMessage="Enter the Exchange Rate"
                          />
                        ),
                      },

                      () => ({
                        validator(_, value) {
                          if (!value) {
                            return Promise.resolve();
                          } else if (
                            isNaN(value) ||
                            value.length > 20 ||
                            value < 0
                          ) {
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
                ) : null
              }
            </Form.Item>
            <Form.Item
              label={<FormattedMessage id="label.tax" defaultMessage="Tax" />}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
              labelAlign="left"
              name="tax"
            >
              <Select
                showSearch
                allowClear
                loading={loading}
                optionFilterProp="label"
              >
                {allTax?.map((taxGroup) => (
                  <Select.OptGroup key={taxGroup.title} label={taxGroup.title}>
                    {taxGroup.taxes.map((tax) => (
                      <Select.Option
                        key={tax.id}
                        value={tax.id}
                        label={tax.name}
                      >
                        {tax.name}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.tax !== currentValues.tax
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("tax") ? (
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.taxOption"
                        defaultMessage="Tax Option"
                      />
                    }
                    name="taxOption"
                    labelAlign="left"
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 6 }}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="label.taxOption.required"
                            defaultMessage="Select the Tax Option"
                          />
                        ),
                      },
                    ]}
                  >
                    <Radio.Group optionType="button">
                      <Radio value="I">
                        <FormattedMessage
                          id="label.taxOption.inclusive"
                          defaultMessage="Inclusive"
                        />
                      </Radio>
                      <Radio value="E">
                        <FormattedMessage
                          id="label.taxOption.exclusive"
                          defaultMessage="Exclusive"
                        />
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage
                  id="label.bankCharges"
                  defaultMessage="Bank Charges"
                />
              }
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
              labelAlign="left"
              name="bankCharges"
              rules={[
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
              <Input></Input>
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage
                  id="label.supplier"
                  defaultMessage="Supplier"
                />
              }
              name="supplierName"
              shouldUpdate
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
            >
              <Input
                readOnly
                onClick={setSupplierSearchModalOpen}
                className="search-input"
                allowClear
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
                      onClick={setSupplierSearchModalOpen}
                    />
                  </>
                }
              />
            </Form.Item>
            <Form.Item
              label={
                <FormattedMessage
                  id="label.customer"
                  defaultMessage="Customer"
                />
              }
              name="customerName"
              shouldUpdate
              labelAlign="left"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 8 }}
            >
              <Input
                readOnly
                onClick={setCustomerSearchModalOpen}
                className="search-input"
                suffix={
                  <>
                    {selectedCustomer && (
                      <CloseOutlined
                        style={{ height: 11, width: 11, cursor: "pointer" }}
                        onClick={() => {
                          setSelectedCustomer(null);
                          form.resetFields(["customerName"]);
                        }}
                      />
                    )}
                    <Button
                      style={{ width: "2.5rem" }}
                      type="primary"
                      icon={<SearchOutlined />}
                      className="search-btn"
                      onClick={setCustomerSearchModalOpen}
                    />
                  </>
                }
              />
            </Form.Item>
            <UploadAttachment
              onCustomFileListChange={(customFileList) =>
                setFileList(customFileList)
              }
            />
          </Form>
        </div>
      </div>
      <div className="page-actions-bar">
        <Button
          loading={loading}
          type="primary"
          htmlType="submit"
          className="page-actions-btn"
          onClick={form.submit}
        >
          <FormattedMessage id="button.save" defaultMessage="Save" />
        </Button>
        {/* <Button className="page-actions-btn">Save as Draft</Button> */}
        <Button
          loading={loading}
          className="page-actions-btn"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        >
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </div>
    </>
  );
};

export default ExpensesNew;
