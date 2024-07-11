/* eslint-disable react/style-prop-object */
import { useMutation, useQuery } from "@apollo/client";
import { Divider, Flex, Form, Input, Modal, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import {
  CustomerQueries,
  CustomerMutations,
  InvoiceQueries,
} from "../../graphql";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
const { GET_UNUSED_CUSTOMER_CREDITS, GET_UNUSED_CUSTOMER_CREDIT_ADVANCES } =
  CustomerQueries;
const { CREATE_CUSTOMER_APPLY_CREDIT } = CustomerMutations;
const { GET_PAGINATE_INVOICE } = InvoiceQueries;

const InvoiceApplyCreditModal = ({
  modalOpen,
  setModalOpen,
  selectedRecord,
  setSelectedRecord,
  refetch,
}) => {
  const { notiApi, msgApi, business } = useOutletContext();
  const [form] = Form.useForm();
  const [totalAmountApplied, setTotalAmountApplied] = useState(0);
  const [finalInvoiceBalance, setFinalInvoiceBalance] = useState(0);
  const intl = useIntl();

  const {
    data: creditData,
    loading: creditLoading,
    refetch: creditRefetch,
  } = useQuery(GET_UNUSED_CUSTOMER_CREDITS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      branchId: selectedRecord?.branch?.id,
      customerId: selectedRecord?.customer?.id,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    skip: !modalOpen,
  });

  const [applyCredit, { loading: applyLoading }] = useMutation(
    CREATE_CUSTOMER_APPLY_CREDIT,
    {
      onCompleted() {
        openSuccessMessage(
          msgApi,
          <FormattedMessage
            id="credits.applied"
            defaultMessage="Credits Applied"
          />
        );
        setModalOpen(false);
        form.resetFields();
        refetch();
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
      update: (cache, { data: { createCustomerApplyCredit } }) => {
        const existingData = cache.readQuery({
          query: GET_PAGINATE_INVOICE,
        });
      
        if (existingData) {
          const newEdges = existingData.paginateInvoice.edges.map((edge) => {
            if (edge.node.id === selectedRecord.id) {
              return {
                ...edge,
                node: {
                  ...edge.node,
                  appliedCustomerCredits: [
                    ...(Array.isArray(edge.node.appliedCustomerCredits) ? edge.node.appliedCustomerCredits : []),
                    ...createCustomerApplyCredit,
                  ],
                },
              };
            }
            return edge;
          });
      
          cache.writeQuery({
            query: GET_PAGINATE_INVOICE,
            data: {
              paginateBill: {
                ...existingData.paginateInvoice,
                edges: newEdges,
              },
            },
          });
      
          // Update selectedRecord state if necessary
          if (selectedRecord && Array.isArray(selectedRecord.appliedCustomerCredits)) {
            const updatedSelectedRecord = {
              ...selectedRecord,
              appliedCustomerCredits: [
                ...selectedRecord.appliedCustomerCredits,
                ...createCustomerApplyCredit,
              ],
            };
      
            setSelectedRecord(updatedSelectedRecord);
          } else {
            const updatedSelectedRecord = {
              ...selectedRecord,
              appliedCustomerCredits: createCustomerApplyCredit,
            };
      
            setSelectedRecord(updatedSelectedRecord);
          }
        }
      }    
    }
  );

  const {
    data: advanceData,
    loading: advanceLoading,
    refetch: advanceRefetch,
  } = useQuery(GET_UNUSED_CUSTOMER_CREDIT_ADVANCES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      branchId: selectedRecord?.branch?.id,
      customerId: selectedRecord?.customer?.id,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    skip: !modalOpen,
  });

  useEffect(() => {
    if (modalOpen) {
      creditRefetch();
      advanceRefetch();
    }
  }, [modalOpen, creditRefetch, advanceRefetch]);

  const parsedData = useMemo(() => {
    if (!creditData && !advanceData) return [];

    const combined = [
      ...(creditData?.getUnusedCustomerCredits || []).map((credit) => ({
        ...credit,
        key: "C" + credit.id,
        id: "C" + credit.id,
        type: "Credit",
        amount: credit.customerCreditTotalAmount,
        availableBalance: credit.remainingBalance,
        creditDetails: credit.customerCreditNumber,
        creditDate: credit.customerCreditDate,
      })),
      ...(advanceData?.getUnusedCustomerCreditAdvances || []).map(
        (advance) => ({
          ...advance,
          key: "A" + advance.id,
          id: "A" + advance.id,
          type: "Advance",
          amount: advance.amount,
          availableBalance: advance.remainingBalance,
          creditDetails: advance.customer?.name,
          creditDate: advance.date,
        })
      ),
    ];

    const filteredData = combined.filter((item) => {
      if (item.type === "Advance") {
        if (selectedRecord.currency.id === business.baseCurrency.id) {
          return true;
        } else {
          return (
            item.currency.id === business.baseCurrency.id ||
            item.currency.id === selectedRecord.currency.id
          );
        }
      } else if (item.type === "Credit") {
        return item.currency.id === selectedRecord.currency.id;
      }
      return true;
    });

    return filteredData;
  }, [creditData, advanceData, selectedRecord, business.baseCurrency]);
  console.log("parsed data", parsedData);

  const loading = creditLoading || advanceLoading;

  const handleAmountAppliedBlur = (e, record) => {
    const { value } = e.target;
    let amountApplied = parseFloat(value);
    let exchangeRate =
      parseFloat(form.getFieldValue(`exchangeRate${record.id}`)) || 1;

    if (isNaN(amountApplied) || amountApplied < 0) {
      form.setFieldsValue({ [`amountApplied${record.id}`]: 0 });
      updateTotals();
      return;
    }

    let convertedAmount = amountApplied;

    if (record?.currency?.id !== selectedRecord?.currency?.id) {
      if (exchangeRate > 0) {
        convertedAmount = calculateExchangeRate(amountApplied, exchangeRate);
      } else {
        form.setFieldsValue({ [`amountApplied${record.id}`]: 0 });
        return;
      }
    }

    if (convertedAmount > record.availableBalance) {
      form.setFieldsValue({ [`amountApplied${record.id}`]: 0 });
      updateTotals();
      return;
    }

    form.setFieldsValue({ [`amountApplied${record.id}`]: amountApplied });

    const remainingBalance = selectedRecord.remainingBalance;
    let finalBalance = remainingBalance - totalAmountApplied - convertedAmount;

    if (finalBalance < 0) {
      form.setFieldsValue({ [`amountApplied${record.id}`]: 0 });
    }
    updateTotals();
  };

  const handleExchangeRateBlur = (e, record) => {
    handleAmountAppliedBlur(
      { target: { value: form.getFieldValue(`amountApplied${record.id}`) } },
      record
    );
  };

  const calculateExchangeRate = (amount, exchangeRate) => {
    if (selectedRecord?.currency?.id === business?.baseCurrency?.id) {
      return amount * exchangeRate || 0;
    } else {
      return amount / exchangeRate || 0;
    }
  };

  const updateTotals = () => {
    let totalApplied = 0;

    parsedData.forEach((record) => {
      const amount = parseFloat(
        form.getFieldValue(`amountApplied${record.id}`)
      );
      let exchangeRate =
        parseFloat(form.getFieldValue(`exchangeRate${record.id}`)) || 1;
      let convertedAmount = amount;

      if (!isNaN(amount)) {
        if (record?.currency?.id !== selectedRecord?.currency?.id) {
          convertedAmount = calculateExchangeRate(amount, exchangeRate);
        }
        totalApplied += convertedAmount;
      }
    });

    setTotalAmountApplied(totalApplied);

    const remainingBalance = selectedRecord.remainingBalance;
    let finalBalance = remainingBalance - totalApplied;
    if (finalBalance < 0) {
      finalBalance = 0;
    }
    setFinalInvoiceBalance(finalBalance);
  };

  const handleSubmit = async (values) => {
    if (totalAmountApplied <= 0) {
      openErrorNotification(notiApi, 
        intl.formatMessage({
          id: "validation.enterAtLeastOneCredit",
          defaultMessage: "Enter At Least One Credit",
        })
      );
      return;
    }
    const applyCredits = parsedData.map((item) => ({
      amount: values[`amountApplied${item.id}`],
      referenceId: parseInt(item.id.replace(/[CA]/, ""), 10),
      referenceType: item.type,
      currencyId: item.currency.id,
      exchangeRate: values[`exchangeRate${item.id}`],
    }));
    const input = {
      invoiceId: selectedRecord.id,
      applyCredits,
    };
    await applyCredit({ variables: { input } });
  };

  const columns = [
    {
      title: (
        <FormattedMessage
          id="label.creditDetails"
          defaultMessage="Credit Details"
        />
      ),
      dataIndex: "creditDetails",
      key: "creditDetails",
      render: (_, record) => (
        <>
          <div>{record.creditDetails}</div>
          <span style={{ fontSize: "var(--small-text)" }}>
            {dayjs(record.date).format(REPORT_DATE_FORMAT)}
          </span>
        </>
      ),
    },
    {
      title: <FormattedMessage id="label.branch" defaultMessage="Branch" />,
      dataIndex: "branchName",
      key: "branchName",
      render: (_, record) => record.branch?.name,
    },
    {
      title: <FormattedMessage id="label.amount" defaultMessage="Amount" />,
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (_, record) => (
        <>
          {record?.currency?.symbol}{" "}
          <FormattedNumber
            value={record.amount || 0}
            style="decimal"
            minimumFractionDigits={record?.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="label.availableBalance"
          defaultMessage="Available Balance"
        />
      ),
      dataIndex: "availableBalance",
      key: "availableBalance",
      align: "right",
      render: (_, record) => (
        <>
          {record?.currency?.symbol}{" "}
          <FormattedNumber
            value={record.availableBalance || 0}
            style="decimal"
            minimumFractionDigits={record?.currency?.decimalPlaces}
          />
        </>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="label.amountApplied"
          defaultMessage="Amount Applied"
        />
      ),
      dataIndex: "amountApplied",
      key: "amountApplied",
      align: "right",
      width: "20%",
      render: (_, record) => (
        <>
          <Form.Item
            noStyle
            name={`amountApplied${record.id}`}
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
            <Input
              // addonBefore={record?.currency?.symbol}
              style={{ textAlign: "right" }}
              onBlur={(e) => handleAmountAppliedBlur(e, record)}
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: (
        <>
          <FormattedMessage
            id="label.exchangeRate"
            defaultMessage="Exchange Rate"
          />
        </>
      ),
      dataIndex: "exchangeRate",
      key: "exchangeRate",
      align: "right",
      width: "20%",
      render: (_, record) => (
        <>
          {record?.currency?.id !== selectedRecord?.currency?.id ? (
            <>
              <Form.Item
                noStyle
                name={`exchangeRate${record.id}`}
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
                <Input
                  // addonBefore={business.baseCurrency.symbol}
                  style={{ textAlign: "right" }}
                  onBlur={(e) => handleExchangeRateBlur(e, record)}
                />
              </Form.Item>
              <div style={{ fontSize: "var(--small-text)", opacity: "70%" }}>
                <b>
                  {selectedRecord?.currency?.symbol}{" "}
                  <FormattedNumber
                    value={calculateExchangeRate(
                      form.getFieldValue(`amountApplied${record.id}`),
                      form.getFieldValue(`exchangeRate${record.id}`) || 1
                    )}
                    style="decimal"
                    minimumFractionDigits={
                      selectedRecord?.currency?.decimalPlaces
                    }
                  />
                </b>
              </div>
            </>
          ) : (
            <Flex justify="center"> - </Flex>
          )}
        </>
      ),
    },
  ];

  return (
    <Modal
      confirmLoading={applyLoading}
      width="65rem"
      title={
        <FormattedMessage
          id="label.applyCredits"
          defaultMessage="Apply Credits"
        />
      }
      okText={<FormattedMessage id="button.save" defaultMessage="Save" />}
      cancelText={
        <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
      }
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      onOk={form.submit}
    >
      <Flex justify="end" style={{ marginBottom: "2rem" }}>
        <span>
          Remaining Invoice Balance:{" "}
          <b>
            {selectedRecord?.currency?.symbol}{" "}
            <FormattedNumber
              value={
                selectedRecord?.remainingBalance
              }
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
          </b>
        </span>
      </Flex>
      <Form form={form} onFinish={handleSubmit}>
        <Table
          className="credit-table"
          pagination={false}
          dataSource={parsedData}
          loading={loading}
          columns={columns}
        />
      </Form>
      <Flex justify="end">
        <div style={{ width: "50%" }}>
          <table cellSpacing="0" border="0" width="100%" id="balance-table">
            <tbody>
              <tr className="text-align-right">
                <td
                  style={{
                    padding: "20px 10px 5px 0",
                    verticalAlign: "middle",
                  }}
                >
                  <b>Total Amount Applied:</b>
                </td>
                <td
                  style={{
                    width: "160px",
                    verticalAlign: "middle",
                    padding: "20px 10px 10px 5px",
                  }}
                >
                  <span>
                    {selectedRecord?.currency?.symbol}{" "}
                    <FormattedNumber
                      value={totalAmountApplied}
                      style="decimal"
                      minimumFractionDigits={
                        selectedRecord?.currency?.decimalPlaces
                      }
                    />
                  </span>
                </td>
              </tr>
              <tr className="text-align-right">
                <td
                  style={{
                    padding: "5px 10px 5px 0",
                    verticalAlign: "middle",
                    background: "var(--main-bg-color)",
                  }}
                >
                  Final Invoice Balance:
                </td>
                <td
                  style={{
                    width: "120px",
                    verticalAlign: "middle",
                    padding: "10px 10px 10px 5px",
                    background: "var(--main-bg-color)",
                  }}
                >
                  <span>
                    {selectedRecord?.currency?.symbol}{" "}
                    <FormattedNumber
                      value={finalInvoiceBalance}
                      style="decimal"
                      minimumFractionDigits={
                        selectedRecord?.currency?.decimalPlaces
                      }
                    />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Flex>
    </Modal>
  );
};

export default InvoiceApplyCreditModal;
