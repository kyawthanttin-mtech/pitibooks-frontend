/* eslint-disable react/style-prop-object */
import React, { useEffect, useMemo, useState } from "react";
import {
  Tabs,
  Button,
  Flex,
  Space,
  Dropdown,
  Table,
  Modal,
  Divider,
  Skeleton,
  Timeline,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  CaretDownOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  LoadingOutlined,
  MessageOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { REPORT_DATE_FORMAT } from "../../config/Constants";
import { FormattedMessage, FormattedNumber } from "react-intl";
import dayjs from "dayjs";
import { AttachFiles } from "../../components";
import {
  CommentMutations,
  CommentQueries,
  HistoryQueries,
} from "../../graphql";
import { openErrorNotification } from "../../utils/Notification";
import { useOutletContext } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation, useQuery } from "@apollo/client";
import ReactQuill from "react-quill";
const { CREATE_COMMENT, DELETE_COMMENT } = CommentMutations;
const { GET_COMMENTS } = CommentQueries;
const { GET_HISTORIES } = HistoryQueries;

const allowedTransactionTypes = [
  "TransferToAnotherAccount",
  "TransferFromAnotherAccount",
  "DepositToAnotherAccount",
  "DepositFromAnotherAccount",
  "OwnerDrawings",
  "OwnerContribution",
  "SupplierAdvance",
  "CustomerAdvance",
  "OtherIncome",
  "InterestIncome",
  "CustomerAdvanceRefund",
  "SupplierAdvanceRefund",
];

