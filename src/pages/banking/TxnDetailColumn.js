/* eslint-disable react/style-prop-object */
import React from "react";
import { Tabs, Button, Flex, Space, Dropdown, Table, Modal } from "antd";
import {
  CloseOutlined,
  EditOutlined,
  CaretDownOutlined,
  DeleteOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { FormattedMessage, FormattedNumber } from "react-intl";
import dayjs from "dayjs";
import { AttachFiles } from "../../components";

const TxnDetailColumn = ({
  business,
  selectedAccount,
  transactionRecord,
  setTransactionRecord,
  setTransactionRowIndex,
  setEditModalOpen,
  onDelete,
}) => {
  const allowedTransactionTypes = [
    "TransferToAnotherAccount",
    "TransferFromAnotherAccounts",
    "OwnerDrawings",
    "OwnerContribution",
    "SupplierAdvance",
    "CustomerAdvance",
    "OtherIncome",
    "InterestIncome",
  ];

  const isAllowedTransactionType = allowedTransactionTypes.includes(
    transactionRecord?.transactionType
  );

  console.log(transactionRecord);
  return (
    <>
      <div className={`txn-detail-column ${transactionRecord ? "open" : ""}`}>
        <Tabs
          style={{ paddingInline: "1.5rem" }}
          tabBarExtraContent={
            <Button
              icon={<CloseOutlined />}
              type="text"
              onClick={() => {
                setTransactionRecord(null);
                setTransactionRowIndex(0);
              }}
            />
          }
        >
          <Tabs.TabPane tab="Transaction Details" key="txnDetails">
            <Flex
              align="center"
              style={{
                height: "4.063rem",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={setEditModalOpen}
                  disabled={!isAllowedTransactionType}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(transactionRecord.id)}
                  disabled={!isAllowedTransactionType}
                />
                <AttachFiles
                  iconButton={true}
                  files={transactionRecord?.documents}
                  key={transactionRecord?.key}
                />
                {/* <Button>
                <Dropdown
                  trigger="click"
                  key={transactionRecord?.key}
                  menu={{
                    onClick: ({ key }) => {
                      // if (key === "1") handleDelete(selectedRecord.id);
                      // else if (key === "1") handleDelete(selectedRecord.id);
                    },
                    items: [
                      {
                        label: (
                          <FormattedMessage
                            id="button.delete"
                            defaultMessage="Delete"
                          />
                        ),
                        key: "1",
                      },
                    ],
                  }}
                >
                  <div style={{ height: "2rem" }}>
                    More <CaretDownOutlined />
                  </div>
                </Dropdown>
              </Button> */}
              </Space>
            </Flex>
            <div className="txn-details-content">
              <Flex
                style={{
                  height: "auto",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBlock: "1.5rem",
                }}
                vertical
                gap="1.5rem"
              >
                <Flex vertical>
                  <span
                    className="page-header-text"
                    style={{
                      color: transactionRecord?.toAccount?.id === selectedAccount?.id 
                        ? "var(--light-green)"
                        : "var(--red)",
                    }}
                  >
                    {selectedAccount?.currency?.symbol}{" "}
                    {transactionRecord?.toAccount?.id === selectedAccount?.id ?
                      <FormattedNumber
                        value={
                          transactionRecord?.toAccount?.currency?.id !== transactionRecord?.currency?.id 
                            ? transactionRecord?.toAccount?.currency?.id === business.baseCurrency.id
                              ? (transactionRecord?.exchangeRate !== 0 ? transactionRecord?.amount * transactionRecord?.exchangeRate : 0)
                              : (transactionRecord?.exchangeRate !== 0 ? transactionRecord?.amount / transactionRecord?.exchangeRate : 0)
                            : transactionRecord?.amount
                        }
                        style="decimal"
                        minimumFractionDigits={transactionRecord?.currency?.decimalPlaces ?? 2}
                      />
                      :
                      <FormattedNumber
                        value={
                          transactionRecord?.fromAccount?.currency?.id !== transactionRecord?.currency?.id 
                            ? transactionRecord?.fromAccount?.currency?.id === business.baseCurrency.id 
                              ? (transactionRecord?.exchangeRate !== 0 ? (transactionRecord?.amount + transactionRecord?.bankCharges) * transactionRecord?.exchangeRate : 0)
                              : (transactionRecord?.exchangeRate !== 0 ? (transactionRecord?.amount + transactionRecord?.bankCharges) / transactionRecord?.exchangeRate : 0)
                            : transactionRecord?.amount + transactionRecord?.bankCharges
                        }
                        style="decimal"
                        minimumFractionDigits={transactionRecord?.currency?.decimalPlaces ?? 2}
                      />
                    }
                  </span>
                  <span>
                    {dayjs(transactionRecord?.transactionDate).format(
                      REPORT_DATE_FORMAT
                    )}
                  </span>
                </Flex>
                <span className="badge-pill">
                  {transactionRecord?.transactionType
                    .split(/(?=[A-Z])/)
                    .join(" ")}
                </span>
              </Flex>
              <div className="txn-details-body">
                <div>
                  <div style={{ opacity: "70%" }}>
                    <FormattedMessage
                      id="label.accountName"
                      defaultMessage="Account Name"
                    />
                  </div>
                  <p style={{ margin: 0, marginBottom: "1rem" }}>
                    {selectedAccount?.name}
                  </p>
                </div>
                {transactionRecord?.creditNoteNumber && (
                  <div>
                    <div style={{ opacity: "70%" }}>Credit Note#</div>
                    <p style={{ margin: 0, marginBottom: "1rem" }}>
                      {transactionRecord?.creditNoteNumber}
                    </p>
                  </div>
                )}
                {transactionRecord?.supplier?.name && (
                  <div>
                    <div style={{ opacity: "70%" }}>Supplier</div>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: "1rem",
                        color: "var(--primary-color)",
                      }}
                    >
                      {transactionRecord?.supplier?.name}
                    </p>
                  </div>
                )}
                {transactionRecord?.customer?.name && (
                  <div>
                    <div style={{ opacity: "70%" }}>Customer</div>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: "1rem",
                        color: "var(--primary-color)",
                      }}
                    >
                      {transactionRecord?.customer?.name}
                    </p>
                  </div>
                )}
                {transactionRecord?.referenceNumber && (
                  <div>
                    <div style={{ opacity: "70%" }}>Reference Number</div>
                    <p style={{ margin: 0, marginBottom: "1rem" }}>
                      {transactionRecord?.referenceNumber}
                    </p>
                  </div>
                )}
                {transactionRecord?.description && (
                  <div>
                    <div style={{ opacity: "70%" }}>Description</div>
                    <p style={{ margin: 0, marginBottom: "1rem" }}>
                      {transactionRecord?.description}
                    </p>
                  </div>
                )}
                {transactionRecord?.paymentMode?.name && (
                  <div>
                    <div style={{ opacity: "70%" }}>
                      {transactionRecord?.isMoneyIn
                        ? "Received Via"
                        : "Paid Via"}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: "1rem",
                      }}
                    >
                      {transactionRecord?.paymentMode?.name}
                    </p>
                  </div>
                )}
                {transactionRecord?.bankCharges > 0 && (
                  <div>
                    <div style={{ opacity: "70%" }}>Bank Charges (if any)</div>
                    <p style={{ margin: 0, marginBottom: "1rem" }}>
                      {transactionRecord?.currency?.symbol}{" "}
                      <FormattedNumber
                        value={transactionRecord?.bankCharges || 0}
                        style="decimal"
                        minimumFractionDigits={
                          transactionRecord?.currency?.decimalPlaces
                        }
                      />
                    </p>
                  </div>
                )}

                {/* <Table
                className="txn-details-table"
                columns={[
                  {
                    title: "Bill Detail",
                    dataIndex: "billDetail",
                    key: "billDetail",
                  },
                  { title: "Payment", dataIndex: "payment", key: "payment" },
                ]}
                dataSource={[{ key: 1, payment: "00" }]}
                pagination={false}
              /> */}
              </div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Comment & History" key="cmt&his"></Tabs.TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default TxnDetailColumn;
