import { useMutation, useQuery } from "@apollo/client";
import { Flex, Form, Input, Modal, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  openErrorNotification,
  openSuccessMessage,
} from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import { SupplierQueries, SupplierMutations } from "../../graphql";
import dayjs from "dayjs";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
const { GET_UNUSED_SUPPLIER_CREDITS, GET_UNUSED_SUPPLIER_CREDIT_ADVANCES } =
  SupplierQueries;
const { CREATE_SUPPLIER_APPLY_CREDIT } = SupplierMutations;

const ApplyCreditModal = ({ modalOpen, setModalOpen, selectedRecord }) => {
  const { notiApi, msgApi } = useOutletContext();
  const [form] = Form.useForm();
  const [totalAmountApplied, setTotalAmountApplied] = useState(0);
  const [finalBillBalance, setFinalBillBalance] = useState(0);

  //Queries
  const {
    data: creditData,
    loading: creditLoading,
    refetch: creditRefetch,
  } = useQuery(GET_UNUSED_SUPPLIER_CREDITS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      branchId: selectedRecord?.branch?.id,
      supplierId: selectedRecord?.supplier?.id,
    },
    onError(err) {
      openErrorNotification(notiApi, err.message);
    },
    skip: !modalOpen,
  });

  // Mutations
  const [applyCredit, { loading: applyLoading }] = useMutation(
    CREATE_SUPPLIER_APPLY_CREDIT,
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
      },
      onError(err) {
        openErrorNotification(notiApi, err.message);
      },
    }
  );

  const {
    data: advanceData,
    loading: advanceLoading,
    refetch: advanceRefetch,
  } = useQuery(GET_UNUSED_SUPPLIER_CREDIT_ADVANCES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      branchId: selectedRecord?.branch?.id,
      supplierId: selectedRecord?.supplier?.id,
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
      ...(creditData?.getUnusedSupplierCredits || []).map((credit) => ({
        ...credit,
        key: credit.id,
        type: "Credit",
        amount: credit.supplierCreditTotalAmount,
        availableBalance: credit.supplierCreditTotalAmount - credit.supplierCreditTotalUsedAmount,
        creditDetails: credit.supplierCreditNumber,
        creditDate: credit.supplierCreditDate,
      })),
      ...(advanceData?.getUnusedSupplierCreditAdvances || []).map(
        (advance) => ({
          ...advance,
          key: advance.id,
          type: "Advance",
          amount: advance.amount,
          availableBalance: advance.amount - advance.usedAmount,
          creditDetails: advance.supplier.name,
          creditDate: advance.date,
        })
      ),
    ];

    return combined;
  }, [creditData, advanceData]);

  const loading = creditLoading || advanceLoading;

  const handleAmountAppliedBlur = (e, record) => {
    const { value } = e.target;
    let amountApplied = parseFloat(value);

    if (isNaN(amountApplied) || amountApplied < 0) {
      form.setFieldsValue({ [`amountApplied${record.id}`]: 0 });
      return;
    }

    amountApplied = Math.min(amountApplied, record.availableBalance);

    form.setFieldsValue({ [`amountApplied${record.id}`]: amountApplied });

    const remainingBalance =
      selectedRecord.billTotalAmount - selectedRecord.billTotalPaidAmount;
    let finalBalance = remainingBalance - totalAmountApplied - amountApplied;

    if (finalBalance < 0) {
      form.setFieldsValue({ [`amountApplied${record.id}`]: 0 });
    }
    updateTotals();
  };

  const updateTotals = () => {
    let totalApplied = 0;

    parsedData.forEach((record) => {
      const amount = parseFloat(
        form.getFieldValue(`amountApplied${record.id}`)
      );
      if (!isNaN(amount)) {
        totalApplied += amount;
      }
    });

    setTotalAmountApplied(totalApplied);

    const remainingBalance =
      selectedRecord.billTotalAmount - selectedRecord.billTotalPaidAmount;
    let finalBalance = remainingBalance - totalApplied;
    if (finalBalance < 0) {
      finalBalance = 0;
    }
    setFinalBillBalance(finalBalance);
  };

  const handleSubmit = async (values) => {
    const applyCredits = parsedData.map((item) => ({
      amount: values[`amountApplied${item.id}`],
      referenceId: item.id,
      referenceType: item.type,
    }));
    console.log(applyCredits);
    const input = {
      billId: selectedRecord.id,
      applyCredits,
    };
    console.log("Input", input);
    await applyCredit({
      variables: { input },
    });
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
          <div style={{ fontSize: "var(--small-text)" }}>
            {dayjs(record.date).format(REPORT_DATE_FORMAT)}
          </div>
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
          {selectedRecord.currency.symbol}{" "}
          <FormattedNumber
            value={record.amount || 0}
            style="decimal"
            minimumFractionDigits={selectedRecord.currency.decimalPlaces}
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
          {selectedRecord.currency.symbol}{" "}
          <FormattedNumber
            value={
              record.availableBalance || 0
            }
            style="decimal"
            minimumFractionDigits={selectedRecord.currency.decimalPlaces}
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
      render: (_, record) => (
        <>
          <Form.Item noStyle name={`amountApplied${record.id}`}>
            <Input
              style={{ textAlign: "right" }}
              onBlur={(e) => handleAmountAppliedBlur(e, record)}
            />
          </Form.Item>
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
          defaultMessage="Apply credits for"
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
          Remaining Bill Balance:{" "}
          <b>
            {selectedRecord?.currency?.symbol}{" "}
            <FormattedNumber
              value={
                selectedRecord?.billTotalAmount -
                selectedRecord?.billTotalPaidAmount
              }
              style="decimal"
              minimumFractionDigits={selectedRecord?.currency?.decimalPlaces}
            />
          </b>
        </span>
      </Flex>
      <Form form={form} onFinish={handleSubmit}>
        <Table
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
                  Final Bill Balance:
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
                      value={finalBillBalance}
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

export default ApplyCreditModal;
