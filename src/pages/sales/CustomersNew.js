import React, { useState, useMemo } from "react";
import {
  Button,
  Row,
  Space,
  Table,
  Input,
  Form,
  Col,
  Select,
  Tabs,
} from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import {
  CloseOutlined,
  UploadOutlined,
  CloseCircleOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { CustomerMutations } from "../../graphql";
import { useReadQuery } from "@apollo/client";
const { CREATE_CUSTOMER } = CustomerMutations;

const paymentTerms = [
  "Net15",
  "Net30",
  "Net45",
  "Net60",
  "DueMonthEnd",
  "DueNextMonthEnd",
  "DueOnReceipt",
  "Custom",
];
const initialValues = {
  paymentTerms: "DueOnReceipt",
};

const CustomersNew = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const {
    notiApi,
    msgApi,
    business,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    allTaxesQueryRef,
    allTaxGroupsQueryRef,
    allStatesQueryRef,
    allTownshipsQueryRef,
  } = useOutletContext();
  const [data, setData] = useState([{ key: 0 }]);
  const [selectedBAState, setSelectedBAState] = useState(null);
  const [selectedSAState, setSelectedSAState] = useState(null);

  // Queries
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);
  const { data: taxData } = useReadQuery(allTaxesQueryRef);
  const { data: taxGroupData } = useReadQuery(allTaxGroupsQueryRef);
  const { data: stateData } = useReadQuery(allStatesQueryRef);
  const { data: townshipData } = useReadQuery(allTownshipsQueryRef);

  // Mutations
  const [createCustomer, { loading: createLoading }] = useMutation(
    CREATE_CUSTOMER,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="customer.created"
            defaultMessage="New Customer Created"
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

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter((b) => b.isActive === true);
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const taxes = useMemo(() => {
    return taxData?.listAllTax?.filter((tax) => tax.isActive === true);
  }, [taxData]);

  const taxGroups = useMemo(() => {
    return taxGroupData?.listAllTaxGroup?.filter(
      (tax) => tax.isActive === true
    );
  }, [taxGroupData]);

  const states = useMemo(() => {
    return stateData?.listAllState?.filter((s) => s.isActive === true);
  }, [stateData]);

  const townships = useMemo(() => {
    return townshipData?.listAllTownship?.filter((t) => t.isActive === true);
  }, [townshipData]);

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
    console.log("values", values);
    const contactPersons = data.map((item) => ({
      name: values[`name${item.key}`],
      email: values[`email${item.key}`],
      phone: values[`phone${item.key}`],
      mobile: values[`mobile${item.key}`],
      designation: values[`designation${item.key}`],
      department: values[`department${item.key}`],
    }));

    const billingAddress = {
      attention: values.b_attention,
      country: values.b_country,
      stateId: values.b_stateId,
      city: values.b_city,
      townshipId: values.b_townshipId,
      address: values.b_address,
      // email: values.b_email,
      phone: values.b_phone,
      mobile: values.b_mobile,
    };

    const shippingAddress = {
      attention: values.s_attention,
      country: values.s_country,
      stateId: values.s_stateId,
      city: values.s_city,
      townshipId: values.s_townshipId,
      address: values.s_address,
      // email: values.s_email,
      phone: values.s_phone,
      mobile: values.s_mobile,
    };

    const selectedTax = allTax.find((taxGroup) =>
      taxGroup.taxes.some((tax) => tax.id === values.tax)
    );
    const taxType =
      selectedTax && selectedTax.title === "Tax Group" ? "G" : "I";

    const taxId = values?.tax
      ? parseInt(values?.tax?.replace(/[IG]/, ""), 10)
      : 0;

    const input = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      mobile: values.mobile,
      currencyId: values.currency,
      customerTaxId: taxId,
      customerTaxType: taxType,
      openingBalance: values.openingBalance,
      openingBalanceBranchId: values.branch,
      customerPaymentTerms: values.paymentTerms,
      customerPaymentTermsCustomDays: values.customDays ? values.customDays : 0,
      contactPersons: contactPersons ? contactPersons : [],
      billingAddress,
      shippingAddress,
      notes: values.notes,
      exchangeRate: values.exchangeRate,
    };
    console.log("ContactPersons", contactPersons);
    console.log("Input", input);
    createCustomer({
      variables: { input },
    });
  };

  const handleAddRow = () => {
    const newRowKey = data.length + 1;
    setData([...data, { key: newRowKey }]);
  };

  const handleRemoveRow = (keyToRemove) => {
    const newData = data.filter((item) => item.key !== keyToRemove);
    setData(newData);
  };

  const columns = [
    {
      title: <FormattedMessage id="label.name" defaultMessage="Name" />,
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Form.Item name={`name${record.key}`}>
          <Input maxLength={100}></Input>
        </Form.Item>
      ),
    },
    {
      title: <FormattedMessage id="label.email" defaultMessage="Email" />,
      dataIndex: "email",
      key: "email",
      render: (_, record) => (
        <Form.Item name={`email${record.key}`}>
          <Input maxLength={100}></Input>
        </Form.Item>
      ),
    },
    {
      title: <FormattedMessage id="label.phone" defaultMessage="Phone" />,
      dataIndex: "phone",
      key: "phone",
      render: (_, record) => (
        <Form.Item name={`phone${record.key}`}>
          <Input maxLength={100}></Input>
        </Form.Item>
      ),
    },
    {
      title: <FormattedMessage id="label.mobile" defaultMessage="Mobile" />,
      dataIndex: "mobile",
      key: "mobile",
      render: (_, record) => (
        <Form.Item name={`mobile${record.key}`}>
          <Input maxLength={100}></Input>
        </Form.Item>
      ),
    },
    {
      title: (
        <FormattedMessage id="label.designation" defaultMessage="Designation" />
      ),
      dataIndex: "designation",
      key: "designation",
      render: (_, record) => (
        <Form.Item name={`designation${record.key}`}>
          <Input maxLength={100}></Input>
        </Form.Item>
      ),
    },
    {
      title: (
        <FormattedMessage id="label.department" defaultMessage="Department" />
      ),
      dataIndex: "department",
      key: "department",
      render: (_, record) => (
        <Form.Item name={`department${record.key}`}>
          <Input maxLength={100}></Input>
        </Form.Item>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: "5%",
      render: (_, record, index) =>
        index > 0 ? (
          <CloseCircleOutlined
            style={{ color: "red" }}
            onClick={() => data.length > 1 && handleRemoveRow(record.key)}
          />
        ) : (
          <></>
        ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <p className="page-header-text">New Customer</p>
        <Button
          icon={<CloseOutlined />}
          type="text"
          onClick={() =>
            navigate(from, { state: location.state, replace: true })
          }
        />
      </div>
      <div className="page-content page-content-with-padding page-content-with-form-buttons">
        <Form initialValues={initialValues} form={form} onFinish={onFinish}>
          <Form.Item
            label={<FormattedMessage id="label.name" defaultMessage="Name" />}
            name="name"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="label.name.required"
                    defaultMessage="Enter the Name"
                  />
                ),
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="label.email" defaultMessage="Email" />}
            name="email"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="label.phone" defaultMessage="Phone" />}
            name="phone"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item
            label={
              <FormattedMessage id="label.mobile" defaultMessage="Mobile" />
            }
            name="mobile"
            labelAlign="left"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 8 }}
          >
            <Input maxLength={20} />
          </Form.Item>
          <div className="page-actions-bar page-actions-bar-margin">
            <Button
              type="primary"
              htmlType="submit"
              className="page-actions-btn"
              //   loading={loading}
            >
              Save
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
          <Tabs>
            <Tabs.TabPane
              tab={
                <FormattedMessage
                  id="label.otherDetails"
                  defaultMessage="Other Details"
                />
              }
              key="otherDetails"
              style={{ paddingTop: "2rem" }}
            >
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
                      wrapperCol={{ span: 5 }}
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
                      <Input />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
              <Form.Item
                label={<FormattedMessage id="label.tax" defaultMessage="Tax" />}
                name="tax"
                labelAlign="left"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 8 }}
                // rules={[
                //   {
                //     required: true,
                //     message: (
                //       <FormattedMessage
                //         id="label.tax.required"
                //         defaultMessage="Select the Tax"
                //       />
                //     ),
                //   },
                // ]}
              >
                <Select
                  showSearch
                  allowClear
                  loading={loading}
                  optionFilterProp="label"
                >
                  {allTax?.map((taxGroup) => (
                    <Select.OptGroup
                      key={taxGroup.title}
                      label={taxGroup.title}
                    >
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
              <Row>
                <Col span={12}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.openingBalance"
                        defaultMessage="Opening Balance"
                      />
                    }
                    name="branch"
                    labelAlign="left"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 12 }}
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
                </Col>
                <Col>
                  <Form.Item
                    name="openingBalance"
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
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label={
                  <FormattedMessage
                    id="label.paymentTerms"
                    defaultMessage="Payment Terms"
                  />
                }
                name="paymentTerms"
                labelAlign="left"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 8 }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="label.paymentTerms.required"
                        defaultMessage="Select the Payment Terms"
                      />
                    ),
                  },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  //   loading={loading}
                  optionFilterProp="label"
                >
                  {paymentTerms?.map((p) => (
                    <Select.Option key={p} value={p} label={p}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.paymentTerms !== currentValues.paymentTerms
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("paymentTerms") &&
                  getFieldValue("paymentTerms") === "Custom" ? (
                    <Form.Item
                      label={
                        <FormattedMessage
                          id="label.customDays"
                          defaultMessage="Custom Day(s)"
                        />
                      }
                      name="customDays"
                      labelAlign="left"
                      labelCol={{ span: 5 }}
                      wrapperCol={{ span: 5 }}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="label.customDays.required"
                              defaultMessage="Enter the Custom Day(s)"
                            />
                          ),
                        },

                        () => ({
                          validator(_, value) {
                            if (!value) {
                              return Promise.resolve();
                            } else if (isNaN(value) || value.length > 3 || !Number.isInteger(Number(value)) || Number(value) < 1) {
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
                label={
                  <FormattedMessage
                    id="label.documents"
                    defaultMessage="Documents"
                  />
                }
                name="documents"
                labelAlign="left"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 8 }}
              >
                <div className="attachment-upload">
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
              </Form.Item>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <FormattedMessage id="label.address" defaultMessage="Address" />
              }
              key="address"
              style={{ paddingTop: "2rem" }}
            >
              <Row>
                <Col span={12}>
                  <p style={{ fontSize: "1rem", marginTop: 0 }}>
                    <FormattedMessage
                      id="label.billingAddress"
                      defaultMessage="Billing Address"
                    />
                  </p>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.attention"
                        defaultMessage="Attention"
                      />
                    }
                    name="b_attention"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item
                    label="Country"
                    name="b_country"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Select>
                      <Select.Option value="Myanmar">Myanmar</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.state"
                        defaultMessage="State"
                      />
                    }
                    name="b_stateId"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      onChange={(value) => {
                        setSelectedBAState(
                          states?.find((state) => state.id === value)
                        );
                        form.setFieldValue("b_townshipId", null);
                      }}
                    >
                      {states?.map((state) => (
                        <Select.Option
                          key={state.id}
                          value={state.id}
                          label={state.stateNameEn}
                        >
                          {state.stateNameEn}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage id="label.city" defaultMessage="City" />
                    }
                    name="b_city"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.b_stateId !== currentValues.b_stateId
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue("b_stateId") ? (
                        <Form.Item
                          label={
                            <FormattedMessage
                              id="label.township"
                              defaultMessage="Township"
                            />
                          }
                          name="b_townshipId"
                          labelAlign="left"
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 12 }}
                        >
                          <Select
                            loading={loading}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                          >
                            {townships?.map((township) => {
                              if (
                                township.stateCode === selectedBAState?.code
                              ) {
                                return (
                                  <Select.Option
                                    key={township.id}
                                    value={township.id}
                                    label={township.townshipNameEn}
                                  >
                                    {township.townshipNameEn}
                                  </Select.Option>
                                );
                              }
                              return null;
                            })}
                          </Select>
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.address"
                        defaultMessage="Address"
                      />
                    }
                    name="b_address"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input.TextArea maxLength={1000} rows={4} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.email"
                        defaultMessage="Email"
                      />
                    }
                    name="b_email"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.phone"
                        defaultMessage="Phone"
                      />
                    }
                    name="b_phone"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={20} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.mobile"
                        defaultMessage="Mobile"
                      />
                    }
                    name="b_mobile"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={20} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <p style={{ fontSize: "1rem", marginTop: 0 }}>
                    <FormattedMessage
                      id="label.shippingAddress"
                      defaultMessage="Shipping Address"
                    />
                    <Button
                      type="link"
                      onClick={() => {
                        const values = form.getFieldsValue();
                        form.setFieldValue(
                          "s_attention",
                          values["b_attention"]
                        );
                        form.setFieldValue("s_country", values["b_country"]);
                        form.setFieldValue("s_stateId", values["b_stateId"]);
                        form.setFieldValue("s_city", values["b_city"]);
                        form.setFieldValue(
                          "s_townshipId",
                          values["b_townshipId"]
                        );
                        form.setFieldValue("s_address", values["b_address"]);
                        form.setFieldValue("s_email", values["b_email"]);
                        form.setFieldValue("s_phone", values["b_phone"]);
                        form.setFieldValue("s_mobile", values["b_mobile"]);
                      }}
                    >
                      <FormattedMessage
                        id="button.copyBillingAddress"
                        defaultMessage="Copy Billing Address"
                      />
                    </Button>
                  </p>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.attention"
                        defaultMessage="Attention"
                      />
                    }
                    name="s_attention"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.country"
                        defaultMessage="Country"
                      />
                    }
                    name="s_country"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Select>
                      <Select.Option value="Myanmar">Myanmar</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.state"
                        defaultMessage="State"
                      />
                    }
                    name="s_stateId"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      onChange={(value) => {
                        setSelectedSAState(
                          states?.find((state) => state.id === value)
                        );
                        form.setFieldValue("s_townshipId", null);
                      }}
                    >
                      {states?.map((state) => (
                        <Select.Option
                          key={state.id}
                          value={state.id}
                          label={state.stateNameEn}
                        >
                          {state.stateNameEn}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage id="label.city" defaultMessage="City" />
                    }
                    name="s_city"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.s_stateId !== currentValues.s_stateId
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue("s_stateId") ? (
                        <Form.Item
                          label={
                            <FormattedMessage
                              id="label.township"
                              defaultMessage="Township"
                            />
                          }
                          name="s_townshipId"
                          labelAlign="left"
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 12 }}
                        >
                          <Select
                            loading={loading}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                          >
                            {townships?.map((township) => {
                              if (
                                township.stateCode === selectedSAState?.code
                              ) {
                                return (
                                  <Select.Option
                                    key={township.id}
                                    value={township.id}
                                    label={township.townshipNameEn}
                                  >
                                    {township.townshipNameEn}
                                  </Select.Option>
                                );
                              }
                              return null;
                            })}
                          </Select>
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.address"
                        defaultMessage="Address"
                      />
                    }
                    name="s_address"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input.TextArea maxLength={1000} rows={4} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.email"
                        defaultMessage="Email"
                      />
                    }
                    name="s_email"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.phone"
                        defaultMessage="Phone"
                      />
                    }
                    name="s_phone"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={20} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.mobile"
                        defaultMessage="Mobile"
                      />
                    }
                    name="s_mobile"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={20} />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <FormattedMessage
                  id="label.contactPersons"
                  defaultMessage="Contact Persons"
                />
              }
              key="contactPersons"
              style={{ paddingTop: "2rem" }}
            >
              <Table
                className="input-only-table"
                pagination={false}
                style={{ width: "95%" }}
                dataSource={data}
                columns={columns}
                bordered={false}
              ></Table>
              <Button
                onClick={handleAddRow}
                className="add-row-button"
                type="link"
              >
                <Space>
                  <PlusCircleFilled className="add-row-icon" />
                  <FormattedMessage
                    id="button.addNewRow"
                    defaultMessage="Add New Row"
                  />
                </Space>
              </Button>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={<FormattedMessage id="label.notes" defaultMessage="Notes" />}
              key="notes"
              style={{ paddingTop: "2rem" }}
            >
              <Form.Item
                name="notes"
                labelAlign="left"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 12 }}
              >
                <div>
                  <label>
                    <FormattedMessage id="label.notes" defaultMessage="Notes" />
                  </label>
                  <Input.TextArea maxLength={1000} rows={4} />
                </div>
              </Form.Item>
            </Tabs.TabPane>
          </Tabs>
        </Form>
      </div>
    </>
  );
};

export default CustomersNew;