const TxnDetailColumn = ({
  business,
  selectedAccount,
  transactionRecord,
  setTransactionRecord,
  setTransactionRowIndex,
  setEditModalOpen,
  onDelete,
}) => {
  const [deleteModal, contextHolder] = Modal.useModal();
  const [value, setValue] = useState("");
  const { notiApi } = useOutletContext();
  const [activeTab, setActiveTab] = useState("txnDetails");

  const isAllowedTransactionType = allowedTransactionTypes.includes(
    transactionRecord?.transactionType
  );

  // Queries
  const {
    data: cmtData,
    loading: cmtLoading,
    refetch: cmtRefetch,
  } = useQuery(GET_COMMENTS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      referenceId: transactionRecord?.id,
      referenceType: "banking_transactions",
    },
    onError: (err) => openErrorNotification(notiApi, err.message),
    skip: !transactionRecord && activeTab !== "cmt&his",
  });

  const {
    data: hisData,
    loading: hisLoading,
    refetch: hisRefetch,
  } = useQuery(GET_HISTORIES, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: {
      referenceId: transactionRecord?.id,
      referenceType: "banking_transactions",
    },
    onError: (err) => openErrorNotification(notiApi, err.message),
    skip: !transactionRecord && activeTab !== "cmt&his",
  });

  useEffect(() => {
    if (transactionRecord && activeTab === "cmt&his") {
      cmtRefetch();
      hisRefetch();
    }
  }, [activeTab, cmtRefetch, hisRefetch, transactionRecord]);

  // Mutations
  const [createComment, { loading: createLoading }] = useMutation(
    CREATE_COMMENT,
    {
      refetchQueries: [GET_COMMENTS],
    }
  );

  const [deleteComment, { loading: deleteLoading }] = useMutation(
    DELETE_COMMENT,
    {
      refetchQueries: [GET_COMMENTS],
    }
  );

  const comments = useMemo(() => cmtData?.listComment || [], [cmtData]);
  const histories = useMemo(() => hisData?.listHistory || [], [hisData]);

  const mergedData = useMemo(() => {
    const combined = [...comments, ...histories].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return combined.map((item) => ({
      ...item,
      type: item.__typename === "Comment" ? "comment" : "history",
    }));
  }, [comments, histories]);

  const modules = {
    toolbar: [["bold", "italic", "underline"]],
  };

  const handleSubmit = () => {
    try {
      createComment({
        variables: {
          input: {
            description: value,
            referenceId: transactionRecord?.id,
            referenceType: "banking_transactions",
          },
        },
      });
      setValue("");
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await deleteModal.confirm({
      content: (
        <FormattedMessage
          id="confirm.delete"
          defaultMessage="Are you sure to delete?"
        />
      ),
    });
    if (confirmed) {
      try {
        await deleteComment({ variables: { id } });
      } catch (err) {
        openErrorNotification(notiApi, err.message);
      }
    }
    try {
    } catch (err) {
      openErrorNotification(notiApi, err.message);
    }
  };

  const stripHtml = (html) => {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const isInputEmpty = (input) => stripHtml(input).trim().length === 0;

  return (
    <>
      {contextHolder}
      <div className={`txn-detail-column ${transactionRecord ? "open" : ""}`}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
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
                      color:
                        transactionRecord?.toAccount?.id === selectedAccount?.id
                          ? "var(--light-green)"
                          : "var(--red)",
                    }}
                  >
                    {selectedAccount?.currency?.symbol}{" "}
                    {transactionRecord?.toAccount?.id ===
                    selectedAccount?.id ? (
                      <FormattedNumber
                        value={
                          transactionRecord?.toAccount?.currency?.id !==
                          transactionRecord?.currency?.id
                            ? transactionRecord?.toAccount?.currency?.id ===
                                0 ||
                              transactionRecord?.toAccount?.currency?.id ===
                                business.baseCurrency.id
                              ? transactionRecord?.exchangeRate !== 0
                                ? transactionRecord?.amount *
                                  transactionRecord?.exchangeRate
                                : 0
                              : transactionRecord?.exchangeRate !== 0
                              ? transactionRecord?.amount /
                                transactionRecord?.exchangeRate
                              : 0
                            : transactionRecord?.amount
                        }
                        style="decimal"
                        minimumFractionDigits={
                          transactionRecord?.currency?.decimalPlaces ?? 2
                        }
                      />
                    ) : (
                      <FormattedNumber
                        value={
                          transactionRecord?.fromAccount?.currency?.id !==
                          transactionRecord?.currency?.id
                            ? transactionRecord?.fromAccount?.currency?.id ===
                                0 ||
                              transactionRecord?.fromAccount?.currency?.id ===
                                business.baseCurrency.id
                              ? transactionRecord?.exchangeRate !== 0
                                ? (transactionRecord?.amount +
                                    transactionRecord?.bankCharges) *
                                  transactionRecord?.exchangeRate
                                : 0
                              : transactionRecord?.exchangeRate !== 0
                              ? (transactionRecord?.amount +
                                  transactionRecord?.bankCharges) /
                                transactionRecord?.exchangeRate
                              : 0
                            : transactionRecord?.amount +
                              transactionRecord?.bankCharges
                        }
                        style="decimal"
                        minimumFractionDigits={
                          transactionRecord?.currency?.decimalPlaces ?? 2
                        }
                      />
                    )}
                  </span>
                  <span>
                    {dayjs(transactionRecord?.transactionDate).format(
                      REPORT_DATE_FORMAT
                    )}
                  </span>
                </Flex>
                <span className="badge-pill">
                  {transactionRecord?.transactionType ===
                    "TransferToAnotherAccount" ||
                  transactionRecord?.transactionType ===
                    "TransferFromAnotherAccount"
                    ? "TransferFund"
                    : transactionRecord?.transactionType ===
                        "DepositToAnotherAccount" ||
                      transactionRecord?.transactionType ===
                        "DepositFromAnotherAccount"
                    ? "AccountDeposit"
                    : transactionRecord?.transactionType
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
          <Tabs.TabPane tab="Comments & History" key="cmt&his">
            {isAllowedTransactionType && (
              <div style={{ paddingTop: "1rem" }}>
                <ReactQuill
                  value={value}
                  onChange={setValue}
                  modules={modules}
                  theme="snow"
                  placeholder="Write your comment here..."
                />
                <div style={{ marginTop: "0.5rem" }}>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={isInputEmpty(value)}
                    loading={createLoading}
                  >
                    <FormattedMessage
                      id="button.addComment"
                      defaultMessage="Add Comment"
                    />
                  </Button>
                </div>
              </div>
            )}
            {cmtLoading || hisLoading ? (
              <Skeleton active />
            ) : mergedData.length > 0 ? (
              <div style={{ marginLeft: "0.5rem", marginTop: "1.5rem" }}>
                <Timeline>
                  {mergedData.map((item) => (
                    <Timeline.Item
                      key={item.id}
                      dot={
                        <div className="circle-box">
                          <span>
                            {item.type === "comment" ? (
                              <MessageOutlined />
                            ) : (
                              <HistoryOutlined
                                style={{ color: "var(--yellow)" }}
                              />
                            )}
                          </span>
                        </div>
                      }
                    >
                      <Flex
                        gap="0.25rem"
                        align="center"
                        className="cmt-username"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(item.userName),
                          }}
                        ></div>
                        <span style={{ opacity: "70%" }}>
                          <b>•</b>
                        </span>
                        <span
                          style={{
                            fontSize: "0.688rem",
                            opacity: "70%",
                            letterSpacing: ".2px",
                            fontWeight: 500,
                          }}
                        >
                          {dayjs(item.createdAt).format(
                            REPORT_DATE_FORMAT + " h:mm A"
                          )}
                        </span>
                      </Flex>
                      <Flex
                        justify="space-between"
                        className="cmt-box"
                        gap="1rem"
                      >
                        <div
                          className="cmt-description"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(item.description),
                          }}
                        ></div>
                        {item.type === "comment" && (
                          <span onClick={() => handleDelete(item.id)}>
                            {deleteLoading ? (
                              <LoadingOutlined />
                            ) : (
                              <DeleteOutlined />
                            )}
                          </span>
                        )}
                      </Flex>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            ) : (
              <Flex justify="center" align="center" style={{ padding: "1rem" }}>
                No comment or history yet!
              </Flex>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default TxnDetailColumn;
