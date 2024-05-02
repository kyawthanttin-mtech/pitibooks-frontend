import React, { useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Radio,
  Select,
} from "antd";
import { CloseOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useReadQuery, useMutation, gql } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import { FormattedMessage } from "react-intl";
import { ExpenseMutations } from "../../graphql";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { CustomerSearchModal, SupplierSearchModal } from "../../components";

const { UPDATE_EXPENSE } = ExpenseMutations;

const ExpensesEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.record;
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

  // Queries
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);

  // Mutations
  const [updateExpense, { loading: updateLoading }] = useMutation(
    UPDATE_EXPENSE,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="expense.updated"
            defaultMessage="Expense Updated"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      // refetchQueries: [GET_EXPENSES],
    }
  );

  const loading = updateLoading;

  // Parse record

  useMemo(() => {
    const parsedRecord =
      record && record.id
        ? {
            branch: record.branch.id,
            date: dayjs(record.expenseDate),
            expenseAccount: record.expenseAccount.id,
            paidThrough: record.assetAccount.id,
            referenceNumber: record.referenceNumber,
            notes: record.notes,
            amount: record.amount,
            currency: record.currency.id,
            exchangeRate: record.exchangeRate,
            tax: record.expenseTax.id !== "I0" ? record.expenseTax.id : null,
            taxOption: record.isTaxInclusive ? "I" : "E",
            supplierName: record.supplier?.name,
            customerName: record.customer?.name,
          }
        : {};

    // console.log("Parsed Record", parsedRecord);
    setSelectedSupplier(record.supplier?.id ? record.supplier : "");
    setSelectedCustomer(record.customer?.id ? record.customer : "");
    form.setFieldsValue(parsedRecord);
  }, [form, record]);

  const branches = useMemo(() => {
    return branchData?.listAllBranch;
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency;
  }, [currencyData]);

  const expenseAccounts = useMemo(() => {
    return accountData?.listAllAccount.filter(
      (a) =>
        a.detailType === "CostOfGoodsSold" ||
        a.detailType === "Expense" ||
        a.detailType === "OtherCurrentLiability" ||
        a.detailType === "FixedAsset" ||
        a.detailType === "OtherCurrentAsset"
    );
  }, [accountData]);

  const assetAccounts = useMemo(() => {
    return accountData?.listAllAccount.filter(
      (a) =>
        a.detailType === "OtherCurrentAsset" ||
        a.detailType === "Cash" ||
        a.detailType === "OtherCurrentLiability" ||
        a.detailType === "FixedAsset" ||
        a.detailType === "Bank" ||
        a.detailType === "Equity"
    );
  }, [accountData]);

  const taxes = useMemo(() => {
    return taxData?.listAllTax;
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup;
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

  const onFinish = (values) => {
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
      notes: values.notes,
      expenseTaxId: taxId,
      expenseTaxType: taxType,
      isTaxInclusive,
    };

    // console.log("Input", input);
    updateExpense({
      variables: { id: record.id, input },
      update(cache, { data: { updateExpense } }) {
        cache.modify({
          fields: {
            paginateExpense(pagination = []) {
              const index = pagination.edges.findIndex(
                (x) => x.node.__ref === "Expense:" + updateExpense.id
              );
              if (index >= 0) {
                const newExpense = cache.writeFragment({
                  data: updateExpense,
                  fragment: gql`
                    fragment NewExpense on Expense {
                      id
                      expenseAccount 
                      assetAccount 
                      branch 
                      referenceNumber
                      expenseDate
                      notes
                      currency 
                      supplier
                      customer
                      amount
                      taxAmount
                      totalAmount
                      isTaxInclusive
                      exchangeRate
                      expenseTax 
                    }
                  `,
                });
                let paginationCopy = JSON.parse(JSON.stringify(pagination));
                paginationCopy.edges[index].node = newExpense;
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
          <FormattedMessage id="expense.edit" defaultMessage="Edit Expense" />
        </p>
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            label={
              <FormattedMessage id="label.branch" defaultMessage="Branch" />
            }
            name="branch"
            labelAlign="left"
            labelCol={{ span: 3 }}
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
                  label={branch.stateNameEn}
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
            labelCol={{ span: 3 }}
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
            <Select
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
              {expenseAccounts?.map((account) => (
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
            <Select
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
              {assetAccounts?.map((account) => (
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
            label={<FormattedMessage id="label.notes" defaultMessage="Notes" />}
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
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.currency" defaultMessage="Currency" />
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
                  ]}
                >
                  <InputNumber />
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
                    <Select.Option key={tax.id} value={tax.id} label={tax.name}>
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
              <FormattedMessage id="label.supplier" defaultMessage="Supplier" />
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
              <FormattedMessage id="label.customer" defaultMessage="Customer" />
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
        </Form>
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

export default ExpensesEdit;
