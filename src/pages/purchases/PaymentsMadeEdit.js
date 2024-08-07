/* eslint-disable react/style-prop-object */
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
  // Dropdown,
  // InputNumber,
  // Space,
  // AutoComplete,
  // Checkbox,
} from "antd";
import {
  // CloseCircleOutlined,
  // PlusCircleFilled,
  UploadOutlined,
  CloseOutlined,
  // DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useReadQuery, useMutation, gql } from "@apollo/client";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { SupplierSearchModal, UploadAttachment } from "../../components";
import { useOutletContext } from "react-router-dom";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { SupplierPaymentMutations } from "../../graphql";
const { UPDATE_SUPPLIER_PAYMENT } = SupplierPaymentMutations;

const initialValues = {
  paymentDate: dayjs(),
};

const PaymentsMadeEdit = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const record = location.state?.record;
  const {
    notiApi,
    msgApi,
    allPaymentModesQueryRef,
    allAccountsQueryRef,
    allBranchesQueryRef,
    allCurrenciesQueryRef,
    business,
  } = useOutletContext();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(record?.supplier);
  const [bankCharges, setBankCharges] = useState(record?.bankCharges);
  const [paidAmountTotal, setPaidAmountTotal] = useState(record?.amount);
  const [fileList, setFileList] = useState(null);
  const { data: paymentModeData } = useReadQuery(allPaymentModesQueryRef);
  const { data: accountData } = useReadQuery(allAccountsQueryRef);
  const { data: branchData } = useReadQuery(allBranchesQueryRef);
  const { data: currencyData } = useReadQuery(allCurrenciesQueryRef);

  const [selectedBranch, setSelectedBranch] = useState(record?.branch?.id);
  const [selectedCurrency, setSelectedCurrency] = useState(
    record?.currency?.id
  );
  const [accountCurrencyId, setAccountCurrencyId] = useState(
    record?.withdrawAccount?.currency?.id
  );
  console.log("paid total", paidAmountTotal);
  const paidBills = useMemo(() => {
    const transformPaidBills = (paidBills) => {
      return paidBills.map((paidBill) => ({
        paidBillId: paidBill.id,
        ...paidBill.bill,
        paidAmount: paidBill.paidAmount,
      }));
    };

    return record.paidBills ? transformPaidBills(record.paidBills || []) : [];
  }, [record.paidBills]);

  const filteredData = useMemo(() => {
    if (selectedSupplier && selectedBranch && selectedCurrency) {
      const unpaidBills = selectedSupplier.unpaidBills || [];

      // Create a Map to store bills by their IDs
      const billMap = new Map();

      // Add unpaid bills to the map
      unpaidBills.forEach((bill) => {
        billMap.set(bill.id, { ...bill, isPaid: false });
      });

      // Add paid bills to the map, overwriting any unpaid bills with the same ID
      paidBills.forEach((bill) => {
        billMap.set(bill.id, { ...bill, isPaid: true });
      });

      // Convert the map values to an array
      const combinedBills = Array.from(billMap.values());

      // Filter the combined bills based on the selected branch and currency
      const filtered = combinedBills.filter(
        (bill) =>
          bill.branch?.id === selectedBranch &&
          bill.currency?.id === selectedCurrency
      );

      // Sort the filtered bills so that paid bills come first
      const sorted = filtered.sort((a, b) => b.isPaid - a.isPaid);

      // Add a key to each bill
      return sorted.map((bill, index) => ({
        ...bill,
        key: index + 1,
      }));
    }
    return [];
  }, [selectedSupplier, selectedBranch, selectedCurrency, paidBills]);

  useEffect(() => {
    setData(filteredData);
  }, [filteredData]);

  console.log(data);
  console.log("RECORD", record);
  useMemo(() => {
    const parsedRecord = record
      ? {
          supplierName: record.supplier?.name,
          branch: record.branch?.id,
          currency: record.currency?.id,
          exchangeRate: record.exchangeRate,
          paymentDate: dayjs(record.paymentDate),
          paidThrough: record.withdrawAccount?.id || null,
          paymentMode: record.paymentMode?.id || null,
          bankCharges: record.bankCharges,
          referenceNumber: record.referenceNumber,
          notes: record.notes,
        }
      : {};

    form.setFieldsValue(parsedRecord);
  }, [form, record]);

  // Mutations
  const [updateSupplierPayment, { loading: updateLoading }] = useMutation(
    UPDATE_SUPPLIER_PAYMENT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="supplierPayment.updated"
            defaultMessage="Supplier Payment Updated"
          />
        );
        navigate(from, { state: location.state, replace: true });
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const loading = updateLoading;

  const paymentModes = useMemo(() => {
    return paymentModeData?.listAllPaymentMode?.filter(
      (mode) => mode.isActive === true
    );
  }, [paymentModeData]);

  const branches = useMemo(() => {
    return branchData?.listAllBranch?.filter(
      (branch) => branch.isActive === true
    );
  }, [branchData]);

  const currencies = useMemo(() => {
    return currencyData?.listAllCurrency?.filter((c) => c.isActive === true);
  }, [currencyData]);

  const accounts = useMemo(() => {
    if (!accountData?.listAllAccount) return [];

    const groupedAccounts = accountData.listAllAccount
      .filter(
        (account) =>
          account.detailType === "Cash" ||
          account.detailType === "Bank" ||
          account.detailType === "OtherAsset" ||
          account.detailType === "OtherCurrentAsset" ||
          account.detailType === "Equity"
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

  const onFinish = async (values) => {
    try {
      const values = await form.validateFields();

      let paidBills = [];
      let foundInvalid = false;

      data.forEach((item) => {
        let paidAmount = parseFloat(values[`paidAmount${item.key}`]) || 0;
        if (paidAmount > 0 || item.paidBIllId) {
          if (item.paidBillId) {
            paidBills.push({
              billId: item.id,
              paidBillId: item.paidBillId,
              paidAmount,
            });
          } else {
            paidBills.push({
              billId: item.id,
              paidAmount,
            });
          }
        } else if (paidAmount < 0) {
          foundInvalid = true;
        }
      });

      if (foundInvalid) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "validation.paymentAmountCannotBeNegative",
            defaultMessage: "Payment Amount cannot be negative",
          })
        );
        return;
      }

      if (paidBills.length <= 0) {
        openErrorNotification(
          notiApi,
          intl.formatMessage({
            id: "validation.enterAtLeastOnePayment",
            defaultMessage: "Enter At Least One Payment",
          })
        );
        return;
      }

      const fileUrls = fileList?.map((file) => ({
        documentUrl: file.imageUrl || file.documentUrl,
        isDeletedItem: file.isDeletedItem,
        id: file.id,
      }));

      const input = {
        branchId: selectedBranch,
        supplierId: selectedSupplier.id,
        currencyId: selectedCurrency,
        exchangeRate: values.exchangeRate,
        amount: paidAmountTotal,
        bankCharges: values.bankCharges,
        paymentDate: values.paymentDate,
        paymentModeId: values.paymentMode || 0,
        withdrawAccountId: values.paidThrough,
        referenceNumber: values.referenceNumber,
        notes: values.notes,
        paidBills,
        documents: fileUrls,
      };
      console.log("input", input);
      // await updateSupplierPayment({ variables: { input: input } });
      await updateSupplierPayment({
        variables: { id: record.id, input },
        update(cache, { data: { updateSupplierPayment } }) {
          cache.modify({
            fields: {
              paginateSupplierPayment(pagination = []) {
                const index = pagination.edges.findIndex(
                  (x) =>
                    x.node.__ref ===
                    "SupplierPayment:" + updateSupplierPayment.id
                );
                if (index >= 0) {
                  const newSupplierPayment = cache.writeFragment({
                    data: updateSupplierPayment,
                    fragment: gql`
                      fragment NewSupplierPayment on SupplierPayment {
                        id
                        branch
                        supplier
                        currency
                        amount
                        bankCharges
                        paymentDate
                        paymentMode
                        withdrawAccount
                        referenceNumber
                        notes
                        paidBills
                      }
                    `,
                  });
                  let paginationCopy = JSON.parse(JSON.stringify(pagination));
                  paginationCopy.edges[index].node = newSupplierPayment;
                  return paginationCopy;
                } else {
                  return pagination;
                }
              },
            },
          });
        },
      });
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleAccountChange = (id) => {
    let selectedAccount;
    accounts.forEach((group) => {
      const account = group.accounts.find((acc) => acc.id === id);
      if (account) {
        selectedAccount = account;
      }
    });
    setAccountCurrencyId(selectedAccount?.currency?.id || null);
  };

  const handleModalRowSelect = (record) => {
    setSelectedSupplier(record);
    form.setFieldsValue({ supplierName: record.name });
    const unpaidBills = record.unpaidBills.map((bill, index) => ({
      ...bill,
    }));
    const paidBills = record.paidBills.map((bill) => ({
      ...bill,
    }));
    const combinedBills = [...paidBills, ...unpaidBills];
    setData(combinedBills);
    console.log(unpaidBills);
  };

  const handlePaidAmountBlur = (value, record) => {
    if (value > record.remainingBalance) {
      form.setFieldValue(`paidAmount${record.key}`, record.remainingBalance);
    }
    calculateTotalPaidAmount();
  };

  const calculateTotalPaidAmount = () => {
    const values = form.getFieldsValue();
    let total = 0;
    data.forEach((item) => {
      const paidAmount = parseFloat(values[`paidAmount${item.key}`]) || 0;
      total += paidAmount;
    });
    setPaidAmountTotal(total);
  };

  const clearPaidAmounts = () => {
    const newFieldsValue = Object.keys(form.getFieldsValue())
      .filter((key) => key.startsWith("paidAmount"))
      .reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {});
    form.setFieldsValue(newFieldsValue);
    setPaidAmountTotal(0);
  };

  const columns = [
    {
      title: <FormattedMessage id="label.date" defaultMessage="Date" />,
      dataIndex: "date",
      key: "date",
      render: (_, record) => (
        <Flex vertical>
          <span>{dayjs(record.billDate).format(REPORT_DATE_FORMAT)}</span>
          <span style={{ fontSize: "var(--small-text)" }}>
            Due Date: {dayjs(record.billDueDate).format(REPORT_DATE_FORMAT)}
          </span>
        </Flex>
      ),
    },
    {
      title: "Bill#",
      dataIndex: "billNumber",
      key: "billNumber",
    },
    {
      title: (
        <FormattedMessage
          id="label.purchaseOrderNumber"
          defaultMessage="Purchase Order #"
        />
      ),
      dataIndex: "purchaseOrderNumber",
      key: "purchaseOrderNumber",
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branch",
      key: "branch",
      render: (_, record) => record.branch?.name,
    },
    {
      title: (
        <FormattedMessage id="label.billAmount" defaultMessage="Bill Amount" />
      ),
      dataIndex: "billTotalAmount",
      key: "billTotalAmount",
      render: (_, record) => (
        <Flex justify="end">
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={record.billTotalAmount}
            style="decimal"
            minimumFractionDigits={record.currency?.decimalPlaces}
          />
        </Flex>
      ),
    },
    {
      title: "Remaining Balance",
      dataIndex: "remainingBalance",
      key: "remainingBalance",
      align: "right",
      render: (_, record) => (
        <Flex justify="end">
          {record.currency?.symbol}{" "}
          <FormattedNumber
            value={record.remainingBalance}
            style="decimal"
            minimumFractionDigits={record.currency?.decimalPlaces}
          />
        </Flex>
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment",
      key: "payment",
      width: "15%",
      render: (_, record) => (
        <>
          <Form.Item
            noStyle
            name={`paidAmount${record.key}`}
            initialValue={
              record.paidAmount && record.paidBillId ? record.paidAmount : 0
            }
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
            <Input
              onBlur={(e) => handlePaidAmountBlur(e.target.value, record)}
              style={{ textAlign: "right" }}
            />
          </Form.Item>
          <Flex justify="end">
            <Button
              type="link"
              style={{
                paddingInline: 0,
                fontSize: "var(--small-text)",
                paddingBottom: 0,
              }}
              onClick={() => {
                form.setFieldValue(
                  `paidAmount${record.key}`,
                  record.remainingBalance
                );
                calculateTotalPaidAmount();
              }}
            >
              Pay in Full
            </Button>
          </Flex>
        </>
      ),
    },
  ];

  return (
    <>
      <SupplierSearchModal
        modalOpen={searchModalOpen}
        setModalOpen={setSearchModalOpen}
        onRowSelect={handleModalRowSelect}
      />

      <div className="page-header">
        <p className="page-header-text">
          <FormattedMessage
            id="paymentMade.edit"
            defaultMessage="Edit Payment"
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
        <div className="page-form-wrapper">
          <Form form={form} onFinish={onFinish} initialValues={initialValues}>
            <Row>
              <Col span={12}>
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
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="label.supplierName.required"
                          defaultMessage="Select the Supplier"
                        />
                      ),
                    },
                  ]}
                >
                  <Input
                    disabled
                    readOnly
                    // onClick={setSearchModalOpen}
                    className="search-input"
                    suffix={
                      <>
                        <Button
                          disabled
                          style={{ width: "2.5rem" }}
                          type="primary"
                          icon={<SearchOutlined />}
                          className="search-btn"
                          // onClick={setSearchModalOpen}
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
                      id="label.branch"
                      defaultMessage="Branch"
                    />
                  }
                  name="branch"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
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
                  <Select
                    disabled
                    showSearch
                    optionFilterProp="label"
                    // onChange={(value) => setSelectedBranch(value)}
                  >
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
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={
                    <FormattedMessage
                      id="label.currency"
                      defaultMessage="Currency"
                    />
                  }
                  name="currency"
                  labelAlign="left"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 12 }}
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
                  <Select
                    // onChange={(value) => setSelectedCurrency(value)}
                    showSearch
                    optionFilterProp="label"
                    disabled
                  >
                    {currencies.map((currency) => (
                      <Select.Option
                        key={currency.id}
                        value={currency.id}
                        label={currency?.name + currency.symbol}
                      >
                        {currency?.name} ({currency.symbol})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <div
              className={
                selectedSupplier && selectedBranch && selectedCurrency
                  ? ""
                  : "form-mask"
              }
            >
              <Row>
                <Col span={12}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.paymentDate"
                        defaultMessage="Payment Date"
                      />
                    }
                    name="paymentDate"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
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
                      onChange={(date, dateString) =>
                        console.log(date, dateString)
                      }
                    ></DatePicker>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                    labelAlign="left"
                    label={
                      <FormattedMessage
                        id="label.paidThrough"
                        defaultMessage="Paid Through"
                      />
                    }
                    name="paidThrough"
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
                      showSearch
                      optionFilterProp="label"
                      onChange={handleAccountChange}
                    >
                      {accounts.map((group) => (
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
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                    labelAlign="left"
                    label={
                      <FormattedMessage
                        id="label.paymentMode"
                        defaultMessage="Payment Mode"
                      />
                    }
                    name="paymentMode"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: (
                    //       <FormattedMessage
                    //         id="label.paymentMode.required"
                    //         defaultMessage="Select the Payment Mode"
                    //       />
                    //     ),
                    //   },
                    // ]}
                  >
                    <Select showSearch optionFilterProp="label">
                      {paymentModes?.map((mode) => (
                        <Select.Option
                          key={mode.id}
                          value={mode.id}
                          label={mode.name}
                        >
                          {mode.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.bankChargesIfAny"
                        defaultMessage="Bank Charges (if any)"
                      />
                    }
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                    labelAlign="left"
                    name="bankCharges"
                    rules={[
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
                    <Input
                      onBlur={(e) =>
                        setBankCharges(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="label.referenceNumber"
                        defaultMessage="Reference #"
                      />
                    }
                    name="referenceNumber"
                    labelAlign="left"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 12 }}
                  >
                    <Input maxLength={255}></Input>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {((accountCurrencyId &&
                    selectedCurrency !== accountCurrencyId) ||
                    selectedCurrency !== business.baseCurrency.id) && (
                    <Form.Item
                      label={
                        <FormattedMessage
                          id="label.exchangeRate"
                          defaultMessage="Exchange Rate"
                        />
                      }
                      name="exchangeRate"
                      labelAlign="left"
                      labelCol={{ span: 8 }}
                      wrapperCol={{ span: 12 }}
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
                  )}
                </Col>
              </Row>
              {/* <Flex justify="end">
              <Button type="link" style={{ fontSize: "var(--small-text)" }}>
                Clear Applied Amount
              </Button>
            </Flex> */}
              <>
                <Table
                  columns={columns}
                  dataSource={
                    selectedSupplier && selectedBranch && selectedCurrency
                      ? data
                      : []
                  }
                  pagination={false}
                  className="payment-table"
                  // summary={() => (
                  //   <Table.Summary.Row>
                  //     <Table.Summary.Cell
                  //       index={0}
                  //       colSpan={5}
                  //     ></Table.Summary.Cell>
                  //     <Table.Summary.Cell index={2}>
                  //       <Flex justify="end">
                  //         <FormattedMessage
                  //           id="label.total"
                  //           defaultMessage="Total"
                  //         />
                  //         :{" "}
                  //       </Flex>
                  //     </Table.Summary.Cell>
                  //     <Table.Summary.Cell index={1}>
                  //       <Flex justify="end">{paidAmountTotal}</Flex>
                  //     </Table.Summary.Cell>
                  //   </Table.Summary.Row>
                  // )}
                />
                <Flex justify="end">
                  <Button
                    type="link"
                    style={{ fontSize: "var(--small-text)" }}
                    onClick={clearPaidAmounts}
                  >
                    Clear Applied Amount
                  </Button>
                </Flex>
                <br />
              </>

              <Row className="new-manual-journal-table-footer">
                <Col span={8}>
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "normal",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <label>
                        <FormattedMessage
                          id="label.notes"
                          defaultMessage="Notes"
                        />
                      </label>
                      <Form.Item
                        style={{ margin: 0, width: "100%" }}
                        name="notes"
                      >
                        <TextArea rows={4}></TextArea>
                      </Form.Item>
                    </div>
                  </div>
                </Col>
                <Col
                  span={12}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <table
                    cellSpacing="0"
                    border="0"
                    id="balance-table"
                    style={{
                      background: "rgba(245, 157, 0, 0.10)",
                      width: "27.7rem",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td
                          style={{ verticalAlign: "middle", width: "20%" }}
                          className="text-align-right"
                        >
                          <FormattedMessage
                            id="label.subTotal"
                            defaultMessage="Sub Total"
                          />
                        </td>
                        <td
                          className="text-align-right"
                          style={{ width: "20%" }}
                        >
                          {paidAmountTotal}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="text-align-right"
                          style={{ paddingTop: "0.5rem" }}
                        >
                          <FormattedMessage
                            id="label.bankCharges"
                            defaultMessage="Bank Charges"
                          />
                        </td>

                        <td
                          className="text-align-right"
                          style={{ width: "20%", paddingTop: "0.5rem" }}
                        >
                          {bankCharges}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="text-align-right"
                          style={{ paddingTop: "0.5rem" }}
                        >
                          <FormattedMessage
                            id="label.total"
                            defaultMessage="Total"
                          />
                        </td>
                        <td
                          className="text-align-right"
                          style={{ paddingTop: "0.5rem" }}
                        >
                          {paidAmountTotal + bankCharges}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
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
                >
                  <FormattedMessage id="button.save" defaultMessage="Save" />
                </Button>
                <Button
                  className="page-actions-btn"
                  onClick={() =>
                    navigate(from, { state: location.state, replace: true })
                  }
                >
                  {
                    <FormattedMessage
                      id="button.cancel"
                      defaultMessage="Cancel"
                    />
                  }
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default PaymentsMadeEdit;
